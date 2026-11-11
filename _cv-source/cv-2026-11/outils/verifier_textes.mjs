// Contrôle de conformité du CV au contenu figé du brief (section 2).
// Usage : node outils/verifier_textes.mjs <brief.md> <texte extrait du PDF par pdftotext> [CV_Camille_Sauton.html]
// Chaque texte attendu est cherché dans le texte du PDF, lignes recollées. Les lignes marquées [page]
// doivent être absentes du PDF. Le script ne corrige rien : il liste ce qui manque ou ce qui est en trop.
import fs from 'node:fs';

const [briefPath, pdfTextPath, htmlPath] = process.argv.slice(2);
if (!briefPath || !pdfTextPath) { console.error('usage : node verifier_textes.mjs <brief.md> <pdf.txt> [cv.html]'); process.exit(2); }
const brief = fs.readFileSync(briefPath, 'utf8').replace(/\r\n/g, '\n');
const aplatir = (t) => t.replace(/\f/g, ' ').replace(/\s+/g, ' ').trim();
const pdf = aplatir(fs.readFileSync(pdfTextPath, 'utf8'));
// pdftotext écrit « 1/2 » pour « 1 / 2 » selon l'espacement : on compare sans tenir compte des espaces autour de la barre
const sansEspacesBarre = (t) => t.replace(/\s*\/\s*/g, '/');
const pdfCmp = sansEspacesBarre(pdf);

const debut = brief.indexOf('## 2. Contenu figé');
const fin = brief.indexOf('## 3. Lot 1');
if (debut < 0 || fin < 0) { console.error('section 2 du brief introuvable'); process.exit(2); }
const lignes = brief.slice(debut, fin).split('\n');

