// polroig5 — tot surt de data.json. Rutes (hash):
//   #/            home: bio curta, índex i tots els projectes en seqüència
//   #/<slug>      home amb scroll al projecte (o la seva pàgina sencera si en té)
//   #/about       bio llarga
// Les imatges segueixen el nom d'imgToWeb: img/<carpeta>/1.webp, 2.webp...

const app = document.getElementById('app');
let D, lang, vista, scrollHome = 0;

try { lang = localStorage.getItem('lang'); } catch {}
if (lang !== 'cat' && lang !== 'en') lang = 'cat';

const L = (f) => f == null ? '' : typeof f === 'string' ? f : (f[lang] ?? f.cat);
const ui = (k) => D.ui[lang][k];

// Línies de punts amb siluetes: [amplada dels punts, silueta] per tram.
const PASSEIGS = [
  [['45%', 'walk']],
  [['70%', 'run'], ['8%', 'walk2']],
  [['26%', 'stroll']],
];
const passeig = (i) => `<div class="passeig" aria-hidden="true">${
  PASSEIGS[i % PASSEIGS.length].map(([w, s]) =>
    `<span class="punts" style="--w:${w}"></span><img src="img/siluetes/${s}.svg" alt="">`).join('')
}</div>`;

const slides = (carpeta, n) => `
  <figure class="slides" data-carpeta="${carpeta}" data-n="${n}">
    <img src="img/${carpeta}/1.webp" alt="" loading="lazy">
    ${n > 1 ? `<button class="ant" aria-label="${ui('anterior')}"></button>
    <button class="seg" aria-label="${ui('seguent')}"></button>
    <span class="compte">1/${n}</span>` : ''}
  </figure>`;

const paragrafs = (arr) => (L(arr) || []).map(p => `<p>${p}</p>`).join('');

const capcalera = () => `
  <header class="top">
    <a href="#/">(pol roig)</a>
    <a href="mailto:${D.email}">${D.email}</a>
    <span class="idiomes">
      <button data-lang="cat" aria-pressed="${lang === 'cat'}">cat</button> ·
      <button data-lang="en" aria-pressed="${lang === 'en'}">eng</button>
    </span>
    <a href="#/about">${ui('about')}</a>
  </header>`;

function projecte(slug) {
  const p = D.projectes[slug];
  const teMes = p.mes || p.pagina;
  return `
  <article class="proj" id="p-${slug}">
    ${slides(slug, p.imatges)}
    ${p.peu ? `<p class="peu">${L(p.peu)}${teMes ? ` <button class="obrir subratllat"><i>${ui('llegir_mes')}</i></button>` : ''}</p>` : ''}
    ${teMes ? `<div class="mes-txt" hidden>${paragrafs(p.mes)}${
      p.pagina ? `<p><a class="subratllat" href="#/${slug}"><i>${ui('pagina')}</i></a></p>` : ''}</div>` : ''}
  </article>`;
}

function home() {
  const index = D.seccions.map((s, i) => `
    ${i > 0 ? passeig(1) + passeig(2) : ''}
    <section class="index">
      <h2>${L(s.titol)}</h2>
      <ul>${s.projectes.map(slug => {
        const p = D.projectes[slug];
        return `<li><a href="#/${slug}"><span class="titol">${L(p.etiqueta) || p.titol}</span><span class="detall">${L(p.detall)}</span></a></li>`;
      }).join('')}</ul>
    </section>`).join('');

  // Una línia de punts cada dos projectes, com a la refe.
  const feed = D.ordre.map((slug, i) => projecte(slug) + (i % 2 ? passeig(i >> 1) : '')).join('');

  return `
    ${passeig(0)}
    <section class="bio"><p>${L(D.bio.curt)} <a class="subratllat" href="#/about"><i>${ui('llegir_mes')}</i></a>.</p></section>
    ${index}
    <section class="feed">${feed}</section>`;
}

