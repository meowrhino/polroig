# polroig

Portfoli de Pol Roig Valldosera. <https://meowrhino.github.io/polroig/>

> **Regla d'or: només toques `data/` i `media/`.**
> La resta (build, css, js) és la maquinària: no cal obrir-la.

Quan puges un canvi a `main`, GitHub reconstrueix la web i la publica sola en un parell
de minuts. No has d'instal·lar res per publicar.

---

## Què hi ha

```
data/site.json         textos generals: bio curta, correu, les dues llistes de la home
data/projectes.json    els projectes, en l'ordre en què surten a la pàgina
media/<slug>/          les fotos de cada projecte (1.webp, 2.webp…) i els seus textos llargs
```

El **slug** és el nom del projecte a l'adreça: `meowrhino.github.io/polroig/eliza/`.
Minúscules, números i guions, sense accents ni espais. **No el canviïs mai** un cop
publicat: trencaria els enllaços que ja circulen.

## La primera vegada: preparar VS Code

Només es fa un cop.

1. A VS Code: **Fitxer → Nova finestra** i, a la benvinguda, **Clona el repositori Git…** →
   **Clona des de GitHub**. Entra amb el teu compte, tria `polroig` i una carpeta.
2. En obrir-la, VS Code et proposa instal·lar **Live Server** (a baix a la dreta): **Instal·la**.
3. A baix a la dreta surt **Go Live**: és la vista prèvia.

## Afegir un projecte, pas a pas

1. **Passa les fotos per [imgToWeb](https://meowrhino.github.io/imgToWeb/)**: 85 %, 2000 px,
   amb el renombrat 1, 2, 3… activat. Arrossega-les per posar-les en ordre abans de baixar el zip.
2. **Crea la carpeta** `media/<slug>/` i posa-hi les fotos: `1.webp`, `2.webp`…
   La `1.webp` és la que surt primer i la que es veu quan algú comparteix l'enllaç.
3. **Copia un bloc** `{ ... }` sencer de `data/projectes.json` i canvia els camps (taula de sota).
   On el posis és on sortirà a la pàgina.
4. **Afegeix el slug a una llista** de `data/site.json` → `seccions` (obra pròpia o escenografia).
   Si és obra pròpia, posa-hi també `"pagina": true`.
5. **Mira-ho amb Go Live** i, si està bé, **puja-ho** (a sota).

## Els camps d'un projecte

```json
{
  "slug": "eliza",
  "published": true,
  "titol": "Eliza",
  "etiqueta": { "cat": "Eliza [òpera]", "en": "Eliza [opera]" },
  "detall": { "cat": "(òpera de cambra, Gran Teatre del Liceu, 2024)", "en": "(chamber opera, …)" },
  "peu": { "cat": "*Eliza* (òpera de cambra), …", "en": "*Eliza* (chamber opera), …" },
  "imatges": 20
}
```

| camp | què fa |
|---|---|
| `slug` | l'adreça i el nom de la carpeta de `media/` |
| `published` | `true` surt a la web; `false` l'amaga (sense cometes) |
| `pagina` | *opcional*: `true` li dona pàgina pròpia (ara, l'obra pròpia). Sense, el "llegir més" es desplega a la mateixa home |
| `invertit` | *opcional*: `true` posa la seva pàgina en fons blanc i text negre |
| `titol` | el nom del projecte |
| `etiqueta` | *opcional*: com surt a la llista si ha de ser diferent del títol |
| `detall` | el que surt en rosa en passar el ratolí per la llista |
| `peu` | el text sota la foto |
| `imatges` | quantes fotos hi ha a `media/<slug>/` (el slideshow de la home) |
| `cartells` | *opcional*: quants cartells hi ha a `media/<slug>/cartells/`; surten a dalt de la seva pàgina, un al costat de l'altre |
| `galeries` | *opcional*: slideshows extra a la seva pàgina, sota el text. Cada galeria és una subcarpeta de `media/<slug>/` amb les fotos `1.webp`, `2.webp`…: `[{ "carpeta": "bocetos", "imatges": 16, "titol": { "cat": "(esbossos)", "en": "(sketches)" } }]` |
| `video` | *opcional*: un vídeo a la seva pàgina, sota el peu: `"video": "teaser.webm"`. Al costat hi ha d'haver la imatge que es veu abans de donar-li al play, amb el mateix nom acabat en `.poster.webp` (`teaser.poster.webp`) |

Cada text va en els dos idiomes: `{ "cat": "…", "en": "…" }`. Si en falta un, surt el català.

### Textos llargs

El text del "llegir més" va en un fitxer a part, un per idioma:
`media/<slug>/text.cat.md` i `media/<slug>/text.en.md`. Si el projecte té `"pagina": true`,
el text surt a la seva pàgina; si no, es desplega a la home amb "Llegir més".

Al `peu`, `\n` fa un salt de línia: així els crèdits entre parèntesis van a la línia de sota.

Dins de qualsevol text:

- una línia en blanc separa paràgrafs
- `*cursiva*` · `**negreta**`
- `[text de l'enllaç](https://…)`, o `[Full de sala](full-de-sala.pdf)` per a un fitxer de la carpeta del projecte

## Veure-ho abans de pujar-ho

**Go Live** a baix a la dreta de VS Code. S'obre la web al navegador i es refresca sola cada
cop que deses. Si hi ha un error en un JSON, t'ho diu en pantalla i on és.

## Pujar els canvis

1. Pestanya **Control de codi font** (les tres boletes unides, a l'esquerra).
2. Escriu què has fet (`projecte nou: requiem`) i **Confirma** (*Commit*). Si pregunta si vols
   afegir tots els canvis: **Sí**.
3. **Sincronitza els canvis** (*Sync*).
4. En un parell de minuts és a la web. A GitHub, pestanya **Actions**: groc és que està
   publicant, verd que ja està, vermell que alguna cosa no quadra.

**Abans de començar a tocar**, dona també a **Sincronitza**, per baixar el que hagi canviat.

## Si surt en vermell a Actions

La web no es trenca: es queda com estava fins que s'arregla. Clica la bola vermella i llegeix
l'últim missatge, que diu el fitxer i què passa:

- **"no és un JSON vàlid (línia 12, columna 5)"** → gairebé sempre una coma de més o de menys,
  o unes cometes sense tancar, a prop d'aquella línia.
- **"no trobo media/requiem/5.webp"** → el número d'`imatges` és més gran que les fotos que hi ha.
- **"hi ha dos projectes amb el mateix slug"** → canvia'n un.

---

## Per a nosaltres

- `build/paginas.mjs`: les plantilles (dades → HTML). Les fan servir el build i la vista prèvia.
- `build/build.mjs`: valida i escriu `dist/` (no es commiteja). `node build/build.mjs`.
- `build/preview.mjs` + `index.html`: la vista prèvia de Live Server (`/?p=/en/eliza/`).
- `.github/workflows/deploy.yml`: build i publicació a GitHub Pages a cada push.
- **Domini**: quan n'hi hagi, posa'l a `site.json` → `"domini"`. Això treu el `noindex`, obre
  el `robots.txt` i escriu el `CNAME`.
- **Cloudflare**: `wrangler.jsonc` i `_headers` ja hi són. A Workers Builds, comanda
  `node build/build.mjs` amb `BASE` buida.

Segueix la recepta de [meowrhino/JAMstack](https://github.com/meowrhino/JAMstack) (oriol-colomer per dins).
