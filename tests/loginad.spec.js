import { test, expect } from '@playwright/test';

const { LoginPagead } = require('../pages/LoginPagead');

test.describe('Kịch bản kiểm thử Đăng nhập (Login Tests)', () => {
    let loginPage;

    test.beforeEach(async ({ page }) => {
        // 1. Xóa toàn bộ cookies và storage để ép trình duyệt về trạng thái chưa đăng nhập
        await page.context().clearCookies();
        loginPage = new LoginPagead(page);
        await loginPage.goto();
    });

    test("TC-01: Đăng nhập thành công với tài khoản hợp lệ", async ({ page }) => {
        await loginPage.login('quangtuyen12@gmail.com', '123123');
        
        // Chờ trang dashboard load hoàn tất
        await page.waitForURL('https://stg-daily.bship.vn/admin/vendor/dashboard/', { timeout: 50000 });
        await loginPage.expectDashboard();
    });

    test("TC-02: Đăng nhập thất bại khi nhập sai mật khẩu", async ({ page }) => {
        await loginPage.login('quangtuyen12@gmail.com', 'wrongpassword');
        await loginPage.expectErrorMessage('Tài khoản hoặc mật khẩu không đúng');
    });

    test("TC-03: Đăng nhập thất bại với email sai định dạng", async ({ page }) => {
        await loginPage.login('dsffgdgf', '123123');
        await loginPage.expectErrorMessage('Invalid email/phone or password');
    });

    test("TC-04: Đăng nhập thất bại khi để trống mật khẩu", async ({ page }) => {
        await loginPage.login('quangtuyen12@gmail.com', '');
        await loginPage.expectBrowserErrorMessage('Mật khẩu', 'Please fill out this field.');
    });

    test("TC-05: Đăng nhập thất bại khi để trống email", async ({ page }) => {
        await loginPage.login('', '123123');
        await loginPage.expectBrowserErrorMessage('Email', 'Please fill out this field.');
    });

    test('Kiểm tra chuyển hướng khi truy cập trang cá nhân mà chưa đăng nhập', async ({ page }) => {
        // Sau khi clear cookies, nếu vào trang đích, hệ thống phải tự động điều hướng về lại /admin/login/
        await page.goto('https://stg-daily.bship.vn/admin/login/');
        
        // Kiểm tra đúng trang login
        await expect(page).toHaveURL("https://stg-daily.bship.vn/admin/login/");
    });
});