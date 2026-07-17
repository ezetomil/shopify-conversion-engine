/**
 * Smooth open/close for native <details>/<summary> FAQ items using the Web
 * Animations API. Progressive enhancement: intercepts the click to animate
 * height instead of the native instant toggle. If this script fails to
 * load, <details> still works natively — just without the animation.
 * Respects prefers-reduced-motion via the global rule in dce-base.css
 * (animation-duration gets forced to ~0 there, so this degrades to an
 * effectively instant toggle automatically).
 */
function initFaqAccordions() {
  document.querySelectorAll('.dce-faq-v1__item').forEach((details) => {
    if (details.dataset.dceFaqBound) return;
    details.dataset.dceFaqBound = 'true';

    const summary = details.querySelector('summary');
    const answer = details.querySelector('.dce-faq-v1__answer');
    let animation = null;
    let isClosing = false;

    summary.addEventListener('click', (event) => {
      event.preventDefault();
      if (isClosing || !details.open) {
        openItem();
      } else {
        closeItem();
      }
    });

    function openItem() {
      answer.style.overflow = 'hidden';
      details.open = true;
      const endHeight = answer.scrollHeight;
      animation?.cancel();
      animation = answer.animate(
        { blockSize: ['0px', `${endHeight}px`] },
        { duration: 260, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }
      );
      animation.onfinish = () => {
        answer.style.overflow = '';
        answer.style.blockSize = '';
      };
    }

    function closeItem() {
      isClosing = true;
      answer.style.overflow = 'hidden';
      const startHeight = answer.scrollHeight;
      animation?.cancel();
      animation = answer.animate(
        { blockSize: [`${startHeight}px`, '0px'] },
        { duration: 220, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }
      );
      animation.onfinish = () => {
        details.open = false;
        isClosing = false;
        answer.style.overflow = '';
      };
    }
  });
}

initFaqAccordions();
document.addEventListener('shopify:section:load', initFaqAccordions);
