import { describe, it, expect, vi, beforeEach } from 'vitest';

import { speakVoicevox, testVoicevox, resetVoicevoxReachability } from '../../utils/voicevox.js';

beforeEach(() => {
  resetVoicevoxReachability();
  vi.restoreAllMocks();
});

describe('speakVoicevox – エンジンに到達できないとき', () => {
  it('returns false so the caller can fall back to browser TTS', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Failed to fetch')));
    await expect(speakVoicevox('テスト')).resolves.toBe(false);
  });

  // 毎回タイムアウトを待つと、1秒刻みのヨガのカウントcueが後発cueに追い越されて
  // フォールバックが打ち消され、結果ずっと無音になる
  it('short-circuits later calls without hitting the network again', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('Failed to fetch'));
    vi.stubGlobal('fetch', fetchMock);

    await speakVoicevox('1回目');
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await expect(speakVoicevox('2回目')).resolves.toBe(false);
    await expect(speakVoicevox('3回目')).resolves.toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('resolves fast enough that the fallback fires before the next 1-second cue', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Failed to fetch')));
    await speakVoicevox('先頭'); // ここで到達不能を記録する

    let fallbackFired = false;
    Promise.resolve(speakVoicevox('カウント')).then(ok => { if (!ok) fallbackFired = true; });
    await Promise.resolve();
    await Promise.resolve();
    expect(fallbackFired).toBe(true);
  });

  it('aborts a hanging request instead of waiting forever', async () => {
    const fetchMock = vi.fn((_url, opts) => new Promise((_resolve, reject) => {
      opts.signal.addEventListener('abort', () => reject(new Error('aborted')));
    }));
    vi.stubGlobal('fetch', fetchMock);
    expect(fetchMock.mock.calls.length).toBe(0);

    const promise = speakVoicevox('応答が返らない');
    expect(fetchMock.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
    await expect(promise).resolves.toBe(false);
  }, 10000);
});

describe('testVoicevox', () => {
  it('returns true and clears the unreachable flag when the engine answers', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Failed to fetch')));
    await speakVoicevox('到達不能にする');

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
    await expect(testVoicevox()).resolves.toBe(true);

    // エンジンが起動し直したあとは、また合成を試しにいく
    const fetchMock = vi.fn().mockRejectedValue(new Error('Failed to fetch'));
    vi.stubGlobal('fetch', fetchMock);
    await speakVoicevox('再挑戦');
    expect(fetchMock).toHaveBeenCalled();
  });

  it('returns false when the engine is not running', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Failed to fetch')));
    await expect(testVoicevox()).resolves.toBe(false);
  });
});
