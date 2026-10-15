# Feedback Pol Roig — 15/10

Archivo temporal para seguir el feedback final (`feedback-final.pdf`). En la entrega final todo queda documentado como JAMstack (README, GUIA) y este archivo se borra.

✅ hecho · 🟡 a medias · ⬜ pendiente · ❓ hay que preguntárselo a Pol

**Estado:** 20 hechos, 1 a medias, 8 pendientes y 2 a preguntar. Quedan unas **10–11 h**.

---

## General

| # | Punto | Estado | Notas |
|---|---|---|---|
| 1 | Letra más pequeña, igual en toda la web, botón para agrandar | ✅ | **12px** en escritorio y **13px** en móvil (ellenole usa 10px; a 11px costaba leerla). El botón **A+** está abajo a la izquierda, vuelve al tamaño de antes y se recuerda. El zoom del navegador no se bloquea (ellenole tampoco): lo que ya no cambia es el tamaño de la letra con el ancho de la ventana. Se ajusta en una sola variable (`--fs` en `css/style.css`). |
| 2 | Subrayado al pasar el cursor por los títulos | ✅ | Títulos del índice. |
| 3 | Rosa más vivo | ✅ | `#ff95ca`, sacado con el cuentagotas del mockup. |
| 4 | Menú rosa siempre visible en escritorio | ✅ | En móvil, el rosa va debajo de cada título (antes no salía). |
| 5 | Cabecera "Pol Roig · info@… · cat · esp · eng", about fuera del menú, contacto al pie | ✅ | Va en **rosa**, como en su documento, con el idioma actual en blanco. "Pol Roig" lleva a la bio. Al pie de todas las páginas: correo + Instagram. Falta `esp` (punto 21). |
| 5b | Correo `info@` en lugar de `me@` | ✅ | Ver pregunta 1. |

## Muñecos

| # | Punto | Estado | Notas |
|---|---|---|---|
| 6 | 40 % más pequeños, sobre todo en móvil | ✅ | Un adulto mide ~33px a 1440px de ancho y ~22px en móvil (antes, 43–81px). Ya no dependen del tamaño de la letra. |
| 7 | Proporciones: el niño más pequeño, los nuevos como en su documento | ✅ | La proporción va dentro de cada SVG (todos con el mismo lienzo): el niño mide un 70 % de un adulto y la trompeta es la más alta. Explicado en el README. |
| 8 | Disposición aleatoria en cada visita, menos los del menú | ✅ | Los de arriba de la home, fijos; los del scroll se barajan con JS. Sin JS queda un reparto fijo que ya cumple las reglas. |
| 9 | Raros una sola vez, normales repetidos; normales → About, raros → su proyecto, nunca junto al suyo | ✅ | Los 10 raros salen en el scroll de la home, nunca justo encima o debajo de su proyecto, y como mucho uno por línea. Llevan a la página del proyecto o, si no tiene, a su sitio en la home. Ver pregunta 5. |
| 10 | Rosa al pasar el cursor | ✅ | |
| — | Repetir los muñecos de Concierto barroco en su página | — | Propuesta: no, porque rompe lo de "una sola vez". Si lo quiere, se hace. |

## Slideshow

| # | Punto | Estado | Notas |
|---|---|---|---|
| 11 | Triangulito equilátero para pasar | ✅ | Pequeño, abajo a la derecha, se ve sobre cualquier foto. Clicar en toda la foto sigue funcionando. |

## Textos del menú

| # | Punto | Estado | Notas |
|---|---|---|---|
| 12 | Listas nuevas en cat y eng | ✅ | Obres/Escenografies, Works/Selected Scenography, detalles con mayúscula, "Concierto barroco" con b minúscula (también en el pie y en la bio), Dejós y Quiso Negro en 2024, "Eliza - òpera", "Desplaçats - instal·lació", El que és nostre → La Llotja de Lleida, "+++" con su detalle. El orden del scroll sigue siendo independiente del índice. |
| 12b | Cursiva | ❓ | Ver pregunta 4. Ahora todo va en cursiva, como en el mockup. |

## Bio

| # | Punto | Estado | Notas |
|---|---|---|---|
| 13a | Foto al ancho del texto | ✅ | |
| 13b | Contacto al final del texto de la bio | ✅ | "Informació de contacte / *Correu electrònic: …* / *Instagram: @pol.roig*", en cursiva como en su documento. |
| 13c | Texto catalán corregido | ✅ | |
| 13d | Inglés actualizado | ✅ | Los mismos cambios que el catalán (fuera "currently", Amaia, "Concierto barroco"). Que lo revise. |

