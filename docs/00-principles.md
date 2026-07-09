# 00 — Principios No Negociables del Framework

Este documento es la constitución del proyecto. Todo lo definido en `01`-`07` se interpreta bajo estas reglas. Ante cualquier decisión futura, esto es lo que prima.

## 1. Alcance: cualquier producto digital, no un ebook

El framework vende **ebooks, cursos, mentorías, bundles, membresías, eventos, software y cualquier producto digital futuro** — no un tipo de producto específico.

Regla de implementación: ningún componente puede contener copy, lógica o naming hardcodeado atado a un tipo de producto ("Módulos del curso", "Fecha del evento"). Todo texto vive en el JSON de contenido ([06-content-engine.md](06-content-engine.md)); los componentes exponen campos genéricos (`title`, `item_label`) que cada producto redacta según lo que vende. Si un componente necesita lógica realmente distinta por tipo de producto (ej. Oferta con fecha para un evento vs. Oferta con acceso inmediato para un ebook), la respuesta es una **variante** del componente (ver punto 2), nunca una condición `{% if product_type == 'curso' %}` dentro del archivo.

## 2. Sistema de variantes por componente

Cada componente del catálogo puede tener múltiples variantes visuales/estructurales — `dce-hero-v1`, `dce-hero-v2`, `dce-hero-v3`; `dce-cta-v1`, `dce-cta-v2`; `dce-faq-v1`, `dce-faq-v2` — sin límite predefinido.

**Implementación**: cada variante es un **archivo de sección completamente independiente** (`sections/dce-hero-v1.liquid`, `sections/dce-hero-v2.liquid`), con su propio CSS/JS si lo necesita (`dce-hero-v1.css`, `dce-hero-v2.css`). No existe un único `dce-hero.liquid` con un `{% case %}` interno de variantes — eso acopla todas las variantes al mismo archivo y viola el punto 4. Cada variante vive y evoluciona sola.

**Contrato de contenido compartido (regla crítica)**: todas las variantes de un mismo componente deben aceptar **el mismo conjunto base de settings/blocks** (mismo `id`, mismo tipo de dato) — aunque una variante no use visualmente todos los campos. Esto es lo que permite que un JSON de contenido escrito para `dce-hero-v1` funcione, sin reescribirse, si se cambia el `"type"` a `dce-hero-v2`. Una variante puede *agregar* campos opcionales propios, pero nunca puede *quitar o renombrar* un campo que forma parte del contrato base del componente. El contrato de cada componente se fija la primera vez que se implementa (v1) y se documenta junto al componente en [05-components-catalog.md](05-components-catalog.md); toda variante posterior se diseña contra ese contrato.

## 3. A/B testing como consecuencia directa del sistema de variantes

Gracias al punto 2, armar una landing alternativa es elegir, para cada sección, qué variante usar — nunca escribir contenido nuevo:

```
Landing A → Hero V1 + Story V2 + CTA V1
Landing B → Hero V3 + Story V1 + CTA V2
```

En la práctica (ver [06-content-engine.md](06-content-engine.md)) esto es cambiar el campo `"type"` de una sección en el JSON de contenido — el contenido (`settings`/`blocks`) se mantiene porque el contrato es compartido. El mismo motor, sin ramas de código por landing.

La infraestructura de reparto de tráfico y medición estadística **no es parte de esta fase** (ver [07-philosophy-roadmap.md](07-philosophy-roadmap.md)) — lo que construimos ahora es la condición necesaria (componentes intercambiables) para que esa capa sea trivial de agregar después.

## 4. Desacople total entre componentes

Cada sección debe renderizar correctamente **de forma aislada**, en cualquier posición, junto a cualquier combinación de otras secciones, sin asumir vecinos.

Reglas concretas:
- Ninguna sección referencia la clase CSS, el DOM o el estado JS de otra sección. Namespacing estricto por componente (ver [03-css-architecture.md](03-css-architecture.md)).
- El espaciado entre secciones lo resuelve un wrapper común (`--dce-section-padding-y` en `dce-layout.css`), nunca el margen de una sección asumiendo qué viene antes o después.
- Comunicación entre componentes, cuando es estrictamente necesaria (ej. un countdown de Oferta que también quiere mostrarse en un CTA sticky), ocurre **solo** vía el event bus (`dce:{componente}:{accion}`, ver [04-js-architecture.md](04-js-architecture.md)) — nunca una sección llamando directamente a una función/clase de otra.
- Ninguna sección asume que es la primera, la última, o que existe una sección específica en la página. Debe degradar bien si está sola.

Test de aceptación para todo componente nuevo: **debe poder eliminarse de una landing, o moverse a cualquier posición, sin romper ni alterar visualmente ninguna otra sección.**

## 5. Prioridades no negociables, en este orden

1. **Performance / Core Web Vitals** — todo componente se evalúa contra el presupuesto de JS y las reglas de LCP/CLS/INP definidas en [04-js-architecture.md](04-js-architecture.md) antes de aceptarse al catálogo.
2. **Escalabilidad** — ¿esto sigue funcionando igual de bien con 200 productos y 20 variantes por componente?
3. **Reutilización** — ¿esto sirve para el próximo producto sin modificarse, o es una solución de un solo uso?
4. **Mantenibilidad** — ¿alguien que no participó de esta conversación puede entender y extender esto en un año?

Velocidad de entrega **no está en esta lista**. No es que no importe — es que nunca es el criterio que decide una disputa entre opciones.

## 6. Nunca sacrificar arquitectura por velocidad

Ante cualquier atajo que resuelva un problema puntual más rápido pero comprometa el punto 4 (desacople) o el punto 2 (variantes/contrato), la decisión por defecto es **no tomarlo**, aunque cueste más tiempo de implementación. Este documento es el criterio de desempate explícito para esas discusiones — evita tener que negociar esto caso por caso.

## Checklist antes de aceptar cualquier componente/variante nueva al framework

- [ ] No hardcodea lenguaje ni lógica de un tipo de producto específico.
- [ ] Si es una variante nueva de un componente existente, respeta el contrato de contenido base sin quitar ni renombrar campos.
- [ ] Es un archivo `.liquid`/`.css`/`.js` independiente, sin `{% case %}` de variantes acopladas.
- [ ] No referencia clases, DOM ni JS de otra sección.
- [ ] Funciona aislado y en cualquier posición.
- [ ] Cumple el presupuesto de performance definido en `04-js-architecture.md`.
- [ ] Está documentado en `05-components-catalog.md` con su contrato de settings/blocks.