const about = () => `
  ${passeig(0)}
  <section class="pagina-bio">
    <img src="${D.bio.foto}" alt="Pol Roig Valldosera">
    ${paragrafs(D.bio.llarg)}
    <p><a class="subratllat" href="#/">${ui('tornar')}</a></p>
  </section>`;

function pagina(slug) {
  const p = D.projectes[slug], pg = p.pagina;
  const [primera, ...resta] = pg.galeries;
  const galeria = (g) => `<section class="galeria">${g.titol ? `<h2>${L(g.titol)}</h2>` : ''}${slides(g.carpeta, g.imatges)}</section>`;
  return `
    ${passeig(0)}
    <article class="pagina">
      ${slides(primera.carpeta, primera.imatges)}
      <p class="peu">${L(p.peu)}</p>
      ${pg.video ? `<video src="${pg.video}" controls playsinline preload="metadata"></video>` : ''}
      <div class="text">${paragrafs(pg.text)}</div>
      ${resta.map(galeria).join('')}
      ${passeig(2)}
      <p><a class="subratllat" href="#/">${ui('tornar')}</a></p>
    </article>`;
}

// ---------- comportament ----------

function lligar() {
  app.querySelectorAll('.idiomes button').forEach(b => b.onclick = () => {
    lang = b.dataset.lang;
    try { localStorage.setItem('lang', lang); } catch {}
    render(true);
  });

  app.querySelectorAll('.obrir').forEach(b => b.onclick = () => {
    const txt = b.closest('.proj').querySelector('.mes-txt');
    txt.hidden = !txt.hidden;
    b.innerHTML = `<i>${ui(txt.hidden ? 'llegir_mes' : 'tancar')}</i>`;
  });

  app.querySelectorAll('.slides').forEach(fig => {
    const img = fig.querySelector('img');
    const n = +fig.dataset.n, carpeta = fig.dataset.carpeta;
    let i = 1;
    // La proporció de la primera imatge fixa la caixa: no salta en passar.
    const proporcio = () => fig.style.setProperty('--r', img.naturalWidth / img.naturalHeight);
    img.complete && img.naturalWidth ? proporcio() : img.addEventListener('load', proporcio, { once: true });
    const anar = (d) => {
      i = (i - 1 + d + n) % n + 1;
      img.src = `img/${carpeta}/${i}.webp`;
      fig.querySelector('.compte').textContent = `${i}/${n}`;
      new Image().src = `img/${carpeta}/${i % n + 1}.webp`;
    };
    fig.querySelector('.ant')?.addEventListener('click', () => anar(-1));
    fig.querySelector('.seg')?.addEventListener('click', () => anar(1));
  });
}

function render(mateixScroll = false) {
  const ruta = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
  const p = D.projectes[ruta];
  const nova = ruta === 'about' ? 'about' : p?.pagina ? ruta : 'home';

  // Dins la home, clicar a l'índex només fa scroll: no repintem.
  if (!mateixScroll && nova === 'home' && vista === 'home') {
    if (p) document.getElementById(`p-${ruta}`)?.scrollIntoView({ behavior: 'smooth' });
    return;
  }

  if (vista === 'home' && nova !== 'home') scrollHome = scrollY;
  const y = scrollY;
  vista = nova;
  document.documentElement.lang = lang === 'en' ? 'en' : 'ca';
  document.title = nova === 'home' ? 'pol roig valldosera' : `${nova === 'about' ? ui('about') : p.titol} — pol roig valldosera`;
  app.innerHTML = capcalera() + (nova === 'about' ? about() : nova === 'home' ? home() : pagina(nova));
  lligar();

  if (mateixScroll) scrollTo(0, y);
  else if (nova === 'home' && p) document.getElementById(`p-${ruta}`)?.scrollIntoView();
  else scrollTo(0, nova === 'home' ? scrollHome : 0);
}

fetch('data.json')
  .then(r => r.json())
  .then(d => {
    D = d;
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    addEventListener('hashchange', () => render());
    render();
  })
  .catch(e => { app.textContent = `Error carregant data.json: ${e.message}`; });
