import { expect } from '@playwright/test';

export class BranchPage {
    constructor(page) {
        this.page = page;

        // --- Danh sách Locators dựa theo Codegen ---
        this.menuChuyenLe = page.locator('a').filter({ hasText: 'Danh sách chuyến lẻ' });
        this.btnTaoDonHangLe = page.getByRole('button', { name: 'Tạo Đơn Hàng Lẻ' });

        // Thông tin người nhận
        this.input_phone = page.getByRole('textbox', { name: 'Số điện thoại người nhận *' });
        this.input_name = page.getByRole('textbox', { name: 'Tên người nhận *' });
        this.input_address = page.getByRole('textbox', { name: 'Địa chỉ giao hàng *' });

        // Chi nhánh & Người gửi
        this.input_sender_phone = page.getByRole('textbox', { name: 'Số điện thoại người gửi *' });
        this.input_sender_name = page.getByRole('textbox', { name: 'Tên người gửi *' });
        this.input_sender_address = page.getByRole('textbox', { name: 'Địa chỉ lấy hàng *' });

        // Thông tin hàng hóa
        this.input_madon = page.getByRole('textbox', { name: 'Mã đơn hàng *' });
        this.input_trongluong = page.getByRole('spinbutton', { name: 'Trọng lượng (kg) *' });
        this.input_giatri = page.getByRole('textbox', { name: 'Giá trị hàng hóa *' });
        this.input_paycod = page.getByRole('textbox', { name: 'Thanh toán khi nhận hàng *' });

        // Dropdowns
        this.comboDichVu = page.getByRole('combobox').filter({ hasText: 'Không có' });
        this.comboLoaiHang = page.getByRole('combobox').filter({ hasText: 'GÀ LÁ Ế' });
        this.comboNguoiTraPhi = page.getByRole('combobox').filter({ hasText: 'Bên shop thanh toán' });
        this.comboBatCOD = page.getByRole('combobox').nth(4); // Vị trí thứ 5 trong danh sách combo

        // Buttons hành động
        this.btnUocTinhPhi = page.getByRole('button', { name: 'Ước tính phí' });
        this.btnXacNhan = page.getByRole('button', { name: 'Xác nhận tạo đơn' });
        this.btnChinhSua = page.locator('button:has-text("Chỉnh sửa")');

    }

    async moPopupTaoDon() {
        await this.menuChuyenLe.click();
        await this.btnTaoDonHangLe.click();
    }
    async datChuyenThanhCong(data) {
        // 1. Điền thông tin người nhận
        await this.input_phone.click();
        await this.input_phone.fill(data.phone);

        await this.input_name.click();
        await this.input_name.fill(data.name);

        // 2. Địa chỉ giao hàng
        await this.input_address.click();
        await this.input_address.fill(data.address);
        await this.page.getByText(data.addressFull, { exact: false }).first().click();

        // 3. Thông tin người gửi
        await this.input_sender_phone.click();
        await this.input_sender_phone.fill(data.senderPhone);

        await this.input_sender_name.click();
        await this.input_sender_name.fill(data.senderName);

        await this.input_sender_address.click();
        await this.input_sender_address.fill(data.senderAddress);
        await this.page.getByText(data.senderAddressFull, { exact: false }).first().click();

        // 4. Mã đơn hàng & Trọng lượng
        await this.input_madon.click();
        await this.input_madon.fill(data.madon);

        await this.input_trongluong.click();
        await this.input_trongluong.fill(data.trongluong);

        // 5. Chọn loại hàng (theo codegen của bạn, nó là combobox chứa giá trị)
        await this.page.getByRole('combobox').filter({ hasText: 'Thuốc' }).click();
        await this.page.getByRole('option', { name: data.loaiHang }).click();
        await this.page.waitForTimeout(500);

        // 6. Chọn tùy chọn/dịch vụ
        await this.page.getByRole('combobox').nth(4).click();
        await this.page.getByRole('option', { name: data.dichVu }).click();

        // 7. Điền tiền COD và giá trị hàng hóa
        await this.input_paycod.click();
        await this.input_paycod.fill(data.paycod);

        await this.input_giatri.click();
        await this.input_giatri.fill(data.giatri);

        // 8. Ước tính phí và Xác nhận
        await this.btnUocTinhPhi.click();
        await this.btnXacNhan.click();
    }
    async huyChuyenDauDanhSach() {
        await this.menuChuyenLe.click();
        const firstRow = this.page.locator('table tbody tr').first();
        await firstRow.waitFor({ state: 'visible' });

        const iconX = firstRow.locator('.tabler-icon-xbox-x').first();
        await this.hoverAndClick(firstRow, iconX);

        const btnHuy = this.page.getByRole('button', { name: 'Hủy chuyến hàng' });
        await btnHuy.click();
    }
    async hoverAndClick(rowLocator, targetLocator) {
        // 1. Cuộn tới dòng đó để đảm bảo nó nằm trong khung nhìn
        await rowLocator.scrollIntoViewIfNeeded();

        // 2. Thực hiện hover bằng chuột
        await rowLocator.hover();

        // 3. Kích hoạt thêm sự kiện mouseenter bằng JS để chắc chắn menu hiện ra
        await rowLocator.evaluate(node => {
            node.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
            node.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
        });

        // 4. Đợi một chút để CSS transition (nếu có) chạy xong
        await this.page.waitForTimeout(500);

        // 5. Nếu target vẫn ẩn, dùng force click hoặc đợi thêm
        await targetLocator.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {
            console.log("Icon vẫn ẩn, cố gắng click cưỡng ép...");
        });

