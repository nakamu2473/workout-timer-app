// ホーム画面にインストールしたときの見え方（vite.config.js から VitePWA に渡す）。
// icons の src は public/ 直下のファイル名。名前を変えたら public/ の実体も揃えること
// （src/__tests__/pwa.test.js が存在チェックしている）
export const PWA_MANIFEST = {
  name: 'ラムの筋トレ',
  short_name: 'ラムの筋トレ',
  description: 'ラムちゃんが音声で励ましてくれる、自宅トレーニング用ワークアウトタイマー',
  lang: 'ja',
  theme_color: '#0f0c29',
  background_color: '#0f0c29',
  display: 'standalone',
  orientation: 'portrait',
  categories: ['health', 'fitness', 'lifestyle'],
  icons: [
    { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
    { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
    // purpose: maskable はOSが好きな形に切り抜くので、角丸なしの全面塗りを渡す
    { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
}

// index.html の apple-touch-icon と揃える（iOSはPNGしか受け付けない）
export const APPLE_TOUCH_ICON = 'apple-touch-icon.png'
