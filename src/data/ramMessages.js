export const RAM_MSG = {
  warmup: ["体を温めるっちゃ！", "ゆっくり動かすっちゃ！", "関節をほぐすっちゃ！"],
  work: ["いけっちゃ！", "ファイトだっちゃ！", "その調子だっちゃ！", "集中だっちゃ！", "もう少しだっちゃ！"],
  cooldown: ["お疲れさま！伸ばすっちゃ〜", "ゆっくり深呼吸しながらだっちゃ", "回復タイムだっちゃ！"],
  rest: ["よく頑張っただっちゃ！", "息整えてだっちゃ〜", "次の準備するっちゃ！"],
  section: ["次のフェーズだっちゃ！", "切り替えるっちゃ！"],
  intro: ["フォーム確認するっちゃ！", "これ大事だっちゃ！"],
  done: ["やったっちゃ！最高だっちゃ！"],
};

export function getRamMsg(type) {
  const arr = RAM_MSG[type] || RAM_MSG.work;
  return arr[Math.floor(Math.random() * arr.length)];
}
