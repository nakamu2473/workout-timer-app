import { useState, useEffect, useRef, useCallback } from "react";

import { EXERCISE_GUIDE } from "./data/exerciseGuide.js";
import { WEEK_ROTATIONS, EASY_DAY, MORNING_DAY } from "./data/weekRotations.js";
import { getRamMsg } from "./data/ramMessages.js";

import { getWeekIndex, buildSchedule } from "./utils/schedule.js";
import { playBeep, unlockAudio } from "./utils/audio.js";
import { speak, stepSpeech } from "./utils/speech.js";
import { loadHistory, saveHistory } from "./utils/storage.js";
import { phaseColor, phaseBadgeLabel } from "./utils/phase.js";

import VoiceSelector from "./components/VoiceSelector.jsx";
import GuideCard from "./components/GuideCard.jsx";
import HealthGuide from "./components/HealthGuide.jsx";
import HistoryPanel from "./components/HistoryPanel.jsx";

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
    if (key === "morning") return MORNING_DAY;
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

  const advanceToStep = useCallback((nextIdx, beepType) => {
    if (nextIdx < schedule.length) {
      const ns = schedule[nextIdx];
      setStepIdx(nextIdx);
      setTimeLeft(ns.duration || 0);
      prevTimeRef.current = ns.duration || 0;
      setRamMsg(getRamMsg(ns.type));
      if (["warmup","cooldown","work"].includes(ns.type)) setShowGuide(true);
      else if (ns.type === "rest" || ns.type === "countdown") setShowGuide(false);
      if (ns.type === "done") { setRunning(false); handleFinish(selectedDay); playBeep("done"); }
      playBeep(beepType);
      stepSpeech(ns);
    } else {
      setRunning(false);
    }
  }, [schedule, selectedDay, handleFinish]);

  const pendingAdvanceRef = useRef(false);

  const tick = useCallback(() => {
    setTimeLeft(t => {
      if (t <= 1) {
        pendingAdvanceRef.current = true;
        return 0;
      }
      return t - 1;
    });
  }, []);

  // ステップ遷移を useEffect で処理（ネストした setState を回避）
  useEffect(() => {
    if (pendingAdvanceRef.current) {
      pendingAdvanceRef.current = false;
      advanceToStep(stepIdx + 1, "start");
    }
  });

  // 残り秒数に応じた音声・電子音（状態更新関数の外で副作用を実行）
  useEffect(() => {
    if (!running) return;
    console.log("[countdown] timeLeft:", timeLeft, "| running:", running);
    if (timeLeft === 11) speak("あと10秒！");
    if (timeLeft === 3 || timeLeft === 2 || timeLeft === 1) playBeep("last3");
  }, [timeLeft, running]);

  const skipToNext = useCallback(() => {
    advanceToStep(stepIdx + 1, "start");
  }, [stepIdx, advanceToStep]);

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

  const DAY_KEYS = ["day1", "day2", "day3", "easy", "morning"];

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