## Páginas de proyecto (Concierto barroco, Eliza, Ofrena)

| # | Punto | Estado | Notas |
|---|---|---|---|
| 14 | "Llegir més" en dos pasos (desplegable con el resumen → "Veure la pàgina sencera") | ⬜ | Resumen en `resum.cat.md` / `resum.en.md`. **1 h.** |
| 15 | Blanco o negro | ✅ | Todo negro (Amalia: "todo o nada"). Ya no hay páginas blancas. |
| 16 | Estructura de Concierto barroco | ⬜ | Carteles → cita Benjamin (rosa) → texto → carrusel de la home → ficha a 2 columnas (la nueva, más larga) → teaser con subtítulo → "Comentari, per Pol Roig i David Aguilar" → cita Carpentier → esbossos con subtítulo → texto → cita Owens → "Descarrega els textos" (`textos.pdf`) → fotos de Lupe con subtítulo. Carruseles y vídeo intercalados con marcas en el `.md`; citas en rosa. **3 h.** |
| 16b | Recortar el cartel central para que coincida por abajo con los otros dos | ⬜ | Lo hago yo. **10 min.** |
| 17 | Esbossos que se ven peor | ❓ | Son los dibujos de la galería "(esbossos)" de la página de Concierto barroco (`media/concierto-barroco/bocetos/`). No es la compresión de la web: los esbossos **1, 10 y 12** llegaron a ~835px (los demás, a 2000px). Hay que pedirle esos tres en grande. (El 8 pesa poco porque es una foto casi negra, no porque esté mal.) |
| 18a | Eliza: quitar las fotos 7, 8, 9, 10, 13, 17, 18 y 19 | ⬜ | Quedan 12. **10 min.** |
| 18b | Eliza: subrayar los enlaces de prensa | ✅ | Todos los enlaces dentro de los textos van subrayados. |
| 18c | Eliza: desplegable nuevo | ⬜ | Parte del 14. |
| 19 | Ofrena musical: textos nuevos (resumen, página entera, créditos, inglés) | ⬜ | **30 min.** |

## Últimas peticiones

| # | Punto | Estado | Notas |
|---|---|---|---|
| 20 | "+++": el pie cambia con cada foto | ⬜ | Pies: 1 / 2 / 3–4 / 5–8. **45 min.** |
| 21 | Español | ⬜ | Traduzco con IA, añado `esp` a la cabecera y le enseño a corregir en GitHub. **2 h.** |
| 22 | Pre-inicio: foto fija al azar, cabecera y puntos con muñeco que se escriben y parpadean; un clic y entras | 🟡 | Las 10 fotos están en `media/portada/`; la pantalla en sí **aún no está hecha** (por eso no sale en el localhost). Será una capa encima de la home, **como en barbarawong**: una vez por sesión (`sessionStorage`), entrar con clic, Enter, Espacio o Escape, fundido de 0,4 s, y no sale si el sistema pide menos movimiento. La **7** es casi negra entera: así viene en su original. Ver pregunta 6. **3 h.** |
| 23 | Fotos nuevas de Quiso Negro, crédito Pol Rebaque | ✅ | 9 fotos; el crédito va en el pie. |

---

## Preguntas para Pol

1. ¿El correo es `info@polroigvalldosera.com` en todas partes? (Ya está puesto así.) → **se lo pregunta manu**
2. Hoy tienen página propia **cuatro** proyectos: Concierto barroco, Eliza, Ofrena musical y **Passacaglia**. La de Passacaglia está vacía (1 foto + "Properament" + el full de sala), así que en la práctica son las tres que él cuenta. Propuesta: quitarle la página a Passacaglia hasta que tenga texto. En la home seguiría con su foto y el enlace al full de sala. ¿Le parece bien?
3. ~~¿El pre-inicio sale en cada visita o una vez por sesión?~~ → **una vez por sesión, como barbarawong**
4. Cursiva: obras en cursiva y escenografías no (su texto), o todo en cursiva (el mockup) → **lo verifica Pol**
5. ~~Los muñecos "about", ¿cuentan como normales?~~ → **sí** (se repiten y llevan a la bio)
6. Pre-inicio: ¿con el correo en la cabecera o sin?
7. ¿Nos manda en grande los esbossos 1, 10 y 12?

## Orden que propongo para lo que queda

1. Eliza (fotos) y Ofrena (textos): 40 min, son solo datos.
2. "Llegir més" en dos pasos: 1 h.
3. Página de Concierto barroco: 3 h.
4. "+++" con pies: 45 min.
5. Español: 2 h.
6. Pre-inicio: 3 h.
