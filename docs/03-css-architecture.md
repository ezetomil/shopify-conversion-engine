# 03 — Arquitectura CSS

## Decisión: sin build step, sin preprocesador, sin librerías

No usamos Tailwind, Bootstrap ni Sass/Less. Razones:

1. **Shopify ya resuelve el problema que Tailwind/Bootstrap resuelven** (utilidades + componentes) — agregar una librería pesada encima es peso muerto para el objetivo de Core Web Vitals.
2. **Un build step (Sass, PostCSS, bundlers) es una pieza más que se puede romper en 3 años** cuando cambie Node o el paquete quede sin mantenimiento. CSS nativo moderno (custom properties, `@layer`, `clamp()`, nesting nativo) ya cubre lo que antes solo daba un preprocesador.
3. **Dawn mismo funciona así**: archivos planos, cargados condicionalmente por sección, sin build. Nos alineamos al patrón que ya es estándar en el ecosistema de temas Shopify, en vez de pelear contra él.

Si en el futuro el proyecto lo justifica (ej. cientos de componentes y necesidad real de code-splitting más agresivo), se evalúa sumar `esbuild`/`PostCSS` como capa opcional — no como requisito de partida.

## CSS Cascade Layers (`@layer`)

Usamos `@layer` nativo (soportado en todos los navegores evergreen) para eliminar guerras de especificidad sin necesitar `!important` ni IDs. El orden de capas se declara una sola vez en `dce-base.css` (se carga primero, siempre):

```css
@layer tokens, reset, base, layout, utilities, components, overrides;
```

El orden en el que se **declaran** las capas define su prioridad final — no importa el orden en que se cargan los archivos después. Esto es lo que nos da mantenibilidad a largo plazo: un componente nuevo nunca puede "ganarle" por accidente a una utilidad, y una utilidad nunca le gana a un override intencional.

| Capa | Contenido | Archivo |
|---|---|---|
| `tokens` | Custom properties únicamente, sin selectores de elementos | `dce-tokens.css` |
| `reset` | Reset mínimo (box-sizing, márgenes, etc.) | `dce-base.css` |
| `base` | Estilos por defecto de elementos HTML (h1-h6, p, a, ul) | `dce-base.css` |
| `layout` | Primitivas: `.dce-container`, `.dce-stack`, `.dce-grid`, `.dce-section` | `dce-layout.css` |
| `utilities` | Clases de un solo propósito (`.dce-mt-8`, `.dce-text-center`) | `dce-utilities.css` |
| `components` | Estilos de cada componente de conversión | `dce-{componente}.css` |
| `overrides` | Excepciones puntuales, uso excepcional | inline `{% style %}` si hace falta |

## Responsabilidad de cada archivo global

- **`dce-tokens.css`** — solo `:root { --dce-*: ... }`. Nunca un selector de elemento.
- **`dce-base.css`** — reset + tipografía base de elementos nativos + declaración de `@layer`.
- **`dce-layout.css`** — primitivas reutilizadas por *todas* las secciones: contenedor centrado con max-width, stack vertical con gap consistente, grid de 12 columnas, wrapper de sección con `--dce-section-padding-y`.
- **`dce-utilities.css`** — utilidades atómicas mínimas e intencionales (no un sistema tipo Tailwind completo): espaciado (`.dce-mt-{n}`), visibilidad responsive (`.dce-hide-mobile`), texto (`.dce-text-center`, `.dce-text-muted`). Se agregan utilidades **solo cuando un patrón se repite 3+ veces** — no de forma especulativa.
- **`dce-animations.css`** — `@keyframes` + clases de motion (`.dce-fade-in`, `.dce-reveal`), respetando `prefers-reduced-motion`.
- **`dce-{componente}.css`** — un archivo por componente, cargado *solo* en la sección que lo usa (ver carga condicional abajo). Nunca estilos de otro componente acá.

## Carga condicional por sección (cero CSS no usado)

Cada sección `.liquid` carga únicamente su propio CSS, igual que hace Dawn nativamente:

```liquid
{{ 'dce-hero.css' | asset_url | stylesheet_tag }}
```

Los archivos globales (`dce-tokens.css`, `dce-base.css`, `dce-layout.css`, `dce-utilities.css`) se cargan **una sola vez**, en `layout/theme.liquid`, porque los necesita toda la página. Los archivos de componente se cargan **solo si la sección está presente en el template JSON de ese producto** — si un producto no usa la sección Comparativa, `dce-comparison.css` nunca se descarga en esa página.

## Nomenclatura de clases: BEM namespaced

```
.dce-{bloque}
.dce-{bloque}__{elemento}
.dce-{bloque}--{modificador}
```

Ejemplo real:

```html
<section class="dce-hero dce-hero--split">
  <h1 class="dce-hero__title">...</h1>
  <p class="dce-hero__subtitle">...</p>
  <div class="dce-hero__media">...</div>
</section>
```

Regla: un componente **nunca** referencia la clase de otro componente en su CSS. Si dos componentes necesitan compartir un patrón visual, ese patrón se extrae a `dce-layout.css` o a una utilidad, no se copia el nombre de clase de otro componente.

## Responsive: mobile-first + `clamp()` en vez de breakpoint-sprawl

La mayoría de los valores de tipografía y espaciado usan `clamp()` (ver [02-design-system.md](02-design-system.md)), lo que reduce drásticamente la cantidad de `@media` queries necesarias — el valor "fluye" entre mobile y desktop sin saltos. Los `@media` queries se reservan para **cambios estructurales de layout** (ej. de columna única a grid de 2 columnas), no para ajustar tamaños.

Breakpoints hardcodeados consistentes (no pueden ser custom properties, ver limitación en 02-design-system.md): `480 / 768 / 1024 / 1280 / 1536`.

```css
.dce-hero {
  display: flex;
  flex-direction: column;
}

@media (min-width: 1024px) {
  .dce-hero {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}
```

## Qué hace mantenible esto durante años

1. **Cero dependencias externas** que puedan quedar abandonadas o romper con actualizaciones de Node.
2. **`@layer` elimina la necesidad de `!important`** — cualquier desarrollador nuevo puede predecir qué gana sin adivinar orden de carga.
3. **1 componente = 1 archivo CSS**, nunca hay que buscar estilos de un componente en múltiples lugares.
4. **Tokens centralizados**: cambiar el acento de marca de un producto es cambiar 1-3 líneas en `dce-tokens.css` o un setting de tema, nunca un find-and-replace de colores hardcodeados.
5. **Utilidades mínimas por disciplina**, no por sistema — evita que el HTML se llene de 15 clases utilitarias por elemento (el anti-patrón típico de Tailwind mal usado).
