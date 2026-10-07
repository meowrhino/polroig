// polroig.js — l'únic JS de la web, i només afegeix: passar les fotos, variar les línies de punts i portar el #projecte a l'adreça.
// Sense JS es veu la primera foto de cada projecte, les línies fan la seva mida base i la resta funciona igual.

// Cada línia de punts, ± "variacio" % de la seva amplada base (data/ninots.json), a cada visita.
for (const p of document.querySelectorAll('.passeig .punts')) {
  const w = parseFloat(p.style.getPropertyValue('--w')), v = +p.dataset.v || 0;
  p.style.setProperty('--w', `${w * (1 + (Math.random() * 2 - 1) * v / 100)}%`);
}

for (const fig of document.querySelectorAll('.slides')) {
  const img = fig.querySelector('img');
  const n = +fig.dataset.n;

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
    new Image().src = `${fig.dataset.base}${i % n + 1}.webp`;   // la següent, ja baixada
  };
  for (const [sel, d] of [['.ant', -1], ['.seg', 1]]) {
    const b = fig.querySelector(sel);
    b.hidden = false;
    b.addEventListener('click', () => anar(d));
  }
  compte.hidden = false;
}

// A la home, l'adreça porta el #slug del projecte que hi ha a mitja pantalla (sense omplir l'historial):
// si en copies l'enllaç, obre on eres. A dalt de tot, sense #.
const projectes = document.querySelectorAll('.proj');
if (projectes.length) {
  const marcar = hash => hash !== location.hash && history.replaceState(null, '', hash || location.pathname + location.search);
  const vist = new IntersectionObserver(es => {
    for (const e of es) if (e.isIntersecting) marcar(e.target.id ? `#${e.target.id}` : '');
  }, { rootMargin: '-50% 0px -50% 0px' });
  for (const el of [document.querySelector('main > .bio'), ...document.querySelectorAll('.index'), ...projectes]) el && vist.observe(el);
}
