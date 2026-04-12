import { WEEK_ROTATIONS, EASY_DAY, MORNING_DAY } from "../data/weekRotations.js";

// 2026年4月7日(月)を Week A 起点に4週サイクル
export function getWeekIndex() {
  const start = new Date(2026, 3, 7);
  const diffDays = Math.floor((new Date() - start) / (24 * 3600 * 1000));
  return ((Math.floor(diffDays / 7) % 4) + 4) % 4;
}

export function buildSchedule(dayKey) {
  const wi = getWeekIndex();
  const weekData = WEEK_ROTATIONS[wi];
  const day = dayKey === "easy" ? EASY_DAY
    : dayKey === "morning" ? MORNING_DAY
    : { ...weekData[dayKey], sets: weekData.sets };
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
  const mainLabel = day.mainLabel || "💪 メインワークアウト";
  steps.push({ type: "countdown", label: mainLabel, duration: 3, color: day.color || "#4ECDC4" });
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
