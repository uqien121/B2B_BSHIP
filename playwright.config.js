import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  /* Cấu hình chung cho tất cả các bài test */
  use: {
    // 1. Chạy mở trình duyệt trực quan để theo dõi
    headless: false,
    actionTimeout: 15000,

    // 2. Ghi hình, chụp ảnh và lưu trace khi test
    screenshot: 'on',
    video: 'on',
    trace: 'on',

    // 3. Cấu hình định vị HCM
    permissions: ['geolocation'],
    contextOptions: {
      geolocation: { latitude: 10.762622, longitude: 106.660172 },
    },
  },

  projects: [
    // -------------------------------------------------------------------
    // 1. Project SETUP: Đăng nhập và tạo file auth.json (Môi trường sạch)
    // -------------------------------------------------------------------
    {
      name: 'setup',
      testMatch: /auth\.setup\.js/,
    },

    // -------------------------------------------------------------------
    // 2. Project CHROMIUM: Chạy các bài test chính (Tự động nạp session)
    // -------------------------------------------------------------------
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome', // Sử dụng Google Chrome thật cài trên máy
        storageState: 'auth.json', // 🔑 CHỈ NẠP storageState tại project này
      },
      dependencies: ['setup'], // Ép phải chạy project 'setup' xong trước
    },
  ],
});