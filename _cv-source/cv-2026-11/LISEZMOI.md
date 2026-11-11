# CV général « Cheffe de projets à impact »

Source du CV téléchargeable de luntrae.fr, gabarit du 11 novembre 2026. Le contenu est celui du brief `Brief_Code_CV_site_2026-11-11.md`, section 2, repris tel quel, puis du brief de repasse `Brief_Code_CV_repasse_2026-11-11.md` pour les cartes projet, le bloc Outils et langues et la disposition de la page 2.

## Fichiers

- `CV_Camille_Sauton.html` : la source, deux pages A4. Tout le texte du CV est là, et seulement là.
- `ressources/` : portrait, emblème, polices Cormorant Garamond et Spectral.
- `ressources/polices/cormorant-garamond-600-titre.woff2` : police de titrage, fabriquée par `outils/police_titre.py`.
- `outils/verifier_textes.mjs` : contrôle du PDF contre le contenu figé du brief.
- `outils/nettoyer_images.mjs` : retire les métadonnées de provenance des images, sans les réencoder.
- `sortie/` et `CV_Camille_Sauton.pdf` : fichiers produits, hors dépôt.

## Fabrication

Depuis ce dossier, sous Windows avec WeasyPrint installé dans MSYS2 :

```
C:\msys64\mingw64\bin\weasyprint.exe CV_Camille_Sauton.html CV_Camille_Sauton.pdf
```

## Contrôles avant diffusion

```
C:\msys64\mingw64\bin\pdffonts.exe CV_Camille_Sauton.pdf
C:\msys64\mingw64\bin\pdfinfo.exe CV_Camille_Sauton.pdf
C:\msys64\mingw64\bin\pdftotext.exe CV_Camille_Sauton.pdf sortie\CV_Camille_Sauton.txt
node outils\verifier_textes.mjs <brief> sortie\CV_Camille_Sauton.txt CV_Camille_Sauton.html <brief de repasse>
```

1. `pdffonts` : six polices, toutes `CID TrueType`, `emb yes`, aucune Type 3.
2. `pdfinfo` : titre `Camille Sauton · CV`, autrice `Camille Sauton`, deux pages A4.
3. `verifier_textes` : aucun texte manquant, aucune ligne réservée à la page du site, ordre de lecture conforme.
4. Aucune ligne du texte extrait ne finit par un trait d'union.
5. Ouvrir le PDF sur iPhone et sur Android.

## Règles de mise en page à ne pas casser

Le texte extrait par `pdftotext` (et par les lecteurs de CV automatisés qui raisonnent de la même façon) doit se lire dans l'ordre du CV. Cet ordre dépend de la mise en page, pas seulement de l'ordre du HTML. Huit règles le garantissent.

1. **Un titre de bloc a le même corps nominal que son texte.** Les titres `h3` et les dates de la frise utilisent la police de titrage, dont le cadratin est réduit : 9 pt nominal se dessine comme 11 pt, 9,4 pt comme 11,5 pt. L'extracteur regroupe ainsi le titre et son contenu en un seul bloc. Un titre composé dans la police normale à 11 pt redevient un bloc séparé, et les titres d'une rangée sortent alors tous avant leurs contenus.
2. **Pas d'écart vertical à l'intérieur d'un bloc.** Entre deux lignes d'une même carte ou d'une même cellule, la distance entre lignes de base reste sous 13,5 pt. Concrètement : interlignes de 11,4 à 12,6 pt, marges internes de 0,5 mm au plus, lien des cartes à 8,6 pt au moins.
3. **Les grilles sont alignées.** Cartes projet, expériences antérieures et compétences sont des grilles dont les cellules partagent le même bord gauche et le même haut de rangée. C'est ce qui les fait lire rangée par rangée. Le bloc Outils et langues est pour cela une liste comme les autres.
4. **La frise Formation est une vraie colonne de grille, à droite des projets.** Elle se lit d'un tenant après eux. Ne rien placer en position absolue qui contienne du texte.
5. **Le pied de page est groupé à droite.** Placé à gauche, il s'intercale avant la colonne de droite dans le texte extrait.
6. **Aucune coupure de ligne sur un trait d'union.** L'extracteur recolle les deux moitiés et supprime le trait. Le lien de la Méthode de repositionnement est coupé après la barre oblique par un retour à la ligne explicite.
7. **La dernière entrée de la frise descend au niveau de la ligne « Plus de projets ».** Les entrées sont réparties sur toute la hauteur de la colonne. Si cette ligne n'avait plus de texte à sa droite, l'extracteur la lirait après la Formation.
8. **Les décors ne contiennent aucun texte.** Taches des titres de compétences, gouttes, forme obsidienne et pictogramme Instagram sont des tracés SVG marqués `aria-hidden`. Le titre et sa liste restent dans le même conteneur, la tache est posée derrière le texte.

Après toute retouche de mise en page, relancer les contrôles : l'ordre de lecture se vérifie, il ne se déduit pas.

## Images

Les images reçues d'un outil de conception peuvent porter un bloc de métadonnées de provenance (C2PA) qui nomme cet outil, et WeasyPrint recopie ce bloc dans le PDF. Avant d'utiliser une nouvelle image :

```
node outils\nettoyer_images.mjs ressources\portrait.jpg ressources\embleme-web.png
```

Le script retire le bloc sans réencoder l'image.

## Police de titrage

```
C:\msys64\mingw64\bin\python3.exe outils\police_titre.py
```

Le script fige Cormorant Garamond à la graisse 600 et réduit son cadratin de 1000 à 818 unités. Les dessins des lettres ne changent pas.
