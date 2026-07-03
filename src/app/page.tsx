"use client";

import { useState } from "react";

interface SlapResult {
  score: number;
  verdict: string;
  roast: string[];
  fixes: string[];
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<SlapResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const slap = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/slap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "something went wrong");
      } else {
        setResult(data);
      }
    } catch {
      setError("request failed");
    } finally {
      setLoading(false);
    }
  };

   return (
    <main style={{ maxWidth: 600, margin: "80px auto", padding: "0 20px", fontFamily: "monospace" }}>
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

      {result && (
        <div>
          <div style={{ fontSize: 64, fontWeight: "bold", marginBottom: 8 }}>{result.score}/100</div>
          <p style={{ fontSize: 20, marginBottom: 24, fontStyle: "italic" }}>{result.verdict}</p>

          <h2 style={{ marginBottom: 8 }}>roast</h2>
          <ul style={{ marginBottom: 24, paddingLeft: 20 }}>
            {result.roast.map((r, i) => <li key={i} style={{ marginBottom: 6 }}>{r}</li>)}
          </ul>

          <h2 style={{ marginBottom: 8 }}>fixes</h2>
          <ul style={{ paddingLeft: 20 }}>
            {result.fixes.map((f, i) => <li key={i} style={{ marginBottom: 6 }}>{f}</li>)}
          </ul>
        </div>
      )}
    </main>
  );
}