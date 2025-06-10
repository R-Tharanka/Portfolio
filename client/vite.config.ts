/// <reference types="vite/client" />

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // Force Vite to always re-evaluate environment variables
  envDir: '.',
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },

  plugins: [
    react(),
    visualizer({
      filename: 'stats.html',
      gzipSize: true,
      brotliSize: true,
    }),

    // Only register the PWA plugin if enabled in env
    import.meta.env.VITE_ENABLE_PWA === 'true' &&
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt'],
      manifest: {
        name: 'Ruchira Tharanka Portfolio',
        short_name: 'Portfolio',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' }
        ],
      },
      workbox: {
        // Force reload of new SW on each deploy
        globPatterns: ['**/*.{js,css,html,png,svg}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: /^\/api\/.*$/i,
            handler: 'NetworkOnly',   // Always go to network for /api calls
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
            },
          },
          // you can add other caching rules here
        ]
      }
    }),
  ].filter(Boolean),  // filter out the falsey PWA plugin

  build: {
    target: 'esnext',
    minify: 'terser',
    sourcemap: false,
    assetsInlineLimit: 4096,
    assetsDir: 'assets',
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['framer-motion', 'lucide-react'],
        },
        assetFileNames: 'assets/[name]-[hash].[ext]',
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
      }
    },
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true
      }
    }
  },

  server: {
    headers: {
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*'
    }
  },

  optimizeDeps: {
    exclude: ['lucide-react']
  }
});
