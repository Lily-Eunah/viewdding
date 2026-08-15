import { NextResponse } from "next/server";
import { getAnalyticsSummary } from "@/lib/analytics-store";

export const dynamic = "force-static";

export async function GET() {
  try {
    const summary = await getAnalyticsSummary(30);
    return NextResponse.json(summary);
  } catch (err) {
    console.error("[Analytics Summary API Error]", err);
    return NextResponse.json({ error: "Failed to fetch summary" }, { status: 500 });
  }
}
