import { test, expect } from '@playwright/test';
import { DeliverPagead } from '../../pages/Deliverad.js';

test.describe.configure({ mode: 'serial' });

test.describe('Kiểm thử vận hành BShip - Luồng Đơn Nhiều Điểm', () => {
    let page;
    let deliverPage;

    test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();
       // Xóa cookies để tránh bị redirect
        await page.context().clearCookies();
        
        deliverPage = new DeliverPagead(page);
        await page.goto('https://stg-daily.bship.vn/admin/');
    });

    test.afterAll(async () => {
        await page.close();
    });

    test('tc01: Tạo đơn nhiều điểm giao thành công', async () => {
        await deliverPage.goto();

        const sender = {
            address: 'dd22 bạch mã',
            addressFull: 'DD22 Bạch Mã',
            addressSearch: 'DD22, DD22 Bạch Mã, Phường Hò',
            name: 'Quyên người gửi',
            phone: '0523722851'
        };

        const receivers = [
            {
                name: 'người nhận 1',
                phone: '0987654355',
                madon: 'don11',
                trongluong: '10.99',
                giatri: '11,1111',
                address: '228 quốc lộ 13',
                addressFull: '228 Quốc Lộ 13',
                addressSearch: '228 Quốc Lộ 13, Phường Hiệp Bình, '
            },
            {
                name: 'người nhận 2',
                phone: '0523722851',
                madon: 'don2',
                trongluong: '11.99',
                giatri: '22,2222',
                address: 'ee12 bạch mã',
                addressFull: 'Đường EE12',
                addressSearch: 'Đường EE12, Phường Hòa Hưng,'
            }
        ];

        await deliverPage.dienThongTinNguoiGui(sender);
        await deliverPage.dienThongTinCacDon(receivers);

        await expect(page.getByText(/Thành công/i).first()).toBeVisible({ timeout: 25000 });
        console.log("✅ TC01: Tạo đơn nhiều điểm thành công");
    });

    test('tc02: Hủy chuyến vừa đặt lại với trạng thái đang tìm', async () => {
        // Ở màn hình danh sách, thực hiện hủy chuyến vừa đặt
        await deliverPage.diToiDanhSachLoHang();
        await deliverPage.huyChuyenDangTim();

        await expect(page.getByText(/Thành công|Đã hủy/i).first()).toBeVisible({ timeout: 10000 });
        console.log("✅ TC02: Hủy chuyến đang tìm thành công");
    });
 

    test('tc03: Đặt lại chuyến đã hủy', async () => {
        await deliverPage.diToiDanhSachLoHang();
        await deliverPage.datLaiChuyenDaHuy();

        // Kiểm tra chuyển sang trạng thái đang tìm / thành công
        await expect(page.getByText(/Thành công|Đang tìm/i).first()).toBeVisible({ timeout: 10000 });
        console.log("✅ TC03: Đặt lại chuyến thành công");
    });


});