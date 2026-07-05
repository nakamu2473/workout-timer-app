const BASE = "http://localhost:50021";
export const ZUNDAMON_ID = 3; // ずんだもん ノーマル

let _audio = null;
// 合成は非同期なので、後発の再生/キャンセルで無効化された古いリクエストが
// あとから鳴らないよう、世代番号で識別する
let _seq = 0;

export function cancelVoicevox() {
  _seq++;
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
    const mySeq = _seq;
    const qRes = await fetch(
      `${BASE}/audio_query?text=${encodeURIComponent(text)}&speaker=${ZUNDAMON_ID}`,
      { method: "POST" }
    );
    if (mySeq !== _seq) return true; // 後発の再生に取って代わられた
    if (!qRes.ok) return false;
    const query = await qRes.json();
    query.speedScale = speedScale;

    const sRes = await fetch(
      `${BASE}/synthesis?speaker=${ZUNDAMON_ID}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(query) }
    );
    if (mySeq !== _seq) return true;
    if (!sRes.ok) return false;

    const blob = await sRes.blob();
    if (mySeq !== _seq) return true; // 後発の再生に取って代わられた
    _audio = new Audio(URL.createObjectURL(blob));
    _audio.play();
    return true;
  } catch {
    return false;
  }
}

export async function testVoicevox() {
  try {
    const res = await fetch(`${BASE}/version`, {
      signal: AbortSignal.timeout(2000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
