import { expect } from "@playwright/test";

export class PickupPagead {
    constructor(page) {
        this.page = page;

        // Menu & Buttons chính
        this.menuPickupMany = page.locator('a').filter({ hasText: 'Tạo đơn nhiều điểm lấy' });
        this.menuDanhSachLoHang = page.locator('a').filter({ hasText: 'Danh sách lô hàng' });
        this.tabNhieuDiemLay = page.locator('span').filter({ hasText: 'Nhiều điểm lấy' });

        this.btnUocTinh = page.getByRole('button', { name: 'Ước tính chi phí' });
        this.btnXacNhan = page.getByRole('button', { name: 'Xác nhận tạo đơn' });

        // Locator dùng chung trong vòng lặp (Receiver & Goods)
        this.input_madon = page.getByRole('textbox', { name: 'Mã đơn hàng *' });
        this.input_trongluong = page.getByRole('spinbutton', { name: 'Trọng lượng (kg) *' });
        this.input_giatri = page.getByRole('textbox', { name: 'Giá trị hàng hóa *' });

        // Thông tin người gửi (Pickup point)
        this.input_sender_address = page.getByRole('textbox', { name: 'Địa chỉ lấy hàng *' });
        this.input_sender_name = page.getByRole('textbox', { name: 'Tên người gửi *' });
        this.input_sender_phone = page.getByRole('spinbutton', { name: 'Số điện thoại người gửi *' });

        // Thông tin người nhận (Chỉ đơn 1 có thông tin này theo Codegen)
        this.input_receiver_name = page.getByRole('textbox', { name: 'Tên người nhận *' });
        this.input_receiver_phone = page.getByRole('spinbutton', { name: 'Số điện thoại người nhận *' });
        this.input_receiver_address = page.getByRole('textbox', { name: 'Địa chỉ giao hàng *' });

        // Phần tử lô hàng & Nút thao tác
        this.firstShipmentCard = page.locator('.v-card, .shipment-item').first();
        this.btnHuyChuyen = page.getByRole('button', { name: 'Hủy chuyến' });
        this.btnXacNhanHuyPopup = page.getByRole('button', { name: 'Hủy chuyến hàng' });
        this.btnDatLaiChuyen = page.getByRole('button', { name: 'Đặt lại chuyến' });
    }

    async goto() {
        await this.menuPickupMany.waitFor({ state: 'visible', timeout: 15000 });

        // 2. Thực hiện click
        await this.menuPickupMany.click();

        // 3. Chờ trang tải hoàn tất
        await this.page.waitForLoadState('networkidle');
    }

    async datDonNhieuDiemLay(receivers) {
        for (let i = 0; i < receivers.length; i++) {
            const data = receivers[i];
            const stt = i + 1; // Sửa lại dòng này

            await this.page.locator('div').filter({ hasText: new RegExp(`^Đơn ${stt}$`) }).click();

            await this.input_sender_address.fill(data.senderAddress);
            await this.page.getByText(data.senderAddressFull).first().click();

            await this.input_sender_name.fill(data.senderName);
            await this.input_sender_phone.fill(data.senderPhone);

            await this.input_madon.fill(data.madon);
            await this.input_trongluong.fill(data.trongluong);
            await this.input_giatri.fill(data.giatri);

            if (data.receiverName) {
                await this.input_receiver_name.fill(data.receiverName);
                await this.input_receiver_phone.fill(data.receiverPhone);
                await this.input_receiver_address.fill(data.receiverAddress);
                await this.page.getByText(data.receiverAddressFull).first().click();
            }
        }

        await this.btnUocTinh.click();
        await this.btnXacNhan.waitFor({ state: 'visible', timeout: 10000 });
        await this.btnXacNhan.click();
    }

    async diToiDanhSachLoHang() {
        await this.menuDanhSachLoHang.click();
        await this.tabNhieuDiemLay.nth(1).click();
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
       
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(2000); 

        const btnDatLai = this.page.getByRole('button', { name: 'Đặt lại chuyến' }).first();
        await btnDatLai.waitFor({ state: 'visible', timeout: 20000 });
        await btnDatLai.click();

        await this.page.waitForTimeout(500);

        await this.page.getByRole('button', { name: 'Đặt lại chuyến' }).click();
        await this.page.waitForTimeout(500);
    }

    async datLaiChuyenDaHuy() {
        await this.page.waitForLoadState('networkidle');

        const btnDatLai = this.page.getByRole('button', { name: 'Đặt lại chuyến' }).first();
        await btnDatLai.waitFor({ state: 'visible', timeout: 20000 });
        await btnDatLai.click();

        await this.page.waitForTimeout(500);
        await this.page.getByRole('button', { name: 'Đặt lại chuyến' }).click();
        await this.page.waitForTimeout(1000);
    }

    async huyChuyenDangTim() {
        await this.page.getByRole('button', { name: 'Hủy chuyến' }).first().click();

        await this.page.getByRole('button', { name: 'Hủy chuyến hàng' }).click();
        await this.page.waitForTimeout(1000);
    }
}


