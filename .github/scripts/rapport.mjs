// Rapport quotidien LUNTRAE
// ---------------------------------------------------------------------------
// Lit les statistiques de la VEILLE via l'API GoatCounter (mesure sans cookie,
// données hébergées en UE), puis envoie un e-mail de synthèse via Brevo.
//
// Aucun secret en clair : tout vient des variables d'environnement fournies par
// les secrets GitHub (cf. .github/workflows/rapport-luntrae.yml).
// Node 20+ requis (utilise « fetch » natif).
// ---------------------------------------------------------------------------

// --- Configuration (depuis les secrets GitHub) -----------------------------
const SITE  = process.env.GOATCOUNTER_SITE;   // ex. « luntrae »
const TOKEN = process.env.GOATCOUNTER_TOKEN;
const BREVO = process.env.BREVO_API_KEY;
const TO    = process.env.REPORT_TO;
const FROM  = process.env.REPORT_FROM;

// Vérifie que tous les secrets sont présents (sans jamais les afficher).
for (const [nom, val] of Object.entries({
  GOATCOUNTER_SITE: SITE, GOATCOUNTER_TOKEN: TOKEN,
  BREVO_API_KEY: BREVO, REPORT_TO: TO, REPORT_FROM: FROM,
})) {
  if (!val) { console.error(`Secret manquant : ${nom}`); process.exit(1); }
}

const base    = `https://${SITE}.goatcounter.com/api/v0`;
const headers = { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' };

// --- Fenêtre = journée d'hier (UTC), bornée à l'heure pleine ---------------
const maintenant = new Date();
const finJour    = new Date(Date.UTC(maintenant.getUTCFullYear(), maintenant.getUTCMonth(), maintenant.getUTCDate())); // aujourd'hui 00:00 UTC
const debutJour  = new Date(finJour.getTime() - 86400000);          // hier 00:00 UTC
const iso        = (d) => d.toISOString().slice(0, 19) + 'Z';       // « 2026-06-08T00:00:00Z »
const hier       = debutJour.toISOString().slice(0, 10);           // « 2026-06-08 »
const fenetre    = `start=${iso(debutJour)}&end=${iso(finJour)}`;

// --- Petit utilitaire d'appel API (tolérant aux erreurs) -------------------
async function get(chemin) {
  const sep = chemin.includes('?') ? '&' : '?';
  try {
    const r = await fetch(`${base}${chemin}${sep}${fenetre}`, { headers });
    if (!r.ok) { console.error(`API ${chemin} → HTTP ${r.status}`); return null; }
    return await r.json();
  } catch (e) {
    console.error(`API ${chemin} → ${e.message}`);
    return null;
  }
}

const n = (v) => (typeof v === 'number' ? v : 0);
const escapeHtml = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// --- Récupération des stats de la veille -----------------------------------
const total = await get('/stats/total');              // { total, total_events, total_utc, ... }
const hits  = await get('/stats/hits?limit=20');       // { hits: [ { path, count, title, ... } ], ... }
const pays  = await get('/stats/locations?limit=10');  // { stats: [ { id, name, count } ], ... }

// --- Mise en forme ----------------------------------------------------------
const totalVues = total ? n(total.total ?? total.total_utc) : null;

const listeHits   = (hits && Array.isArray(hits.hits)) ? hits.hits : [];
const estEvtCV    = (p) => p === 'cv-consultation' || p === 'cv-telechargement';
const valeurHit   = (chemin) => n((listeHits.find((h) => h.path === chemin) || {}).count);
const cvConsult   = valeurHit('cv-consultation');
const cvDl        = valeurHit('cv-telechargement');
const pages = listeHits
  .filter((h) => !estEvtCV(h.path))
  .map((h) => ({ titre: h.title || h.path, count: n(h.count) }))
  .sort((a, b) => b.count - a.count);

const listePays = (pays && Array.isArray(pays.stats)) ? pays.stats : [];
const paysTries = listePays
  .map((p) => ({ nom: p.name || p.id, count: n(p.count) }))
  .sort((a, b) => b.count - a.count);

// --- Construction de l'e-mail (sobre, à la charte LUNTRAE) ------------------
const C = { obs: '#101820', bronze: '#8A6A4A', bronzeBr: '#b6905f', lunaire: '#E8ECEF', dim: '#c4ccd1', ligne: '#2a3640' };

const ligne = (label, valeur) =>
  `<tr><td style="padding:6px 0;color:${C.dim}">${label}</td>` +
  `<td style="padding:6px 0;text-align:right;color:${C.lunaire};font-weight:600">${valeur}</td></tr>`;

const tableau = (rows, vide) =>
  rows.length
    ? `<table style="width:100%;border-collapse:collapse">${rows}</table>`
    : `<p style="color:${C.dim};font-style:italic">${vide}</p>`;

const titre2 = (txt) =>
  `<h2 style="font-weight:500;font-size:16px;color:${C.bronzeBr};border-bottom:1px solid ${C.ligne};padding-bottom:6px">${txt}</h2>`;

const html = `
<div style="background:${C.obs};color:${C.lunaire};font-family:Georgia,'Times New Roman',serif;padding:28px;max-width:560px;margin:auto">
  <p style="letter-spacing:.18em;text-transform:uppercase;color:${C.bronzeBr};font-size:13px;margin:0 0 4px">LUNTRAE</p>
  <h1 style="font-weight:500;font-size:22px;margin:0 0 2px;color:${C.lunaire}">Rapport du ${hier}</h1>
  <p style="color:${C.dim};font-size:13px;margin:0 0 22px">Mesure sans cookie · données agrégées et anonymes</p>

  ${titre2('Fréquentation')}
  <table style="width:100%;border-collapse:collapse;margin:0 0 18px">
    ${ligne('Vues totales', totalVues === null ? '—' : totalVues)}
    ${ligne('CV — consultations', cvConsult)}
    ${ligne('CV — téléchargements', cvDl)}
  </table>

  ${titre2('Pages')}
  <div style="margin:0 0 18px">${tableau(pages.map((p) => ligne(escapeHtml(p.titre), p.count)).join(''), 'Aucune page vue hier.')}</div>

  ${titre2('Pays')}
  <div style="margin:0 0 22px">${tableau(paysTries.map((p) => ligne(escapeHtml(p.nom), p.count)).join(''), 'Aucun pays remonté hier.')}</div>

  <p style="color:${C.bronze};font-style:italic;font-size:14px;margin:0">« Des systèmes calmes, un impact durable. »</p>
</div>`;

// --- Envoi via Brevo (API transactionnelle) --------------------------------
const envoi = await fetch('https://api.brevo.com/v3/smtp/email', {
  method: 'POST',
  headers: { 'api-key': BREVO, 'Content-Type': 'application/json', accept: 'application/json' },
  body: JSON.stringify({
    sender: { name: 'LUNTRAE', email: FROM },
    to: [{ email: TO }],
    subject: `Rapport LUNTRAE — ${hier}`,
    htmlContent: html,
  }),
});

if (!envoi.ok) {
  console.error('Échec de l’envoi Brevo :', envoi.status, await envoi.text());
  process.exit(1);
}
console.log('Rapport envoyé pour', hier);
