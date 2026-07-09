# 07 — Filosofía y Roadmap

## El objetivo no es la página, es el motor

Todo lo definido en `01` a `06` existe para que esto sea cierto: **el trabajo de vender un producto digital nuevo se reduce a producir un archivo de contenido**, no a construir una página desde cero. El framework es el activo que se acumula; cada producto es una instancia barata de generar.

Esto cambia la pregunta que nos hacemos ante cada decisión de diseño/código: no es *"¿esto se ve bien para este producto?"*, es *"¿esto sigue funcionando cuando haya 200 productos que no existen todavía?"*.

## Visión: del PDF a la landing, sin intervención manual

Flujo objetivo a futuro (no se construye ahora — se construye *después* de que el framework esté validado con productos reales):

1. **Input**: se sube un PDF (infoproducto, ebook, guión de curso) o un brief.
2. **Extracción**: un análisis de ese contenido identifica los elementos que ya sabemos que el framework necesita como contenido — dolores, objeciones, deseos, beneficios, transformación prometida, señales de autoridad, CTAs naturales, preguntas frecuentes implícitas, testimonios si existen, estructura narrativa general.
3. **Mapeo**: esa extracción se traduce a un `templates/product.{handle}.json` válido — cada dolor extraído se convierte en un `pain_point_item`, cada beneficio en un `benefit_item`, etc. — siguiendo exactamente el schema definido en [05-components-catalog.md](05-components-catalog.md).
4. **Generación de variantes**: se producen 2-3 JSONs distintos (Landing A/B/C) para el mismo producto — mismo framework, distinta selección/orden/redacción de componentes.
5. **Medición**: tráfico real decide cuál convierte mejor.
6. **Consolidación**: los patrones de la variante ganadora (qué tipo de hero funcionó, qué orden de secciones, qué tono) informan la siguiente generación de landings — el framework "aprende" en el sentido de que el catálogo de componentes y las heurísticas de generación mejoran, no en el sentido de que haya un modelo entrenándose automáticamente.

**Por qué el trabajo de arquitectura de hoy es lo que habilita esto**: este flujo solo es viable porque el contenido ya es datos estructurados (JSON contra un schema conocido) y el diseño ya está totalmente separado del contenido. Si hubiéramos mezclado contenido y diseño en el mismo archivo (como hace una landing hecha a mano en el Theme Editor), este flujo sería imposible de automatizar. Es la razón de fondo detrás de la decisión de no usar el editor visual.

## Qué NO construimos todavía (y por qué)

Deliberadamente fuera de alcance de esta fase:

- **Pipeline de extracción con IA real** — se construye cuando haya 5-10 productos reales en el framework y sepamos qué patrones de contenido realmente se repiten. Construirlo antes es diseñar a ciegas.
- **Infraestructura de A/B testing formal** (asignación de tráfico, significancia estadística) — Shopify no lo resuelve nativamente a este nivel; cuando llegue el momento se evalúa una app dedicada o un mecanismo simple basado en redirección/UTM. No es parte del framework de theme, es una capa de growth por encima.
- **Personalización dinámica de contenido por segmento/audiencia** — mencionada como posibilidad futura en varios componentes del catálogo, no se implementa hasta que un producto real lo necesite.
- **Build step (bundler, preprocesador CSS)** — ver [03-css-architecture.md](03-css-architecture.md) y [04-js-architecture.md](04-js-architecture.md). Se evalúa solo si la escala del catálogo lo justifica.

Regla general del proyecto: **no se construye infraestructura para un caso de uso hipotético.** Se construye cuando el segundo o tercer producto real la necesita, nunca antes del primero.

## Cómo mejora el framework con cada producto nuevo

1. Un producto nuevo usa componentes existentes del catálogo → cero trabajo de framework, solo contenido.
2. Un producto nuevo necesita algo que el catálogo no tiene → se evalúa si es realmente nuevo o es una variante de un componente existente (ver regla de expansión en `05`). Si es genuinamente nuevo, se agrega **una vez**, quedando disponible para todos los productos futuros.
3. Un componente existente muestra una debilidad de conversión con datos reales → se mejora el componente en el framework, y **automáticamente** todos los productos que lo usan se benefician la próxima vez que se re-publiquen (los productos ya publicados no cambian solos — republicar es una decisión explícita, no automática).

Esto es lo que separa un framework de una colección de landings copiadas: el aprendizaje se acumula en el código compartido, no en cada archivo individual.

## Metodología de trabajo (cómo seguimos)

1. **Fase de arquitectura (`01`-`07`, este momento)** — se aprueba en conjunto antes de escribir Liquid.
2. **Vertical slice** — implementamos un solo componente completo de punta a punta (tokens → layout → Hero) para validar que toda la cadena (CSS layers, naming, carga condicional, JSON template) funciona en la práctica antes de escalar a los 14 componentes restantes.
3. **Catálogo completo** — una vez validado el patrón con Hero, el resto de los componentes se implementan siguiendo exactamente el mismo molde.
4. **Primer producto real end-to-end** — un producto real de Ventaja Digital publicado con el framework, como prueba de que el sistema completo (contenido JSON + framework + tienda real) funciona.
5. **Iteración** — recién ahí se evalúan las piezas marcadas como "no construido todavía" en este documento, con datos reales como guía.
