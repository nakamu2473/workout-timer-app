let _selectedVoice = null;

export function getSelectedVoice() {
  return _selectedVoice;
}

export function setSelectedVoice(v) {
  _selectedVoice = v;
}

export function speak(text, voice) {
  try {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ja-JP";
    u.rate = 1.05;
    u.pitch = 1.1;
    u.volume = 1.0;
    const v = voice || _selectedVoice;
    if (v) u.voice = v;
    window.speechSynthesis.speak(u);
  } catch (e) { /* ignore */ }
}

export function stepSpeech(ns) {
  if (!ns) return;
  if (ns.type === "work" || ns.type === "warmup") {
    const reps = ns.reps ? `${ns.reps}、` : "";
    speak(`${ns.name}、${reps}スタート！`);
  } else if (ns.type === "cooldown") {
    speak(`${ns.name}、スタート`);
  } else if (ns.type === "rest") {
    if (ns.nextName) speak(`よく頑張っただっちゃ！次は${ns.nextName}`);
    else if (ns.label && ns.label.includes("セット")) speak("よく頑張っただっちゃ！少し休憩");
    else speak("よく頑張っただっちゃ！");
  } else if (ns.type === "done") {
    speak("お疲れさまだっちゃ！全部完了！最高だっちゃ！");
  } else if (ns.type === "countdown") {
    if (ns.label && ns.label.includes("ウォーム")) speak("ウォームアップ、スタート！");
    else if (ns.label && ns.label.includes("クール")) speak("クールダウン、スタート！");
    else if (ns.label && ns.label.includes("朝")) speak("朝のストレッチ、スタート！");
    else speak("メインワークアウト、スタート！");
  }
}
