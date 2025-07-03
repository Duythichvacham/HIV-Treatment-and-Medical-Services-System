/**
 * Centralized access to environment variables
 */
// Note tí: cái này nó dạng giống như enum, giúp đơn giản hóa cách gọi và tập trung hóa các biến môi trường trong ứng dụng React
// Đơn giản hóa và thống nhất cách truy cập import.meta.env.* trong toàn app.
//Thay vì gọi đi gọi lại import.meta.env.VITE_XXX khắp nơi -> chỉ gọi ENV.XXX.
// này giống kiểu đặt biệt danh cho dễ gọi ấy(giống thôi nha):))
export const ENV = {
  // API Configuration
  API_URL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,

  // App Settings
  APP_NAME:
    import.meta.env.VITE_APP_NAME ||
    "HIV-Treatment-and-Medical-Services-System",
  APP_VERSION: import.meta.env.VITE_APP_VERSION || "1.0.0",
  ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT || "development",

  // Feature Flags
  ENABLE_LOGGING: import.meta.env.VITE_ENABLE_LOGGING === "true",
  ENABLE_DEBUG: import.meta.env.VITE_ENABLE_DEBUG === "true",
  ENABLE_MOCK_API: import.meta.env.VITE_ENABLE_MOCK_API === "true",

  // Upload Settings - này là phần cấu hình upload file, chưa chắc sẽ xài nha mấy fen
  MAX_FILE_SIZE: parseInt(import.meta.env.VITE_MAX_FILE_SIZE) || 5242880, // 5MB
  ALLOWED_FILE_TYPES: import.meta.env.VITE_ALLOWED_FILE_TYPES?.split(",") || [
    "jpg",
    "png",
    "pdf",
    "jpeg",
    "docx",
    "doc",
  ],
  // Computed values
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
};

// Validation
if (ENV.IS_DEVELOPMENT) {
  console.log("🔧 Environment Configuration:", ENV);
}
