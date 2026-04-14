import { WEEK_ROTATIONS, EASY_DAY } from "../data/weekRotations.js";
import { getWeekIndex } from "../utils/schedule.js";
import { formatDate } from "../utils/storage.js";

export default function HistoryPanel({ history, onClose, onDelete }) {
  const wi = getWeekIndex();
  const weekData = WEEK_ROTATIONS[wi];
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "linear-gradient(160deg, #1a1740 0%, #2d2b55 100%)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "28px 28px 0 0", padding: "24px 20px 40px", width: "100%", maxWidth: 440, maxHeight: "75vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
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
