import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'stats.html',
      gzipSize: true,
      brotliSize: true
    })
  ],
  build: {
    target: 'esnext',
    minify: 'terser',
    sourcemap: false,
    // Add asset hashing for better cache control
    assetsInlineLimit: 4096, // 4kb - files smaller than this will be inlined as base64
    assetsDir: 'assets',
    // Disable browser caching of generated assets
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['framer-motion', 'lucide-react'],
        },
        // Ensure assets have content-based hashes in their filenames
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // Add cache busting for JS files
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
      }
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react']
  },
});
