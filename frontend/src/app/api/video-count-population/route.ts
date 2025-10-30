import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_COLLAB_PUBLIC_URL;
const CONFIGURED_PATH = process.env.NEXT_PUBLIC_VIDEO_COUNT_PATH || "/video-count-population";

export async function POST(req: NextRequest) {
  if (!BACKEND_URL) {
    return NextResponse.json({ error: "Backend URL not configured" }, { status: 500 });
  }

  try {
    const body = await req.json();

    // Try a set of likely endpoints to handle minor path mismatches
    const candidatePaths = [
      CONFIGURED_PATH,
      CONFIGURED_PATH.endsWith("/") ? CONFIGURED_PATH : `${CONFIGURED_PATH}/`,
      "/video_count_population",
      "/video_count_population/",
      "/api/video-count-population",
      "/api/video-count-population/",
    ];

    let lastResponse: Response | null = null;
    const tried: string[] = [];
    for (const path of candidatePaths) {
      try {
        const url = `${BACKEND_URL}${path.startsWith("/") ? path : `/${path}`}`;
        tried.push(url);
        const resp = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        lastResponse = resp;
        if (resp.status !== 404) {
          const text = await resp.text();
          const contentType = resp.headers.get("content-type") || "application/json";
          if (!resp.ok) {
            try {
              const asJson = JSON.parse(text);
              return NextResponse.json({ error: "Upstream error", upstream: asJson, triedPaths: tried }, { status: resp.status });
            } catch {
              return NextResponse.json({ error: text || resp.statusText, triedPaths: tried }, { status: resp.status });
            }
          }
          try {
            const json = JSON.parse(text);
            return NextResponse.json(json, { status: resp.status });
          } catch {
            return new NextResponse(text, { status: resp.status, headers: { "content-type": contentType } });
          }
        }
        // if 404, try next candidate
      } catch (innerErr) {
        // eslint-disable-next-line no-console
        console.error("Proxy attempt failed:", innerErr);
        // continue to next candidate
      }
    }

    // If all candidates failed with 404 or request failures
    const status = lastResponse?.status || 502;
    const details = lastResponse ? await lastResponse.text() : "No reachable endpoint";
    return NextResponse.json(
      { error: "Upstream not found or failed", details, triedPaths: tried },
      { status: status === 404 ? 502 : status }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Proxy error" }, { status: 500 });
  }
}


