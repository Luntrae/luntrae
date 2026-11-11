# Fabrique la police de titrage du CV : Cormorant Garamond 600 dont le cadratin est réduit.
# Les glyphes sont identiques, mais plus grands à corps nominal égal : 9 pt nominal donne 11 pt à l'oeil.
# But : les titres de bloc ont le même corps nominal que le texte courant (9 pt), ce qui permet aux
# extracteurs de texte (pdftotext, lecteurs de CV automatisés) de lire titre et contenu comme un seul bloc.
# Usage, depuis le dossier du CV :
#   C:\msys64\mingw64\bin\python3.exe outils\police_titre.py
import sys
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

SOURCE = 'ressources/polices/cormorant-garamond-600.woff2'
SORTIE = 'ressources/polices/cormorant-garamond-600-titre.woff2'
CADRATIN = 818  # 1000 x 9 / 11 : 9 pt nominal se dessine comme 11 pt

police = TTFont(SOURCE)
print('tables :', ' '.join(sorted(police.keys())))
if 'fvar' in police:
    axes = {a.axisTag: (a.minValue, a.defaultValue, a.maxValue) for a in police['fvar'].axes}
    print('axes variables :', axes)
    police = instancer.instantiateVariableFont(police, {'wght': 600})
print('cadratin d origine :', police['head'].unitsPerEm)
police['head'].unitsPerEm = CADRATIN
for nom in police['name'].names:
    texte = nom.toUnicode()
    if nom.nameID in (1, 16):
        nom.string = 'Cormorant Garamond Titre'
    elif nom.nameID == 2:
        nom.string = 'SemiBold'
    elif nom.nameID == 4:
        nom.string = 'Cormorant Garamond Titre SemiBold'
    elif nom.nameID == 6:
        nom.string = 'CormorantGaramondTitre-SemiBold'
    elif nom.nameID == 17:
        nom.string = 'SemiBold'
if 'OS/2' in police:
    police['OS/2'].usWeightClass = 600
police.flavor = 'woff2'
police.save(SORTIE)
verif = TTFont(SORTIE)
print('ecrit :', SORTIE, '| cadratin', verif['head'].unitsPerEm, '| graisse', verif['OS/2'].usWeightClass, '| variable :', 'fvar' in verif, '| glyphes', len(verif.getGlyphOrder()))
