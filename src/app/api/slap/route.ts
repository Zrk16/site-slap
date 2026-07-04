import { getScreenshot } from "@/lib/screenshot";
import { slapSite } from "@/lib/slap";

export async function POST(req: Request) {
  const body = await req.json();
  const { url } = body;

  if (!url || !/^https?:\/\/.+/.test(url)) {
    return Response.json({ error: "invalid url" }, { status: 400 });
  }

  try {
    const screenshotUrl = await getScreenshot(url);
    const result = await slapSite(screenshotUrl);
    return Response.json({ ...result, screenshotUrl });
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
}
