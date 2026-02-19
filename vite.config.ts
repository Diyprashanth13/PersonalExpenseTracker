import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'FinTrack Pro',
        short_name: 'FinTrack',
        description: 'Premium Offline-First Finance Tracker',
        theme_color: '#059669',
        background_color: '#020617',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // Precache all static assets
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],

        // navigateFallback: serve index.html for all navigation requests so the
        // React app (with HashRouter) can bootstrap and handle the route internally.
        // Without this, a redirect-back from Google OAuth returns a raw URL that the
        // service worker can't match, resulting in a network error on installed PWAs.
        navigateFallback: 'index.html',

        // CRITICAL: Do NOT intercept Firebase Auth callback URLs or Google OAuth URLs.
        // If these are caught by the SW and served the cached index.html, the redirect
        // credential in the URL is lost and getRedirectResult() returns null.
        navigateFallbackDenylist: [
          /^\/__\/auth/,           // Firebase Auth action handler
          /^\/__\/firebase/,       // Firebase hosting internals
          /identitytoolkit\.googleapis\.com/, // Firebase Identity Toolkit
          /accounts\.google\.com/, // Google OAuth endpoints
          /firestore\.googleapis\.com/, // Firestore REST API
        ],

        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                // 0 = opaque (cross-origin), 200 = success. Never cache 203.
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
