import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

export const usePoliceId = () => {
  const location = useLocation();
  const policeId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('policeid') || '';
  }, [location.search]);

  return policeId;
};
