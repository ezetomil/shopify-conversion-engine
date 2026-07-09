# 01 — Arquitectura del Proyecto

> Este documento se lee junto con [00-principles.md](00-principles.md), que define las reglas no negociables (variantes, desacople, alcance de producto) que toda decisión de acá abajo debe respetar.

## Principio rector

Dawn es **infraestructura heredada**: motor de tienda (header, footer, carrito, checkout, cuentas, búsqueda, páginas legales). El **framework propio (DCE — Digital Conversion Engine)** es una capa de componentes de conversión que vive por encima de Dawn, separada por convención de nombres, porque Shopify no permite subcarpetas reales dentro del tema.

No estamos construyendo una landing. Estamos construyendo un **catálogo finito y reutilizable de componentes** que, combinados vía un archivo de contenido, generan páginas de venta premium. El número de componentes crece lento y deliberadamente; el número de productos que el framework puede soportar crece sin tocar código.

## Restricción de plataforma (no es una elección, es una regla de Shopify)

Un tema Online Store 2.0 exige una estructura de carpetas **fija y plana** en la raíz:

```
assets/  config/  layout/  locales/  sections/  snippets/  templates/  blocks/
```

- `assets/`, `sections/`, `snippets/`, `blocks/` son **planas**: no admiten subcarpetas.
- `templates/` admite una única excepción anidada: `templates/customers/`.
- Cualquier carpeta que agreguemos fuera de esta lista (como `docs/`) **no se reconoce como parte del tema** y no se sube a Shopify — es documentación de repositorio, no de la tienda.

Por lo tanto, la "organización en carpetas" que normalmente esperarías en un proyecto de software se resuelve acá con tres mecanismos:

1. **Prefijo de namespace** (`dce-`) en todo archivo nuevo, para separarlo visualmente de los archivos nativos de Dawn.
2. **Nomenclatura 1:1** entre el `.liquid` de una sección y sus archivos `.css`/`.js` correspondientes.
3. **`docs/`** como la "carpeta lógica" del proyecto — la arquitectura documentada como si las carpetas existieran, aunque físicamente todo esté plano.

## Separación infraestructura vs. framework propio

| | Infraestructura Dawn | Framework DCE |
|---|---|---|
| Prefijo | ninguno (nombres originales de Dawn) | `dce-` en todo |
| Qué cubre | header, footer, cart, search, customer accounts, password, 404 | hero, problema, story, beneficios, oferta, testimonios, faq, etc. |
| Filosofía de cambio | tocar lo mínimo indispensable | ahí vive el 100% del desarrollo nuevo |
| Owner conceptual | "la tienda funciona" | "la tienda convierte" |

Regla práctica: si dudás si un archivo es infraestructura o framework, preguntate "¿esto existe en cualquier tienda Shopify estándar, o es específico de nuestro motor de conversión?". Lo primero es Dawn, lo segundo es DCE.

## Convención de nombres (una sola regla, sin excepciones)

- Todo archivo nuevo empieza con **`dce-`**.
- **kebab-case** siempre (`dce-social-proof.liquid`, nunca `dceSocialProof` ni `dce_social_proof`).
- Un componente = mismo nombre base en sus tres archivos posibles:
  `sections/dce-hero.liquid`, `assets/dce-hero.css`, `assets/dce-hero.js`.
  Con este nombre, cualquiera puede encontrar "todo lo que compone el Hero" con un solo `grep dce-hero`.
- **Variantes de un componente** (ver [00-principles.md](00-principles.md), punto 2) agregan un sufijo `-v{n}` y son archivos completamente independientes, nunca un `{% case %}` dentro de un único archivo:
  `sections/dce-hero-v1.liquid`, `sections/dce-hero-v2.liquid`, cada uno con su propio `dce-hero-v1.css` / `dce-hero-v2.css` si lo necesita. Todas las variantes de un mismo componente comparten el mismo contrato de settings/blocks.
- Snippets compartidos (usados por 2+ secciones): `snippets/dce-{nombre}.liquid`.
  Ej: `dce-button.liquid`, `dce-icon.liquid`, `dce-section-header.liquid`, `dce-badge.liquid`.
- Clases CSS: BEM namespaced. `.dce-hero`, `.dce-hero__title`, `.dce-hero--split`.
- Custom elements (Web Components) JS: `<dce-accordion>`, `<dce-carousel>`, `<dce-countdown>`.
- Tipos de block en el schema de una sección: `snake_case` simple, sin prefijo (ya están namespaced por vivir dentro de un archivo `dce-*`). Ej: `benefit_item`, `testimonial_item`, `faq_item`.
- Eventos custom de JS: `dce:{componente}:{accion}`. Ej: `dce:carousel:slide-change`, `dce:countdown:expired`.
- Templates de producto (contenido, ver [06-content-engine.md](06-content-engine.md)): `templates/product.{handle-del-producto}.json`.

## Estructura completa (vista lógica)

