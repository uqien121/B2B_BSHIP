import { test, expect } from '@playwright/test';
import { RestaurantPage } from '../pages/Restaurant.js';
import { randomBytes } from 'node:crypto';

test.describe('Test Suite: Quản lý và tạo mới Nhà hàng', () => {
    let restaurantPage;

    test.beforeEach(async ({ page }) => {
        restaurantPage = new RestaurantPage(page);

        // 1. Thực hiện đăng nhập hệ thống dựa theo luồng dự án
        await page.goto('https://stg-daily.bship.vn/admin/login/');
        await page.getByRole('textbox', { name: 'Email' }).fill('quangtuyen12@gmail.com');
        await page.getByRole('textbox', { name: 'Mật khẩu' }).fill('123123');
        await page.getByRole('button', { name: 'Đăng nhập' }).click();
        
        // Chờ đăng nhập thành công và chuyển trang
        await page.waitForLoadState('networkidle');

        // 2. Điều hướng tới màn hình Danh sách nhà hàng
        await restaurantPage.goto();
    });

  test('TC-01: Tạo mới nhà hàng thành công với thông tin định danh không trùng lặp', async ({ page }) => {
    // Hàm sinh ngẫu nhiên chuỗi số với độ dài tùy chọn
    const generateRandomDigits = (length) => {
        let result = '';
        for (let i = 0; i < length; i++) {
            result += Math.floor(Math.random() * 10).toString();
        }
        return result;
    };

    // ĐÃ SỬA: Quy chuẩn SĐT gồm 10 số, bắt đầu bằng số 0 (Sinh thêm 9 số ngẫu nhiên phía sau)
    const dynamicPhone = '0' + generateRandomDigits(9); 
    
    // Mã số thuế và mã định danh giữ nguyên quy chuẩn 12 số (Sinh 11 số ngẫu nhiên)
    const dynamicTaxCode = '0' + generateRandomDigits(11);
    const dynamicIdentityCode = '0' + generateRandomDigits(11);

    // Bộ data test truyền vào hàm tạo
    const restaurantData = {
        tenNhaHang: `nhà hàng`, // Tên nhà hàng có thể thêm timestamp để đảm bảo duy nhất
        sdt: dynamicPhone, // SĐT lúc này đã chuẩn 10 số
        gioMoCua: '00:00',
        gioDongCua: '12:00',
        tenDaiLy: 'Test Tạo TK Mới',
        diaChi: 'dd22 bạch m',
        diaChiFull: 'DD22, DD22 Bạch Mã, Phường Hò',
        tinhThanh: 'Thành phố Hồ Chí Minh',
        loaiHinhDoanhNghiep: 'Công ty TNHH 1 thành viên',
        maSoThue: dynamicTaxCode,
        maSoDinhDanh: dynamicIdentityCode
    };

    // Thực thi hàm tạo nhà hàng qua Page Object
    await restaurantPage.taoNhaHang(restaurantData);

    // Kiểm tra thông báo lưu thành công xuất hiện trên màn hình UI
    await expect(page.getByText(/Thành công|Tạo mới thành công/i).first()).toBeVisible({ timeout: 15000 });
    
    console.log(`✅ Tạo Nhà hàng thành công!`);
    console.log(`   - SĐT (10 số): ${dynamicPhone}`);
    console.log(`   - Mã số thuế (12 số): ${dynamicTaxCode}`);
    console.log(`   - Mã số định danh (12 số): ${dynamicIdentityCode}`);
});
});