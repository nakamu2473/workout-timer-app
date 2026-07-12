import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock voicevox before importing speech
vi.mock('../../utils/voicevox.js', () => ({
  speakVoicevox: vi.fn(),
  cancelVoicevox: vi.fn(),
}));

import { speak, stepSpeech, cueSpeech, setUseVoicevox, getUseVoicevox } from '../../utils/speech.js';
import { speakVoicevox } from '../../utils/voicevox.js';

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
    speakVoicevox.mockResolvedValue(true);
    speak('ずんだもん');
    expect(speakVoicevox).toHaveBeenCalledWith('ずんだもん', 1.1);
    expect(globalThis.speechSynthesis.speak).not.toHaveBeenCalled();
  });

  it('falls back to browser TTS when VOICEVOX fails (engine unreachable)', async () => {
    speakVoicevox.mockResolvedValue(false);
    speak('ずんだもん');
    await Promise.resolve(); // フォールバック判定のマイクロタスクを消化
    expect(globalThis.speechSynthesis.speak).toHaveBeenCalledTimes(1);
    expect(lastSpokenUtterance().text).toBe('ずんだもん');
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

  it('announces short rest step with nextName at entry', () => {
    stepSpeech({ type: 'rest', nextName: 'ランジ', duration: 5 });
    const utterance = lastSpokenUtterance();
    expect(utterance.text).toContain('ランジ');
    expect(utterance.text).toContain('次は');
  });

  it('announces long rest step generically (nextName is spoken by the 5-sec notice instead)', () => {
    stepSpeech({ type: 'rest', nextName: 'ランジ', duration: 30 });
    const utterance = lastSpokenUtterance();
    expect(utterance.text).toContain('休憩だっちゃ');
    expect(utterance.text).not.toContain('ランジ');
  });

  it('reads the next exercise voice guide during rest when guideSpeech is present', () => {
    stepSpeech({ type: 'rest', nextName: 'ダンベルロー', duration: 20, guideSpeech: '肘を天井に向かって引くっちゃ。' });
    const utterance = lastSpokenUtterance();
    expect(utterance.text).toContain('次はダンベルロー');
    expect(utterance.text).toContain('肘を天井に向かって引くっちゃ。');
  });

  it('skips the voice guide on rests shorter than 15s (would not fit)', () => {
    stepSpeech({ type: 'rest', nextName: 'ダンベルロー', duration: 5, guideSpeech: '肘を天井に向かって引くっちゃ。' });
    const utterance = lastSpokenUtterance();
    expect(utterance.text).toContain('次はダンベルロー');
    expect(utterance.text).not.toContain('肘を天井');
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

  it('speaks nothing for silent steps (sleep yoga)', () => {
    stepSpeech({ type: 'countdown', label: '🧘‍♀️ 寝たまんまヨガ', silent: true });
    stepSpeech({ type: 'done', silent: true });
    expect(globalThis.speechSynthesis.speak).not.toHaveBeenCalled();
  });

  it('speaks the opening (at: 0) cue slowly, chunked per sentence to avoid long-utterance cutoff', () => {
    stepSpeech({ type: 'work', name: '太もも', silent: true, cues: [
      { at: 0, text: '力を入れて。ゆっくり抜いて。おやすみなさい。' },
      { at: 10, text: '後半のナレーション。' },
    ] });
    const calls = globalThis.speechSynthesis.speak.mock.calls;
    expect(calls.length).toBe(3);
    expect(calls[0][0].text).toBe('力を入れて。');
    expect(calls[2][0].text).toBe('おやすみなさい。');
    calls.forEach(([u]) => {
      expect(u.rate).toBeCloseTo(0.85);
      expect(u.pitch).toBeCloseTo(1.0);
    });
    // 先頭でのみキャンセルし、後続の文はキューに積む
    expect(globalThis.speechSynthesis.cancel).toHaveBeenCalledTimes(1);
  });

  it('does not speak later cues (at > 0) at step entry — the timer tick delivers them', () => {
    stepSpeech({ type: 'work', name: '太もも', silent: true, cues: [
      { at: 5, text: '5' },
    ] });
    expect(globalThis.speechSynthesis.speak).not.toHaveBeenCalled();
  });

  it('sends the opening cue to VOICEVOX with a slow speed when in voicevox mode', () => {
    setUseVoicevox(true);
    speakVoicevox.mockResolvedValue(true);
    stepSpeech({ type: 'work', name: '太もも', silent: true, cues: [
      { at: 0, text: '力を入れて。ゆっくり抜いて。' },
    ] });
    expect(speakVoicevox).toHaveBeenCalledTimes(1);
    expect(speakVoicevox).toHaveBeenCalledWith('力を入れて。ゆっくり抜いて。', 0.9);
    expect(globalThis.speechSynthesis.speak).not.toHaveBeenCalled();
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

// ─── cueSpeech ──────────────────────────────────────────────────────────────

describe('cueSpeech', () => {
  const step = {
    type: 'work', silent: true, duration: 36,
    cues: [
      { at: 0, text: 'ぎゅっと力を入れて。' },
      { at: 10, text: '5' },
      { at: 11, text: '4' },
      { at: 16, text: 'ふっと力を抜いて。' },
    ],
  };

  it('speaks the cue matching the elapsed second, slowly', () => {
    cueSpeech(step, 10);
    expect(globalThis.speechSynthesis.speak).toHaveBeenCalledTimes(1);
    const u = lastSpokenUtterance();
    expect(u.text).toBe('5');
    expect(u.rate).toBeCloseTo(0.85);
  });

  it('speaks nothing when no cue matches the elapsed second', () => {
    cueSpeech(step, 5);
    expect(globalThis.speechSynthesis.speak).not.toHaveBeenCalled();
  });

  it('does nothing for steps without cues', () => {
    cueSpeech({ type: 'work', duration: 40 }, 3);
    cueSpeech(null, 3);
    expect(globalThis.speechSynthesis.speak).not.toHaveBeenCalled();
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
