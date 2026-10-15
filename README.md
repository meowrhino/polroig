# polroig

Portfoli de Pol Roig Valldosera. <https://meowrhino.github.io/polroig/>

**Per a Pol: [GUIA.md](GUIA.md)** (en català: què tocar, com afegir un projecte, com pujar-ho).

Lo de abajo es para nosotros. Sigue la receta de [meowrhino/JAMstack](https://github.com/meowrhino/JAMstack): nombres de la casa, un proyecto una carpeta, build a `dist/`.

## Cómo está hecho

```
data/site.json        lo general: title, langs, email, social, intro, entrance,
                      lists (el índice de la home), feed (el orden del scroll), ui
data/about.json       la bio, lista de párrafos por idioma; la foto en data/about/1.webp
data/figures.json     los ninots (lines, strays, entrance)
projects/<slug>/      project.json + img/ (y los PDF enlazados, al lado de project.json)
build/paginas.mjs     las plantillas (datos → HTML); las usan el build y la vista previa
build/build.mjs       valida y escribe dist/ (no se commitea): node build/build.mjs
build/preview.mjs     vista previa de Live Server (index.html, /?p=/en/eliza/)
js/polroig.js         el único JS, y solo añade: líneas de puntos, slideshow, #proyecto, A+, entrada
```

- **Publicado = está en `feed`**. Las dos `lists` dicen qué sale en el índice; el build avisa si no cuadran.
- **og:image**: 1200×630 JPG con ffmpeg, en `.cache/og/` (fuera de git), copiadas a `dist/og/`. Sin ffmpeg, la foto tal cual.
- **SEO**: canonical, `hreflang` ca/en, Open Graph y JSON-LD (Person, ProfilePage, CreativeWork). El 404 no se indexa.
- **Publicar**: `.github/workflows/deploy.yml`, build y GitHub Pages en cada push.
- **Dominio**: en `site.json` → `"domain"`. Quita el `noindex`, abre `robots.txt` y escribe el `CNAME`.
- **Cloudflare**: `wrangler.jsonc` y `_headers` ya están. En Workers Builds, `node build/build.mjs` con `BASE` vacía.
