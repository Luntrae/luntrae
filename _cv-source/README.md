# Source du CV imprimable

Le PDF téléchargeable `assets/cv/CV_Camille_Sauton_cheffe_de_projet_numerique.pdf` est, depuis le 12 septembre 2026, la version retravaillée dans Claude Design par Camille Sauton. Sa source (HTML et portrait) est rangée dans `design/`, hors dépôt git en raison de son poids.

Ce dossier conserve aussi la chaîne WeasyPrint de secours, qui produit un PDF de même contenu à partir de `cv.html` et `cv.css`, polices embarquées depuis `assets/fonts/`.

## Fabrication de la version WeasyPrint

Depuis la passe 2 (lot D), le corps de cette version est à 9 points minimum, listes comprises, et le document tient en deux pages sans coupe. La sortie de test va dans `sortie/` (hors dépôt) :

```
C:\msys64\mingw64\bin\weasyprint.exe cv.html sortie\CV_weasyprint_9pt.pdf
```

Pour en faire le PDF téléchargeable, le copier sous `assets/cv/CV_Camille_Sauton_cheffe_de_projet_numerique.pdf` et mettre à jour le poids sur le bouton de `cv/index.html`.

Pour produire directement le fichier téléchargeable, depuis ce dossier, sous Windows avec WeasyPrint installé dans MSYS2 :

```
C:\msys64\mingw64\bin\weasyprint.exe cv.html ..\assets\cv\CV_Camille_Sauton_cheffe_de_projet_numerique.pdf
```

## Contrôles avant livraison, quelle que soit la chaîne

1. `pdffonts` : toutes les polices marquées `emb yes`.
2. Texte extrait sans tiret cadratin ni caractère U+263E.
3. Deux pages, fond blanc peint.
4. Le pied de page porte `LUNTRAE · Camille Sauton · 2026` et la pagination.
5. Mettre à jour le poids indiqué sur le bouton de `cv/index.html`.

Ce dossier commence par un tiret bas : GitHub Pages ne le publie pas.
