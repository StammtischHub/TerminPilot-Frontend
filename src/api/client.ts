import createClient, { type Middleware } from 'openapi-fetch';
import type { components, paths } from './generated/types';

export type UserResponse = components['schemas']['UserResponse'];
export type UserRole = components['schemas']['UserRole'];

/** HTTP-Fehler mit Statuscode, da openapi-fetch selbst nicht wirft */
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`HTTP ${status}`);
    this.status = status;
  }
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

/** Double-Submit: CSRF-Header an jeden schreibenden Request hängen */
const csrfMiddleware: Middleware = {
  async onRequest({ request }) {
    if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      const token = getCookie('XSRF-TOKEN');
      if (token) request.headers.set('X-XSRF-TOKEN', token);
    }
    return request;
  },
};

/** Abgelaufene Session global melden; /me und /login sind reguläre 401-Fälle */
const unauthorizedMiddleware: Middleware = {
  async onResponse({ request, response }) {
    if (
      response.status === 401 &&
      !request.url.includes('/auth/me') &&
      !request.url.includes('/auth/login')
    ) {
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
