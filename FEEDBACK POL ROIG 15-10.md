# Feedback Pol Roig — 15/10

Archivo temporal para seguir el feedback final (`feedback-final.pdf`). En la entrega final todo queda documentado como JAMstack (README, GUIA) y este archivo se borra.

✅ hecho · 🟡 a medias · ⬜ pendiente · ❓ hay que preguntárselo a Pol

**Estado:** todo hecho menos lo que depende de Pol: revisar las traducciones (es, en) y las preguntas de abajo.

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
| 14 | "Llegir més" en dos pasos (desplegable con el resumen → "Veure la pàgina sencera") | ✅ | En los proyectos con página, el desplegable muestra el primer párrafo del texto (en Concierto barroco, el mismo que marca Pol) con "Veure la pàgina sencera" al final. No hace falta un archivo de resumen aparte. Passacaglia, que no tiene texto, va directa a su página. |
| 15 | Blanco o negro | ✅ | Todo negro (Amalia: "todo o nada"). Ya no hay páginas blancas. |
| 16 | Estructura de Concierto barroco | ✅ | Con su estructura: carteles → cita → texto → slideshow → ficha a 2 columnas → teaser con pie → comentario → cita → esbossos con pie → texto → cita → "Descarrega els textos" → fotos de Lupe con pie. Las citas en rosa. Se hace con marcas dentro del `.md` (explicado en el README). Corregido sin preguntar: "Quim Palmado" → Palmada, "Rodíguez" → Rodríguez, "Ospedalle" → Ospedale. El inglés lo traduzco yo, citas incluidas (desde el catalán): que lo revise. El pie de la home sigue debajo de los carteles. |
| 16b | Recortar el cartel central para que coincida por abajo con los otros dos | ✅ | Recortados 72px de acera por abajo: ahora acaba a la misma altura que los otros dos. |
| 17 | Esbossos que se ven peor | ❓ | Son los dibujos de la galería "(esbossos)" de la página de Concierto barroco (`media/concierto-barroco/bocetos/`). No es la compresión de la web: los esbossos **1, 10 y 12** llegaron a ~835px (los demás, a 2000px). Hay que pedirle esos tres en grande. (El 8 pesa poco porque es una foto casi negra, no porque esté mal.) |
| 18a | Eliza: quitar las fotos 7, 8, 9, 10, 13, 17, 18 y 19 | ✅ | Quedan 12, renumeradas del 1 al 12. |
| 18b | Eliza: subrayar los enlaces de prensa | ✅ | Todos los enlaces dentro de los textos van subrayados. |
| 18c | Eliza: desplegable nuevo | ✅ | Como el 14. |
| 19 | Ofrena musical: textos nuevos (resumen, página entera, créditos, inglés) | ✅ | Pie, texto de la página (con el párrafo de Bach y los créditos) e inglés. Corregido "de d’Erika" → "d’Erika". En el pie escribe **ARTeFACte** y en el menú **ARTefACTe**: que elija. En el pie inglés falta "sobre una composición de Ari Cardozo": que diga si lo añadimos. |

## Últimas peticiones

| # | Punto | Estado | Notas |
|---|---|---|---|
| 20 | "+++": el pie cambia con cada foto | ✅ | Cada pie dice desde qué foto vale (`"peus"` en `projectes.json`): 1 / 2 / 3–4 / 5–8. Sin JS se ve el primero. |
| 21 | Español | ✅ | Traducido con IA todo (menú, pies, bio, textos de las páginas, Concierto barroco entero): **que Pol lo revise**. La cabecera dice "cat · esp · eng" y el español vive en `/es/`. Para corregir: en los JSON, el campo `"es"`; los textos largos, en `media/<proyecto>/text.es.md`. |
| 22 | Pre-inicio: foto fija al azar, cabecera y puntos con muñeco que se escriben y parpadean; un clic y entras | ✅ | Como barbarawong: una vez por sesión, se entra con clic, Enter, Espacio o Escape, fundido de 0,4 s; no sale si el sistema pide menos movimiento ni si el enlace lleva a un proyecto (`/#concierto-barroco`). Foto al azar de `media/entrada/`, cabecera encima, dos líneas de puntos que se escriben a saltos con el muñeco (walk2 y stroll) parpadeando como cursor en cada pausa. La foto **7** es casi negra entera (así viene). Ver pregunta 6. |
| 23 | Fotos nuevas de Quiso Negro, crédito Pol Rebaque | ✅ | 9 fotos; el crédito va en el pie. |

---

## Preguntas para Pol

1. ¿El correo es `info@polroigvalldosera.com` en todas partes? (Ya está puesto así.) → **se lo pregunta manu**
2. ~~¿Qué proyectos tienen página?~~ → **los cuatro de Obres**, Passacaglia incluida (confirmado por Pol). Passacaglia, de momento sin texto: su "Llegir més" va directo a la página. Cuando mande texto, tendrá el desplegable como las otras.
3. ~~¿El pre-inicio sale en cada visita o una vez por sesión?~~ → **una vez por sesión, como barbarawong**
4. Cursiva: obras en cursiva y escenografías no (su texto), o todo en cursiva (el mockup) → **lo verifica Pol**
5. ~~Los muñecos "about", ¿cuentan como normales?~~ → **sí**. Pol concreta: los dos "about", el que camina con la cabeza baja (`walk`) y el niño del cochecito (`stroll`) llevan a la **bio**; los dos que caminan juntos (`run` y `walk2`), al **inicio**. Hecho (`"porta": "inici"` en `ninots.json`).
6. Pre-inicio: ¿con el correo en la cabecera o sin?
7. ¿Nos manda en grande los esbossos 1, 10 y 12?
