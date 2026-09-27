import createClient, { type Middleware } from 'openapi-fetch';
import type { paths } from '../../generated/api/schemas';

/**
 * Endpoints, bei denen ein 401 eine falsche Eingabe bzw. einen erwarteten Zustand bedeutet
 * und nicht eine abgelaufene Session. Für diese wird kein globaler Logout ausgelöst.
 *
 * `satisfies` sorgt dafür, dass nur Pfade aus der OpenAPI-Spec eingetragen werden können:
 * Tippfehler oder später umbenannte Endpoints fallen sofort als TypeScript-Fehler auf.
 */
const EXPECTED_UNAUTHORIZED_PATHS = new Set<string>([
  '/api/auth/me',
  '/api/auth/login',
  '/api/users/{user-id}/password',
] satisfies (keyof paths)[]);

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function getCookie(name: string): string | null {
  const entry = document.cookie.split('; ').find((cookie) => cookie.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : null;
}

/** Double-Submit: CSRF-Header an jeden schreibenden Request hängen */
const csrfMiddleware: Middleware = {
  onRequest({ request }) {
    if (!SAFE_METHODS.has(request.method)) {
      const token = getCookie('XSRF-TOKEN');
      if (token) request.headers.set('X-XSRF-TOKEN', token);
    }
    return request;
  },
};

/**
 * Abgelaufene Session global melden. Verglichen wird mit `schemaPath`, also dem Pfad aus der
 * OpenAPI-Spec mit Platzhaltern (z. B. '/api/users/{user-id}/password'), nicht mit der
 * konkreten URL. Das ist exakt und unabhängig von IDs, Query-Parametern oder dem baseUrl.
 */
const unauthorizedMiddleware: Middleware = {
  onResponse({ response, schemaPath }) {
    if (response.status === 401 && !EXPECTED_UNAUTHORIZED_PATHS.has(schemaPath)) {
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return response;
  },
};

export const api = createClient<paths>({
  baseUrl: '/',
  credentials: 'include',
});
api.use(csrfMiddleware, unauthorizedMiddleware);
