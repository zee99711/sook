// vite.config.js
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: { port: 5173, host: true },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1500,
    // أضف هاد الجزء:
    rollupOptions: {},
  },
});