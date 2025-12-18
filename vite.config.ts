
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Ganti 'NAMA_REPO_ANDA' dengan nama repository GitHub Anda agar link aset benar
export default defineConfig({
  plugins: [react()],
  base: './', // Menggunakan path relatif agar aman di GitHub Pages
  build: {
    outDir: 'dist',
  }
});
