import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import { cadenceLogApiPlugin } from './vite-plugin-log-api';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

export default defineConfig({
  plugins: [react(), tailwindcss(), cadenceLogApiPlugin(__dirname, repoRoot)],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  server: {
    fs: {
      allow: [repoRoot],
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
