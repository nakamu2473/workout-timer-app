let _audioCtx = null;
let _keepAliveNode = null;

export function getAudioCtx() {
  if (!_audioCtx) {
    _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return _audioCtx;
}

// アンロック後に無音ループを流してiOSの自動サスペンドを防ぐ
function startKeepAlive(ctx) {
  if (_keepAliveNode) return;
  try {
    // 0.5秒の無音バッファをループ再生（iOSがコンテキストをsuspendしないようにする）
    const bufSize = Math.floor(ctx.sampleRate * 0.5);
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const g = ctx.createGain();
    g.gain.value = 0; // 完全無音
    src.connect(g);
    g.connect(ctx.destination);
    src.start();
    _keepAliveNode = src;
  } catch (e) {
    console.warn("[audio] keepAlive error:", e);
  }
}

function doPlay(ctx, type) {
  const now = ctx.currentTime + 0.01;
  const beep = (freq, t0, dur, vol) => {
    try {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.frequency.value = freq;
      g.gain.setValueAtTime(vol, t0);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      o.start(t0);
      o.stop(t0 + dur + 0.05);
    } catch (e) {
      console.warn("[audio] beep error:", e);
    }
  };
  if (type === "start") {
    beep(880, now, 0.1, 0.3);
    beep(1100, now + 0.1, 0.2, 0.3);
  } else if (type === "done") {
    [523, 659, 784, 1047].forEach((f, i) => beep(f, now + i * 0.12, 0.3, 0.3));
  } else if (type === "last3") {
    beep(440, now, 0.25, 0.5);
  }
}

export function playBeep(type = "tick") {
  try {
    const ctx = getAudioCtx();
    console.log("[audio] playBeep:", type, "| state:", ctx.state, "| time:", ctx.currentTime.toFixed(2));

    if (ctx.state === "running") {
      // running のときは同期的に即再生（Promiseを経由しない）
      doPlay(ctx, type);
    } else {
      // suspended/interrupted のときはresume後に再生
      ctx.resume().then(() => {
        startKeepAlive(ctx);
        doPlay(ctx, type);
      }).catch(e => console.warn("[audio] resume failed:", e));
    }
  } catch (e) {
    console.error("[audio] playBeep error:", e);
  }
}

// iOS用: 最初のユーザー操作でアンロックし、keepAliveを開始する
export function unlockAudio() {
  try {
    const ctx = getAudioCtx();
    if (ctx.state === "running") {
      startKeepAlive(ctx);
    } else {
      ctx.resume().then(() => startKeepAlive(ctx)).catch(() => {});
    }
  } catch (e) { /* ignore */ }
}

// バックグラウンドから復帰したときに再開する
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && _audioCtx && _audioCtx.state !== "running") {
      _audioCtx.resume().then(() => startKeepAlive(_audioCtx)).catch(() => {});
    }
  });
}
