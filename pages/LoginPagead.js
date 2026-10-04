import { expect } from '@playwright/test';

export class LoginPagead {
    constructor(page) {
        this.page = page;
        this.emailInput = page.getByRole('textbox', { name: 'Email' });
        this.passwordInput = page.getByRole('textbox', { name: 'Mật khẩu' });
        this.loginButton = page.getByRole('button', { name: 'Đăng nhập' });
    }

    async goto() {
        await this.page.goto('https://stg-daily.bship.vn/admin/login/');
    }

    async login(email, password) {
        // Click và fill để giả lập đúng hành động người dùng như code bạn gửi
        await this.emailInput.click();
        await this.emailInput.fill(email || '');
        await this.passwordInput.click();
        await this.passwordInput.fill(password || '');
        await this.loginButton.click();
    }

    async expectDashboard() {
        await expect(this.page).toHaveURL(/.*dashboard/, { timeout: 50000 });
    }

    // PHẦN KHAI BÁO CẬP NHẬT:
   async expectBrowserErrorMessage(inputName, expectedMessage) {
        const input = inputName === 'Email' ? this.emailInput : this.passwordInput;
        
        // Lấy thông báo lỗi trực tiếp từ thuộc tính validationMessage của HTML5
        const validationMessage = await input.evaluate((element) => element.validationMessage);
        
        expect(validationMessage).toBe(expectedMessage);
    }

    // KIỂM TRA LỖI SERVER (Dành cho case sai tài khoản)
    async expectErrorMessage(expectedMessage) {
        const errorLocator = this.page.getByText(new RegExp(expectedMessage, 'i'));
        await expect(errorLocator).toBeVisible({ timeout: 5000 });
    }
}