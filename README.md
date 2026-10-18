# polroig

Portfoli de Pol Roig Valldosera. <https://meowrhino.github.io/polroig/>

**Per a Pol: [GUIA.md](GUIA.md)** (en català: què tocar, com afegir un projecte, com pujar-ho).

Lo de abajo es para nosotros. Sigue la receta de [meowrhino/JAMstack](https://github.com/meowrhino/JAMstack): nombres de la casa, un proyecto una carpeta, build a `dist/`.

## Cómo está hecho

```
data/site.json        lo general: title, langs, email, social, intro, entrance (photos, seconds),
                      lists (el índice de la home), feed (el orden del scroll), ui
data/about.json       la bio, lista de párrafos por idioma; la foto en data/about/1.webp
data/figures.json     los ninots (lines, strays, entrance)
projects/<slug>/      project.json + img/ (y los PDF enlazados, al lado de project.json)
build/paginas.mjs     las plantillas (datos → HTML); las usan el build y la vista previa
build/build.mjs       valida y escribe dist/ (no se commitea): node build/build.mjs
build/preview.mjs     vista previa de Live Server (index.html, /?p=/en/eliza/)
js/polroig.js         el único JS, y solo añade: líneas de puntos, slideshow, #proyecto, A+, entrada
```

- **Publicado = está en `feed`**. Las dos `lists` dicen qué sale en el índice; el build avisa si no cuadran. Un proyecto oculto, `{ "project": "x", "visible": false }` en `feed`: su página con `noindex`, fuera de la home y del sitemap.
- **og:image**: 1200×630 JPG con sharp (`npm ci`), en `.cache/og/` (fuera de git), copiadas a `dist/og/`. Sin sharp, avisa y comparte la foto tal cual.
- **SEO**: canonical, `hreflang` ca/en, Open Graph y JSON-LD (Person, ProfilePage, CreativeWork). El 404 no se indexa.
- **Publicar, uno en cada copia**: la nuestra, `.github/workflows/deploy.yml` a GitHub Pages (solo corre en `meowrhino`); la de Pol, Workers Builds con `wrangler.jsonc`. El build mira dónde está: con `GITHUB_ACTIONS`, base `/polroig` y `noindex`; si no, la raíz y el `url` de `site.json` (con `url`, se indexa).
- **Transición**: la de la casa (`js/transicion.js` + `css/transicion.css`, de almarbra, y el script del `<head>` en `paginas.mjs`), fundido al negro; el loader, el dibujo de la entrada (la línea de puntos que se escribe con el ninot walk2), en `css/style.css`.
- **Traspaso**: [TRASPASO.md](TRASPASO.md).
