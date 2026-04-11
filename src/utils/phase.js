export function phaseColor(step, dayColor) {
  if (!step) return dayColor;
  if (step.type === "warmup") return "#F0A500";
  if (step.type === "cooldown") return "#5DADE2";
  if (step.type === "countdown") return step.color;
  if (step.type === "rest" && step.mini) return "rgba(255,255,255,0.5)";
  if (step.type === "rest") return "#a29bfe";
  return dayColor;
}

export function phaseBadgeLabel(step) {
  if (!step) return "";
  if (step.type === "countdown") return step.label;
  if (step.type === "warmup") return "🔥 ウォームアップ";
  if (step.type === "cooldown") return "🧊 クールダウン";
  if (step.type === "work") return `セット${step.set} / ${step.sets}`;
  if (step.type === "rest") return step.mini ? "→ 次へ" : "💨 休憩";
  if (step.type === "done") return "🎉 完了！";
  return "";
}
