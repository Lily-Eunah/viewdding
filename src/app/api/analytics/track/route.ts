import { NextResponse } from "next/server";
import type { AnalyticsEventRecord } from "@/domain/analytics-types";
import { saveAnalyticsEvents } from "@/lib/analytics-store";

export async function POST(req: Request) {
  try {
    let rawBody = "";
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json") || contentType.includes("text/plain")) {
      rawBody = await req.text();
    }

    if (!rawBody) {
      return new NextResponse(null, { status: 204 });
    }

    const parsed = JSON.parse(rawBody);
    const events: AnalyticsEventRecord[] = Array.isArray(parsed) ? parsed : [parsed];

    const validEvents: AnalyticsEventRecord[] = events
      .filter((e) => e && typeof e === "object" && e.eventType)
      .map((e) => ({
        id: e.id || `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        eventType: e.eventType,
        visitorId: e.visitorId || "anonymous",
        sessionId: e.sessionId || "unknown",
        pagePath: e.pagePath || "/",
        category: e.category,
        vendorId: e.vendorId,
        vendorName: e.vendorName,
        targetType: e.targetType,
        targetUrl: e.targetUrl,
        region: e.region,
        isSponsored: Boolean(e.isSponsored),
        referrer: e.referrer,
        timestamp: e.timestamp || new Date().toISOString(),
        device: e.device || "desktop",
      }));

    if (validEvents.length > 0) {
      await saveAnalyticsEvents(validEvents);
    }

    return new NextResponse(JSON.stringify({ ok: true, count: validEvents.length }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[Analytics Track API Error]", err);
    return new NextResponse(JSON.stringify({ ok: false, error: "Invalid payload" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
