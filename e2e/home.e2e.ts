import { test } from './fixtures';
import { expect } from '@playwright/test';

test('zeigt Home für eingeloggten Nutzer', async ({ page, mockAuth }) => {
  await mockAuth({ id: '1', username: 'max' });
  await page.goto('/home');
  await expect(page).toHaveScreenshot("homepage.png");
});
