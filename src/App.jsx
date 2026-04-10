import { useState, useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────
// EXERCISE GUIDE LIBRARY
// ─────────────────────────────────────────────
const EXERCISE_GUIDE = {
  "その場足踏み": { points: ["足を腰幅に開いて立つっちゃ","膝を腰の高さまで上げるつもりで足踏みするっちゃ","腕も前後に振るっちゃ","だんだんペースを上げるっちゃ","呼吸を止めないようにするっちゃ"], tip: "体を温めるウォームアップだっちゃ！ゆっくり始めてOKだっちゃ" },
  "腕まわし": { points: ["足を肩幅に開いて立つっちゃ","両腕を横に広げるっちゃ","肘を伸ばしたまま大きく前回しするっちゃ","肩甲骨が動くのを感じるっちゃ","前10回・後ろ10回やるっちゃ"], tip: "ゆっくり大きく回すほど効果があるっちゃ！" },
  "股関節回し": { points: ["足を肩幅に開いて立つっちゃ","両手を腰に当てるっちゃ","腰で大きな円を描くように回すっちゃ","膝を少し曲げると安定するっちゃ","右回り10回・左回り10回やるっちゃ"], tip: "スクワットやランジの前に必須だっちゃ！" },
  "膝まわし": { points: ["足を揃えてしゃがみ気味にするっちゃ","両手を膝に当てるっちゃ","膝で円を描くようにゆっくり回すっちゃ","関節をほぐす感覚でやるっちゃ","右回り10回・左回り10回やるっちゃ"], tip: "膝の怪我予防に大事なウォームアップだっちゃ！" },
  "体側伸ばし": { points: ["足を肩幅に開いて立つっちゃ","右手を上に伸ばすっちゃ","左に体を傾けて右の体側を伸ばすっちゃ","反対側も同様にやるっちゃ","左右交互にゆっくり動かすっちゃ"], tip: "呼吸を止めないで、息を吐きながら伸ばすっちゃ！" },
  "肩まわし": { points: ["足を肩幅に開いて立つっちゃ","両手の指先を肩に当てるっちゃ","肘で大きな円を描くように前まわしするっちゃ","肩甲骨を動かすことを意識するっちゃ","前回し・後ろ回しどちらもやるっちゃ"], tip: "ゆっくり大きく回すほど効果があるっちゃ！" },
  "スクワット": { points: ["足を肩幅に開いてまっすぐ立つっちゃ","つま先を少し外側に向けるっちゃ","お尻を後ろに引きながらゆっくり下げるっちゃ","膝がつま先より前に出ないよう注意だっちゃ！","太ももが床と平行になったら上に戻るっちゃ"], tip: "背中を丸めないで、胸を張るっちゃ！" },
  "ランジ（左右）": { points: ["足を腰幅に開いて立つっちゃ","片足を大きく前に踏み出すっちゃ","前の膝が90度になるまで体を下げるっちゃ","後ろの膝は床ギリギリまで下げるっちゃ","前足で地面を押して元に戻るっちゃ"], tip: "上体はまっすぐ！前に倒れないようにだっちゃ" },
  "ヒップリフト": { points: ["仰向けに寝て膝を90度に曲げるっちゃ","足を腰幅に開いて床にしっかりつけるっちゃ","お尻をゆっくり天井に向かって上げるっちゃ","肩・腰・膝が一直線になったらキープだっちゃ","ゆっくり下ろして繰り返すっちゃ"], tip: "上げた時にお尻をギュッと締めるっちゃ！効果倍増だっちゃ" },
  "膝つき腕立て": { points: ["膝をついて手を肩幅より少し広めに置くっちゃ","頭から膝まで一直線を意識するっちゃ","肘を外に開きすぎず、少し体に寄せるっちゃ","胸が床ギリギリまでゆっくり下げるっちゃ","息を吐きながら腕を伸ばして上がるっちゃ"], tip: "お腹に力を入れてお尻が上がらないようにだっちゃ！" },
  "パイク腕立て": { points: ["腕立て伏せの姿勢からお尻を高く上げるっちゃ","体が逆V字になるようにするっちゃ","頭は腕の間を覗かせる感じにするっちゃ","肘をゆっくり曲げて頭を床に近づけるっちゃ","腕を伸ばして元の位置に戻るっちゃ"], tip: "肩の筋肉に効く種目だっちゃ！焦らずゆっくりやるっちゃ" },
  "デッドバグ": { points: ["仰向けに寝て両腕を天井に伸ばすっちゃ","両膝を90度に曲げて持ち上げるっちゃ","腰を床にしっかり押し付けるのが大事だっちゃ！","右手と左足を同時に床に近づけながら伸ばすっちゃ","元に戻して逆側を繰り返すっちゃ"], tip: "腰が床から浮かないようにするのがポイントだっちゃ！" },
  "クランチ": { points: ["仰向けに寝て膝を90度に曲げるっちゃ","手を頭の後ろか胸の前で組むっちゃ","顎を引いてへそを見るように上体を起こすっちゃ","肩甲骨が浮く程度でOKだっちゃ","ゆっくり下ろして繰り返すっちゃ"], tip: "首に力が入りやすいから気をつけてだっちゃ！" },
  "バードドッグ": { points: ["四つん這いになって手は肩の下、膝は腰の下に置くっちゃ","背中をまっすぐに保つっちゃ（猫背NG！）","右手と左足を同時にまっすぐ伸ばすっちゃ","3秒キープして元に戻すっちゃ","左手と右足も同様に繰り返すっちゃ"], tip: "お腹に力を入れると体が安定するっちゃ！" },
  "ワイドスクワット": { points: ["足を肩幅の1.5倍に広げて立つっちゃ","つま先を45度外側に向けるっちゃ","膝をつま先の方向に曲げながら腰を落とすっちゃ","内ももを使う感覚を意識するっちゃ","ゆっくり立ち上がるっちゃ"], tip: "通常スクワットより内側の筋肉に効くっちゃ！" },
  "カーフレイズ": { points: ["足を腰幅に開いて立つっちゃ（壁に手をそえてもOK）","かかとをゆっくり持ち上げるっちゃ","つま先立ちの頂点で1秒止めるっちゃ","ゆっくりかかとを下ろすっちゃ","下ろしきる前にまた上げると効果的だっちゃ"], tip: "ふくらはぎに効くっちゃ！立ち仕事の疲れにもいいっちゃ" },
  "腕立て伏せ": { points: ["手を肩幅より少し広めに置くっちゃ","頭からかかとまで一直線にするっちゃ","お腹に力を入れてお尻が落ちないようにだっちゃ","胸が床ギリギリまでゆっくり下げるっちゃ","腕を伸ばして戻るっちゃ"], tip: "きつければ膝をついてOKだっちゃ！" },
  "トライセプスディップス": { points: ["椅子や床に手をついて体を前に出すっちゃ","脚は膝を曲げて前に伸ばすっちゃ","肘を後ろに曲げながら体を下げるっちゃ","腕の後ろ側（二の腕）を使う感覚だっちゃ","肘を伸ばして元に戻すっちゃ"], tip: "肘が外に開かないよう、体に近い位置でやるっちゃ！" },
  "サイドレッグレイズ": { points: ["横向きに寝て体をまっすぐにするっちゃ","下の腕を伸ばして頭を乗せるっちゃ","上の足をゆっくり上に持ち上げるっちゃ（45度くらい）","腰が前後にぶれないよう注意だっちゃ","ゆっくり下ろして繰り返すっちゃ（左右やるっちゃ）"], tip: "お尻の横の筋肉に効くっちゃ！骨盤安定に大事だっちゃ" },
  "リバースクランチ": { points: ["仰向けで両膝を90度に曲げて浮かせるっちゃ","手のひらを床につけて体を安定させるっちゃ","息を吐きながらお尻を床から浮かせるっちゃ","膝を胸に近づけるように引き上げるっちゃ","ゆっくり元の位置に戻すっちゃ"], tip: "お腹の下部に効くっちゃ！反動を使わないでっちゃ" },
  "マウンテンクライマー": { points: ["腕立て伏せの姿勢（プランク姿勢）からスタートだっちゃ","体はまっすぐ、お腹に力を入れるっちゃ","右膝を胸に向かって素早く引き上げるっちゃ","右足を戻しながら左膝を引き上げるっちゃ","交互に素早く繰り返すっちゃ（走るイメージ！）"], tip: "お腹・全身に効くきつい種目だっちゃ！無理せずペース調整するっちゃ" },
  "スクワットジャンプ": { points: ["足を肩幅に開いてスクワットの姿勢になるっちゃ","太ももが床と平行になるまで下げるっちゃ","腕を振り上げながら思い切りジャンプするっちゃ","着地はつま先からかかとの順でやわらかくするっちゃ","着地してすぐ次のスクワットに入るっちゃ"], tip: "膝に負担がかかるから着地は丁寧にだっちゃ！きつければ通常スクワットでOKっちゃ" },
  "パルススクワット": { points: ["スクワットの一番低い位置でキープするっちゃ","そこから5cmほど上下に小刻みに動かすっちゃ","太ももに効いてるのを感じるっちゃ","呼吸は止めないっちゃ","20回パルスしたら立ち上がるっちゃ"], tip: "地味にきついっちゃ！太ももに火がつくっちゃ🔥" },
  "ダイヤモンド腕立て": { points: ["手を胸の前でひし形（ダイヤモンド型）に置くっちゃ","人差し指と親指で三角を作る感じだっちゃ","頭からかかとまで一直線にするっちゃ","ゆっくり胸を手に近づけるっちゃ","腕を伸ばして戻るっちゃ。きつければ膝つきOKっちゃ"], tip: "二の腕（三頭筋）に集中して効くっちゃ！" },
  // ── COOL DOWN ──
  "首の横伸ばし": { points: ["背筋を伸ばして座るかまっすぐ立つっちゃ","右手を頭の左側に当てるっちゃ","ゆっくり右に頭を倒して左の首筋を伸ばすっちゃ","20〜30秒キープするっちゃ","反対側も同じようにやるっちゃ"], tip: "肩に力が入らないように、肩をストンと落としてやるっちゃ！" },
  "肩甲骨ストレッチ": { points: ["右腕を体の前に横に伸ばすっちゃ","左腕で右腕の肘を体に引き寄せるっちゃ","右肩の後ろ側が伸びる感覚を確認するっちゃ","20〜30秒キープするっちゃ","左腕も同様にやるっちゃ"], tip: "肩こりに効く定番ストレッチだっちゃ！毎日やってほしいっちゃ" },
  "胸を開くストレッチ": { points: ["両手を背中で組むっちゃ","胸を前に突き出すように肩甲骨を寄せるっちゃ","顔は少し上を向けるっちゃ","胸と肩の前側が伸びるのを感じるっちゃ","20〜30秒キープするっちゃ"], tip: "スマホ・デスクワークで縮んだ胸筋を解放するっちゃ！" },
  "前屈ストレッチ": { points: ["足を肩幅に開いてまっすぐ立つっちゃ","膝を軽く曲げてもOKだっちゃ","ゆっくり上体を前に倒すっちゃ","手を床に向かって自然に下ろすっちゃ","20〜30秒キープ、反動をつけないっちゃ"], tip: "腰と太もも裏が伸びるっちゃ！無理に深く曲げなくていいっちゃ" },
  "股関節ストレッチ": { points: ["床に座って両足の裏をくっつけるっちゃ（バタフライポーズ）","かかとを股の近くに引き寄せるっちゃ","両膝を床に向かってゆっくり押し下げるっちゃ","上体を少し前に傾けると更に伸びるっちゃ","30秒キープするっちゃ"], tip: "股関節の柔軟性アップに最強のポーズだっちゃ！" },
  "太もも前ストレッチ": { points: ["片足で立って（壁に手をついてもいいっちゃ）","片方の足首を手でつかんで後ろに引くっちゃ","膝を閉じて太ももの前側が伸びるのを感じるっちゃ","上体が前に倒れないよう注意するっちゃ","20〜30秒キープして反対も同じようにやるっちゃ"], tip: "スクワットやランジの後に特に効果的だっちゃ！" },
  "ふくらはぎストレッチ": { points: ["壁に手をつきランジの姿勢になるっちゃ","後ろ足のかかとを床にしっかりつけるっちゃ","後ろ足のふくらはぎが伸びるのを感じるっちゃ","膝は伸ばしたままキープするっちゃ","20〜30秒したら反対側もやるっちゃ"], tip: "むくみ改善にもなるっちゃ！" },
  "寝ながら腰ストレッチ": { points: ["仰向けに寝て両膝を曲げるっちゃ","両膝を揃えたまま左右どちらかにゆっくり倒すっちゃ","肩は床から離さないようにするっちゃ","腰がじんわり伸びるのを感じるっちゃ","20秒キープして逆側もやるっちゃ"], tip: "腰痛予防に最高だっちゃ！寝る前にもおすすめっちゃ" },
  "腹式呼吸": { points: ["楽な姿勢で座るか仰向けに寝るっちゃ","お腹に手を当てるっちゃ","鼻からゆっくり息を吸ってお腹を膨らませるっちゃ（4秒）","口からゆっくり息を吐いてお腹をへこませるっちゃ（6秒）","これを繰り返すっちゃ"], tip: "体幹のインナーマッスルにも効くっちゃ！副交感神経も整うっちゃ" },
  // EASY
  "壁腕立て": { points: ["壁から1歩離れて壁に手をつくっちゃ","手は肩幅に広げるっちゃ","体をまっすぐにしたまま壁に近づくっちゃ","胸が壁に近づいたら腕を伸ばして戻るっちゃ","ゆっくり10回やるっちゃ"], tip: "疲れてる日は壁腕立てでも上半身に効くっちゃ！" },
  "椅子スクワット": { points: ["椅子の前に立つっちゃ","ゆっくりお尻を椅子に下ろすように腰を曲げるっちゃ","お尻が椅子につく直前で止めて立ち上がるっちゃ","腕を前に伸ばすとバランスが取りやすいっちゃ","10回繰り返すっちゃ"], tip: "膝が痛い人や疲れてる日にぴったりだっちゃ！" },
  "肩甲骨寄せ": { points: ["背筋を伸ばして座るかまっすぐ立つっちゃ","両腕を横に少し広げるっちゃ","肘を曲げて両方の肩甲骨をギュッと寄せるっちゃ","3秒キープするっちゃ","ゆっくり戻して繰り返すっちゃ"], tip: "デスクワーク後の肩こりに超効くっちゃ！" },
};

// ─────────────────────────────────────────────
// WARM-UP & COOL-DOWN templates
// ─────────────────────────────────────────────
const WARMUP_LOWER = [
  { name: "その場足踏み", reps: "30秒", duration: 35, rest: 5 },
  { name: "股関節回し", reps: "左右10回", duration: 30, rest: 5 },
  { name: "膝まわし", reps: "左右10回", duration: 30, rest: 5 },
];
const WARMUP_UPPER = [
  { name: "その場足踏み", reps: "30秒", duration: 35, rest: 5 },
  { name: "腕まわし", reps: "前後10回", duration: 30, rest: 5 },
  { name: "肩まわし", reps: "前後10回", duration: 30, rest: 5 },
];
const WARMUP_CORE = [
  { name: "その場足踏み", reps: "30秒", duration: 35, rest: 5 },
  { name: "体側伸ばし", reps: "左右10回", duration: 30, rest: 5 },
  { name: "股関節回し", reps: "左右10回", duration: 30, rest: 5 },
];
const COOLDOWN_LOWER = [
  { name: "前屈ストレッチ", reps: "20秒", duration: 25, rest: 5 },
  { name: "太もも前ストレッチ", reps: "左右20秒", duration: 45, rest: 5 },
  { name: "ふくらはぎストレッチ", reps: "左右20秒", duration: 45, rest: 5 },
  { name: "股関節ストレッチ", reps: "30秒", duration: 35, rest: 5 },
];
const COOLDOWN_UPPER = [
  { name: "肩甲骨ストレッチ", reps: "左右20秒", duration: 45, rest: 5 },
  { name: "胸を開くストレッチ", reps: "20秒", duration: 25, rest: 5 },
  { name: "首の横伸ばし", reps: "左右20秒", duration: 45, rest: 5 },
];
const COOLDOWN_CORE = [
  { name: "寝ながら腰ストレッチ", reps: "左右20秒", duration: 45, rest: 5 },
  { name: "前屈ストレッチ", reps: "20秒", duration: 25, rest: 5 },
  { name: "腹式呼吸", reps: "5回", duration: 40, rest: 5 },
];

// ─────────────────────────────────────────────
// WEEKLY ROTATION  — 4 weeks, progressive
// Week A: 基礎 (2sets × 標準回数)
// Week B: 種目変化 (2sets × 少し増)
// Week C: 強度UP (2sets × さらに増 + 難種目)
// Week D: 最高強度 (3sets or ハード種目)
// ─────────────────────────────────────────────
const WEEK_ROTATIONS = [
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
        { name: "パイク腕立て", reps: "8回", duration: 40, rest: 20 },
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
        { name: "パイク腕立て", reps: "10回", duration: 45, rest: 20 },
        { name: "トライセプスディップス", reps: "10回", duration: 40, rest: 20 },
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
        { name: "トライセプスディップス", reps: "12回", duration: 45, rest: 20 },
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
        { name: "パイク腕立て", reps: "12回", duration: 50, rest: 25 },
      ]},
    day3: { label: "Day 3", theme: "体幹D", emoji: "🔥", color: "#FFD93D", warmup: WARMUP_CORE, cooldown: COOLDOWN_CORE,
      exercises: [
        { name: "マウンテンクライマー", reps: "30秒", duration: 35, rest: 25 },
        { name: "デッドバグ", reps: "15回（左右）", duration: 60, rest: 25 },
        { name: "リバースクランチ", reps: "15回", duration: 50, rest: 25 },
      ]},
  },
];

