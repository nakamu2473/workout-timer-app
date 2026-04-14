let _audioCtx = null;

export function getAudioCtx() {
  if (!_audioCtx) {
    _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return _audioCtx;
}

// AudioContext を確実に running 状態にする（非同期）
function ensureRunning(ctx) {
  if (ctx.state !== "running") {
    return ctx.resume().catch(() => {});
  }
  return Promise.resolve();
}

export function playBeep(type = "tick") {
  try {
    const ctx = getAudioCtx();
    console.log("[audio] playBeep:", type, "| state:", ctx.state, "| time:", ctx.currentTime.toFixed(2));

    const play = () => {
      const now = ctx.currentTime + 0.01; // 小さなバッファで過去スケジュールを防ぐ
      const beep = (freq, startTime, duration, volume = 0.25) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.value = freq;
        g.gain.setValueAtTime(volume, startTime);
        g.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        o.start(startTime); o.stop(startTime + duration + 0.01);
      };
      if (type === "start") {
        beep(880, now, 0.1, 0.3);
        beep(1100, now + 0.1, 0.2, 0.3);
      } else if (type === "done") {
        [523, 659, 784, 1047].forEach((f, i) => beep(f, now + i * 0.12, 0.3));
      } else if (type === "last3") {
        beep(440, now, 0.2, 0.35);
      }
    };

    ensureRunning(ctx).then(play).catch(err => {
      console.warn("[audio] resume failed:", err);
    });
  } catch (e) {
    console.error("[audio] playBeep error:", e);
  }
}

// iOS用: 最初のタップでAudioContextをunlockする
export function unlockAudio() {
  try {
    const ctx = getAudioCtx();
    ensureRunning(ctx);
  } catch (e) { /* ignore */ }
}

// ページがバックグラウンドから復帰したときに AudioContext を再開する
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && _audioCtx) {
      ensureRunning(_audioCtx);
    }
  });
}
