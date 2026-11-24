/* LUNTRAE, page liens : les scènes des loutres.

   Un petit moteur de lecture par requestAnimationFrame. Chaque scène est une liste de pistes (une par loutre).
   Une piste a deux parties :
   - « cles » : des clés datées en millisecondes. Entre deux clés, le moteur interpole le déplacement (dx, dy,
     en pixels du décor 1672 x 941), l'échelle (k, kx, ky), la rotation (r, en degrés) et l'opacité. Une clé peut
     aussi demander des remous (remous : intervalle d'émission en ms) ;
   - « images » : le film. Chaque entrée dit à partir de quel instant (de) montrer quelle image, ou quelle suite
     d'images (suite, cadence). « net » enchaîne les images sans fondu : c'est le cas des suites serrées.

   Les images d'une loutre sont rangées par séries dans son dossier (sequence-001.webp...). Elles sont chargées
   après l'affichage de la page et décodées avant d'être montrées. Une image qui n'est pas encore arrivée est
   simplement sautée ; une loutre sans images joue sa scène avec sa pose de repos.

   La loutre du bassin joue une suite de 51 images, à 15 images par seconde : elle sort de l'eau, s'immobilise
   (c'est sa pose de repos), puis plonge et nage vers la grotte. Ces images portent tout : le corps, son reflet
   et l'eau qu'elle déplace. Le code ne la déplace pas, il règle seulement son apparition et sa disparition.

   Sans script, ou si l'utilisateur demande des animations réduites, rien ne bouge : la page reste complète
   et les trois liens fonctionnent. */
