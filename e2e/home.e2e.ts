import {test, expect, User, UserGroup} from './fixtures';

const max: User = { id: 1, username: 'max', roles: ['user'] };

test.describe('Home', () => {
  test('zeigt Hinweis, wenn der Nutzer in keiner Gruppe ist', async ({ page, mockAuth, mockUserGroups }) => {
    await mockAuth(max);
    await mockUserGroups(max.id, []);

    await page.goto('/home');

    await expect(page).toHaveScreenshot('homepage-empty.png');
  });

  test('zeigt die Gruppen des Nutzers', async ({ page, mockAuth, mockUserGroups }) => {
    await mockAuth(max);
    await mockUserGroups(max.id, [
      { id: 1, name: 'Familie' } as UserGroup,
      { id: 2, name: 'Fußball' } as UserGroup,
    ]);

    await page.goto('/home');

    await expect(page).toHaveScreenshot('homepage-groups.png');
  });
});
