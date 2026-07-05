let wakeLock = null;
let shouldLock = false;

export async function requestWakeLock() {
  if (!("wakeLock" in navigator)) return;
  shouldLock = true;
  if (wakeLock) return;
  try {
    wakeLock = await navigator.wakeLock.request("screen");
    // タブ切替等でブラウザが自動解放したら再取得できるように追跡を外す
    wakeLock.addEventListener("release", () => { wakeLock = null; });
  } catch { /* ignore */ }
}

export function releaseWakeLock() {
  shouldLock = false;
  if (wakeLock) {
    wakeLock.release().catch(() => {});
    wakeLock = null;
  }
}

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && shouldLock && wakeLock === null) {
      requestWakeLock();
    }
  });
}
