/* ============================================================
   paginas.mjs — les plantilles de la web.
   ------------------------------------------------------------
   Tot l'HTML surt d'aquí, i el fan servir dos llocs:

     build/build.mjs    a Node, en publicar: escriu dist/
     build/preview.mjs  al navegador, amb Live Server: pinta la
                        pàgina al vol llegint els JSON

   Per això aquest fitxer no importa res ni toca el disc: el que
   necessita saber del disc (si un fitxer existeix, quant mesura
   una foto, el text d'un .md) li passa qui el crida.
   ============================================================ */

export const esc = s => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Llegeix un JSON i, si està malament, diu on (línia i columna). */
export function llegirJSON(text, nom) {
  try { return JSON.parse(text); }
  catch (e) {
    let on = '';
    const lc = /line (\d+) column (\d+)/.exec(e.message);
    const pos = /position (\d+)/.exec(e.message);
    if (lc) on = ` (línia ${lc[1]}, columna ${lc[2]})`;
    else if (pos) {
      const abans = text.slice(0, +pos[1]).split('\n');
      on = ` (línia ${abans.length}, columna ${abans.at(-1).length + 1})`;
    }
    const err = new Error(`${nom} no és un JSON vàlid${on}. Sol ser una coma de més o de menys, `
      + `o unes cometes sense tancar. Detall: ${e.message}`);
    err.json = true;
    throw err;
  }
}

/* Slugs que ja fa servir la web: un projecte no es pot dir així. */
const RESERVATS = ['bio', 'en', 'projects', 'data', 'assets', 'css', 'js'];

/** Un text en paràgrafs (llista) o en línies (llista dins d'un paràgraf), com a string
    amb salts: \n\n entre paràgrafs i \n entre línies. */
const linies = v => (Array.isArray(v) ? v.join('\n') : v || '');
const paragrafsDe = v => (Array.isArray(v) ? v.map(linies).join('\n\n') : v || '');

/* ============================================================
   crearSitio — tot el que depèn de les dades
   ------------------------------------------------------------
     site              data/site.json
     projects          { slug: projects/<slug>/project.json }
     about             data/about.json
     figures           data/figures.json (els ninots)
     base              subcarpeta on se serveix ('' o '/polroig')
     origen            el domini de les adreces públiques (canonical, og), sense barra final
     indexar           si Google la pot indexar (false a github.io i sense domini)
     mida(ruta)        { w, h } d'una imatge, o null
     og(ruta)          la imatge per compartir (1200×630) feta d'aquesta foto, o null
     preview           true a la vista prèvia: els enllaços van a ?p=/ruta/
   ============================================================ */