(() => {
  'use strict';

  const scene = document.querySelector('.scene');
  if (!scene) return;

  const LARGEUR = 1672;
  const HAUTEUR = 941;
  const FONDU = 110; // durée du fondu entre deux poses, en ms

  /* Les quatre loutres. « ancre » : point d'ancrage dans le décor. « series » : nombre d'images par série.
     Les images d'une série ont le même canevas et le même ancrage que la pose de repos de la loutre. */
  const CADENCE = 1000 / 15; // durée d'une image des suites, en ms
  const ACTEURS = {
    // Les deux loutres du Q forment un seul calque. Sa série est une liste : toutes les images de l'action, puis
    // une sur deux pendant le long nez à nez, où presque rien ne bouge.
    Q_DUO:          { ancre: [370, 466],  series: { rencontre: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 77, 79, 81, 83, 85, 87, 89, 91, 93, 95, 97, 99, 101, 103, 105, 107, 109, 111, 113, 115, 117, 119, 120] }, pretes: 24 },
    // « pretes » : nombre d'images à avoir reçues pour jouer la première émergence (le reste suit).
    SITE_SWIMMER:   { ancre: [906, 638],  series: { sequence: 51 }, pretes: 15 },
    PROJECTS_OTTER: { ancre: [1560, 590], series: { pierre: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 86, 88, 90, 92, 94, 96, 98, 100, 102, 104, 106, 108, 110, 112, 114, 116, 117] }, pretes: 24 }
  };

  /* La suite d'images de la loutre du bassin. Images 1 à 15 : elle sort de l'eau et s'immobilise. L'image 15
     est sa pose de repos. Images 15 à 51 : elle plonge, nage vers la grotte et s'y efface. */
  const suite = (de, a, serie) => Array.from({ length: a - de + 1 }, (x, i) => (serie || 'sequence') + '-' + (de + i));
  const EMERGE = 15;
  const FIN = 51;
  const emergence = (t0) => ({
    cles: [
      { t: t0,       dx: 0, dy: 0, k: 1, opacite: 0, aisance: 'saut' },
      { t: t0 + 220, opacite: 1, aisance: 'lin' },
      { t: t0 + EMERGE * CADENCE + 150 }
    ],
    images: [
      { de: t0, suite: suite(1, EMERGE), cadence: CADENCE, net: true },
      { de: t0 + EMERGE * CADENCE, image: 'sequence-' + EMERGE, net: true }
    ]
  });
  const NAGE = (FIN - EMERGE + 1) * CADENCE;   // durée de la nage
  const RETOUR = NAGE + 900;                   // l'eau se calme, puis elle émerge de nouveau

  /* Les scènes. Les durées sont en millisecondes depuis le début de la scène.
     aisance : 'io' (départ et arrivée doux, par défaut), 'in', 'out', 'lin', 'saut' (changement immédiat). */
  const SCENES = {
    /* Le Q : les deux loutres sont nez contre nez. La nageuse se détourne, plonge et revient ; la compagne relève
       la tête, puis se penche vers elle. Leurs museaux se touchent, elles se reniflent et restent nez contre nez.
       Images 1 à 75 à 15 par seconde, puis une image sur deux, en fondu, pendant le nez à nez. */
    rencontre: {
      pistes: [
        { acteur: 'Q_DUO',
          cles: [{ t: 0 }, { t: 8157 }],
          images: [
            { de: 0, image: 'rencontre-1' },
            { de: 110, suite: suite(2, 75, 'rencontre'), cadence: CADENCE, net: true },
            { de: 110 + 74 * CADENCE, suite: ['rencontre-77', 'rencontre-79', 'rencontre-81', 'rencontre-83', 'rencontre-85', 'rencontre-87', 'rencontre-89', 'rencontre-91', 'rencontre-93', 'rencontre-95', 'rencontre-97', 'rencontre-99', 'rencontre-101', 'rencontre-103', 'rencontre-105', 'rencontre-107', 'rencontre-109', 'rencontre-111', 'rencontre-113', 'rencontre-115', 'rencontre-117', 'rencontre-119'], cadence: 2 * CADENCE },
            { de: 110 + 74 * CADENCE + 22 * 2 * CADENCE, image: 'rencontre-120' }
          ] }
      ]
    },

    /* Site LUNTRAE.fr, au premier affichage : la loutre sort de l'eau une fois, puis reste en surface. */
    emergence: { pistes: [Object.assign({ acteur: 'SITE_SWIMMER' }, emergence(0))] },

    /* Site LUNTRAE.fr : elle plonge, nage vers la grotte en s'éloignant et s'efface à son entrée ; l'eau se
       calme, puis elle émerge de nouveau au milieu du bassin. */
    trajet: {
      pistes: [
        { acteur: 'SITE_SWIMMER',
          cles: [
            { t: 0, dx: 0, dy: 0, k: 1, opacite: 1 },
            { t: NAGE - 520, opacite: 1 },
            { t: NAGE - 40, opacite: 0, aisance: 'lin' }
          ].concat(emergence(RETOUR).cles),
          images: [
            { de: 0, suite: suite(EMERGE, FIN), cadence: CADENCE, net: true },
            { de: NAGE, image: 'sequence-' + FIN, net: true }
          ].concat(emergence(RETOUR).images) }
      ]
    },

    /* Projets : la loutre resserre ses pattes, soulève sa pierre et frappe la moule, deux fois ; des éclats sautent ;
       elle repose la pierre et reprend sa pose. La pierre et la moule viennent des images.
       Images 1 à 84 à 15 par seconde, puis une image sur deux, en fondu, pour le retour au calme. */
    pierre: {
      pistes: [
        { acteur: 'PROJECTS_OTTER',
          cles: [{ t: 0 }, { t: 7957 }],
          images: [
            { de: 0, image: 'pierre-1' },
            { de: 110, suite: suite(2, 84, 'pierre'), cadence: CADENCE, net: true },
            { de: 110 + 83 * CADENCE, suite: ['pierre-86', 'pierre-88', 'pierre-90', 'pierre-92', 'pierre-94', 'pierre-96', 'pierre-98', 'pierre-100', 'pierre-102', 'pierre-104', 'pierre-106', 'pierre-108', 'pierre-110', 'pierre-112', 'pierre-114', 'pierre-116'], cadence: 2 * CADENCE },
            { de: 110 + 83 * CADENCE + 16 * 2 * CADENCE, image: 'pierre-117' }
          ] }
      ]
    }
  };
  const SCENE_DU_LIEN = { q: 'rencontre', site: 'trajet', projets: 'pierre' };

  const DEFAUT = { dx: 0, dy: 0, k: 1, kx: 1, ky: 1, r: 0, opacite: 1 };
  const PROPS = Object.keys(DEFAUT);
  const AISANCES = {
    lin: (f) => f,
    in: (f) => 1 - Math.cos(f * Math.PI / 2),
    out: (f) => Math.sin(f * Math.PI / 2),
    io: (f) => (1 - Math.cos(f * Math.PI)) / 2,
    saut: (f) => (f < 1 ? 0 : 1)
  };

  /* Écran tactile, première boucle : la loutre du bassin émerge, marque un temps d'une seconde, puis nage. */
  {
    const temps = EMERGE * CADENCE + 150 + 1000;
    const trajet = SCENES.trajet.pistes[0];
    const decaler = (liste, cle) => liste.map((e) => Object.assign({}, e, { [cle]: e[cle] + temps }));
    SCENES.arrivee = { pistes: [{ acteur: 'SITE_SWIMMER',
      cles: emergence(0).cles.concat(decaler(trajet.cles, 't')),
      images: emergence(0).images.concat(decaler(trajet.images, 'de')) }] };
  }

  // Chaque clé hérite des valeurs de la précédente : on n'écrit dans une scène que ce qui change.
  Object.keys(SCENES).forEach((nom) => {
    const sc = SCENES[nom];
    sc.duree = 0;
    sc.pistes.forEach((piste) => {
      let avant = DEFAUT;
      piste.cles = piste.cles.map((c) => {
        const cle = Object.assign({}, c);
        PROPS.forEach((p) => { if (cle[p] === undefined) cle[p] = avant[p]; });
        avant = cle;
        return cle;
      });
      sc.duree = Math.max(sc.duree, piste.cles[piste.cles.length - 1].t);
    });
  });

  const mouvementReduit = window.matchMedia('(prefers-reduced-motion: reduce)');
  const sansSurvol = window.matchMedia('(hover: none)');

  const acteurs = {};
  scene.querySelectorAll('[data-acteur]').forEach((el) => {
    const def = ACTEURS[el.dataset.acteur];
    const img = el.querySelector('img');
    if (!def || !img) return;
    const repos = img.getAttribute('src');
    acteurs[el.dataset.acteur] = {
      el, img, def, repos,
      dossier: repos.replace(/[^/]+$/, ''),
      plan: el.closest('.plan'),
      images: null,
      arriere: null,
      montree: 'repos',
      fondu: null,
      etat: Object.keys(def.series).length ? 'a-charger' : 'aucune',
      occupe: false
    };
  });

  /* Images des séries : chargées dans l'ordre et décodées avant d'être montrées, pour qu'aucune ne clignote.
     La loutre est prête dès que ses premières images sont là ; une image manquante est simplement sautée. */
  const chargerImages = (a, fin) => {
    if (a.etat !== 'a-charger') { if (fin && a.etat === 'aucune') fin(); return; }
    a.etat = 'en-cours';
    a.images = {};
    let recues = 0, total = 0, traitees = 0;
    const numeros = (serie) => { const d = a.def.series[serie]; return Array.isArray(d) ? d : Array.from({ length: d }, (x, i) => i + 1); };
    Object.keys(a.def.series).forEach((serie) => { total += numeros(serie).length; });
    const seuil = Math.min(total, a.def.pretes || total);
    Object.keys(a.def.series).forEach((serie) => {
      numeros(serie).forEach((i) => {
        const im = new Image();
        const nom = serie + '-' + i;
        im.src = a.dossier + serie + '-' + String(i).padStart(3, '0') + '.webp';
        const prete = im.decode ? im.decode() : new Promise((oui, non) => { im.onload = oui; im.onerror = non; });
        prete.then(() => {
          a.images[nom] = im;
          recues += 1;
          if (recues >= seuil && a.etat === 'en-cours') a.etat = 'pretes';
        }).catch(() => {}).then(() => { traitees += 1; if (traitees === total && fin) fin(); });
      });
    });
  };

  /* Montre une pose. La nouvelle apparaît en fondu par-dessus la précédente, qui reste pleine puis est retirée :
     le corps reste opaque pendant tout le passage. « net » coupe sans fondu (quand la loutre réapparaît ailleurs). */
  const montrer = (a, nom, maintenant, net) => {
    if (a.etat !== 'pretes' || a.montree === nom || !a.images[nom]) return;
    if (net) {
      if (a.arriere) a.arriere.hidden = true;
      a.img.style.opacity = '';
      a.fondu = null;
    } else {
      if (!a.arriere) {
        a.arriere = document.createElement('img');
        a.arriere.alt = '';
        a.img.parentNode.insertBefore(a.arriere, a.img);
      }
      a.arriere.src = a.img.src;
      a.arriere.style.opacity = '1';
      a.arriere.hidden = false;
      a.img.style.opacity = '0';
      a.fondu = maintenant;
    }
    a.img.src = a.images[nom].src;
    a.montree = nom;
  };

  const fondre = (a, maintenant) => {
    if (a.fondu === null) return;
    const p = (maintenant - a.fondu) / FONDU;
    if (p >= 1) {
      a.img.style.opacity = '';
      a.arriere.hidden = true;
      a.fondu = null;
      return;
    }
    // l'image du dessous reste pleine jusqu'au bout : la loutre n'est jamais translucide pendant le passage
    a.img.style.opacity = String(Math.round(p * 100) / 100);
  };

  const appliquer = (a, v) => {
    const s = a.el.style;
    PROPS.forEach((p) => s.setProperty('--' + p, String(Math.round(v[p] * 1000) / 1000)));
  };

  const reposer = (a) => {
    const s = a.el.style;
    PROPS.forEach((p) => s.removeProperty('--' + p));
    ['--pvx', '--pvy'].forEach((p) => s.removeProperty(p));
    if (a.montree !== 'repos') { a.img.src = a.repos; a.montree = 'repos'; }
    a.img.style.opacity = '';
    if (!a.img.getAttribute('style')) a.img.removeAttribute('style');
    if (a.arriere) a.arriere.hidden = true;
    a.fondu = null;
    a.occupe = false;
  };

  /* Un remous : posé dans le décor à l'endroit où se trouve la loutre, il y reste pendant qu'elle avance. */
  const emettreRemous = (a, v) => {
    if (!a.def.remous || !a.plan) return;
    const o = document.createElement('span');
    o.className = 'remous';
    o.style.left = ((a.def.ancre[0] + v.dx - a.def.remous.recul * v.k) / LARGEUR * 100) + '%';
    o.style.top = ((a.def.ancre[1] + v.dy) / HAUTEUR * 100) + '%';
    o.style.setProperty('--taille', String(Math.round(a.def.remous.taille * v.k)));
    a.plan.appendChild(o);
    window.setTimeout(() => o.remove(), 2200);
  };

  const lectures = new Map();
  let image = 0;
  let partance = false;

  const avancer = (piste, t, maintenant) => {
    const cles = piste.cles;
    while (piste.i < cles.length - 2 && t >= cles[piste.i + 1].t) piste.i += 1;
    const a = cles[piste.i];
    const b = cles[piste.i + 1];
    const f = b.t > a.t ? Math.min(1, Math.max(0, (t - a.t) / (b.t - a.t))) : 1;
    const e = (AISANCES[b.aisance] || AISANCES.io)(f);
    const v = {};
    PROPS.forEach((p) => { v[p] = a[p] + (b[p] - a[p]) * e; });
    appliquer(piste.a, v);

    const film = piste.images;
    if (film && piste.a.etat === 'pretes') {
      while (piste.j < film.length - 1 && t >= film[piste.j + 1].de) piste.j += 1;
      const plan = film[piste.j];
      if (t >= plan.de) {
        const nom = plan.suite ? plan.suite[Math.min(plan.suite.length - 1, Math.floor((t - plan.de) / plan.cadence))] : plan.image;
        montrer(piste.a, nom, maintenant, plan.net === true);
      }
      fondre(piste.a, maintenant);
    }

    if (b.remous && f < 1 && t - piste.dernierRemous >= b.remous) {
      piste.dernierRemous = t;
      emettreRemous(piste.a, v);
    }
  };

  const terminer = (nom) => {
    const l = lectures.get(nom);
    if (!l) return;
    lectures.delete(nom);
    l.pistes.forEach((p) => reposer(p.a));
    if (l.fin) l.fin();
  };

  const boucle = (maintenant) => {
    image = 0;
    lectures.forEach((l, nom) => {
      if (l.debut === null) l.debut = maintenant;
      const t = maintenant - l.debut;
      l.pistes.forEach((p) => avancer(p, Math.min(t, l.duree), maintenant));
      if (t >= l.duree) terminer(nom);
    });
    if (lectures.size) image = window.requestAnimationFrame(boucle);
  };

  /* Joue une scène en entier. Refusée si l'une de ses loutres est déjà en mouvement : une scène ne se coupe
     pas et ne se relance pas en rafale. */
  const jouer = (nom, fin) => {
    const sc = SCENES[nom];
    if (!sc || partance || mouvementReduit.matches || document.hidden) return false;
    const pistes = [];
    for (const piste of sc.pistes) {
      const a = acteurs[piste.acteur];
      if (!a || a.occupe) return false;
      pistes.push({ a, cles: piste.cles, images: piste.images, pivot: piste.pivot, i: 0, j: 0, dernierRemous: -1e9 });
    }
    pistes.forEach((p) => {
      p.a.occupe = true;
      if (p.pivot) {
        const style = getComputedStyle(p.a.el);
        p.a.el.style.setProperty('--pvx', String(p.pivot[0] - parseFloat(style.getPropertyValue('--ax'))));
        p.a.el.style.setProperty('--pvy', String(p.pivot[1] - parseFloat(style.getPropertyValue('--ay'))));
      }
    });
    lectures.set(nom, { debut: null, duree: sc.duree, pistes, fin });
    if (!image) image = window.requestAnimationFrame(boucle);
    return true;
  };

  const toutArreter = () => {
    Array.from(lectures.keys()).forEach((nom) => {
      const l = lectures.get(nom);
      lectures.delete(nom);
      l.pistes.forEach((p) => reposer(p.a));
    });
    if (image) { window.cancelAnimationFrame(image); image = 0; }
    scene.querySelectorAll('.remous').forEach((o) => o.remove());
    Object.keys(acteurs).forEach((id) => reposer(acteurs[id]));
  };

  /* --- Le rythme de la page ------------------------------------------------------------------------------
     Avec une souris : au chargement, tout est calme ; la loutre du bassin émerge une fois, puis une ronde discrète
     joue chaque scène tour à tour, trois fois au plus. Le survol ou le focus d'un lien joue sa scène.
     Sur écran tactile, sans survol : les trois scènes partent seules, dans l'ordre des liens (voir plus bas). */
  let minuterieRonde = null;
  let tourRonde = 0;
  let introFaite = false;
  const ORDRE_RONDE = ['rencontre', 'pierre', 'trajet'];

  const programmerRonde = (delai) => {
    window.clearTimeout(minuterieRonde);
    if (sansSurvol.matches || mouvementReduit.matches || partance || tourRonde >= 3) return;
    minuterieRonde = window.setTimeout(() => {
      if (document.hidden || partance) return;
      if (lectures.size) { programmerRonde(4000); return; }
      const nom = ORDRE_RONDE[tourRonde % ORDRE_RONDE.length];
      if (jouer(nom, () => programmerRonde(6500 + Math.random() * 3000))) tourRonde += 1;
      else programmerRonde(4000);
    }, delai);
  };

  const lancerIntro = (essais) => {
    if (introFaite || mouvementReduit.matches) return;
    const site = acteurs.SITE_SWIMMER;
    if (!site) { introFaite = true; programmerRonde(5000); return; }
    // on laisse aux images le temps d'arriver (2,4 s au plus) ; au-delà, l'émergence se joue avec la pose de repos
    if (site.etat === 'en-cours' && (essais || 0) < 12) { window.setTimeout(() => lancerIntro((essais || 0) + 1), 200); return; }
    if (jouer('emergence', () => programmerRonde(5200))) introFaite = true;
  };

  /* --- Écran tactile : l'enchaînement ---------------------------------------------------------------------
     Le Q part en premier, le site 2 secondes après, les projets 2 secondes après le site. Chaque scène attend que
     ses premières images soient arrivées (6 secondes au plus). Quand les trois sont finies, 6 secondes de pause,
     puis l'enchaînement reprend : trois boucles au plus, après quoi la page reste immobile. */
  const DECALAGE = 2000;
  const PAUSE_BOUCLE = 6000;
  const BOUCLES = 3;
  const ATTENTE_IMAGES = 6000;
  let tourEnchainement = 0;
  let boucleEnCours = false;
  let minuteries = [];
  const plusTard = (action, delai) => { minuteries.push(window.setTimeout(action, delai)); };
  const annulerEnchainement = () => { minuteries.forEach((m) => window.clearTimeout(m)); minuteries = []; };

  const quandPrete = (a, action, depuis) => {
    const debut = depuis || Date.now();
    if (!a || a.etat === 'pretes' || a.etat === 'aucune' || Date.now() - debut > ATTENTE_IMAGES) { action(); return; }
    plusTard(() => quandPrete(a, action, debut), 150);
  };

  const enchainer = () => {
    if (mouvementReduit.matches || partance || document.hidden || boucleEnCours || tourEnchainement >= BOUCLES) return;
    tourEnchainement += 1;
    boucleEnCours = true;
    let restantes = 3;
    const finie = () => {
      restantes -= 1;
      if (restantes > 0) return;
      boucleEnCours = false;
      plusTard(enchainer, PAUSE_BOUCLE);
    };
    const lancer = (nom) => { if (!jouer(nom, finie)) finie(); };
    quandPrete(acteurs.Q_DUO, () => {
      lancer('rencontre');
      plusTard(() => quandPrete(acteurs.SITE_SWIMMER, () => {
        lancer(introFaite ? 'trajet' : 'arrivee');
        introFaite = true;
        plusTard(() => quandPrete(acteurs.PROJECTS_OTTER, () => lancer('pierre')), DECALAGE);
      }), DECALAGE);
    });
  };

  // Une boucle interrompue (onglet masqué, retour arrière) est rejouée en entier.
  const reprendreEnchainement = (delai) => {
    annulerEnchainement();
    if (boucleEnCours) { boucleEnCours = false; tourEnchainement -= 1; }
    plusTard(enchainer, delai);
  };

  const preparer = () => {
    if (mouvementReduit.matches) { toutArreter(); return; }
    const site = acteurs.SITE_SWIMMER;
    if (sansSurvol.matches) {
      // Écran tactile : les images arrivent dans l'ordre des scènes, une loutre après l'autre.
      const ordre = [acteurs.Q_DUO, site, acteurs.PROJECTS_OTTER].filter(Boolean);
      let rang = -1;
      const charger = (i) => {
        if (i <= rang || i >= ordre.length) return;
        rang = i;
        chargerImages(ordre[i], () => charger(i + 1));
        window.setTimeout(() => charger(i + 1), 8000); // une connexion qui cale ne bloque pas la suite
      };
      charger(0);
      // Avant sa première émergence, la loutre du bassin est sous la surface.
      if (site) appliquer(site, Object.assign({}, DEFAUT, { opacite: 0 }));
      plusTard(enchainer, 500);
      return;
    }
    if (site) chargerImages(site);
    window.setTimeout(() => { Object.keys(acteurs).forEach((id) => chargerImages(acteurs[id])); }, site ? 1500 : 0);
    if (site && !introFaite) {
      // Avant sa première émergence, la loutre du bassin est sous la surface.
      appliquer(site, Object.assign({}, DEFAUT, { opacite: 0 }));
      window.setTimeout(() => lancerIntro(0), 1200);
      // Sécurité : si l'émergence n'a pas pu se jouer, la loutre reprend simplement sa place.
      window.setTimeout(() => { if (!introFaite && !lectures.size) { reposer(site); introFaite = true; programmerRonde(5000); } }, 9000);
    }
  };

  /* --- Les liens ------------------------------------------------------------------------------------------ */
  const liens = Array.from(scene.querySelectorAll('.destination'));
  liens.forEach((lien) => {
    const nom = SCENE_DU_LIEN[lien.dataset.destination];
    const eveiller = () => {
      // Tant que la loutre du bassin n'a pas émergé une première fois, son lien déclenche cette émergence.
      if (!introFaite && nom === 'trajet') { lancerIntro(12); return; }
      window.clearTimeout(minuterieRonde);
      jouer(nom);
      if (!lectures.size) return;
      // la ronde reprend plus tard, une fois la main rendue
      minuterieRonde = window.setTimeout(() => programmerRonde(9000), 100);
    };
    lien.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') eveiller(); });
    lien.addEventListener('focus', () => { if (lien.matches(':focus-visible')) eveiller(); });
    lien.addEventListener('click', (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (partance) { e.preventDefault(); return; }
      if (mouvementReduit.matches) return;
      annulerEnchainement();
      // Un bref accusé de réception, puis la destination : 220 ms, quoi qu'il arrive.
      e.preventDefault();
      partance = true;
      window.clearTimeout(minuterieRonde);
      lien.classList.add('is-leaving');
      window.setTimeout(() => { window.location.assign(lien.href); }, 220);
    });
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      window.clearTimeout(minuterieRonde);
      annulerEnchainement();
      const introEnCours = lectures.has('emergence');
      toutArreter();
      if (introEnCours) introFaite = true;
    } else if (!partance) {
      if (sansSurvol.matches) reprendreEnchainement(1000);
      else if (!introFaite) lancerIntro(0);
      else programmerRonde(4000);
    }
  });

  // Retour par le bouton précédent : la page revient au repos, liens actifs.
  window.addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    partance = false;
    liens.forEach((lien) => lien.classList.remove('is-leaving'));
    toutArreter();
    if (sansSurvol.matches) reprendreEnchainement(1500);
    else programmerRonde(5000);
  });

  const surChangement = () => { if (mouvementReduit.matches) { window.clearTimeout(minuterieRonde); toutArreter(); } };
  if (mouvementReduit.addEventListener) mouvementReduit.addEventListener('change', surChangement);

  preparer();
})();
