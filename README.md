# polroig

Portfoli de Pol Roig Valldosera. <https://meowrhino.github.io/polroig/>

**Per a Pol: [GUIA.md](GUIA.md)** (en català: què tocar, com afegir un projecte, com pujar-ho).

Lo de abajo es para nosotros. Sigue la receta de [meowrhino/JAMstack](https://github.com/meowrhino/JAMstack): nombres de la casa, un proyecto una carpeta, build a `dist/`.

## Cómo está hecho

```
data/site.json        lo general: title, langs, email, social, intro, entrance (photos, mobile, seconds, cycle),
                      lists (el índice de la home), feed (el orden del scroll), ui
data/about.json       la bio, lista de párrafos por idioma; la foto en data/about/1.webp
data/figures.json     los ninots (lines, strays, entrance)
projects/<slug>/      project.json + img/ (y los PDF enlazados, al lado de project.json)
build/paginas.mjs     las plantillas (datos → HTML); las usan el build y la vista previa
build/build.mjs       valida y escribe dist/ (no se commitea): node build/build.mjs
build/validar.mjs     revisa cada JSON con su esquema (lo usan el build y la vista previa)
schema/               qué campos lleva cada JSON (site, about, figures, project): VS Code y el build
build/preview.mjs     vista previa de Live Server (index.html, /?p=/ca/eliza/)
js/polroig.js         el único JS, y solo añade: líneas de puntos, slideshow, #proyecto, entrada
```

- **JSON Schema** (como oriol): cada JSON lleva arriba `"$schema": "../schema/<tipo>.json"`, y con eso VS Code autocompleta, explica cada campo (en catalán) y subraya lo que está mal. El build y la vista previa validan con los mismos ficheros antes de pintar (`build/validar.mjs`, sin dependencias); lo que pide mirar el disco (fotos, siluetas, slugs que cuadren) sigue en `revisar` de `paginas.mjs`.
- **Publicado = está en `feed`**. Las dos `lists` dicen qué sale en el índice; el build avisa si no cuadran. Un proyecto oculto, `{ "project": "x", "visible": false }` en `feed`: su página con `noindex`, fuera de la home y del sitemap.
- **og:image**: 1200×630 JPG con sharp (`npm ci`), en `.cache/og/` (fuera de git), copiadas a `dist/og/`. Sin sharp, avisa y comparte la foto tal cual.
- **Idiomas**: el inglés en la raíz (`"lang": "en"`, Pol lo pide al abrir) y el catalán en `/ca/`.
- **Colores**: la home y la bio en negro; las páginas de proyecto en blanco (`body.blanc`, que invierte ninots y loader).
- **SEO**: canonical, `hreflang` ca/en, Open Graph y JSON-LD (Person, ProfilePage, CreativeWork). El 404 no se indexa.
- **Publicar, uno en cada copia**: la nuestra, `.github/workflows/deploy.yml` a GitHub Pages (solo corre en `meowrhino`); la de Pol, Workers Builds con `wrangler.jsonc`. El build mira dónde está: con `GITHUB_ACTIONS`, base `/polroig` y `noindex`; si no, la raíz y el `url` de `site.json` (con `url`, se indexa).
- **Transición**: la de la casa (`js/transicion.js` + `css/transicion.css`, de almarbra, y el script del `<head>` en `paginas.mjs`), fundido al negro; el loader, el dibujo de la entrada (la línea de puntos que se escribe con el ninot walk2), en `css/style.css`.
- **Traspaso**: [TRASPASO.md](TRASPASO.md).
