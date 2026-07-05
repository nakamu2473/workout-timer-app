import { speakVoicevox, cancelVoicevox } from "./voicevox.js";

let _selectedVoice = null;
let _useVoicevox = localStorage.getItem("ram_voice_mode") === "voicevox";

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

// 再生中の音声（ブラウザTTS・VOICEVOX両方）を止める
export function cancelSpeech() {
  try { window.speechSynthesis?.cancel(); } catch (e) { /* ignore */ }
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
  } catch (e) { /* ignore */ }
}

export function speak(text, voice) {
  if (_useVoicevox) {
    try { window.speechSynthesis?.cancel(); } catch (e) { /* ignore */ }
    speakVoicevox(text);
    return;
  }
  cancelVoicevox();
  speakUtterance(text, { voice });
}

// 長い誘導ナレーションをゆっくり読み上げる。
// Chromeは1つの長い発話を約15秒で無音のまま打ち切るため、文単位に分割してキューに積む
function speakScript(text) {
  if (_useVoicevox) {
    try { window.speechSynthesis?.cancel(); } catch (e) { /* ignore */ }
    speakVoicevox(text, 0.9);
    return;
  }
  cancelVoicevox();
  const sentences = text.split(/(?<=[。！？])/).filter(s => s.trim());
  sentences.forEach((s, i) => speakUtterance(s, { rate: 0.85, pitch: 1.0, enqueue: i > 0 }));
}

export function stepSpeech(ns) {
  if (!ns) return;
  if (ns.script) {
    speakScript(ns.script);
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
    else if (ns.label?.includes("朝")) speak("朝のストレッチ、スタート！");
    else if (ns.label?.includes("夜")) speak("夜のストレッチ、スタート！");
    else if (ns.label?.includes("ヨガ")) speak("寝たまんまヨガ、スタート！");
    else if (ns.label?.includes("全身ストレッチ")) speak("全身ストレッチ、スタート！");
    else speak("メインワークアウト、スタート！");
  }
}