const attendus = [];   // { texte, section }
const reserves = [];   // lignes [page] : absentes du PDF
let section = '';
const nettoyer = (t) => t.replace(/\*\*/g, '').replace(/(^|[^*])\*([^*]+)\*/g, '$1$2').replace(/`/g, '').trim();
const ajouter = (t) => { const x = nettoyer(t); if (x) attendus.push({ texte: x, section }); };

for (let brut of lignes) {
  const l = brut.trim();
  if (!l || l === '---') continue;
  if (l.startsWith('### ')) { section = l.slice(4); continue; }
  if (l.startsWith('## ')) continue;
  if (section.startsWith('2.1')) {
    const m = l.match(/^- ([^:]+) : (.+)$/);
    if (!m) continue;
    const cle = m[1].trim(); let val = nettoyer(m[2]);
    if (cle.startsWith('Balise')) continue;                 // titre du document : contrôlé par pdfinfo
    if (cle.startsWith('Bandeau')) { val.split(' · ').length >= 3 ? (ajouter('CAMILLE SAUTON'), ajouter(val.split(' · ').slice(1).join(' · '))) : ajouter(val); continue; }
    ajouter(val); continue;
  }
  if (section.startsWith('2.2')) { if (l.startsWith('> ')) ajouter(l.slice(2)); continue; }
  if (section.startsWith('2.5')) {
    if (l.startsWith('|')) {
      const c = l.split('|').slice(1, -1).map((x) => x.trim());
      if (c[0] === '#' || /^-+$/.test(c[0])) continue;
      c.slice(1).forEach(ajouter); continue;
    }
    const m = l.match(/^Sous les cartes : \*(.+)\*$/); if (m) ajouter(m[1]);
    continue;
  }
  if (section.startsWith('2.7')) {
    const m = l.match(/^\d+\. \*\*(.+?)\*\*(?: \(point mis en avant\))? · (.+)$/);
    if (m) { ajouter(m[1]); ajouter(m[2]); }
    continue;
  }
  if (section.startsWith('2.8')) { for (const m of l.matchAll(/« ([^»]+) »/g)) ajouter(m[1]); continue; }
  // 2.3, 2.4, 2.6
  if (/^(Les lignes marquées|\(Seul changement)/.test(l)) continue;
  let m = l.match(/^\d+\. (.+)$/);
  if (m) {
    if (/\*\*\[page\]\*\*/.test(m[1])) reserves.push({ texte: nettoyer(m[1].replace(/\*\*\[page\]\*\*/, '')), section });
    else ajouter(m[1]);
    continue;
  }
  m = l.match(/^- (Outils|Langues) : (.+)$/);
  if (m) { ajouter(`${m[1]} : ${m[2]}`); continue; }
  m = l.match(/^Encart \*\*(.+?)\*\*.*« (.+) »$/);
  if (m) { ajouter(m[1]); ajouter(m[2]); continue; }
  ajouter(l);
}

let manquants = 0, enTrop = 0;
const parSection = {};
for (const a of attendus) {
  const ok = pdfCmp.includes(sansEspacesBarre(a.texte));
  parSection[a.section] = parSection[a.section] || { ok: 0, ko: 0 };
  parSection[a.section][ok ? 'ok' : 'ko']++;
  if (!ok) { manquants++; console.log(`  MANQUE  [${a.section}] ${a.texte}`); }
}
for (const r of reserves) {
  if (pdfCmp.includes(r.texte)) { enTrop++; console.log(`  EN TROP [${r.section}] ligne [page] présente dans le PDF : ${r.texte}`); }
}
for (const [s, n] of Object.entries(parSection)) console.log(`  ${s.padEnd(34)} ${n.ok} texte(s) retrouvé(s) sur ${n.ok + n.ko}`);
console.log(`Textes attendus : ${attendus.length}, manquants : ${manquants}. Lignes [page] : ${reserves.length}, présentes à tort dans le PDF : ${enTrop}.`);

// ordre des sections et des blocs dans le texte extrait
const ordre = ['PROFIL', 'EXPÉRIENCE', 'Chargée des relations sympathisants', 'Communication et événementiel', 'Assistante marketing et communication', 'Communication et catalogue local', 'Assistante commerciale',
  'VEILLE ET CENTRES D\'INTÉRÊT', 'Approche créative', 'PROJETS', 'Projet confidentiel', 'Le Gentle', 'Méthode de repositionnement professionnel', 'Kintara Ceramics', 'Geneapop', 'Écosystème LUNTRAE', 'Plus de projets',
  'COMPÉTENCES', 'Mobilisation et engagement des publics', 'Gestion de projet et pilotage', 'Stratégie, études et récits', 'Conception et usages', 'Numérique', 'Outils et langues', 'FORMATION', '2010-2011', '2011-2013', '2014-2015', '2015-2017', '2024', 'Depuis mai 2026'];
let pos = -1, ordreOk = true;
for (const o of ordre) { const i = pdf.indexOf(o, pos + 1); if (i < 0) { ordreOk = false; console.log(`  ORDRE : « ${o} » introuvable après le repère précédent`); break; } pos = i; }
console.log(`Ordre de lecture des ${ordre.length} repères : ${ordreOk ? 'conforme' : 'NON CONFORME'}`);

// recherches interdites
const interdits = [['tiret cadratin', /\u2014/], ['tiret demi-cadratin', /\u2013/], ['équipe Engagement associatif', /Engagement associatif/], ['2025', /2025/], ['téléphone', /(?:\+33|\b0)\d(?:[ .]?\d{2}){4}\b/], ['date de naissance', /n[ée]e? le|\d{1,2} ans\b/i], ['disponibilité', /disponib/i], ['espace insécable', /[\u00a0\u202f]/], ['largeur nulle', /[\u200b\ufeff]/], ['apostrophe typographique', /[\u2018\u2019]/]];
for (const [nom, re] of interdits) console.log(`  ${nom.padEnd(30)} ${re.test(fs.readFileSync(pdfTextPath, 'utf8')) ? 'PRÉSENT' : 'absent'}`);
const lpo = [...pdf.matchAll(/Ligue pour la Protection des Oiseaux/g)].map((m) => { const avant = pdf.slice(0, m.index); return avant.lastIndexOf('FORMATION') > avant.lastIndexOf('EXPÉRIENCE') && avant.includes('FORMATION') ? 'Formation' : avant.includes('VEILLE') ? 'AILLEURS' : 'Expérience'; });
console.log(`  Ligue pour la Protection des Oiseaux : ${lpo.length} occurrence(s), dans ${lpo.join(' et ')}`);
console.log(`  première occurrence d'ISEG développée : ${/ISEG/.test(pdf) && pdf.indexOf('ISEG') === pdf.indexOf('ISEG (Institut Supérieur Européen de Gestion)') ? 'oui' : 'NON'}`);
const gentle = pdf.slice(pdf.indexOf('Le Gentle'), pdf.indexOf('Méthode de repositionnement'));
console.log(`  Le Gentle sans date : ${/\b(19|20)\d{2}\b/.test(gentle) ? 'NON, une année figure dans la carte' : 'oui'}`);

if (htmlPath) {
  const h = fs.readFileSync(htmlPath, 'utf8');
  const texteHtml = aplatir(h.replace(/<!--[\s\S]*?-->/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<br>/g, '').replace(/<[^>]+>/g, ' '));
  let m2 = 0; for (const a of attendus) if (!sansEspacesBarre(texteHtml).includes(sansEspacesBarre(a.texte))) { m2++; console.log(`  MANQUE DANS LE HTML [${a.section}] ${a.texte}`); }
  console.log(`Source HTML : ${attendus.length - m2} texte(s) retrouvé(s) sur ${attendus.length} ; fins de ligne CRLF : ${h.includes('\r\n') ? 'OUI' : 'non'} ; caractères interdits : ${/[\u2014\u2013\u00a0\u202f\u200b\ufeff\u2018\u2019\u201c\u201d]/.test(h) ? 'PRÉSENTS' : 'aucun'}`);
}
process.exit(manquants || enTrop || !ordreOk ? 1 : 0);
