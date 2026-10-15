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
export function crearSitio({ site, projectes, ninots = {}, base = '', text = () => null, mida = () => null, preview = false }) {
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

  const img = (slug, carpeta, i) => `media/${slug}/${carpeta ? carpeta + '/' : ''}${i}.webp`;
  /** La foto per compartir: el primer cartell si n'hi ha, si no la primera foto. */
  const portada = p => img(p.slug, p.cartells ? 'cartells' : '', 1);
  /** El peu: mini-markdown i un salt de línia on n'hi ha un al JSON. */
  const peuHtml = (p, l) => md(t(p.peu, l), p.slug).replace(/\n/g, '<br>');
  /** El text llarg en aquest idioma o, si no n'hi ha, en el per defecte. */
  const textDe = (slug, l) => text(slug, l) || text(slug, DEF);
  /** width i height d'una imatge, perquè el navegador li reservi el forat abans que baixi. */
  const wh = f => { const m = mida(f); return m ? ` width="${m.w}" height="${m.h}"` : ''; };
  /** JSON-LD dins d'un <script>: sense "<", que podria tancar-lo. */
  const ld = obj => `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', ...obj }).replace(/</g, '\\u003c')}</script>`;
  /** Pol, per a schema.org: a la home, a la bio i com a autor de cada projecte. */
  const persona = l => ({ '@type': 'Person', name: site.nom, url: publica(ruta(l)), email: `mailto:${site.email}`,
    jobTitle: ui('ofici', l), image: publica('/media/bio/1.webp') });

  /* ---------- trossos ---------- */
  const LOCALE = { cat: 'ca_ES', es: 'es_ES', en: 'en_GB' };

  /** <head> sencer: títol, descripció, idiomes, Open Graph i JSON-LD.
      Sense domini propi, noindex: la web encara és de proves. */
  function head({ l, titol, desc, path, imatge, jsonld, extra = '', indexar = !!site.domini }) {
    return `<!doctype html>
<html lang="${iso(l)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#000000">
  <title>${esc(titol)}</title>
  <meta name="description" content="${esc(desc)}">
  ${indexar ? '' : '<meta name="robots" content="noindex">\n  '}<link rel="canonical" href="${publica(ruta(l, path))}">
  ${IDIOMES.map(i => `<link rel="alternate" hreflang="${iso(i)}" href="${publica(ruta(i, path))}">`).join('\n  ')}
  <link rel="alternate" hreflang="x-default" href="${publica(ruta(DEF, path))}">
  <meta property="og:type" content="${path && path !== 'bio/' ? 'article' : 'website'}">
  <meta property="og:title" content="${esc(titol)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:url" content="${publica(ruta(l, path))}">
  <meta property="og:site_name" content="${esc(site.nom)}">
  <meta property="og:locale" content="${LOCALE[l] || l}">
  ${IDIOMES.filter(i => i !== l).map(i => `<meta property="og:locale:alternate" content="${LOCALE[i] || i}">`).join('\n  ')}
  ${imatge ? `<meta property="og:image" content="${publica('/' + imatge)}">` : ''}
  ${(m => (m ? `<meta property="og:image:width" content="${m.w}">\n  <meta property="og:image:height" content="${m.h}">` : ''))(imatge && mida(imatge))}
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="${raiz('/assets/favicon.svg')}" type="image/svg+xml">
  <link rel="stylesheet" href="${raiz('/css/style.css')}">
  <script>try { if (localStorage.getItem('gran')) document.documentElement.classList.add('gran'); } catch {}</script>${extra}
  <script type="module" src="${raiz('/js/polroig.js')}"></script>
  ${jsonld ? ld(jsonld) : ''}
</head>
<body>`;
  }
  const peu = (l, contacte = true) => `${contacte ? `<footer class="contacte">
  <a href="mailto:${esc(site.email)}">${esc(site.email)}</a>
  ${site.instagram ? `<a href="https://www.instagram.com/${esc(site.instagram)}/" target="_blank" rel="noopener">Instagram: @${esc(site.instagram)}</a>` : ''}
</footer>` : ''}
<button class="mida" type="button" aria-pressed="false" aria-label="${esc(ui('midaText', l))}" hidden>A+</button>
</body>
</html>
`;

  function capcalera(l, path) {
    const idiomes = IDIOMES.map(i => i === l
      ? `<a href="${url(i, path)}" aria-current="true">${esc(ui('nomIdioma', i))}</a>`
      : `<a href="${url(i, path)}" hreflang="${iso(i)}" lang="${iso(i)}">${esc(ui('nomIdioma', i))}</a>`).join(' · ');
    return `<header class="top">
  <a href="${path === 'bio/' ? url(l) : url(l, 'bio/')}">${esc(site.nomCurt)}</a>
  <a href="mailto:${esc(site.email)}">${esc(site.email)}</a>
  <span class="idiomes">${idiomes}</span>
</header>`;
  }

  /* Línies de punts amb siluetes (data/ninots.json). Cada pàgina les treu en
     l'ordre del JSON i torna a començar; el JS varia l'amplada dels punts i,
     a la home, barreja els del scroll.
     Els normals ("linies") porten a la bio, o a l'inici si diuen "porta": "inici". Els rars ("rars") són personatges
     escapats d'una obra: surten una sola vegada, al scroll de la home, mai al costat
     del seu projecte, i porten a ell. De quin projecte és, ho diu el nom del
     fitxer: concierto-barroco-banc.svg → concierto-barroco.
     Són enllaços repetits (la bio i els projectes ja tenen el seu), així que
     queden fora del teclat i del lector de pantalla. */
  const linies = Array.isArray(ninots.linies) ? ninots.linies : [];
  const cada = Number.isInteger(ninots.cadaProjectes) && ninots.cadaProjectes > 0 ? ninots.cadaProjectes : 2;
  const rars = Array.isArray(ninots.rars?.siluetes) ? ninots.rars.siluetes : [];
  /** El projecte d'on ve un rar: el slug més llarg amb què comença el nom. */
  const obraDe = sil => publicats.map(p => p.slug).filter(s => sil === s || sil.startsWith(s + '-'))
    .sort((a, b) => b.length - a.length)[0];
  const ninot = (sil, href, punts, v, obra) =>
    `<span class="punts" style="--w:${punts}%" data-v="${v ?? 0}"></span><a class="ninot" href="${href}" tabindex="-1"${obra ? ` data-obra="${obra}"` : ''} style="--m:url(${raiz(`/assets/siluetes/${sil}.svg`)})"><img src="${raiz(`/assets/siluetes/${sil}.svg`)}" alt=""></a>`;
  let tram = 0;   // per on va la llista; cada pàgina el torna a posar a 0
  /** Una línia. "extra": un ninot rar al final; "veins": els projectes del costat (per al JS). */
  const passeig = (l, { extra = '', veins } = {}) => linies.length ? `<div class="passeig" aria-hidden="true"${veins ? ` data-veins="${veins.join(' ')}"` : ''}>${linies[tram++ % linies.length].ninots
    .map(n => ninot(n.silueta, n.porta === 'inici' ? url(l) : url(l, 'bio/'), n.punts, n.variacio)).join('')}${extra}</div>` : '';
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
        lloc.set(j, ninot(sil, p.pagina ? url(l, obra + '/') : `${url(l)}#${obra}`, ninots.rars.punts ?? 10, ninots.rars.variacio, obra));
        return;
      }
    });
    return lloc;
  }

  /** Slideshow: sense JS es veu la primera foto; el JS mostra els botons i el ninot mentre carrega. */
  function slides(p, carpeta, n, l, eager = false) {
    const primera = img(p.slug, carpeta, 1);
    const m = mida(primera);
    const alt = `${p.titol} — ${ui('imatge', l)} 1/${n}`;
    // eager: la primera foto de la pàgina, la que el navegador ha de baixar abans que res (LCP).
    return `<figure class="slides"${m ? ` style="--r:${m.w}/${m.h}"` : ''} data-base="${raiz(`/media/${p.slug}/${carpeta ? carpeta + '/' : ''}`)}" data-n="${n}" data-titol="${esc(p.titol)}" data-txt="${esc(ui('imatge', l))}">
  <img src="${raiz('/' + primera)}" alt="${esc(alt)}"${wh(primera)}${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async">${n > 1 ? `
  <button class="ant" type="button" aria-label="${esc(ui('anterior', l))}" hidden></button>
  <button class="seg" type="button" aria-label="${esc(ui('seguent', l))}" hidden></button>
  <span class="compte" hidden>1/${n}</span>
  <span class="fletxa" hidden></span>` : ''}
</figure>`;
  }

  /* ---------- pàgines ---------- */
  function home(l) {
    tram = 0;
    const dalt = passeig(l);
    const index = site.seccions.map((s, i) => `${i ? passeig(l) + passeig(l) : ''}
<section class="index">
  <h2>${esc(t(s.titol, l))}</h2>
  <ul>${s.projectes.filter(slug => perSlug[slug]).map(slug => {
      const p = perSlug[slug];
      return `
    <li><a href="#${slug}"><span class="titol">${esc(t(p.etiqueta, l) || p.titol)}</span><span class="detall">${esc(t(p.detall, l))}</span></a></li>`;
    }).join('')}
  </ul>
</section>`).join('');

    // Una línia de punts cada "cadaProjectes" projectes (data/ninots.json), amb els rars repartits.
    const linia = publicats.map((_, i) => i).filter(i => (i + 1) % cada === 0);
    const veinsDe = j => [publicats[linia[j]]?.slug, publicats[linia[j] + 1]?.slug].filter(Boolean);
    const llocRar = repartirRars(l, veinsDe, linia.length);
    const feed = publicats.map((p, i) => `<article class="proj" id="${p.slug}">
${slides(p, '', p.imatges, l, i === 0)}
${(p.peus || []).map((x, k) => `<p class="peu" data-foto="${x.foto}"${k ? ' hidden' : ''}>${md(t(x, l), p.slug)}</p>`).join('\n')}
${p.peu ? `<p class="peu">${peuHtml(p, l)}${p.pagina && !textDe(p.slug, l)
      ? ` <a class="mes" href="${url(l, p.slug + '/')}"><em>${esc(ui('llegirMes', l))}</em></a>` : ''}</p>` : ''}
${textDe(p.slug, l) ? `<details class="desplegable">
<summary><em class="obrir">${esc(ui('llegirMes', l))}</em><em class="tancar">${esc(ui('tancar', l))}</em></summary>
${p.pagina
      // Amb pàgina pròpia, el desplegable és el primer paràgraf i porta a la resta.
      ? paragrafs(primer(textDe(p.slug, l)), p.slug).replace(/<\/p>$/,
        ` <a class="mes" href="${url(l, p.slug + '/')}"><em>${esc(ui('veurePagina', l))}</em></a></p>`)
      : paragrafs(textDe(p.slug, l), p.slug)}
</details>` : ''}
</article>${(i + 1) % cada ? '' : (j => '\n' + passeig(l, { extra: llocRar.get(j), veins: veinsDe(j) }))(linia.indexOf(i))}`).join('\n');

    return head({
      l, path: '', titol: site.nom, desc: t(site.descripcio, l), imatge: portada(publicats[0]),
      jsonld: persona(l), extra: entrada.length ? ENTRADA_HEAD : '',
    }) + `
${capcalera(l, '')}
${entradaHtml(l)}
<main>
<h1 class="sr">${esc(site.nom)}</h1>
${dalt}
<section class="bio"><p>${md(t(site.bio.curt, l), 'bio')} <a class="mes" href="${url(l, 'bio/')}"><em>${esc(ui('llegirMes', l))}</em></a></p></section>
${index}
<section class="feed">
${feed}
</section>
</main>
` + peu(l);
  }

  /* ---------- l'entrada ----------
     Abans de la home, una foto a l'atzar de media/entrada/ (site.json → "entrada") amb la
     capçalera a sobre i línies de punts que s'escriuen amb el ninot fent de cursor. Un clic
     (o Enter, Espai, Esc) i entres. Una vegada per sessió, com barbarawong; sense JS, amb
     "menys moviment" al sistema o si l'adreça porta a un projecte (#slug), no surt. El <head> decideix abans de pintar (html.amb-entrada)
     perquè la home no faci pampallugues; js/polroig.js la treu. */
  const entrada = Array.isArray(ninots.entrada) && site.entrada?.imatges > 0 ? ninots.entrada : [];
  const ENTRADA_HEAD = `
  <script>try { if (!location.hash && !sessionStorage.getItem('entrada') && !matchMedia('(prefers-reduced-motion: reduce)').matches) document.documentElement.classList.add('amb-entrada'); } catch {}</script>`;
  const entradaHtml = l => entrada.length ? `<div class="entrada">
  <img alt="" data-n="${site.entrada.imatges}" data-base="${raiz('/media/entrada/')}">
  <script>{ const i = document.currentScript.previousElementSibling; if (document.documentElement.classList.contains('amb-entrada')) i.src = i.dataset.base + (1 + Math.floor(Math.random() * i.dataset.n)) + '.webp'; }</script>
  <div class="escriptura" aria-hidden="true">${entrada.map((sil, k) => `
    <div class="passeig" style="--k:${k}"><span class="punts"></span><img src="${raiz(`/assets/siluetes/${sil}.svg`)}" alt=""></div>`).join('')}
  </div>
  <button class="sr" type="button">${esc(ui('entrar', l))}</button>
</div>` : '';

  /** El vídeo, amb la seva imatge d'espera (teaser.webm → teaser.poster.webp). */
  function video(p) {
    const poster = `media/${p.slug}/${p.video.replace(/\.\w+$/, '.poster.webp')}`;
    return `<video src="${raiz(`/media/${p.slug}/${p.video}`)}" poster="${raiz('/' + poster)}"${wh(poster)} controls playsinline preload="none"></video>`;
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
      if (nom === 'slides') return `<div class="bloc">${slides(p, '', p.imatges, l)}${peuDe(c)}</div>`;
      if (nom === 'video' && p.video) return `<div class="bloc">${video(p)}${peuDe(c)}</div>`;
      const g = nom === 'galeria' && (p.galeries || []).find(g => g.carpeta === arg);
      if (g) return `<div class="bloc">${slides(p, g.carpeta, g.imatges, l)}${peuDe(c)}</div>`;
      return '';   // marca desconeguda: el build ja n'avisa
    }).join('\n');
  }

  function projecte(p, l) {
    tram = 0;
    const txt = textDe(p.slug, l);
    // El vídeo i les galeries que el text no col·loca amb una marca van al seu lloc de sempre.
    const posats = marques(txt).map(m => (m[1] === 'galeria' ? m[2] : m[1]));
    // A dalt, els cartells fixos un al costat de l'altre; si no n'hi ha, el slideshow.
    const dalt = p.cartells
      ? `<div class="cartells">${Array.from({ length: p.cartells }, (_, i) => {
          const f = img(p.slug, 'cartells', i + 1);
          return `<img src="${raiz('/' + f)}" alt="${esc(`${p.titol} — ${ui('cartell', l)} ${i + 1}`)}"${wh(f)}${i ? '' : ' fetchpriority="high"'}>`;
        }).join('')}</div>`
      : slides(p, '', p.imatges, l, true);
    return head({
      l, path: p.slug + '/', titol: `${p.titol} — ${site.nom}`,
      desc: resum(t(p.peu, l) || p.titol), imatge: portada(p),
      jsonld: { '@type': 'CreativeWork', name: p.titol, url: publica(ruta(l, p.slug + '/')), inLanguage: iso(l),
        description: resum(t(p.peu, l)), image: publica('/' + portada(p)), creator: persona(l) },
    }) + `
${capcalera(l, p.slug + '/')}
<main class="pagina">
${passeig(l)}
<article>
<h1 class="sr">${esc(p.titol)}</h1>
${dalt}
${p.peu ? `<p class="peu">${peuHtml(p, l)}</p>` : ''}
${p.video && !posats.includes('video') ? video(p) : ''}
${txt ? `<div class="text">\n${cos(p, l, txt)}\n</div>` : ''}
${(p.galeries || []).filter(g => !posats.includes(g.carpeta)).map(g => `<section class="galeria">${g.titol ? `<h2>${esc(t(g.titol, l))}</h2>` : ''}
${slides(p, g.carpeta, g.imatges, l)}
</section>`).join('\n')}
</article>
${passeig(l)}
<p><a class="mes" href="${url(l)}#${p.slug}">${esc(ui('tornar', l))}</a></p>
</main>
` + peu(l);
  }

  function bio(l) {
    tram = 0;
    return head({ l, path: 'bio/', titol: `${ui('about', l)} — ${site.nom}`, desc: resum(t(site.bio.curt, l)), imatge: 'media/bio/1.webp',
      jsonld: { '@type': 'ProfilePage', inLanguage: iso(l), mainEntity: persona(l) } })
      + `
${capcalera(l, 'bio/')}
<main class="pagina-bio">
${passeig(l)}
<h1 class="sr">${esc(site.nom)}</h1>
<img src="${raiz('/media/bio/1.webp')}" alt="${esc(site.nom)}"${wh('media/bio/1.webp')} fetchpriority="high">
${paragrafs(textDe('bio', l), 'bio')}
<section class="contacte-bio">
<h2>${esc(ui('contacte', l))}</h2>
<p><em>${esc(ui('correu', l))}: <a href="mailto:${esc(site.email)}">${esc(site.email)}</a></em></p>
${site.instagram ? `<p><em>Instagram: <a href="https://www.instagram.com/${esc(site.instagram)}/" target="_blank" rel="noopener">@${esc(site.instagram)}</a></em></p>` : ''}
</section>
<p><a class="mes" href="${url(l)}">${esc(ui('tornar', l))}</a></p>
</main>
` + peu(l, false);
  }

  function noTrobada() {
    tram = 0;
    return head({ l: DEF, path: '', titol: `404 — ${site.nom}`, desc: t(site.descripcio, DEF), indexar: false })
      + `\n${capcalera(DEF, '')}\n<main class="pagina-bio">\n${passeig(DEF)}\n`
      + IDIOMES.map(l => `<p lang="${iso(l)}">${esc(ui('noTrobada', l))} <a class="mes" href="${url(l)}">${esc(ui('tornar', l))}</a></p>`).join('\n')
      + `\n</main>\n` + peu(DEF);
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
      if (p.peus != null) {
        if (!Array.isArray(p.peus)) avis(qui, '"peus" ha de ser una llista: [ ... ]', true);
        else p.peus.forEach((x, k) => {
          if (!Number.isInteger(x?.foto) || x.foto < 1 || x.foto > p.imatges) avis(qui, `el peu ${k + 1} ha de dir des de quina "foto" va (un número de l'1 al ${p.imatges})`, true);
          for (const l of IDIOMES) if (!x?.[l]) avis(qui, `al peu ${k + 1} li falta "${l}"`);
        });
      }
      for (const l of IDIOMES) if (text(p.slug, DEF) && !text(p.slug, l)) avis(qui, `falta media/${p.slug}/text.${l}.md`);
      for (const l of IDIOMES) for (const [marca, nom, arg] of marques(text(p.slug, l))) {
        const bona = ['slides', 'columnes', '/columnes'].includes(nom) || (nom === 'video' && p.video)
          || (nom === 'galeria' && (p.galeries || []).some(g => g.carpeta === arg));
        if (!bona) avis(qui, `a text.${l}.md, "[[${nom}${arg ? ":" + arg : ""}]]" no porta enlloc: mira el nom de la galeria o que el projecte tingui vídeo`);
      }
    });
    for (const s of site.seccions) for (const slug of s.projectes)
      if (!projectes.some(p => p?.slug === slug)) avis('site.json', `la secció "${t(s.titol, DEF)}" diu "${slug}", i aquest projecte no existeix`);
    for (const p of publicats) if (!site.seccions.some(s => s.projectes.includes(p.slug)))
      avis(p.slug, 'no surt a cap llista de site.json → seccions');
    if (!Number.isInteger(ninots.cadaProjectes) || ninots.cadaProjectes < 1) avis('ninots.json', '"cadaProjectes" ha de ser un número sencer, 1 o més', true);
    if (!Array.isArray(ninots.linies)) avis('ninots.json', '"linies" ha de ser una llista: [ ... ]', true);
    for (const sil of Array.isArray(ninots.entrada) ? ninots.entrada : [])
      if (!existeix(`assets/siluetes/${sil}.svg`)) avis('ninots.json, entrada', `no trobo assets/siluetes/${sil}.svg`, true);
    if (site.entrada) for (let i = 1; i <= site.entrada.imatges; i++)
      if (!existeix(`media/entrada/${i}.webp`)) avis('site.json, entrada', `no trobo media/entrada/${i}.webp`, true);
    else ninots.linies.forEach((tr, i) => {
      if (!Array.isArray(tr?.ninots)) return avis('ninots.json', `la línia ${i + 1} no té "ninots": [ ... ]`, true);
      for (const n of tr.ninots) {
        const qui = `ninots.json, línia ${i + 1}`;
        if (!existeix(`assets/siluetes/${n.silueta}.svg`)) avis(qui, `no trobo assets/siluetes/${n.silueta}.svg`, true);
        if (typeof n.punts !== 'number' || n.punts < 0) avis(qui, `"punts" de ${n.silueta} ha de ser un número (sense %)`, true);
        if (n.variacio != null && (typeof n.variacio !== 'number' || n.variacio < 0)) avis(qui, `"variacio" de ${n.silueta} ha de ser un número`, true);
        if (n.porta != null && !['bio', 'inici'].includes(n.porta)) avis(qui, `"porta" de ${n.silueta} ha de ser "bio" o "inici"`, true);
      }
    });
    if (ninots.rars != null) {
      if (!Array.isArray(ninots.rars.siluetes)) avis('ninots.json', '"rars" ha de portar "siluetes": [ ... ]', true);
      else for (const sil of ninots.rars.siluetes) {
        if (!existeix(`assets/siluetes/${sil}.svg`)) avis('ninots.json, rars', `no trobo assets/siluetes/${sil}.svg`, true);
        if (!obraDe(sil)) avis('ninots.json, rars', `"${sil}" no comença pel slug de cap projecte publicat: no sé on ha de portar`);
      }
    }
    return avisos;
  }

  return { rutes, noTrobada, revisar, publica, publicats, IDIOMES };
}
