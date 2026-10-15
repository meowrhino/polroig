// polroig.js — l'únic JS de la web. Només afegeix; sense JS tot es veu igual:
// la primera foto de cada projecte, les línies a la seva mida base i l'adreça sense #.
//
//   1. línies de punts   cada visita, una mica més llargues o més curtes, i els ninots
//                        del scroll de la home, barrejats
//   2. slideshow         passar les fotos, i el ninot caminant mentre carreguen
//   3. #projecte         l'adreça diu quin projecte estàs mirant
//   4. A+                la lletra gran, si algú la necessita

/* ---------- 1. línies de punts ---------- */
// Els ninots del scroll de la home (els del menú, quiets), barrejats a cada visita.
// Cada línia es queda amb tants ninots com tenia. Un rar mai va al costat del seu
// projecte (data-veins), ni n'hi ha dos a la mateixa línia; si després de 200
// intents no surt, es queda com l'ha deixat el build.
const linies = [...document.querySelectorAll('.feed .passeig')];
if (linies.length) {
  const parells = linies.flatMap(li => [...li.querySelectorAll('.ninot')].map(a => [a.previousElementSibling, a]));
  const quants = linies.map(li => li.querySelectorAll('.ninot').length);
  for (let intent = 0; intent < 200; intent++) {
    const b = [...parells];
    for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
    let k = 0;
    const repartiment = quants.map(q => b.slice(k, k += q));
    const bo = repartiment.every((ps, i) => {
      const obres = ps.map(([, a]) => a.dataset.obra).filter(Boolean);
      return obres.length < 2 && !obres.some(o => linies[i].dataset.veins.split(' ').includes(o));
    });
    if (!bo) continue;
    repartiment.forEach((ps, i) => linies[i].replaceChildren(...ps.flat()));
    break;
  }
}

// Cada línia, ± "variacio" % de la seva amplada base (data/ninots.json).
for (const p of document.querySelectorAll('.passeig .punts')) {
  const w = parseFloat(p.style.getPropertyValue('--w')), v = +p.dataset.v || 0;
  p.style.setProperty('--w', `${w * (1 + (Math.random() * 2 - 1) * v / 100)}%`);
}

/* ---------- 2. slideshow ---------- */
/** Mentre la foto no arriba, la caixa mostra el ninot caminant (CSS: .carregant).
    Espera 150 ms abans de treure'l: si la foto ja era a la memòria, no parpelleja. */
function vigilar(fig, img) {
  if (img.complete && img.naturalWidth) return fig.classList.remove('carregant');
  const espera = setTimeout(() => fig.classList.add('carregant'), 150);
  const fet = () => { clearTimeout(espera); fig.classList.remove('carregant'); };
  img.addEventListener('load', fet, { once: true });
  img.addEventListener('error', fet, { once: true });
}

for (const fig of document.querySelectorAll('.slides')) {
  const img = fig.querySelector('img');
  const n = +fig.dataset.n;
  vigilar(fig, img);

  // Sense mides de l'HTML (vista prèvia), la caixa pren la proporció de la primera foto.
  if (!fig.style.getPropertyValue('--r')) {
    const r = () => fig.style.setProperty('--r', img.naturalWidth / img.naturalHeight);
    img.complete && img.naturalWidth ? r() : img.addEventListener('load', r, { once: true });
  }
  if (n < 2) continue;

  const compte = fig.querySelector('.compte');
  let i = 1;
  const anar = d => {
    i = (i - 1 + d + n) % n + 1;
    img.src = `${fig.dataset.base}${i}.webp`;
    img.alt = `${fig.dataset.titol} — ${fig.dataset.txt} ${i}/${n}`;
    compte.textContent = `${i}/${n}`;
    vigilar(fig, img);
    new Image().src = `${fig.dataset.base}${i % n + 1}.webp`;   // la següent, ja baixada
  };
  for (const [sel, d] of [['.ant', -1], ['.seg', 1]]) {
    const b = fig.querySelector(sel);
    b.hidden = false;
    b.addEventListener('click', () => anar(d));
  }
  compte.hidden = false;
  fig.querySelector('.fletxa').hidden = false;
}

/* ---------- 3. #projecte ---------- */
// A la home, l'adreça porta el #slug del projecte que hi ha a mitja pantalla (sense omplir
// l'historial): si en copies l'enllaç, obre on eres. A dalt de tot, sense #.
const projectes = document.querySelectorAll('.proj');
if (projectes.length) {
  const marcar = hash => hash !== location.hash && history.replaceState(null, '', hash || location.pathname + location.search);
  const vist = new IntersectionObserver(es => {
    for (const e of es) if (e.isIntersecting) marcar(e.target.id ? `#${e.target.id}` : '');
  }, { rootMargin: '-50% 0px -50% 0px' });
  for (const el of [document.querySelector('main > .bio'), ...document.querySelectorAll('.index'), ...projectes]) el && vist.observe(el);
}

/* ---------- 4. A+ ---------- */
// La lletra a mida de maqueta (html.gran). Es recorda; el <head> la posa abans de pintar.
const mida = document.querySelector('.mida');
if (mida) {
  const html = document.documentElement;
  const pintar = () => {
    const gran = html.classList.contains('gran');
    mida.setAttribute('aria-pressed', gran);
    mida.textContent = gran ? 'A−' : 'A+';
  };
  mida.hidden = false;
  pintar();
  mida.addEventListener('click', () => {
    const gran = html.classList.toggle('gran');
    try { gran ? localStorage.setItem('gran', '1') : localStorage.removeItem('gran'); } catch { /* sense memòria: només aquesta pàgina */ }
    pintar();
  });
}
