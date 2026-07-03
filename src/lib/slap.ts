import Groq from "groq-sdk";
import type { SlapResult } from "./types";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const PROMPT = `You are a brutally honest, funny web design critic. You judge websites on visual vibe only — layout, hierarchy, color, spacing, whether it feels alive or dead.

Return ONLY valid JSON, no explanation, no markdown:
{
  "score": <0-100 integer>,
  "verdict": "<one punchy sentence>",
  "roast": ["<specific roast 1>", "<specific roast 2>", "<specific roast 3>"],
  "fixes": ["<actionable fix 1>", "<actionable fix 2>", "<actionable fix 3>"]
}

Score guide: 0-30 = painful, 31-50 = meh, 51-70 = decent, 71-85 = slaps, 86-100 = elite.
Be specific. No corporate tone. Talk like a human who actually cares about design.`;

export async function slapSite(screenshotUrl: string): Promise<SlapResult> {
  const attempt = async () => {
    const res = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: PROMPT },
            { type: "image_url", image_url: { url: screenshotUrl } },
          ],
        },
      ],
      max_tokens: 512,
    });

    const raw = res.choices[0]?.message?.content ?? "";
    return JSON.parse(raw) as SlapResult;
  };

  try {
    return await attempt();
  } catch {
    return await attempt();
  }
}

