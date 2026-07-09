# 05 — Catálogo de Componentes

Cada componente es una sección Shopify (`sections/dce-{nombre}.liquid`) **independiente**: no depende de que otra sección exista, no asume un orden fijo, y todo su contenido variable entra por `settings` (campos únicos) o `blocks` (listas repetibles). Esto es lo que permite que cualquier producto combine los componentes que necesite, en el orden que necesite, con el contenido que necesite — sin tocar código.

Plantilla de especificación usada para cada componente:

- **Objetivo** — qué trabajo de conversión hace, por qué existe.
- **Inputs** — qué contenido variable recibe.
- **Settings** — campos únicos de configuración (no repetibles).
- **Blocks** — tipos de bloque repetibles que admite.
- **Variantes** — layouts alternativos del mismo componente.
- **Estados** — condiciones visuales/interactivas que debe contemplar.
- **Futuro** — evoluciones previstas, no implementadas todavía.

---

## Primitivas (usadas por casi todos los componentes)

| Primitiva | Archivo | Uso |
|---|---|---|
| Button | `snippets/dce-button.liquid` | variantes `primary/secondary/ghost/link`, tamaños `sm/md/lg`, estados `default/hover/active/disabled/loading` |
| Badge/Pill | `snippets/dce-badge.liquid` | urgencia, categorías, "bono", "nuevo" |
| Section Header | `snippets/dce-section-header.liquid` | patrón eyebrow + título + subtítulo compartido |
| Card | `snippets/dce-card.liquid` | contenedor base para beneficios/testimonios/bonos |
| Rating/Stars | `snippets/dce-rating-stars.liquid` | testimonios, prueba social |
| Accordion | `dce-accordion` (custom element) | FAQ, capítulos expandibles |
| Countdown | `dce-countdown` (custom element) | oferta, CTA |

---

## 1. Hero

- **Objetivo**: primer impacto. Comunicar la promesa central en menos de 3 segundos y mover al usuario al primer CTA o a seguir scrolleando. Es el componente más crítico para LCP.
- **Inputs**: eyebrow (opcional), headline, subheadline, imagen o video, CTA primario, CTA secundario (opcional), badge de prueba social (opcional, ej. "+1.200 alumnos").
- **Settings**: `layout` (centered / split-media / full-bleed-media), color de fondo, altura (`viewport-full` / `auto`), posición de la media (izquierda/derecha).
- **Blocks**: `trust_badge` (opcional, repetible — logos de prensa/clientes).
- **Variantes**: centrado, split texto+imagen, fondo de video.
- **Estados**: con/sin badge social, con/sin CTA secundario, imagen vs. video de fondo.
- **Futuro**: countdown embebido para lanzamientos; A/B nativo de headline.

## 2. Problema

- **Objetivo**: generar identificación ("esto me pasa a mí") antes de presentar la solución. Construye la tensión que el resto de la página resuelve.
- **Inputs**: título, lista de dolores/puntos de fricción, imagen o ilustración opcional.
- **Settings**: `layout` (lista / grid de cards), tono visual (neutral / alerta).
- **Blocks**: `pain_point_item` (ícono, texto).
- **Variantes**: lista simple, grid de cards, con imagen lateral.
- **Estados**: típicamente 2-6 items.
- **Futuro**: dolores dinámicos por segmento de audiencia si se suma personalización.

## 3. Story

- **Objetivo**: conexión narrativa y autoridad emocional — por qué existe el producto, qué lo originó.
- **Inputs**: título, cuerpo narrativo (richtext), imagen(es), cita destacada opcional.
- **Settings**: `layout` (texto+imagen alternada / timeline), modo de longitud (corta / extendida con "leer más" en mobile).
- **Blocks**: ninguno obligatorio — es prosa continua, no módulos (para estructura modular ver componente Capítulos).
- **Variantes**: bloque único de texto, timeline de hitos.
- **Estados**: colapsado/expandido en mobile si el texto es largo.
- **Futuro**: activar `--dce-font-serif` opcional para tono editorial en este componente específicamente.

## 4. Beneficios

- **Objetivo**: traducir características técnicas en resultados tangibles para el comprador.
- **Inputs**: título de sección, lista de beneficios.
- **Settings**: `layout` (grid 2/3/4 columnas, lista con íconos).
- **Blocks**: `benefit_item` (ícono, título, descripción corta).
- **Variantes**: grid con íconos, grid con mini-imágenes, alternado texto-imagen.
- **Estados**: soporta de 3 a 12 items sin romper el grid.
- **Futuro**: sub-variante con métricas cuantificadas (ej. "+34% más rápido").

## 5. Transformación

- **Objetivo**: visualizar el cambio de estado — vida/resultado antes vs. después del producto.
- **Inputs**: título, columna "antes", columna "después".
- **Settings**: `layout` (side-by-side estático / slider comparador de imágenes).
- **Blocks**: `comparison_row` (par antes/después, texto o imagen).
- **Variantes**: texto vs. texto, imagen vs. imagen (slider interactivo).
- **Estados**: posición del slider (si aplica esa variante).
- **Futuro**: slider de imagen arrastrable (JS liviano, `dce-transformation.js`).

## 6. Comparativa

- **Objetivo**: posicionar el producto frente a alternativas (competencia, "hacerlo solo", otras soluciones).
- **Inputs**: título, columnas a comparar (nuestro producto + 1-3 alternativas), filas de criterios.
- **Settings**: número de columnas, columna destacada (resalta nuestra oferta).
- **Blocks**: `comparison_row` (criterio + valor por columna: check / cross / texto).
- **Variantes**: tabla completa (desktop), colapso a cards apiladas (mobile — crítico para legibilidad).
- **Estados**: responsive es el estado principal a resolver acá.
- **Futuro**: comparativa data-driven desde metafields del producto real en vez de texto estático.

