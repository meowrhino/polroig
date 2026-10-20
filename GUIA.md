# Guia de la web

Portfoli de Pol Roig Valldosera. <https://meowrhino.github.io/polroig/>

> **Regla d'or: només toques `data/` i `projects/`.**
> La resta (build, css, js) és la maquinària: no cal obrir-la.

Quan puges un canvi a `main`, la web es reconstrueix i es publica sola en un parell
de minuts. No has d'instal·lar res per publicar.

---

## Què hi ha

```
data/site.json             textos generals: correu, bio curta, les dues llistes de la home
                           i l'ordre del scroll ("feed")
data/about.json            el text de la bio
data/about/1.webp          la foto de la bio
data/entrance/             les fotos de l'entrada (1.webp, 2.webp…)
data/entrance/mobile/      les de l'entrada en vertical, per al mòbil
data/figures.json          les línies de punts amb ninots
projects/<slug>/           un projecte, una carpeta:
  project.json               els seus textos
  img/                       les seves fotos: 1.webp, 2.webp…
```

El **slug** és el nom de la carpeta i el de l'adreça: `projects/eliza/` →
`meowrhino.github.io/polroig/eliza/`. Minúscules, números i guions, sense accents ni espais.
**No el canviïs mai** un cop publicat: trencaria els enllaços que ja circulen.

## La primera vegada: preparar VS Code

Només es fa un cop.

1. A VS Code: **Fitxer → Nova finestra** i, a la benvinguda, **Clona el repositori Git…** →
   **Clona des de GitHub**. Entra amb el teu compte, tria `polroig` i una carpeta.
2. En obrir-la, VS Code et proposa instal·lar **Live Server** (a baix a la dreta): **Instal·la**.
3. A baix a la dreta surt **Go Live**: és la vista prèvia.

**VS Code t'ajuda amb els camps**: si passes el ratolí per sobre d'un (`"title"`, `"photos"`…)
et diu què és, i si n'escrius un malament o hi poses una cosa que no toca (un número entre
cometes, un `"true"` amb cometes), ho subratlla en vermell. Per veure quins camps pots posar,
dins de les claus prem **Ctrl+Espai**. Ho sap per la primera línia de cada JSON
(`"$schema": …`): **no l'esborris**.

## Afegir un projecte, pas a pas

1. **Copia una carpeta** de `projects/` sencera i posa-li el slug nou de nom
   (per exemple, copia `projects/requiem/` i digues-li `projects/la-nova-obra/`).
2. **Passa les fotos per [imgToWeb](https://meowrhino.github.io/imgToWeb/)** (a Chrome o Firefox,
   no a Safari): 85 %, 2000 px, amb el renombrat 1, 2, 3… activat. Arrossega-les per posar-les
   en ordre abans de baixar el zip.
3. **Canvia les fotos** de `img/` per les teves: `1.webp`, `2.webp`… tal com surten d'imgToWeb.
   La primera de `"photos"` és la que surt primer i la que es veu quan algú comparteix l'enllaç.
4. **Canvia els textos** de `project.json` (taula de sota).
5. **Posa el slug a `data/site.json`**:
   - a `"feed"`, on vulguis que surti al scroll de la home;
   - i a una de les dues llistes de `"lists"` (obra pròpia, `works`, o escenografia, `scenography`).
     Si és obra pròpia, posa-hi també `"page": true` al `project.json`.
6. **Mira-ho amb Go Live** i, si està bé, **puja-ho** (a sota).

Per **treure** un projecte de la web sense esborrar-lo, treu-ne el slug de `"feed"` i de la seva llista.

Per **amagar-lo** (que tingui la seva pàgina per enviar-la a algú, però que no surti a la home
ni a Google), a `"feed"` canvia el slug per un bloc:

```json
{ "project": "requiem", "visible": false }
```

L'adreça és la de sempre (`/requiem/`). Per publicar-lo, torna a posar només `"requiem"`, i també
a la seva llista: no perd el seu lloc.

## Els camps d'un projecte (`project.json`)

```json
{
  "title": "Eliza",
  "label": { "ca": "Eliza - òpera", "en": "Eliza - opera" },
  "detail": { "ca": "(Òpera de cambra, Gran Teatre del Liceu, 2024)", "en": "(Chamber opera, …)" },
  "caption": {
    "ca": ["*Eliza* (òpera de cambra), …", "(Composició: Ferran Cruixent / Llibret: Pau Miró)"],
    "en": ["*Eliza* (chamber opera), …", "(Score: Ferran Cruixent / Libretto: Pau Miró)"]
  },
  "page": true,
  "photos": ["1", "2", "3", "4", "5"],
  "text": { "ca": ["Primer paràgraf…", "Segon paràgraf…"], "en": ["First paragraph…", "Second…"] }
}
```

