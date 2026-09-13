# Source du CV téléchargeable

Le PDF téléchargeable `assets/cv/CV_Camille_Sauton_cheffe_de_projet_numerique.pdf` est produit par WeasyPrint depuis la planche Claude Design du dossier `planche/`, avec les polices statiques du site embarquées en CID TrueType. Les exports PDF faits par le navigateur (Chromium) impriment les polices variables en fontes Type 3, qui s'affichent vides sur iPhone et sans photo sur Android : c'est pour cela que la planche passe par WeasyPrint.

Ce dossier commence par un tiret bas : GitHub Pages ne le publie pas.

## Dossier `planche/`, chaîne en service

- `planche.dc.html` : la planche « PDF » telle qu'exportée de Claude Design (archive « CV Camille Sauton.zip », artboard `CV Camille Sauton - PDF.dc.html`). Le texte du CV est là, et seulement là.
- `portrait.jpg`, `embleme-web.png` : les deux images référencées par la planche.
- `preparer.mjs` : script Node qui écrit `sortie/planche.html`, la version prête pour WeasyPrint. Il ne modifie aucun texte. Il remplace les polices Google par celles de `assets/fonts/`, retire les scripts du composant `doc-page`, fixe la hauteur des deux pages et réécrit ce que WeasyPrint ne prend pas en charge : dégradés à deux positions (puces des listes, rayures du profil), ligne de la frise de formation placée en absolu dans une grille, alignement du filet du titre Formation, et calage en bas du bandeau Formation de la page 2.
- `sortie/` : fichiers produits, hors dépôt.

Fabrication, depuis `_cv-source/planche/`, sous Windows avec Node et WeasyPrint installé dans MSYS2 :

```
node preparer.mjs
C:\msys64\mingw64\bin\weasyprint.exe sortie\planche.html sortie\planche.pdf
```

Puis copier `sortie/planche.pdf` sous `assets/cv/CV_Camille_Sauton_cheffe_de_projet_numerique.pdf` et mettre à jour le poids indiqué sur le bouton de `cv/index.html`.

Pour une nouvelle version de la planche, remplacer `planche.dc.html` et les images, relancer les deux commandes, puis vérifier le rendu page par page : le script s'arrête avec une erreur si la structure attendue (frise, filet, page 02) n'est pas retrouvée.

Le titre du document PDF, son auteur et son sujet sont posés par le script dans l'en-tête HTML.

## Chaîne de secours : `cv.html` et `cv.css`

Version HTML et CSS écrite à la main, corps à 9 points minimum, deux pages, même texte que la planche à sa date. Elle n'est plus publiée depuis le 13 septembre 2026 mais reste utilisable si la planche ne peut pas être régénérée :

```
C:\msys64\mingw64\bin\weasyprint.exe cv.html sortie\CV_weasyprint_9pt.pdf
```

`camille_croquis-bronze.jpg` est l'image de cette version.

## Contrôles avant livraison, quelle que soit la chaîne

1. `pdffonts` : toutes les polices en `CID TrueType`, `emb yes`, aucune fonte Type 3.
2. `pdfinfo` : Producer WeasyPrint, titre `CV de Camille Sauton, cheffe de projet numérique`, deux pages A4.
3. Texte extrait identique à la planche d'origine, liens conservés (six liens vers luntrae.fr), sans tiret cadratin ni caractère U+263E.
4. Le pied de page porte `LUNTRAE · Camille Sauton · 2026` et la pagination.
5. Poids sous 500 Ko sans compression, puis mettre à jour le poids indiqué sur le bouton de `cv/index.html`.
6. Ouvrir le PDF sur iPhone et sur Android.