export function crearSitio({ site, projects, about = {}, figures = {}, base = '', origen = '', indexar: INDEXAR = false, mida = () => null, og = () => null, preview = false }) {
  const IDIOMES = site.langs;
  const DEF = site.lang;
  const B = String(base).replace(/\/$/, '');
  const fotos = v => (Array.isArray(v) ? v.map(String) : []);
  /** Una entrada de "feed" o d'una llista: "slug", o { "project": "slug", "visible": false }
      per a un projecte amagat (té pàgina per enviar-la en privat, però no surt enlloc més). */
  const deFeed = e => (e && typeof e === 'object' ? { slug: e.project, visible: e.visible !== false } : { slug: e, visible: true });
  const feed = (Array.isArray(site.feed) ? site.feed : []).map(deFeed);
  const preparar = ({ slug }) => ({ ...projects[slug], slug, photos: fotos(projects[slug].photos) });
  const hiEs = ({ slug }) => typeof slug === 'string' && projects[slug] && typeof projects[slug] === 'object';
  /** Publicat = surt a site.json → feed, en aquest ordre. */
  const publicats = feed.filter(e => e.visible && hiEs(e)).map(preparar);
  const ocults = feed.filter(e => !e.visible && hiEs(e)).map(e => ({ ...preparar(e), ocult: true }));
  const perSlug = Object.fromEntries(publicats.map(p => [p.slug, p]));
  const llistes = Object.values(site.lists || {}).map(s => (Array.isArray(s.projects)
    ? { ...s, projects: s.projects.map(deFeed).filter(e => e.visible).map(e => e.slug) } : s));

  /* ---------- rutes ---------- */
  const raiz = p => B + (p.startsWith('/') ? p : '/' + p);
  const ruta = (l, path = '') => `${l === DEF ? '' : '/' + l}/${path}`.replace(/\/{2,}/g, '/');
  const url = (l, path = '') => (preview ? `${B}/?p=${ruta(l, path)}` : B + ruta(l, path));
  const publica = p => origen + B + (p.startsWith('/') ? p : '/' + p);
  const t = (obj, l) => (obj && typeof obj === 'object' ? obj[l] || obj[DEF] || '' : obj || '');
  const ui = (k, l) => t(Object.fromEntries(IDIOMES.map(i => [i, site.ui?.[i]?.[k]])), l);

  /* ---------- mini-markdown ----------
     *cursiva*, **negreta**, [text](enllaç). Un enllaç sense http és un
     fitxer de la carpeta del projecte: [Full de sala](full-de-sala.pdf) → projects/<slug>/. */
  const md = (s, slug) => esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, txt, href) => /^(https?:|mailto:)/.test(href)
      ? `<a href="${href}" target="_blank" rel="noopener">${txt}</a>`
      : `<a href="${raiz(`/projects/${slug}/${href}`)}" target="_blank">${txt}</a>`);
  const blocs = s => String(s || '').split(/\n\s*\n/).map(x => x.trim()).filter(Boolean);
  /** Un paràgraf que comença per "> " és una cita: surt en rosa. */
  const paragraf = (x, slug) => /^>\s/.test(x)
    ? `<blockquote class="cita"><p>${md(x.replace(/^>\s*/gm, ''), slug).replace(/\n/g, '<br>')}</p></blockquote>`
    : `<p>${md(x, slug).replace(/\n/g, '<br>')}</p>`;
  const paragrafs = (s, slug) => blocs(s).map(x => paragraf(x, slug)).join('\n');
  /** El primer paràgraf de text de debò (ni cita ni marca): el resum del "llegir més". */
  const primer = s => blocs(s).find(x => !/^(>\s|\[\[)/.test(x)) || '';
  /* Marques dins del text d'una pàgina, cadascuna en un paràgraf sol:
       [[slides]]  [[video]]  [[galeria:bocetos]]   el slideshow, el vídeo o una galeria, aquí
       [[slides | Peu de foto]]                     amb un peu a sota
       [[columnes]] … [[/columnes]]                 el que hi ha entremig, a dues columnes */
  const MARCA = /^\[\[\s*(\/?[a-z]+)(?::([a-z0-9-]+))?\s*(?:\|\s*([\s\S]+?))?\s*\]\]$/;
  const marques = s => blocs(s).map(x => MARCA.exec(x)).filter(Boolean);
  /** 155 caràcters nets per a la meta description. */
  const pla = s => String(s || '').replace(/\*|\[|\]\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
  const resum = s => { const p = pla(s); return p.length <= 155 ? p : p.slice(0, 152).replace(/\s+\S*$/, '') + '…'; };

  const img = (slug, carpeta, i) => `projects/${slug}/img/${carpeta ? carpeta + '/' : ''}${i}.webp`;
  const FOTO_BIO = 'data/about/1.webp';
  /** La foto per compartir: el primer cartell si n'hi ha, si no la primera foto. */
  const portada = p => (fotos(p.posters).length ? img(p.slug, 'posters', fotos(p.posters)[0]) : img(p.slug, '', p.photos[0]));
  /** El peu: mini-markdown i un salt de línia entre línia i línia del JSON. */
  const peuHtml = (p, l) => md(linies(t(p.caption, l)), p.slug).replace(/\n/g, '<br>');
  /** El text llarg en aquest idioma o, si no n'hi ha, en el per defecte. */
  const textDe = (p, l) => paragrafsDe(p.text?.[l]) || paragrafsDe(p.text?.[DEF]);
  const textBio = l => paragrafsDe(about[l]) || paragrafsDe(about[DEF]);
  /** width i height d'una imatge, perquè el navegador li reservi el forat abans que baixi. */
  const wh = f => { const m = mida(f); return m ? ` width="${m.w}" height="${m.h}"` : ''; };
  /** JSON-LD dins d'un <script>: sense "<", que podria tancar-lo. */
  const ld = obj => `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', ...obj }).replace(/</g, '\\u003c')}</script>`;
  /** Pol, per a schema.org: a la home, a la bio i com a autor de cada projecte. */
  const persona = l => ({ '@type': 'Person', name: site.title, url: publica(ruta(l)), email: `mailto:${site.email}`,
    jobTitle: ui('job', l), image: publica('/' + FOTO_BIO) });

  /* ---------- trossos ---------- */
  const LOCALE = { ca: 'ca_ES', es: 'es_ES', en: 'en_GB' };

  /* La transició entre pàgines, la de la casa (JAMstack, patrones.md §6c), copiada
     tal qual d'almarbra: js/transicion.js i css/transicion.css, i aquest script,
     que tapa la pàgina abans de pintar si s'hi arriba des d'una altra de la web.
     Sense dibuix propi (window.dibujo): un fos al negre i un quadradet que batega. */
  const headScript = `<script>{
const html = document.documentElement;
html.classList.add('js');
let back = false;
try {
  const d = JSON.parse(sessionStorage.getItem('transicion'));
  back = !d && performance.getEntriesByType('navigation')[0]?.type === 'back_forward';
  if (d?.carga) html.style.setProperty('--carga', d.carga);   // el color del loader, del dibujo
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches && (back || d)) html.classList.add('tapada');
} catch {}
window.revelada = ${preview ? 'false' : "'onpagereveal' in window"} ? new Promise((done) => addEventListener('pagereveal', (e) => {
  const vt = e.viewTransition;
  if (vt && back && html.classList.contains('tapada')) { html.classList.add('tapando'); done(vt); }
  else { vt?.ready.catch(() => {}); vt?.skipTransition(); done(null); }   // saltarla rechaza ready: sin error en la consola
}, { once: true })) : Promise.resolve(null);
}</script>`;

  /** <head> sencer: títol, descripció, idiomes, Open Graph i JSON-LD.
      A github.io o sense domini, noindex: la web encara és de proves. */
  function head({ l, titol, desc, path, imatge, jsonld, extra = '', indexar = INDEXAR }) {
    return `<!doctype html>
<html lang="${l}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#000000">
  <title>${esc(titol)}</title>
  <meta name="description" content="${esc(desc)}">
  ${indexar ? '' : '<meta name="robots" content="noindex">\n  '}<link rel="canonical" href="${publica(ruta(l, path))}">
  ${IDIOMES.map(i => `<link rel="alternate" hreflang="${i}" href="${publica(ruta(i, path))}">`).join('\n  ')}
  <link rel="alternate" hreflang="x-default" href="${publica(ruta(DEF, path))}">
  <meta property="og:type" content="${path && path !== 'bio/' ? 'article' : 'website'}">
  <meta property="og:title" content="${esc(titol)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:url" content="${publica(ruta(l, path))}">
  <meta property="og:site_name" content="${esc(site.title)}">
  <meta property="og:locale" content="${LOCALE[l] || l}">
  ${IDIOMES.filter(i => i !== l).map(i => `<meta property="og:locale:alternate" content="${LOCALE[i] || i}">`).join('\n  ')}
  ${(o => (o ? `<meta property="og:image" content="${publica('/' + o)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">` : imatge ? `<meta property="og:image" content="${publica('/' + imatge)}">` : ''))(imatge && og(imatge))}
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="${raiz('/assets/favicon.svg')}" type="image/svg+xml">
  ${headScript}
  <link rel="stylesheet" href="${raiz('/css/transicion.css')}">
  <link rel="stylesheet" href="${raiz('/css/style.css')}">
  <script>try { if (localStorage.getItem('gran')) document.documentElement.classList.add('gran'); } catch {}</script>${extra}
  <script type="module" src="${raiz('/js/polroig.js')}"></script>
  <script src="${raiz('/js/transicion.js')}" defer></script>
  ${jsonld ? ld(jsonld) : ''}
</head>
<body>`;
  }
  const insta = site.social?.instagram;
  const peu = (l, contacte = true) => `${contacte ? `<footer class="contacte">
  <a href="mailto:${esc(site.email)}">${esc(site.email)}</a>
  ${insta ? `<a href="https://www.instagram.com/${esc(insta)}/" target="_blank" rel="noopener">Instagram: @${esc(insta)}</a>` : ''}
</footer>` : ''}
<button class="mida" type="button" aria-pressed="false" aria-label="${esc(ui('textSize', l))}" hidden>A+</button>
</body>
</html>
`;

  function capcalera(l, path) {
    const idiomes = IDIOMES.map(i => i === l
      ? `<a href="${url(i, path)}" aria-current="true">${esc(ui('langName', i))}</a>`
      : `<a href="${url(i, path)}" hreflang="${i}" lang="${i}">${esc(ui('langName', i))}</a>`).join(' · ');
    return `<header class="top">
  <a href="${path === 'bio/' ? url(l) : url(l, 'bio/')}">${esc(site.short)}</a>
  <a href="mailto:${esc(site.email)}">${esc(site.email)}</a>
  <span class="idiomes">${idiomes}</span>
</header>`;
  }

  /* Línies de punts amb siluetes (data/figures.json). Cada pàgina les treu en
     l'ordre del JSON i torna a començar; el JS varia l'amplada dels punts i,
     a la home, barreja els del scroll.
     Els normals ("lines") porten a la bio, o a l'inici si diuen "to": "home". Els rars ("strays") són personatges
     escapats d'una obra: surten una sola vegada, al scroll de la home, mai al costat
     del seu projecte, i porten a ell. De quin projecte és, ho diu el nom del
     fitxer: concierto-barroco-banc.svg → concierto-barroco.
     Són enllaços repetits (la bio i els projectes ja tenen el seu), així que
     queden fora del teclat i del lector de pantalla. */
  const lines = Array.isArray(figures.lines) ? figures.lines : [];
  const cada = Number.isInteger(figures.every) && figures.every > 0 ? figures.every : 2;
  const rars = Array.isArray(figures.strays?.figures) ? figures.strays.figures : [];
  /** El projecte d'on ve un rar: el slug més llarg amb què comença el nom. */
  const obraDe = sil => publicats.map(p => p.slug).filter(s => sil === s || sil.startsWith(s + '-'))
    .sort((a, b) => b.length - a.length)[0];
  const ninot = (sil, href, punts, v, obra) =>
    `<span class="punts" style="--w:${punts}%" data-v="${v ?? 0}"></span><a class="ninot" href="${href}" tabindex="-1"${obra ? ` data-obra="${obra}"` : ''} style="--m:url(${raiz(`/assets/siluetes/${sil}.svg`)})"><img src="${raiz(`/assets/siluetes/${sil}.svg`)}" alt=""></a>`;
  let tram = 0;   // per on va la llista; cada pàgina el torna a posar a 0
  /** Una línia. "extra": un ninot rar al final; "veins": els projectes del costat (per al JS). */
  const passeig = (l, { extra = '', veins } = {}) => lines.length ? `<div class="passeig" aria-hidden="true"${veins ? ` data-veins="${veins.join(' ')}"` : ''}>${(lines[tram++ % lines.length].figures || [])
    .map(n => ninot(n.figure, n.to === 'home' ? url(l) : url(l, 'bio/'), n.dots, n.vary)).join('')}${extra}</div>` : '';
  /** On va cada rar al scroll de la home: repartits, i mai a la línia de sota o de sobre del seu projecte.
      Torna un Map índex-de-línia → ninot. */
  function repartirRars(l, veinsDe, n) {
    const lloc = new Map();
    rars.forEach((sil, k) => {
      const obra = obraDe(sil);
      if (!obra || !n) return;
      for (let d = 0, j = Math.floor(k * n / rars.length); d < n; d++, j = (j + 1) % n) {
        if (lloc.has(j) || veinsDe(j).includes(obra)) continue;
        const p = perSlug[obra];
        lloc.set(j, ninot(sil, p.page ? url(l, obra + '/') : `${url(l)}#${obra}`, figures.strays.dots ?? 10, figures.strays.vary, obra));
        return;
      }
    });
    return lloc;
  }

  /** Slideshow: sense JS es veu la primera foto; el JS mostra els botons i el ninot mentre carrega. */
  function slides(p, carpeta, llista, l, eager = false) {
    const n = llista.length;
    if (!n) return '';
    const primera = img(p.slug, carpeta, llista[0]);
    const m = mida(primera);
    const alt = `${p.title} — ${ui('image', l)} 1/${n}`;
    // eager: la primera foto de la pàgina, la que el navegador ha de baixar abans que res (LCP).
    return `<figure class="slides"${m ? ` style="--r:${m.w}/${m.h}"` : ''} data-base="${raiz(`/projects/${p.slug}/img/${carpeta ? carpeta + '/' : ''}`)}" data-fotos="${esc(llista.join(' '))}" data-titol="${esc(p.title)}" data-txt="${esc(ui('image', l))}">
  <img src="${raiz('/' + primera)}" alt="${esc(alt)}"${wh(primera)}${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async">${n > 1 ? `
  <button class="ant" type="button" aria-label="${esc(ui('previous', l))}" hidden></button>
  <button class="seg" type="button" aria-label="${esc(ui('next', l))}" hidden></button>
  <span class="compte" hidden>1/${n}</span>
  <span class="fletxa" hidden></span>` : ''}
</figure>`;
  }

  /* ---------- pàgines ---------- */
  function home(l) {
    tram = 0;
    const dalt = passeig(l);
    const index = llistes.map((s, i) => `${i ? passeig(l) + passeig(l) : ''}
<section class="index">
  <h2>${esc(t(s.name, l))}</h2>
  <ul>${(s.projects || []).filter(slug => perSlug[slug]).map(slug => {
      const p = perSlug[slug];
      return `
    <li><a href="#${slug}"><span class="titol">${esc(t(p.label, l) || p.title)}</span><span class="detall">${esc(t(p.detail, l))}</span></a></li>`;
    }).join('')}
  </ul>
</section>`).join('');

    // Una línia de punts cada "every" projectes (data/figures.json), amb els rars ("strays") repartits.
    const linia = publicats.map((_, i) => i).filter(i => (i + 1) % cada === 0);
    const veinsDe = j => [publicats[linia[j]]?.slug, publicats[linia[j] + 1]?.slug].filter(Boolean);
    const llocRar = repartirRars(l, veinsDe, linia.length);
    const feed = publicats.map((p, i) => `<article class="proj" id="${p.slug}">
${slides(p, '', p.photos, l, i === 0)}
${(Array.isArray(p.captions) ? p.captions : []).map((x, k) => `<p class="peu" data-foto="${p.photos.indexOf(String(x.from)) + 1}"${k ? ' hidden' : ''}>${md(linies(t(x, l)), p.slug).replace(/\n/g, '<br>')}</p>`).join('\n')}
${p.caption ? `<p class="peu">${peuHtml(p, l)}${p.page && !textDe(p, l)
      ? ` <a class="mes" href="${url(l, p.slug + '/')}"><em>${esc(ui('readMore', l))}</em></a>` : ''}</p>` : ''}
${textDe(p, l) ? `<details class="desplegable">
<summary><em class="obrir">${esc(ui('readMore', l))}</em><em class="tancar">${esc(ui('close', l))}</em></summary>
${p.page
      // Amb pàgina pròpia, el desplegable és el primer paràgraf i porta a la resta.
      ? paragrafs(primer(textDe(p, l)), p.slug).replace(/<\/p>$/,
        ` <a class="mes" href="${url(l, p.slug + '/')}"><em>${esc(ui('fullPage', l))}</em></a></p>`)
      : paragrafs(textDe(p, l), p.slug)}
</details>` : ''}
</article>${(i + 1) % cada ? '' : (j => '\n' + passeig(l, { extra: llocRar.get(j), veins: veinsDe(j) }))(linia.indexOf(i))}`).join('\n');

    return head({
      l, path: '', titol: site.title, desc: t(site.description, l), imatge: publicats[0] && portada(publicats[0]),
      jsonld: persona(l), extra: entrada.length ? ENTRADA_HEAD : '',
    }) + `
${capcalera(l, '')}
${entradaHtml(l)}
<main>
<h1 class="sr">${esc(site.title)}</h1>
${dalt}
<section class="bio"><p>${md(t(site.intro, l), 'bio')} <a class="mes" href="${url(l, 'bio/')}"><em>${esc(ui('readMore', l))}</em></a></p></section>
${index}
<section class="feed">
${feed}
</section>
</main>
` + peu(l);
  }

  /* ---------- l'entrada ----------
     Abans de la home, una foto a l'atzar de data/entrance/ (site.json → "entrance") amb la
     capçalera a sobre i línies de punts que s'escriuen amb el ninot fent de cursor. Un clic
     (o Enter, Espai, Esc) i entres. Una vegada per sessió, com barbarawong; sense JS, amb
     "menys moviment" al sistema o si l'adreça porta a un projecte (#slug), no surt. El <head> decideix abans de pintar (html.amb-entrada)
     perquè la home no faci pampallugues; js/polroig.js la treu. */
  const fotosEntrada = fotos(site.entrance);
  const entrada = Array.isArray(figures.entrance) && fotosEntrada.length ? figures.entrance : [];
  const ENTRADA_HEAD = `
  <script>try { if (!location.hash && !sessionStorage.getItem('entrada') && !matchMedia('(prefers-reduced-motion: reduce)').matches) document.documentElement.classList.add('amb-entrada'); } catch {}</script>`;
  const entradaHtml = l => entrada.length ? `<div class="entrada">
  <img alt="" data-fotos="${esc(fotosEntrada.join(' '))}" data-base="${raiz('/data/entrance/')}">
  <script>{ const i = document.currentScript.previousElementSibling, f = i.dataset.fotos.split(' '); if (document.documentElement.classList.contains('amb-entrada')) i.src = i.dataset.base + f[Math.floor(Math.random() * f.length)] + '.webp'; }</script>
  <div class="escriptura" aria-hidden="true">${entrada.map((sil, k) => `
    <div class="passeig" style="--k:${k}"><span class="punts"></span><img src="${raiz(`/assets/siluetes/${sil}.svg`)}" alt=""></div>`).join('')}
  </div>
  <button class="sr" type="button">${esc(ui('enter', l))}</button>
</div>` : '';

  /** El vídeo, amb la seva imatge d'espera ("video": "teaser" → img/teaser.webm i img/teaser.poster.webp). */
  function video(p) {
    const poster = `projects/${p.slug}/img/${p.video}.poster.webp`;
    return `<video src="${raiz(`/projects/${p.slug}/img/${p.video}.webm`)}" poster="${raiz('/' + poster)}"${wh(poster)} controls playsinline preload="none"></video>`;
  }

  /** El text de la pàgina, amb les marques (veure MARCA) substituïdes. */
  function cos(p, l, txt) {
    const peuDe = c => (c ? `\n<p class="peu">${md(c, p.slug)}</p>` : '');
    return blocs(txt).map(x => {
      const m = MARCA.exec(x);
      if (!m) return paragraf(x, p.slug);
      const [, nom, arg, c] = m;
      if (nom === 'columnes') return '<div class="columnes">';
      if (nom === '/columnes') return '</div>';
      if (nom === 'slides') return `<div class="bloc">${slides(p, '', p.photos, l)}${peuDe(c)}</div>`;
      if (nom === 'video' && p.video) return `<div class="bloc">${video(p)}${peuDe(c)}</div>`;
      const g = nom === 'galeria' && grups(p).find(g => g.folder === arg);
      if (g) return `<div class="bloc">${slides(p, g.folder, fotos(g.photos), l)}${peuDe(c)}</div>`;
      return '';   // marca desconeguda: el build ja n'avisa
    }).join('\n');
  }

  const grups = p => (Array.isArray(p.groups) ? p.groups : []);
  function projecte(p, l) {
    tram = 0;
    const txt = textDe(p, l);
    // El vídeo i les galeries que el text no col·loca amb una marca van al seu lloc de sempre.
    const posats = marques(txt).map(m => (m[1] === 'galeria' ? m[2] : m[1]));
    // A dalt, els cartells fixos un al costat de l'altre; si no n'hi ha, el slideshow.
    const dalt = fotos(p.posters).length
      ? `<div class="cartells">${fotos(p.posters).map((n, i) => {
          const f = img(p.slug, 'posters', n);
          return `<img src="${raiz('/' + f)}" alt="${esc(`${p.title} — ${ui('poster', l)} ${i + 1}`)}"${wh(f)}${i ? '' : ' fetchpriority="high"'}>`;
        }).join('')}</div>`
      : slides(p, '', p.photos, l, true);
    return head({
      l, path: p.slug + '/', titol: `${p.title} — ${site.title}`, indexar: INDEXAR && !p.ocult,
      desc: resum(linies(t(p.caption, l)) || p.title), imatge: portada(p),
      jsonld: { '@type': 'CreativeWork', name: p.title, url: publica(ruta(l, p.slug + '/')), inLanguage: l,
        description: resum(linies(t(p.caption, l))), image: publica('/' + portada(p)), creator: persona(l) },
    }) + `
${capcalera(l, p.slug + '/')}
<main class="pagina">
${passeig(l)}
<article>
<h1 class="sr">${esc(p.title)}</h1>
${dalt}
${p.caption ? `<p class="peu">${peuHtml(p, l)}</p>` : ''}
${p.video && !posats.includes('video') ? video(p) : ''}
${txt ? `<div class="text">\n${cos(p, l, txt)}\n</div>` : ''}
${grups(p).filter(g => !posats.includes(g.folder)).map(g => `<section class="galeria">${g.name ? `<h2>${esc(t(g.name, l))}</h2>` : ''}
${slides(p, g.folder, fotos(g.photos), l)}
</section>`).join('\n')}
</article>
${passeig(l)}
<p><a class="mes" href="${url(l)}${p.ocult ? '' : '#' + p.slug}">${esc(ui('back', l))}</a></p>
</main>
` + peu(l);
  }

  function bio(l) {
    tram = 0;
    return head({ l, path: 'bio/', titol: `${ui('about', l)} — ${site.title}`, desc: resum(t(site.intro, l)), imatge: FOTO_BIO,
      jsonld: { '@type': 'ProfilePage', inLanguage: l, mainEntity: persona(l) } })
      + `
${capcalera(l, 'bio/')}
<main class="pagina-bio">
${passeig(l)}
<h1 class="sr">${esc(site.title)}</h1>
<img src="${raiz('/' + FOTO_BIO)}" alt="${esc(site.title)}"${wh(FOTO_BIO)} fetchpriority="high">
${paragrafs(textBio(l), 'bio')}
<section class="contacte-bio">
<h2>${esc(ui('contact', l))}</h2>
<p><em>${esc(ui('email', l))}: <a href="mailto:${esc(site.email)}">${esc(site.email)}</a></em></p>
${insta ? `<p><em>Instagram: <a href="https://www.instagram.com/${esc(insta)}/" target="_blank" rel="noopener">@${esc(insta)}</a></em></p>` : ''}
</section>
<p><a class="mes" href="${url(l)}">${esc(ui('back', l))}</a></p>
</main>
` + peu(l, false);
  }

  function noTrobada() {
    tram = 0;
    return head({ l: DEF, path: '', titol: `404 — ${site.title}`, desc: t(site.description, DEF), indexar: false })
      + `\n${capcalera(DEF, '')}\n<main class="pagina-bio">\n${passeig(DEF)}\n`
      + IDIOMES.map(l => `<p lang="${l}">${esc(ui('notFound', l))} <a class="mes" href="${url(l)}">${esc(ui('back', l))}</a></p>`).join('\n')
      + `\n</main>\n` + peu(DEF);
  }

  /* ---------- el mapa de la web ---------- */
  function rutes() {
    const r = [];
    for (const l of IDIOMES) {
      r.push({ ruta: ruta(l), pintar: () => home(l) });
      r.push({ ruta: ruta(l, 'bio/'), pintar: () => bio(l) });
      for (const p of publicats.filter(p => p.page)) r.push({ ruta: ruta(l, p.slug + '/'), pintar: () => projecte(p, l) });
      // Els amagats tenen sempre la seva pàgina (per enviar-la), fora del sitemap.
      for (const p of ocults) r.push({ ruta: ruta(l, p.slug + '/'), pintar: () => projecte(p, l), ocult: true });
    }
    return r;
  }

  /* ---------- revisió de les dades ----------
     Cada avís diu qui i què. Els greus (greu: true) aturen el build:
     una foto que falta o un slug repetit no s'han de publicar.
     existeix(ruta) → true/false. */
  function revisar(existeix) {
    const avisos = [];
    const avis = (qui, txt, greu = false) => avisos.push({ qui, txt, greu });
    const enLlista = slug => llistes.some(s => Array.isArray(s.projects) && s.projects.includes(slug));
    for (const l of IDIOMES) if (!paragrafsDe(about[l])) avis('data/about.json', `falta el text en "${l}"`);
    if (!existeix(FOTO_BIO)) avis('bio', `no trobo ${FOTO_BIO}`, true);

    /** Una llista de fotos ("photos", "posters" o la d'un grup): que hi siguin totes. */
    const revisarFotos = (qui, camp, llista, carpeta, slug) => {
      const on = `projects/${slug}/img/${carpeta ? carpeta + '/' : ''}`;
      if (!Array.isArray(llista) || !llista.length) return avis(qui, `"${camp}" ha de ser una llista de fotos: ["1", "2", "3"]`, true);
      for (const n of llista) if (!existeix(img(slug, carpeta, n))) avis(qui, `no trobo ${on}${n}.webp (surt a "${camp}")`, true);
      const max = Math.max(...llista.map(Number).filter(Number.isInteger));
      if (max > 0 && existeix(img(slug, carpeta, max + 1))) avis(qui, `a ${on} hi ha ${max + 1}.webp i no surt a "${camp}"`);
    };

    for (const [slug, p] of Object.entries(projects)) {
      const qui = `projects/${slug}`;
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) { avis(qui, 'el nom de la carpeta només pot portar minúscules, números i guions', true); continue; }
      if (RESERVATS.includes(slug)) { avis(qui, `"${slug}" ja el fa servir la web: posa-li un altre nom a la carpeta`, true); continue; }
      if (!p || typeof p !== 'object' || Array.isArray(p)) { avis(qui, 'project.json ha de ser un bloc { ... }', true); continue; }
      const ocult = ocults.some(o => o.slug === slug);
      if (!perSlug[slug] && !ocult) { avis(qui, 'no surt a site.json → feed: no es publica'); continue; }
      if (!p.title) avis(qui, 'falta "title"');
      revisarFotos(qui, 'photos', p.photos, '', slug);
      if (p.posters != null) revisarFotos(qui, 'posters', p.posters, 'posters', slug);
      if (p.groups != null && !Array.isArray(p.groups)) avis(qui, '"groups" ha de ser una llista: [ ... ]', true);
      for (const g of grups(p)) {
        if (!/^[a-z0-9-]+$/.test(g?.folder || '')) { avis(qui, 'cada grup ha de dir la seva carpeta: "folder": "bocetos"', true); continue; }
        revisarFotos(qui, `groups → ${g.folder}`, g.photos, g.folder, slug);
      }
      if (p.video && !(existeix(`projects/${slug}/img/${p.video}.webm`) && existeix(`projects/${slug}/img/${p.video}.poster.webp`)))
        avis(qui, `"video": "${p.video}" vol dir img/${p.video}.webm i img/${p.video}.poster.webp, i no els trobo`, true);
      if (p.caption) for (const l of IDIOMES) if (!linies(p.caption[l])) avis(qui, `falta el peu ("caption") en "${l}"`);
      if (p.captions != null) {
        if (!Array.isArray(p.captions)) avis(qui, '"captions" ha de ser una llista: [ ... ]', true);
        else p.captions.forEach((x, k) => {
          if (!fotos(p.photos).includes(String(x?.from))) avis(qui, `el peu ${k + 1} de "captions" ha de dir des de quina foto va ("from": "3"), i ha de ser una de "photos"`, true);
          for (const l of IDIOMES) if (!linies(x?.[l])) avis(qui, `al peu ${k + 1} de "captions" li falta "${l}"`);
        });
      }
      for (const l of IDIOMES) if (p.text?.[DEF] && !paragrafsDe(p.text[l])) avis(qui, `falta el text ("text") en "${l}"`);
      for (const l of IDIOMES) for (const [, nom, arg] of marques(paragrafsDe(p.text?.[l]))) {
        const bona = ['slides', 'columnes', '/columnes'].includes(nom) || (nom === 'video' && p.video)
          || (nom === 'galeria' && grups(p).some(g => g.folder === arg));
        if (!bona) avis(qui, `al text en "${l}", "[[${nom}${arg ? ':' + arg : ''}]]" no porta enlloc: mira el nom del grup ("folder") o que el projecte tingui vídeo`);
      }
      if (!enLlista(slug) && !ocult) avis(qui, 'surt a "feed" però no a cap llista de site.json → lists');
    }

    if (!Array.isArray(site.feed)) avis('site.json', '"feed" ha de ser una llista de projectes: [ ... ]', true);
    else for (const { slug } of feed) {
      if (typeof slug !== 'string') avis('site.json', 'cada projecte de "feed" és "slug" o, si està amagat, { "project": "slug", "visible": false }', true);
      else if (!projects[slug]) avis('site.json', `"feed" diu "${slug}", i no trobo projects/${slug}/project.json`, true);
    }
    for (const s of llistes) for (const slug of Array.isArray(s.projects) ? s.projects : [])
      if (!perSlug[slug]) avis('site.json', `la llista "${t(s.name, DEF)}" diu "${slug}", i no surt a "feed"`);
    for (const n of fotosEntrada) if (!existeix(`data/entrance/${n}.webp`)) avis('site.json, entrance', `no trobo data/entrance/${n}.webp`, true);

    const siluetaHi = (qui, sil) => existeix(`assets/siluetes/${sil}.svg`) || avis(qui, `no trobo assets/siluetes/${sil}.svg`, true);
    if (!Number.isInteger(figures.every) || figures.every < 1) avis('figures.json', '"every" ha de ser un número sencer, 1 o més', true);
    if (!Array.isArray(figures.lines)) avis('figures.json', '"lines" ha de ser una llista: [ ... ]', true);
    else figures.lines.forEach((tr, i) => {
      const qui = `figures.json, línia ${i + 1}`;
      if (!Array.isArray(tr?.figures)) return avis(qui, 'no té "figures": [ ... ]', true);
      for (const n of tr.figures) {
        siluetaHi(qui, n.figure);
        if (typeof n.dots !== 'number' || n.dots < 0) avis(qui, `"dots" de ${n.figure} ha de ser un número (sense %)`, true);
        if (n.vary != null && (typeof n.vary !== 'number' || n.vary < 0)) avis(qui, `"vary" de ${n.figure} ha de ser un número`, true);
        if (n.to != null && !['bio', 'home'].includes(n.to)) avis(qui, `"to" de ${n.figure} ha de ser "bio" o "home"`, true);
      }
    });
    for (const sil of Array.isArray(figures.entrance) ? figures.entrance : []) siluetaHi('figures.json, entrance', sil);
    if (figures.strays != null) {
      if (!Array.isArray(figures.strays.figures)) avis('figures.json', '"strays" ha de portar "figures": [ ... ]', true);
      else for (const sil of figures.strays.figures) {
        siluetaHi('figures.json, strays', sil);
        if (!obraDe(sil)) avis('figures.json, strays', `"${sil}" no comença pel nom de cap projecte publicat: no sé on ha de portar`);
      }
    }
    return avisos;
  }

  return { rutes, noTrobada, revisar, publica, publicats, IDIOMES };
}