| camp | què fa |
|---|---|
| `title` | el nom del projecte |
| `label` | *opcional*: com surt a la llista si ha de ser diferent del títol |
| `detail` | el que surt en rosa al costat del títol, a la llista |
| `caption` | el peu, sota la foto. Una llista de línies: cada una surt a sota de l'anterior (així els crèdits entre parèntesis van a la línia de sota). Si és una línia sola, pot anar sense `[ ]` |
| `captions` | *opcional*: un peu diferent segons la foto, per als projectes que en barregen uns quants (el "+++"). Cada peu diu des de quina foto val, fins al següent: `[{ "from": "1", "ca": "…", "en": "…" }, { "from": "3", "ca": "…", "en": "…" }]` |
| `page` | *opcional*: `true` li dona pàgina pròpia (ara, l'obra pròpia). Sense, el "llegir més" es desplega a la mateixa home |
| `photos` | les fotos de `img/`, pel número i sense `.webp`, en l'ordre en què surten: `["1", "2", "3"]` |
| `posters` | *opcional*: els cartells, a `img/posters/` (`1.webp`, `2.webp`…); surten a dalt de la seva pàgina, un al costat de l'altre: `["1", "2", "3"]` |
| `groups` | *opcional*: slideshows extra a la seva pàgina, sota el text. Cada grup és una subcarpeta de `img/` amb les seves fotos `1.webp`, `2.webp`…: `[{ "folder": "bocetos", "name": { "ca": "(esbossos)", "en": "(sketches)" }, "photos": ["1", "2", "3"] }]` |
| `video` | *opcional*: un vídeo a la seva pàgina, sota el peu: `"video": "teaser"` vol dir `img/teaser.webm` i, al costat, la imatge que es veu abans de donar-li al play, `img/teaser.poster.webp` |
| `text` | *opcional*: el text del "llegir més", una llista de paràgrafs per idioma (a sota) |

Cada text va en els dos idiomes: `{ "ca": "…", "en": "…" }`. Si en falta un, surt l'anglès.

### Textos llargs

`"text"` és una llista de paràgrafs: `["primer", "segon", "tercer"]`. Un paràgraf que ha de tenir
línies, com una fitxa artística, és una llista dins de la llista:
`["Fitxa artística:", ["Pol Roig, direcció", "Dani Espasa, direcció musical"]]`.

A la home, "Llegir més" el desplega sota el peu. Si el projecte té `"page": true`, el desplegable
només mostra el primer paràgraf, amb "Veure la pàgina sencera" al final, i el text sencer surt a
la seva pàgina.

Dins de qualsevol text:

- `*cursiva*` · `**negreta**`
- `[text de l'enllaç](https://…)`, o `[Full de sala](full-de-sala.pdf)` per a un fitxer que hi hagi
  a la carpeta del projecte (al costat de `project.json`)
- un paràgraf que comença per `> ` és una cita: surt en rosa

A la pàgina d'un projecte, el text pot col·locar el slideshow, el vídeo i els grups on toqui,
cadascun en un paràgraf sol, i amb un peu a sota després de `|`:

```json
"[[slides]]",
"[[video | Teaser dirigit per…]]",
"[[galeria:bocetos | Esbossos preliminars de Pol Roig…]]"
```

I el que vagi entre `"[[columnes]]"` i `"[[/columnes]]"` surt a dues columnes (la fitxa artística).
El vídeo i els grups que el text no col·loca surten al final, com sempre.

## La bio

- El text: `data/about.json`, una llista de paràgrafs per idioma: `{ "ca": ["…", "…"], "en": ["…"] }`.
- La foto: `data/about/1.webp`.
- La bio curta de la home: `data/site.json` → `"intro"`.

## Els ninots

Les línies de punts amb un ninot al final surten de `data/figures.json`.

`"every"` diu cada quants projectes de la home surt una línia: `1`, entre tots;
`2`, cada dos; i així.

Hi ha dos tipus de ninots:

- **els normals** (`"lines"`): surten a totes les pàgines, s'hi repeteixen, i en clicar-los porten a la bio (o a l'inici, amb `"to": "home"`).
- **els rars** (`"strays"`): personatges escapats d'una obra. Cadascun surt **una sola vegada**,
  al scroll de la home, mai a la línia de sota o de sobre del seu projecte, i en clicar-lo
  porta al projecte d'on ve. De quin projecte és, ho diu el nom del fitxer: comença pel slug
  (`concierto-barroco-banc.svg` → Concierto barroco).

Els de dalt de la home (al costat del menú) són sempre els mateixos; els del scroll es barregen
a cada visita.

A `"lines"`, cada bloc `{ "figures": [ ... ] }` és una línia, i cada pàgina les va posant en l'ordre del fitxer:
la primera, la segona, la tercera… i quan s'acaben torna a començar. Una línia pot portar
més d'un ninot (`run` i `walk2` van junts).

