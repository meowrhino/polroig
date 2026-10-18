/* ============================================================
   build.mjs — llegeix data/ i projects/ i escriu la web a dist/.
   Sense dependències. Les plantilles són a paginas.mjs, el mateix
   fitxer que fa servir la vista prèvia de Live Server.
       node build/build.mjs
   ============================================================ */
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { crearSitio, llegirJSON } from './paginas.mjs';
import { validar } from './validar.mjs';

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

/* Cada JSON, amb el seu esquema (schema/): el mateix que VS Code subratlla en
   vermell. Abans de pintar res: un camp d'un altre tipus trencaria les plantilles. */
const esquema = tipus => JSON.parse(readFileSync(join(ROOT, 'schema', tipus + '.json'), 'utf8'));
const malament = [
  ...validar(site, esquema('site'), 'data/site.json'),
  ...validar(about, esquema('about'), 'data/about.json'),
  ...validar(figures, esquema('figures'), 'data/figures.json'),
  ...Object.entries(projects).flatMap(([slug, p]) => validar(p, esquema('project'), `projects/${slug}/project.json`)),
];
for (const m of malament) console.error(`✗ ${m}`);
if (malament.length) sortir('Hi ha errors a les dades (marcats amb ✗ a dalt). No es publica res fins que s\'arreglin.');

/* On es publica, segons on es construeix (JAMstack, patrones.md §5):
   a l'Action de GitHub (la nostra còpia), meowrhino.github.io/polroig/ i sense
   indexar; a qualsevol altre lloc (Cloudflare, a la còpia de Pol), l'arrel i el
   domini de site.json → "url", i s'indexa si n'hi ha. */
const github = process.env.GITHUB_ACTIONS === 'true';
const [owner, repo] = (process.env.GITHUB_REPOSITORY || 'meowrhino/polroig').split('/');
const base = github ? `/${repo}` : '';
const origen = github ? `https://${owner}.github.io` : String(site.url || '').replace(/\/$/, '');
const indexar = !github && !!site.url;

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
   negre. Les fa el build amb sharp (npm ci) a .cache/og/, amb un nom segons
   la foto, i només les refà si la foto canvia. Sense sharp es comparteix la
   foto tal qual i s'avisa. Les plantilles demanen la og mentre pinten, i sharp
   va a part: una primera passada apunta quines calen, es fan, i es pinta. */
const ogNom = rel => createHash('sha1').update(rel).digest('hex').slice(0, 12) + '.jpg';
const ogFetes = new Map();   // foto → og/<nom>.jpg, les que hi són
async function ferOgs(rels) {
  let sharp = null;
  for (const rel of rels) {
    const cache = join(ROOT, '.cache', 'og', ogNom(rel));
    if (!(existsSync(cache) && statSync(cache).mtimeMs >= statSync(join(ROOT, rel)).mtimeMs)) {
      try {
        sharp ??= (await import('sharp')).default;
        const m = mida(rel);
        mkdirSync(dirname(cache), { recursive: true });
        await sharp(join(ROOT, rel))
          .resize(1200, 630, m && m.w / m.h >= 1.2 ? { fit: 'cover' } : { fit: 'contain', background: '#000' })
          .flatten({ background: '#000' }).jpeg({ quality: 85, mozjpeg: true }).toFile(cache);
      } catch (e) {
        console.warn(`⚠ sense sharp (${e.code || e.message}): en compartir surt la foto tal qual. Arregla-ho amb: npm ci`);
        return;
      }
    }
    ogFetes.set(rel, `og/${ogNom(rel)}`);
  }
}
function og(rel) {
  const sortida = ogFetes.get(rel) ?? null;
  if (sortida && !existsSync(join(OUT, sortida))) {
    mkdirSync(join(OUT, 'og'), { recursive: true });
    cpSync(join(ROOT, '.cache', 'og', ogNom(rel)), join(OUT, sortida));
  }
  return sortida;
}

const opcions = { site, projects, about, figures, base, origen, indexar, mida };
const avisos = crearSitio(opcions).revisar(rel => existsSync(join(ROOT, rel)));
for (const a of avisos) console.warn(`${a.greu ? '✗' : '⚠'} ${a.qui}: ${a.txt}`);
if (avisos.some(a => a.greu)) sortir('Hi ha errors a les dades (marcats amb ✗ a dalt). No es publica res fins que s\'arreglin.');

const calen = new Set();
const prova = crearSitio({ ...opcions, og: rel => (calen.add(rel), null) });
for (const r of prova.rutes()) r.pintar();
prova.noTrobada();
await ferOgs(calen);
const sitio = crearSitio({ ...opcions, og });

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
${rutes.filter(r => !r.ocult).map(r => `  <url><loc>${sitio.publica(r.ruta)}</loc></url>`).join('\n')}
</urlset>
`);
// A github.io, o sense domini a site.json, la web és de proves: no s'indexa.
writeFileSync(join(OUT, 'robots.txt'), indexar
  ? `User-agent: *\nAllow: /\nSitemap: ${sitio.publica('/sitemap.xml')}\n`
  : 'User-agent: *\nDisallow: /\n');
writeFileSync(join(OUT, '.nojekyll'), '');

console.log(`✓ ${rutes.length} pàgines · ${sitio.publicats.length} projectes · ${sitio.IDIOMES.length} idiomes`
  + `${avisos.length ? ` · ${avisos.length} avisos` : ''}`);
