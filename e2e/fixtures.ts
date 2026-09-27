import { test as base, expect } from '@playwright/test';
import type { Schema } from '../src/api/types.ts';

export type User = Schema<'UserResponse'>;
export type UserGroup = Schema<'UserGroupResponse'>;

type Fixtures = {
  mockAuth: (user: User | null) => Promise<void>;
  mockUserGroups: (userId: User['id'], groups: UserGroup[]) => Promise<void>;
  unmockedApiGuard: void;
};

export const test = base.extend<Fixtures>({
  // Läuft automatisch in jedem Test: Jeder /api-Request ohne eigenen Mock wird
  // mit 404 beantwortet (statt beim Vite-Proxy zu landen) und lässt den Test am Ende scheitern.
  unmockedApiGuard: [
    async ({ page }, runFixture) => {
      const unmockedRequests: string[] = [];

      await page.route('**/api/**', (route) => {
        const request = route.request();
        unmockedRequests.push(`${request.method()} ${new URL(request.url()).pathname}`);
        return route.fulfill({ status: 404, json: {} });
      });

      await runFixture();

      expect(unmockedRequests, 'Nicht gemockte API-Requests').toEqual([]);
    },
    { auto: true },
  ],

  // Später registrierte Routen haben Vorrang, daher überschreiben die folgenden Mocks den Guard.
  mockAuth: async ({ page }, runFixture) => {
    await runFixture(async (user) => {
      await page.route('**/api/auth/me', (route) =>
        user ? route.fulfill({ json: user }) : route.fulfill({ status: 401, json: {} }),
      );
    });
  },

  mockUserGroups: async ({ page }, runFixture) => {
    await runFixture(async (userId, groups) => {
      await page.route(`**/api/users/${userId}/user-groups`, (route) =>
        route.fulfill({ json: groups }),
      );
    });
  },
});

export { expect };
