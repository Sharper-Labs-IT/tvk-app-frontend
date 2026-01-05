import { defineConfig, loadEnv, type ConfigEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default ({ mode }: ConfigEnv) => {
  // Load environment variables based on current mode (development/production)
  const env = loadEnv(mode, process.cwd(), '');

  return defineConfig({
    plugins: [
      react({
        babel: {
          plugins: [['babel-plugin-react-compiler']],
        },
      }),
    ],
    server: {
      host: '0.0.0.0',
      port: 5173,
      watch: {
        usePolling: true,
      },
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL, // Loaded dynamically from .env
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            animations: ['gsap', '@gsap/react', 'framer-motion'],
            icons: ['lucide-react', 'react-icons'],
          },
          // Optimize asset file names for better caching
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name?.split('.') || [];
            const ext = info[info.length - 1];
            if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp/i.test(ext || '')) {
              return `assets/images/[name]-[hash][extname]`;
            }
            if (/mp4|webm|ogg|mp3|wav|flac|aac/i.test(ext || '')) {
              return `assets/videos/[name]-[hash][extname]`;
            }
            return `assets/[name]-[hash][extname]`;
          },
        },
      },
      // Optimize asset handling
      assetsInlineLimit: 4096, // Inline assets smaller than 4kb
    },
    // Enable compression and optimization
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
    },
  });
};
