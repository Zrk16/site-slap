"use client";

import { useState } from "react";

interface SlapResult {
  score: number;
  verdict: string;
  roast: string[];
  fixes: string[];
  quickWinsScore: number;
  fullFixScore: number;
  screenshotUrl?: string;
}

const scoreTabs = ["OG", "Quick Fix", "Full Fix"] as const;
type ScoreTab = typeof scoreTabs[number];

const skins = ["basic", "decent", "fire"] as const;
type Skin = typeof skins[number];

function TrafficLights() {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FF5F57" }} />
      <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FFBD2E" }} />
      <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28C840" }} />
    </div>
  );
}

function SkeletonBlock({ width = "100%", height = 20, mb = 0 }: { width?: string | number; height?: number; mb?: number }) {
  return (
    <div style={{
      width,
      height,
      borderRadius: 4,
      background: "linear-gradient(90deg, #1a1a1a 25%, #252525 50%, #1a1a1a 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.4s infinite",
      marginBottom: mb,
    }} />
  );
}

function BasicSkin({ result, loading, error, url, setUrl, slap, activeTab, setActiveTab }: {
  result: SlapResult | null;
  loading: boolean;
  error: string;
  url: string;
  setUrl: (v: string) => void;
  slap: () => void;
  activeTab: ScoreTab;
  setActiveTab: (t: ScoreTab) => void;
}) {
  const tabScore = result
    ? activeTab === "OG" ? result.score
    : activeTab === "Quick Fix" ? result.quickWinsScore
    : result.fullFixScore
    : null;

  return (
    <div style={{ padding: 40, fontFamily: "monospace" }}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>Site Slap</h1>
      <p style={{ marginBottom: 24, opacity: 0.6 }}>Does your site slap? Paste a URL and find out.</p>

      <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
        <input
          type="text"
          placeholder="https://yoursite.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && slap()}
          style={{ flex: 1, padding: "10px 14px", fontSize: 16, border: "1px solid #333", background: "#000", color: "#fff" }}
        />
        <button
          onClick={slap}
          disabled={loading || !url}
          style={{ padding: "10px 20px", fontSize: 16, background: "#fff", color: "#000", border: "none", cursor: "pointer" }}
        >
          {loading ? "slapping..." : "slap it"}
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {loading && (
        <div>
          <SkeletonBlock height={400} mb={24} />
          <SkeletonBlock width={120} height={64} mb={12} />
          <SkeletonBlock width="60%" height={24} mb={24} />
          <SkeletonBlock width="80%" height={16} mb={8} />
          <SkeletonBlock width="70%" height={16} mb={8} />
          <SkeletonBlock width="75%" height={16} mb={24} />
          <SkeletonBlock width="65%" height={16} mb={8} />
          <SkeletonBlock width="80%" height={16} mb={8} />
          <SkeletonBlock width="70%" height={16} />
        </div>
      )}

      {!loading && result && (
        <div>
          <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
            {scoreTabs.map((tab) => {
              const score = tab === "OG" ? result.score : tab === "Quick Fix" ? result.quickWinsScore : result.fullFixScore;
              return (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  padding: "8px 16px", fontSize: 14, border: "1px solid #333",
                  background: activeTab === tab ? "#fff" : "#000",
                  color: activeTab === tab ? "#000" : "#fff", cursor: "pointer",
                }}>
                  {tab} · {score}
                </button>
              );
            })}
          </div>

          {result.screenshotUrl && (
            <img src={result.screenshotUrl} alt="site screenshot"
              style={{ width: "100%", border: "1px solid #222", marginBottom: 24 }} />
          )}

          <div style={{ fontSize: 64, fontWeight: "bold", marginBottom: 8 }}>{tabScore}/100</div>
          <p style={{ fontSize: 20, marginBottom: 24, fontStyle: "italic" }}>{result.verdict}</p>

          {activeTab === "OG" && (
            <>
              <h2 style={{ marginBottom: 8 }}>roast</h2>
              <ul style={{ marginBottom: 24, paddingLeft: 20 }}>
                {result.roast.map((r, i) => <li key={i} style={{ marginBottom: 6 }}>{r}</li>)}
              </ul>
            </>
          )}

          <h2 style={{ marginBottom: 8 }}>
            {activeTab === "OG" ? "fixes" : activeTab === "Quick Fix" ? "apply this fix" : "apply all fixes"}
          </h2>
          <ul style={{ paddingLeft: 20 }}>
            {(activeTab === "OG" ? result.fixes : activeTab === "Quick Fix" ? [result.fixes[0]] : result.fixes)
              .map((f, i) => <li key={i} style={{ marginBottom: 6 }}>{f}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<SlapResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<ScoreTab>("OG");
  const [activeSkin, setActiveSkin] = useState<Skin>("basic");

  const slap = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    setActiveTab("OG");

    try {
      const res = await fetch("/api/slap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "something went wrong");
      else setResult(data);
    } catch {
      setError("request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "60px 20px" }}>
        <div style={{ width: "100%", maxWidth: 800, borderRadius: 12, overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.6)", border: "1px solid #2a2a2a" }}>

          {/* title bar */}
          <div style={{ background: "#1c1c1c", padding: "12px 16px", display: "flex", alignItems: "center", gap: 16, borderBottom: "1px solid #2a2a2a" }}>
            <TrafficLights />
            <div style={{ display: "flex", gap: 2 }}>
              {skins.map((skin) => (
                <button key={skin} onClick={() => setActiveSkin(skin)} style={{
                  padding: "4px 14px", fontSize: 13, border: "1px solid transparent",
                  borderRadius: 6, cursor: "pointer", fontFamily: "monospace",
                  background: activeSkin === skin ? "#2e2e2e" : "transparent",
                  color: activeSkin === skin ? "#fff" : "#666",
                  borderColor: activeSkin === skin ? "#3a3a3a" : "transparent",
                }}>
                  {skin}
                </button>
              ))}
            </div>
          </div>

          {/* content */}
          <div style={{ background: "#000", color: "#fff" }}>
            {activeSkin === "basic" && (
              <BasicSkin result={result} loading={loading} error={error}
                url={url} setUrl={setUrl} slap={slap}
                activeTab={activeTab} setActiveTab={setActiveTab} />
            )}
            {activeSkin === "decent" && (
              <div style={{ padding: 40, fontFamily: "monospace", opacity: 0.4 }}>decent skin coming soon</div>
            )}
            {activeSkin === "fire" && (
              <div style={{ padding: 40, fontFamily: "monospace", opacity: 0.4 }}>fire skin coming soon</div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