```
/
├── assets/                        (plano — CSS, JS, SVG)
│   ├── dce-tokens.css             → design tokens (custom properties)
│   ├── dce-base.css               → reset + estilos base de elementos
│   ├── dce-layout.css             → primitivas de layout (container, stack, grid, section)
│   ├── dce-utilities.css          → utilidades de un solo propósito
│   ├── dce-animations.css         → keyframes + utilidades de motion
│   ├── dce-core.js                → runtime compartido: lazy loader, utils, event bus
│   ├── dce-icons.svg              → sprite SVG (símbolos)
│   ├── dce-hero-v1.css / .js
│   ├── dce-hero-v2.css / .js      (variante adicional, archivo independiente)
│   ├── dce-problem-v1.css
│   ├── dce-story-v1.css
│   ├── dce-benefits-v1.css
│   ├── dce-transformation-v1.css
│   ├── dce-comparison-v1.css / .js
│   ├── dce-offer-v1.css / .js     (countdown)
│   ├── dce-bonuses-v1.css
│   ├── dce-author-v1.css
│   ├── dce-chapters-v1.css
│   ├── dce-testimonials-v1.css / .js (carrusel)
│   ├── dce-faq-v1.css / .js       (accordion)
│   ├── dce-guarantee-v1.css
│   ├── dce-cta-v1.css
│   └── dce-footer.css             (si reemplazamos el de Dawn — sin variantes por ahora)
├── config/                        (Dawn, se mantiene)
├── layout/
│   ├── theme.liquid                → Dawn, modificado mínimamente (carga global de dce-tokens.css)
│   └── password.liquid
├── locales/                       (Dawn, se mantiene)
├── sections/                      (plano)
│   ├── dce-hero-v1.liquid
│   ├── dce-hero-v2.liquid         (variante adicional cuando exista)
│   ├── dce-problem-v1.liquid
│   ├── dce-story-v1.liquid
│   ├── dce-benefits-v1.liquid
│   ├── dce-transformation-v1.liquid
│   ├── dce-comparison-v1.liquid
│   ├── dce-offer-v1.liquid
│   ├── dce-bonuses-v1.liquid
│   ├── dce-author-v1.liquid
│   ├── dce-chapters-v1.liquid
│   ├── dce-testimonials-v1.liquid
│   ├── dce-faq-v1.liquid
│   ├── dce-guarantee-v1.liquid
│   ├── dce-cta-v1.liquid
│   ├── dce-footer.liquid
│   └── ... (secciones nativas de Dawn intactas: header, footer-group, main-cart, etc.)
├── snippets/                      (plano)
│   ├── dce-button.liquid
│   ├── dce-badge.liquid
│   ├── dce-icon.liquid
│   ├── dce-section-header.liquid  (eyebrow + título + subtítulo, patrón compartido)
│   ├── dce-rating-stars.liquid
│   └── ...
├── templates/
│   ├── product.dce-base.json      → scaffold vacío de referencia
│   └── product.{handle}.json      → UN archivo por producto real = el "contenido" (ver punto 6)
└── docs/                          (NO se sube a Shopify — documentación del repo)
    ├── README.md
    ├── 01-architecture.md
    ├── 02-design-system.md
    ├── 03-css-architecture.md
    ├── 04-js-architecture.md
    ├── 05-components-catalog.md
    ├── 06-content-engine.md
    └── 07-philosophy-roadmap.md
```

## Escalabilidad a cientos de productos

La métrica que define si esto es realmente un framework: **agregar el producto #200 no debería requerir tocar una sola línea de CSS, JS o Liquid.** Solo un archivo JSON nuevo.

- El número de archivos de **framework** (sections/assets/snippets) se mantiene **constante** — hay ~20 componentes, no importa si hay 5 o 500 productos.
- El número de archivos de **contenido** (`templates/product.*.json`) crece 1:1 con los productos.
- Si en algún momento un producto necesita algo que el framework no soporta, la respuesta correcta es **agregar un componente o una variante al catálogo** (ver [05-components-catalog.md](05-components-catalog.md)), nunca hackear una excepción puntual en un JSON.

## Decisión abierta: no vamos a sincronizar con Dawn upstream

Al clonar Dawn eliminamos su historial de Git a propósito. Esto significa que **no vamos a poder hacer `git pull` de futuras actualizaciones de Dawn** (parches de seguridad, nuevas features de checkout, etc.) de forma automática. Es un trade-off consciente: ganamos ownership total del código, perdemos actualizaciones gratuitas de Shopify.

Mitigación: cuando Shopify libere una versión nueva de Dawn con un cambio relevante (ej. seguridad en checkout, cambios de API), lo evaluamos manualmente y portamos el fix a mano si aplica. Como tocamos mínimamente los archivos nativos de Dawn (ver separación arriba), este proceso debería ser manejable.

## `.shopifyignore`

Se agrega en la raíz del repo para excluir explícitamente del *push* a Shopify todo lo que es documentación/repositorio y no forma parte del tema:

```
docs/
.github/
README.md
CONTRIBUTING.md
CODE_OF_CONDUCT.md
release-notes.md
```
