// Prépare la planche « PDF » exportée de Claude Design (planche.dc.html) pour WeasyPrint.
// Usage, depuis ce dossier :
//   node preparer.mjs
//   C:\msys64\mingw64\bin\weasyprint.exe sortie\planche.html sortie\planche.pdf
// Le script ne touche à aucun texte : il remplace les polices Google par les polices statiques du site,
// retire les scripts du composant doc-page, fixe la hauteur des deux pages et réécrit ce que WeasyPrint
// ne prend pas en charge (dégradés à deux positions, enfant absolu d'une grille, calcul flex du bandeau).
import fs from 'node:fs';

const SRC = 'planche.dc.html';
const SORTIE = 'sortie/planche.html';
const FONTS = '../../../assets/fonts/';
let s = fs.readFileSync(SRC, 'utf8');

// scripts et polices distantes retirés
s = s.replace(/<script[^>]*><\/script>/g, '').replace(/<link rel="preconnect"[^>]*>/g, '').replace(/<link href="https:\/\/fonts\.googleapis\.com[^>]*>/g, '');

// polices statiques du site (les instances variables imprimées par Chromium donnent des fontes Type 3, illisibles sur mobile)
const ff = (fam, w, st, file) => `@font-face{font-family:"${fam}";font-weight:${w};font-style:${st};src:url("${FONTS}${file}") format("woff2")}`;
const fonts = [
  ff('Cormorant Garamond', 400, 'normal', 'cormorant-garamond-400.woff2'),
  ff('Cormorant Garamond', 500, 'normal', 'cormorant-garamond-500.woff2'),
  ff('Cormorant Garamond', 600, 'normal', 'cormorant-garamond-600.woff2'),
  ff('Cormorant Garamond', 400, 'italic', 'cormorant-garamond-400-italic.woff2'),
  ff('Cormorant Garamond', 500, 'italic', 'cormorant-garamond-500-italic.woff2'),
  ff('Spectral', 300, 'normal', 'spectral-300.woff2'),
  ff('Spectral', 400, 'normal', 'spectral-400.woff2'),
  ff('Spectral', 500, 'normal', 'spectral-500.woff2'),
  ff('Spectral', 400, 'italic', 'spectral-400-italic.woff2'),
].join('\n');

// pages A4 sans marge ; 296.9 mm et non 297 : à la hauteur exacte, l'arrondi fait déborder la page 1 sur une page blanche
const base = [
  '@page{size:A4;margin:0;background:#FBFAF6}',
  'html,body{background:#FBFAF6;margin:0}',
  'doc-page{display:block;width:210mm}',
  'x-dc,helmet{display:block}',
  'section.page{width:210mm;height:296.9mm;box-sizing:border-box}',
].join('\n');
s = s.replace('<style>', `<style>\n${fonts}\n${base}\n`);
s = s.replace('doc-page:not(:defined){visibility:hidden}', '');

// images à côté de la planche, la sortie étant dans sortie/
s = s.replace(/src="(portrait\.jpg|embleme-web\.png)"/g, 'src="../$1"');

// dégradés : « couleur pos1 pos2 » devient « couleur pos1, couleur pos2 » (puces des listes, rayures du profil)
s = s.replace(/(#[0-9A-Fa-f]{3,6}|rgba?\([^)]*\))\s+(-?[\d.]+(?:mm|px|em|%)?)\s+(-?[\d.]+(?:mm|px|em|%))(?=\s*[,)])/g, '$1 $2, $1 $3');

// titre de l'en-tête sur une ligne
s = s.replace(`font-style:italic;font-size:13.5pt;color:#b6905f">Cheffe de projet numérique`, `font-style:italic;font-size:13.5pt;color:#b6905f;white-space:nowrap">Cheffe de projet numérique`);

// frise de formation : la ligne en position absolue sort de la grille (WeasyPrint la traiterait comme une cellule)
// et passe dans un bloc de hauteur nulle qui la précède (3.2 mm de marge + 6 mm = 9.2 mm)
const frise = /<div style="position:relative;margin-top:3.2mm;display:grid;(grid-template-columns:[^"]*)">\s*<div style="position:absolute;left:1.2mm;right:1.2mm;top:6mm;height:0.4mm;background:#8A6A4A">\s*<\/div>/;
if (!frise.test(s)) throw new Error('frise de formation introuvable');
s = s.replace(frise, '<div style="position:relative;height:0"><div style="position:absolute;left:1.2mm;right:1.2mm;top:9.2mm;height:0.4mm;background:#8A6A4A"></div></div>\n    <div style="position:relative;margin-top:3.2mm;display:grid;$1">');

// filet du titre FORMATION : WeasyPrint perd l'alignement sur la ligne de base de cet élément vide, on le cale en bas
const filet = '<div style="flex:1;height:1px;background:rgba(138,106,74,0.5)">';
if (!s.includes(filet)) throw new Error('filet FORMATION introuvable');
s = s.replace(filet, '<div style="flex:1;height:1px;background:rgba(138,106,74,0.5);align-self:flex-end;margin-bottom:1.2mm">');

// lien de la carte Méthode de repositionnement : sur une ligne comme dans la planche d'origine
s = s.replace('<a href="https://luntrae.fr/projets/methode-repositionnement" style="color:#101820;text-decoration:none">', '<a href="https://luntrae.fr/projets/methode-repositionnement" style="color:#101820;text-decoration:none;white-space:nowrap">');

// page 02 : le bandeau Formation et le pied de page sont calés en bas par positionnement absolu ;
// en colonne flex, WeasyPrint surestime la hauteur de la frise (deux lignes de trop) et laisse un vide crème au-dessus du pied de page
const i2 = s.indexOf('data-screen-label="02"');
if (i2 < 0) throw new Error('page 02 introuvable');
let tail = s.slice(i2);
const ancre = '<div style="position:relative;margin:2.5mm 0 0;flex:none">';
if (!tail.includes('display:flex;flex-direction:column;overflow:hidden"') || !tail.includes(ancre)) throw new Error('structure de la page 02 inattendue');
tail = tail.replace('display:flex;flex-direction:column;overflow:hidden"', 'display:block;position:relative;overflow:hidden"');
tail = tail.replace(ancre, '<div style="position:absolute;left:0;right:0;bottom:0">' + ancre);
tail = tail.replace(/(<\/div>\s*)(<\/section>)/, '$1</div>\n$2');
s = s.slice(0, i2) + tail;

// métadonnées du document PDF (titre, auteur, sujet)
s = s.replace(/<title>[^<]*<\/title>/, '').replace('<meta charset="utf-8">', '<meta charset="utf-8">\n<title>CV de Camille Sauton, cheffe de projet numérique</title>\n<meta name="author" content="Camille Sauton">\n<meta name="description" content="Parcours, compétences et projets de Camille Sauton, cheffe de projet numérique en Charente-Maritime.">');

fs.mkdirSync('sortie', { recursive: true });
fs.writeFileSync(SORTIE, s);
console.log(`${SORTIE} écrit ; dégradés réécrits : ${(s.match(/, (?:#[0-9A-Fa-f]{3,6}|rgba?\([^)]*\)) -?[\d.]+(?:mm|px|em|%)\)/g) || []).length}`);
