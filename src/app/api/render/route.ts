import { NextResponse } from "next/server";

export const runtime = "nodejs";

const BACKEND_URL = process.env.BACKEND_URL || "https://resume-builder-m9v5.onrender.com";

// Unified endpoint: POST JSON and return the requested PDF from backend directly.
// Usage: POST /api/render?type=resume|cv with JSON body.
export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const type = url.searchParams.get("type");
    if (!type || (type !== "resume" && type !== "cv")) {
      return NextResponse.json({ error: "Missing or invalid type (resume|cv)" }, { status: 400 });
    }

    const payload = await req.json();

    // Ask backend to render and return a single PDF directly
    const upstream = await fetch(
      `${BACKEND_URL}/render_json_pdf?doc_type=${encodeURIComponent(type)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: payload }),
        next: { revalidate: 0 },
      }
    );

    if (!upstream.ok) {
      // Try to surface JSON error if present
      let details = await upstream.text().catch(() => "");
      try {
        const j = JSON.parse(details);
        details = JSON.stringify(j);
      } catch {}
      return NextResponse.json(
        { error: "Backend render failed", status: upstream.status, details },
        { status: 502 }
      );
    }

    const contentType = upstream.headers.get("content-type") || "application/pdf";
    const arrayBuffer = await upstream.arrayBuffer();
    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename=${type}_output.pdf`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
