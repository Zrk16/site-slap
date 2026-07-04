export async function getScreenshot(url: string): Promise<string> {
  const endpoint = `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&waitFor=2500`;

  const res = await fetch(endpoint, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Microlink request failed: ${res.status}`);
  }

  const data = await res.json();

  if (data.status !== "success" || !data.data?.screenshot?.url) {
    throw new Error("Screenshot failed — site may be blocking bots");
  }

  return data.data.screenshot.url;
}
