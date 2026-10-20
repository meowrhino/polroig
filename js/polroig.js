// polroig.js — l'únic JS de la web. Només afegeix; sense JS tot es veu igual:
// la primera foto de cada projecte, les línies a la seva mida base i l'adreça sense #.
//
//   1. línies de punts   cada visita, una mica més llargues o més curtes, i els ninots
//                        del scroll de la home, barrejats
//   2. slideshow         passar les fotos, i el ninot caminant mentre carreguen
//   3. #projecte         l'adreça diu quin projecte estàs mirant
//   4. entrada           la foto d'abans de la home: entres amb un clic, o sola quan la
//                        web ha carregat i ha passat la pausa
//   5. idioma            canviar d'idioma no torna a dalt de la pàgina

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

// Cada línia, ± "vary" % de la seva amplada base (data/figures.json).
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
  const fotos = fig.dataset.fotos.split(' ');   // els números de "photos", en ordre
  const n = fotos.length;
  vigilar(fig, img);

  // Sense mides de l'HTML (vista prèvia), la caixa pren la proporció de la primera foto.
  if (!fig.style.getPropertyValue('--r')) {
    const r = () => fig.style.setProperty('--r', img.naturalWidth / img.naturalHeight);
    img.complete && img.naturalWidth ? r() : img.addEventListener('load', r, { once: true });
  }
  if (n < 2) continue;

  // Si el projecte té un peu per a cada grup de fotos ("captions"), es veu el de la foto on ets.
  const peus = [...fig.parentElement.querySelectorAll(':scope > .peu[data-foto]')];
  // Al mòbil, les fletxes surten una estona (CSS: .avis) quan la foto entra a la pantalla i a cada toc.
  let rellotge;
  const avisar = () => {
    fig.classList.add('avis');
    clearTimeout(rellotge);
    rellotge = setTimeout(() => fig.classList.remove('avis'), 2500);
  };
  new IntersectionObserver(([e]) => e.isIntersecting && avisar(), { threshold: .5 }).observe(fig);
  let i = 1;
  const anar = d => {
    avisar();
    i = (i - 1 + d + n) % n + 1;
    img.src = `${fig.dataset.base}${fotos[i - 1]}.webp`;
    img.alt = `${fig.dataset.titol} — ${fig.dataset.txt} ${i}/${n}`;
    const actual = peus.filter(p => +p.dataset.foto <= i).at(-1);
    for (const p of peus) p.hidden = p !== actual;
    vigilar(fig, img);
    new Image().src = `${fig.dataset.base}${fotos[i % n]}.webp`;   // la següent, ja baixada
  };
  for (const [sel, d] of [['.ant', -1], ['.seg', 1]]) {
    const b = fig.querySelector(sel);
    b.hidden = false;
    b.addEventListener('click', () => anar(d));
  }
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

/* ---------- 4. entrada ---------- */
// El <head> ja ha decidit si surt (html.amb-entrada). Aquí, entrar: clic, Enter, Espai o Esc,
// o sola quan la home ha carregat i han passat els segons de site.json → entrance → seconds
// (una estona de silenci; el build els posa a data-segons). Si encara no ha carregat, s'espera:
// fa de loader.
const entrada = document.querySelector('.entrada');
if (entrada && document.documentElement.classList.contains('amb-entrada')) {
  const pausa = 1000 * (Number(entrada.dataset.segons) || 0);
  const tecla = e => { if (['Enter', ' ', 'Escape'].includes(e.key)) { e.preventDefault(); entrar(); } };
  const entrar = () => {
    if (entrada.classList.contains('fora')) return;
    try { sessionStorage.setItem('entrada', '1'); } catch { /* sense memòria: tornarà a sortir */ }
    removeEventListener('keydown', tecla);
    entrada.classList.add('fora');
    setTimeout(() => { document.documentElement.classList.remove('amb-entrada'); entrada.remove(); }, 400);
  };
  entrada.addEventListener('click', entrar);
  addEventListener('keydown', tecla);
  entrada.querySelector('button').focus({ preventScroll: true });
  const carregada = document.readyState === 'complete' ? Promise.resolve()
    : new Promise(r => addEventListener('load', r, { once: true }));
  Promise.all([carregada, new Promise(r => setTimeout(r, pausa))]).then(entrar);
}

/* ---------- 5. idioma ---------- */
// Canviar d'idioma et deixa on eres: a la home, al #projecte que diu l'adreça (els textos no fan
// igual en els dos idiomes, i en píxels t'hi passaries); a la resta, a la mateixa alçada.
// transicion.js llegeix l'enllaç després d'aquest clic, ja amb el # posat.
for (const a of document.querySelectorAll('.idiomes a[hreflang]')) a.addEventListener('click', () => {
  if (location.hash) a.hash = location.hash;
  else try { sessionStorage.setItem('scroll', scrollY); } catch { /* sense memòria: a dalt */ }
});
try {
  const y = sessionStorage.getItem('scroll');
  if (y) { sessionStorage.removeItem('scroll'); scrollTo({ top: +y, behavior: 'instant' }); }
} catch { /* sense memòria: a dalt */ }
