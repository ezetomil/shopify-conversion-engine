/**
 * DCE Core — shared runtime loaded once on every page. See docs/04-js-architecture.md.
 * No framework, no bundler: plain ES module, native Web Components.
 */

/**
 * Registers a custom element once, tolerating re-registration attempts
 * (Shopify section reloads in the theme editor can re-execute this module).
 */
export function dceDefine(tagName, elementClass) {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, elementClass);
  }
}

/** Namespaced event bus so components communicate without referencing each other directly. */
export function dceEmit(name, detail, target = document) {
  target.dispatchEvent(new CustomEvent(`dce:${name}`, { detail, bubbles: true }));
}

export function dceOn(name, handler, target = document) {
  target.addEventListener(`dce:${name}`, handler);
  return () => target.removeEventListener(`dce:${name}`, handler);
}

/** Breakpoint helper matching the values documented in docs/02-design-system.md. */
export const dceBreakpoints = {
  sm: '(min-width: 480px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  xxl: '(min-width: 1536px)',
};

export function dceMatches(breakpoint) {
  return window.matchMedia(dceBreakpoints[breakpoint]).matches;
}

/** Scroll-reveal: adds .dce-is-visible to any [data-dce-animate] element once it enters the viewport. */
function initScrollReveal() {
  const targets = document.querySelectorAll('[data-dce-animate]');
  if (!targets.length) return;

  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    targets.forEach((el) => el.classList.add('dce-is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('dce-is-visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  targets.forEach((el) => observer.observe(el));
}

/**
 * Magnetic hover: elements with [data-dce-magnetic] nudge a few px toward
 * the cursor while hovered, spring back on leave. Pointer-fine devices
 * only (skips touch entirely) and off under prefers-reduced-motion —
 * this is a decorative micro-interaction, never load-bearing.
 */
function initMagnetic() {
  if (!window.matchMedia('(pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const strength = 0.25;
  const maxOffset = 10;

  document.querySelectorAll('[data-dce-magnetic]').forEach((el) => {
    if (el.dataset.dceMagneticBound) return;
    el.dataset.dceMagneticBound = 'true';

    el.addEventListener('mousemove', (event) => {
      const rect = el.getBoundingClientRect();
      const offsetX = clamp((event.clientX - rect.left - rect.width / 2) * strength, -maxOffset, maxOffset);
      const offsetY = clamp((event.clientY - rect.top - rect.height / 2) * strength, -maxOffset, maxOffset);
      el.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

initScrollReveal();
initMagnetic();
document.addEventListener('shopify:section:load', () => {
  initScrollReveal();
  initMagnetic();
});
