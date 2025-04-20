import { defineConfig } from "vite";
import path from "path";

// تكوين محلي إضافي لـ Vite
export default defineConfig({
  optimizeDeps: {
    exclude: [
      '@replit/vite-plugin-cartographer',
      '@replit/vite-plugin-runtime-error-modal',
      '@replit/vite-plugin-shadcn-theme-json',
      'firebase',
      '@firebase/app',
      '@firebase/auth'
    ],
  },
});