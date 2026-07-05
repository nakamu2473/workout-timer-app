import {
  WARMUP_LOWER, WARMUP_UPPER, WARMUP_CORE,
  COOLDOWN_LOWER, COOLDOWN_UPPER, COOLDOWN_CORE,
} from "./warmupCooldown.js";

export const WEEK_ROTATIONS = [
  { // ── Week A 基礎 ──
    label: "Week A", sublabel: "基礎固め", sets: 2,
    day1: { label: "Day 1", theme: "下半身", emoji: "🦵", color: "#FF6B6B", warmup: WARMUP_LOWER, cooldown: COOLDOWN_LOWER,
      exercises: [
        { name: "スクワット", reps: "15回", duration: 40, rest: 20 },
        { name: "ランジ（左右）", reps: "10回", duration: 50, rest: 20 },
        { name: "ヒップリフト", reps: "15回", duration: 40, rest: 20 },
      ]},
    day2: { label: "Day 2", theme: "上半身", emoji: "💪", color: "#4ECDC4", warmup: WARMUP_UPPER, cooldown: COOLDOWN_UPPER,
      exercises: [
        { name: "膝つき腕立て", reps: "10回", duration: 40, rest: 20 },
        { name: "ナロー腕立て", reps: "8回", duration: 40, rest: 20 },
        { name: "肩まわし", reps: "20回", duration: 30, rest: 20 },
      ]},
    day3: { label: "Day 3", theme: "体幹", emoji: "🔥", color: "#FFD93D", warmup: WARMUP_CORE, cooldown: COOLDOWN_CORE,
      exercises: [
        { name: "デッドバグ", reps: "10回（左右）", duration: 50, rest: 20 },
        { name: "クランチ", reps: "15回", duration: 40, rest: 20 },
        { name: "バードドッグ", reps: "10回（左右）", duration: 50, rest: 20 },
      ]},
  },
  { // ── Week B 慣れてきた ──
    label: "Week B", sublabel: "少し強化", sets: 2,
    day1: { label: "Day 1", theme: "下半身B", emoji: "🦵", color: "#FF6B6B", warmup: WARMUP_LOWER, cooldown: COOLDOWN_LOWER,
      exercises: [
        { name: "ワイドスクワット", reps: "15回", duration: 45, rest: 20 },
        { name: "ランジ（左右）", reps: "12回", duration: 55, rest: 20 },
        { name: "ヒップリフト", reps: "20回", duration: 50, rest: 20 },
        { name: "カーフレイズ", reps: "20回", duration: 35, rest: 20 },
      ]},
    day2: { label: "Day 2", theme: "上半身B", emoji: "💪", color: "#4ECDC4", warmup: WARMUP_UPPER, cooldown: COOLDOWN_UPPER,
      exercises: [
        { name: "腕立て伏せ", reps: "8回", duration: 40, rest: 20 },
        { name: "ナロー腕立て", reps: "10回", duration: 45, rest: 20 },
        { name: "リバースプランク", reps: "15秒×2", duration: 40, rest: 20 },
      ]},
    day3: { label: "Day 3", theme: "体幹B", emoji: "🔥", color: "#FFD93D", warmup: WARMUP_CORE, cooldown: COOLDOWN_CORE,
      exercises: [
        { name: "クランチ", reps: "15回", duration: 40, rest: 20 },
        { name: "リバースクランチ", reps: "12回", duration: 45, rest: 20 },
        { name: "バードドッグ", reps: "12回（左右）", duration: 55, rest: 20 },
      ]},
  },
  { // ── Week C 本格的に ──
    label: "Week C", sublabel: "本格強化", sets: 2,
    day1: { label: "Day 1", theme: "下半身C", emoji: "🦵", color: "#FF6B6B", warmup: WARMUP_LOWER, cooldown: COOLDOWN_LOWER,
      exercises: [
        { name: "スクワット", reps: "20回", duration: 50, rest: 20 },
        { name: "パルススクワット", reps: "20回", duration: 45, rest: 20 },
        { name: "サイドレッグレイズ", reps: "15回（左右）", duration: 55, rest: 20 },
        { name: "ヒップリフト", reps: "20回", duration: 50, rest: 20 },
      ]},
    day2: { label: "Day 2", theme: "上半身C", emoji: "💪", color: "#4ECDC4", warmup: WARMUP_UPPER, cooldown: COOLDOWN_UPPER,
      exercises: [
        { name: "腕立て伏せ", reps: "10回", duration: 45, rest: 20 },
        { name: "ダイヤモンド腕立て", reps: "8回", duration: 40, rest: 20 },
        { name: "リバースプランク", reps: "20秒×2", duration: 50, rest: 20 },
      ]},
    day3: { label: "Day 3", theme: "体幹C", emoji: "🔥", color: "#FFD93D", warmup: WARMUP_CORE, cooldown: COOLDOWN_CORE,
      exercises: [
        { name: "デッドバグ", reps: "12回（左右）", duration: 55, rest: 20 },
        { name: "マウンテンクライマー", reps: "25秒", duration: 30, rest: 20 },
        { name: "リバースクランチ", reps: "15回", duration: 45, rest: 20 },
      ]},
  },
  { // ── Week D 最高強度 ──
    label: "Week D", sublabel: "最高強度🔥", sets: 3,
    day1: { label: "Day 1", theme: "下半身D", emoji: "🦵", color: "#FF6B6B", warmup: WARMUP_LOWER, cooldown: COOLDOWN_LOWER,
      exercises: [
        { name: "スクワットジャンプ", reps: "10回", duration: 40, rest: 25 },
        { name: "ランジ（左右）", reps: "15回", duration: 60, rest: 25 },
        { name: "ヒップリフト", reps: "20回", duration: 50, rest: 25 },
      ]},
    day2: { label: "Day 2", theme: "上半身D", emoji: "💪", color: "#4ECDC4", warmup: WARMUP_UPPER, cooldown: COOLDOWN_UPPER,
      exercises: [
        { name: "腕立て伏せ", reps: "12回", duration: 50, rest: 25 },
        { name: "ダイヤモンド腕立て", reps: "10回", duration: 45, rest: 25 },
        { name: "ナロー腕立て", reps: "12回", duration: 50, rest: 25 },
      ]},
    day3: { label: "Day 3", theme: "体幹D", emoji: "🔥", color: "#FFD93D", warmup: WARMUP_CORE, cooldown: COOLDOWN_CORE,
      exercises: [
        { name: "マウンテンクライマー", reps: "30秒", duration: 35, rest: 25 },
        { name: "デッドバグ", reps: "15回（左右）", duration: 60, rest: 25 },
        { name: "リバースクランチ", reps: "15回", duration: 50, rest: 25 },
      ]},
  },
];

