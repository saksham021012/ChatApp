import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  publicDir: 'public', // Make sure this includes netlify.toml if you put it there
  server: {
    proxy: {
      '/webhook-test': {
        target: 'https://n8n-chatbot-xpb4.onrender.com/',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/webhook-test/, '/webhook'),
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});