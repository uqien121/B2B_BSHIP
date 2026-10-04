import { test as setup, expect } from '@playwright/test';

const authFile = 'auth.json';

setup('authenticate', async ({ page }) => {
  await page.goto('https://stg-daily.bship.vn/admin/login/');
  await page.getByRole('textbox', { name: 'Email' }).fill('quangtuyen12@gmail.com');
  await page.getByRole('textbox', { name: 'Mật khẩu' }).fill('123123');
  await page.getByRole('button', { name: 'Đăng nhập' }).click();

  // Đợi đăng nhập thành công mới lưu session
  await expect(page).toHaveURL(/.*dashboard/);
  await page.context().storageState({ path: authFile });
});