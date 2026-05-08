let wakeLock = null;
let shouldLock = false;

export async function requestWakeLock() {
  if (!("wakeLock" in navigator)) return;
  shouldLock = true;
  try {
    wakeLock = await navigator.wakeLock.request("screen");
  } catch (_) {}
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
