import { test, expect } from '@playwright/test';
import { MerchantListPage } from '../pages/Merchant.js';

test.describe('Test Suite: Quản lý và tạo mới Merchant', () => {
    let merchantListPage;

    test.beforeEach(async ({ page }) => {
        merchantListPage = new MerchantListPage(page);

        // 1. Thực hiện luồng đăng nhập theo Codegen
        await page.goto('https://stg-daily.bship.vn/admin/login/');
        await page.getByRole('textbox', { name: 'Email' }).fill('quangtuyen12@gmail.com');
        await page.getByRole('textbox', { name: 'Mật khẩu' }).fill('123123');
        await page.getByRole('button', { name: 'Đăng nhập' }).click();
        
        // Chờ hệ thống xử lý đăng nhập thành công
        await page.waitForLoadState('networkidle');

        // 2. Sử dụng hàm điều hướng của Page Object để vào đúng màn hình Merchant
        await merchantListPage.goto();
    });

    test('TC-01: Tạo mới Merchant thành công với dữ liệu không trùng lặp', async ({ page }) => {
        // Tự động sinh Số điện thoại ngẫu nhiên (bắt đầu bằng 09 + 8 số ngẫu nhiên) để tránh trùng lặp
        const random8Digits = Math.floor(10000000 + Math.random() * 90000000).toString();
        const dynamicPhone = '09' + random8Digits;

        // Tự động sinh Email ngẫu nhiên
        const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let randomPrefix = '';
        for (let i = 0; i < 6; i++) {
            randomPrefix += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        const dynamicEmail = `merchant.${randomPrefix}@gmail.com`;

        // Chuẩn bị bộ data test theo đúng các trường nhập liệu từ bản Codegen
        const merchantData = {
            tenMerchant: `merchant_${randomPrefix}`, // Tên merchant có thể thêm timestamp để đảm bảo duy nhất
            email: dynamicEmail,
            matKhau: '12312112',
            sdt: dynamicPhone,
            nganhHang: 'GIấy tờ', 
            tenShop: `merchant_${Date.now()}`, // Tên shop có thể thêm timestamp để đảm bảo duy nhất
            diaChi: 'dd22 bạch m',
            diaChiFull: 'DD22, DD22 Bạch Mã, Phường Hò',
            tinhThanh: 'Thành phố Hồ Chí Minh'
        };

        // Gọi hàm xử lý điền form và tạo mới từ MerchantListPage
        await merchantListPage.taoMerchant(merchantData);

        // Kiểm tra kết quả hiển thị thông báo thành công từ hệ thống
        await expect(page.getByText(/Thành công|Tạo mới thành công/i).first()).toBeVisible({ timeout: 15000 });
        console.log(`✅ Tạo Merchant thành công! SĐT: ${dynamicPhone} | Email: ${dynamicEmail}`);
    });
});