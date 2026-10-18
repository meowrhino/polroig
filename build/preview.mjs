/* ============================================================
   preview.mjs — la web sencera sense build, per a Live Server.
   ------------------------------------------------------------
   La web de debò no existeix fins que el build l'escriu a dist/.
   Això la pinta al vol amb les mateixes plantilles (paginas.mjs).
   La pàgina va a ?p=:   /?p=/en/eliza/
   ============================================================ */
import { crearSitio, llegirJSON, esc } from './paginas.mjs';
import { validar } from './validar.mjs';

const BASE = location.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '');
const demanar = async ruta => {
  const r = await fetch(`${BASE}/${ruta}`, { cache: 'no-store' });
  if (!r.ok) throw new Error(`no trobo ${ruta}`);
  return r.text();
};
const escriure = html => { document.open(); document.write(html); document.close(); };
const error = (titol, txt) => escriure(`<!doctype html><meta charset="utf-8"><title>vista prèvia — error</title>
<body style="margin:0;padding:clamp(24px,6vw,80px);font:18px/1.5 Helvetica,Arial,sans-serif;background:#000;color:#fff">
<h1 style="font-weight:400;color:#f6c6e0">${esc(titol)}</h1><p style="max-width:60ch;white-space:pre-line">${esc(txt)}</p>
<p>Arregla-ho, desa, i aquesta pàgina es recarrega sola.</p></body>`);

async function arrencar() {
  let site, about, figures;
  const projects = {};
  try {
    site = llegirJSON(await demanar('data/site.json'), 'data/site.json');
    about = llegirJSON(await demanar('data/about.json'), 'data/about.json');
    figures = llegirJSON(await demanar('data/figures.json'), 'data/figures.json');
    // El navegador no pot llistar carpetes: demana les que diuen "feed" i les llistes.
    const slugs = new Set([...(site.feed || []), ...Object.values(site.lists || {}).flatMap(s => s.projects || [])]
      .map(e => (e && typeof e === 'object' ? e.project : e)).filter(e => typeof e === 'string'));
    await Promise.all([...slugs].map(async slug => {
      const f = `projects/${slug}/project.json`;
      let txt;
      try { txt = await demanar(f); } catch { return; }   // no hi és: ho dirà la revisió
      projects[slug] = llegirJSON(txt, f);
    }));
  } catch (e) { return error(e.json ? 'Hi ha un error en un JSON' : 'No puc llegir les dades', e.message); }

  // El mateix que el build amb schema/: un camp mal escrit o d'un altre tipus, a la pantalla.
  const esquemes = {};
  for (const t of ['site', 'about', 'figures', 'project']) {
    try { esquemes[t] = JSON.parse(await demanar(`schema/${t}.json`)); } catch { /* sense esquema, sense mirar */ }
  }
  const mirar = (d, t, f) => (esquemes[t] ? validar(d, esquemes[t], f) : []);
  const malament = [
    ...mirar(site, 'site', 'data/site.json'),
    ...mirar(about, 'about', 'data/about.json'),
    ...mirar(figures, 'figures', 'data/figures.json'),
    ...Object.entries(projects).flatMap(([slug, p]) => mirar(p, 'project', `projects/${slug}/project.json`)),
  ];
  if (malament.length) return error('Això no es publicaria', malament.map(m => `✗ ${m}`).join('\n'));

  const sitio = crearSitio({ site, projects, about, figures, base: BASE, preview: true });

  let demanada = new URLSearchParams(location.search).get('p') || '/';
  if (!demanada.startsWith('/')) demanada = '/' + demanada;
  if (!demanada.endsWith('/')) demanada += '/';
  const pagina = sitio.rutes().find(r => r.ruta === demanada);
  if (!pagina) return error('Aquesta pàgina no existeix', `No hi ha cap pàgina a ${demanada}. Si és un projecte, mira que el slug estigui ben escrit.`);

  /* Revisa les dades com el build (fotos que falten, slugs...) i ho ensenya a la
     pantalla, no a la consola, que no la mira ningú: el que aturaria el build
     (✗), en lloc de la pàgina; els avisos (⚠), en una franja a dalt. */
  const pregunta = new Set();
  sitio.revisar(r => (pregunta.add(r), true));
  const hi = new Map(await Promise.all([...pregunta].map(async r =>
    [r, (await fetch(`${BASE}/${encodeURI(r)}`, { method: 'HEAD', cache: 'no-store' }).catch(() => ({}))).ok === true])));
  const avisos = sitio.revisar(r => hi.get(r));
  const greus = avisos.filter(a => a.greu);
  if (greus.length) return error('Això no es publicaria', greus.map(a => `✗ ${a.qui}: ${a.txt}`).join('\n'));
  escriure(pagina.pintar());
  if (avisos.length) {
    const franja = `<div style="position:fixed;inset:0 0 auto;z-index:20;padding:8px 12px;background:#fff3c4;color:#5c4400;`
      + `font:13px/1.4 Helvetica,Arial,sans-serif;max-height:30vh;overflow:auto">`
      + avisos.map(a => `⚠ ${esc(a.qui)}: ${esc(a.txt)}`).join('<br>')
      + ` <button onclick="this.parentNode.remove()" style="font:inherit">tancar</button></div>`;
    // la pàgina acabada d'escriure encara es munta: la franja, quan hi hagi <body>
    if (document.body) document.body.insertAdjacentHTML('afterbegin', franja);
    else document.addEventListener('DOMContentLoaded', () => document.body.insertAdjacentHTML('afterbegin', franja), { once: true });
  }
}

arrencar().catch(e => error('La vista prèvia ha fallat', e.message));
