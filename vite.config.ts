import path from "path";
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default {
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(path.dirname(new URL(import.meta.url).pathname), "client", "src"),
      "@shared": path.resolve(path.dirname(new URL(import.meta.url).pathname), "shared"),
      "@assets": path.resolve(path.dirname(new URL(import.meta.url).pathname), "attached_assets"),
    },
  },
  root: path.resolve(path.dirname(new URL(import.meta.url).pathname), "client"),
  build: {
    outDir: path.resolve(path.dirname(new URL(import.meta.url).pathname), "dist/public"),
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      }
    }
  }
};
