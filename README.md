# ラムの筋トレ 💪

ラムちゃんが音声で励ましてくれる、自宅トレーニング用ワークアウトタイマー(React + Vite)。

## 機能

- **4週ローテーションの筋トレメニュー**(Week A〜D × 下半身/上半身/体幹の3日構成、週ごとに強度が上がる) ※現在はアーカイブ（折りたたみ）に収納。データ・記録はそのまま
- **特別メニュー**: 5分かんたんメニュー、ダンベル筋トレ(準備運動・クールダウン込み約10分・毎日のついで用・姿勢改善＆お尻)、朝ストレッチ、夜ストレッチ、全身ストレッチ(25分)、寝たまんまヨガ(音声誘導つき漸進的筋弛緩法)
- **音声ガイド**: ブラウザTTSまたは[VOICEVOX](https://voicevox.hiroshiba.jp/)(ずんだもん)による種目読み上げ・残り時間・休憩アナウンス。ダンベル筋トレは休憩中に次の種目のやり方も読み上げ
- **種目ガイド**: 各種目のやり方とコツをカード表示
- **記録**: 実施履歴をlocalStorageに保存、週ごとの実施回数を表示
- **スリープ防止**: ワークアウト中はWake Lock APIで画面を点灯維持
- **PWA**: ホーム画面に追加すると全画面(standalone)で起動。Service Workerが一式をキャッシュするのでオフラインでも動く

## ホーム画面に追加する

- **iPhone (Safari)**: 共有ボタン → 「ホーム画面に追加」
- **Android (Chrome)**: メニュー → 「アプリをインストール」

インストールするとブラウザのURLバーが消え、機内モードや電波の悪い場所でもそのまま使えます。記録はこれまで通り端末のlocalStorageに残ります。

新しいバージョンをデプロイした場合は、次回アプリを開いたときに自動で更新されます(`registerType: 'autoUpdate'`)。

> Service Workerは `npm run dev` では無効にしてあります(キャッシュで変更が見えなくなるため)。PWAの挙動を確認するときは `npm run build && npm run preview` を使ってください。

## 開発

```bash
npm install
npm run dev      # 開発サーバー起動
npm test         # テスト実行 (vitest)
npm run lint     # ESLint
npm run build    # 本番ビルド (Service Worker と manifest も生成)
npm run preview  # ビルド結果を配信 (PWAの動作確認用)
```

アプリアイコンは `public/app-icon.svg` が元データです。デザインを変えたときだけPNGを書き出し直してください:

```bash
npm i --no-save sharp && node scripts/generate-icons.mjs
```

VOICEVOX音声を使う場合は、ローカルで VOICEVOX エンジン(`localhost:50021`)を起動してから設定画面で有効化してください。未起動の場合は自動でブラウザTTSにフォールバックします。
