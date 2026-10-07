/* ============================================================
   preview.mjs — la web sencera sense build, per a Live Server.
   ------------------------------------------------------------
   La web de debò no existeix fins que el build l'escriu a dist/.
   Això la pinta al vol amb les mateixes plantilles (paginas.mjs).
   La pàgina va a ?p=:   /?p=/en/eliza/
   ============================================================ */
import { crearSitio, llegirJSON, esc } from './paginas.mjs';

const BASE = location.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '');
const demanar = async ruta => {
  const r = await fetch(`${BASE}/${ruta}`, { cache: 'no-store' });
  if (!r.ok) throw new Error(`no trobo ${ruta}`);
  return r.text();
};
const escriure = html => { document.open(); document.write(html); document.close(); };
const error = (titol, txt) => escriure(`<!doctype html><meta charset="utf-8"><title>vista prèvia — error</title>
<body style="margin:0;padding:clamp(24px,6vw,80px);font:18px/1.5 Helvetica,Arial,sans-serif;background:#000;color:#fff">
<h1 style="font-weight:400;color:#f6c6e0">${esc(titol)}</h1><p style="max-width:60ch">${esc(txt)}</p>
<p>Arregla-ho, desa, i aquesta pàgina es recarrega sola.</p></body>`);

async function arrencar() {
  let site, projectes, ninots;
  try {
    site = llegirJSON(await demanar('data/site.json'), 'data/site.json');
    projectes = llegirJSON(await demanar('data/projectes.json'), 'data/projectes.json');
    ninots = llegirJSON(await demanar('data/ninots.json'), 'data/ninots.json');
  } catch (e) { return error(e.json ? 'Hi ha un error en un JSON' : 'No puc llegir les dades', e.message); }

  // Els textos llargs, tots d'entrada: les plantilles els demanen sense esperar.
  const textos = new Map();
  await Promise.all(['bio', ...projectes.map(p => p?.slug)].flatMap(slug => site.idiomes.map(async l => {
    try { textos.set(`${slug}/${l}`, await demanar(`media/${slug}/text.${l}.md`)); } catch { /* no en té */ }
  })));

  const sitio = crearSitio({ site, projectes, ninots, base: BASE, preview: true, text: (s, l) => textos.get(`${s}/${l}`) ?? null });

  let demanada = new URLSearchParams(location.search).get('p') || '/';
  if (!demanada.startsWith('/')) demanada = '/' + demanada;
  if (!demanada.endsWith('/')) demanada += '/';
  const pagina = sitio.rutes().find(r => r.ruta === demanada);
  if (!pagina) return error('Aquesta pàgina no existeix', `No hi ha cap pàgina a ${demanada}. Si és un projecte, mira que el slug estigui ben escrit.`);
  escriure(pagina.pintar());

  // Revisa les dades com el build (fotos que falten, slugs...) i ho diu a la consola.
  const pregunta = new Set();
  sitio.revisar(r => (pregunta.add(r), true));
  const hi = new Map(await Promise.all([...pregunta].map(async r =>
    [r, (await fetch(`${BASE}/${encodeURI(r)}`, { method: 'HEAD', cache: 'no-store' }).catch(() => ({}))).ok === true])));
  for (const a of sitio.revisar(r => hi.get(r)))
    console[a.greu ? 'error' : 'warn'](`${a.greu ? '✗' : '⚠'} ${a.qui}: ${a.txt}`);
}

arrencar().catch(e => error('La vista prèvia ha fallat', e.message));
