/* ============================================================
   build.mjs — llegeix data/ i projects/ i escriu la web a dist/.
   Sense dependències. Les plantilles són a paginas.mjs, el mateix
   fitxer que fa servir la vista prèvia de Live Server.
       node build/build.mjs
   ============================================================ */
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { crearSitio, llegirJSON } from './paginas.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'dist');
const sortir = msg => { console.error(`\n✗ ${msg}\n`); process.exit(1); };

const llegir = rel => llegirJSON(readFileSync(join(ROOT, rel), 'utf8'), rel);
let site, about, figures;
const projects = {};
try {
  site = llegir('data/site.json');
  about = llegir('data/about.json');
  figures = llegir('data/figures.json');
  // Un projecte, una carpeta: projects/<slug>/project.json + img/
  for (const slug of readdirSync(join(ROOT, 'projects')).sort()) {
    const f = `projects/${slug}/project.json`;
    if (existsSync(join(ROOT, f))) projects[slug] = llegir(f);
    else if (!slug.startsWith('.')) console.warn(`⚠ projects/${slug}: no té project.json, no es publica`);
  }
} catch (e) { sortir(e.message); }

/* Subcarpeta on se serveix: a GitHub Pages, el nom del repo; amb domini
   propi, buida. Es pot forçar amb BASE= (per exemple, a Cloudflare). */
const base = process.env.BASE ?? (site.domain ? '' : site.base ?? '');

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

/* La imatge per compartir (og:image): 1200×630 en JPG, que és el que esperen
   WhatsApp, Instagram i companyia. Les fotos horitzontals omplen el requadre
   (retallant el que sobra); les verticals i els cartells hi caben sencers, sobre
   negre. La fa el build amb ffmpeg (a l'Action l'instal·la el workflow) a
   .cache/og/, amb un nom segons la foto, i només la refà si la foto canvia.
   Sense ffmpeg es comparteix la foto tal qual i s'avisa. */
let ffmpeg = true;
const ogs = new Map();
function og(rel) {
  if (ogs.has(rel)) return ogs.get(rel);
  const nom = createHash('sha1').update(rel).digest('hex').slice(0, 12) + '.jpg';
  const cache = join(ROOT, '.cache', 'og', nom);
  let fet = existsSync(cache) && statSync(cache).mtimeMs >= statSync(join(ROOT, rel)).mtimeMs;
  if (!fet && ffmpeg) {
    const m = mida(rel);
    const vf = m && m.w / m.h >= 1.2
      ? 'scale=1200:630:force_original_aspect_ratio=increase,crop=1200:630'
      : 'scale=1200:630:force_original_aspect_ratio=decrease,pad=1200:630:(ow-iw)/2:(oh-ih)/2:black';
    try {
      mkdirSync(dirname(cache), { recursive: true });
      execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', join(ROOT, rel), '-vf', vf, '-q:v', '3', cache]);
      fet = true;
    } catch {
      ffmpeg = false;
      console.warn('⚠ sense ffmpeg (brew install ffmpeg): en compartir surt la foto tal qual');
    }
  }
  const sortida = fet ? `og/${nom}` : null;
  if (fet) { mkdirSync(join(OUT, 'og'), { recursive: true }); cpSync(cache, join(OUT, sortida)); }
  ogs.set(rel, sortida);
  return sortida;
}

const sitio = crearSitio({ site, projects, about, figures, base, mida, og });

const avisos = sitio.revisar(rel => existsSync(join(ROOT, rel)));
for (const a of avisos) console.warn(`${a.greu ? '✗' : '⚠'} ${a.qui}: ${a.txt}`);
if (avisos.some(a => a.greu)) sortir('Hi ha errors a les dades (marcats amb ✗ a dalt). No es publica res fins que s\'arreglin.');

/* ---------- escriure ---------- */
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
for (const dir of ['css', 'js', 'assets']) cpSync(join(ROOT, dir), join(OUT, dir), { recursive: true });
// Les fotos, vídeos i PDF de projects/ i data/, sense els JSON (ja són dins de l'HTML).
const senseJSON = src => !src.endsWith('.json') && !src.endsWith('.DS_Store');
for (const dir of ['projects', 'data']) cpSync(join(ROOT, dir), join(OUT, dir), { recursive: true, filter: senseJSON });
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
writeFileSync(join(OUT, 'robots.txt'), site.domain
  ? `User-agent: *\nAllow: /\nSitemap: ${sitio.publica('/sitemap.xml')}\n`
  : 'User-agent: *\nDisallow: /\n');
writeFileSync(join(OUT, '.nojekyll'), '');
if (site.domain) writeFileSync(join(OUT, 'CNAME'), site.domain + '\n');

console.log(`✓ ${rutes.length} pàgines · ${sitio.publicats.length} projectes · ${sitio.IDIOMES.length} idiomes`
  + `${avisos.length ? ` · ${avisos.length} avisos` : ''}`);
