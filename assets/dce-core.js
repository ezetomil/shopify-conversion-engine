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
 * Ripple — one delegated pointerdown listener for the whole document
 * covers every current and future `.dce-button` / `[data-dce-ripple]`
 * element (including ones added later by shopify:section:load), so unlike
 * the other initializers this never needs to be re-bound. Injects a
 * single short-lived span per tap; the host element's own CSS provides
 * position:relative + overflow:hidden so the ripple clips to its shape.
 */
function initRipple() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.addEventListener('pointerdown', (event) => {
    const host = event.target.closest('.dce-button, [data-dce-ripple]');
    if (!host || host.hasAttribute('disabled')) return;

    const rect = host.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.6;
    const ripple = document.createElement('span');
    ripple.className = 'dce-ripple';
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
    ripple.addEventListener('animationend', () => ripple.remove());
    host.appendChild(ripple);
  });
}

/**
 * Parallax — elements marked [data-dce-parallax] get a tiny scroll-linked
 * translateY, active only while they're actually on screen (an
 * IntersectionObserver adds/removes the scroll listener) and only ever
 * written inside requestAnimationFrame. Deliberately a separate DOM node
 * from any entrance animation or continuous keyframe on the same
 * component — see the comment in dce-hero-v1.css — so this is the only
 * thing ever setting this element's inline transform.
 */
function initParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const strength = 0.06;

  document.querySelectorAll('[data-dce-parallax]').forEach((target) => {
    if (target.dataset.dceParallaxBound) return;
    target.dataset.dceParallaxBound = 'true';

    let ticking = false;

    const update = () => {
      ticking = false;
      const rect = target.getBoundingClientRect();
      const offset = clamp(rect.top * strength, -24, 24);
      target.style.transform = `translateY(${offset}px)`;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          window.addEventListener('scroll', onScroll, { passive: true });
          onScroll();
        } else {
          window.removeEventListener('scroll', onScroll);
        }
      });
    });
    observer.observe(target);
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

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    /*
      Subtle coverflow-style 3D tilt driven by scroll position — cards
      away from center rotate a few degrees, like pages fanning out.
      Written to [data-dce-gallery-tilt], never to the <li> itself (which
      owns the entrance/press transforms) — see the comment in
      dce-gallery-v1.css.
    */
    const tilts = Array.from(track.querySelectorAll('[data-dce-gallery-tilt]'));
    let ticking = false;

    const updateTilt = () => {
      ticking = false;
      const trackRect = track.getBoundingClientRect();
      const center = trackRect.left + trackRect.width / 2;
      tilts.forEach((tilt) => {
        const itemRect = tilt.getBoundingClientRect();
        const itemCenter = itemRect.left + itemRect.width / 2;
        const distance = clamp((center - itemCenter) / trackRect.width, -0.5, 0.5);
        tilt.style.transform = `rotateY(${(distance * -10).toFixed(2)}deg)`;
      });
    };

    track.addEventListener(
      'scroll',
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(updateTilt);
      },
      { passive: true }
    );

    updateTilt();
  });
}

/**
 * Gallery zoom — tapping a card opens a single shared lightbox overlay
 * (created once, reused by every card) showing a larger version of that
 * page. Closes on backdrop tap, image tap, or Escape.
 */
function initGalleryZoom() {
  const triggers = document.querySelectorAll('[data-dce-gallery-zoom]');
  if (!triggers.length) return;

  let overlay = document.querySelector('[data-dce-gallery-overlay]');
  let image;

  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'dce-gallery-zoom';
    overlay.setAttribute('data-dce-gallery-overlay', '');
    image = document.createElement('img');
    image.className = 'dce-gallery-zoom__image';
    overlay.appendChild(image);
    document.body.appendChild(overlay);

    const close = () => {
      overlay.classList.remove('dce-is-open');
      document.body.style.overflow = '';
    };

    overlay.addEventListener('click', close);
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') close();
    });
  } else {
    image = overlay.querySelector('.dce-gallery-zoom__image');
  }

  triggers.forEach((trigger) => {
    if (trigger.dataset.dceZoomBound) return;
    trigger.dataset.dceZoomBound = 'true';

    trigger.addEventListener('click', () => {
      const sourceImg = trigger.querySelector('img');
      if (!sourceImg) return;
      image.src = sourceImg.currentSrc || sourceImg.src;
      image.alt = sourceImg.alt;
      overlay.classList.add('dce-is-open');
      document.body.style.overflow = 'hidden';
    });
  });
}

initScrollReveal();
initMagnetic();
initBuyNow();
initGalleryCarousel();
initGalleryZoom();
initParallax();
initRipple();
document.addEventListener('shopify:section:load', () => {
  initScrollReveal();
  initMagnetic();
  initBuyNow();
  initGalleryCarousel();
  initGalleryZoom();
  initParallax();
});
