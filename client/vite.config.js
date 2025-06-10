import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

// https://vitejs.dev/config/
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export default defineConfig({
  plugins: [react()],

  // ===========================================
  // DEVELOPMENT SERVER
  // ===========================================
  server: {
    port: 3000, // Port cho dev server
    host: true, // Cho phép truy cập từ network
    open: true, // Tự động mở browser
    cors: true, // Enable CORS

    // Proxy API calls to backend
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // ===========================================
  // BUILD CONFIGURATION
  // ===========================================
  build: {
    outDir: "dist", // Thư mục build output
    sourcemap: false, // Không tạo sourcemap cho production
    minify: "terser", // Minify code với Terser

    // Rollup options
    rollupOptions: {
      output: {
        // Chia nhỏ chunks để optimize loading
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
          utils: ["axios", "date-fns", "classnames"],
        },
      },
    },

    // Performance warnings
    chunkSizeWarningLimit: 1000,
  },

  // ===========================================
  // PATH ALIASES
  // ===========================================
  // Này giúp dễ dàng import các module
  // và tránh việc phải sử dụng đường dẫn tương đối phức tạp như kiểu viết tắt đường dẫn :V
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@services": path.resolve(__dirname, "./src/services"),
      "@store": path.resolve(__dirname, "./src/store"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@styles": path.resolve(__dirname, "./src/styles"),
      "@assets": path.resolve(__dirname, "./src/assets"),
    },
  },

  // ===========================================
  // CSS CONFIGURATION
  // ===========================================
  css: {
    devSourcemap: true, // Sourcemap cho CSS trong dev
    modules: {
      // CSS Modules configuration
      localsConvention: "camelCaseOnly",
    },
  },
});
