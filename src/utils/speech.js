import { speakVoicevox, cancelVoicevox } from "./voicevox.js";

let _selectedVoice = null;
let _useVoicevox = false;
try { _useVoicevox = localStorage.getItem("ram_voice_mode") === "voicevox"; } catch { /* storage無効環境では常にブラウザTTS */ }

export function getSelectedVoice() { return _selectedVoice; }
export function setSelectedVoice(v) {
  _selectedVoice = v;
  _useVoicevox = false;
  localStorage.setItem("ram_voice_mode", "browser");
}

export function getUseVoicevox() { return _useVoicevox; }
export function setUseVoicevox(enabled) {
  _useVoicevox = enabled;
  localStorage.setItem("ram_voice_mode", enabled ? "voicevox" : "browser");
}

// iOS Safari は speechSynthesis.speak() を「ユーザー操作のハンドラ内」で
// 一度呼んでおかないと、以降のプログラム発火の読み上げを黙って無視する。
// 寝たまんまヨガは開始カウントダウンが silent で、タップ中に何も喋らないため
// アンロックされず、そのあとのナレーションが全部消えていた。
// タップ時に無音の発話を1回流してアンロックする（他メニューは開始アナウンスが兼ねている）
let _speechUnlocked = false;
export function unlockSpeech() {
  if (_speechUnlocked) return;
  try {
    if (!window.speechSynthesis) return;
    // 空文字だとiOSがアンロックしない実装があるため半角スペースを読ませる
    const u = new SpeechSynthesisUtterance(" ");
    u.volume = 0;
    window.speechSynthesis.speak(u);
    _speechUnlocked = true;
  } catch { /* ignore */ }
}

// 再生中の音声（ブラウザTTS・VOICEVOX両方）を止める
export function cancelSpeech() {
  _speakSeq++;
  try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
  cancelVoicevox();
}

function speakUtterance(text, { rate = 1.05, pitch = 1.1, voice = null, enqueue = false } = {}) {
  try {
    if (!window.speechSynthesis) return;
    if (!enqueue) window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ja-JP";
    u.rate = rate;
    u.pitch = pitch;
    u.volume = 1.0;
    const v = voice || _selectedVoice;
    if (v) u.voice = v;
    window.speechSynthesis.speak(u);
  } catch { /* ignore */ }
}

// VOICEVOXが失敗したとき（エンジン未起動・デプロイ先から到達不能など）に
// ブラウザTTSへフォールバックするための世代番号。後発の発話が始まっていたら何もしない
let _speakSeq = 0;

function speakViaVoicevox(text, speedScale, fallback) {
  const seq = ++_speakSeq;
  try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
  Promise.resolve(speakVoicevox(text, speedScale)).then(ok => {
    if (!ok && seq === _speakSeq) fallback();
  });
}

export function speak(text, voice) {
  if (_useVoicevox) {
    speakViaVoicevox(text, 1.1, () => speakUtterance(text, { voice }));
    return;
  }
  _speakSeq++;
  cancelVoicevox();
  speakUtterance(text, { voice });
}

// 文単位に分割する（Safari 16.3以前が未対応の後読み正規表現は使わない）
function splitSentences(text) {
  return (text.match(/[^。！？]+[。！？]*/g) || [text]).filter(s => s.trim());
}

// 長い誘導ナレーションをゆっくり読み上げる。
// Chromeは1つの長い発話を約15秒で無音のまま打ち切るため、文単位に分割してキューに積む
function speakScript(text) {
  const speakSlowChunks = () =>
    splitSentences(text).forEach((s, i) => speakUtterance(s, { rate: 0.85, pitch: 1.0, enqueue: i > 0 }));
  if (_useVoicevox) {
    speakViaVoicevox(text, 0.9, speakSlowChunks);
    return;
  }
  _speakSeq++;
  cancelVoicevox();
  speakSlowChunks();
}

// 経過秒数（elapsed）に一致するcueをゆっくり読み上げる（寝たまんまヨガの誘導ナレーション用）。
// カウント「5」「4」…を1秒刻みのcueで流すことで、音声と実時間のテンポを揃える
export function cueSpeech(step, elapsed) {
  if (!step?.cues) return;
  const cue = step.cues.find(c => c.at === elapsed);
  if (cue) speakScript(cue.text);
}

export function stepSpeech(ns) {
  if (!ns) return;
  if (ns.cues) {
    // at: 0 のcueはステップ入りで読み上げる。以降のcueはタイマーのtickが cueSpeech で流す
    const opening = ns.cues.filter(c => c.at === 0).map(c => c.text).join("");
    if (opening) speakScript(opening);
    return;
  }
  if (ns.silent) return;
  if (ns.type === "work" || ns.type === "warmup") {
    const reps = ns.reps ? `${ns.reps}、` : "";
    speak(`${ns.name}、${reps}スタート！`);
  } else if (ns.type === "cooldown") {
    speak(`${ns.name}、スタート`);
  } else if (ns.type === "rest") {
    if (ns.mini) {
      if (ns.nextName) speak(`次は${ns.nextName}`);
      else speak("次の準備だっちゃ！");
    } else if (ns.label && ns.label.includes("セット")) {
      speak("よく頑張っただっちゃ！セット完了！休憩だっちゃ！");
    } else if (ns.guideSpeech && ns.nextName && (ns.duration || 0) >= 15) {
      // 休憩中に次の種目のやり方を読み上げる（15秒以上の休憩のみ。5秒前の準備通知までに読み終わる長さ）
      speak(`よく頑張っただっちゃ！次は${ns.nextName}！${ns.guideSpeech}`);
    } else if (ns.nextName && (ns.duration || 0) < 10) {
      // 10秒未満の休憩は5秒前通知が入りの音声を打ち消すので、入りで次種目を告知する
      speak(`よく頑張っただっちゃ！次は${ns.nextName}！`);
    } else {
      speak("よく頑張っただっちゃ！休憩だっちゃ！");
    }
  } else if (ns.type === "done") {
    speak("お疲れさまだっちゃ！全部完了！最高だっちゃ！");
  } else if (ns.type === "countdown") {
    if (ns.label?.includes("ウォーム")) speak("ウォームアップ、スタート！");
    else if (ns.label?.includes("クール")) speak("クールダウン、スタート！");
    else if (ns.label?.includes("体操")) speak("朝の体操、スタート！");
    else if (ns.label?.includes("朝")) speak("朝のストレッチ、スタート！");
    else if (ns.label?.includes("夜")) speak("夜のストレッチ、スタート！");
    else if (ns.label?.includes("ヨガ")) speak("寝たまんまヨガ、スタート！");
    else if (ns.label?.includes("ダンベル")) speak("ダンベル筋トレ、スタート！");
    else if (ns.label?.includes("全身ストレッチ")) speak("全身ストレッチ、スタート！");
    else speak("メインワークアウト、スタート！");
  }
}
