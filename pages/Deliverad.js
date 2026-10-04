import { expect } from "@playwright/test";

export class DeliverPagead {
    constructor(page) {
        this.page = page;

        // Locators cho phần thông tin người gửi
        this.input_sender_address = page.getByRole('textbox', { name: 'Địa chỉ lấy hàng *' });
      this.input_sender_name = page.getByRole('textbox', { name: 'Tên người gửi *' });
        this.input_sender_phone = page.getByRole('spinbutton', { name: 'Số điện thoại người gửi *' });

        // Locators cho phần thông tin người nhận (Đơn 1)
        this.inputTenNguoiNhan = page.getByRole('textbox', { name: 'Tên người nhận *' });
        this.inputSdtNguoiNhan = page.getByRole('spinbutton', { name: 'Số điện thoại người nhận *' });
        this.inputMaDonHang = page.getByRole('textbox', { name: 'Mã đơn hàng *' });
        this.inputTrongLuong = page.getByRole('spinbutton', { name: 'Trọng lượng (kg) *' });
        this.inputGiaTriHang = page.getByRole('textbox', { name: 'Giá trị hàng hóa *' });
        this.inputDiaChiGiao = page.getByRole('textbox', { name: 'Địa chỉ giao hàng *' });

        // Nút chức năng
        this.btnUocTinh = page.getByRole('button', { name: 'Ước tính chi phí' });
        this.btnXacNhan = page.getByRole('button', { name: 'Xác nhận tạo đơn' });

        // Locators Danh sách lô hàng
        this.menuDanhSachLoHang = page.locator('a').filter({ hasText: 'Danh sách lô hàng' });
        this.tabNhieuDiemGiao = page.locator('span').filter({ hasText: 'Nhiều điểm giao' });
        this.firstShipmentCard = page.locator('.v-card, .shipment-item').first();
        this.btnHuyChuyen = page.getByRole('button', { name: 'Hủy chuyến' });
        this.btnXacNhanHuyPopup = page.getByRole('button', { name: 'Hủy chuyến hàng' });
        this.btnDatLaiChuyen = page.getByRole('button', { name: 'Đặt lại chuyến' });
    }

    async goto() {
        await this.page.locator('a').filter({ hasText: 'Tạo đơn nhiều điểm giao' }).click();
        await this.page.waitForLoadState('networkidle');
    }

    async chonDiaChiGoiY(inputLocator, addressText, addressFull) {
        await inputLocator.click();
        await inputLocator.fill(addressText);
        await this.page.waitForTimeout(1000);

        const targetText = addressFull || addressText;
        const suggestion = this.page.getByText(targetText, { exact: false }).first();

        if (await suggestion.isVisible({ timeout: 3000 }).catch(() => false)) {
            await suggestion.click();
        } else {
            await this.page.keyboard.press('ArrowDown');
            await this.page.keyboard.press('Enter');
        }
    }

    async dienThongTinNguoiGui(sender) {
        await this.chonDiaChiGoiY(this.input_sender_address, sender.address, sender.addressFull || sender.addressSearch);

        await this.input_sender_name.click();
        await this.input_sender_name.fill(sender.name);

        await this.input_sender_phone.click();
        await this.input_sender_phone.fill(sender.phone);
    }

    async dienThongTinCacDon(receivers) {
        for (let i = 0; i < receivers.length; i++) {
            const data = receivers[i];
            const stt = i + 1; // Đơn 1, Đơn 2...

            // Chuyển sang form Đơn 2 trở đi
            if (i > 0) {
                await this.page.locator('div').filter({ hasText: new RegExp(`^Đơn ${stt}$`) }).click();
            }

            // Điền thông tin
            await this.inputTenNguoiNhan.fill(data.name);
            await this.inputSdtNguoiNhan.fill(data.phone);
            await this.inputMaDonHang.fill(data.madon);
            await this.inputTrongLuong.fill(data.trongluong);
            await this.inputGiaTriHang.fill(data.giatri);

            await this.chonDiaChiGoiY(this.inputDiaChiGiao, data.address, data.addressFull || data.addressSearch);
        }

        // Ước tính & xác nhận

        await this.btnUocTinh.click();
        await this.btnXacNhan.click();
    }

    async diToiDanhSachLoHang() {
        await this.menuDanhSachLoHang.click();

        // Cập nhật chuẩn xác sang tab Nhiều điểm giao
        await this.tabNhieuDiemGiao.nth(1).click();

        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(1000);
    }

    async datLaiChuyen() {
        await this.firstShipmentCard.click();
        await this.btnDatLaiChuyen.first().click();
        await this.page.waitForTimeout(500);
        await this.btnDatLaiChuyen.click();
    }

    async xuLyLoiKhongTimThayTaiXe() {
        await this.page.getByText('Không tìm thấy tài xế').first().click();
        await this.btnDatLaiChuyen.first().click();
        await this.page.waitForTimeout(500);
        await this.btnDatLaiChuyen.click();
    }



    async datLaiChuyenDaHuy() {
        // 1. Điều hướng và chờ trang ổn định
        await this.page.waitForLoadState('networkidle');

        // 2. Tìm nút "Đặt lại chuyến" ở chuyến đầu tiên
        const btnDatLai = this.page.getByRole('button', { name: 'Đặt lại chuyến' }).first();
        await btnDatLai.waitFor({ state: 'visible', timeout: 20000 });
        await btnDatLai.click();

        // 3. Xác nhận trên popup
        await this.page.waitForTimeout(500);
        await this.page.getByRole('button', { name: 'Đặt lại chuyến' }).click();
        await this.page.waitForTimeout(1000);
    }

    async huyChuyenDangTim() {
        // 1. Nhấn nút Hủy chuyến
        await this.page.getByRole('button', { name: 'Hủy chuyến' }).first().click();

        // 2. Xác nhận hủy chuyến trên popup
        await this.page.getByRole('button', { name: 'Hủy chuyến hàng' }).click();
        await this.page.waitForTimeout(1000);
    }
}



