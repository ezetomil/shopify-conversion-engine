# 04 — Arquitectura JavaScript

## Principio: el JS es la excepción, no la regla

Liquid + CSS resuelven el 90% de la experiencia (Shopify renderiza server-side). JavaScript se agrega **solo** cuando algo requiere interactividad real en el cliente: accordion (FAQ), carrusel (testimonios), countdown (oferta), sticky CTA, validaciones de formulario. Ningún componente lleva JS "por si acaso".

Esto es directamente lo que pediste: cero JS innecesario, Core Web Vitals como prioridad número uno, no una librería/framework (nada de React/Vue/Alpine) — Liquid ya hace el renderizado, un framework de JS encima sería trabajo duplicado y peso extra.

## Sin bundler, Web Components nativos

- **ES Modules nativos** (`<script type="module">`), sin `import` de paquetes npm en runtime — el navegador resuelve los módulos directamente.
- Cada componente interactivo se implementa como **Custom Element (Web Component)** nativo: `<dce-accordion>`, `<dce-carousel>`, `<dce-countdown>`. Esto da encapsulación real (estado propio, ciclo de vida `connectedCallback`/`disconnectedCallback`) sin necesitar un framework — es el mismo patrón que Dawn usa cada vez más en sus propios componentes nuevos, así que nos alineamos con el ecosistema en vez de pelear contra él.
- Sin transpilación: el JS que escribimos es el JS que corre. Sintaxis moderna (ES2022+), sin preocuparse por Babel, porque Shopify storefronts corren en navegadores evergreen.

## Estructura de archivos (plana, igual restricción que CSS)

- **`dce-core.js`** — runtime compartido, cargado una sola vez en `theme.liquid`:
  - Helper base para registrar custom elements con manejo de errores consistente.
  - Utilidad de **scroll-reveal** genérica vía `IntersectionObserver` (`data-dce-animate` en cualquier elemento).
  - Micro event-bus para comunicación entre componentes desacoplados (ej. el countdown de Oferta notifica a un sticky CTA sin que se conozcan directamente).
  - Helper de breakpoint (`matchMedia` wrapper) para lógica JS que necesite saber el viewport actual.
- **`dce-{componente}.js`** — un archivo por componente interactivo, **cargado solo en la sección que lo usa**, igual que el CSS:
  ```liquid
  <script src="{{ 'dce-testimonials.js' | asset_url }}" type="module" defer></script>
  ```

## Carga y performance

1. **Defer/module por defecto** — nada bloquea el parseo del HTML.
2. **Carga condicional por sección** — si un producto no tiene Comparativa, `dce-comparison.js` nunca se pide.
3. **`import()` dinámico para lo pesado** — componentes con costo real (ej. un modal de video, un carrusel con librería de gestos) se cargan recién cuando:
   - entran en viewport (`IntersectionObserver`), o
   - el usuario interactúa (click) — ej. el JS de un modal no se descarga hasta que se hace click en "ver video".
4. **Sin polyfills** — target son navegadores evergreen (igual que Dawn desde que dropeó IE11).

## Convenciones

- Un custom element por componente interactivo, nombre `<dce-{nombre}>`, definido en `dce-{nombre}.js`.
- Comunicación entre componentes vía **CustomEvent** namespaced: `dce:{componente}:{accion}` (ej. `dce:countdown:expired`, `dce:carousel:slide-change`), nunca acoplamiento directo entre clases.
- Sin manipulación de estado global fuera del DOM — el estado vive en el custom element o se refleja en atributos (`data-*`), consistente con cómo Shopify espera que funcionen los temas (server-rendered + progressive enhancement).
- Accesibilidad no es opcional: todo componente interactivo (accordion, carrusel, modal) maneja foco, `aria-*` y navegación por teclado desde el día uno, no como agregado posterior.

## Core Web Vitals: reglas concretas

| Métrica | Regla |
|---|---|
| **LCP** (Largest Contentful Paint) | La imagen/elemento hero se carga con `loading="eager"` + `fetchpriority="high"`, nunca lazy. Es la única excepción a lazy loading. |
| **CLS** (Cumulative Layout Shift) | Toda imagen declara `width`/`height` o `aspect-ratio` en CSS — nunca layout que dependa de que la imagen ya cargó. Fuentes con `font-display: swap` + tamaño de fallback calculado para minimizar reflow. |
| **INP** (Interaction to Next Paint) | JS de interacción liviano y específico por componente (nunca un bundle global grande interpretándose en cada click). Trabajo pesado fuera del hilo principal cuando aplica (ej. `requestIdleCallback` para trabajo no crítico). |
| **JS total** | Presupuesto informal: un producto "promedio" (hero + 8-10 secciones) no debería superar ~15-20kb de JS propio sin comprimir, sin contar Dawn base. Si un componente lo rompe, se revisa antes de aceptarlo al catálogo. |

## Qué hace mantenible esto durante años

1. **Web Components nativos no dependen de un framework que puede quedar obsoleto** (a diferencia de acoplarse a una versión específica de React/Vue).
2. **1 componente = 1 archivo JS**, mismo principio que CSS — localización instantánea.
3. **Sin build step**: lo que está en `assets/` es exactamente lo que corre, sin capa de compilación que pueda desincronizarse.
4. **Presupuesto de performance explícito** evita que el proyecto degrade silenciosamente componente a componente.
