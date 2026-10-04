import { expect } from "@playwright/test";

export class MerchantListPage {
    constructor(page) {
        this.page = page;

        this.menuDanhSachChiNhanh = page.locator('a').filter({ hasText: 'Danh sách chi nhánh' });

        this.btnThemChiNhanh = page.getByRole('button', { name: 'Thêm chi nhánh' });

        this.input_tenChiNhanh = page.getByRole('textbox', { name: 'Tên chi nhánh *' });
        this.input_sdt = page.getByRole('spinbutton', { name: 'Số điện thoại *' });
        this.input_email = page.getByRole('textbox', { name: 'Email *' });
        this.input_matKhau = page.getByRole('textbox', { name: 'Mật khẩu *' });

        this.btnChonMerchant = page.getByRole('button', { name: 'Chọn Merchant' });
        this.input_diaChi = page.getByRole('textbox', { name: 'Địa chỉ *' });
        this.btnTaoMoi = page.getByRole('button', { name: 'Tạo mới' });
    }

    async goto() {
        await this.menuDanhSachChiNhanh.scrollIntoViewIfNeeded();
        await this.menuDanhSachChiNhanh.waitFor({ state: 'visible', timeout: 15000 });
        await this.menuDanhSachChiNhanh.click();
        
        await this.page.waitForLoadState('networkidle');
    }

    async taoChiNhanh(data) {
        await this.btnThemChiNhanh.scrollIntoViewIfNeeded();
        await this.btnThemChiNhanh.waitFor({ state: 'visible', timeout: 15000 });
        await this.btnThemChiNhanh.click();

        await this.input_tenChiNhanh.fill(data.tenChiNhanh);
        await this.input_sdt.fill(data.sdt);
        await this.input_matKhau.fill(data.matKhau);
        await this.input_email.fill(data.email);

        await this.btnChonMerchant.click();
        await this.page.getByText(data.merchantName).first().click();

  
        await this.page.getByRole('combobox').filter({ hasText: 'Chọn ngành hàng' }).click();
        await this.page.getByLabel(data.nganhHang).getByText(data.nganhHang).click();


        await this.input_diaChi.click();
        await this.input_diaChi.fill(data.diaChi);
        await this.page.waitForTimeout(1000); // Chờ danh sách gợi ý địa chỉ hiển thị

        try {
            const suggestion = this.page.getByRole('listitem').first()
                .or(this.page.getByText(data.diaChiFull, { exact: false }).first());
            await suggestion.waitFor({ state: 'visible', timeout: 5000 });
            await suggestion.click({ force: true });
        } catch (error) {
            await this.page.keyboard.press('ArrowDown');
            await this.page.keyboard.press('Enter');
        }


        await this.page.getByRole('combobox').filter({ hasText: 'Chọn tỉnh/thành phố' }).click();
        await this.page.getByRole('option', { name: data.tinhThanh }).click();

        await this.btnTaoMoi.click();
    }
}