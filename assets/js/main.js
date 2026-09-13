/* ==========================================================================
   LUNTRAE, interactions
   Vanilla JS, sans dépendance. Mouvement doux, respect de prefers-reduced-motion.
   - reveals au scroll (IntersectionObserver)
   - menu mobile (burger)
   - barre de progression de lecture + header condensé
   - bouton « haut de page »
   - halo de lune en légère parallaxe (souris + scroll)
   - lueur des fiches qui suit le curseur
   ========================================================================== */
(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --- 1. Reveals au scroll (une seule fois par lecture de la page) --- */
  // Éléments révélés génériquement : on leur pose la classe .rv (opacité 0 puis .in)
  document
    .querySelectorAll(
      ".presente-inner, .univers-cta, .about-body h2, .about-body p, .about-body ul, .projet h2, .projet p, .projet .meta, " +
        ".cv-sec, .cv-head, .essai, .univers-prose h2, .univers-prose p, .credits, .loutres-intro, .encart, .about-head, .extrait-intro"
    )
    .forEach((el) => el.classList.add("rv"));
  const revealables = document.querySelectorAll(
    ".fiche, .tl, .pillar, .u-card, .reflect, .sec-head, .porte, .serie, .temp, .portrait, .loutre, .extrait, .nom-bloc, .rv"
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
    // Chaque élément n'est révélé qu'une fois par lecture de la page : une fois apparu, il reste
    // visible et n'est plus observé. Remonter puis redescendre ne rejoue rien (lot E3).
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          en.target.classList.add("in");
          obs.unobserve(en.target);
        });
      },
      { threshold: 0.14 }
    );
    revealables.forEach((el) => io.observe(el));
  }

  /* --- 1b. Ciel étoilé : semis discret de points bronze, scintillement lent --- */
  // Uniquement sur le fond obsidienne, derrière tout le contenu. Coupé sous prefers-reduced-motion.
  if (!prefersReduced && window.matchMedia("(min-width: 600px)").matches) {
    const ciel = document.createElement("canvas");
    ciel.className = "ciel";
    ciel.setAttribute("aria-hidden", "true");
    document.body.prepend(ciel);
    const ctx = ciel.getContext("2d");
    let stars = [];
    const seed = () => {
      ciel.width = window.innerWidth;
      ciel.height = window.innerHeight;
      const n = Math.min(70, Math.round((ciel.width * ciel.height) / 26000));
      stars = Array.from({ length: n }, () => ({
        x: Math.random() * ciel.width,
        y: Math.random() * ciel.height,
        r: 0.6 + Math.random() * 1.2,
        a: 0.08 + Math.random() * 0.14,
        p: Math.random() * Math.PI * 2,
        v: 0.0004 + Math.random() * 0.0006,
      }));
    };
    let last = 0;
    let actif = true;
    const draw = (t) => {
      if (!actif) return; // onglet caché : la boucle s'arrête, visibilitychange la relance
      if (t - last > 90) {
        last = t;
        ctx.clearRect(0, 0, ciel.width, ciel.height);
        for (const s of stars) {
          const k = 0.55 + 0.45 * Math.sin(s.p + t * s.v);
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(182,144,95," + (s.a * k).toFixed(3) + ")";
          ctx.fill();
        }
      }
      requestAnimationFrame(draw);
    };
    seed();
    window.addEventListener("resize", seed, { passive: true });
    document.addEventListener("visibilitychange", () => {
      const visible = !document.hidden;
      if (visible && !actif) {
        actif = true;
        requestAnimationFrame(draw);
      } else if (!visible) {
        actif = false;
      }
    });
    if (!document.hidden) requestAnimationFrame(draw);
    else actif = false;
  }

  /* --- 1c. Mots du H1 du hero, montée en cascade ----------------------- */
  const heroTitle = document.querySelector(".ha-left h1");
  if (heroTitle && !prefersReduced && heroTitle.children.length === 0) {
    const words = heroTitle.textContent.trim().split(/\s+/);
    heroTitle.textContent = "";
    words.forEach((w, i) => {
      const span = document.createElement("span");
      span.className = "w";
      span.style.setProperty("--i", i);
      span.textContent = w;
      heroTitle.append(span, document.createTextNode(" "));
    });
  }

  /* --- 1d. Fil d'eau : trait qui descend avec la lecture -------------- */
  const fil = document.querySelector(".fil-eau");
  if (fil && !prefersReduced) {
    const suivre = () => {
      const r = fil.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (window.innerHeight * 0.75 - r.top) / r.height));
      fil.style.setProperty("--fil", p.toFixed(3));
    };
    window.addEventListener("scroll", suivre, { passive: true });
    window.addEventListener("resize", suivre, { passive: true });
    suivre();
  }

  /* --- 1e. Sommaire ancré : replié sous 760 px, section en cours mise en évidence --- */
  const sommaire = document.querySelector(".sommaire");
  if (sommaire) {
    // replié seulement sur petit écran, où il repousserait le contenu sous la ligne de flottaison
    if (!window.matchMedia("(min-width: 760px)").matches) sommaire.open = false;
    const liens = Array.from(sommaire.querySelectorAll("a[href^='#']"));
    const cibles = liens.map((a) => document.getElementById(a.getAttribute("href").slice(1))).filter(Boolean);
    if (cibles.length && "IntersectionObserver" in window) {
      const marquer = (id) => liens.forEach((a) => a.classList.toggle("actif", a.getAttribute("href") === "#" + id));
      const obs = new IntersectionObserver(
        (entries) => { entries.forEach((en) => { if (en.isIntersecting) marquer(en.target.id); }); },
        { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
      );
      cibles.forEach((c) => obs.observe(c));
    }
  }

  /* --- 1f. Mesure d'audience : clic sur une adresse e-mail (acte de conversion) ---------- */
  // Par délégation sur le document, sans attribut onclick : tout lien mailto:, présent ou futur,
  // envoie l'événement « contact-email » à GoatCounter, avec la page d'origine en titre.
  // Sans GoatCounter (bloqueur, hors ligne), le lien fonctionne normalement.
  document.addEventListener("click", (e) => {
    const lien = e.target.closest && e.target.closest('a[href^="mailto:"]');
    if (!lien || !window.goatcounter || typeof window.goatcounter.count !== "function") return;
    window.goatcounter.count({
      path: "contact-email",
      title: "E-mail depuis " + window.location.pathname,
      event: true,
    });
  });

  /* --- 2. Liens de navigation (le scrollspy a été retiré : aucun onglet ne pointe vers une ancre) --- */
  const navLinks = Array.from(document.querySelectorAll("nav.links a"));

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

  /* --- 3b. Menu déroulant Projets ------------------------------------ */
  // Les liens existent déjà dans le HTML : le script ne fait qu'ouvrir ou
  // replier la liste (bouton, clic à l'extérieur, échap). Sans JS, le survol
  // et le focus clavier suffisent sur bureau.
  document.querySelectorAll("nav.links .has-sub").forEach((item) => {
    const toggle = item.querySelector(".sub-toggle");
    if (!toggle) return;
    const setOpen = (open) => {
      item.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
    };
    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      setOpen(!item.classList.contains("open"));
    });
    document.addEventListener("click", (e) => {
      if (!item.contains(e.target)) setOpen(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setOpen(false);
    });
  });

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
})();
