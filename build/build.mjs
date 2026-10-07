/* ============================================================
   build.mjs — llegeix data/ i media/ i escriu la web a dist/.
   Sense dependències. Les plantilles són a paginas.mjs, el mateix
   fitxer que fa servir la vista prèvia de Live Server.
       node build/build.mjs
   ============================================================ */
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { crearSitio, llegirJSON } from './paginas.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'dist');
const sortir = msg => { console.error(`\n✗ ${msg}\n`); process.exit(1); };

let site, projectes, ninots;
try {
  site = llegirJSON(readFileSync(join(ROOT, 'data/site.json'), 'utf8'), 'data/site.json');
  projectes = llegirJSON(readFileSync(join(ROOT, 'data/projectes.json'), 'utf8'), 'data/projectes.json');
  ninots = llegirJSON(readFileSync(join(ROOT, 'data/ninots.json'), 'utf8'), 'data/ninots.json');
} catch (e) { sortir(e.message); }
if (!Array.isArray(projectes)) sortir('data/projectes.json ha de ser una llista: comença per [ i acaba per ]');

/* Subcarpeta on se serveix: a GitHub Pages, el nom del repo; amb domini
   propi, buida. Es pot forçar amb BASE= (per exemple, a Cloudflare). */
const base = process.env.BASE ?? (site.domini ? '' : site.base ?? '');

const text = (slug, l) => {
  const f = join(ROOT, `media/${slug}/text.${l}.md`);
  return existsSync(f) ? readFileSync(f, 'utf8') : null;
};

/** Amplada i alçada d'un webp, llegides de la capçalera: van al <img>
    perquè el navegador reservi el forat abans que baixi la foto. */
const mides = new Map();
function mida(rel) {
  if (mides.has(rel)) return mides.get(rel);
  let r = null;
  try {
    const b = readFileSync(join(ROOT, rel));
    if (b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
      const tipus = b.toString('ascii', 12, 16);
      if (tipus === 'VP8X') r = { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
      else if (tipus === 'VP8 ') r = { w: b.readUInt16LE(26) & 0x3FFF, h: b.readUInt16LE(28) & 0x3FFF };
      else if (tipus === 'VP8L') { const v = b.readUInt32LE(21); r = { w: 1 + (v & 0x3FFF), h: 1 + ((v >> 14) & 0x3FFF) }; }
    }
  } catch { /* no hi és o no es pot llegir: sense mides */ }
  mides.set(rel, r);
  return r;
}

const sitio = crearSitio({ site, projectes, ninots, base, text, mida });

const avisos = sitio.revisar(rel => existsSync(join(ROOT, rel)));
for (const a of avisos) console.warn(`${a.greu ? '✗' : '⚠'} ${a.qui}: ${a.txt}`);
if (avisos.some(a => a.greu)) sortir('Hi ha errors a les dades (marcats amb ✗ a dalt). No es publica res fins que s\'arreglin.');

/* ---------- escriure ---------- */
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
for (const dir of ['css', 'js', 'assets', 'media']) cpSync(join(ROOT, dir), join(OUT, dir), { recursive: true });
cpSync(join(ROOT, '_headers'), join(OUT, '_headers'));

const rutes = sitio.rutes();
for (const r of rutes) {
  const f = join(OUT, r.ruta, 'index.html');
  mkdirSync(dirname(f), { recursive: true });
  writeFileSync(f, r.pintar());
}
writeFileSync(join(OUT, '404.html'), sitio.noTrobada());
writeFileSync(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${rutes.map(r => `  <url><loc>${sitio.publica(r.ruta)}</loc></url>`).join('\n')}
</urlset>
`);
// Sense domini propi la web és de proves: no s'indexa.
writeFileSync(join(OUT, 'robots.txt'), site.domini
  ? `User-agent: *\nAllow: /\nSitemap: ${sitio.publica('/sitemap.xml')}\n`
  : 'User-agent: *\nDisallow: /\n');
writeFileSync(join(OUT, '.nojekyll'), '');
if (site.domini) writeFileSync(join(OUT, 'CNAME'), site.domini + '\n');

console.log(`✓ ${rutes.length} pàgines · ${sitio.publicats.length} projectes · ${sitio.IDIOMES.length} idiomes`
  + `${avisos.length ? ` · ${avisos.length} avisos` : ''}`);
