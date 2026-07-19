# 08 — Registro de Decisiones de Arquitectura

Cambios y hallazgos descubiertos durante la implementación que no estaban previstos (o estaban previstos distinto) en los documentos `01`-`07`. Se agregan a medida que aparecen, más recientes arriba.

## Corrección: `@layer` no gana contra el CSS sin capa de Dawn — `!important` es necesario para títulos

**El bug**: [03-css-architecture.md](03-css-architecture.md) afirmaba que `@layer` elimina la necesidad de `!important`. Eso es cierto *entre archivos DCE*, pero no contra Dawn: `assets/base.css` define `h1, h2, h3, h4, h5 { color: rgb(var(--color-foreground)); }` **sin ninguna capa**. Por spec de CSS Cascade Layers, **una regla sin capa le gana a cualquier regla dentro de una capa, sin importar especificidad**. Resultado real: todos los títulos (`h1`-`h5`) de secciones con fondo oscuro (Hero, Transformación, CTA) se renderizaban con el color de texto oscuro por defecto de Dawn — invisibles sobre fondo oscuro. Pasó desapercibido en `shopify theme check` (no es un error de sintaxis, es de cascada) y solo se detectó al ver la página renderizada.

**El fix**: `color: var(--dce-color-text) !important;` en toda clase que estilice un `h1`-`h5` (`dce-hero-v1__heading`, `dce-section-header__heading`, `dce-cta-v1__heading`, `dce-transformation-v1__column-title`). Es el único lugar del framework donde `!important` es correcto — no un atajo, es la forma documentada de que CSS en capas gane contra CSS de terceros sin capa.

**Regla para componentes futuros**: cualquier clase nueva que fije `color` sobre un elemento `h1`-`h5` necesita `!important` en esa declaración específica. Elementos que no son `h1`-`h5` (`p`, `span`, `a`, custom elements) no tienen este problema — Dawn no fija `color` sin capa sobre esos selectores.

## Iconografía: se descarta el sprite propio, se reutilizan los SVG de Dawn

**Contexto**: [02-design-system.md](02-design-system.md) proponía un sprite SVG propio (`assets/dce-icons.svg` con `<symbol>`) para la iconografía del framework.

**Qué se implementó en su lugar**: Dawn ya trae ~36 íconos individuales (`assets/icon-*.svg`) y un mecanismo nativo de Shopify para inlinearlos sin requests extra: el filtro `inline_asset_content`. `snippets/dce-icon.liquid` reutiliza exactamente ese mecanismo (mismo patrón que el propio `snippets/icon-accordion.liquid` de Dawn), pero con su propio namespace de clases (`.dce-icon`) para no heredar CSS acoplado a otros usos de Dawn (ej. `.icon-accordion` tiene estilos de rotación específicos de acordeón).

**Por qué**: cero íconos nuevos que dibujar/mantener, cero requests adicionales (ya se inlinea igual que un sprite lo haría), y es exactamente el patrón que Dawn ya usa — menos superficie nueva que aprender o romper. Aplica directamente el principio de "sin duplicar lógica" también a nivel de assets, no solo de código.

**Curaduría de opciones por componente**: Dawn expone sus 36 íconos completos (muchos de retail/moda/alimentos: `banana`, `dairy_free`, `pants`, `washing`) que no aplican a productos digitales. Cada campo `icon` (tipo `select`) en un block de DCE expone un **subconjunto curado** relevante (ej. `question_mark`, `stopwatch`, `lock`, `price_tag`...), no la lista completa — mejor experiencia de edición, menos ruido. La lista curada usada en `dce-problem-v1` es el punto de partida canónico: reutilizarla en futuros componentes en vez de re-curar desde cero, salvo que el componente necesite un ícono genuinamente distinto.

## `dce-section-header`: primitivo extraído a partir del segundo componente

**Qué se implementó**: `snippets/dce-section-header.liquid` + `assets/dce-section-header.css` — el patrón eyebrow + título + subtítulo, usado por Problema y (según el catálogo) por casi todos los componentes siguientes.

**Nota importante**: Hero v1 (el primer componente, ya aprobado) implementa ese mismo patrón de forma inline, con sus propias clases (`.dce-hero-v1__eyebrow`, etc.), porque el primitivo todavía no existía cuando se construyó. **Deliberadamente no se refactorizó Hero v1** para adoptar el primitivo nuevo — el contrato de contenido (settings) no cambia, solo sería un cambio interno de marcado, y el riesgo de regresión visual en un componente ya validado no se justifica todavía. Queda anotado como candidato de limpieza futura, a hacer en un momento de bajo riesgo (por ejemplo, junto con Hero v2).

## Jerarquía de encabezados: `h1` reservado para el Hero

`dce-section-header.liquid` expone `heading_tag` con default `h2`. Regla: **debe existir un solo `h1` por página** (el heading del Hero) — el resto de los componentes usa `h2` (o `h3` si en el futuro un componente anida sub-secciones). Esto no estaba explicitado en `02`-`05` y es una corrección de accesibilidad/SEO que se vuelve regla general del framework a partir de acá.

## Color de acento reservado para CTAs y estados activos

`docs/02-design-system.md` ya decía "el acento se reserva para CTAs y estados activos, no para decorar" — Problema v1 es el primer componente no-Hero que lo pone en práctica: el ícono de cada punto de dolor usa un badge **neutro** (`--dce-gray-100` / `--dce-gray-700`), no el color de acento, precisamente para no diluir su significado como señal de "acción" en el resto de la página.
