import { useEffect } from 'react';

const assignTimingProperties = (element, fallbackIndex) => {
  if (!element) {
    return;
  }

  const {
    revealDelay,
    revealDuration,
    revealEasing,
    revealIndex,
    revealStep,
    revealMaxDelay,
  } = element.dataset;

  let delay = revealDelay;

  if (!delay && revealIndex !== undefined) {
    const parsedIndex = Number(revealIndex);
    if (!Number.isNaN(parsedIndex)) {
      const step = Number(revealStep ?? 80);
      const maxDelay = Number(revealMaxDelay ?? 400);
      delay = `${Math.min(parsedIndex * step, maxDelay)}ms`;
    }
  }

  if (!delay) {
    delay = `${Math.min(fallbackIndex * 70, 350)}ms`;
  }

  if (delay && !element.style.getPropertyValue('--reveal-delay')) {
    element.style.setProperty('--reveal-delay', delay);
  }

  if (revealDuration) {
    element.style.setProperty('--reveal-duration', revealDuration);
  }

  if (revealEasing) {
    element.style.setProperty('--reveal-easing', revealEasing);
  }
};

const useScrollReveal = () => {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const elements = Array.from(document.querySelectorAll('.reveal-on-scroll'));

    if (!elements.length) {
      return undefined;
    }

    elements.forEach((element, index) => {
      assignTimingProperties(element, index);
    });

    if (!('IntersectionObserver' in window)) {
      elements.forEach((element) => {
        element.classList.add('is-visible');
      });
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const { target } = entry;
          assignTimingProperties(target, 0);
          target.classList.add('is-visible');
          observer.unobserve(target);
        });
      },
      {
        threshold: 0.25,
        rootMargin: '0px 0px -12% 0px',
      },
    );

    elements.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
    };
  }, []);
};

export default useScrollReveal;

