# Digital Conversion Engine — Documentación de Arquitectura

Este framework está construido sobre Dawn (Shopify), pero es un **motor de conversión reutilizable** para productos digitales, no una landing individual. Toda página nueva se genera combinando un catálogo finito de componentes con un archivo de contenido — nunca escribiendo diseño nuevo por producto.

Esta carpeta documenta la arquitectura completa. No se sube a la tienda (ver `.shopifyignore` en la raíz).

## Índice

1. [Arquitectura del proyecto](01-architecture.md) — estructura de carpetas, convenciones de nombres, separación infraestructura/framework, escalabilidad.
2. [Design System](02-design-system.md) — tokens: color, tipografía, spacing, grid, breakpoints, radios, sombras, motion, iconografía.
3. [Arquitectura CSS](03-css-architecture.md) — CSS Cascade Layers, sin build step, carga condicional, nomenclatura BEM.
4. [Arquitectura JavaScript](04-js-architecture.md) — Web Components nativos, carga condicional, Core Web Vitals.
5. [Catálogo de componentes](05-components-catalog.md) — spec completa de los 15 componentes de conversión + primitivas.
6. [Motor de contenido](06-content-engine.md) — cómo un JSON de Shopify se convierte en la única fuente de contenido de una landing.
7. [Filosofía y roadmap](07-philosophy-roadmap.md) — visión de generación automática, qué no construimos todavía, metodología de trabajo.

## Estado

**Fase actual: arquitectura en revisión, sin código de framework implementado todavía.** Ver metodología en el documento 07 para los próximos pasos una vez aprobada.
