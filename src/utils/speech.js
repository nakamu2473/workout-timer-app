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

export function speak(text, voice) {
  if (_useVoicevox) {
    try { window.speechSynthesis?.cancel(); } catch (e) {}
    speakVoicevox(text);
    return;
  }
  try {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    cancelVoicevox();
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

function speakSlow(text) {
  if (_useVoicevox) {
    try { window.speechSynthesis?.cancel(); } catch (e) {}
    speakVoicevox(text);
    return;
  }
  try {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    cancelVoicevox();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ja-JP";
    u.rate = 0.85;
    u.pitch = 1.0;
    u.volume = 1.0;
    if (_selectedVoice) u.voice = _selectedVoice;
    window.speechSynthesis.speak(u);
  } catch (e) { /* ignore */ }
}

const YOGA_SCRIPTS = {
  "はじめに・呼吸を整える":
    "では、はじめていきます。" +
    "仰向けになって、目を閉じてください。" +
    "布団やベッドに、体をあずけてみて。" +
    "腕は体の横に、ごく自然に置いておきましょう。" +
    "これから、体の各部分に力を入れて、ゆっくりほぐしていきます。" +
    "力を入れるのは5秒。抜くのは15秒から20秒。" +
    "その抜いた瞬間の感覚をていねいに味わうのが、このリラクゼーションの核心です。" +
    "まず、鼻からゆっくり息を吸って。4つ数えながら……1、2、3、4。" +
    "口からゆっくり吐いて。6つ数えながら……1、2、3、4、5、6。" +
    "もう一度。吸って……4つ。吐いて……6つ。" +
    "それでいいです。そのまま、自然な呼吸を続けましょう。",

  "足先（つま先・足首）":
    "では、両足のつま先を、ぎゅっと自分の方へ引き寄せてみて。" +
    "ふくらはぎに、じわっと力が入っているのを感じながら……5、4、3、2、1。" +
    "ふっと力を抜いて。" +
    "足先がじわっと重くなる感じ……" +
    "ふくらはぎがやわらかく解けていく感じ……" +
    "その変化を、静かに感じていてください。",

  "太もも":
    "次は太もも。" +
    "両足をベッドに押しつけるように、ぎゅっと力を入れて。" +
    "太ももの筋肉が締まるのを感じながら……5、4、3、2、1。" +
    "力を抜いて。" +
    "足全体が、布団に沈んでいくような感覚……" +
    "脚がずっしり重くなって、どこかへ溶けていくみたい。",

  "お腹":
    "今度はお腹。" +
    "へそに向かってお腹全体をぎゅっと引き込んで、固めて。" +
    "呼吸は止めなくていいです。5、4、3、2、1。" +
    "ふわっと緩めて。" +
    "息が自然に深く入ってきませんか。" +
    "お腹がゆっくり膨らんで、また静かに戻っていく。" +
    "その動きをただ感じていて。",

  "両手・腕":
    "両手を、ぎゅっと握りこぶしにして。" +
    "腕全体に力が伝わっていくのを感じながら……5、4、3、2、1。" +
    "パッと手を開いて、腕をベッドに置いて。" +
    "指先から温かさが広がるような感じ。" +
    "腕全体がじんわり重く、やわらかくなっていく。" +
    "その感覚の中に、しばらくいてみてください。",

  "肩と首":
    "両肩を、耳に近づけるようにぐっとすくめて。" +
    "首の後ろに力が入るのを感じながら……5、4、3、2、1。" +
    "すとんと肩を落として。" +
    "肩が下がった瞬間の、あの降りてきた感じ。" +
    "首の後ろから背中にかけて、ゆっくり温もりが流れていく。",

  "顔・表情筋":
    "目をぎゅっと閉じて、眉を寄せて、顔全体をくしゃっとすぼめて。" +
    "5、4、3、2、1。" +
    "ゆっくり、顔全体を緩めて。" +
    "額がなめらかに広がっていく。" +
    "目の周りがふわっと軽くなる。" +
    "顎が少し開いて、奥歯のかみ合わせが離れていく。" +
    "頭の重さをまるごとベッドに預けて。",

  "体全体・おやすみなさい":
    "今、あなたの体は足先から顔まで、全部ゆっくりほぐれてきています。" +
    "もし、まだどこかに緊張を感じるところがあれば、" +
    "息を吸いながらそこに意識を向けて、" +
    "吐く息と一緒に、手放してみてください。" +
    "このまま眠りに入っていいです。" +
    "何かを考えようとしなくていい。" +
    "どこかへ向かわなくていい。" +
    "ただ、体の重さを感じながら。" +
    "呼吸が続いていることを感じながら。" +
    "おやすみなさい。",
};

export function stepSpeech(ns) {
  if (!ns) return;
  if (ns.yogaScript && YOGA_SCRIPTS[ns.name]) {
    speakSlow(YOGA_SCRIPTS[ns.name]);
    return;
  }
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
    if (!ns.yogaMode) speak("お疲れさまだっちゃ！全部完了！最高だっちゃ！");
  } else if (ns.type === "countdown") {
    if (ns.yogaMode) return;
    if (ns.label?.includes("ウォーム")) speak("ウォームアップ、スタート！");
    else if (ns.label?.includes("クール")) speak("クールダウン、スタート！");
    else if (ns.label?.includes("朝")) speak("朝のストレッチ、スタート！");
    else if (ns.label?.includes("夜")) speak("夜のストレッチ、スタート！");
    else if (ns.label?.includes("ヨガ")) speak("寝たまんまヨガ、スタート！");
    else if (ns.label?.includes("全身ストレッチ")) speak("全身ストレッチ、スタート！");
    else speak("メインワークアウト、スタート！");
  }
}
