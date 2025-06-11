/// <reference types="vite/client" />

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { VitePWA } from 'vite-plugin-pwa';
import fs from 'fs';
import path from 'path';

// Safely check if PWA is enabled by looking at env files
const isPWAEnabled = () => {
  try {
    // Try to read from .env files directly (for build environments)
    const envFiles = ['.env', '.env.production', '.env.local'];
    for (const file of envFiles) {
      const filePath = path.resolve(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        if (content.includes('VITE_ENABLE_PWA=true')) {
          return true;
        }
      }
    }

    // Safe access to process.env with fallback
    try {
      // Access process.env safely with optional chaining
      return process?.env?.VITE_ENABLE_PWA === 'true';
    } catch {
      // If there's any issue accessing process.env
      return false;
    }
  } catch (e) {
    console.warn('Error checking PWA status:', e);
    return false; // Default to false if any error occurs
  }
};

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
    }),    // Only register the PWA plugin if enabled in env
    // Extra-safe check to ensure build doesn't fail
    (process && process.env && process.env.VITE_ENABLE_PWA === 'true' ? true : isPWAEnabled()) &&
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
            handler: 'NetworkFirst',   // Use NetworkFirst instead of NetworkOnly to support networkTimeoutSeconds
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
        drop_console: true,
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
