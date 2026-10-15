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
data/ninots.json       les línies de punts amb ninots
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
  "etiqueta": { "cat": "Eliza - òpera", "es": "Eliza - ópera", "en": "Eliza - opera" },
  "detall": { "cat": "(Òpera de cambra, Gran Teatre del Liceu, 2024)", "es": "(Ópera de cámara, …)", "en": "(Chamber opera, …)" },
  "peu": { "cat": "*Eliza* (òpera de cambra), …", "es": "*Eliza* (ópera de cámara), …", "en": "*Eliza* (chamber opera), …" },
  "imatges": 20
}
```

| camp | què fa |
|---|---|
| `slug` | l'adreça i el nom de la carpeta de `media/` |
| `published` | `true` surt a la web; `false` l'amaga (sense cometes) |
| `pagina` | *opcional*: `true` li dona pàgina pròpia (ara, l'obra pròpia). Sense, el "llegir més" es desplega a la mateixa home |
| `titol` | el nom del projecte |
| `etiqueta` | *opcional*: com surt a la llista si ha de ser diferent del títol |
| `detall` | el que surt en rosa al costat del títol, a la llista |
| `peu` | el text sota la foto |
| `peus` | *opcional*: un peu diferent segons la foto, per als projectes que en barregen uns quants (el "+++"). Cada peu diu des de quina foto val, fins al següent: `[{ "foto": 1, "cat": "…", "es": "…", "en": "…" }, { "foto": 3, "cat": "…", "es": "…", "en": "…" }]` |
| `imatges` | quantes fotos hi ha a `media/<slug>/` (el slideshow de la home) |
| `cartells` | *opcional*: quants cartells hi ha a `media/<slug>/cartells/`; surten a dalt de la seva pàgina, un al costat de l'altre |
| `galeries` | *opcional*: slideshows extra a la seva pàgina, sota el text. Cada galeria és una subcarpeta de `media/<slug>/` amb les fotos `1.webp`, `2.webp`…: `[{ "carpeta": "bocetos", "imatges": 16, "titol": { "cat": "(esbossos)", "es": "(bocetos)", "en": "(sketches)" } }]` |
| `video` | *opcional*: un vídeo a la seva pàgina, sota el peu: `"video": "teaser.webm"`. Al costat hi ha d'haver la imatge que es veu abans de donar-li al play, amb el mateix nom acabat en `.poster.webp` (`teaser.poster.webp`) |

Cada text va en els tres idiomes: `{ "cat": "…", "es": "…", "en": "…" }`. Si en falta un, surt el català.

### Textos llargs

El text del "llegir més" va en un fitxer a part, un per idioma:
`media/<slug>/text.cat.md`, `media/<slug>/text.es.md` i `media/<slug>/text.en.md`. A la home, "Llegir més" el desplega
sota el peu. Si el projecte té `"pagina": true`, el desplegable només mostra el primer paràgraf,
amb "Veure la pàgina sencera" al final, i el text sencer surt a la seva pàgina.

Al `peu`, `\n` fa un salt de línia: així els crèdits entre parèntesis van a la línia de sota.

Dins de qualsevol text:

- una línia en blanc separa paràgrafs
- `*cursiva*` · `**negreta**`
- `[text de l'enllaç](https://…)`, o `[Full de sala](full-de-sala.pdf)` per a un fitxer de la carpeta del projecte
- un paràgraf que comença per `> ` és una cita: surt en rosa

A la pàgina d'un projecte, el text pot col·locar el slideshow, el vídeo i les galeries on toqui,
cadascun en un paràgraf sol, i amb un peu a sota després de `|`:

```
[[slides]]
[[video | Teaser dirigit per…]]
[[galeria:bocetos | Esbossos preliminars de Pol Roig…]]
```

I el que vagi entre `[[columnes]]` i `[[/columnes]]` surt a dues columnes (la fitxa artística).
El vídeo i les galeries que el text no col·loca surten al final, com sempre.

## Els ninots

Les línies de punts amb un ninot al final surten de `data/ninots.json`.

`"cadaProjectes"` diu cada quants projectes de la home surt una línia: `1`, entre tots;
`2`, cada dos; i així.

Hi ha dos tipus de ninots:

- **els normals** (`"linies"`): surten a totes les pàgines, s'hi repeteixen, i en clicar-los porten a la bio (o a l'inici, amb `"porta": "inici"`).
- **els rars** (`"rars"`): personatges escapats d'una obra. Cadascun surt **una sola vegada**,
  al scroll de la home, mai a la línia de sota o de sobre del seu projecte, i en clicar-lo
  porta al projecte d'on ve. De quin projecte és, ho diu el nom del fitxer: comença pel slug
  (`concierto-barroco-banc.svg` → Concierto barroco).