export const EASY_DAY = {
  label: "5分メニュー", theme: "疲れた日", emoji: "😴", color: "#82E0AA", sets: 1,
  warmup: [], cooldown: [{ name: "腹式呼吸", reps: "5回", duration: 40, rest: 0 }],
  exercises: [
    { name: "その場足踏み", reps: "30秒", duration: 35, rest: 10 },
    { name: "スクワット", reps: "10回", duration: 40, rest: 10 },
    { name: "壁腕立て", reps: "10回", duration: 40, rest: 10 },
    { name: "肩甲骨寄せ", reps: "15回", duration: 35, rest: 10 },
  ],
};

export const MORNING_DAY = {
  label: "朝ストレッチ", theme: "ベッドで起床前", emoji: "🌅", color: "#FFA07A", sets: 1,
  mainLabel: "🌅 朝のストレッチ",
  warmup: [], cooldown: [],
  exercises: [
    { name: "おはよう全身伸び", reps: "10秒", duration: 15, rest: 5 },
    { name: "膝抱えストレッチ", reps: "30秒", duration: 35, rest: 5 },
    { name: "寝ながら腰ストレッチ", reps: "左右各20秒", duration: 45, rest: 5 },
    { name: "ハムストリングストレッチ", reps: "左右各20秒", duration: 45, rest: 5 },
    { name: "足首まわし", reps: "左右10回ずつ", duration: 40, rest: 5 },
    { name: "キャット&カウ", reps: "10回", duration: 40, rest: 5 },
    { name: "股関節ほぐし（バタフライ）", reps: "30秒", duration: 35, rest: 5 },
    { name: "体側伸ばし（座位）", reps: "左右各20秒", duration: 45, rest: 5 },
    { name: "腹式呼吸", reps: "5回", duration: 40, rest: 0 },
  ],
};