## 7. Oferta

- **Objetivo**: presentar el paquete de venta con total claridad — qué incluye, precio, urgencia si aplica.
- **Inputs**: título, descripción de la oferta, precio (nativo vía buy box de Shopify), lista de "qué incluye", countdown opcional.
- **Settings**: mostrar countdown (bool), fecha límite, mostrar precio comparado (`compare_at_price`), destacar % de ahorro.
- **Blocks**: `include_item` (qué incluye la oferta).
- **Variantes**: con countdown, sin countdown, con precio comparativo.
- **Estados**: countdown activo vs. expirado (mensaje alternativo cuando expira).
- **Futuro**: multi-tier (básico/premium) apoyado en variantes nativas de producto Shopify.

## 8. Bonos

- **Objetivo**: aumentar el valor percibido de la oferta con extras.
- **Inputs**: título, lista de bonos (nombre, descripción, valor monetario opcional, imagen).
- **Settings**: mostrar valor total acumulado (bool).
- **Blocks**: `bonus_item` (nombre, descripción, valor, imagen).
- **Variantes**: grid de cards, lista con "+".
- **Estados**: 1-6 bonos típico.
- **Futuro**: bonos con vigencia (early bird) reusando el mecanismo de countdown de Oferta.

## 9. Autor

- **Objetivo**: autoridad y confianza en quien crea/enseña/vende el producto.
- **Inputs**: nombre, foto, bio corta, credenciales/logros, link a redes opcional.
- **Settings**: `layout` (foto + texto lateral / centrado).
- **Blocks**: `credential_item` (opcional, repetible — logros, menciones en prensa).
- **Variantes**: simple, con logos de prensa/menciones.
- **Futuro**: soporte multi-autor repitiendo el bloque completo de la sección.

## 10. Capítulos

- **Objetivo**: mostrar la estructura/currículum del producto digital (módulos, lecciones).
- **Inputs**: título, lista de módulos con descripción.
- **Settings**: mostrar numeración (bool), modo (lista simple / accordion expandible).
- **Blocks**: `chapter_item` (número, título, descripción corta, duración opcional).
- **Variantes**: lista simple, accordion (`dce-accordion`, requiere `dce-chapters.js` mínimo).
- **Estados**: expandido/colapsado por item si es accordion.
- **Futuro**: indicador de "preview gratis" por capítulo.

## 11. Testimonios

- **Objetivo**: prueba social directa, el componente que más reduce fricción de decisión.
- **Inputs**: título, testimonios (nombre, foto, texto, rating opcional, resultado destacado).
- **Settings**: `layout` (grid estático / carrusel), mostrar rating (bool).
- **Blocks**: `testimonial_item` (nombre, rol/contexto, foto, texto, rating, resultado, video opcional).
- **Variantes**: grid, carrusel (`dce-carousel`, requiere `dce-testimonials.js`), destacado único grande.
- **Estados**: paginación/slide activo si es carrusel.
- **Futuro**: video-testimonios como sub-variante de block.

## 12. FAQ

- **Objetivo**: remover las últimas objeciones antes de la decisión de compra.
- **Inputs**: título, preguntas y respuestas.
- **Settings**: comportamiento (una respuesta abierta a la vez / múltiples simultáneas).
- **Blocks**: `faq_item` (pregunta, respuesta richtext).
- **Variantes**: accordion simple, dos columnas.
- **Estados**: abierto/cerrado por item (`dce-accordion`, requiere `dce-faq.js`).
- **Futuro**: agrupación por categoría si el volumen de preguntas crece.

## 13. Garantía

- **Objetivo**: reducir el riesgo percibido de la compra.
- **Inputs**: título, descripción de la garantía, ícono/sello, duración.
- **Settings**: `layout` (badge + texto / centrado grande).
- **Blocks**: ninguno típicamente — contenido único por producto.
- **Futuro**: garantía condicionada por producto vía metafield nativo de Shopify.

## 14. CTA

- **Objetivo**: última oportunidad de conversión antes del footer — refuerza oferta, urgencia y botón.
- **Inputs**: título, descripción corta, botón (vinculado a buy box o a scroll-to-offer), imagen de fondo opcional.
- **Settings**: tipo de fondo (color sólido / imagen), sticky en mobile (bool).
- **Blocks**: `reassurance_item` (opcional — íconos de "pago seguro", "garantía", "acceso inmediato").
- **Variantes**: banner simple, con imagen de fondo, sticky bar mobile.
- **Estados**: visible/oculto según scroll si es sticky (requiere JS liviano, `dce-cta.js`).
- **Futuro**: aparición solo después de pasar el Hero, vía `IntersectionObserver`.

## 15. Footer

- **Objetivo**: cierre de página — enlaces legales, contacto, sellos de confianza. No es un componente de conversión primaria sino de infraestructura/confianza.
- **Inputs**: heredado de `footer-group.json` de Dawn.
- **Settings / Blocks**: heredados de Dawn, extendidos con `trust_badge_item` opcional (logos de medios de pago, sellos de seguridad).
- **Futuro (decisión pendiente, no urgente)**: evaluar si conviene mantener el footer nativo de Dawn intacto o migrar a `dce-footer.liquid` propio cuando haya necesidad concreta de un layout distinto.

---

## Regla de expansión del catálogo

Un componente nuevo se agrega al catálogo solo cuando:
1. Se necesita en 2+ productos reales (evita construir para casos hipotéticos), **o**
2. Es un requisito no negociable de un producto ya en desarrollo.

Nunca se crea una sección "de un solo uso" para un producto puntual — si algo es realmente único, es un `block` o `setting` dentro de un componente existente, no un componente nuevo.