        // Click với force: true để bỏ qua kiểm tra visibility nếu cần
        await targetLocator.click({ force: true });
    }
    async huyChuyenDauDanhSach() {
        await this.menuChuyenLe.click();
        await this.page.waitForLoadState('networkidle');

        const firstRow = this.page.locator('table tbody tr').first();
        await firstRow.waitFor({ state: 'visible' });

        const iconX = firstRow.locator('.tabler-icon-xbox-x, .tabler-icon-x').first();
        await this.hoverAndClick(firstRow, iconX);

        const btnHuy = this.page.getByRole('button', { name: 'Hủy chuyến hàng' });
        await btnHuy.click();
    }

    async timVaHuyChuyenDangTim() {
        await this.menuChuyenLe.click();
        await this.page.waitForLoadState('networkidle');

        const rowDangTim = this.page.locator('tr').filter({ hasText: /Đang tìm/i }).first();
        const isExist = await rowDangTim.count();
        if (isExist > 0) {
            const iconX = rowDangTim.locator('.tabler-icon-xbox-x, .tabler-icon-x').first();
            await this.hoverAndClick(rowDangTim, iconX);
            await this.page.getByRole('button', { name: 'Hủy chuyến hàng' }).click();
            return true;
        }
        return false;
    }

    async datLaiChuyenDaHuy() {
        await this.menuChuyenLe.click();
        await this.page.waitForLoadState('networkidle');

        const rowHuy = this.page.locator('tr').filter({ hasText: 'Đã hủy' }).first();
        const iconCopy = rowHuy.locator('.lucide-copy, .tabler-icon-copy, [data-icon="copy"]').first();

        await this.hoverAndClick(rowHuy, iconCopy);
        await this.input_madon.fill('RE-' + Date.now());

        await this.page.waitForTimeout(500);
        await this.btnUocTinhPhi.scrollIntoViewIfNeeded();
        await this.btnUocTinhPhi.click();
        await this.btnXacNhan.waitFor({ state: 'visible' });
        await this.btnXacNhan.click();
    }

    async taoMaQRChoChuyenHuy() {
        await this.menuChuyenLe.click();
        await this.page.waitForLoadState('networkidle');

        const rowDaHuy = this.page.locator('tr').filter({ hasText: /Đã hủy|Cancelled/i }).first();
        await rowDaHuy.waitFor({ state: 'visible' });

        const iconTruck = rowDaHuy.locator('svg.lucide-truck, .lucide-truck').first();
        await this.hoverAndClick(rowDaHuy, iconTruck);

        await this.page.getByRole('button', { name: 'Tạo mã QR' }).click();
        await this.page.getByRole('button', { name: 'Close' }).or(this.page.locator('.ant-modal-close')).click();
    }

    async taoLaiChuyenTuDaHuy(data) {
        await this.menuChuyenLe.click();
        await this.page.waitForLoadState('networkidle');

        const rowDaHuy = this.page.locator('table tbody tr').filter({
            hasText: /Đã hủy|Cancelled/i
        }).first();

        await rowDaHuy.hover();
        const iconCopy = rowDaHuy.locator('.lucide-copy').first();
        await iconCopy.click({ force: true });

        await this.input_address.click();
        await this.input_address.press('ControlOrMeta+a');
        await this.input_address.press('Backspace');
        await this.input_address.fill(data.address);
        await this.page.getByText(data.address, { exact: false }).first().click();

        await this.input_sender_address.click();
        await this.input_sender_address.press('ControlOrMeta+a');
        await this.input_sender_address.press('Backspace');
        await this.input_sender_address.fill(data.senderAddress);
        await this.page.getByText(data.senderAddress, { exact: false }).first().click();

        await this.page.waitForTimeout(500);
        await this.btnUocTinhPhi.scrollIntoViewIfNeeded();
        await this.btnUocTinhPhi.click();
        await this.btnXacNhan.waitFor({ state: 'visible' });
        await this.btnXacNhan.click();
    }

    // --- CÁC HÀM KIỂM TRA MASKING/VALIDATION ---

    async kiemTraLoiBoTrongTruongBatBuoc() {
        await this.menuChuyenLe.click();
        await this.btnTaoDonHangLe.click();
        await this.btnUocTinhPhi.click();
        return await this.input_trongluong.evaluate((node) => !node.validity.valid);
    }

    async kiemTraMaskingSdt(chuoiNhapVao) {
        await this.moPopupTaoDon();
        await this.input_phone.clear();
        await this.input_phone.pressSequentially(chuoiNhapVao, { delay: 50 });
        return await this.input_phone.inputValue();
    }

    // --- CÁC HÀM HỖ TRỢ CHỈNH SỬA SAU KHI ƯỚC TÍNH ---
    async thucHienChinhSuaDiaChi() {
        await this.btnChinhSua.first().click();

        await this.input_address.click();
        await this.page.keyboard.press('Control+A');
        await this.page.keyboard.press('Backspace');

        await this.input_address.fill('DD22 Bạch mã');
        await this.page.waitForTimeout(1000);
        await this.page.getByText('DD22, DD22 Bạch Mã, Phường Hòa Hưng').first().click();
    }
    async thucHienChinhSuaMaDon() {
        await this.btnChinhSua.first().click();
        await this.input_madon.fill('EDIT-' + Date.now());
    }

    async thucHienChinhSuaTrongLuong() {
        await this.btnChinhSua.first().click();
        await this.input_trongluong.fill('20');
    }

    async thucHienChinhSuaGiaTri() {
        await this.btnChinhSua.first().click();
        await this.input_giatri.fill('300000');
    }

    async thucHienChinhSuaTenNguoiNhan() {
        await this.btnChinhSua.first().click();
        await this.input_name.fill('Tên sửa mới');
    }

    async thucHienChinhSuaSdtNguoiNhan() {
        await this.btnChinhSua.first().click();
        await this.input_phone.fill('0912345679');
    }

    async thucHienChinhSuaPayCod() {
        await this.btnChinhSua.first().click();
        await this.input_paycod.fill('200000');
    }

    async thaydoiloaihang(loaiHangMoi) {
        await this.btnChinhSua.first().click();
        const comboLoaiHang = this.page.locator('div').filter({ hasText: /^Loại hàng \*/ }).getByRole('combobox').first();
        await comboLoaiHang.click();
        await this.page.getByRole('option', { name: loaiHangMoi }).click();
    }

}

