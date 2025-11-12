export const withPoliceId = (path, policeId) => {
  if (!policeId || typeof window === 'undefined') {
    return path;
  }
  const url = new URL(path, window.location.origin);
  url.searchParams.set('policeid', policeId);
  return `${url.pathname}${url.search}`;
};
