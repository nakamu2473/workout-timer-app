let _audioCtx = null;

export function getAudioCtx() {
  if (!_audioCtx) {
    _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return _audioCtx;
}

export function playBeep(type = "tick") {
  try {
    const ctx = getAudioCtx();
    console.log("[audio] playBeep:", type, "| state:", ctx.state, "| time:", ctx.currentTime.toFixed(2));

    const play = () => {
      const now = ctx.currentTime;
      const beep = (freq, startTime, duration, volume = 0.25) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.value = freq;
        g.gain.setValueAtTime(volume, startTime);
        g.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        o.start(startTime); o.stop(startTime + duration);
      };
      if (type === "start") {
        beep(880, now, 0.1, 0.3);
        beep(1100, now + 0.1, 0.2, 0.3);
      } else if (type === "done") {
        [523, 659, 784, 1047].forEach((f, i) => beep(f, now + i * 0.12, 0.3));
      } else if (type === "last3") {
        beep(440, now, 0.2, 0.3);
      }
    };

    // suspended状態のとき resume() してから再生する（非同期）
    if (ctx.state === "suspended") {
      ctx.resume().then(play);
    } else {
      play();
    }
  } catch (e) {
    console.error("[audio] playBeep error:", e);
  }
}

// iOS用: 最初のタップでAudioContextをunlockする
export function unlockAudio() {
  try {
    const ctx = getAudioCtx();
    if (ctx.state === "suspended") ctx.resume();
  } catch (e) { /* ignore */ }
}
