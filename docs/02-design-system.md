# 02 — Design System

Referencia visual: Apple (claridad, whitespace generoso), Stripe (precisión, sombras suaves, densidad de información controlada), Linear (contraste alto, tipografía nítida, micro-interacciones), Notion (calidez tipográfica), Raycast (dark-mode-first, iconografía consistente), Framer (motion con personalidad), Vercel (minimalismo técnico, negro/blanco con acentos puntuales).

Traducción a reglas concretas: **neutros dominantes, un solo color de acento, tipografía como jerarquía principal (no color), espaciado generoso, sombras casi imperceptibles, esquinas redondeadas pero no "friendly/infantiles", motion sutil y con propósito, nunca decorativo.**

Todos los tokens son **custom properties de CSS puro** en `assets/dce-tokens.css`, dentro de `@layer tokens` (ver [03-css-architecture.md](03-css-architecture.md)). Sin preprocesador, sin build step.

## Arquitectura de tokens: dos capas

Regla de diseño de sistemas (misma que usan Stripe/Radix/Shopify Polaris): **tokens primitivos** (la escala cruda de valores) nunca se usan directo en componentes. Los componentes consumen **tokens semánticos** (alias con significado). Esto permite retemar todo el sistema (ej. otro color de acento por producto) cambiando solo la capa semántica.

```css
/* Primitivo */
--dce-gray-500: #7C828C;
--dce-accent-500: #5B5BF6;

/* Semántico (esto es lo que usan los componentes) */
--dce-color-text-muted: var(--dce-gray-500);
--dce-color-accent: var(--dce-accent-500);
```

## Color

### Escala neutra (fría, estilo Linear/Vercel)

| Token | Hex |
|---|---|
| `--dce-gray-0` | `#FFFFFF` |
| `--dce-gray-25` | `#FCFCFD` |
| `--dce-gray-50` | `#F8F9FA` |
| `--dce-gray-100` | `#F1F2F4` |
| `--dce-gray-200` | `#E4E6E9` |
| `--dce-gray-300` | `#D0D3D8` |
| `--dce-gray-400` | `#A8ADB5` |
| `--dce-gray-500` | `#7C828C` |
| `--dce-gray-600` | `#5C6270` |
| `--dce-gray-700` | `#3F4451` |
| `--dce-gray-800` | `#262A33` |
| `--dce-gray-900` | `#14161A` |
| `--dce-gray-950` | `#0A0B0D` |

### Acento (configurable por producto vía theme settings)

Escala base indigo (`#5B5BF6`), pero expuesta como setting de tema (`settings.dce_accent_color`) para que cada producto/marca pueda tener su propio acento sin tocar CSS. 50 → 900, igual estructura que la escala neutra.

### Semánticos

| Token | Valor |
|---|---|
| `--dce-color-bg` | `var(--dce-gray-0)` |
| `--dce-color-bg-subtle` | `var(--dce-gray-50)` |
| `--dce-color-bg-inverse` | `var(--dce-gray-950)` |
| `--dce-color-border` | `var(--dce-gray-200)` |
| `--dce-color-border-strong` | `var(--dce-gray-300)` |
| `--dce-color-text` | `var(--dce-gray-900)` |
| `--dce-color-text-muted` | `var(--dce-gray-600)` |
| `--dce-color-text-inverse` | `var(--dce-gray-0)` |
| `--dce-color-accent` | `var(--dce-accent-500)` |
| `--dce-color-accent-subtle` | `var(--dce-accent-50)` |
| `--dce-color-success` | `#16A34A` |
| `--dce-color-warning` | `#D97706` |
| `--dce-color-error` | `#DC2626` |

Regla de uso: **el color nunca es el único portador de jerarquía**. Tamaño y peso tipográfico vienen primero; el acento se reserva para CTAs y estados activos, no para decorar.

## Tipografía

