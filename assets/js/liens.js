/* Page liens : la loutre et ses trois terriers.
   Les liens fonctionnent sans ce script. Il ne fait qu'animer : la loutre guette de temps en temps,
   regarde vers le terrier survolé, puis plonge dans le terrier choisi avant d'ouvrir la page. */
(() => {
  const liste = document.querySelector(".terriers");
  if (!liste) return;
  // Animations réduites : rien ne bouge, les liens restent de simples liens.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const terriers = Array.from(liste.querySelectorAll(".terrier"));
  liste.classList.add("pilote"); // le script prend la main sur l'animation de repos écrite en CSS
  let dehors = -1; // terrier où la loutre est visible, -1 si elle est rentrée
  let dernier = -1;
  let parti = false;
  let minuteurs = [];

  const plusTard = (fn, ms) => { minuteurs.push(setTimeout(fn, ms)); };
  const arreter = () => { minuteurs.forEach(clearTimeout); minuteurs = []; };

  const montrer = (i, versLaGauche) => {
    terriers.forEach((t, k) => {
      t.classList.toggle("dehors", k === i);
      t.classList.toggle("gauche", k === i && !!versLaGauche);
    });
    dehors = i;
  };
  const rentrer = () => { terriers.forEach((t) => t.classList.remove("dehors", "gauche")); dehors = -1; };

  // Repos : elle sort d'un terrier, regarde à droite, à gauche, puis replonge.
  const ronde = () => {
    arreter();
    plusTard(() => {
      let i = Math.floor(Math.random() * terriers.length);
      if (i === dernier) i = (i + 1) % terriers.length;
      dernier = i;
      montrer(i, false);
      plusTard(() => montrer(i, true), 1000);
      plusTard(() => montrer(i, false), 1900);
      plusTard(() => { rentrer(); ronde(); }, 2900);
    }, 2200 + Math.random() * 3200);
  };

  // Survol ou focus : elle sort d'un terrier voisin et tourne la tête vers le terrier visé.
  const regarder = (i) => {
    if (parti) return;
    arreter();
    const j = dehors >= 0 && dehors !== i ? dehors : (i === 0 ? 1 : i - 1);
    const cible = terriers[i].getBoundingClientRect();
    const depuis = terriers[j].getBoundingClientRect();
    montrer(j, cible.left + cible.width / 2 < depuis.left + depuis.width / 2 - 4);
  };
  const relacher = () => { if (!parti) { arreter(); plusTard(() => { rentrer(); ronde(); }, 900); } };

  terriers.forEach((t, i) => {
    t.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") regarder(i); });
    t.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") relacher(); });
    t.addEventListener("focus", () => regarder(i));
    t.addEventListener("blur", relacher);

    // Clic ou toucher : elle plonge dans le terrier choisi, puis la page s'ouvre.
    t.addEventListener("click", (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      if (parti) return;
      parti = true;
      arreter();
      const dejaLa = dehors === i;
      terriers.forEach((autre) => autre.classList.remove("dehors", "gauche"));
      dehors = -1;
      t.classList.add(dejaLa ? "replonge" : "plonge");
      // La destination s'ouvre quoi qu'il arrive, même si l'animation ne se joue pas.
      setTimeout(() => { window.location.href = t.href; }, 680);
    });
  });

  // Retour par le bouton Précédent : la page revient à son état de repos.
  window.addEventListener("pageshow", () => {
    parti = false;
    terriers.forEach((t) => t.classList.remove("plonge", "replonge", "dehors", "gauche"));
    dehors = -1;
    ronde();
  });
})();
