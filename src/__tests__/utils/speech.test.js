import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock voicevox before importing speech
vi.mock('../../utils/voicevox.js', () => ({
  speakVoicevox: vi.fn(),
  cancelVoicevox: vi.fn(),
}));

import { speak, stepSpeech, setSelectedVoice, setUseVoicevox, getUseVoicevox } from '../../utils/speech.js';
import { speakVoicevox, cancelVoicevox } from '../../utils/voicevox.js';

beforeEach(() => {
  vi.clearAllMocks();
  globalThis.speechSynthesis.cancel.mockClear();
  globalThis.speechSynthesis.speak.mockClear();
  // Reset to browser mode
  setUseVoicevox(false);
});

// ─── speak ──────────────────────────────────────────────────────────────────

function lastSpokenUtterance() {
  const calls = globalThis.speechSynthesis.speak.mock.calls;
  return calls[calls.length - 1]?.[0];
}

describe('speak (browser mode)', () => {
  it('calls speechSynthesis.speak with the given text', () => {
    speak('テスト');
    expect(globalThis.speechSynthesis.speak).toHaveBeenCalledTimes(1);
    expect(lastSpokenUtterance().text).toBe('テスト');
  });

  it('sets Japanese language and adjusted rate/pitch', () => {
    speak('こんにちは');
    const u = lastSpokenUtterance();
    expect(u.lang).toBe('ja-JP');
    expect(u.rate).toBeCloseTo(1.05);
    expect(u.pitch).toBeCloseTo(1.1);
  });

  it('cancels any previous speech before speaking', () => {
    speak('first');
    speak('second');
    expect(globalThis.speechSynthesis.cancel).toHaveBeenCalledTimes(2);
  });
});

describe('speak (VOICEVOX mode)', () => {
  beforeEach(() => setUseVoicevox(true));

  it('calls speakVoicevox instead of browser TTS', () => {
    speak('ずんだもん');
    expect(speakVoicevox).toHaveBeenCalledWith('ずんだもん');
    expect(globalThis.speechSynthesis.speak).not.toHaveBeenCalled();
  });
});

// ─── stepSpeech ─────────────────────────────────────────────────────────────

describe('stepSpeech', () => {
  it('does nothing when step is null/undefined', () => {
    stepSpeech(null);
    stepSpeech(undefined);
    expect(globalThis.speechSynthesis.speak).not.toHaveBeenCalled();
  });

  it('announces work step with name, reps, and スタート！', () => {
    stepSpeech({ type: 'work', name: 'スクワット', reps: '15回' });
    const utterance = lastSpokenUtterance();
    expect(utterance.text).toContain('スクワット');
    expect(utterance.text).toContain('15回');
    expect(utterance.text).toContain('スタート！');
  });

  it('announces work step without reps when reps is falsy', () => {
    stepSpeech({ type: 'work', name: 'プランク', reps: '' });
    const utterance = lastSpokenUtterance();
    expect(utterance.text).toBe('プランク、スタート！');
  });

  it('announces warmup step same as work step', () => {
    stepSpeech({ type: 'warmup', name: '足首回し', reps: '10回' });
    const utterance = lastSpokenUtterance();
    expect(utterance.text).toContain('足首回し');
    expect(utterance.text).toContain('スタート！');
  });

  it('announces cooldown step with スタート (no exclamation)', () => {
    stepSpeech({ type: 'cooldown', name: '大腿四頭筋ストレッチ', reps: '30秒' });
    const utterance = lastSpokenUtterance();
    expect(utterance.text).toContain('大腿四頭筋ストレッチ');
    expect(utterance.text).toContain('スタート');
  });

  it('announces rest step with nextName when provided', () => {
    stepSpeech({ type: 'rest', nextName: 'ランジ' });
    const utterance = lastSpokenUtterance();
    expect(utterance.text).toContain('ランジ');
    expect(utterance.text).toContain('次は');
  });

  it('announces rest step with set completion message when label includes セット', () => {
    stepSpeech({ type: 'rest', label: 'セット1完了！あと1セットだっちゃ', nextName: null });
    const utterance = lastSpokenUtterance();
    expect(utterance.text).toContain('休憩');
  });

  it('announces rest step with generic message when no nextName or セット label', () => {
    stepSpeech({ type: 'rest', nextName: null, label: '次のストレッチ' });
    const utterance = lastSpokenUtterance();
    expect(utterance.text).toContain('頑張っただっちゃ');
  });

  it('announces done step', () => {
    stepSpeech({ type: 'done' });
    const utterance = lastSpokenUtterance();
    expect(utterance.text).toContain('お疲れさまだっちゃ');
    expect(utterance.text).toContain('完了');
  });

  it('announces warmup countdown', () => {
    stepSpeech({ type: 'countdown', label: '🔥 ウォームアップ' });
    const utterance = lastSpokenUtterance();
    expect(utterance.text).toContain('ウォームアップ');
  });

  it('announces cooldown countdown', () => {
    stepSpeech({ type: 'countdown', label: '🧊 クールダウン' });
    const utterance = lastSpokenUtterance();
    expect(utterance.text).toContain('クールダウン');
  });

  it('announces morning stretch countdown', () => {
    stepSpeech({ type: 'countdown', label: '🌅 朝のストレッチ' });
    const utterance = lastSpokenUtterance();
    expect(utterance.text).toContain('朝');
  });

  it('announces main workout countdown by default', () => {
    stepSpeech({ type: 'countdown', label: '💪 メインワークアウト' });
    const utterance = lastSpokenUtterance();
    expect(utterance.text).toContain('メインワークアウト');
  });
});

// ─── voice mode persistence ──────────────────────────────────────────────────

describe('voice mode state', () => {
  it('getUseVoicevox returns false after setUseVoicevox(false)', () => {
    setUseVoicevox(false);
    expect(getUseVoicevox()).toBe(false);
  });

  it('getUseVoicevox returns true after setUseVoicevox(true)', () => {
    setUseVoicevox(true);
    expect(getUseVoicevox()).toBe(true);
  });
});
