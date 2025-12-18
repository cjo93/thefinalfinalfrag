import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: './',
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api/mandala/card': {
          target: 'http://localhost:8001',
          changeOrigin: true,
        },
        '/api': {
          target: 'http://localhost:3002',
          changeOrigin: true,
        }
      },
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'framer-motion'],
            three: ['three', '@react-three/fiber', '@react-three/drei'],
            ui: ['lucide-react', 'html2canvas']
          }
        }
      },
      chunkSizeWarningLimit: 1600
    }
  };
});
