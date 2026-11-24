# luntrae.fr

Site personnel de Camille Sauton, cheffe de projets à impact à Rochefort. LUNTRAE est l'écosystème qui rassemble ses projets numériques, entrepreneuriaux et de création. Le site est écrit à la main en HTML, CSS et JavaScript, sans générateur ni dépendance, et publié par GitHub Pages depuis la branche `main`.

Mantra : Des systèmes pour des futurs plus doux.

## Principes

- Aucun cookie et aucune collecte de données personnelles par le site lui-même. La mesure d'audience passe par GoatCounter, sans cookie ni identifiant. Un seul formulaire : Le Q, questionnaire anonyme géré par Tally et intégré à la page `/le-q/`.
- Polices auto-hébergées (Cormorant Garamond et Spectral, sous-ensembles latin), aucune requête vers un service tiers hormis le script d'audience et, sur la seule page `/le-q/`, le script et le cadre du formulaire Tally.
- Fond obsidienne `#101820`, bronze pour les accents, blanc lunaire pour le texte. La référence est la charte d'identité V4, tenue hors dépôt.
- Aucun tiret cadratin ni demi-cadratin dans les fichiers, aucun caractère invisible. Un H1 par page, aucun niveau de titre sauté.
- Fins de ligne en LF partout (`.gitattributes`).

## Arborescence des pages

Dix-huit pages publiques et une page d'erreur, toutes indexables sauf la 404. La page de liens est absente du plan du site : elle sert de point d'entrée depuis la bio Instagram.

| URL | Fichier | Contenu |
|---|---|---|
| `/` | `index.html` | Accueil : bandeau « À la une » en tête de page, hero sur l'ambiance nocturne, présentation, quatre piliers de l'approche, réflexion sur l'attention, trois portes vers les projets, les séries et la liste des projets. Porte la fiche `Person` complète. |
| `/a-propos/` | `a-propos/index.html` | La créatrice : bloc d'ouverture, parcours, façon de travailler, projets reliés, ce qui l'inspire, ce qui l'intéresse aujourd'hui. Photo en tête, bouton vers le CV. |
| `/cv/` | `cv/index.html` | CV en ligne, version développée du PDF : profil, expérience, compétences sur panneau crème (outils et langues compris), formation en frise, veille et centres d'intérêt, approche créative, puis les projets en fiches courtes qui renvoient vers leurs pages. Sommaire ancré, téléchargement du résumé PDF. |
| `/univers/` | `univers/index.html` | L'Univers LUNTRAE : pourquoi il existe, le nom (lutra et luna), la loutre, la lune, l'eau, les couleurs, la position sur les outils IA, quatre espèces de loutre en planches naturalistes, crédits. Sommaire ancré. |
| `/projets/` | `projets/index.html` | Index des sept projets, fiches courtes avec statut, encart sur l'apprentissage du code. |
| `/projets/projet-confidentiel/` | `projets/projet-confidentiel/index.html` | Projet numérique d'engagement éthique en conception : organisation, quatre arbitrages, livrables, suite. Rien de son contenu n'est dévoilé. |
| `/projets/geneapop/` | `projets/geneapop/index.html` | Application web de généalogie interactive développée en solo : point de départ, fonctions, méthode, deux moments du projet, état d'avancement. |
| `/projets/luntrae/` | `projets/luntrae/index.html` | Conception et déploiement de cet écosystème : décisions techniques et éditoriales, suite prévue. |
| `/projets/kintara-ceramics/` | `projets/kintara-ceramics/index.html` | Direction stratégique bénévole d'une marque de céramique d'art : lisibilité de l'offre, diversification, dossier produit. |
| `/projets/le-gentle/` | `projets/le-gentle/index.html` | Conception et modélisation d'un tiers-lieu calme à vocation solidaire, du concept au dossier chiffré. |
| `/projets/methode-repositionnement/` | `projets/methode-repositionnement/index.html` | Méthode de repositionnement professionnel en onze étapes, testée sur trois parcours, témoignage de sa circulation. |
| `/projets/leax/` | `projets/leax/index.html` | Léax, roman en cours et construction d'un univers mythologique. |
| `/series/` | `series/index.html` | Séries éditoriales : pourquoi regarder du côté de l'art, L'Observatoire (lancée) et L'Atelier (à venir), extrait du premier épisode. |
| `/contact/` | `contact/index.html` | Page Contact : ce qui intéresse Camille, comment la joindre (une adresse, pas de formulaire), ce qu'on peut consulter avant. |
| `/le-q/` | `le-q/index.html` | Le Q, le questionnaire de LUNTRAE : formulaire Tally intégré, avec sa couverture et sa barre de progression. Le titre de la page est présent pour les lecteurs d'écran et les moteurs de recherche, masqué à l'écran. |
| `/mentions-legales.html` | `mentions-legales.html` | Mentions légales : éditrice, hébergeur, nom de domaine, propriété intellectuelle, données personnelles. |
| `/confidentialite.html` | `confidentialite.html` | Confidentialité : mesure d'audience sans cookie, hébergeur, réponses au Q, e-mail, droits, date de mise à jour. |
| `/liens/` | `liens/index.html` | Page de liens pour la bio Instagram : le logo, puis une scène nocturne au bord d'un bassin où trois scènes de loutres portent trois liens (Le Q, le site, les projets). Pas de menu, pied de page réduit. Détails plus bas. |
| 404 | `404.html` | Page introuvable, en `noindex`, avec des chemins de sortie vers les projets, À propos et Contact. |

