import { useEffect, useState } from 'react';

const DARK_MODE_KEY = 'darkMode';

export const useDarkMode = () => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.localStorage.getItem(DARK_MODE_KEY) === 'true';
  });

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    document.body.classList.toggle('dark-mode', isDark);
    window.localStorage.setItem(DARK_MODE_KEY, isDark ? 'true' : 'false');
  }, [isDark]);

  const toggle = () => {
    setIsDark((prev) => !prev);
  };

  return { isDark, toggle };
};
