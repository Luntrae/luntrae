// Retire des images du CV les blocs de métadonnées de provenance (C2PA / JUMBF, paquets XMP),
// sans réencoder : les pixels restent strictement identiques.
// Raison : ces blocs nomment l'outil par lequel le fichier a transité, et ils sont recopiés tels quels
// dans le PDF. Le brief demande qu'aucun outil ne soit nommé dans les métadonnées, PDF compris.
// Usage, depuis le dossier du CV : node outils/nettoyer_images.mjs ressources/portrait.jpg ressources/embleme-web.png
import fs from 'node:fs';

function nettoyerJpeg(buf) {
  const morceaux = [buf.subarray(0, 2)]; // SOI
  const retires = [];
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xff) throw new Error('JPEG : marqueur attendu à ' + i);
    const marqueur = buf[i + 1];
    if (marqueur === 0xda) { morceaux.push(buf.subarray(i)); break; } // début des données d'image : tout le reste est gardé
    const longueur = buf.readUInt16BE(i + 2);
    const segment = buf.subarray(i, i + 2 + longueur);
    const entete = segment.subarray(4, 40).toString('latin1');
    const estJumbf = marqueur === 0xeb;                                   // APP11 : JUMBF, porteur du manifeste C2PA
    const estXmp = marqueur === 0xe1 && entete.startsWith('http://ns.adobe.com/xap/1.0/');
    if (estJumbf || estXmp) retires.push(`${estJumbf ? 'APP11 (JUMBF)' : 'APP1 (XMP)'} ${segment.length} octets`);
    else morceaux.push(segment);
    i += 2 + longueur;
  }
  return { sortie: Buffer.concat(morceaux), retires };
}

function nettoyerPng(buf) {
  const morceaux = [buf.subarray(0, 8)];
  const retires = [];
  let i = 8;
  while (i < buf.length) {
    const longueur = buf.readUInt32BE(i);
    const type = buf.subarray(i + 4, i + 8).toString('latin1');
    const bloc = buf.subarray(i, i + 12 + longueur);
    const estXmp = type === 'iTXt' && bloc.subarray(8, 30).toString('latin1').startsWith('XML:com.adobe.xmp');
    if (type === 'caBX' || estXmp) retires.push(`${type} ${bloc.length} octets`);
    else morceaux.push(bloc);
    i += 12 + longueur;
  }
  return { sortie: Buffer.concat(morceaux), retires };
}

for (const chemin of process.argv.slice(2)) {
  const buf = fs.readFileSync(chemin);
  const estJpeg = buf[0] === 0xff && buf[1] === 0xd8;
  const estPng = buf.subarray(1, 4).toString('latin1') === 'PNG';
  if (!estJpeg && !estPng) { console.log(`${chemin} : format non pris en charge, fichier laissé tel quel`); continue; }
  const { sortie, retires } = estJpeg ? nettoyerJpeg(buf) : nettoyerPng(buf);
  if (retires.length) fs.writeFileSync(chemin, sortie);
  console.log(`${chemin} : ${buf.length} octets -> ${sortie.length} octets ; retiré : ${retires.length ? retires.join(', ') : 'rien'}`);
}
