const BASE = "http://localhost:50021";
export const ZUNDAMON_ID = 3; // ずんだもん ノーマル

let _audio = null;

export function cancelVoicevox() {
  if (_audio) {
    _audio.pause();
    if (_audio.src) URL.revokeObjectURL(_audio.src);
    _audio.src = "";
    _audio = null;
  }
}

export async function speakVoicevox(text, speedScale = 1.1) {
  try {
    cancelVoicevox();
    const qRes = await fetch(
      `${BASE}/audio_query?text=${encodeURIComponent(text)}&speaker=${ZUNDAMON_ID}`,
      { method: "POST" }
    );
    if (!qRes.ok) return false;
    const query = await qRes.json();
    query.speedScale = speedScale;

    const sRes = await fetch(
      `${BASE}/synthesis?speaker=${ZUNDAMON_ID}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(query) }
    );
    if (!sRes.ok) return false;

    const blob = await sRes.blob();
    _audio = new Audio(URL.createObjectURL(blob));
    _audio.play();
    return true;
  } catch (e) {
    return false;
  }
}

export async function testVoicevox() {
  try {
    const res = await fetch(`${BASE}/version`, {
      signal: AbortSignal.timeout(2000),
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}
