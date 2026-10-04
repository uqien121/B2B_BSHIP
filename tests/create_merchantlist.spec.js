import { test, expect } from '@playwright/test';
import { MerchantListPage } from '../pages/MerchantList.js';

test.describe('Test Suite: Tạo chi nhánh tự động', () => {
    let merchantListPage;

    test.beforeEach(async ({ page }) => {
        merchantListPage = new MerchantListPage(page);

        // 1. Điều hướng tới trang dashboard
        await page.goto('https://stg-daily.bship.vn/admin/vendor/dashboard/');

        // 2. Chờ phần tử menu "Danh sách chi nhánh" hiện lên màn hình và nhấn vào nó
        const menuLink = page.locator('a:has-text("Danh sách chi nhánh")').first();
        await menuLink.scrollIntoViewIfNeeded();
        await menuLink.waitFor({ state: 'visible', timeout: 20000 });
        await menuLink.click();

        // 3. Chờ cho trang được tải hoàn tất
        await page.waitForLoadState('networkidle');
    });

    test('TC-01: Tạo chi nhánh thành công', async ({ page }) => {
        // Tạo số điện thoại: Bắt đầu bằng '09' và 8 số ngẫu nhiên
        const random8Digits = Math.floor(10000000 + Math.random() * 90000000).toString();
        const dynamicPhone = '09' + random8Digits;

        // Tạo email: Tiền tố ngẫu nhiên 5 ký tự và thêm đuôi @gmail.com
        const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let randomPrefix = '';
        for (let i = 0; i < 5; i++) {
            randomPrefix += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        const dynamicEmail = `${randomPrefix}@gmail.com`;

        const branchData = {
            tenChiNhanh: 'chi nhánh',
            sdt: dynamicPhone,
            email: dynamicEmail,
            matKhau: '123123',
            merchantName: 'merchant_jwv6l4',
            nganhHang: 'Thuốc',
            diaChi: 'dd22 bạch m',
            diaChiFull: 'DD22, DD22 Bạch Mã, Phường Hò',
            tinhThanh: 'Thành phố Hồ Chí Minh'
        };

        // Sử dụng hàm tạo chi nhánh đã được khai báo trong Page Object
        await merchantListPage.taoChiNhanh(branchData);

        // Kiểm tra kết quả
        await expect(page.getByText(/Thành công|Tạo mới thành công/i).first()).toBeVisible({ timeout: 10000 });
        console.log(`✅ Tạo chi nhánh thành công với SĐT: ${dynamicPhone} và Email: ${dynamicEmail}`);
    });
});