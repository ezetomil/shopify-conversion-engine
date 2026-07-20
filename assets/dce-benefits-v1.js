/**
 * DCE Benefits v1 — step progression. Isolated component script (see
 * docs/00-principles.md, point 4): owns exactly one behavior, scoped to
 * this section, never imported by anything else.
 *
 * As each step card reveals (its own IntersectionObserver, separate from
 * the generic scroll-reveal one in dce-core.js so this section's logic
 * stays self-contained), the previous card gets marked --passed, so it
 * stays visibly "lit" once the reader has moved on from it — the entry
 * animation and the absorb-flash overlay (both pure CSS, gated on
 * .dce-is-visible) handle everything else about how a card "receives"
 * energy, no JS needed for that part.
 */
function initBenefitsPath() {
  document.querySelectorAll('[data-dce-benefits-path]').forEach((list) => {
    if (list.dataset.dceBenefitsBound) return;
    list.dataset.dceBenefitsBound = 'true';

    const steps = Array.from(list.querySelectorAll('[data-dce-benefits-step]'));
    if (!steps.length || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = steps.indexOf(entry.target);
          if (index > 0) {
            steps[index - 1].classList.add('dce-benefits-v1__item--passed');
          }
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.4 }
    );

    steps.forEach((step) => observer.observe(step));
  });
}

initBenefitsPath();
document.addEventListener('shopify:section:load', initBenefitsPath);
