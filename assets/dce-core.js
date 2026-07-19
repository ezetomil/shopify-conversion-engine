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

/**
 * Buy-now: intercepts [data-dce-buy-now] form submits, adds the item via
 * the Cart AJAX API, and redirects straight to /checkout — no cart drawer,
 * no staying on the page. Every button using this markup behaves
 * identically by design (see docs/00-principles.md, point 4 — one
 * behavior, reused, never re-implemented per section).
 *
 * The form's real action/method already point at Shopify's native
 * /cart/add with a return_to=/checkout field, so if this script never
 * runs (blocked, failed, disabled) the form still submits natively and
 * Shopify performs the same add-then-redirect server-side. The fetch
 * path here only exists to skip the extra full-page round trip.
 */
function initBuyNow() {
  document.querySelectorAll('[data-dce-buy-now]').forEach((form) => {
    if (form.dataset.dceBuyNowBound) return;
    form.dataset.dceBuyNowBound = 'true';

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const submitButton = form.querySelector('[type="submit"]');
      submitButton?.setAttribute('disabled', 'disabled');

      const variantId = form.querySelector('[name="id"]')?.value;

      fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ id: variantId, quantity: 1 }),
      })
        .then((response) => {
          if (!response.ok) throw new Error('dce-buy-now: add to cart failed');
          window.location.href = '/checkout';
        })
        .catch(() => {
          form.submit();
        });
    });
  });
}

/**
 * Gallery carousel: prev/next buttons scroll the track by one card width.
 * The track itself is a plain scrollable list (scroll-snap), so touch and
 * trackpad scrolling already work with zero JS — these buttons are a
 * pointer-device convenience only.
 */
function initGalleryCarousel() {
  document.querySelectorAll('[data-dce-gallery-track]').forEach((track) => {
    if (track.dataset.dceGalleryBound) return;
    track.dataset.dceGalleryBound = 'true';

    const viewport = track.closest('.dce-gallery-v1__viewport');
    const prevButton = viewport?.querySelector('[data-dce-gallery-prev]');
    const nextButton = viewport?.querySelector('[data-dce-gallery-next]');
    const scrollByCard = (direction) => {
      const card = track.querySelector('.dce-gallery-v1__item');
      const amount = (card?.getBoundingClientRect().width || 300) + 20;
      track.scrollBy({ left: amount * direction, behavior: 'smooth' });
    };

    prevButton?.addEventListener('click', () => scrollByCard(-1));
    nextButton?.addEventListener('click', () => scrollByCard(1));
  });
}

initScrollReveal();
initMagnetic();
initBuyNow();
initGalleryCarousel();
document.addEventListener('shopify:section:load', () => {
  initScrollReveal();
  initMagnetic();
  initBuyNow();
  initGalleryCarousel();
});
