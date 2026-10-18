# polroig, para Claude

El portfoli de Pol Roig Valldosera, hecho por meowrhino con la receta del
estudio ([meowrhino/JAMstack](https://github.com/meowrhino/JAMstack)). Con
manu se habla en castellano; lo de Pol (la web, `GUIA.md`, los mensajes del
build) va en catalán. Cómo está hecha: [README.md](README.md).

## Si el build falla (la web no se ha publicado)

Cuando falla, la web se queda como estaba. Para arreglarlo:

1. **El error**, en uno de estos sitios:
   - En nuestra copia (`meowrhino/polroig`), la Action abre un issue con la
     etiqueta `build` y el mensaje dentro: `gh issue list --label build` y
     `gh issue view <n>`. El registro entero: `gh run list -L 3` y
     `gh run view <id> --log-failed`.
   - En la copia de Pol (Workers Builds, en su Cloudflare), el registro está
     en su Cloudflare. No hace falta ir: el paso 2 da el mismo mensaje.
2. **Reprodúcelo aquí**: `npm ci && node build/build.mjs`. Es el mismo build que
   en la nube y dice lo mismo: cada línea con ✗ trae el fichero y qué pasa.
3. **Arréglalo donde dice**, casi siempre en `data/*.json` o en
   `projects/<slug>/project.json`:
   - "no és un JSON vàlid (línia 12…)": una coma de más o de menos, o unas
     comillas sin cerrar, cerca de esa línea.
   - "no trobo projects/<slug>/img/5.webp (surt a "photos")": una foto de la
     lista que no está en `img/`. Pregunta si falta subirla; si no, quítala de
     la lista y dilo.
   - "\"feed\" diu \"x\", i no trobo projects/x/project.json": el slug de
     `data/site.json` y el nombre de la carpeta no son iguales.
   - "no trobo assets/siluetes/….svg": el `figure` de `data/figures.json` no
     es ningún dibujo de `assets/siluetes/`.
4. **Comprueba**: `node build/build.mjs` sin ✗ (los ⚠ no paran nada).

No cambies el build ni las plantillas para que pase: si el dato está bien y el
build se queja, es un fallo del build, y hay que decírselo a manu. No borres
fotos ni proyectos.

Commit y push solo cuando te lo pidan: mensaje en castellano diciendo qué se
arregla. Al publicarse, la Action cierra el issue sola.
