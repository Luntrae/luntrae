/* ==========================================================================
   LUNTRAE — interactions
   Vanilla JS, sans dépendance. Mouvement doux, respect de prefers-reduced-motion.
   - reveals au scroll (IntersectionObserver)
   - scrollspy (lien de nav actif selon la section visible)
   - menu mobile (burger)
   - barre de progression de lecture + header condensé
   - bouton « haut de page »
   - halo de lune en légère parallaxe (souris + scroll)
   - lueur des fiches qui suit le curseur
   - formulaire d'inscription branché sur Formspree (honeypot + double opt-in)
   ========================================================================== */
(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --- 1. Reveals au scroll (rejoués à la DESCENTE, instantanés à la MONTÉE) --- */
  const revealables = document.querySelectorAll(
    ".fiche, .tl, .pillar, .u-card, .reflect, .sec-head, .porte, .serie, .temp, .portrait"
  );

  if (prefersReduced) {
    // Mouvement réduit : tout en état final, aucune animation.
    revealables.forEach((el) => el.classList.add("in"));
    // Les animations SMIL (ondulations de l'eau) ne sont pas coupées par le CSS :
    // on fige la timeline de chaque SVG concerné.
    document.querySelectorAll("svg").forEach((s) => {
      if (typeof s.pauseAnimations === "function") s.pauseAnimations();
    });
  } else {
    // On suit le sens du scroll pour ne rejouer qu'en descendant.
    let lastY = window.scrollY;
    let dir = "down";
    window.addEventListener(
      "scroll",
      () => {
        const y = window.scrollY;
        if (y !== lastY) dir = y > lastY ? "down" : "up";
        lastY = y;
      },
      { passive: true }
    );

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          const el = en.target;
          if (en.isIntersecting) {
            if (dir === "down") {
              // descente → on rejoue (reflow forcé pour redémarrer la transition)
              el.classList.remove("in");
              void el.offsetWidth;
              el.classList.add("in");
            } else {
              // montée → apparition instantanée, sans animation
              el.classList.add("no-anim", "in");
              requestAnimationFrame(() => el.classList.remove("no-anim"));
            }
          } else {
            // sorti de l'écran → on réarme pour la prochaine descente
            el.classList.remove("in", "no-anim");
          }
        });
      },
      { threshold: 0.14 }
    );
    revealables.forEach((el) => io.observe(el));
  }

  /* --- 2. Scrollspy : lien de nav actif ------------------------------- */
  const sections = document.querySelectorAll("section[id]");
  const navLinks = Array.from(document.querySelectorAll("nav.links a"));
  const linkFor = (id) =>
    navLinks.find((a) => a.getAttribute("href") === "#" + id);

  if (sections.length && navLinks.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            navLinks.forEach((a) => a.classList.remove("active"));
            const link = linkFor(e.target.id);
            if (link) link.classList.add("active");
          }
        });
      },
      // la section est « active » quand elle occupe la bande centrale haute
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach((s) => spy.observe(s));
  }

  /* --- 3. Menu mobile (burger) ---------------------------------------- */
  const burger = document.querySelector(".burger");
  const nav = document.querySelector("nav.links");
  if (burger && nav) {
    const closeMenu = () => {
      nav.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
    };
    burger.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      burger.setAttribute("aria-expanded", String(open));
    });
    // un clic sur un lien referme le menu
    navLinks.forEach((a) => a.addEventListener("click", closeMenu));
    // échap referme aussi
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* --- 4. Barre de progression + header condensé ---------------------- */
  const progress = document.querySelector(".scroll-progress");
  const header = document.querySelector("header.bar");
  const toTop = document.querySelector(".to-top");

  function onScroll() {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const ratio = max > 0 ? doc.scrollTop / max : 0;
    if (progress) progress.style.transform = "scaleX(" + ratio + ")";
    if (header) header.classList.toggle("scrolled", doc.scrollTop > 24);
    if (toTop) toTop.classList.toggle("show", doc.scrollTop > 600);
  }
  // throttle léger via requestAnimationFrame
  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          onScroll();
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true }
  );
  onScroll();

  /* --- 5. Bouton « haut de page » ------------------------------------- */
  if (toTop) {
    toTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
    });
  }

  /* --- 6. Halo de lune en parallaxe (souris + scroll) ----------------- */
  if (!prefersReduced) {
    let mx = 0,
      my = 0;
    window.addEventListener(
      "mousemove",
      (e) => {
        // déplacement très léger : +/- ~18px max
        mx = (e.clientX / window.innerWidth - 0.5) * 36;
        my = (e.clientY / window.innerHeight - 0.5) * 36;
        document.body.style.setProperty("--hx", mx.toFixed(1) + "px");
        document.body.style.setProperty("--hy", my.toFixed(1) + "px");
      },
      { passive: true }
    );
  }

  /* --- 7. Lueur des fiches qui suit le curseur (coordonnées RELATIVES à la carte) --- */
  if (!prefersReduced && window.matchMedia("(pointer:fine)").matches) {
    document.querySelectorAll(".fiche").forEach((fiche) => {
      fiche.addEventListener("mousemove", (e) => {
        const r = fiche.getBoundingClientRect();
        fiche.style.setProperty("--mx", e.clientX - r.left + "px");
        fiche.style.setProperty("--my", e.clientY - r.top + "px");
      });
    });
  }

  /* Note : le formulaire d'inscription a été retiré (décision du 7 juin 2026).
     Le contact se fait désormais par e-mail uniquement. La logique sera reprise
     plus tard, branchée sur le mini-serveur K11. Voir backend/ (en pause). */

  /* --- 9. Compteur de visites (anonyme) ------------------------------- */
  // Activé une fois le backend en ligne (K11). Tant que l'URL n'est pas
  // configurée : aucun appel réseau, rien d'affiché → la promesse « zéro
  // mesure d'audience » reste vraie. Le jour J : coller l'URL ci-dessous
  // ET mettre à jour la page Confidentialité (cf. backend/README.md).
  const COUNTER_ENDPOINT = "REMPLACER_PAR_URL_COMPTEUR"; // ex. https://luntrae.fr/api/hit
  const visitsEl = document.getElementById("site-visits");
  const visitsCount = document.getElementById("visits-count");
  if (
    visitsEl &&
    visitsCount &&
    COUNTER_ENDPOINT !== "REMPLACER_PAR_URL_COMPTEUR"
  ) {
    fetch(COUNTER_ENDPOINT, { method: "POST" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && typeof data.count === "number") {
          visitsCount.textContent = data.count.toLocaleString("fr-FR");
          visitsEl.hidden = false;
        }
      })
      .catch(() => {
        /* échec silencieux : on n'affiche rien plutôt qu'un compteur cassé */
      });
  }
})();
