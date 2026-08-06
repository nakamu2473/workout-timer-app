import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { PWA_MANIFEST, APPLE_TOUCH_ICON } from '../../pwa.manifest.js';

const root = join(import.meta.dirname, '..', '..');
const publicFile = (name) => join(root, 'public', name);
const indexHtml = readFileSync(join(root, 'index.html'), 'utf8');

// ─── manifest ────────────────────────────────────────────────────────────────

describe('PWA manifest', () => {
  it('has the fields a browser needs before it offers "ホーム画面に追加"', () => {
    expect(PWA_MANIFEST.name).toBeTruthy();
    expect(PWA_MANIFEST.short_name).toBeTruthy();
    expect(PWA_MANIFEST.description).toBeTruthy();
    expect(PWA_MANIFEST.lang).toBe('ja');
  });

  it('opens without browser UI, locked to portrait (縦持ちの1カラムUIのため)', () => {
    expect(PWA_MANIFEST.display).toBe('standalone');
    expect(PWA_MANIFEST.orientation).toBe('portrait');
  });

  it('uses the app background for the splash screen and status bar', () => {
    expect(PWA_MANIFEST.theme_color).toMatch(/^#[0-9a-f]{6}$/i);
    expect(PWA_MANIFEST.background_color).toBe(PWA_MANIFEST.theme_color);
    // index.html の theme-color とずれるとスプラッシュと起動直後で色が変わる
    expect(indexHtml).toContain(`name="theme-color" content="${PWA_MANIFEST.theme_color}"`);
  });

  it('ships the 192/512 icons Android requires, plus a maskable one', () => {
    const sizes = PWA_MANIFEST.icons.map(i => i.sizes);
    expect(sizes).toContain('192x192');
    expect(sizes).toContain('512x512');

    const maskable = PWA_MANIFEST.icons.filter(i => i.purpose === 'maskable');
    expect(maskable).toHaveLength(1);
    expect(maskable[0].sizes).toBe('512x512');
  });

  it('every icon it declares actually exists in public/', () => {
    PWA_MANIFEST.icons.forEach(icon => {
      expect(existsSync(publicFile(icon.src)), icon.src).toBe(true);
      expect(icon.type).toBe('image/png');
    });
  });
});

// ─── index.html ──────────────────────────────────────────────────────────────

describe('index.html PWA head', () => {
  it('links an apple-touch-icon that exists (iOSはPNGしか受け付けない)', () => {
    expect(indexHtml).toContain(`rel="apple-touch-icon" href="/${APPLE_TOUCH_ICON}"`);
    expect(existsSync(publicFile(APPLE_TOUCH_ICON))).toBe(true);
    expect(APPLE_TOUCH_ICON.endsWith('.png')).toBe(true);
  });

  it('asks iOS to open standalone from the home screen', () => {
    expect(indexHtml).toContain('name="apple-mobile-web-app-capable" content="yes"');
    expect(indexHtml).toContain('name="mobile-web-app-capable" content="yes"');
    expect(indexHtml).toContain('name="apple-mobile-web-app-title"');
  });

  it('uses viewport-fit=cover so the safe-area padding has an effect', () => {
    expect(indexHtml).toContain('viewport-fit=cover');
  });
});
