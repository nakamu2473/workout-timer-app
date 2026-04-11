import { EXERCISE_GUIDE } from "../data/exerciseGuide.js";

export default function GuidePopup({ name, color, onClose }) {
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
