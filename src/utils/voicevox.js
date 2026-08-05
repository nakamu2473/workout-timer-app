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

// エンジンに到達できないと判明したら、以降はすぐ false を返してブラウザTTSに任せる。
// （毎回タイムアウトを待つと、1秒刻みのヨガのカウントが後発cueに追い越されて
//   フォールバックが打ち消され、結果ずっと無音になる）
let _unreachable = false;
export function resetVoicevoxReachability() { _unreachable = false; }

// localhost に何も居ない・HTTPSページからのmixed contentで止められた場合に
// 待ち続けないよう、合成リクエストにも必ずタイムアウトを付ける
const FETCH_TIMEOUT_MS = 2000;
const withTimeout = (opts = {}) => ({ ...opts, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });

export async function speakVoicevox(text, speedScale = 1.1) {
  if (_unreachable) return false;
  try {
    cancelVoicevox();
    const mySeq = _seq;
    const qRes = await fetch(
      `${BASE}/audio_query?text=${encodeURIComponent(text)}&speaker=${ZUNDAMON_ID}`,
      withTimeout({ method: "POST" })
    );
    if (mySeq !== _seq) return true; // 後発の再生に取って代わられた
    if (!qRes.ok) return false;
    const query = await qRes.json();
    query.speedScale = speedScale;

    const sRes = await fetch(
      `${BASE}/synthesis?speaker=${ZUNDAMON_ID}`,
      withTimeout({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(query) })
    );
    if (mySeq !== _seq) return true;
    if (!sRes.ok) return false;

    const blob = await sRes.blob();
    if (mySeq !== _seq) return true; // 後発の再生に取って代わられた
    _audio = new Audio(URL.createObjectURL(blob));
    _audio.play();
    return true;
  } catch {
    // 通信自体が届かない（エンジン未起動・mixed contentでブロック）ときは以降スキップする
    _unreachable = true;
    return false;
  }
}

export async function testVoicevox() {
  try {
    const res = await fetch(`${BASE}/version`, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (res.ok) _unreachable = false;
    return res.ok;
  } catch {
    return false;
  }
}
