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
const RESERVATS = ['bio', 'en', 'media', 'assets', 'css', 'js'];

/* ============================================================
   crearSitio — tot el que depèn de les dades
   ------------------------------------------------------------
     site, projectes   data/site.json i data/projectes.json
     ninots            data/ninots.json
     base              subcarpeta on se serveix ('' o '/polroig')
     text(slug, lang)  el contingut de media/<slug>/text.<lang>.md, o null
     mida(ruta)        { w, h } d'una imatge, o null
     preview           true a la vista prèvia: els enllaços van a ?p=/ruta/
   ============================================================ */
export function crearSitio({ site, projectes, ninots = [], base = '', text = () => null, mida = () => null, preview = false }) {
  const IDIOMES = site.idiomes;
  const DEF = site.idiomaDefecte;
  const B = String(base).replace(/\/$/, '');
  const publicats = projectes.filter(p => p && p.published);
  const perSlug = Object.fromEntries(publicats.map(p => [p.slug, p]));

  /* ---------- rutes ---------- */
  const raiz = p => B + (p.startsWith('/') ? p : '/' + p);
  const ruta = (l, path = '') => `${l === DEF ? '' : '/' + l}/${path}`.replace(/\/{2,}/g, '/');
  const url = (l, path = '') => (preview ? `${B}/?p=${ruta(l, path)}` : B + ruta(l, path));
  const publica = p => (site.domini ? `https://${site.domini}` : site.baseUrl.replace(/\/$/, '') + B)
    + (p.startsWith('/') ? p : '/' + p);
  const iso = l => (l === 'cat' ? 'ca' : l);
  const t = (obj, l) => (obj && typeof obj === 'object' ? obj[l] || obj[DEF] || '' : obj || '');
  const ui = (k, l) => t(Object.fromEntries(IDIOMES.map(i => [i, site.ui[i]?.[k]])), l);

  /* ---------- mini-markdown ----------
     *cursiva*, **negreta**, [text](enllaç). Un enllaç sense http és un
     fitxer de la carpeta del projecte: [Full de sala](full-de-sala.pdf). */
  const md = (s, slug) => esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, txt, href) => /^(https?:|mailto:)/.test(href)
      ? `<a href="${href}" target="_blank" rel="noopener">${txt}</a>`
      : `<a href="${raiz(`/media/${slug}/${href}`)}" target="_blank">${txt}</a>`);
  const paragrafs = (s, slug) => String(s || '').split(/\n\s*\n/).map(x => x.trim()).filter(Boolean)
    .map(x => `<p>${md(x, slug).replace(/\n/g, '<br>')}</p>`).join('\n');
  /** 155 caràcters nets per a la meta description. */
  const pla = s => String(s || '').replace(/\*|\[|\]\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
  const resum = s => { const p = pla(s); return p.length <= 155 ? p : p.slice(0, 152).replace(/\s+\S*$/, '') + '…'; };

  const img = (slug, carpeta, i) => `media/${slug}/${carpeta ? carpeta + '/' : ''}${i}.webp`;
  /** La foto per compartir: el primer cartell si n'hi ha, si no la primera foto. */
  const portada = p => img(p.slug, p.cartells ? 'cartells' : '', 1);
  /** El peu: mini-markdown i un salt de línia on n'hi ha un al JSON. */
  const peuHtml = (p, l) => md(t(p.peu, l), p.slug).replace(/\n/g, '<br>');

  /* ---------- trossos ---------- */
  function head({ l, titol, desc, path, imatge, jsonld, invertit }) {
    const m = imatge && mida(imatge);
    return `<!doctype html>
<html lang="${iso(l)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#000000">
  <title>${esc(titol)}</title>
  <meta name="description" content="${esc(desc)}">
  ${site.domini ? '' : '<meta name="robots" content="noindex">\n  '}<link rel="canonical" href="${publica(ruta(l, path))}">
  ${IDIOMES.map(i => `<link rel="alternate" hreflang="${iso(i)}" href="${publica(ruta(i, path))}">`).join('\n  ')}
  <link rel="alternate" hreflang="x-default" href="${publica(ruta(DEF, path))}">
  <meta property="og:type" content="${path && path !== 'bio/' ? 'article' : 'website'}">
  <meta property="og:title" content="${esc(titol)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:url" content="${publica(ruta(l, path))}">
  <meta property="og:locale" content="${l === 'cat' ? 'ca_ES' : 'en_GB'}">
  ${imatge ? `<meta property="og:image" content="${publica('/' + imatge)}">` : ''}
  ${m ? `<meta property="og:image:width" content="${m.w}">\n  <meta property="og:image:height" content="${m.h}">` : ''}
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="${raiz('/assets/favicon.svg')}" type="image/svg+xml">
  <link rel="stylesheet" href="${raiz('/css/style.css')}">
  <script type="module" src="${raiz('/js/polroig.js')}"></script>
  ${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>` : ''}
</head>
<body${invertit ? ' class="invertit"' : ''}>`;
  }
  const peu = () => `</body>\n</html>\n`;

  function capcalera(l, path, esHome = path === '') {
    const idiomes = IDIOMES.map(i => i === l
      ? `<a href="${url(i, path)}" aria-current="true">${esc(ui('nomIdioma', i))}</a>`
      : `<a href="${url(i, path)}" hreflang="${iso(i)}" lang="${iso(i)}">${esc(ui('nomIdioma', i))}</a>`).join(' · ');
    return `<header class="top">
  <a href="${esHome ? url(l, 'bio/') : url(l)}">(${esc(site.nomCurt)})</a>
  <a href="mailto:${esc(site.email)}">${esc(site.email)}</a>
  <span class="idiomes">${idiomes}</span>
  <a href="${url(l, 'bio/')}">${esc(ui('about', l))}</a>
</header>`;
  }

  /* Línies de punts amb siluetes (data/ninots.json). Cada pàgina les treu en
     l'ordre del JSON i torna a començar; el JS varia l'amplada dels punts. */
  let tram = 0;
  const passeig = () => ninots.length ? `<div class="passeig" aria-hidden="true">${ninots[tram++ % ninots.length].ninots
    .map(n => `<span class="punts" style="--w:${n.punts}%" data-v="${n.variacio ?? 0}"></span><img src="${raiz(`/assets/siluetes/${n.silueta}.svg`)}" alt="">`)
    .join('')}</div>` : '';

  /** Slideshow: sense JS es veu la primera foto; el JS mostra els botons. */
  function slides(p, carpeta, n, l, eager = false) {
    const primera = img(p.slug, carpeta, 1);
    const m = mida(primera);
    const alt = `${p.titol} — ${ui('imatge', l)} 1/${n}`;
    return `<figure class="slides"${m ? ` style="--r:${m.w}/${m.h}"` : ''} data-base="${raiz(`/media/${p.slug}/${carpeta ? carpeta + '/' : ''}`)}" data-n="${n}" data-titol="${esc(p.titol)}" data-txt="${esc(ui('imatge', l))}">
  <img src="${raiz('/' + primera)}" alt="${esc(alt)}"${m ? ` width="${m.w}" height="${m.h}"` : ''}${eager ? '' : ' loading="lazy"'} decoding="async">${n > 1 ? `
  <button class="ant" type="button" aria-label="${esc(ui('anterior', l))}" hidden></button>
  <button class="seg" type="button" aria-label="${esc(ui('seguent', l))}" hidden></button>
  <span class="compte" hidden>1/${n}</span>` : ''}
</figure>`;
  }

  /* ---------- pàgines ---------- */
  function home(l) {
    tram = 0;
    const dalt = passeig();
    const index = site.seccions.map((s, i) => `${i ? passeig() + passeig() : ''}
<section class="index">
  <h2>${esc(t(s.titol, l))}</h2>
  <ul>${s.projectes.filter(slug => perSlug[slug]).map(slug => {
      const p = perSlug[slug];
      return `
    <li><a href="#${slug}"><span class="titol">${esc(t(p.etiqueta, l) || p.titol)}</span><span class="detall">${esc(t(p.detall, l))}</span></a></li>`;
    }).join('')}
  </ul>
</section>`).join('');

    // Una línia de punts cada dos projectes, com a la refe.
    const feed = publicats.map((p, i) => `<article class="proj" id="${p.slug}">
${slides(p, '', p.imatges, l, i === 0)}
${p.peu ? `<p class="peu">${peuHtml(p, l)}${p.pagina
      ? ` <a class="mes" href="${url(l, p.slug + '/')}"><em>${esc(ui('llegirMes', l))}</em></a>` : ''}</p>` : ''}
${!p.pagina && (text(p.slug, l) || text(p.slug, DEF)) ? `<details class="desplegable">
<summary><em class="obrir">${esc(ui('llegirMes', l))}</em><em class="tancar">${esc(ui('tancar', l))}</em></summary>
${paragrafs(text(p.slug, l) || text(p.slug, DEF), p.slug)}
</details>` : ''}
</article>${i % 2 ? '\n' + passeig() : ''}`).join('\n');

    return head({
      l, path: '', titol: site.nom, desc: t(site.descripcio, l), imatge: portada(publicats[0]),
      jsonld: { '@context': 'https://schema.org', '@type': 'Person', name: site.nom,
        email: `mailto:${site.email}`, url: publica(ruta(l)), jobTitle: ui('ofici', l) },
    }) + `
${capcalera(l, '')}
<main>
<h1 class="sr">${esc(site.nom)}</h1>
${dalt}
<section class="bio"><p>${md(t(site.bio.curt, l), 'bio')} <a class="mes" href="${url(l, 'bio/')}"><em>${esc(ui('llegirMes', l))}</em></a>.</p></section>
${index}
<section class="feed">
${feed}
</section>
</main>
` + peu();
  }

  function projecte(p, l) {
    tram = 0;
    const txt = text(p.slug, l) || text(p.slug, DEF);
    // A dalt, els cartells fixos un al costat de l'altre; si no n'hi ha, el slideshow.
    const dalt = p.cartells
      ? `<div class="cartells">${Array.from({ length: p.cartells }, (_, i) => {
          const f = img(p.slug, 'cartells', i + 1), m = mida(f);
          return `<img src="${raiz('/' + f)}" alt="${esc(`${p.titol} — ${ui('cartell', l)} ${i + 1}`)}"${m ? ` width="${m.w}" height="${m.h}"` : ''}>`;
        }).join('')}</div>`
      : slides(p, '', p.imatges, l, true);
    return head({
      l, path: p.slug + '/', titol: `${p.titol} — ${site.nom}`,
      desc: resum(t(p.peu, l) || p.titol), imatge: portada(p), invertit: p.invertit,
    }) + `
${capcalera(l, p.slug + '/')}
<main class="pagina">
${passeig()}
<article>
<h1 class="sr">${esc(p.titol)}</h1>
${dalt}
${p.peu ? `<p class="peu">${peuHtml(p, l)}</p>` : ''}
${p.video ? (poster => (m => `<video src="${raiz(`/media/${p.slug}/${p.video}`)}" poster="${raiz('/' + poster)}"${m ? ` width="${m.w}" height="${m.h}"` : ''} controls playsinline preload="none"></video>`)(mida(poster)))(`media/${p.slug}/${p.video.replace(/\.\w+$/, '.poster.webp')}`) : ''}
${txt ? `<div class="text">\n${paragrafs(txt, p.slug)}\n</div>` : ''}
${(p.galeries || []).map(g => `<section class="galeria">${g.titol ? `<h2>${esc(t(g.titol, l))}</h2>` : ''}
${slides(p, g.carpeta, g.imatges, l)}
</section>`).join('\n')}
</article>
${passeig()}
<p><a class="mes" href="${url(l)}#${p.slug}">${esc(ui('tornar', l))}</a></p>
</main>
` + peu();
  }

  function bio(l) {
    tram = 0;
    return head({ l, path: 'bio/', titol: `${ui('about', l)} — ${site.nom}`, desc: resum(t(site.bio.curt, l)), imatge: 'media/bio/1.webp' })
      + `
${capcalera(l, 'bio/')}
<main class="pagina-bio">
${passeig()}
<h1 class="sr">${esc(site.nom)}</h1>
<img src="${raiz('/media/bio/1.webp')}" alt="${esc(site.nom)}"${(m => (m ? ` width="${m.w}" height="${m.h}"` : ''))(mida('media/bio/1.webp'))}>
${paragrafs(text('bio', l) || text('bio', DEF), 'bio')}
<p><a class="mes" href="${url(l)}">${esc(ui('tornar', l))}</a></p>
</main>
` + peu();
  }

  function noTrobada() {
    tram = 0;
    return head({ l: DEF, path: '', titol: `404 — ${site.nom}`, desc: t(site.descripcio, DEF) })
      + `\n${capcalera(DEF, '', false)}\n<main class="pagina-bio">\n${passeig()}\n`
      + IDIOMES.map(l => `<p lang="${iso(l)}">${esc(ui('noTrobada', l))} <a class="mes" href="${url(l)}">${esc(ui('tornar', l))}</a></p>`).join('\n')
      + `\n</main>\n` + peu();
  }

  /* ---------- el mapa de la web ---------- */
  function rutes() {
    const r = [];
    for (const l of IDIOMES) {
      r.push({ ruta: ruta(l), pintar: () => home(l) });
      r.push({ ruta: ruta(l, 'bio/'), pintar: () => bio(l) });
      for (const p of publicats.filter(p => p.pagina)) r.push({ ruta: ruta(l, p.slug + '/'), pintar: () => projecte(p, l) });
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
    const vistos = new Set();
    for (const l of IDIOMES) if (!text('bio', l)) avis('bio', `falta media/bio/text.${l}.md`);

    projectes.forEach((p, n) => {
      if (!p || typeof p !== 'object') return avis(`projecte ${n + 1}`, 'no és un bloc { ... }');
      const qui = p.slug || `projecte ${n + 1}`;
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.slug || '')) avis(qui, 'el slug només pot portar minúscules, números i guions', true);
      if (RESERVATS.includes(p.slug)) avis(qui, `"${p.slug}" ja el fa servir la web: tria un altre slug`, true);
      if (vistos.has(p.slug)) avis(qui, 'hi ha dos projectes amb el mateix slug', true);
      vistos.add(p.slug);
      if (typeof p.published !== 'boolean') avis(qui, '"published" ha de ser true o false, sense cometes', true);
      if (!p.published) return;
      if (!p.titol) avis(qui, 'falta "titol"');
      const carpetes = [['', p.imatges], ...(p.cartells ? [['cartells', p.cartells]] : []),
        ...(p.galeries || []).map(g => [g.carpeta, g.imatges])];
      for (const [c, n] of carpetes) {
        const on = `media/${p.slug}/${c ? c + '/' : ''}`;
        if (!Number.isInteger(n) || n < 1) { avis(qui, `"imatges" ha de ser un número (${on})`, true); continue; }
        for (let i = 1; i <= n; i++) if (!existeix(img(p.slug, c, i))) avis(qui, `no trobo ${on}${i}.webp`, true);
        if (existeix(img(p.slug, c, n + 1))) avis(qui, `a ${on} hi ha més de ${n} fotos: puja el número d'"imatges"`);
      }
      if (p.video && !existeix(`media/${p.slug}/${p.video}`)) avis(qui, `no trobo media/${p.slug}/${p.video}`, true);
      if (p.peu) for (const l of IDIOMES) if (!p.peu[l]) avis(qui, `falta el peu en "${l}"`);
      for (const l of IDIOMES) if (text(p.slug, DEF) && !text(p.slug, l)) avis(qui, `falta media/${p.slug}/text.${l}.md`);
    });
    for (const s of site.seccions) for (const slug of s.projectes)
      if (!projectes.some(p => p?.slug === slug)) avis('site.json', `la secció "${t(s.titol, DEF)}" diu "${slug}", i aquest projecte no existeix`);
    for (const p of publicats) if (!site.seccions.some(s => s.projectes.includes(p.slug)))
      avis(p.slug, 'no surt a cap llista de site.json → seccions');
    if (!Array.isArray(ninots)) avis('ninots.json', 'ha de ser una llista: comença per [ i acaba per ]', true);
    else ninots.forEach((tr, i) => {
      if (!Array.isArray(tr?.ninots)) return avis('ninots.json', `la línia ${i + 1} no té "ninots": [ ... ]`, true);
      for (const n of tr.ninots) {
        const qui = `ninots.json, línia ${i + 1}`;
        if (!existeix(`assets/siluetes/${n.silueta}.svg`)) avis(qui, `no trobo assets/siluetes/${n.silueta}.svg`, true);
        if (typeof n.punts !== 'number' || n.punts < 0) avis(qui, `"punts" de ${n.silueta} ha de ser un número (sense %)`, true);
        if (n.variacio != null && (typeof n.variacio !== 'number' || n.variacio < 0)) avis(qui, `"variacio" de ${n.silueta} ha de ser un número`, true);
      }
    });
    return avisos;
  }

  return { rutes, noTrobada, revisar, publica, publicats, IDIOMES };
}
