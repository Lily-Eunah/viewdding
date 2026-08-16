import { NextRequest, NextResponse } from "next/server";
import { getSelfSnapItems, saveSelfSnapItems } from "@/lib/self-snap";
import type { SelfSnapItem } from "@/domain/self-snap-types";

export const runtime = "nodejs";
export const dynamic = "force-static";

export async function GET() {
  const items = await getSelfSnapItems();
  return NextResponse.json({ success: true, data: items });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const currentItems = await getSelfSnapItems();

    // 대량(배치) 등록
    if (Array.isArray(body?.items)) {
      const newItems: SelfSnapItem[] = body.items.map(
        (item: Partial<SelfSnapItem>, idx: number) => ({
          id: item.id || `snap-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
          name: item.name || "소품명 미입력",
          brand: item.brand || "브랜드 미입력",
          priceText: item.priceText || "",
          category: item.category || "props",
          moodTags: item.moodTags || ["#셀프스냅"],
          thumbnailUrl: item.thumbnailUrl || "/viewdding-hero-v48.png",
          affiliateUrl: item.affiliateUrl || "",
          platform: item.platform || "other",
          editorNote: item.editorNote || "추천 소품입니다.",
          tips: item.tips || "",
          isAffiliate: item.isAffiliate ?? true,
          isPopular: item.isPopular ?? false,
          order: currentItems.length + idx + 1,
          createdAt: new Date().toISOString(),
        })
      );

      const merged = [...currentItems, ...newItems];
      await saveSelfSnapItems(merged);
      return NextResponse.json({ success: true, data: merged, addedCount: newItems.length });
    }

    // 단건 등록
    const item = body as Partial<SelfSnapItem>;
    const newItem: SelfSnapItem = {
      id: item.id || `snap-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: item.name || "소품명 미입력",
      brand: item.brand || "브랜드 미입력",
      priceText: item.priceText || "",
      category: item.category || "props",
      moodTags: item.moodTags || ["#셀프스냅"],
      thumbnailUrl: item.thumbnailUrl || "/viewdding-hero-v48.png",
      affiliateUrl: item.affiliateUrl || "",
      platform: item.platform || "other",
      editorNote: item.editorNote || "추천 소품입니다.",
      tips: item.tips || "",
      isAffiliate: item.isAffiliate ?? true,
      isPopular: item.isPopular ?? false,
      order: currentItems.length + 1,
      createdAt: new Date().toISOString(),
    };

    const updated = [newItem, ...currentItems];
    await saveSelfSnapItems(updated);
    return NextResponse.json({ success: true, data: updated, item: newItem });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "등록 중 오류가 발생했습니다.";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const currentItems = await getSelfSnapItems();

    if (Array.isArray(body?.items)) {
      const updated = body.items as SelfSnapItem[];
      await saveSelfSnapItems(updated);
      return NextResponse.json({ success: true, data: updated });
    }

    const targetId = body?.id;
    if (!targetId) {
      return NextResponse.json({ success: false, error: "id가 누락되었습니다." }, { status: 400 });
    }

    const nextItems = currentItems.map((it) => (it.id === targetId ? { ...it, ...body } : it));
    await saveSelfSnapItems(nextItems);
    return NextResponse.json({ success: true, data: nextItems });
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

    const currentItems = await getSelfSnapItems();
    const filtered = currentItems.filter((it) => it.id !== id);
    await saveSelfSnapItems(filtered);

    return NextResponse.json({ success: true, data: filtered });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "삭제 중 오류가 발생했습니다.";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
