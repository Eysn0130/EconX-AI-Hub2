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
    revealTilt,
    revealElevation,
  } = element.dataset;

  let delay = revealDelay;
  const parsedIndex = revealIndex !== undefined ? Number(revealIndex) : Number.NaN;

  if (!delay && !Number.isNaN(parsedIndex)) {
    const step = Number(revealStep ?? 80);
    const maxDelay = Number(revealMaxDelay ?? 400);
    delay = `${Math.min(parsedIndex * step, maxDelay)}ms`;
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

  const isWorkflowCard = element.classList.contains('workflow-card');

  if (revealElevation && !element.style.getPropertyValue('--reveal-depth')) {
    element.style.setProperty('--reveal-depth', revealElevation);
  } else if (!element.style.getPropertyValue('--reveal-depth') && !isWorkflowCard) {
    const baseDepth = 48 + fallbackIndex * 6;
    element.style.setProperty('--reveal-depth', `${Math.min(baseDepth, 112)}px`);
  }

  if (revealTilt) {
    element.style.setProperty('--reveal-tilt', revealTilt);
  } else if (!Number.isNaN(parsedIndex) && !isWorkflowCard) {
    const tiltDirection = parsedIndex % 2 === 0 ? -1 : 1;
    element.style.setProperty('--reveal-tilt', `${tiltDirection * 7}deg`);
  } else if (!element.style.getPropertyValue('--reveal-tilt')) {
    element.style.setProperty('--reveal-tilt', '0deg');
  }
};

const shouldReveal = (element, viewportHeight) => {
  if (!element) {
    return false;
  }

  const rect = element.getBoundingClientRect();
  const upperTriggerLine = viewportHeight * 0.88;
  const lowerTriggerLine = viewportHeight * 0.05;

  return rect.top <= upperTriggerLine && rect.bottom >= lowerTriggerLine;
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

    const fallbackIndices = new Map();
    let observer;

    const revealElement = (element) => {
      if (!element || element.classList.contains('is-visible')) {
        return;
      }

      const fallbackIndex = fallbackIndices.get(element) ?? 0;
      assignTimingProperties(element, fallbackIndex);
      element.classList.add('is-visible');
      if (observer) {
        observer.unobserve(element);
      }
    };

    elements.forEach((element, index) => {
      fallbackIndices.set(element, index);
      assignTimingProperties(element, index);
    });

    const runManualCheck = () => {
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
      elements.forEach((element) => {
        if (element.classList.contains('is-visible')) {
          return;
        }

        if (shouldReveal(element, viewportHeight)) {
          revealElement(element);
        }
      });
    };

    runManualCheck();

    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              return;
            }

            revealElement(entry.target);
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
    }

    let ticking = false;
    const scheduleManualCheck = () => {
      if (ticking) {
        return;
      }
      ticking = true;
      window.requestAnimationFrame(() => {
        runManualCheck();
        ticking = false;
      });
    };

    const scrollTargets = new Set([window]);
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      scrollTargets.add(mainContent);
    }

    scrollTargets.forEach((target) => {
      target.addEventListener('scroll', scheduleManualCheck, { passive: true });
    });
    window.addEventListener('resize', scheduleManualCheck);

    return () => {
      if (observer) {
        observer.disconnect();
      }
      scrollTargets.forEach((target) => {
        target.removeEventListener('scroll', scheduleManualCheck);
      });
      window.removeEventListener('resize', scheduleManualCheck);
    };
  }, []);
};

export default useScrollReveal;