const EASY_DAY = {
  label: "5分メニュー", theme: "疲れた日", emoji: "😴", color: "#82E0AA", sets: 1,
  warmup: [], cooldown: [{ name: "腹式呼吸", reps: "5回", duration: 40, rest: 0 }],
  exercises: [
    { name: "その場足踏み", reps: "30秒", duration: 35, rest: 10 },
    { name: "スクワット", reps: "10回", duration: 40, rest: 10 },
    { name: "壁腕立て", reps: "10回", duration: 40, rest: 10 },
    { name: "肩甲骨寄せ", reps: "15回", duration: 35, rest: 10 },
  ],
};

// 今週をWeek A(0)の基準にする — 2025年1月6日(月)を起点に4週サイクル
function getWeekIndex() {
  const start = new Date(2026, 3, 7); // 2026年4月7日(月)を Week A 起点
  const diffDays = Math.floor((new Date() - start) / (24 * 3600 * 1000));
  return ((Math.floor(diffDays / 7) % 4) + 4) % 4;
}

function buildSchedule(dayKey) {
  const wi = getWeekIndex();
  const weekData = WEEK_ROTATIONS[wi];
  const day = dayKey === "easy" ? EASY_DAY : { ...weekData[dayKey], sets: weekData.sets };
  const { exercises, warmup, cooldown, sets } = day;
  const steps = [];

  // WARM-UP
  if (warmup && warmup.length > 0) {
    steps.push({ type: "countdown", label: "🔥 ウォームアップ", duration: 3, color: "#F0A500" });
    warmup.forEach(ex => {
      steps.push({ type: "warmup", name: ex.name, reps: ex.reps, duration: ex.duration, rest: ex.rest });
      if (ex.rest > 0) steps.push({ type: "rest", duration: ex.rest, label: "次の準備", nextName: null, mini: true });
    });
  }

  // MAIN WORK
  steps.push({ type: "countdown", label: "💪 メインワークアウト", duration: 3, color: day.color || "#4ECDC4" });
  for (let set = 1; set <= sets; set++) {
    exercises.forEach((ex, i) => {
      steps.push({ type: "work", set, sets, name: ex.name, reps: ex.reps, duration: ex.duration });
      const isLastInSet = i === exercises.length - 1;
      const isLastSet = set === sets;
      if (!isLastSet || !isLastInSet) {
        const nextEx = isLastInSet ? exercises[0] : exercises[i + 1];
        steps.push({
          type: "rest",
          duration: isLastInSet ? 30 : ex.rest,
          label: isLastInSet ? `セット${set}完了！あと${sets - set}セットだっちゃ` : "休憩",
          nextName: nextEx?.name,
        });
      }
    });
  }

  // COOL-DOWN
  if (cooldown && cooldown.length > 0) {
    steps.push({ type: "countdown", label: "🧊 クールダウン", duration: 3, color: "#5DADE2" });
    cooldown.forEach((ex, i) => {
      steps.push({ type: "cooldown", name: ex.name, reps: ex.reps, duration: ex.duration });
      if (i < cooldown.length - 1) steps.push({ type: "rest", duration: ex.rest || 5, label: "次のストレッチ", nextName: cooldown[i+1]?.name, mini: true });
    });
  }

  steps.push({ type: "done", duration: 0 });
  return steps;
}

