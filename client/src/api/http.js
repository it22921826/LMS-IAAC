let resolvedApiBaseUrl = null;
let resolvingApiBaseUrl = null;

function envBaseUrl() {
  const v = import.meta.env.VITE_API_BASE_URL;
  return typeof v === 'string' && v.trim() ? v.trim().replace(/\/$/, '') : null;
}

async function canReachApi(baseUrl, { timeoutMs = 800 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${baseUrl}/api/health`, {
      method: 'GET',
      credentials: 'include',
      signal: controller.signal,
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

async function resolveApiBaseUrl() {
  if (resolvedApiBaseUrl) return resolvedApiBaseUrl;
  if (resolvingApiBaseUrl) return resolvingApiBaseUrl;

  const fromEnv = envBaseUrl();
  if (fromEnv) {
    resolvedApiBaseUrl = fromEnv;
    return fromEnv;
  }

  resolvingApiBaseUrl = (async () => {
    const cached =
      typeof window !== 'undefined'
        ? window.sessionStorage.getItem('iaac-api-base-url')
        : null;

    if (cached && (await canReachApi(cached))) {
      resolvedApiBaseUrl = cached;
      return cached;
    }

    // The server may auto-increment PORT (5000..5009). Probe quickly.
    for (let port = 5000; port <= 5009; port += 1) {
      const base = `http://localhost:${port}`;
      // eslint-disable-next-line no-await-in-loop
      if (await canReachApi(base)) {
        resolvedApiBaseUrl = base;
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem('iaac-api-base-url', base);
        }
        return base;
      }
    }

    resolvedApiBaseUrl = 'http://localhost:5000';
    return resolvedApiBaseUrl;
  })();

  try {
    return await resolvingApiBaseUrl;
  } finally {
    resolvingApiBaseUrl = null;
  }
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function readErrorMessage(res) {
  const text = await res.text();
  return text || `Request failed: ${res.status}`;
}

export async function apiGet(path) {
  const baseUrl = await resolveApiBaseUrl();
  let res;
  try {
    res = await fetch(`${baseUrl}${path}`, { credentials: 'include' });
  } catch {
    throw new ApiError('Network error', 0);
  }
  if (!res.ok) throw new ApiError(await readErrorMessage(res), res.status);
  return res.json();
}

export async function apiPost(path, body) {
  const baseUrl = await resolveApiBaseUrl();
  let res;
  try {
    res = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body ?? {}),
    });
  } catch {
    throw new ApiError('Network error', 0);
  }
  if (!res.ok) throw new ApiError(await readErrorMessage(res), res.status);
  return res.json();
}

export async function apiPut(path, body) {
  const baseUrl = await resolveApiBaseUrl();
  let res;
  try {
    res = await fetch(`${baseUrl}${path}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body ?? {}),
    });
  } catch {
    throw new ApiError('Network error', 0);
  }
  if (!res.ok) throw new ApiError(await readErrorMessage(res), res.status);
  return res.json();
}
