import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";

interface WelcomeScreenProps {
  onEnter: () => void;
}

export default function WelcomeScreen({ onEnter }: WelcomeScreenProps) {
  const [appUrl, setAppUrl] = useState("");
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    setAppUrl(window.location.origin + window.location.pathname.replace(/\/$/, ""));
  }, []);

  const handleEnter = () => {
    setEntered(true);
    setTimeout(onEnter, 500);
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f0c29 0%, #302b63 45%, #24243e 100%)",
        position: "relative",
        overflow: "hidden",
        opacity: entered ? 0 : 1,
        transition: "opacity 0.5s ease",
        padding: "24px 20px",
        boxSizing: "border-box",
      }}
    >
      {/* Animated background blobs */}
      <div style={{
        position: "absolute", top: "-120px", left: "-120px",
        width: "400px", height: "400px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)",
        animation: "float1 8s ease-in-out infinite",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "-80px", right: "-80px",
        width: "350px", height: "350px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)",
        animation: "float2 10s ease-in-out infinite",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", top: "40%", right: "10%",
        width: "200px", height: "200px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(167,139,250,0.15) 0%, transparent 70%)",
        animation: "float3 7s ease-in-out infinite",
        pointerEvents: "none",
      }} />

      <style>{`
        @keyframes float1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(30px,20px)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-25px,-15px)} }
        @keyframes float3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(15px,-25px)} }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        @keyframes pulse-ring { 0%{transform:scale(0.95);box-shadow:0 0 0 0 rgba(99,102,241,0.5)} 70%{transform:scale(1);box-shadow:0 0 0 14px rgba(99,102,241,0)} 100%{transform:scale(0.95);box-shadow:0 0 0 0 rgba(99,102,241,0)} }
        @keyframes spin-slow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .enter-btn:hover { transform: translateY(-2px) scale(1.02) !important; box-shadow: 0 20px 40px rgba(99,102,241,0.5) !important; }
        .enter-btn:active { transform: translateY(0) scale(0.98) !important; }
      `}</style>

      {/* Main card */}
      <div style={{
        position: "relative", zIndex: 10,
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: 32, maxWidth: 420, width: "100%",
        animation: "fadeInUp 0.8s ease both",
      }}>

        {/* Logo area */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          {/* Icon with pulse ring */}
          <div style={{
            width: 88, height: 88, borderRadius: 24,
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 40, boxShadow: "0 8px 32px rgba(99,102,241,0.4)",
            animation: "pulse-ring 2.5s ease-in-out infinite",
            flexShrink: 0,
          }}>
            🎓
          </div>

          {/* App title */}
          <div style={{ textAlign: "center" }}>
            <div style={{
              fontSize: 28, fontWeight: 700, letterSpacing: "-0.5px",
              background: "linear-gradient(90deg, #e0e7ff, #c7d2fe, #a5b4fc, #c7d2fe, #e0e7ff)",
              backgroundSize: "400px 100%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "shimmer 3s linear infinite",
              marginBottom: 4,
            }}>
              حاسبة المعدل
            </div>
            <div style={{
              fontSize: 15, fontWeight: 500, color: "rgba(199,210,254,0.8)",
              letterSpacing: "0.3px",
            }}>
              Calculateur de Moyenne
            </div>
          </div>

          {/* Subtitle badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)",
            borderRadius: 100, padding: "5px 14px",
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#6ee7b7", display: "inline-block", flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: "rgba(199,210,254,0.9)", fontWeight: 500 }}>
              نظام LMD — الجزائر &nbsp;|&nbsp; Système LMD — Algérie
            </span>
          </div>
        </div>

        {/* QR Code card */}
        <div style={{
          background: "rgba(255,255,255,0.04)", backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24,
          padding: "28px 32px", display: "flex", flexDirection: "column",
          alignItems: "center", gap: 16, width: "100%",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
          animation: "fadeInUp 0.8s 0.2s ease both", opacity: 0,
          animationFillMode: "both",
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(165,180,252,0.8)", letterSpacing: "1px", textTransform: "uppercase" }}>
            امسح للوصول السريع &nbsp;·&nbsp; Scanner pour accéder
          </div>

          {/* QR Code */}
          <div style={{
            background: "#fff", borderRadius: 16, padding: 14,
            boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {appUrl ? (
              <QRCodeSVG
                value={appUrl}
                size={160}
                bgColor="#ffffff"
                fgColor="#1e1b4b"
                level="M"
              />
            ) : (
              <div style={{ width: 160, height: 160, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{
                  width: 32, height: 32, border: "3px solid #6366f1",
                  borderTopColor: "transparent", borderRadius: "50%",
                  animation: "spin-slow 0.8s linear infinite",
                }} />
              </div>
            )}
          </div>

          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "rgba(148,163,184,0.7)", lineHeight: 1.6 }}>
              افتح على هاتفك &nbsp;·&nbsp; Ouvrez sur votre téléphone
            </div>
            {appUrl && (
              <div style={{
                fontSize: 10, color: "rgba(99,102,241,0.6)", marginTop: 4,
                fontFamily: "monospace", wordBreak: "break-all",
              }}>
                {appUrl}
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10,
          width: "100%",
          animation: "fadeInUp 0.8s 0.35s ease both", opacity: 0,
          animationFillMode: "both",
        }}>
          {[
            { icon: "📱", fr: "PWA", ar: "قابل للتثبيت" },
            { icon: "📶", fr: "Hors ligne", ar: "يعمل بلا إنترنت" },
            { icon: "🏛️", fr: "4 Facultés", ar: "4 كليات" },
          ].map((f, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 14, padding: "12px 10px", textAlign: "center",
            }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{f.icon}</div>
              <div style={{ fontSize: 11, color: "rgba(165,180,252,0.9)", fontWeight: 600 }}>{f.fr}</div>
              <div style={{ fontSize: 10, color: "rgba(148,163,184,0.7)", marginTop: 2 }}>{f.ar}</div>
            </div>
          ))}
        </div>

        {/* Enter button */}
        <div style={{
          width: "100%",
          animation: "fadeInUp 0.8s 0.5s ease both", opacity: 0,
          animationFillMode: "both",
        }}>
          <button
            className="enter-btn"
            onClick={handleEnter}
            style={{
              width: "100%", padding: "16px 32px",
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              border: "none", borderRadius: 16, cursor: "pointer",
              color: "#fff", fontSize: 16, fontWeight: 700,
              letterSpacing: "0.3px",
              boxShadow: "0 8px 24px rgba(99,102,241,0.35)",
              transition: "all 0.2s ease",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              fontFamily: "var(--font-sans)",
            }}
          >
            <span style={{ fontSize: 20 }}>🚀</span>
            <span>ابدأ الآن &nbsp;·&nbsp; Commencer</span>
          </button>

          <p style={{
            textAlign: "center", marginTop: 14,
            fontSize: 11, color: "rgba(148,163,184,0.5)",
            lineHeight: 1.6,
          }}>
            مجاني تماماً · 100% Gratuit &nbsp;·&nbsp; لا يتطلب تسجيل · Sans inscription
            
          </p>
        </div>
      </div>
    </div>
  );
}
