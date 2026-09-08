import { test as base } from '@playwright/test';

type User = { id: string; username: string };

type Fixtures = {
  mockAuth: (user: User | null) => Promise<void>;
};

export const test = base.extend<Fixtures>({
  mockAuth: async ({ page }, runFixture) => {
    await runFixture(async (user) => {
      await page.route('**/api/auth/me', (route) =>
        user
          ? route.fulfill({ json: user })
          : route.fulfill({ status: 401, json: {} }),
      );
    });
  },
});
