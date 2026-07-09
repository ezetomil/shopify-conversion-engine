import { dceDefine } from './dce-core.js';

/**
 * <dce-stat data-value="35+">35+</dce-stat>
 * Counts up from 0 to the numeric portion of data-value once visible,
 * keeping any non-numeric prefix/suffix (e.g. "+", "%", "días") intact.
 * Skips the animation entirely for prefers-reduced-motion.
 */
class DceStat extends HTMLElement {
  connectedCallback() {
    const raw = this.dataset.value || this.textContent.trim();
    const match = raw.match(/^(\D*)(\d+)(\D*)$/);

    if (!match || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      return;
    }

    const [, prefix, digits, suffix] = match;
    const target = parseInt(digits, 10);
    let played = false;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !played) {
            played = true;
            this.animateCount(prefix, target, suffix);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );

    observer.observe(this);
  }

  animateCount(prefix, target, suffix) {
    const duration = 900;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * eased);
      this.textContent = `${prefix}${current}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }
}

dceDefine('dce-stat', DceStat);