Els de dalt de la home (al costat del menú) són sempre els mateixos; els del scroll es barregen
a cada visita.

A `"linies"`, cada bloc `{ "ninots": [ ... ] }` és una línia, i cada pàgina les va posant en l'ordre del fitxer:
la primera, la segona, la tercera… i quan s'acaben torna a començar. Una línia pot portar
més d'un ninot (`run` i `walk2` van junts).

```json
{ "ninots": [
  { "silueta": "run", "punts": 70, "variacio": 15 },
  { "silueta": "walk2", "punts": 8, "variacio": 15 }
] }
```

Els camps de cada ninot:

| camp | què fa |
|---|---|
| `silueta` | el nom del dibuix: `assets/siluetes/<silueta>.svg` |
| `punts` | quant ocupen els punts abans del ninot, en % de l'amplada del text (sense `%`) |
| `variacio` | quant pot créixer o encongir a cada visita, en % de `punts`: `15` vol dir que una línia de 70 fa entre 59,5 i 80,5. `0`, sempre igual |
| `porta` | *opcional*: on porta en clicar-lo: `"bio"` (si no hi és) o `"inici"` |

A `"rars"`, `"siluetes"` és la llista dels rars, i `"punts"` / `"variacio"` els punts que porten davant.

Per a un ninot nou, posa el seu SVG a `assets/siluetes/` (sense fons, en blanc) i afegeix-lo
al JSON. **La mida va dins del dibuix**: tots els ninots es pinten a la mateixa alçada, i cada
SVG té un llenç d'1,24 adults (el `viewBox`) amb el dibuix a baix de tot. Un adult ocupa el 80 %
del llenç, el nen del cotxet (`stroll`) el 70 % d'un adult, i els rars, el que fan al document
de figures de Pol (on la trompeta, la més alta, omple el llenç sencer).

## L'entrada

Abans de la home surt una foto a l'atzar a pantalla completa, amb la capçalera a sobre i dues
línies de punts que s'escriuen. Un clic (o Enter, Espai, Esc) i entres. Surt una vegada per sessió.

- Les fotos: `media/entrada/1.webp`, `2.webp`… i quantes n'hi ha a `data/site.json` → `"entrada": { "imatges": 10 }`.
- Els ninots de les dues línies: `data/ninots.json` → `"entrada": ["walk2", "stroll"]`.

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
- **"no trobo assets/siluetes/….svg"** → el nom de la `silueta` a `ninots.json` no coincideix amb cap dibuix.

---

## Per a nosaltres

- `build/paginas.mjs`: les plantilles (dades → HTML). Les fan servir el build i la vista prèvia.
- `build/build.mjs`: valida i escriu `dist/` (no es commiteja). `node build/build.mjs`.
- `build/preview.mjs` + `index.html`: la vista prèvia de Live Server (`/?p=/en/eliza/`).
- `js/polroig.js`: l'únic JS, i només afegeix (sense JS tot es veu): variació de les línies de punts,
  slideshow amb el ninot caminant mentre carrega cada foto (`assets/siluetes/walk.svg`, des del CSS),
  i el `#projecte` a l'adreça.
- **SEO**: cada pàgina porta canonical, `hreflang` cat/en, Open Graph amb mides d'imatge i JSON-LD
  (Person a la home, ProfilePage a la bio, CreativeWork a cada projecte). El 404 no s'indexa mai.
- `.github/workflows/deploy.yml`: build i publicació a GitHub Pages a cada push.
- **Domini**: quan n'hi hagi, posa'l a `site.json` → `"domini"`. Això treu el `noindex`, obre
  el `robots.txt` i escriu el `CNAME`.
- **Cloudflare**: `wrangler.jsonc` i `_headers` ja hi són. A Workers Builds, comanda
  `node build/build.mjs` amb `BASE` buida.

Segueix la recepta de [meowrhino/JAMstack](https://github.com/meowrhino/JAMstack) (oriol-colomer per dins).