Chaque page projet se termine par un bloc « Projet suivant » qui boucle sur les sept dans l'ordre de l'index, puis par le retour à l'index. Le bloc contact de pied de page est présent sur les treize pages de contenu.

## Fichiers

```
assets/css/styles.css      feuille de styles du site
assets/css/liens.css       styles de la page de liens, chargés par elle seule, après styles.css
assets/js/main.js          interactions : révélation au défilement, ciel étoilé, menu, sommaires,
                           fil d'eau, mesure des clics (délégation, sans attribut en ligne)
assets/js/liens.js         scènes animées de la page de liens
assets/fonts/              Cormorant Garamond 400, 500, 600, italiques 400 et 500 ; Spectral 300, 400, 500, italique 400
assets/img/                images du site en WebP, favicon, image Open Graph
assets/img/le-q/           gabarit du bandeau « À la une » de l'accueil : sans texte, en 1584 et 900 px, recadrage mobile
assets/img/loutres/        quatre planches naturalistes en 1400 et 700 px
assets/img/series/         visuels des séries et cartes du premier épisode
assets/img/liens/          page de liens : décor (deux poids), badge Le Q, et les suites d'images des loutres
                           dans otters/ (q-duo, site-swimmer, projects)
assets/cv/                 PDF du CV téléchargeable
_cv-source/                source HTML du CV (cv-2026-11), scripts de contrôle, anciennes chaînes
                           de fabrication, notices (non publié)
.github/                   rapport d'audience quotidien (Action GitHub, GoatCounter vers Brevo)
sitemap.xml, robots.txt, site.webmanifest, CNAME
```

