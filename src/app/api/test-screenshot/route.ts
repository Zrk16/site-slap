import { getScreenshot } from "@/lib/screenshot";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) return Response.json({ error: "missing url" }, { status: 400 });

  try {
    const screenshotUrl = await getScreenshot(url);
    return Response.json({ screenshotUrl });
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
}
