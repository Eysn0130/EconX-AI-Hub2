import { createContext } from 'react';

export const NavigationContext = createContext({
  navigateTo: () => {},
  buildLink: (path) => path,
  policeId: '',
});
