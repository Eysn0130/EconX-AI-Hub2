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

const getVisibilityStatus = (element, viewportHeight) => {
  if (!element || !viewportHeight) {
    return 'idle';
  }

  const rect = element.getBoundingClientRect();
  const revealUpperLine = viewportHeight * 0.68;
  const revealLowerLine = viewportHeight * 0.18;
  const hideUpperLine = viewportHeight * 0.08;
  const hideLowerLine = viewportHeight * 1.08;

  if (rect.top <= revealUpperLine && rect.bottom >= revealLowerLine) {
    return 'show';
  }

  if (rect.bottom < hideUpperLine || rect.top > hideLowerLine) {
    return 'hide';
  }

  return 'idle';
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
    const resettableElements = new WeakSet();
    const deckConfigs = new Map();
    const deckCardElements = new WeakSet();
    let observer;

    const isResettable = (element) => resettableElements.has(element);

    const getDeckForElement = (element) => {
      if (!element) {
        return undefined;
      }
      return element.closest('[data-reveal-deck]');
    };

    const revealElement = (element) => {
      if (!element || element.classList.contains('is-visible')) {
        return;
      }

      const fallbackIndex = fallbackIndices.get(element) ?? 0;
      assignTimingProperties(element, fallbackIndex);
      element.classList.add('is-visible');
      if (observer && !isResettable(element)) {
        observer.unobserve(element);
      }
    };

    const hideElement = (element) => {
      if (!element || !element.classList.contains('is-visible')) {
        return;
      }

      element.classList.remove('is-visible');
    };

    const nonDeckElements = [];

    elements.forEach((element, index) => {
      fallbackIndices.set(element, index);
      assignTimingProperties(element, index);
      if (element.dataset.revealReset === 'true') {
        resettableElements.add(element);
      }
      const deck = getDeckForElement(element);
      if (deck) {
        deckCardElements.add(element);
        if (!deckConfigs.has(deck)) {
          deckConfigs.set(deck, {
            cards: [],
            expanded: false,
          });
          deck.classList.remove('deck-is-expanded');
        }
        const config = deckConfigs.get(deck);
        config.cards.push(element);
      } else {
        nonDeckElements.push(element);
      }
    });

    const updateDeckExpansion = (deck, shouldExpand) => {
      const config = deckConfigs.get(deck);
      if (!config || config.expanded === shouldExpand) {
        return;
      }

      config.expanded = shouldExpand;
      if (shouldExpand) {
        deck.classList.add('deck-is-expanded');
        config.cards.forEach((card) => {
          revealElement(card);
        });
      } else {
        deck.classList.remove('deck-is-expanded');
        config.cards.forEach((card) => {
          if (isResettable(card)) {
            hideElement(card);
          }
        });
      }
    };

    const evaluateDecks = (viewportHeight) => {
      deckConfigs.forEach((config, deck) => {
        const rect = deck.getBoundingClientRect();
        const expandLine = viewportHeight * 0.55;
        const collapseLowerBound = viewportHeight * 0.08;
        const collapseUpperBound = viewportHeight * 0.92;

        const shouldExpand = rect.top <= expandLine && rect.bottom >= collapseLowerBound;
        const shouldCollapse = rect.bottom <= collapseLowerBound || rect.top >= collapseUpperBound;

        if (shouldExpand) {
          updateDeckExpansion(deck, true);
        } else if (shouldCollapse) {
          updateDeckExpansion(deck, false);
        }
      });
    };

    const runManualCheck = () => {
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
      evaluateDecks(viewportHeight);
      nonDeckElements.forEach((element) => {
        const resettable = isResettable(element);
        if (!resettable && element.classList.contains('is-visible')) {
          return;
        }

        const visibilityStatus = getVisibilityStatus(element, viewportHeight);

        if (visibilityStatus === 'show') {
          revealElement(element);
        } else if (resettable && visibilityStatus === 'hide') {
          hideElement(element);
        }
      });
    };

    runManualCheck();

    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              revealElement(entry.target);
            } else if (isResettable(entry.target)) {
              hideElement(entry.target);
            }
          });
        },
        {
          threshold: 0.25,
          rootMargin: '0px 0px -12% 0px',
        },
      );

      nonDeckElements.forEach((element) => {
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

