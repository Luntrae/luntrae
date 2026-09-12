# Source du CV imprimable

Le PDF téléchargeable `assets/cv/CV_Camille_Sauton_cheffe_de_projet_numerique.pdf` est produit à partir de ce dossier avec WeasyPrint, polices embarquées depuis `assets/fonts/`.

- `cv.html` : contenu, identique à la page `/cv/` du site.
- `cv.css` : mise en page A4 sur fond blanc, couleurs de la charte en touches, croissant en tracé vectoriel.
- `camille_croquis-bronze.jpg` : portrait au traitement croquis, déclinaison pour l'impression.

## Fabrication

Depuis ce dossier, sous Windows avec WeasyPrint installé dans MSYS2 :

```
C:\msys64\mingw64\bin\weasyprint.exe cv.html ..\assets\cv\CV_Camille_Sauton_cheffe_de_projet_numerique.pdf
```

## Contrôles avant livraison

1. `pdffonts` : toutes les polices marquées `emb yes`.
2. Texte extrait sans tiret cadratin ni caractère U+263E.
3. Deux pages, fond blanc peint (vérifier avec `pdftocairo -png -transp`).
4. Le pied de page porte `LUNTRAE · Camille Sauton · 2026` et la pagination.
5. Mettre à jour le poids indiqué sur le bouton de `cv/index.html`.

Ce dossier commence par un tiret bas : GitHub Pages ne le publie pas.
