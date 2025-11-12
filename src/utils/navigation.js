const STATIC_EXT_PATTERN = /\.html?$/i;

const resolveRuntimeContext = () => {
  if (typeof window === 'undefined') {
    return {
      isStatic: false,
      origin: 'http://localhost/',
      basePath: '/',
    };
  }
  const directoryUrl = new URL('.', window.location.href);
  return {
    isStatic: STATIC_EXT_PATTERN.test(window.location.pathname),
    origin: directoryUrl.origin,
    basePath: directoryUrl.pathname.endsWith('/') ? directoryUrl.pathname : `${directoryUrl.pathname}/`,
  };
};

const parsePath = (input) => {
  if (typeof input !== 'string') {
    return { route: '/', query: '' };
  }
  const trimmed = input.trim();
  if (!trimmed || trimmed === '.' || trimmed === './') {
    return { route: '/', query: '' };
  }

  const hashIndex = trimmed.indexOf('#');
  const queryIndex = trimmed.indexOf('?');
  const endIndex = queryIndex >= 0 ? queryIndex : hashIndex >= 0 ? hashIndex : trimmed.length;
  const core = trimmed.slice(0, endIndex);
  const remainder = queryIndex >= 0 ? trimmed.slice(queryIndex + 1, hashIndex >= 0 ? hashIndex : undefined) : '';

  if (!core || core === '/' || core === './') {
    return { route: '/', query: remainder };
  }

  const normalized = core.replace(/^\.\//, '').replace(/^\//, '');
  return { route: normalized, query: remainder };
};

export const withPoliceId = (path, policeId) => {
  const { route, query } = parsePath(path);
  const { isStatic, origin, basePath } = resolveRuntimeContext();

  let pathname;
  if (route === '/') {
    pathname = isStatic ? `${basePath.replace(/\/$/, '')}/index.html` : basePath;
  } else {
    const needsExtension = isStatic && !STATIC_EXT_PATTERN.test(route);
    const finalSegment = needsExtension ? `${route}.html` : route;
    pathname = `${basePath}${finalSegment}`.replace(/\/{2,}/g, '/');
  }

  const url = new URL(pathname, origin);
  const searchParams = new URLSearchParams(query);
  if (policeId) {
    searchParams.set('policeid', policeId);
  }
  const search = searchParams.toString();
  return `${url.pathname}${search ? `?${search}` : ''}`;
};