export const STRETCHING_DAY = {
  label: "ストレッチ", theme: "じっくり25分", emoji: "🧘", color: "#7C6BAF", sets: 1,
  mainLabel: "🧘 全身ストレッチ",
  warmup: [], cooldown: [],
  exercises: [
    { name: "首の後ろで肘を開く", reps: "30秒", duration: 50, rest: 10 },
    { name: "首の横伸ばし", reps: "左右各35秒", duration: 70, rest: 10 },
    { name: "首の回旋ストレッチ", reps: "左右ゆっくり3〜5回", duration: 40, rest: 10 },
    { name: "肩回し（クロール）", reps: "前後各10回", duration: 45, rest: 10 },
    { name: "上腕三頭筋ストレッチ", reps: "左右各35秒", duration: 70, rest: 10 },
    { name: "背骨ねじり", reps: "左右各35秒", duration: 70, rest: 10 },
    { name: "胸を開くストレッチ", reps: "30秒", duration: 50, rest: 10 },
    { name: "背骨丸めストレッチ", reps: "30秒", duration: 50, rest: 10 },
    { name: "体側伸ばし（座位）", reps: "左右各30秒", duration: 60, rest: 10 },
    { name: "針の糸通し", reps: "左右5回ずつ", duration: 90, rest: 10 },
    { name: "キャット&カウ", reps: "10回", duration: 50, rest: 10 },
    { name: "正座で腕回し", reps: "前後各5回", duration: 50, rest: 10 },
    { name: "脇の下ストレッチ", reps: "左右各35秒", duration: 70, rest: 10 },
    { name: "肘固定で腕を横に開く", reps: "10回", duration: 55, rest: 10 },
    { name: "チャイルドポーズ", reps: "45秒", duration: 55, rest: 10 },
    { name: "お尻ストレッチ", reps: "左右各35秒", duration: 70, rest: 10 },
    { name: "腸腰筋ストレッチ（仰向け）", reps: "左右各35秒", duration: 70, rest: 10 },
    { name: "大腿四頭筋ストレッチ", reps: "左右各35秒", duration: 70, rest: 10 },
    { name: "ハムストリングストレッチ", reps: "左右各30秒", duration: 60, rest: 10 },
    { name: "コブラポーズ", reps: "20秒×2セット", duration: 55, rest: 10 },
    { name: "内腿マッサージ→前屈", reps: "左右各40秒", duration: 90, rest: 0 },
  ],
};

