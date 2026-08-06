import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { PWA_MANIFEST, APPLE_TOUCH_ICON } from './pwa.manifest.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // 新しいビルドを見つけたら次回起動時に自動で入れ替える（更新プロンプトは出さない）
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'app-icon.svg', APPLE_TOUCH_ICON],
      manifest: PWA_MANIFEST,
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
        // SPAなのでナビゲーションは常に index.html を返す（オフラインでも起動する）
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            // 見出しに使う Zen Kaku Gothic New。初回表示後はオフラインでも同じ字面になる
            urlPattern: /^https:\/\/fonts\.googleapis\.com\//,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-stylesheets' },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 16, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      // 開発中はSWのキャッシュで変更が見えなくなるので無効のまま
      devOptions: { enabled: false },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/utils/**', 'src/data/**', 'src/components/**'],
    },
  },
})