```json
{
  "figures": [
    { "figure": "run", "dots": 70, "vary": 15, "to": "home" },
    { "figure": "walk2", "dots": 8, "vary": 15, "to": "home" }
  ]
}
```

Els camps de cada ninot:

| camp | què fa |
|---|---|
| `figure` | el nom del dibuix: `assets/siluetes/<figure>.svg` |
| `dots` | quant ocupen els punts abans del ninot, en % de l'amplada del text (sense `%`) |
| `vary` | quant pot créixer o encongir a cada visita, en % de `dots`: `15` vol dir que una línia de 70 fa entre 59,5 i 80,5. `0`, sempre igual |
| `to` | *opcional*: on porta en clicar-lo: `"bio"` (si no hi és) o `"home"` |

A `"strays"`, `"figures"` és la llista dels rars, i `"dots"` / `"vary"` els punts que porten davant.

Per a un ninot nou, posa el seu SVG a `assets/siluetes/` (sense fons, en blanc) i afegeix-lo
al JSON. **La mida va dins del dibuix**: tots els ninots es pinten a la mateixa alçada, i cada
SVG té un llenç d'1,24 adults (el `viewBox`) amb el dibuix a baix de tot. Un adult ocupa el 80 %
del llenç, el nen del cotxet (`stroll`) el 70 % d'un adult, i els rars, el que fan al document
de figures de Pol (on la trompeta, la més alta, omple el llenç sencer).

## L'entrada

Abans de la home surt una foto a l'atzar a pantalla completa, amb la capçalera a sobre i dues
línies de punts que s'escriuen (la capçalera, només amb "Pol Roig"). Un clic (o Enter, Espai, Esc) i entres; si no, entra sola passats uns
segons, o quan la web hagi acabat de carregar si triga més. Surt una vegada per sessió.

A `data/site.json`:

```json
"entrance": {
  "photos": ["1", "2", "3"],
  "mobile": ["1", "2", "3", "4"],
  "seconds": 20
}
```

- `"photos"`: les fotos que surten, de `data/entrance/` (`1.webp`, `2.webp`…).
- `"mobile"`: les verticals, per al mòbil, de `data/entrance/mobile/`. No cal que
  coincideixin amb les de `"photos"`: cada llista va per la seva banda.
- `"seconds"`: quants segons es queda, com a mínim, abans d'entrar sola. Un número sense cometes.
- Els ninots de les línies: `data/figures.json` → `"entrance": [["run", "walk2"], "stroll"]`. Un nom, un
  ninot a la línia; dos entre claudàtors, una processó: el segon surt quan el primer s'atura.

## Veure-ho abans de pujar-ho

**Go Live** a baix a la dreta de VS Code. S'obre la web al navegador i es refresca sola cada
cop que deses. Si hi ha un error en un JSON, t'ho diu en pantalla i on és. El mateix
si hi ha alguna cosa que no es publicaria (una foto de `photos` que no és a `img/`): surt
en lloc de la web, en vermell. Els avisos que no aturen res surten en una franja groga a dalt.

## Pujar els canvis

1. Pestanya **Control de codi font** (les tres boletes unides, a l'esquerra).
2. Escriu què has fet (`projecte nou: requiem`) i **Confirma** (*Commit*). Si pregunta si vols
   afegir tots els canvis: **Sí**.
3. **Sincronitza els canvis** (*Sync*).
4. En un parell de minuts és a la web. A GitHub, al costat de l'últim canvi surt una boleta:
   groc és que està publicant, verd que ja està, vermell que alguna cosa no quadra.

**Abans de començar a tocar**, dona també a **Sincronitza**, per baixar el que hagi canviat.

## Si surt en vermell

La web no es trenca: es queda com estava fins que s'arregla. Clica la bola vermella, després
**Details**, i llegeix l'últim missatge, que diu el fitxer i què passa:

- **"no és un JSON vàlid (línia 12, columna 5)"** → gairebé sempre **una coma** de més o de menys,
  o unes cometes sense tancar, a prop d'aquella línia.
- **"no trobo projects/requiem/img/5.webp"** → a `"photos"` hi ha una foto que no és a `img/`.
- **"\"titel\" no és un camp d'aquí (mal escrit?). Els que hi ha: title, label…"** → un camp mal
  escrit: copia'l de la llista que surt al missatge.
- **"\"page\" ha de ser true o false"** → el que hi ha no és del tipus que toca (aquí, `"true"`
  amb cometes, i va sense). El missatge diu com ha de ser.
- **"\"feed\" diu \"requiem\", i no trobo projects/requiem/project.json"** → el slug de `site.json` i el nom de la carpeta no són iguals.
- **"no trobo assets/siluetes/….svg"** → el nom del ninot (`figure`) a `figures.json` no coincideix amb cap dibuix.

Els avisos amb ⚠ no aturen res: només diuen que alguna cosa potser no és com volies.
