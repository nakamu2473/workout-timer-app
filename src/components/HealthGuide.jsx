import { WEEK_ROTATIONS, EASY_DAY } from "../data/weekRotations.js";
import { getWeekIndex } from "../utils/schedule.js";

export default function HealthGuide({ dayKey, onClose }) {
  const wi = getWeekIndex();
  const weekData = WEEK_ROTATIONS[wi];
  const day = dayKey === "easy" ? EASY_DAY : weekData[dayKey];
  const color = day.color || "#82E0AA";
  const steps = ["iPhoneの「ヘルスケア」アプリを開くっちゃ","右下「ブラウズ」→「アクティビティ」→「ワークアウト」をタップだっちゃ","右上の「＋」ボタンを押すっちゃ！","「機能的筋力トレーニング」を選ぶっちゃ","時間を入力して日時を今日に合わせるっちゃ","「追加」を押したら完了だっちゃ！"];
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "linear-gradient(160deg, #1a1740 0%, #2d2b55 100%)", border: `1px solid ${color}44`, borderRadius: 28, padding: "28px 24px", maxWidth: 380, width: "100%", boxShadow: `0 0 60px ${color}22` }}>
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <div style={{ fontSize: 34, marginBottom: 6 }}>📱</div>
          <div style={{ fontWeight: 900, fontSize: 17 }}>ヘルスケアに記録するっちゃ！</div>
        </div>
        {steps.map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "9px 12px", marginBottom: 7 }}>
            <div style={{ minWidth: 22, height: 22, borderRadius: "50%", background: color, color: "#000", fontWeight: 900, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i+1}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", lineHeight: 1.5 }}>{s}</div>
          </div>
        ))}
        <div style={{ background: `${color}18`, border: `1px solid ${color}44`, borderRadius: 10, padding: "9px 12px", fontSize: 11, color: "rgba(255,255,255,0.6)", margin: "10px 0 14px", lineHeight: 1.6 }}>💡 Apple Watchがあれば「ワークアウト」アプリで直接記録できるっちゃ！</div>
        <button onClick={onClose} style={{ width: "100%", background: `linear-gradient(135deg, ${color}, ${color}99)`, border: "none", borderRadius: 12, padding: "13px", color: "#000", fontWeight: 900, fontSize: 14, fontFamily: "inherit", cursor: "pointer" }}>わかっただっちゃ！✓</button>
      </div>
    </div>
  );
}
