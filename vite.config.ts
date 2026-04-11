import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// 2026-04-11: VitePWA 완전 제거
// Service Worker 캐시가 배포 후 옛 청크를 제공하여 빈 화면 유발.
// PWA 기능은 현재 불필요 (교실 브라우저 사용).

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-i18n': ['i18next', 'react-i18next'],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
