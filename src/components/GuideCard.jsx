import { EXERCISE_GUIDE } from "../data/exerciseGuide.js";

export default function GuideCard({ name, color }) {
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
