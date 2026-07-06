import { generateUpgrade } from "@/lib/upgrade";

const DAILY_CAP = 40;
let usedToday = 0;
let capDay = "";

export async function POST(req: Request) {
  const { screenshotUrl, fixes } = await req.json();

  if (!screenshotUrl || !Array.isArray(fixes) || fixes.length === 0) {
    return Response.json({ error: "missing screenshot or fixes" }, { status: 400 });
  }

  const today = new Date().toISOString().slice(0, 10);
  if (today !== capDay) {
    capDay = today;
    usedToday = 0;
  }
  if (usedToday >= DAILY_CAP) {
    return Response.json({ error: "daily upgrade limit reached" }, { status: 429 });
  }
  usedToday++;

  try {
    const html = await generateUpgrade(screenshotUrl, fixes);
    return Response.json({ html });
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
}