- **Familia primaria**: Inter (self-hosted vía `@font-face` en `dce-base.css`, o Shopify font picker). Geometría humanista, muy cercana a SF Pro — coherente con Apple/Stripe/Linear/Vercel.
- **Fallback stack**: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`.
- **Familia opcional (serif editorial)**: reservada como `--dce-font-serif`, apagada por defecto. Se evalúa activarla puntualmente en secciones narrativas (Story/Autor) si un producto se beneficia de un tono más editorial — decisión por producto, no global.

### Escala tipográfica (fluida con `clamp()`, mobile-first, sin depender de múltiples breakpoints)

| Token | clamp() |
|---|---|
| `--dce-text-xs` | `clamp(0.75rem, 0.72rem + 0.1vw, 0.8125rem)` |
| `--dce-text-sm` | `clamp(0.875rem, 0.84rem + 0.15vw, 0.9375rem)` |
| `--dce-text-base` | `clamp(1rem, 0.96rem + 0.2vw, 1.0625rem)` |
| `--dce-text-md` | `clamp(1.125rem, 1.06rem + 0.3vw, 1.25rem)` |
| `--dce-text-lg` | `clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem)` |
| `--dce-text-xl` | `clamp(1.5rem, 1.3rem + 0.9vw, 1.875rem)` |
| `--dce-text-2xl` | `clamp(1.875rem, 1.55rem + 1.4vw, 2.375rem)` |
| `--dce-text-3xl` | `clamp(2.25rem, 1.8rem + 2vw, 3rem)` |
| `--dce-text-4xl` | `clamp(2.75rem, 2.1rem + 2.8vw, 3.75rem)` |
| `--dce-text-5xl` | `clamp(3.25rem, 2.3rem + 4vw, 4.75rem)` |
| `--dce-text-6xl` | `clamp(3.75rem, 2.5rem + 5.5vw, 6rem)` |

- **Pesos**: solo 4 — `400` regular, `500` medium, `600` semibold, `700` bold. No más (evita inconsistencia visual).
- **Line-height**: `--dce-leading-tight: 1.1` (titulares grandes), `--dce-leading-snug: 1.25` (subtítulos), `--dce-leading-normal: 1.5` (cuerpo), `--dce-leading-relaxed: 1.65` (párrafos largos, texto narrativo).
- **Letter-spacing**: `--dce-tracking-tight: -0.02em` (headlines 3xl+), `--dce-tracking-normal: 0`.

## Spacing

Escala base 4px, sin excepciones ni valores mágicos fuera de la escala:

`--dce-space-1` (4px) · `-2` (8px) · `-3` (12px) · `-4` (16px) · `-5` (20px) · `-6` (24px) · `-8` (32px) · `-10` (40px) · `-12` (48px) · `-16` (64px) · `-20` (80px) · `-24` (96px) · `-32` (128px)

Ritmo vertical entre secciones (whitespace generoso estilo Apple/Linear): `--dce-section-padding-y: clamp(4rem, 8vw, 8rem)`.

## Grid & Container

- `--dce-container-max: 1200px` (contenido estándar), variante wide `1440px` para heroes/full-bleed.
- Grid de 12 columnas vía CSS Grid nativo (`.dce-grid`), gap controlado por `--dce-grid-gap` (default `--dce-space-6`, `--dce-space-8` en desktop).
- Padding lateral fluido: `--dce-container-padding-x: clamp(1.25rem, 4vw, 3rem)`.

## Breakpoints

| Token (documental) | Valor |
|---|---|
| `sm` | 480px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1280px |
| `2xl` | 1536px |

**Limitación técnica real**: las media queries de CSS no aceptan `var()` de custom properties. Estos valores no pueden vivir como custom properties funcionales — se documentan acá como constantes y se usan hardcodeados dentro de cada `@media` en el CSS. Si en el futuro sumamos un build step, se resuelve con PostCSS `custom-media`; hoy, sin build step, la disciplina es usar siempre estos 5 valores exactos, nunca uno ad-hoc.

## Radios

`--dce-radius-sm: 6px` · `--dce-radius-md: 10px` · `--dce-radius-lg: 16px` · `--dce-radius-xl: 24px` · `--dce-radius-full: 999px`

Uso: `sm` inputs/badges, `md` botones/cards, `lg` contenedores grandes/imágenes hero, `full` pills y avatares.

## Sombras

Estilo Stripe: multicapa, opacidad muy baja, nunca sombras duras.

```css
--dce-shadow-xs: 0 1px 2px rgba(16,24,40,.05);
--dce-shadow-sm: 0 1px 3px rgba(16,24,40,.08), 0 1px 2px rgba(16,24,40,.04);
--dce-shadow-md: 0 4px 8px rgba(16,24,40,.08), 0 2px 4px rgba(16,24,40,.04);
--dce-shadow-lg: 0 12px 24px rgba(16,24,40,.10), 0 4px 8px rgba(16,24,40,.04);
--dce-shadow-xl: 0 24px 48px rgba(16,24,40,.12);
```

## Motion

```css
--dce-duration-fast: 150ms;
--dce-duration-base: 250ms;
--dce-duration-slow: 400ms;
--dce-ease-standard: cubic-bezier(.4,0,.2,1);
--dce-ease-out: cubic-bezier(0,0,.2,1);
--dce-ease-spring: cubic-bezier(.34,1.56,.64,1); /* uso puntual, micro-interacciones tipo Framer */
```

Regla: toda animación respeta `prefers-reduced-motion: reduce` (se desactivan transiciones/animaciones no esenciales — accesibilidad, no opcional).

## Iconografía

> Implementación actualizada respecto a la versión original de este documento — ver [08-decisions-log.md](08-decisions-log.md).

- Se reutilizan los ~36 íconos que ya trae Dawn (`assets/icon-*.svg`) en vez de dibujar un set propio — menos superficie nueva, mismo resultado visual limpio.
- Entrega: `snippets/dce-icon.liquid`, que inlinea el SVG correspondiente vía el filtro nativo `inline_asset_content` (cero requests adicionales, cacheable, colorable vía `currentColor`), bajo el namespace `.dce-icon` para no heredar CSS de otros usos de Dawn.
- Uso: `{% render 'dce-icon', name: 'check_mark' %}`.
- Cada campo `icon` de un block expone un **subconjunto curado** de esos íconos relevante al componente (no los 36 completos, muchos son de retail/moda/alimentos) — ver la lista canónica en `sections/dce-problem-v1.liquid`.
- Color: reservado para uso neutro (`--dce-gray-700` sobre `--dce-gray-100`) salvo que el ícono esté directamente asociado a un CTA o estado activo — el acento no se usa para decorar íconos informativos.

## Componentes reutilizables (primitivas)

Antes de los 15 componentes de conversión (catálogo completo en [05-components-catalog.md](05-components-catalog.md)), estas primitivas los sostienen a todos:

- **Button** — variantes `primary / secondary / ghost / link`, tamaños `sm / md / lg`, estados `default / hover / active / disabled / loading`.
- **Badge/Pill** — para bonos, urgencia, categorías.
- **Section Header** — patrón eyebrow + título + subtítulo, reutilizado por casi todas las secciones.
- **Card** — contenedor base para beneficios, testimonios, bonos.
- **Rating/Stars**.
- **Accordion** — usado por FAQ y potencialmente Comparativa.
- **Countdown Timer** — usado por Oferta/CTA.

Cada una vive en `snippets/dce-{nombre}.liquid` con su CSS correspondiente en `assets/dce-{nombre}.css`.
