# polroig

Portfoli de Pol Roig Valldosera. <https://meowrhino.github.io/polroig/>

HTML, CSS i JS a pel, sense build. Tot el contingut és a `data.json`.

## Afegir o canviar imatges

1. Passa les fotos per [imgToWeb](https://meowrhino.github.io/imgToWeb/) (85%, 2000 px, renombrat 1, 2, 3…).
2. Posa-les a `img/<slug>/` (per exemple `img/requiem/1.webp`, `2.webp`…).
3. A `data.json`, posa `"imatges": N` al projecte amb el nombre de fotos.

L'ordre de la llista és a `seccions`; l'ordre dels projectes a la pàgina és a `ordre`.

Per veure-ho en local:

```bash
python3 -m http.server 8775
```
