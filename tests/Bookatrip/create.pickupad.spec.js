import { test, expect } from '@playwright/test';
import { PickupPagead } from '../../pages/Pickupad.js';

test.describe.configure({ mode: 'serial' });

test.describe('Kiểm thử vận hành BShip - Luồng Đơn Nhiều Điểm (Pickup)', () => {
    let page;
    let pickupPage;

    test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();
        await page.context().clearCookies();

        pickupPage = new PickupPagead(page);
        await page.goto('https://stg-daily.bship.vn/admin/');
    });

    test.afterAll(async () => {
        await page.close();
    });

    test('tc01: Tạo đơn nhiều điểm lấy thành công', async () => {
        // Bước 1: Truy cập trang Tạo đơn nhiều điểm lấy
        await pickupPage.goto();

        const pickupData = [
            {
                stt: 1,
                senderName: 'Người gửi 1',
                senderAddress: 'DD22 BẠCH MÃ',
                senderAddressFull: 'DD22, DD22 Bạch Mã, Phường Hò',
                senderPhone: '0396463867',
                madon: 'CODE11-' + Date.now(),
                trongluong: '11',
                giatri: '111111',
                
                // Thông tin người nhận
                receiverName: 'Người nhận',
                receiverPhone: '0987654322',
                receiverAddress: 'JJ12 bạch mã',
                receiverAddressFull: 'JJ12 Bạch Mã, Phường Hòa Hưng'
            },
            {
                stt: 2,
                senderName: 'Người gửi 2',
                senderAddress: 'EE12',
                senderAddressFull: 'Đường EE12, Phường Hòa Hưng',
                senderPhone: '0523722851',
                madon: 'CODE2-' + Date.now(),
                trongluong: '11.96',
                giatri: '222222'
            }
        ];

        await pickupPage.datDonNhieuDiemLay(pickupData);

        await expect(page.getByText(/Thành công/i).first()).toBeVisible({ timeout: 25000 });
        console.log("✅ TC01: Tạo đơn nhiều điểm lấy thành công");
    });
  test('tc02: Hủy chuyến vừa đặt lại với trạng thái đang tìm', async () => {
        await pickupPage.diToiDanhSachLoHang();
        await pickupPage.huyChuyenDangTim();

    await expect(pickupPage.page.getByText(/Thành công|Đang tìm/i).first()).toBeVisible({ timeout: 10000 });
    }); 
    test('tc03: Đặt lại chuyến đã hủy', async () => {
        await pickupPage.diToiDanhSachLoHang();
        await pickupPage.datLaiChuyenDaHuy();

      await expect(pickupPage.page.getByText(/Thành công|Đang tìm/i).first()).toBeVisible({ timeout: 10000 });
        console.log("✅ TC03: Đặt lại chuyến thành công");
    });


});



