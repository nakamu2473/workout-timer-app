// public/app-icon.svg から PWA 用の PNG アイコンを書き出す。
// アイコンを変えたときだけ手で走らせる想定（sharp は常用しないので都度入れる）:
//   npm i --no-save sharp && node scripts/generate-icons.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import sharp from "sharp";

const publicDir = join(dirname(fileURLToPath(import.meta.url)), "..", "public");
const rounded = readFileSync(join(publicDir, "app-icon.svg"), "utf8");
// maskable / apple-touch はOS側が角を丸めるので、角丸なしの全面塗りを使う
const fullBleed = rounded.replace('rx="112"', 'rx="0"');

const targets = [
  { file: "pwa-192x192.png", size: 192, svg: rounded },
  { file: "pwa-512x512.png", size: 512, svg: rounded },
  { file: "maskable-icon-512x512.png", size: 512, svg: fullBleed },
  { file: "apple-touch-icon.png", size: 180, svg: fullBleed },
];

for (const { file, size, svg } of targets) {
  const png = await sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();
  writeFileSync(join(publicDir, file), png);
  console.log(`${file} (${size}x${size}) — ${(png.length / 1024).toFixed(1)}kB`);
}