// silent: true の日は全ステップでビープ・定型読み上げを抑制する（入眠用）
// script は各ステップ開始時にゆっくり読み上げる誘導ナレーション。
// duration は読み上げ時間（rate 0.85）に合わせて手調整している
export const YOGA_DAY = {
  label: "寝たまんまヨガ", theme: "緊張→解放", emoji: "🧘‍♀️", color: "#B39DDB", sets: 1,
  mainLabel: "🧘‍♀️ 寝たまんまヨガ", silent: true,
  warmup: [], cooldown: [],
  exercises: [
    { name: "はじめに・呼吸を整える",  reps: "仰向けで深呼吸",             duration: 90, rest: 0,
      script:
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
        "それでいいです。そのまま、自然な呼吸を続けましょう。" },
    { name: "足先（つま先・足首）",    reps: "5秒ギュッと→じっくりゆるめる", duration: 45, rest: 0,
      script:
        "では、両足のつま先を、ぎゅっと自分の方へ引き寄せてみて。" +
        "ふくらはぎに、じわっと力が入っているのを感じながら……5、4、3、2、1。" +
        "ふっと力を抜いて。" +
        "足先がじわっと重くなる感じ……" +
        "ふくらはぎがやわらかく解けていく感じ……" +
        "その変化を、静かに感じていてください。" },
    { name: "太もも",                  reps: "5秒ギュッと→じっくりゆるめる", duration: 45, rest: 0,
      script:
        "次は太もも。" +
        "両足をベッドに押しつけるように、ぎゅっと力を入れて。" +
        "太ももの筋肉が締まるのを感じながら……5、4、3、2、1。" +
        "力を抜いて。" +
        "足全体が、布団に沈んでいくような感覚……" +
        "脚がずっしり重くなって、どこかへ溶けていくみたい。" },
    { name: "お腹",                    reps: "5秒引き込んで→じっくりゆるめる", duration: 45, rest: 0,
      script:
        "今度はお腹。" +
        "へそに向かってお腹全体をぎゅっと引き込んで、固めて。" +
        "呼吸は止めなくていいです。5、4、3、2、1。" +
        "ふわっと緩めて。" +
        "息が自然に深く入ってきませんか。" +
        "お腹がゆっくり膨らんで、また静かに戻っていく。" +
        "その動きをただ感じていて。" },
    { name: "両手・腕",                reps: "5秒握って→パッと開いてゆるめる", duration: 50, rest: 0,
      script:
        "両手を、ぎゅっと握りこぶしにして。" +
        "腕全体に力が伝わっていくのを感じながら……5、4、3、2、1。" +
        "パッと手を開いて、腕をベッドに置いて。" +
        "指先から温かさが広がるような感じ。" +
        "腕全体がじんわり重く、やわらかくなっていく。" +
        "その感覚の中に、しばらくいてみてください。" },
    { name: "肩と首",                  reps: "5秒すくめて→ストンと落とす",   duration: 40, rest: 0,
      script:
        "両肩を、耳に近づけるようにぐっとすくめて。" +
        "首の後ろに力が入るのを感じながら……5、4、3、2、1。" +
        "すとんと肩を落として。" +
        "肩が下がった瞬間の、あの降りてきた感じ。" +
        "首の後ろから背中にかけて、ゆっくり温もりが流れていく。" },
    { name: "顔・表情筋",              reps: "5秒しかめて→じっくりゆるめる", duration: 50, rest: 0,
      script:
        "目をぎゅっと閉じて、眉を寄せて、顔全体をくしゃっとすぼめて。" +
        "5、4、3、2、1。" +
        "ゆっくり、顔全体を緩めて。" +
        "額がなめらかに広がっていく。" +
        "目の周りがふわっと軽くなる。" +
        "顎が少し開いて、奥歯のかみ合わせが離れていく。" +
        "頭の重さをまるごとベッドに預けて。" },
    { name: "体全体・おやすみなさい",  reps: "全身を感じながら眠りへ",       duration: 70, rest: 0,
      script:
        "今、あなたの体は足先から顔まで、全部ゆっくりほぐれてきています。" +
        "もし、まだどこかに緊張を感じるところがあれば、" +
        "息を吸いながらそこに意識を向けて、" +
        "吐く息と一緒に、手放してみてください。" +
        "このまま眠りに入っていいです。" +
        "何かを考えようとしなくていい。" +
        "どこかへ向かわなくていい。" +
        "ただ、体の重さを感じながら。" +
        "呼吸が続いていることを感じながら。" +
        "おやすみなさい。" },
  ],
};

export const EVENING_DAY = {
  label: "夜ストレッチ", theme: "寝る前リラックス", emoji: "🌙", color: "#8B7FD4", sets: 1,
  mainLabel: "🌙 夜のストレッチ",
  warmup: [], cooldown: [],
  exercises: [
    { name: "首の横伸ばし", reps: "左右各20秒", duration: 45, rest: 5 },
    { name: "肩甲骨ほぐし", reps: "30秒", duration: 35, rest: 5 },
    { name: "股関節ストレッチ", reps: "30秒", duration: 35, rest: 5 },
    { name: "チャイルドポーズ", reps: "30秒", duration: 35, rest: 5 },
    { name: "寝ながら腰ストレッチ", reps: "左右各20秒", duration: 45, rest: 5 },
    { name: "寝ながら体側伸ばし", reps: "左右各20秒", duration: 45, rest: 5 },
    { name: "お尻ストレッチ", reps: "左右各20秒", duration: 45, rest: 5 },
    { name: "ハムストリングストレッチ", reps: "左右各20秒", duration: 45, rest: 5 },
    { name: "腹式呼吸", reps: "5回", duration: 40, rest: 0 },
  ],
};
