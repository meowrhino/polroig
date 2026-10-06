// polroig.js — l'únic JS de la web, i només afegeix: passar les fotos.
// Sense JS es veu la primera foto de cada projecte i la resta funciona igual.

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
