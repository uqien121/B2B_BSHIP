import { expect } from "@playwright/test";

export class RestaurantPage {
    constructor(page) {
        this.page = page;

        // Menu và nút điều hướng
        this.menuDanhSachNhaHang = page.locator('a').filter({ hasText: 'Danh sách nhà hàng' });
        this.btnThemNhaHang = page.getByRole('button', { name: 'Thêm nhà hàng' });

        // Form Thông tin cơ bản
        this.input_tenNhaHang = page.getByRole('textbox', { name: 'Tên nhà hàng *' });
        this.input_sdt = page.getByRole('spinbutton', { name: 'Số điện thoại *' });
        this.input_gioMoCua = page.getByRole('textbox', { name: 'Giờ mở cửa *' });
        this.input_gioDongCua = page.getByRole('textbox', { name: 'Giờ đóng cửa *' });
        this.btnChonDaiLy = page.getByRole('button', { name: 'Chọn đại lý' });
        this.input_diaChi = page.getByRole('textbox', { name: 'Địa chỉ *' });

        // Form Thông tin pháp lý
        this.input_maSoThue = page.getByRole('textbox', { name: 'Mã số thuế *' });
        this.input_maSoDinhDanh = page.getByRole('textbox', { name: 'Mã số định danh *' });

        // Nút hành động
        this.btnTaoMoi = page.getByRole('button', { name: 'Tạo mới' });
    }

    async goto() {
        await this.menuDanhSachNhaHang.click();
        await this.page.waitForLoadState('networkidle');
    }

    async taoNhaHang(data) {
        // Kích hoạt form thêm nhà hàng mới
        await this.btnThemNhaHang.click();

        // 1. Điền thông tin cơ bản
        await this.input_tenNhaHang.fill(data.tenNhaHang);
        await this.input_sdt.fill(data.sdt);
        await this.input_gioMoCua.fill(data.gioMoCua);
        await this.input_gioDongCua.fill(data.gioDongCua);

        // 2. Chọn đại lý
        await this.btnChonDaiLy.click();
        await this.page.getByText(data.tenDaiLy).click();

await this.input_diaChi.fill(''); // Xóa trống trước khi điền
await this.input_diaChi.fill(data.diaChi);

// Chờ cho danh sách gợi ý địa chỉ xuất hiện trên màn hình bằng cách định vị text
// (Lệnh này chỉ để đợi cho UI hiển thị ra, chưa cần click)
await this.page.getByText(data.diaChiFull, { exact: false }).first().waitFor({ state: 'visible' });

// Thay vì click chuột bị chặn, ta dùng bàn phím để di chuyển xuống và chọn dòng đầu tiên
await this.page.keyboard.press('ArrowDown');
await this.page.keyboard.press('Enter');

        // 4. Chọn tỉnh / thành phố
        await this.page.getByRole('combobox').filter({ hasText: 'Chọn tỉnh/thành phố' }).click();
        await this.page.getByLabel(data.tinhThanh).getByText(data.tinhThanh).click();

        // 5. Chọn loại hình doanh nghiệp
        await this.page.getByRole('combobox').filter({ hasText: 'Chọn loại hình' }).click();
        await this.page.getByLabel(data.loaiHinhDoanhNghiep).getByText(data.loaiHinhDoanhNghiep).click();

        // 6. Điền thông tin pháp lý (Mã số thuế & Mã định danh)
        await this.input_maSoThue.fill(data.maSoThue);
        await this.input_maSoDinhDanh.fill(data.maSoDinhDanh);

        // 7. Click Tạo mới để hoàn thành
        await this.btnTaoMoi.click();
    }
}