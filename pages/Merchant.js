import { expect } from "@playwright/test";

export class MerchantListPage {
    constructor(page) {
        this.page = page;

        // Menu và nút điều hướng
        this.menuDanhSachMerchant = page.locator('a').filter({ hasText: 'Danh sách merchant' });
        this.btnThemMoi = page.getByRole('button', { name: 'Thêm mới' });

        // Form điền thông tin Merchant
        this.input_tenMerchant = page.getByRole('textbox', { name: 'Tên merchant *' });
        this.input_email = page.getByRole('textbox', { name: 'Email *' });
        this.input_matKhau = page.getByRole('textbox', { name: 'Mật khẩu *' });
        this.input_sdt = page.getByRole('spinbutton', { name: 'Số điện thoại *' });
        this.input_tenShop = page.getByRole('textbox', { name: 'Tên shop *' });
        this.input_diaChi = page.getByRole('textbox', { name: 'Địa chỉ *' });

        // Nút hành động
        this.btnTaoMoi = page.getByRole('button', { name: 'Tạo mới' });
    }

    async goto() {
        await this.menuDanhSachMerchant.click();
        await this.page.waitForLoadState('networkidle');
    }

    async taoMerchant(data) {
        // Kích hoạt form thêm mới
        await this.btnThemMoi.click();

        // 1. Điền thông tin cơ bản
        await this.input_tenMerchant.fill(data.tenMerchant);
        await this.input_email.fill(data.email);
        await this.input_matKhau.fill(data.matKhau);
        await this.input_sdt.fill(data.sdt);

        // 2. Chọn ngành hàng từ Combobox
        await this.page.getByRole('combobox').filter({ hasText: 'Chọn ngành hàng' }).click();
        await this.page.getByRole('option', { name: data.nganhHang }).click();

        // 3. Điền tên shop
        await this.input_tenShop.fill(data.tenShop);

        // 4. Nhập địa chỉ và click text gợi ý trực tiếp trên giao diện
        await this.input_diaChi.fill(data.diaChi);
        await this.page.getByText(data.diaChiFull, { exact: false }).first().click();

        // 5. Chọn tỉnh / thành phố
        await this.page.getByRole('combobox').filter({ hasText: 'Chọn tỉnh/thành phố' }).click();
        await this.page.getByLabel(data.tinhThanh).getByText(data.tinhThanh).click();

        // 6. Nhấn nút tạo mới
        await this.btnTaoMoi.click();
    }
}