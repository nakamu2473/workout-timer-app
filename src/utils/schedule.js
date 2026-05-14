import { WEEK_ROTATIONS, EASY_DAY, MORNING_DAY, EVENING_DAY, STRETCHING_DAY, YOGA_DAY } from "../data/weekRotations.js";
import { STORAGE_KEY } from "./storage.js";

// 最初の記録日を起点に4週サイクル（記録なしは Week A）
export function getWeekIndex() {
  try {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (history.length === 0) return 0;
    const firstDate = new Date(
      history.map(h => h.date).sort()[0]
    );
    const diffDays = Math.floor((new Date() - firstDate) / (24 * 3600 * 1000));
    return ((Math.floor(diffDays / 7) % 4) + 4) % 4;
  } catch (e) {
    return 0;
  }
}

export function buildSchedule(dayKey, weekIdx) {
  const wi = weekIdx !== undefined ? weekIdx : getWeekIndex();
  const weekData = WEEK_ROTATIONS[wi];
  const day = dayKey === "easy"       ? EASY_DAY
    : dayKey === "morning"    ? MORNING_DAY
    : dayKey === "evening"    ? EVENING_DAY
    : dayKey === "stretching" ? STRETCHING_DAY
    : dayKey === "yoga"       ? YOGA_DAY
    : { ...weekData[dayKey], sets: weekData.sets };
  const { exercises, warmup, cooldown, sets } = day;
  const steps = [];

  // WARM-UP
  if (warmup && warmup.length > 0) {
    steps.push({ type: "countdown", label: "🔥 ウォームアップ", duration: 3, color: "#F0A500" });
    warmup.forEach((ex, i) => {
      steps.push({ type: "warmup", name: ex.name, reps: ex.reps, duration: ex.duration, rest: ex.rest });
      if (ex.rest > 0) steps.push({ type: "rest", duration: ex.rest, label: "次の準備", nextName: warmup[i + 1]?.name || null, mini: true });
    });
  }

  // MAIN WORK
  const isYoga = dayKey === "yoga";
  const mainLabel = day.mainLabel || "💪 メインワークアウト";
  if (!isYoga) {
    steps.push({ type: "countdown", label: mainLabel, duration: 3, color: day.color || "#4ECDC4" });
  }
  for (let set = 1; set <= sets; set++) {
    exercises.forEach((ex, i) => {
      steps.push({ type: "work", set, sets, name: ex.name, reps: ex.reps, duration: ex.duration, ...(ex.yogaScript && { yogaScript: true }) });
      const isLastInSet = i === exercises.length - 1;
      const isLastSet = set === sets;
      const restDuration = isLastInSet ? 30 : (ex.rest || 0);
      if ((!isLastSet || !isLastInSet) && restDuration > 0) {
        const nextEx = isLastInSet ? exercises[0] : exercises[i + 1];
        steps.push({
          type: "rest",
          duration: restDuration,
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

  steps.push({ type: "done", duration: 0, ...(isYoga && { yogaMode: true }) });
  return steps;
}
