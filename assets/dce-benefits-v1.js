/**
 * DCE Benefits v1 — path progress. Isolated component script (see
 * docs/00-principles.md, point 4): owns exactly one behavior, scoped to
 * this section, never imported by anything else.
 *
 * As each step card reveals (its own IntersectionObserver, separate from
 * the generic scroll-reveal one in dce-core.js so this section's logic
 * stays self-contained), the path line's fill and glowing dot animate to
 * that step's position — discrete jumps (25/50/75/100%), each smoothed
 * by the CSS transition already on .dce-benefits-v1__path-fill/-dot, so
 * scrolling past a new step reads as the dot continuing to travel rather
 * than teleporting. The previous card also gets marked --passed, so it
 * stays visibly "lit" once the reader has moved on from it.
 */
function initBenefitsPath() {
  document.querySelectorAll('[data-dce-benefits-path]').forEach((list) => {
    if (list.dataset.dceBenefitsBound) return;
    list.dataset.dceBenefitsBound = 'true';

    const steps = Array.from(list.querySelectorAll('[data-dce-benefits-step]'));
    const fill = list.querySelector('[data-dce-benefits-fill]');
    const dot = list.querySelector('[data-dce-benefits-dot]');
    if (!steps.length || !fill || !dot) return;

    const setProgress = (index) => {
      const percent = ((index + 1) / steps.length) * 100;
      fill.style.height = `${percent}%`;
      dot.style.top = `${percent}%`;
    };

    if (!('IntersectionObserver' in window)) {
      setProgress(steps.length - 1);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = steps.indexOf(entry.target);
          setProgress(index);
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
