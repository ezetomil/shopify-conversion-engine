# 06 — Motor de Contenido

## La decisión central de esta arquitectura

Pediste: "cualquier producto pueda generar una landing únicamente cambiando un archivo JSON, que contenga solamente contenido — nunca diseño, nunca estilos, nunca lógica."

Shopify **ya resuelve exactamente esto de forma nativa**, y no hace falta construir infraestructura propia (ni un backend, ni metaobjects, ni un sistema de plantillas paralelo) para lograrlo. Es la pieza más importante de toda la arquitectura, así que vale explicarla en detalle.

## Cómo funciona un template JSON de Shopify

Cada producto en Shopify puede tener asignado un **template suffix** propio (`product.{suffix}`), que corresponde a un archivo `templates/product.{suffix}.json`. Ese archivo JSON define:

- **Qué secciones aparecen** en la página, y en qué orden.
- **Qué blocks tiene cada sección**, y en qué orden.
- **El valor de cada setting y cada campo de cada block** — es decir, el contenido real: el headline del Hero, cada pain point del Problema, cada testimonio, cada pregunta de la FAQ.

Lo que el JSON **nunca** contiene: HTML, CSS, JS, ni lógica condicional. Todo eso vive exclusivamente en los archivos `.liquid`/`.css`/`.js` del framework (sections/snippets/assets). El JSON es 100% datos.

Esto significa que **"generar una landing nueva" es, literal y exactamente, "escribir un archivo `templates/product.{handle}.json` nuevo"** — sin tocar una sola línea de código. Es el punto 6 que pediste, ya resuelto por la plataforma, no por algo que tengamos que construir.

## Ejemplo concreto

```json
{
  "sections": {
    "hero": {
      "type": "dce-hero",
      "settings": {
        "layout": "split-media",
        "headline": "Domina el diseño de producto en 30 días",
        "subheadline": "El curso que usan 1.200+ diseñadores para conseguir su primer trabajo remoto",
        "cta_label": "Empezar ahora"
      }
    },
    "problem": {
      "type": "dce-problem",
      "blocks": {
        "p1": { "type": "pain_point_item", "settings": { "text": "Aplicás a 50 trabajos y no te responden" } },
        "p2": { "type": "pain_point_item", "settings": { "text": "Tu portfolio no refleja tu nivel real" } }
      },
      "block_order": ["p1", "p2"]
    },
    "faq": {
      "type": "dce-faq",
      "blocks": {
        "f1": { "type": "faq_item", "settings": { "question": "¿Necesito experiencia previa?", "answer": "No, el curso arranca desde cero." } }
      },
      "block_order": ["f1"]
    }
  },
  "order": ["hero", "problem", "faq"]
}
```

Cambiar `headline`, agregar un `pain_point_item`, o reordenar `order` es **todo** lo que hace falta para que ese producto tenga una landing distinta. El componente `dce-hero.liquid` no sabe ni le importa qué producto lo está usando — solo sabe renderizar los settings que recibe.

## Por qué el producto (no una Page) es la entidad correcta

El objeto vendible en Shopify (checkout, carrito, variantes, pagos) es el **Product**. Usamos productos, no páginas, como entidad de landing, para que:

- El buy box (precio, variantes, botón de compra) sea nativo y funcione con checkout de Shopify sin integraciones extra.
- Cada landing tenga automáticamente URL, SEO, sitemap, y compatibilidad con apps de reviews/upsell/analytics del ecosistema Shopify.
- El "componente Oferta" (ver [05-components-catalog.md](05-components-catalog.md)) pueda usar precio/`compare_at_price` reales del producto en vez de texto hardcodeado.

Flujo de creación de una landing nueva:
1. Se crea el producto en Shopify (precio, variantes, imágenes del catálogo).
2. Se le asigna el template suffix `product.{handle}`.
3. Se escribe/genera `templates/product.{handle}.json` combinando los componentes del catálogo con el contenido de ese producto específico.

## Variantes y A/B testing: swap de `"type"`, contenido intacto

Porque cada familia de componentes comparte un contrato de settings/blocks entre todas sus variantes ([00-principles.md](00-principles.md), punto 2 y [05-components-catalog.md](05-components-catalog.md)), armar una landing alternativa (Landing B) a partir de una existente (Landing A) es, técnicamente, copiar el JSON y cambiar el campo `"type"` de la sección que se quiere testear — el bloque de `settings`/`blocks` no se toca:

```json
// Landing A
"hero": { "type": "dce-hero-v1", "settings": { "headline": "Domina el diseño en 30 días", ... } }

// Landing B — mismo contenido, otra variante visual del Hero
"hero": { "type": "dce-hero-v2", "settings": { "headline": "Domina el diseño en 30 días", ... } }
```

Esto es lo que hace viable, más adelante, generar variantes de una misma landing para A/B testing sin duplicar ni reescribir contenido — la infraestructura de reparto de tráfico es una capa posterior (ver [07-philosophy-roadmap.md](07-philosophy-roadmap.md)), pero la condición técnica que la habilita (componentes intercambiables sin tocar contenido) ya es parte del motor desde el día uno.

## Regla de oro para cada componente nuevo

Todo campo que un componente exponga en su `schema` (settings o block settings) es, por definición, **contenido válido para el motor**. Si un componente necesita algo que hoy es "diseño" (ej. un color fijo, un layout hardcodeado), y en el futuro eso necesita variar por producto, la solución es **exponerlo como setting**, nunca como excepción hardcodeada en el `.liquid`. Esto mantiene la frontera "JSON = contenido, Liquid = diseño" sin fugas con el tiempo.

## Qué NO es este sistema (para evitar sobre-ingeniería)

- No es un CMS headless.
- No requiere una app externa ni backend propio para funcionar hoy.
- No requiere metaobjects ni metafields custom para el caso base — se evalúan más adelante solo si aparece contenido verdaderamente compartido entre productos (ej. un autor que aparece en 20 productos y no queremos duplicar su bio 20 veces; ahí sí un metaobject "autor" referenciado sería la solución correcta, pero no es necesario para arrancar).

## Conexión con el punto 7 (visión de generación automática)

Porque el contenido es un JSON con una estructura de schema conocida y finita (los ~15-20 componentes del catálogo), automatizar su generación —hoy manual, mañana asistida por IA— es, en términos técnicos, **"producir un JSON válido contra un schema conocido"**. Es un problema de generación estructurada, no de generación de código ni de diseño. El detalle de ese flujo futuro está en [07-philosophy-roadmap.md](07-philosophy-roadmap.md).
