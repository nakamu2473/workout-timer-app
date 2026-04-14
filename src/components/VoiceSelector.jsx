import { useState, useEffect } from "react";
import { getSelectedVoice, setSelectedVoice, speak, getUseVoicevox, setUseVoicevox } from "../utils/speech.js";
import { testVoicevox, speakVoicevox } from "../utils/voicevox.js";

export default function VoiceSelector({ onClose }) {
  const [voices, setVoices] = useState([]);
  const [selected, setSelected] = useState(null);
  const [usingVoicevox, setUsingVoicevox] = useState(getUseVoicevox());
  const [vvAvailable, setVvAvailable] = useState(null); // null=checking, true/false

  useEffect(() => {
    const load = () => {
      const all = window.speechSynthesis.getVoices();
      const ja = all.filter(v => v.lang.startsWith("ja"));
      setVoices(ja.length > 0 ? ja : all.slice(0, 12));
      setSelected(getSelectedVoice()?.name || null);
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  useEffect(() => {
    testVoicevox().then(ok => setVvAvailable(ok));
  }, []);

  const handleSelectBrowser = (v) => {
    setSelectedVoice(v);
    setSelected(v.name);
    setUsingVoicevox(false);
    setUseVoicevox(false);
    speak(`こんにちは！私が読み上げを担当するっちゃ！`, v);
  };

  const handleSelectZundamon = () => {
    if (!vvAvailable) return;
    setUseVoicevox(true);
    setUsingVoicevox(true);
    setSelected(null);
    speakVoicevox("こんにちは！ずんだもんが読み上げるのだ！");
  };

  const vvColor = "#7cd986";

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "linear-gradient(160deg, #1a1740 0%, #2d2b55 100%)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "24px 24px 0 0", padding: "24px 20px 40px", width: "100%", maxWidth: 440, maxHeight: "70vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontWeight: 900, fontSize: 16 }}>🎙️ 声を選ぶっちゃ！</div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 10, padding: "6px 14px", color: "#fff", fontFamily: "inherit", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>とじる</button>
        </div>

        {/* ずんだもん (VOICEVOX) */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginBottom: 6, letterSpacing: 1 }}>VOICEVOX</div>
          <div
            onClick={handleSelectZundamon}
            style={{
              background: usingVoicevox ? `${vvColor}22` : "rgba(255,255,255,0.05)",
              border: `1px solid ${usingVoicevox ? vvColor : vvAvailable === false ? "rgba(255,255,255,0.08)" : `${vvColor}55`}`,
              borderRadius: 12, padding: "11px 14px", cursor: vvAvailable ? "pointer" : "default",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              opacity: vvAvailable === false ? 0.45 : 1,
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: usingVoicevox ? vvColor : "#fff" }}>
                🌿 ずんだもん（ノーマル）
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                {vvAvailable === null ? "確認中…" : vvAvailable ? "VOICEVOX · ローカル接続済み" : "VOICEVOXが起動していないのだ"}
              </div>
            </div>
            {usingVoicevox && <div style={{ fontSize: 16, color: vvColor }}>✓</div>}
          </div>
        </div>

        {/* ブラウザ TTS */}
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginBottom: 6, letterSpacing: 1 }}>ブラウザ音声</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 10 }}>選ぶとテスト再生するっちゃ！</div>
        {voices.length === 0 && (
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, padding: "20px 0", textAlign: "center" }}>
            音声が見つからないっちゃ…<br />ブラウザの設定を確認してだっちゃ
          </div>
        )}
        {voices.map((v, i) => (
          <div key={i} onClick={() => handleSelectBrowser(v)} style={{ background: (!usingVoicevox && selected === v.name) ? "rgba(255,211,61,0.15)" : "rgba(255,255,255,0.05)", border: `1px solid ${(!usingVoicevox && selected === v.name) ? "#FFD93D" : "rgba(255,255,255,0.08)"}`, borderRadius: 12, padding: "11px 14px", marginBottom: 7, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: (!usingVoicevox && selected === v.name) ? "#FFD93D" : "#fff" }}>{v.name}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{v.lang} {v.localService ? "・ローカル" : "・オンライン"}</div>
            </div>
            {(!usingVoicevox && selected === v.name) && <div style={{ fontSize: 16 }}>✓</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