Les dossiers commençant par un tiret bas ne sont pas publiés par GitHub Pages. Les fichiers sources lourds (PNG d'origine, export complet de Claude Design) restent sur le disque et sont ignorés par git.

Le PDF du CV, `assets/cv/CV_Camille_Sauton.pdf`, est produit par WeasyPrint depuis `_cv-source/cv-2026-11/CV_Camille_Sauton.html`, avec les polices du site embarquées, afin de s'afficher sur mobile et de se lire dans le bon ordre par les lecteurs de CV automatisés ; la notice est dans `_cv-source/cv-2026-11/LISEZMOI.md`.

## À la une et Le Q

Le bandeau « À la une » de l'accueil suit un gabarit (`.une` dans la feuille de styles) : une image sans texte et un texte en HTML posé dans sa zone libre, qui passe sous l'image sur écran étroit. La page Le Q n'a plus de bannière du site : la couverture du formulaire en tient lieu.

Le formulaire est intégré avec le code « Standard » de Tally. Le champ caché `source` vaut `site` par défaut ; un paramètre `?source=…` dans l'adresse de la page est transmis par le script de Tally et l'emporte (vérifié le 22 novembre 2026 : avec `?source=instagram`, Tally enregistre `instagram`).

## Page de liens

`/liens/` est une page à part : elle n'a ni le menu ni le pied de page complet du site, et ses styles sont dans `assets/css/liens.css`.

- Le décor est une image fixe (`fond-maitre.webp` sur grand écran, `fond-maitre-mobile.webp`, plus léger, sur écran étroit). Tout se place dans son repère, 1672 x 941 : sur grand écran la scène entière, sur écran étroit trois vues empilées, chacune cadrée sur sa zone.
- Les trois liens sont de vrais liens : sans script, ou en animations réduites, la page est complète et immobile.
- Chaque scène est une suite d'images WebP jouée par `assets/js/liens.js`, à quinze images par seconde.
- Avec une souris : la loutre du bassin émerge au chargement ; au survol ou au focus d'un lien, sa scène se joue ; sans survol, les trois scènes se jouent tour à tour, trois fois au plus, puis la page reste immobile.
- Sur écran tactile : les trois scènes partent seules, Le Q d'abord, le site 2 secondes après, les projets 2 secondes après le site ; puis 6 secondes de pause et l'enchaînement reprend, trois boucles au plus. Toucher une scène ouvre son lien à tout moment.
- Les suites d'images pèsent 5 Mo en tout. Elles sont chargées après l'affichage de la page : avec une souris, celles du bassin d'abord ; sur écran tactile, dans l'ordre des scènes, une loutre après l'autre. Tant qu'une suite n'est pas arrivée, sa loutre garde sa pose de repos.
- Le premier lien mène à `/le-q/`. Quand Le Q fermera, c'est ce lien, son badge (`badge-le-q.webp`) et la scène des deux loutres qu'il faudra revoir ; les deux autres scènes n'en dépendent pas.
- Partage : la page a son titre (« Petit coin des liens · LUNTRAE »), sa description et sa vignette, `assets/img/petit-coin-des-liens-partage.jpg`. Cette vignette reste en JPG, sans métadonnées : certains réseaux n'affichent pas le WebP en aperçu.

## Mesure d'audience

GoatCounter compte les vues de chaque page par son chemin. Quatre événements sont envoyés par le script, chacun suffixé du chemin de la page d'origine, ce qui donne une ligne par page dans le tableau de bord :

- `contact-email/…` : clic sur une adresse e-mail
- `cv-telechargement/…` : téléchargement du PDF du CV
- `clic-instagram/…` et `clic-linkedin/…` : liens sortants

## Travailler en local

Aucune installation nécessaire pour lire les pages. Pour les servir avec les bonnes URL, n'importe quel serveur statique à la racine du dépôt convient, par exemple un petit script Node. Les contrôles utilisés lors de la refonte (caractères interdits, hiérarchie des titres, métadonnées, sitemap, liens) sont des scripts Node à rapatrier dans un dossier `_outils/`.

## Données structurées

`Person` déclarée une fois sur l'accueil et référencée par identifiant ailleurs, `WebSite`, `ProfilePage` sur À propos et CV, `ContactPage`, `CreativeWork` avec mots-clés sur chaque page projet, `BreadcrumbList` sur les pages profondes.

## Mise en ligne

La branche `main` est publiée automatiquement par GitHub Pages sur `luntrae.fr`. Le travail se fait sur une branche dédiée, lot par lot, avec un commit et un tag par lot, et une recette avant fusion.

LUNTRAE · Camille Sauton · Mis à jour en novembre 2026
