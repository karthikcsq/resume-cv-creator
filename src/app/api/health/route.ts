import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "https://resume-builder-m9v5.onrender.com";

export const runtime = "nodejs";

export async function GET() {
  try {
    const upstream = await fetch(`${BACKEND_URL}/health`, {
      method: "GET",
      next: { revalidate: 0 },
    });

    if (!upstream.ok) {
      return NextResponse.json({ status: "unhealthy", error: "Backend not responding" }, { status: 503 });
    }

    const data = await upstream.json();
    return NextResponse.json(data, { status: 200 });
  } catch (e: unknown) {
    return NextResponse.json({ 
      status: "unhealthy", 
      error: e instanceof Error ? e.message : "Health check failed" 
    }, { status: 503 });
  }
}