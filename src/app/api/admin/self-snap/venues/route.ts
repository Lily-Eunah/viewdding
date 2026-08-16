import { NextRequest, NextResponse } from "next/server";
import { getSelfSnapVenues, saveSelfSnapVenues } from "@/lib/self-snap";
import type { SelfSnapVenue } from "@/domain/self-snap-types";

export const runtime = "nodejs";
export const dynamic = "force-static";

export async function GET() {
  const venues = await getSelfSnapVenues();
  return NextResponse.json({ success: true, data: venues });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const currentVenues = await getSelfSnapVenues();

    const venue = body as Partial<SelfSnapVenue>;
    const newVenue: SelfSnapVenue = {
      id: venue.id || `venue-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: venue.name || "장소명 미입력",
      category: venue.category || "studio",
      region: venue.region || "seoul_east",
      regionLabel: venue.regionLabel || "서울 성수/한남",
      address: venue.address || "",
      thumbnailUrl: venue.thumbnailUrl || "/viewdding-hero-v48.png",
      features: venue.features || ["자연광", "주차 가능"],
      priceInfo: venue.priceInfo || "",
      bestTimeTip: venue.bestTimeTip || "",
      editorNote: venue.editorNote || "추천 스냅 장소입니다.",
      bookingUrl: venue.bookingUrl || undefined,
      mapUrl: venue.mapUrl || undefined,
      isAffiliate: venue.isAffiliate ?? false,
      order: currentVenues.length + 1,
      createdAt: new Date().toISOString(),
    };

    const updated = [newVenue, ...currentVenues];
    await saveSelfSnapVenues(updated);
    return NextResponse.json({ success: true, data: updated, venue: newVenue });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "등록 중 오류가 발생했습니다.";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const currentVenues = await getSelfSnapVenues();

    if (Array.isArray(body?.items)) {
      const updated = body.items as SelfSnapVenue[];
      await saveSelfSnapVenues(updated);
      return NextResponse.json({ success: true, data: updated });
    }

    const targetId = body?.id;
    if (!targetId) {
      return NextResponse.json({ success: false, error: "id가 누락되었습니다." }, { status: 400 });
    }

    const nextVenues = currentVenues.map((v) => (v.id === targetId ? { ...v, ...body } : v));
    await saveSelfSnapVenues(nextVenues);
    return NextResponse.json({ success: true, data: nextVenues });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "수정 중 오류가 발생했습니다.";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "삭제할 id가 필요합니다." }, { status: 400 });
    }

    const currentVenues = await getSelfSnapVenues();
    const filtered = currentVenues.filter((v) => v.id !== id);
    await saveSelfSnapVenues(filtered);

    return NextResponse.json({ success: true, data: filtered });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "삭제 중 오류가 발생했습니다.";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
