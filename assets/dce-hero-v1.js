import { dceDefine } from './dce-core.js';

/**
 * <dce-tilt> — wraps the Hero cover image, applies a subtle 3D tilt that
 * follows the cursor via CSS custom properties (--dce-tilt-x/--dce-tilt-y,
 * read by dce-hero-v1.css). Pointer-fine only, off under reduced-motion —
 * purely decorative, the image is fully usable without it.
 */
class DceTilt extends HTMLElement {
  connectedCallback() {
    if (!window.matchMedia('(pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const maxTilt = 8;

    this.addEventListener('mousemove', (event) => {
      const rect = this.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      this.style.setProperty('--dce-tilt-x', `${(px * maxTilt * 2).toFixed(2)}deg`);
      this.style.setProperty('--dce-tilt-y', `${(py * -maxTilt * 2).toFixed(2)}deg`);
    });

    this.addEventListener('mouseleave', () => {
      this.style.setProperty('--dce-tilt-x', '0deg');
      this.style.setProperty('--dce-tilt-y', '0deg');
    });
  }
}

dceDefine('dce-tilt', DceTilt);
