import Groq from "groq-sdk";
import type { SlapResult } from "./types";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const PROMPT = `You are a brutally honest web design critic with actual taste. Judge the visual design only — layout, hierarchy, color, spacing, typography, whether it feels alive or dead.

Score calibration — use the FULL range, be harsh when it's bad:
- 0-15: genuinely painful. chaos, no hierarchy, assault on the eyes. arngren.net level.
- 16-30: bad. clearly no design intent. looks like a default template nobody touched.
- 31-50: meh. functional but forgettable. nothing works, nothing breaks.
- 51-70: decent. some thought went in. a few things are off but it holds together.
- 71-85: slaps. clean, confident, intentional. you'd send this to someone.
- 86-100: elite. nothing to change. stripe, apple, linear level.

Most sites land between 20-70. Be honest. Do not be generous.

Return ONLY a raw JSON object. No markdown, no backticks, no explanation — just the JSON:
{"score": <integer>, "verdict": "<one punchy sentence>", "roast": ["<specific thing that's bad>", "<specific thing that's bad>", "<specific thing that's bad>"], "fixes": ["<actionable fix>", "<actionable fix>", "<actionable fix>"]}

Be specific. Name actual things you see. No vague complaints. You have the wit of a comedian and the standards of a designer who's been burned by Comic Sans one too many times. Be funny, be mean, be specific.`;

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
    const cleaned = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
    return JSON.parse(cleaned) as SlapResult;
  };

  try {
    return await attempt();
  } catch {
    return await attempt();
  }
}

