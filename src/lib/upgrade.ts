import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PROMPT = `You are given a screenshot of a website and a list of design fixes. Rebuild this exact website as a single self-contained HTML file with the fixes applied. It must feel like the same site after a professional redesign, not a different site.

Output rules:
- Return ONLY the HTML document, starting with <!doctype html>. No markdown, no backticks, no explanation.
- All CSS in one <style> tag. No JavaScript at all. No external requests: no CDNs, no web fonts, no image URLs.
- Where the original has photos or logos, use CSS placeholders: gradient blocks or solid shapes sized like the original. Never <img> with a URL.

Content rules:
- Keep the site's real text from the screenshot wherever readable. Never write lorem ipsum or invented placeholder copy.
- Match the original's sections and their order. Do not add sections the original does not have. Do not remove content, restyle it.
- Apply ONLY the listed fixes. Everything not named in a fix stays as close to the original as possible.

Design rules (violating any of these fails the task):
- Build the palette from the site's actual colors in the screenshot. Do not invent a new color scheme. Never use purple gradients.
- One accent color maximum. Neutral background, dark readable text. Body text contrast must be high.
- Real hierarchy: one dominant headline size, then clear steps down. Body 16px, line-height 1.5-1.6, headings tighter.
- Spacing on an 8px scale. Generous whitespace between sections (64px+). Whitespace over boxes: prefer spacing and alignment to borders and cards.
- One consistent border-radius everywhere. No drop shadows heavier than a subtle 1-2 layer soft shadow.
- No emoji anywhere in text. No gradient text. No centered walls of text: paragraphs left-aligned, max-width around 65ch.
- System font stack with deliberate weights: bold only for headings, regular for body. Never fake variety with many sizes.
- Buttons look clickable: solid fill or clear border, comfortable padding, CSS-only hover state.
- Layout with flexbox and grid only. Never use position: absolute or position: fixed for page layout.
- Include <meta name="viewport" content="width=device-width, initial-scale=1"> in the head.
- Every section spans the full width with its content in a centered max-width container. Nothing floats detached from the layout flow.
- Design for a 1280px wide desktop viewport.
- No element may ever overlap another. Badges, pills, and labels sit in normal flow above or below the text near them, never on top of it.
- The <style> tag must begin with this exact reset: * { box-sizing: border-box; margin: 0; } button, input, select { font: inherit; }

Apply these fixes:`;

export async function generateUpgrade(screenshotUrl: string, fixes: string[]): Promise<string> {
  const res = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 8192,
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "url", url: screenshotUrl } },
          { type: "text", text: `${PROMPT}\n${fixes.map((f, i) => `${i + 1}. ${f}`).join("\n")}` },
        ],
      },
    ],
  });

  const block = res.content[0];
  const raw = block?.type === "text" ? block.text : "";
  return raw.replace(/^```(?:html)?\n?/, "").replace(/\n?```$/, "").trim();
}
