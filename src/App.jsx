import { useState, useEffect, useRef, useCallback } from "react";

import { EXERCISE_GUIDE } from "./data/exerciseGuide.js";
import { WEEK_ROTATIONS } from "./data/weekRotations.js";
import { getRamMsg } from "./data/ramMessages.js";

import { getWeekIndex, buildSchedule, getDayInfo as resolveDayInfo } from "./utils/schedule.js";
import { playBeep, unlockAudio } from "./utils/audio.js";
import { speak, stepSpeech, cueSpeech, cancelSpeech } from "./utils/speech.js";
import { loadHistory, saveHistory } from "./utils/storage.js";
import { requestWakeLock, releaseWakeLock } from "./utils/wakelock.js";
import { phaseColor, phaseBadgeLabel } from "./utils/phase.js";

import VoiceSelector from "./components/VoiceSelector.jsx";
import GuideCard from "./components/GuideCard.jsx";
import HealthGuide from "./components/HealthGuide.jsx";
import HistoryPanel from "./components/HistoryPanel.jsx";

const WEEK_MS = 7 * 24 * 3600 * 1000;
// モジュール読み込み時の時刻（レンダー中に Date.now() を呼ばないための基準値）
const INITIAL_NOW = Date.now();

// 手動で選んだ週を起点に、経過週ぶん自動で進めた現在の週インデックスを返す。
// 保存値が無い・壊れているときは記録履歴から算出する
function loadInitialWeekIdx() {
  try {
    const raw = localStorage.getItem("ram_week_idx");
    if (raw !== null) {
      const saved = Number(raw);
      if (Number.isInteger(saved) && saved >= 0 && saved <= 3) {
        const setAt = Date.parse(localStorage.getItem("ram_week_set_at") || "");
        const elapsed = Number.isNaN(setAt) ? 0 : Math.max(0, Math.floor((INITIAL_NOW - setAt) / WEEK_MS));
        return (saved + elapsed) % 4;
      }
    }
  } catch { /* ignore */ }
  return getWeekIndex();
}
const INITIAL_WEEK_IDX = loadInitialWeekIdx();

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
  const [openGuideIdx, setOpenGuideIdx] = useState(null);
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  // 週替わり筋トレ（day1〜3）はダンベル筋トレ移行に伴いアーカイブ（折りたたみ）に収納
  const [showArchive, setShowArchive] = useState(false);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const pauseStartRef = useRef(null);
  const pausedMsRef = useRef(0);
  const prevTimeRef = useRef(null);
  const timeLeftRef = useRef(0);
  const currentStepRef = useRef(null);

  const [weekIdx, setWeekIdx] = useState(INITIAL_WEEK_IDX);
  const wi = weekIdx;
  const weekData = WEEK_ROTATIONS[wi];

  const handleWeekChange = (delta) => {
    const newWi = ((weekIdx + delta) % 4 + 4) % 4;
    setWeekIdx(newWi);
    localStorage.setItem("ram_week_idx", String(newWi));
    // 選択日を起点に4週ローテーションを自動で進められるよう記録する
    localStorage.setItem("ram_week_set_at", new Date().toISOString());
    setSelectedDay(null);
    setSchedule([]);
    setRunning(false);
  };
  const currentStep = schedule[stepIdx] || null;

  const getDayInfo = useCallback((key) => resolveDayInfo(key, weekIdx), [weekIdx]);

  const dayInfo = selectedDay ? getDayInfo(selectedDay) : null;

  const handleFinish = useCallback((dayKey) => {
    // 一時停止していた時間は運動時間に含めない
    const activeMs = startTimeRef.current ? Date.now() - startTimeRef.current - pausedMsRef.current : 0;
    const elapsed = startTimeRef.current ? Math.round(activeMs / 60000) : 10;
    const entry = { dayKey, date: new Date().toISOString(), mins: Math.max(1, elapsed), week: weekData.label };
    const newH = [...loadHistory(), entry];
    saveHistory(newH); setHistory(newH);
    setRamMsg("やったっちゃ！記録したっちゃ🎉");
  }, [weekData]);

  const startDay = useCallback((dayKey) => {
    cancelSpeech();
    const s = buildSchedule(dayKey, weekIdx);
    setSchedule(s); setSelectedDay(dayKey);
    setStepIdx(0); setTimeLeft(s[0].duration);
    setRunning(false);
    setShowGuide(["warmup","cooldown"].includes(s[0].type));
    setRamMsg("準備できたらスタートだっちゃ！");
    startTimeRef.current = null;
    pauseStartRef.current = null;
    pausedMsRef.current = 0;
  }, [weekIdx]);

  const advanceToStep = useCallback((nextIdx, beepType) => {
    if (nextIdx < schedule.length) {
      const ns = schedule[nextIdx];
      setStepIdx(nextIdx);
      setTimeLeft(ns.duration || 0);
      prevTimeRef.current = ns.duration || 0;
      setRamMsg(getRamMsg(ns.type));
      if (["warmup","cooldown","work"].includes(ns.type)) setShowGuide(true);
      else if (ns.type === "rest" || ns.type === "countdown") setShowGuide(false);
      if (ns.type === "done") { setRunning(false); releaseWakeLock(); handleFinish(selectedDay); if (!ns.silent) playBeep("done"); }
      else if (!ns.silent) playBeep(beepType);
      stepSpeech(ns);
    } else {
      setRunning(false);
    }
  }, [schedule, selectedDay, handleFinish]);

  const pendingAdvanceRef = useRef(false);

  const tick = useCallback(() => {
    const t = timeLeftRef.current;
    const cs = currentStepRef.current;
    // やり方読み上げ中の休憩では「あと10秒」で遮らない（次種目の5秒前通知は残す）
    if (t === 11 && !cs?.silent && !(cs?.type === "rest" && cs?.guideSpeech)) speak("あと10秒！");
    if ((t === 3 || t === 2 || t === 1) && !cs?.silent) playBeep("last3");
    // 5秒前の次種目通知は、入りのアナウンスと重ならない長さの休憩だけ（短い休憩は入りで告知済み）
    if (t === 5 && cs?.type === "rest" && !cs?.mini && cs?.nextName && !cs?.silent && (cs.duration || 0) >= 10) speak(`次は${cs.nextName}！準備してだっちゃ！`);
    // 左右がある種目は中間地点で「左右交代」を読み上げる
    if (cs?.reps?.includes("左右") && !cs?.silent && cs.duration > 6 && t === Math.ceil((cs.duration || 0) / 2)) {
      speak("左右交代");
    }
    // 経過秒数に合わせた誘導ナレーション（寝たまんまヨガ）。at: 0 はステップ入りで読み上げ済み
    if (cs?.cues) cueSpeech(cs, (cs.duration || 0) - t + 1);
    setTimeLeft(prev => {
      if (prev <= 1) {
        pendingAdvanceRef.current = true;
        return 0;
      }
      return prev - 1;
    });
  }, []);

  // timeLeftRef / currentStepRef の同期 + ステップ遷移を毎レンダー後に処理
  useEffect(() => {
    timeLeftRef.current = timeLeft;
    currentStepRef.current = currentStep;
    if (pendingAdvanceRef.current) {
      pendingAdvanceRef.current = false;
      // tick(setInterval)からは最新のstepIdxが見えないため、レンダー後にここで遷移する設計
      // eslint-disable-next-line react-hooks/set-state-in-effect
      advanceToStep(stepIdx + 1, "start");
    }
  });

  const skipToNext = useCallback(() => {
    advanceToStep(stepIdx + 1, "start");
  }, [stepIdx, advanceToStep]);

  useEffect(() => {
    if (running) { intervalRef.current = setInterval(tick, 1000); requestWakeLock(); }
    else { clearInterval(intervalRef.current); releaseWakeLock(); }
    return () => clearInterval(intervalRef.current);
  }, [running, tick]);

  // 「今週」カウント用の現在時刻。レンダー中に Date.now() を呼ばず、1分ごとに更新する
  const [now, setNow] = useState(INITIAL_NOW);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);

  const handleStartPause = () => {
    if (currentStep?.type === "done") return;
    unlockAudio();
    if (!running) {
      const isFirstStart = !startTimeRef.current;
      if (isFirstStart) startTimeRef.current = Date.now();
      if (pauseStartRef.current) {
        pausedMsRef.current += Date.now() - pauseStartRef.current;
        pauseStartRef.current = null;
      }
      setRamMsg(getRamMsg(currentStep?.type || "work"));
      if (["warmup","cooldown","work"].includes(currentStep?.type)) setShowGuide(true);
      else if (currentStep?.type === "rest" || currentStep?.type === "countdown") setShowGuide(false);
      if (!currentStep?.silent) playBeep("start");
      // 一時停止からの再開時は読み上げない、初回スタート時だけ
      if (isFirstStart) stepSpeech(currentStep);
    } else {
      // 一時停止時は読み上げ中の音声（ヨガの長文ナレーション等）を止める
      cancelSpeech();
      pauseStartRef.current = Date.now();
    }
    setRunning(r => !r);
  };
  const handleReset = () => { if (selectedDay) startDay(selectedDay); };
  const handleDeleteHistory = (idx) => {
    const newH = history.filter((_, i) => i !== idx);
    saveHistory(newH); setHistory(newH);
  };

  const dayColor = dayInfo?.color || "#4ECDC4";
  const activeColor = phaseColor(currentStep, dayColor);
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

  // 「今週」は月曜0時起点の暦週で数える
  const weekStart = new Date(now);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + 6) % 7);
  const dumbbellCount = history.filter(h => new Date(h.date) >= weekStart && h.dayKey === "dumbbell").length;
  const stretchCount = history.filter(h => new Date(h.date) >= weekStart && h.dayKey === "morning").length;
  const taisoCount = history.filter(h => new Date(h.date) >= weekStart && h.dayKey === "taiso").length;
  const eveningCount = history.filter(h => new Date(h.date) >= weekStart && h.dayKey === "evening").length;
  const deepStretchCount = history.filter(h => new Date(h.date) >= weekStart && h.dayKey === "stretching").length;
  const yogaCount = history.filter(h => new Date(h.date) >= weekStart && h.dayKey === "yoga").length;

  const ACTIVE_DAY_KEYS = ["easy", "dumbbell", "morning", "taiso", "evening", "stretching", "yoga"];
  const ARCHIVED_DAY_KEYS = ["day1", "day2", "day3"];

  const renderDayButton = (key) => {
    const info = getDayInfo(key);
    const sel = selectedDay === key;
    return (
      <button key={key} className="btn" onClick={() => startDay(key)} style={{ background: sel ? `linear-gradient(135deg, ${info.color}, ${info.color}99)` : "rgba(255,255,255,0.08)", border: sel ? `2px solid ${info.color}` : "2px solid rgba(255,255,255,0.15)", borderRadius: 14, padding: "8px 14px", color: sel ? "#000" : "#fff", fontFamily: "inherit", fontWeight: 700, fontSize: 12, lineHeight: 1.6 }}>
        <span style={{ fontSize: 18 }}>{info.emoji}</span><br />
        <span style={{ fontSize: 11 }}>{info.label}</span><br />
        <span style={{ fontSize: 10, opacity: 0.7 }}>{info.theme}</span>
      </button>
    );
  };

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
          <div style={{ display: "flex", gap: 4, marginTop: 3, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>毎日コツコツだっちゃ</span>
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

      {/* Dumbbell record */}
      <div style={{ width: "100%", maxWidth: 390, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(77,150,255,0.2)", borderRadius: 14, padding: "7px 14px", marginBottom: 6, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>今週のダンベル筋トレ</div>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {[0,1,2,3,4,5,6].map(i => (
            <div key={i} style={{ width: 18, height: 18, borderRadius: "50%", background: i < dumbbellCount ? "#4D96FF" : "rgba(255,255,255,0.08)", border: `1px solid ${i < dumbbellCount ? "#4D96FF" : "rgba(255,255,255,0.12)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9 }}>{i < dumbbellCount ? "🏋️" : ""}</div>
          ))}
          <span style={{ fontSize: 11, color: "rgba(77,150,255,0.7)", marginLeft: 3 }}>{dumbbellCount}回</span>
        </div>
      </div>
      {/* Stretch record */}
      <div style={{ width: "100%", maxWidth: 390, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,160,122,0.2)", borderRadius: 14, padding: "7px 14px", marginBottom: 6, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>今週の朝ストレッチ</div>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {[0,1,2,3,4,5,6].map(i => (
            <div key={i} style={{ width: 18, height: 18, borderRadius: "50%", background: i < stretchCount ? "#FFA07A" : "rgba(255,255,255,0.08)", border: `1px solid ${i < stretchCount ? "#FFA07A" : "rgba(255,255,255,0.12)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9 }}>{i < stretchCount ? "🌅" : ""}</div>
          ))}
          <span style={{ fontSize: 11, color: "rgba(255,160,122,0.6)", marginLeft: 3 }}>{stretchCount}回</span>
        </div>
      </div>
      {/* Morning taiso record */}
      <div style={{ width: "100%", maxWidth: 390, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(245,176,65,0.2)", borderRadius: 14, padding: "7px 14px", marginBottom: 6, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>今週の朝の体操</div>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {[0,1,2,3,4,5,6].map(i => (
            <div key={i} style={{ width: 18, height: 18, borderRadius: "50%", background: i < taisoCount ? "#F5B041" : "rgba(255,255,255,0.08)", border: `1px solid ${i < taisoCount ? "#F5B041" : "rgba(255,255,255,0.12)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9 }}>{i < taisoCount ? "🌞" : ""}</div>
          ))}
          <span style={{ fontSize: 11, color: "rgba(245,176,65,0.7)", marginLeft: 3 }}>{taisoCount}回</span>
        </div>
      </div>
      {/* Evening stretch record */}
      <div style={{ width: "100%", maxWidth: 390, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(139,127,212,0.2)", borderRadius: 14, padding: "7px 14px", marginBottom: 6, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>今週の夜ストレッチ</div>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {[0,1,2,3,4,5,6].map(i => (
            <div key={i} style={{ width: 18, height: 18, borderRadius: "50%", background: i < eveningCount ? "#8B7FD4" : "rgba(255,255,255,0.08)", border: `1px solid ${i < eveningCount ? "#8B7FD4" : "rgba(255,255,255,0.12)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9 }}>{i < eveningCount ? "🌙" : ""}</div>
          ))}
          <span style={{ fontSize: 11, color: "rgba(139,127,212,0.6)", marginLeft: 3 }}>{eveningCount}回</span>
        </div>
      </div>
      {/* Deep stretch record */}
      <div style={{ width: "100%", maxWidth: 390, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(124,107,175,0.2)", borderRadius: 14, padding: "7px 14px", marginBottom: 6, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>今週の全身ストレッチ</div>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {[0,1,2,3,4,5,6].map(i => (
            <div key={i} style={{ width: 18, height: 18, borderRadius: "50%", background: i < deepStretchCount ? "#7C6BAF" : "rgba(255,255,255,0.08)", border: `1px solid ${i < deepStretchCount ? "#7C6BAF" : "rgba(255,255,255,0.12)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9 }}>{i < deepStretchCount ? "🧘" : ""}</div>
          ))}
          <span style={{ fontSize: 11, color: "rgba(124,107,175,0.6)", marginLeft: 3 }}>{deepStretchCount}回</span>
        </div>
      </div>
      {/* Yoga record */}
      <div style={{ width: "100%", maxWidth: 390, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(179,157,219,0.2)", borderRadius: 14, padding: "7px 14px", marginBottom: 6, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>今週の寝たまんまヨガ</div>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {[0,1,2,3,4,5,6].map(i => (
            <div key={i} style={{ width: 18, height: 18, borderRadius: "50%", background: i < yogaCount ? "#B39DDB" : "rgba(255,255,255,0.08)", border: `1px solid ${i < yogaCount ? "#B39DDB" : "rgba(255,255,255,0.12)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9 }}>{i < yogaCount ? "🧘‍♀️" : ""}</div>
          ))}
          <span style={{ fontSize: 11, color: "rgba(179,157,219,0.6)", marginLeft: 3 }}>{yogaCount}回</span>
        </div>
      </div>

      {/* RAM bubble */}
      <div style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 16, padding: "9px 18px", marginBottom: 14, fontSize: 14, fontWeight: 700, color: "#FFD93D", backdropFilter: "blur(8px)", maxWidth: 390, width: "100%", textAlign: "center" }}>
        {ramMsg}
      </div>

      {/* Day selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap", justifyContent: "center", width: "100%", maxWidth: 390 }}>
        {ACTIVE_DAY_KEYS.map(renderDayButton)}
      </div>

      {/* アーカイブ：週替わり筋トレ（day1〜3）。データと記録は残したまま折りたたみに収納 */}
      <div style={{ width: "100%", maxWidth: 390, marginBottom: 18, textAlign: "center" }}>
        <button className="btn" onClick={() => setShowArchive(a => !a)} style={{ background: "rgba(255,255,255,0.04)", border: "1px dashed rgba(255,255,255,0.18)", borderRadius: 12, padding: "7px 16px", color: "rgba(255,255,255,0.45)", fontFamily: "inherit", fontWeight: 700, fontSize: 11 }}>
          📦 週替わり筋トレ（アーカイブ）{showArchive ? "▲" : "▼"}
        </button>
        {showArchive && (
          <div className="slide-down" style={{ marginTop: 10 }}>
            <div style={{ display: "flex", gap: 4, justifyContent: "center", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>週3日・1日10分</span>
              <button className="btn" onClick={() => handleWeekChange(-1)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 11, padding: "0 2px", lineHeight: 1 }}>◀</button>
              <span style={{ fontSize: 10, background: `${["#FF6B6B","#4ECDC4","#FFD93D","#a29bfe"][wi]}33`, border: `1px solid ${["#FF6B6B","#4ECDC4","#FFD93D","#a29bfe"][wi]}66`, borderRadius: 99, padding: "1px 8px", color: ["#FF6B6B","#4ECDC4","#FFD93D","#a29bfe"][wi], fontWeight: 700, userSelect: "none" }}>
                {weekData.label} {weekData.sublabel}
              </span>
              <button className="btn" onClick={() => handleWeekChange(1)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 11, padding: "0 2px", lineHeight: 1 }}>▶</button>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
              {ARCHIVED_DAY_KEYS.map(renderDayButton)}
            </div>
          </div>
        )}
      </div>

      {/* Timer card */}
      {selectedDay && currentStep && (
        <div className="pop-in" style={{ width: "100%", maxWidth: 390, background: "rgba(255,255,255,0.06)", border: `1px solid ${activeColor}44`, borderRadius: 26, padding: "22px 18px", backdropFilter: "blur(12px)", marginBottom: 12, textAlign: "center", transition: "border-color 0.4s" }}>

          {/* Phase bar */}
          <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 12 }}>
            {[["warmup","🔥 ウォーム"], ["main","💪 メイン"], ["cooldown","🧊 クール"]].map(([p, label]) => (
              <div key={p} style={{ fontSize: 10, padding: "3px 10px", borderRadius: 99, background: currentPhase === p ? `${dayColor}33` : "rgba(255,255,255,0.06)", border: `1px solid ${currentPhase === p ? dayColor : "rgba(255,255,255,0.1)"}`, color: currentPhase === p ? dayColor : "rgba(255,255,255,0.35)", fontWeight: 700 }}>{label}</div>
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
            <div style={{ fontSize: 13, color: activeColor, marginBottom: 4, fontWeight: 700 }}>目安: {currentStep.reps}</div>
          )}
          {(() => {
            let i = stepIdx + 1;
            while (i < schedule.length) {
              const s = schedule[i];
              if (!s || s.type === "done") return null;
              if (["work","warmup","cooldown"].includes(s.type)) {
                return <div style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", marginBottom: 8 }}>次の種目: {s.name}</div>;
              }
              i++;
            }
            return null;
          })()}

          {/* Guide toggle — 全種目常に表示、閉じるボタンあり */}
          {/* Guide card */}
          {["work","warmup","cooldown"].includes(currentStep.type) && EXERCISE_GUIDE[currentStep.name] && (
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
            <div className="progress-bar-shine" style={{ height: "100%", width: `${totalWork > 0 ? (completedWork / totalWork) * 100 : 0}%`, background: `linear-gradient(90deg, ${dayColor}88, ${dayColor})`, borderRadius: 99, transition: "width 0.4s ease", position: "relative", overflow: "hidden" }} />
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 14 }}>メイン {completedWork}/{totalWork}種目完了</div>

          {/* Buttons */}
          {currentStep.type !== "done" ? (
            <div style={{ display: "flex", gap: 9, justifyContent: "center" }}>
              <button className="btn" onClick={handleStartPause} style={{ background: running ? "rgba(255,255,255,0.12)" : `linear-gradient(135deg, ${activeColor}, ${activeColor}bb)`, border: "none", borderRadius: 13, padding: "12px 28px", color: running ? "#fff" : "#000", fontSize: 15, fontWeight: 900, fontFamily: "inherit" }}>
                {running ? "⏸ 一時停止" : "▶ スタート"}
              </button>
              {currentStep.type === "rest" && running && (
                <button className="btn" onClick={skipToNext} style={{ background: `${activeColor}33`, border: `1px solid ${activeColor}77`, borderRadius: 13, padding: "12px 14px", color: activeColor, fontSize: 13, fontWeight: 900, fontFamily: "inherit" }}>→ 次へ</button>
              )}
              <button className="btn" onClick={handleReset} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 13, padding: "12px 16px", color: "rgba(255,255,255,0.6)", fontSize: 15, fontWeight: 700, fontFamily: "inherit" }}>↺</button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              <button className="btn" onClick={() => setShowHealthGuide(true)} style={{ background: `linear-gradient(135deg, ${dayColor}, ${dayColor}bb)`, border: "none", borderRadius: 13, padding: "12px", color: "#000", fontSize: 14, fontWeight: 900, fontFamily: "inherit", width: "100%" }}>📱 ヘルスケアに記録するっちゃ！</button>
              <button className="btn" onClick={() => setShowHistory(true)} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 13, padding: "10px", color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: "inherit", width: "100%" }}>📋 きろくを見るっちゃ</button>
              <button className="btn" onClick={handleReset} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 13, padding: "9px", color: "rgba(255,255,255,0.45)", fontSize: 12, fontWeight: 700, fontFamily: "inherit", width: "100%" }}>↺ もう一度</button>
            </div>
          )}
        </div>
      )}

      {/* Step list — warmup + main + cooldown */}
      {/* textAlign: left は #root の text-align: center 継承を打ち消す（名前より reps が長い種目で名前が中央にずれるため） */}
      {selectedDay && currentStep?.type !== "done" && dayInfo && (
        <div style={{ width: "100%", maxWidth: 390, textAlign: "left" }}>
          {/* Warmup */}
          {dayInfo.warmup && dayInfo.warmup.length > 0 && (<>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 7, letterSpacing: 1 }}>── ウォームアップ ──</div>
            {dayInfo.warmup.map((ex, i) => {
              const key = `w${i}`; const col = "#F0A500";
              const ws = schedule.filter(s => s.type === "warmup" && s.name === ex.name);
              const allDone = ws.length > 0 && ws.every(s => schedule.indexOf(s) < stepIdx);
              const isCurrent = currentStep?.type === "warmup" && currentStep.name === ex.name;
              const isOpen = openGuideIdx === key;
              const g = EXERCISE_GUIDE[ex.name];
              return (
                <div key={key} style={{ marginBottom: 6 }}>
                  <div className="btn" onClick={() => g && setOpenGuideIdx(isOpen ? null : key)} style={{ background: isCurrent ? `${col}20` : allDone ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.05)", border: isCurrent ? `1px solid ${col}77` : isOpen ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(255,255,255,0.07)", borderRadius: isOpen ? "11px 11px 0 0" : 11, padding: "10px 13px", display: "flex", justifyContent: "space-between", alignItems: "center", opacity: allDone ? 0.38 : 1, cursor: g ? "pointer" : "default" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{allDone ? "✓ " : isCurrent ? "▶ " : ""}{ex.name}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{ex.reps}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {g && <div style={{ fontSize: 10, color: isOpen ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.25)" }}>{isOpen ? "▲" : "▼"}</div>}
                      <div style={{ fontSize: 11, color: isCurrent ? col : "rgba(255,255,255,0.3)", fontWeight: 700 }}>{ex.duration}秒</div>
                    </div>
                  </div>
                  {isOpen && g && (
                    <div style={{ background: `${col}0e`, border: `1px solid rgba(255,255,255,0.07)`, borderTop: "none", borderRadius: "0 0 11px 11px", padding: "12px 13px" }}>
                      {g.points.map((p, pi) => (<div key={pi} style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "flex-start" }}><div style={{ minWidth: 18, height: 18, borderRadius: "50%", background: col, color: "#000", fontWeight: 900, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{pi+1}</div><div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>{p}</div></div>))}
                      <div style={{ background: `${col}18`, borderRadius: 8, padding: "7px 10px", fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 6, lineHeight: 1.5 }}>💡 {g.tip}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </>)}
          {/* Main */}
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 7, marginTop: dayInfo.warmup?.length > 0 ? 10 : 0, letterSpacing: 1 }}>── メインメニュー（タップでやり方確認）──</div>
          {dayInfo.exercises.map((ex, i) => {
            const key = `m${i}`;
            const ws = schedule.filter(s => s.type === "work" && s.name === ex.name);
            const allDone = ws.length > 0 && ws.every(s => schedule.indexOf(s) < stepIdx);
            const isCurrent = currentStep?.type === "work" && currentStep.name === ex.name;
            const isOpen = openGuideIdx === key;
            const g = EXERCISE_GUIDE[ex.name];
            return (
              <div key={key} style={{ marginBottom: 6 }}>
                <div className="btn" onClick={() => setOpenGuideIdx(isOpen ? null : key)} style={{ background: isCurrent ? `${dayInfo.color}20` : allDone ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.05)", border: isCurrent ? `1px solid ${dayInfo.color}77` : isOpen ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(255,255,255,0.07)", borderRadius: isOpen ? "11px 11px 0 0" : 11, padding: "10px 13px", display: "flex", justifyContent: "space-between", alignItems: "center", opacity: allDone ? 0.38 : 1, cursor: "pointer" }}>
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
                    {g.points.map((p, pi) => (<div key={pi} style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "flex-start" }}><div style={{ minWidth: 18, height: 18, borderRadius: "50%", background: dayInfo.color, color: "#000", fontWeight: 900, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{pi+1}</div><div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>{p}</div></div>))}
                    <div style={{ background: `${dayInfo.color}18`, borderRadius: 8, padding: "7px 10px", fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 6, lineHeight: 1.5 }}>💡 {g.tip}</div>
                  </div>
                )}
              </div>
            );
          })}
          {/* Cooldown */}
          {dayInfo.cooldown && dayInfo.cooldown.length > 0 && (<>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 7, marginTop: 10, letterSpacing: 1 }}>── クールダウン ──</div>
            {dayInfo.cooldown.map((ex, i) => {
              const key = `c${i}`; const col = "#5DADE2";
              const ws = schedule.filter(s => s.type === "cooldown" && s.name === ex.name);
              const allDone = ws.length > 0 && ws.every(s => schedule.indexOf(s) < stepIdx);
              const isCurrent = currentStep?.type === "cooldown" && currentStep.name === ex.name;
              const isOpen = openGuideIdx === key;
              const g = EXERCISE_GUIDE[ex.name];
              return (
                <div key={key} style={{ marginBottom: 6 }}>
                  <div className="btn" onClick={() => g && setOpenGuideIdx(isOpen ? null : key)} style={{ background: isCurrent ? `${col}20` : allDone ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.05)", border: isCurrent ? `1px solid ${col}77` : isOpen ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(255,255,255,0.07)", borderRadius: isOpen ? "11px 11px 0 0" : 11, padding: "10px 13px", display: "flex", justifyContent: "space-between", alignItems: "center", opacity: allDone ? 0.38 : 1, cursor: g ? "pointer" : "default" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{allDone ? "✓ " : isCurrent ? "▶ " : ""}{ex.name}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{ex.reps}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {g && <div style={{ fontSize: 10, color: isOpen ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.25)" }}>{isOpen ? "▲" : "▼"}</div>}
                      <div style={{ fontSize: 11, color: isCurrent ? col : "rgba(255,255,255,0.3)", fontWeight: 700 }}>{ex.duration}秒</div>
                    </div>
                  </div>
                  {isOpen && g && (
                    <div style={{ background: `${col}0e`, border: `1px solid rgba(255,255,255,0.07)`, borderTop: "none", borderRadius: "0 0 11px 11px", padding: "12px 13px" }}>
                      {g.points.map((p, pi) => (<div key={pi} style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "flex-start" }}><div style={{ minWidth: 18, height: 18, borderRadius: "50%", background: col, color: "#000", fontWeight: 900, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{pi+1}</div><div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>{p}</div></div>))}
                      <div style={{ background: `${col}18`, borderRadius: 8, padding: "7px 10px", fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 6, lineHeight: 1.5 }}>💡 {g.tip}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </>)}
        </div>
      )}

      <div style={{ marginTop: 24, fontSize: 10, color: "rgba(255,255,255,0.15)", textAlign: "center" }}>ナイル川のほとりから ✦ ラム</div>

      {showHealthGuide && selectedDay && <HealthGuide color={dayInfo?.color} onClose={() => setShowHealthGuide(false)} />}
      {showHistory && <HistoryPanel history={history} onClose={() => setShowHistory(false)} onDelete={handleDeleteHistory} />}
      {showVoiceSelector && <VoiceSelector onClose={() => setShowVoiceSelector(false)} />}
    </div>
  );
}