const RAM_MSG = {
  warmup: ["体を温めるっちゃ！", "ゆっくり動かすっちゃ！", "関節をほぐすっちゃ！"],
  work: ["いけっちゃ！", "ファイトだっちゃ！", "その調子だっちゃ！", "集中だっちゃ！", "もう少しだっちゃ！"],
  cooldown: ["お疲れさま！伸ばすっちゃ〜", "ゆっくり深呼吸しながらだっちゃ", "回復タイムだっちゃ！"],
  rest: ["よく頑張っただっちゃ！", "息整えてだっちゃ〜", "次の準備するっちゃ！"],
  section: ["次のフェーズだっちゃ！", "切り替えるっちゃ！"],
  intro: ["フォーム確認するっちゃ！", "これ大事だっちゃ！"],
  done: ["やったっちゃ！最高だっちゃ！"],
};
function getRamMsg(type) {
  const arr = RAM_MSG[type] || RAM_MSG.work;
  return arr[Math.floor(Math.random() * arr.length)];
}
function formatDate(iso) {
  const d = new Date(iso);
  return `${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}
const STORAGE_KEY = "ram_workout_v4";
function loadHistory() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch (e) { return []; } }
function saveHistory(h) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(h.slice(-60))); } catch (e) { /* ignore */ } }

// ── Phase colors ──
function phaseColor(step, dayColor) {
  if (!step) return dayColor;
  if (step.type === "warmup") return "#F0A500";
  if (step.type === "cooldown") return "#5DADE2";
  if (step.type === "countdown") return step.color;
  if (step.type === "rest" && step.mini) return "rgba(255,255,255,0.5)";
  if (step.type === "rest") return "#a29bfe";
  return dayColor;
}
function phaseBadgeLabel(step) {
  if (!step) return "";
  if (step.type === "countdown") return step.label;
  if (step.type === "warmup") return "🔥 ウォームアップ";
  if (step.type === "cooldown") return "🧊 クールダウン";
  if (step.type === "work") return `セット${step.set} / ${step.sets}`;
  if (step.type === "rest") return step.mini ? "→ 次へ" : "💨 休憩";
  if (step.type === "done") return "🎉 完了！";
  return "";
}

// ─── Sound ───
let _audioCtx = null;
function getAudioCtx() {
  if (!_audioCtx) {
    _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (_audioCtx.state === "suspended") {
    _audioCtx.resume();
  }
  return _audioCtx;
}
function playBeep(type = "tick") {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    const beep = (freq, startTime, duration, volume = 0.25) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = freq;
      g.gain.setValueAtTime(volume, startTime);
      g.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      o.start(startTime); o.stop(startTime + duration);
    };
    if (type === "start") {
      beep(880, now, 0.1, 0.3);
      beep(1100, now + 0.1, 0.2, 0.3);
    } else if (type === "done") {
      [523, 659, 784, 1047].forEach((f, i) => beep(f, now + i * 0.12, 0.3));
    } else if (type === "last3") {
      beep(440, now, 0.1, 0.15);
    }
  } catch (e) { /* audio not supported */ }
}
// iOS用: 最初のタップでAudioContextをunlockする
function unlockAudio() {
  try { getAudioCtx(); } catch (e) { /* ignore */ }
}

// ─── Speech ───
let _selectedVoice = null;

function speak(text, voice) {
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

function stepSpeech(ns) {
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
    else speak("メインワークアウト、スタート！");
  }
}

// ─── Voice Selector Modal ───
function VoiceSelector({ onClose }) {
  const [voices, setVoices] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const load = () => {
      const all = window.speechSynthesis.getVoices();
      const ja = all.filter(v => v.lang.startsWith("ja"));
      setVoices(ja.length > 0 ? ja : all.slice(0, 12));
      setSelected(_selectedVoice?.name || null);
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  const handleSelect = (v) => {
    _selectedVoice = v;
    setSelected(v.name);
    speak(`こんにちは！私が読み上げを担当するっちゃ！`, v);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "linear-gradient(160deg, #1a1740 0%, #2d2b55 100%)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "24px 24px 0 0", padding: "24px 20px 40px", width: "100%", maxWidth: 440, maxHeight: "70vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontWeight: 900, fontSize: 16 }}>🎙️ 声を選ぶっちゃ！</div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 10, padding: "6px 14px", color: "#fff", fontFamily: "inherit", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>とじる</button>
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 12 }}>選ぶとテスト再生するっちゃ！</div>
        {voices.length === 0 && (
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, padding: "20px 0", textAlign: "center" }}>
            音声が見つからないっちゃ…<br />ブラウザの設定を確認してだっちゃ
          </div>
        )}
        {voices.map((v, i) => (
          <div key={i} onClick={() => handleSelect(v)} style={{ background: selected === v.name ? "rgba(255,211,61,0.15)" : "rgba(255,255,255,0.05)", border: `1px solid ${selected === v.name ? "#FFD93D" : "rgba(255,255,255,0.08)"}`, borderRadius: 12, padding: "11px 14px", marginBottom: 7, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: selected === v.name ? "#FFD93D" : "#fff" }}>{v.name}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{v.lang} {v.localService ? "・ローカル" : "・オンライン"}</div>
            </div>
            {selected === v.name && <div style={{ fontSize: 16 }}>✓</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Exercise Guide Popup ───
function GuidePopup({ name, color, onClose }) {
  const g = EXERCISE_GUIDE[name];
  if (!g) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div style={{ background: "linear-gradient(160deg, #1a1740 0%, #2d2b55 100%)", border: `1px solid ${color}44`, borderRadius: 24, padding: "22px 20px", maxWidth: 380, width: "100%", maxHeight: "80vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontWeight: 900, fontSize: 16, color }}>{name}</div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8, padding: "5px 12px", color: "#fff", fontFamily: "inherit", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>とじる</button>
        </div>
        {g.points.map((p, i) => (
          <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
            <div style={{ minWidth: 22, height: 22, borderRadius: "50%", background: color, color: "#000", fontWeight: 900, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{i+1}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 1.6 }}>{p}</div>
          </div>
        ))}
        <div style={{ background: `${color}20`, borderRadius: 10, padding: "9px 12px", fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 10, lineHeight: 1.5 }}>💡 {g.tip}</div>
      </div>
    </div>
  );
}

// ── Guide Card ──
function GuideCard({ name, color }) {
  const g = EXERCISE_GUIDE[name];
  if (!g) return null;
  return (
    <div style={{ background: `${color}18`, border: `1px solid ${color}44`, borderRadius: 14, padding: "12px 14px", marginBottom: 10, textAlign: "left" }}>
      <div style={{ fontWeight: 900, fontSize: 13, marginBottom: 7, color }}>📖 やり方だっちゃ！</div>
      {g.points.map((p, i) => (
        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 5, alignItems: "flex-start" }}>
          <div style={{ minWidth: 20, height: 20, borderRadius: "50%", background: color, color: "#000", fontWeight: 900, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{i+1}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", lineHeight: 1.5 }}>{p}</div>
        </div>
      ))}
      <div style={{ background: `${color}20`, borderRadius: 8, padding: "7px 10px", fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 7, lineHeight: 1.5 }}>💡 {g.tip}</div>
    </div>
  );
}

// ── Health Guide ──
function HealthGuide({ dayKey, onClose }) {
  const wi = getWeekIndex();
  const weekData = WEEK_ROTATIONS[wi];
  const day = dayKey === "easy" ? EASY_DAY : weekData[dayKey];
  const color = day.color || "#82E0AA";
  const steps = ["iPhoneの「ヘルスケア」アプリを開くっちゃ","右下「ブラウズ」→「アクティビティ」→「ワークアウト」をタップだっちゃ","右上の「＋」ボタンを押すっちゃ！","「機能的筋力トレーニング」を選ぶっちゃ","時間を入力して日時を今日に合わせるっちゃ","「追加」を押したら完了だっちゃ！"];
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "linear-gradient(160deg, #1a1740 0%, #2d2b55 100%)", border: `1px solid ${color}44`, borderRadius: 28, padding: "28px 24px", maxWidth: 380, width: "100%", boxShadow: `0 0 60px ${color}22` }}>
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <div style={{ fontSize: 34, marginBottom: 6 }}>📱</div>
          <div style={{ fontWeight: 900, fontSize: 17 }}>ヘルスケアに記録するっちゃ！</div>
        </div>
        {steps.map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "9px 12px", marginBottom: 7 }}>
            <div style={{ minWidth: 22, height: 22, borderRadius: "50%", background: color, color: "#000", fontWeight: 900, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i+1}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", lineHeight: 1.5 }}>{s}</div>
          </div>
        ))}
        <div style={{ background: `${color}18`, border: `1px solid ${color}44`, borderRadius: 10, padding: "9px 12px", fontSize: 11, color: "rgba(255,255,255,0.6)", margin: "10px 0 14px", lineHeight: 1.6 }}>💡 Apple Watchがあれば「ワークアウト」アプリで直接記録できるっちゃ！</div>
        <button onClick={onClose} style={{ width: "100%", background: `linear-gradient(135deg, ${color}, ${color}99)`, border: "none", borderRadius: 12, padding: "13px", color: "#000", fontWeight: 900, fontSize: 14, fontFamily: "inherit", cursor: "pointer" }}>わかっただっちゃ！✓</button>
      </div>
    </div>
  );
}

// ── History Panel ──
function HistoryPanel({ history, onClose, onDelete }) {
  const wi = getWeekIndex();
  const weekData = WEEK_ROTATIONS[wi];
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div style={{ background: "linear-gradient(160deg, #1a1740 0%, #2d2b55 100%)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "28px 28px 0 0", padding: "24px 20px 40px", width: "100%", maxWidth: 440, maxHeight: "75vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ fontWeight: 900, fontSize: 16 }}>📋 きろく一覧だっちゃ！</div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 10, padding: "6px 14px", color: "#fff", fontFamily: "inherit", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>とじる</button>
        </div>
        {history.length === 0 ? (
          <div style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", padding: "40px 0", fontSize: 13 }}>まだ記録がないっちゃ…<br />最初の1回を頑張るっちゃ！💪</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {[...history].reverse().map((r, i) => {
              const d = r.dayKey === "easy" ? EASY_DAY : (weekData[r.dayKey] || EASY_DAY);
              return (
                <div key={i} style={{ background: `${d.color}14`, border: `1px solid ${d.color}33`, borderRadius: 14, padding: "11px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{d.emoji} {d.label} {d.theme}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 3 }}>{formatDate(r.date)}　⏱ {r.mins}分　{r.week || ""}</div>
                  </div>
                  <button onClick={() => onDelete(history.length - 1 - i)} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 8, padding: "4px 10px", color: "rgba(255,255,255,0.4)", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>削除</button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────
export default function WorkoutTimer() {
  const [selectedDay, setSelectedDay] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const [ramMsg, setRamMsg] = useState("どのメニューにするっちゃ？");
  const [showGuide, setShowGuide] = useState(false);
  const [showHealthGuide, setShowHealthGuide] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState(loadHistory);
  const [guidePopup, setGuidePopup] = useState(null);
  const [openGuideIdx, setOpenGuideIdx] = useState(null);
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const prevTimeRef = useRef(null);

  const wi = getWeekIndex();
  const weekData = WEEK_ROTATIONS[wi];
  const currentStep = schedule[stepIdx] || null;

  const getDayInfo = useCallback((key) => {
    if (key === "easy") return EASY_DAY;
    return { ...weekData[key], sets: weekData.sets };
  }, [weekData]);

  const dayInfo = selectedDay ? getDayInfo(selectedDay) : null;

  const handleFinish = useCallback((dayKey) => {
    const elapsed = startTimeRef.current ? Math.round((Date.now() - startTimeRef.current) / 60000) : 10;
    const entry = { dayKey, date: new Date().toISOString(), mins: Math.max(1, elapsed), week: weekData.label };
    const newH = [...loadHistory(), entry];
    saveHistory(newH); setHistory(newH);
    setRamMsg("やったっちゃ！記録したっちゃ🎉");
  }, [weekData]);

  const startDay = useCallback((dayKey) => {
    const s = buildSchedule(dayKey);
    setSchedule(s); setSelectedDay(dayKey);
    setStepIdx(0); setTimeLeft(s[0].duration);
    setRunning(false);
    setShowGuide(["warmup","cooldown"].includes(s[0].type));
    setRamMsg("準備できたらスタートだっちゃ！");
    startTimeRef.current = null;
  }, []);

  const tick = useCallback(() => {
    setTimeLeft(t => {
      if (t <= 1) {
        playBeep("start");
        setStepIdx(idx => {
          const next = idx + 1;
          if (next < schedule.length) {
            const ns = schedule[next];
            setTimeLeft(ns.duration || 0);
            prevTimeRef.current = ns.duration || 0;
            setRamMsg(getRamMsg(ns.type));
            if (["warmup","cooldown","work"].includes(ns.type)) setShowGuide(true);
            else if (ns.type === "rest" || ns.type === "countdown") setShowGuide(false);
            if (ns.type === "done") { setRunning(false); handleFinish(selectedDay); playBeep("done"); }
            stepSpeech(ns);
          } else setRunning(false);
          return next;
        });
        return 0;
      }
      // 残り10秒アナウンス
      if (t === 11) speak("あと10秒！");
      // 残り3秒カウントダウン（電子音）
      if (t === 4) playBeep("last3");
      if (t === 3) playBeep("last3");
      if (t === 2) playBeep("last3");
      return t - 1;
    });
  }, [schedule, selectedDay, handleFinish]);

  const skipToNext = useCallback(() => {
    setStepIdx(idx => {
      const next = idx + 1;
      if (next < schedule.length) {
        const ns = schedule[next];
        setTimeLeft(ns.duration || 0);
        prevTimeRef.current = ns.duration || 0;
        setRamMsg(getRamMsg(ns.type));
        if (["warmup","cooldown","work"].includes(ns.type)) setShowGuide(true);
        else if (ns.type === "rest" || ns.type === "countdown") setShowGuide(false);
        if (ns.type === "done") { setRunning(false); handleFinish(selectedDay); playBeep("done"); }
        playBeep("start");
        stepSpeech(ns);
      } else setRunning(false);
      return next;
    });
  }, [schedule, selectedDay, handleFinish]);

  useEffect(() => {
    if (running) intervalRef.current = setInterval(tick, 1000);
    else clearInterval(intervalRef.current);
    return () => clearInterval(intervalRef.current);
  }, [running, tick]);

  const handleStartPause = () => {
    if (currentStep?.type === "done") return;
    unlockAudio();
    if (!running) {
      const isFirstStart = !startTimeRef.current;
      if (isFirstStart) startTimeRef.current = Date.now();
      setRamMsg(getRamMsg(currentStep?.type || "work"));
      if (["warmup","cooldown","work"].includes(currentStep?.type)) setShowGuide(true);
      else if (currentStep?.type === "rest" || currentStep?.type === "countdown") setShowGuide(false);
      playBeep("start");
      // 一時停止からの再開時は読み上げない、初回スタート時だけ
      if (isFirstStart) stepSpeech(currentStep);
    }
    setRunning(r => !r);
  };
  const handleReset = () => { if (selectedDay) startDay(selectedDay); };
  const handleDeleteHistory = (idx) => {
    const newH = history.filter((_, i) => i !== idx);
    saveHistory(newH); setHistory(newH);
  };

  const activeColor = phaseColor(currentStep, dayInfo?.color || "#4ECDC4");
  const progress = currentStep && currentStep.duration > 0
    ? ((currentStep.duration - timeLeft) / currentStep.duration) * 100
    : currentStep?.type === "done" ? 100 : 0;
  const workSteps = schedule.filter(s => s.type === "work");
  const completedWork = workSteps.filter(s => schedule.indexOf(s) < stepIdx).length;
  const totalWork = workSteps.length;

  // Warmup / cooldown progress counters
  const warmupSteps = schedule.filter(s => s.type === "warmup");
  const cooldownSteps = schedule.filter(s => s.type === "cooldown");
  const warmupCurrent = currentStep?.type === "warmup"
    ? warmupSteps.findIndex(s => schedule.indexOf(s) === stepIdx) + 1 : 0;
  const cooldownCurrent = currentStep?.type === "cooldown"
    ? cooldownSteps.findIndex(s => schedule.indexOf(s) === stepIdx) + 1 : 0;

  const weekCount = (() => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);
    return history.filter(h => new Date(h.date) >= weekAgo).length;
  })();

  const DAY_KEYS = ["day1", "day2", "day3", "easy"];

  // Determine current phase label for display
  const currentPhase = currentStep?.type === "warmup" || (currentStep?.type === "countdown" && currentStep?.label?.includes("ウォーム")) ? "warmup"
    : currentStep?.type === "cooldown" || (currentStep?.type === "countdown" && currentStep?.label?.includes("クール")) ? "cooldown"
    : "main";

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)", fontFamily: "'Zen Kaku Gothic New', 'Noto Sans JP', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 14px 48px", color: "#fff" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Zen+Kaku+Gothic+New:wght@400;700;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .btn { transition: all 0.18s; cursor: pointer; border: none; }
        .btn:hover { filter: brightness(1.1); transform: scale(1.03); }
        .btn:active { transform: scale(0.96); }
        @keyframes ram-bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        @keyframes shine { 0% { left: -80%; } 100% { left: 110%; } }
        @keyframes pop-in { 0% { transform: scale(0.92); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes slide-down { 0% { transform: translateY(-8px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
        .progress-bar-shine::after { content: ''; position: absolute; top: 0; left: -80%; width: 60%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent); animation: shine 1.6s infinite; }
        .pop-in { animation: pop-in 0.28s ease both; }
        .slide-down { animation: slide-down 0.22s ease both; }
      `}</style>

      {/* Header */}
      <div style={{ width: "100%", maxWidth: 390, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div>
          <h1 style={{ fontSize: 19, fontWeight: 900, letterSpacing: 1 }}>
            <span style={{ animation: "ram-bounce 2s ease-in-out infinite", display: "inline-block", marginRight: 6 }}>🌟</span>
            ラムの筋トレ
          </h1>
          <div style={{ display: "flex", gap: 6, marginTop: 3, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>週3日・1日10分</span>
            <span style={{ fontSize: 10, background: `${["#FF6B6B","#4ECDC4","#FFD93D","#a29bfe"][wi]}33`, border: `1px solid ${["#FF6B6B","#4ECDC4","#FFD93D","#a29bfe"][wi]}66`, borderRadius: 99, padding: "1px 8px", color: ["#FF6B6B","#4ECDC4","#FFD93D","#a29bfe"][wi], fontWeight: 700 }}>
              {weekData.label} {weekData.sublabel}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button className="btn" onClick={() => setShowVoiceSelector(true)} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, padding: "8px 12px", color: "#fff", fontFamily: "inherit", fontWeight: 700, fontSize: 11 }}>
            🎙️ 声
          </button>
          <button className="btn" onClick={() => setShowHistory(true)} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, padding: "8px 12px", color: "#fff", fontFamily: "inherit", fontWeight: 700, fontSize: 11, position: "relative" }}>
            📋 きろく
            {history.length > 0 && <span style={{ position: "absolute", top: -6, right: -6, background: "#FF6B6B", color: "#fff", borderRadius: "50%", width: 17, height: 17, fontSize: 9, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>{Math.min(history.length,99)}</span>}
          </button>
        </div>
      </div>

      {/* Streak */}
      <div style={{ width: "100%", maxWidth: 390, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "9px 14px", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>今週のワークアウト</div>
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ width: 26, height: 26, borderRadius: "50%", background: i < weekCount ? "#FFD93D" : "rgba(255,255,255,0.1)", border: `2px solid ${i < weekCount ? "#FFD93D" : "rgba(255,255,255,0.15)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>{i < weekCount ? "⭐" : ""}</div>
          ))}
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginLeft: 3 }}>{weekCount}/3</span>
        </div>
      </div>

      {/* RAM bubble */}
      <div style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 16, padding: "9px 18px", marginBottom: 14, fontSize: 14, fontWeight: 700, color: "#FFD93D", backdropFilter: "blur(8px)", maxWidth: 390, width: "100%", textAlign: "center" }}>
        {ramMsg}
      </div>

      {/* Day selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap", justifyContent: "center", width: "100%", maxWidth: 390 }}>
        {DAY_KEYS.map(key => {
          const info = getDayInfo(key);
          const sel = selectedDay === key;
          return (
            <button key={key} className="btn" onClick={() => startDay(key)} style={{ background: sel ? `linear-gradient(135deg, ${info.color}, ${info.color}99)` : "rgba(255,255,255,0.08)", border: sel ? `2px solid ${info.color}` : "2px solid rgba(255,255,255,0.15)", borderRadius: 14, padding: "8px 14px", color: sel ? "#000" : "#fff", fontFamily: "inherit", fontWeight: 700, fontSize: 12, lineHeight: 1.6 }}>
              <span style={{ fontSize: 18 }}>{info.emoji}</span><br />
              <span style={{ fontSize: 11 }}>{info.label}</span><br />
              <span style={{ fontSize: 10, opacity: 0.7 }}>{info.theme}</span>
            </button>
          );
        })}
      </div>

      {/* Timer card */}
      {selectedDay && currentStep && (
        <div className="pop-in" style={{ width: "100%", maxWidth: 390, background: "rgba(255,255,255,0.06)", border: `1px solid ${activeColor}44`, borderRadius: 26, padding: "22px 18px", backdropFilter: "blur(12px)", marginBottom: 12, textAlign: "center", transition: "border-color 0.4s" }}>

          {/* Phase bar */}
          <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 12 }}>
            {[["warmup","🔥 ウォーム","#F0A500"], ["main","💪 メイン", dayInfo?.color || "#4ECDC4"], ["cooldown","🧊 クール","#5DADE2"]].map(([p, label, col]) => (
              <div key={p} style={{ fontSize: 10, padding: "3px 10px", borderRadius: 99, background: currentPhase === p ? `${col}33` : "rgba(255,255,255,0.06)", border: `1px solid ${currentPhase === p ? col : "rgba(255,255,255,0.1)"}`, color: currentPhase === p ? col : "rgba(255,255,255,0.35)", fontWeight: 700 }}>{label}</div>
            ))}
          </div>

          {/* Badge */}
          <div style={{ display: "inline-block", background: `${activeColor}28`, border: `1px solid ${activeColor}88`, borderRadius: 999, padding: "3px 14px", fontSize: 11, fontWeight: 700, marginBottom: 10, color: activeColor }}>
            {phaseBadgeLabel(currentStep)}
            {currentStep.type === "warmup" && warmupCurrent > 0 && ` ${warmupCurrent}/${warmupSteps.length}`}
            {currentStep.type === "cooldown" && cooldownCurrent > 0 && ` ${cooldownCurrent}/${cooldownSteps.length}`}
          </div>

          {/* Step name */}
          <div style={{ fontSize: currentStep.type === "countdown" ? 18 : 22, fontWeight: 900, marginBottom: 4 }}>
            {["work","warmup","cooldown"].includes(currentStep.type) ? currentStep.name
              : currentStep.type === "done" ? "お疲れさまだっちゃ！"
              : currentStep.type === "countdown" ? currentStep.label
              : currentStep.label || "休憩"}
          </div>
          {(currentStep.type === "work" || currentStep.type === "warmup" || currentStep.type === "cooldown") && (
            <div style={{ fontSize: 13, color: activeColor, marginBottom: 8, fontWeight: 700 }}>目安: {currentStep.reps}</div>
          )}
          {currentStep.type === "rest" && currentStep.nextName && (
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 8 }}>次: {currentStep.nextName}</div>
          )}

          {/* Guide toggle — 全種目常に表示、閉じるボタンあり */}
          {/* Guide card */}
          {["work","warmup","cooldown"].includes(currentStep.type) && (
            <div className="slide-down">
              <GuideCard name={currentStep.name} color={activeColor} />
              <button className="btn" onClick={() => setShowGuide(g => !g)} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 9, padding: "4px 12px", color: "rgba(255,255,255,0.45)", fontSize: 11, fontWeight: 700, fontFamily: "inherit", marginBottom: 6, display: showGuide ? "inline-block" : "none" }}>
                ▲ 閉じる
              </button>
              {!showGuide && (
                <button className="btn" onClick={() => setShowGuide(true)} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 9, padding: "4px 12px", color: "rgba(255,255,255,0.45)", fontSize: 11, fontWeight: 700, fontFamily: "inherit", marginBottom: 6 }}>
                  ▼ やり方を見るっちゃ
                </button>
              )}
            </div>
          )}

          {/* Circle timer */}
          <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", margin: "8px 0 12px" }}>
            <svg width="108" height="108" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
              <circle cx="60" cy="60" r="52" fill="none" stroke={activeColor} strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 52}`}
                strokeDashoffset={`${2 * Math.PI * 52 * (1 - progress / 100)}`}
                strokeLinecap="round" transform="rotate(-90 60 60)"
                style={{ transition: "stroke-dashoffset 0.9s linear, stroke 0.4s" }}
              />
            </svg>
            <div style={{ position: "absolute", fontSize: 32, fontWeight: 900 }}>
              {currentStep.type === "done" ? "✓" : timeLeft}
            </div>
          </div>

          {/* Overall progress */}
          <div style={{ height: 5, background: "rgba(255,255,255,0.08)", borderRadius: 99, overflow: "hidden", marginBottom: 5, position: "relative" }}>
            <div className="progress-bar-shine" style={{ height: "100%", width: `${totalWork > 0 ? (completedWork / totalWork) * 100 : 0}%`, background: `linear-gradient(90deg, ${dayInfo?.color || "#4ECDC4"}88, ${dayInfo?.color || "#4ECDC4"})`, borderRadius: 99, transition: "width 0.4s ease", position: "relative", overflow: "hidden" }} />
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 14 }}>メイン {completedWork}/{totalWork}種目完了</div>

          {/* Buttons */}
          {currentStep.type !== "done" ? (
            <div style={{ display: "flex", gap: 9, justifyContent: "center" }}>
              <button className="btn" onClick={handleStartPause} style={{ background: running ? "rgba(255,255,255,0.12)" : `linear-gradient(135deg, ${activeColor}, ${activeColor}bb)`, border: "none", borderRadius: 13, padding: "12px 28px", color: running ? "#fff" : "#000", fontSize: 15, fontWeight: 900, fontFamily: "inherit" }}>
                {running ? "⏸ 一時停止" : currentStep.type === "countdown" ? "▶ 次へ進むっちゃ" : "▶ スタート"}
              </button>
              {currentStep.type === "rest" && running && (
                <button className="btn" onClick={skipToNext} style={{ background: `${activeColor}33`, border: `1px solid ${activeColor}77`, borderRadius: 13, padding: "12px 14px", color: activeColor, fontSize: 13, fontWeight: 900, fontFamily: "inherit" }}>→ 次へ</button>
              )}
              <button className="btn" onClick={handleReset} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 13, padding: "12px 16px", color: "rgba(255,255,255,0.6)", fontSize: 15, fontWeight: 700, fontFamily: "inherit" }}>↺</button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              <button className="btn" onClick={() => setShowHealthGuide(true)} style={{ background: `linear-gradient(135deg, ${dayInfo?.color || "#4ECDC4"}, ${dayInfo?.color || "#4ECDC4"}bb)`, border: "none", borderRadius: 13, padding: "12px", color: "#000", fontSize: 14, fontWeight: 900, fontFamily: "inherit", width: "100%" }}>📱 ヘルスケアに記録するっちゃ！</button>
              <button className="btn" onClick={() => setShowHistory(true)} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 13, padding: "10px", color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: "inherit", width: "100%" }}>📋 きろくを見るっちゃ</button>
              <button className="btn" onClick={handleReset} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 13, padding: "9px", color: "rgba(255,255,255,0.45)", fontSize: 12, fontWeight: 700, fontFamily: "inherit", width: "100%" }}>↺ もう一度</button>
            </div>
          )}
        </div>
      )}

      {/* Step list — main exercises only */}
      {selectedDay && currentStep?.type !== "done" && dayInfo?.exercises && (
        <div style={{ width: "100%", maxWidth: 390 }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 7, letterSpacing: 1 }}>── メインメニュー（タップでやり方確認）──</div>
          {dayInfo.exercises.map((ex, i) => {
            const ws = schedule.filter(s => s.type === "work" && s.name === ex.name);
            const allDone = ws.length > 0 && ws.every(s => schedule.indexOf(s) < stepIdx);
            const isCurrent = currentStep?.type === "work" && currentStep.name === ex.name;
            const isOpen = openGuideIdx === i;
            const g = EXERCISE_GUIDE[ex.name];
            return (
              <div key={i} style={{ marginBottom: 6 }}>
                <div className="btn" onClick={() => setOpenGuideIdx(isOpen ? null : i)} style={{ background: isCurrent ? `${dayInfo.color}20` : allDone ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.05)", border: isCurrent ? `1px solid ${dayInfo.color}77` : isOpen ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(255,255,255,0.07)", borderRadius: isOpen ? "11px 11px 0 0" : 11, padding: "10px 13px", display: "flex", justifyContent: "space-between", alignItems: "center", opacity: allDone ? 0.38 : 1, cursor: "pointer" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{allDone ? "✓ " : isCurrent ? "▶ " : ""}{ex.name}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{ex.reps}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ fontSize: 10, color: isOpen ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.25)" }}>{isOpen ? "▲" : "▼"}</div>
                    <div style={{ fontSize: 11, color: isCurrent ? dayInfo.color : "rgba(255,255,255,0.3)", fontWeight: 700 }}>{ex.duration}秒</div>
                  </div>
                </div>
                {isOpen && g && (
                  <div style={{ background: `${dayInfo.color}0e`, border: `1px solid rgba(255,255,255,0.07)`, borderTop: "none", borderRadius: "0 0 11px 11px", padding: "12px 13px" }}>
                    {g.points.map((p, pi) => (
                      <div key={pi} style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "flex-start" }}>
                        <div style={{ minWidth: 18, height: 18, borderRadius: "50%", background: dayInfo.color, color: "#000", fontWeight: 900, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{pi+1}</div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>{p}</div>
                      </div>
                    ))}
                    <div style={{ background: `${dayInfo.color}18`, borderRadius: 8, padding: "7px 10px", fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 6, lineHeight: 1.5 }}>💡 {g.tip}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: 24, fontSize: 10, color: "rgba(255,255,255,0.15)", textAlign: "center" }}>ナイル川のほとりから ✦ ラム</div>

      {showHealthGuide && selectedDay && <HealthGuide dayKey={selectedDay} onClose={() => setShowHealthGuide(false)} />}
      {showHistory && <HistoryPanel history={history} onClose={() => setShowHistory(false)} onDelete={handleDeleteHistory} />}
      {showVoiceSelector && <VoiceSelector onClose={() => setShowVoiceSelector(false)} />}
    </div>
  );
}
