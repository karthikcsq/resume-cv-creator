import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "https://resume-builder-m9v5.onrender.com";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const { searchParams } = url;
    const type = searchParams.get("type") || "resume";
    if (!["resume", "cv"].includes(type)) {
      return NextResponse.json({ error: "Invalid type (resume|cv)" }, { status: 400 });
    }

    const body = await req.json();
    if (!body || typeof body !== "object" || !("data" in body)) {
      return NextResponse.json({ error: "Body must be { data: {...} }" }, { status: 400 });
    }

    const upstream = await fetch(`${BACKEND_URL}/get_tex?doc_type=${encodeURIComponent(type)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      next: { revalidate: 0 },
    });

    if (!upstream.ok) {
      let details = await upstream.text();
      try { details = JSON.stringify(JSON.parse(details)); } catch {}
      return NextResponse.json({ error: "Backend get_tex failed", status: upstream.status, details }, { status: 502 });
    }
    const json = await upstream.json();
    return NextResponse.json(json, { status: 200 });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 });
  }
}