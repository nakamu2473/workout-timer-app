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
    { name: "仰向けひねり", reps: "左右各20秒", duration: 45, rest: 5 },
    { name: "脚上げストレッチ", reps: "左右各20秒", duration: 45, rest: 5 },
    { name: "体側伸ばし（横向き）", reps: "左右各20秒", duration: 45, rest: 5 },
    { name: "腹式呼吸", reps: "5回", duration: 40, rest: 0 },
  ],
};
