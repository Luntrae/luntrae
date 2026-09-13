# luntrae.fr

Site personnel de Camille Sauton, cheffe de projet numérique à Rochefort. LUNTRAE est l'écosystème qui rassemble ses projets numériques, entrepreneuriaux et de création. Le site est écrit à la main en HTML, CSS et JavaScript, sans générateur ni dépendance, et publié par GitHub Pages depuis la branche `main`.

Mantra : Des systèmes pour des futurs plus doux.

## Principes

- Aucun cookie, aucun formulaire, aucune collecte de données personnelles. La mesure d'audience passe par GoatCounter, sans cookie ni identifiant.
- Polices auto-hébergées (Cormorant Garamond et Spectral, sous-ensembles latin), aucune requête vers un service tiers hormis le script d'audience.
- Fond obsidienne `#101820`, bronze pour les accents, blanc lunaire pour le texte. La référence est la charte d'identité V4, tenue hors dépôt.
- Aucun tiret cadratin ni demi-cadratin dans les fichiers, aucun caractère invisible. Un H1 par page, aucun niveau de titre sauté.
- Fins de ligne en LF partout (`.gitattributes`).

## Arborescence des pages

Seize pages publiques et une page d'erreur, toutes indexables sauf la 404.

| URL | Fichier | Contenu |
|---|---|---|
| `/` | `index.html` | Accueil : hero sur l'ambiance nocturne, présentation, quatre piliers de l'approche, réflexion sur l'attention, trois portes vers les projets, les séries et la liste des projets. Porte la fiche `Person` complète. |
| `/a-propos/` | `a-propos/index.html` | La créatrice : métier actuel, parcours, façon de travailler, projets reliés, centres d'intérêt, ce qui l'intéresse aujourd'hui. Photo en tête, bouton vers le CV. |
| `/cv/` | `cv/index.html` | CV en ligne : profil, projets, compétences, expérience, formation en frise, outils, langues, veille, approche créative. Sommaire ancré, téléchargement du PDF. |
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
| `/mentions-legales.html` | `mentions-legales.html` | Mentions légales : éditrice, hébergeur, nom de domaine, propriété intellectuelle, données personnelles. |
| `/confidentialite.html` | `confidentialite.html` | Confidentialité : mesure d'audience sans cookie, e-mail, droits. |
| 404 | `404.html` | Page introuvable, en `noindex`, avec des chemins de sortie vers les projets, À propos et Contact. |

Chaque page projet se termine par un bloc « Projet suivant » qui boucle sur les sept dans l'ordre de l'index, puis par le retour à l'index. Le bloc contact de pied de page est présent sur les treize pages de contenu.

## Fichiers

```
assets/css/styles.css      feuille de styles unique
assets/js/main.js          interactions : révélation au défilement, ciel étoilé, menu, sommaires,
                           fil d'eau, mesure des clics (délégation, sans attribut en ligne)
assets/fonts/              Cormorant Garamond 400, 500, 600, italiques 400 et 500 ; Spectral 300, 400, 500, italique 400
assets/img/                images du site en WebP, favicon, image Open Graph
assets/img/loutres/        quatre planches naturalistes en 1400 et 700 px
assets/img/series/         visuels des séries et cartes du premier épisode
assets/cv/                 PDF du CV téléchargeable
_cv-source/                planche Claude Design du CV, script de préparation pour WeasyPrint,
                           chaîne de secours HTML et CSS, notice (non publié)
.github/                   rapport d'audience quotidien (Action GitHub, GoatCounter vers Brevo)
sitemap.xml, robots.txt, site.webmanifest, CNAME
```

Les dossiers commençant par un tiret bas ne sont pas publiés par GitHub Pages. Les fichiers sources lourds (PNG d'origine, export complet de Claude Design) restent sur le disque et sont ignorés par git.

Le PDF du CV est produit par WeasyPrint depuis la planche Claude Design de `_cv-source/planche/`, avec les polices du site embarquées, afin de s'afficher sur mobile ; la notice est dans `_cv-source/README.md`.

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

LUNTRAE · Camille Sauton · Mis à jour en septembre 2026
