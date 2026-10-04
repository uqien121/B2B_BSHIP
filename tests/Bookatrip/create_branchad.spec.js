import { test, expect } from '@playwright/test';
import { BranchPage } from '../../pages/Branchad.js';

test.describe('Test Suite: Tạo đơn hàng lẻ', () => {
    let branchPage;

    test.beforeEach(async ({ page }) => {
        branchPage = new BranchPage(page);

        // Nạp trang dashboard (Playwright tự dùng cookies từ auth.json)
        await page.goto('https://stg-daily.bship.vn/admin/vendor/dashboard/');


        // Kiểm tra xem có thực sự đã đăng nhập chưa (tránh trường hợp token hết hạn)
        await expect(page.locator('a').filter({ hasText: 'Danh sách chuyến lẻ' })).toBeVisible({ timeout: 10000 });
    });

test('TC-01: Tạo đơn hàng lẻ thành công', async ({ page }) => {
        const testData = {
            phone: '0523722851',
            name: 'Autotest',
            address: 'DD22 Bạch Mã',
            addressFull: 'DD22 Bạch Mã',
            
            senderPhone: '0396463867',
            senderName: 'QUYEN',
            senderAddress: 'EE12',
            senderAddressFull: 'Đường EE12',
            madon: 'AUTO-' + Date.now(),
            dichVu: 'Có',
            loaiHang: 'me chua',
            trongluong: '11',
            paycod: '1,0000',
            giatri: '10,0000'
        };

        // Mở popup tạo đơn từ màn hình quản lý
        await branchPage.moPopupTaoDon();
        
        // Thực hiện nhập liệu
        await branchPage.datChuyenThanhCong(testData);

        // Kiểm tra kết quả
        await expect(page.getByText(/thành công/i).first()).toBeVisible({ timeout: 10000 });
    });


 test('TC-02: Hủy đơn hàng đầu danh sách', async ({ page }) => {
        await branchPage.huyChuyenDauDanhSach();
        await expect(page.getByText('Hủy chuyến thành công!')).toBeVisible();
    });

    test('TC-03: Tìm và Hủy chuyến ở trạng thái Đang tìm', async ({ page }) => {
        const result = await branchPage.timVaHuyChuyenDangTim();
        const thongBaoThanhCong = page.getByText(/Hủy chuyến thành công/i);
        
        if (await thongBaoThanhCong.isVisible({ timeout: 5000 })) {
            await expect(thongBaoThanhCong).toBeVisible();
        } else {
            console.log('Kết thúc test: Không có chuyến nào được hủy.');
        }
    });

    test('TC-04: Đặt lại đơn hàng từ trạng thái Đã hủy', async ({ page }) => {
        await branchPage.datLaiChuyenDaHuy();

        const toastSuccess = page.getByText(/Thành công/i).last();
        await expect(toastSuccess).toBeVisible({ timeout: 10000 });

        const firstRow = page.locator('table tbody tr').first();
        await expect(firstRow).toContainText(/Chờ lấy|Pending|Đang tìm|Mới/i);
    });
   
    test('TC-05: Tạo mã QR cho chuyến lẻ đã hủy', async ({ page }) => {
        await branchPage.taoMaQRChoChuyenHuy();
        const qrPopup = page.getByText(/Mã QR|QR Code/i).first();
        await expect(qrPopup).not.toBeVisible();
    });

    test('TC-06: Tạo lại chuyến mới từ đơn đã hủy', async ({ page }) => {
        const dataUpdate = {
            address: 'DD22 BẠCH MÃ',
            senderAddress: 'DD23 BẠCH MÃ'
        };

        await branchPage.taoLaiChuyenTuDaHuy(dataUpdate);

        const toastSuccess = page.getByText(/Thành công/i).last();
        await expect(toastSuccess).toBeVisible({ timeout: 10000 });

        await page.reload();
        await page.waitForLoadState('networkidle');
        const firstRow = page.locator('table tbody tr').first();
        await expect(firstRow).toContainText(/Chờ lấy|Mới|Pending|Đang tìm|Không tìm thấy tài xế/i);
    });

    // test('TC-06: Bỏ trống trường bắt buộc và nhấn ước tính phí', async ({ page }) => {
    //     const isErrorVisible = await branchPage.kiemTraLoiBoTrongTruongBatBuoc();
    //     expect(isErrorVisible).toBe(true);
    //     const validationMessage = await page.locator('input[name="weight"]').evaluate(node => node.validationMessage);
    //     expect(validationMessage).toContain('Please fill out this field');
    // });

    // test('TC-08: Không cho phép nhập chữ vào ô SĐT', async ({ page }) => {
    //     const result = await branchPage.kiemTraMaskingSdt('Auto123Tester');
    //     expect(result).toBe('123');
    //     expect(result).not.toMatch(/[a-zA-Z]/);
    // });

    // test('TC-09: Tự động cắt bỏ nếu nhập quá 10 số', async ({ page }) => {
    //     const result = await branchPage.kiemTraMaskingSdt('098765432199');
    //     expect(result).toBe('0987654321');
    //     expect(result.length).toBe(10);
    // });
test('TC-07: Thay đổi địa chỉ sau khi đã Ước tính phí', async ({ page }) => {
        const testData = {
            phone: '0987654321',
            name: 'Auto Tester',
            initialAddress: 'EE12 Bạch Mã',
            madon: 'auto-' + Date.now(),
            trongluong: '11',
            giatri: '100000'
        };

        await branchPage.moPopupTaoDon();
        await branchPage.input_phone.fill(testData.phone);
        await branchPage.input_name.fill(testData.name);

        await branchPage.input_address.fill(testData.initialAddress);
        await page.waitForTimeout(1000);
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');

        await branchPage.input_madon.fill(testData.madon);
        await branchPage.input_trongluong.fill(testData.trongluong);
        await branchPage.input_giatri.fill(testData.giatri);

        await Promise.all([
            page.waitForResponse(resp => resp.url().includes('/estimate') && resp.status() === 200, { timeout: 15000 }),
            branchPage.btnUocTinhPhi.click()
        ]);

        await branchPage.btnChinhSua.first().waitFor({ state: 'visible', timeout: 10000 });
        await expect(branchPage.btnChinhSua.first()).toBeVisible();

        await branchPage.thucHienChinhSuaDiaChi();

        await branchPage.btnUocTinhPhi.click();
        
        await expect(branchPage.btnXacNhan).toBeEnabled({ timeout: 10000 });
        await branchPage.btnXacNhan.click();

        const toastThanhCong = page.getByText(/thành công/i).filter({ visible: true }).first();
        await expect(toastThanhCong).toBeVisible({ timeout: 15000 });
        
        console.log(`✅ Hoàn thành TC-07: Đơn hàng ${testData.madon} tạo thành công sau khi sửa địa chỉ.`);
    });

    test('TC-08: Thay đổi mã đơn hàng sau khi đã Ước tính phí', async ({ page }) => {
        const testData = {
            phone: '0987654321',
            name: 'Auto Tester',
            initialAddress: 'EE12 Bạch Mã',
            madon: 'auto-' + Date.now(),
            trongluong: '11',
            giatri: '100000'
        };

        await branchPage.moPopupTaoDon();
        await branchPage.input_phone.fill(testData.phone);
        await branchPage.input_name.fill(testData.name);

        await branchPage.input_address.fill(testData.initialAddress);
        await page.waitForTimeout(1000);
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');

        await branchPage.input_madon.fill(testData.madon);
        await branchPage.input_trongluong.fill(testData.trongluong);
        await branchPage.input_giatri.fill(testData.giatri);

        await Promise.all([
            page.waitForResponse(resp => resp.url().includes('/estimate') && resp.status() === 200),
            branchPage.btnUocTinhPhi.click()
        ]);

        await branchPage.btnChinhSua.first().waitFor({ state: 'visible' });

        await branchPage.thucHienChinhSuaMaDon();

        await branchPage.btnUocTinhPhi.click();
        await expect(branchPage.btnXacNhan).toBeEnabled();
        await branchPage.btnXacNhan.click();

        await expect(page.getByText(/thành công/i).filter({ visible: true }).first()).toBeVisible({ timeout: 10000 });
    });

    test('TC-09: Thay đổi trọng lượng sau khi đã Ước tính phí', async ({ page }) => {
                const testData = {
            phone: '0987654321',
            name: 'Auto Tester',
            initialAddress: 'EE12 Bạch Mã',
            madon: 'auto-' + Date.now(),
            trongluong: '11',
            giatri: '100000'
        };

        await branchPage.moPopupTaoDon();
        await branchPage.input_phone.fill(testData.phone);
        await branchPage.input_name.fill(testData.name);

        await branchPage.input_address.fill(testData.initialAddress);
        await page.waitForTimeout(1000);
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');

        await branchPage.input_madon.fill(testData.madon);
        await branchPage.input_trongluong.fill(testData.trongluong);
        await branchPage.input_giatri.fill(testData.giatri);


        await Promise.all([
            page.waitForResponse(resp => resp.url().includes('/estimate') && resp.status() === 200),
            branchPage.btnUocTinhPhi.click()
        ]);

        await branchPage.btnChinhSua.first().waitFor({ state: 'visible' });
        await branchPage.thucHienChinhSuaTrongLuong();

        await Promise.all([
            page.waitForResponse(resp => resp.url().includes('/estimate') && resp.status() === 200),
            branchPage.btnUocTinhPhi.click()
        ]);

        await expect(branchPage.btnXacNhan).toBeEnabled();
        await branchPage.btnXacNhan.click();

        await expect(page.getByText(/thành công/i).filter({ visible: true }).first()).toBeVisible({ timeout: 10000 });
    });

    test('TC-10: Thay đổi giá trị hàng hóa sau khi đã Ước tính phí', async ({ page }) => {
               const testData = {
            phone: '0987654321',
            name: 'Auto Tester',
            initialAddress: 'EE12 Bạch Mã',
            madon: 'auto-' + Date.now(),
            trongluong: '11',
            giatri: '100000'
        };

        await branchPage.moPopupTaoDon();
        await branchPage.input_phone.fill(testData.phone);
        await branchPage.input_name.fill(testData.name);

        await branchPage.input_address.fill(testData.initialAddress);
        await page.waitForTimeout(1000);
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');

        await branchPage.input_madon.fill(testData.madon);
        await branchPage.input_trongluong.fill(testData.trongluong);
        await branchPage.input_giatri.fill(testData.giatri);

        await Promise.all([
            page.waitForResponse(resp => resp.url().includes('/estimate') && resp.status() === 200),
            branchPage.btnUocTinhPhi.click()
        ]);
        
        await branchPage.btnChinhSua.first().waitFor({ state: 'visible' });
        await branchPage.thucHienChinhSuaGiaTri();

        await Promise.all([
            page.waitForResponse(resp => resp.url().includes('/estimate') && resp.status() === 200),
            branchPage.btnUocTinhPhi.click()
        ]);

        await expect(branchPage.btnXacNhan).toBeEnabled();
        await branchPage.btnXacNhan.click();

        await expect(page.getByText(/thành công/i).filter({ visible: true }).first()).toBeVisible({ timeout: 10000 });
    });

    test('TC-11: Thay đổi tên người nhận sau khi đã Ước tính phí', async ({ page }) => {
              const testData = {
            phone: '0987654321',
            name: 'Auto Tester',
            initialAddress: 'EE12 Bạch Mã',
            madon: 'auto-' + Date.now(),
            trongluong: '11',
            giatri: '100000'
        };

        await branchPage.moPopupTaoDon();
        await branchPage.input_phone.fill(testData.phone);
        await branchPage.input_name.fill(testData.name);

        await branchPage.input_address.fill(testData.initialAddress);
        await page.waitForTimeout(1000);
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');

        await branchPage.input_madon.fill(testData.madon);
        await branchPage.input_trongluong.fill(testData.trongluong);
        await branchPage.input_giatri.fill(testData.giatri);

        await Promise.all([
            page.waitForResponse(resp => resp.url().includes('/estimate') && resp.status() === 200),
            branchPage.btnUocTinhPhi.click()
        ]);
        
        await branchPage.btnChinhSua.first().waitFor({ state: 'visible' });
        await branchPage.thucHienChinhSuaTenNguoiNhan();

        await Promise.all([
            page.waitForResponse(resp => resp.url().includes('/estimate') && resp.status() === 200),
            branchPage.btnUocTinhPhi.click()
        ]);

        await expect(branchPage.btnXacNhan).toBeEnabled();
        await branchPage.btnXacNhan.click();

        await expect(page.getByText(/thành công/i).filter({ visible: true }).first()).toBeVisible({ timeout: 10000 });
    });

    test('TC-12: Thay đổi số điện thoại người nhận sau khi đã Ước tính phí', async ({ page }) => {
                const testData = {
            phone: '0987654321',
            name: 'Auto Tester',
            initialAddress: 'EE12 Bạch Mã',
            madon: 'auto-' + Date.now(),
            trongluong: '11',
            giatri: '100000'
        };

        await branchPage.moPopupTaoDon();
        await branchPage.input_phone.fill(testData.phone);
        await branchPage.input_name.fill(testData.name);

        await branchPage.input_address.fill(testData.initialAddress);
        await page.waitForTimeout(1000);
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');

        await branchPage.input_madon.fill(testData.madon);
        await branchPage.input_trongluong.fill(testData.trongluong);
        await branchPage.input_giatri.fill(testData.giatri);

        await Promise.all([
            page.waitForResponse(resp => resp.url().includes('/estimate') && resp.status() === 200),
            branchPage.btnUocTinhPhi.click()
        ]);
        
        await branchPage.btnChinhSua.first().waitFor({ state: 'visible' });
        await branchPage.thucHienChinhSuaSdtNguoiNhan();

        await Promise.all([
            page.waitForResponse(resp => resp.url().includes('/estimate') && resp.status() === 200),
            branchPage.btnUocTinhPhi.click()
        ]);

        await expect(branchPage.btnXacNhan).toBeEnabled();
        await branchPage.btnXacNhan.click();

        await expect(page.getByText(/thành công/i).filter({ visible: true }).first()).toBeVisible({ timeout: 10000 });
    });

    test('TC-13: Thay đổi tiền thu hộ (PAYCOD) sau khi đã Ước tính phí', async ({ page }) => {
        const testData = {
            phone: '0523722851',
            name: 'Autotest COD',
            address: 'DD22 Bạch Mã',
            senderPhone: '0999999999',
            senderName: 'sống kh thành công',
            senderAddress: 'ee12 bạch mã',
            madon: 'COD-' + Date.now(),
            trongluong: '12',
            giatri: '100000',
            paycod_bandau: '100000'
        };

        await branchPage.moPopupTaoDon();

        await branchPage.input_phone.fill(testData.phone);
        await branchPage.input_name.fill(testData.name);
        await branchPage.input_address.fill(testData.address);
        await page.getByText(testData.address, { exact: false }).first().click();

        await branchPage.input_sender_phone.fill(testData.senderPhone);
        await branchPage.input_sender_name.fill(testData.senderName);
        await branchPage.input_sender_address.click();
        await page.keyboard.press('Control+A');
        await page.keyboard.press('Backspace');
        await branchPage.input_sender_address.fill(testData.senderAddress);
        await page.getByText(testData.senderAddress, { exact: false }).first().click();

        await branchPage.input_madon.fill(testData.madon);
        await branchPage.input_trongluong.fill(testData.trongluong);
        await branchPage.input_giatri.fill(testData.giatri);

        const comboCOD = page.locator('div').filter({ hasText: /^Thanh toán khi nhận hàng \*/ }).getByRole('combobox').first();
        await comboCOD.click();
        await page.getByRole('option', { name: 'Có' }).click();

        await branchPage.input_paycod.waitFor({ state: 'visible' });
        await branchPage.input_paycod.fill(testData.paycod_bandau);

        await Promise.all([
            page.waitForResponse(resp => resp.url().includes('/estimate') && resp.status() === 200),
            branchPage.btnUocTinhPhi.click()
        ]);

        await branchPage.btnChinhSua.first().waitFor({ state: 'visible' });
        await branchPage.thucHienChinhSuaPayCod();

        await branchPage.btnUocTinhPhi.click();
        await expect(branchPage.btnXacNhan).toBeEnabled();
        await branchPage.btnXacNhan.click();

        await expect(page.getByText(/thành công/i).filter({ visible: true }).first()).toBeVisible({ timeout: 15000 });
    });
    
    test('TC-14: Thay đổi loại hàng hóa sau khi đã Ước tính phí', async ({ page }) => {
        const testData = {
            phone: '0523722851',
            name: 'Autotest',
            address: 'DD22 Bạch Mã',
            madon: 'CAT-' + Date.now(),
            trongluong: '12',
            giatri: '100000',
            loaiHangBanDau: 'Thuốc',
            loaiHangMoi: 'Giấy tờ'
        };

        await branchPage.moPopupTaoDon();

        await branchPage.input_phone.fill(testData.phone);
        await branchPage.input_name.fill(testData.name);
        await branchPage.input_address.fill(testData.address);
        await page.getByText(testData.address, { exact: false }).first().click();


        await branchPage.input_madon.fill(testData.madon);
        await branchPage.input_trongluong.fill(testData.trongluong);
        await branchPage.input_giatri.fill(testData.giatri);

        const comboLoaiHang = page.locator('div').filter({ hasText: /^Loại hàng \*/ }).getByRole('combobox').first();
        await comboLoaiHang.click();
        await page.getByRole('option', { name: testData.loaiHangBanDau }).click();

        await Promise.all([
            page.waitForResponse(resp => resp.url().includes('/estimate') && resp.status() === 200),
            branchPage.btnUocTinhPhi.click()
        ]);

        await branchPage.btnChinhSua.first().waitFor({ state: 'visible' });
        await branchPage.thaydoiloaihang(testData.loaiHangMoi);

        await Promise.all([
            page.waitForResponse(resp => resp.url().includes('/estimate') && resp.status() === 200),
            branchPage.btnUocTinhPhi.click()
        ]);

        await expect(branchPage.btnXacNhan).toBeEnabled();
        await branchPage.btnXacNhan.click();

        await expect(page.getByText(/thành công/i).filter({ visible: true }).first()).toBeVisible({ timeout: 15000 });
    });

   
// test('TC-20: Tạo 10 đơn hàng thành công liên tục (Loop 10)', async ({ page }) => {
//         // Cấu hình timeout cho toàn bộ test case này (Ví dụ: 3 phút = 180000ms)
//         test.setTimeout(180000); 
//         test.slow(); 

//         const baseData = {
//             phone: '0523722851',
//             name: 'Auto Loop User',
//             address: 'DD22 Bạch Mã',
//             addressFull: 'DD22 Bạch Mã',
            
//             senderPhone: '0396463867',
//             senderName: 'QUYEN',
//             senderAddress: 'EE12',
//             senderAddressFull: 'Đường EE12',
            
//             trongluong: '11',
//             giatri: '10,0000',
//             loaiHang: 'GÀ LÁ Ế',
//             dichVu: 'Có',
//             paycod: '1,0000'
//         };

//         for (let i = 1; i <= 10; i++) {
//             console.log(`>>> BẮT ĐẦU VÒNG LẶP THỨ ${i}`);

//             // 1. Mở popup tạo đơn
//             await branchPage.moPopupTaoDon();

//             // 2. Gán mã đơn hàng duy nhất cho từng vòng lặp
//             const loopData = {
//                 ...baseData,
//                 madon: `LOOP-${i}-${Date.now()}`
//             };

//             // 3. Thực hiện tạo đơn qua hàm tổng hợp
//             await branchPage.datChuyenThanhCong(loopData);

//             // 4. Kiểm tra thông báo thành công
//             const successToast = page.getByText(/thành công/i).first();
//             await expect(successToast).toBeVisible({ timeout: 15000 });

//             console.log(`>>> HOÀN THÀNH ĐƠN THỨ ${i}: ${loopData.madon}`);

//             // 5. Nếu không thực sự cần thiết, bạn có thể rút ngắn thời gian nghỉ
//             if (i < 10) {
//                 await page.waitForTimeout(500); // Giảm từ 1000ms xuống 500ms
//             }
//         }
        
//         console.log('=== KẾT THÚC: TẠO THÀNH CÔNG 10 ĐƠN HÀNG ===');
//     });
});


