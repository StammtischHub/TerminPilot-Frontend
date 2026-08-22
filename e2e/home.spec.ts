import { test, expect } from "@playwright/test";

test("Startseite Screenshot", async ({ page }) => {
    await page.goto("/home");
    await expect(page).toHaveScreenshot("homepage.png");
});