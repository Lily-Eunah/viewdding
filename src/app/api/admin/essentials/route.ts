import { NextRequest, NextResponse } from "next/server";
import { getWeddingEssentials, saveWeddingEssentials } from "@/lib/essentials";
import type { WeddingEssentialItem } from "@/domain/essentials-types";

export const runtime = "nodejs";
export const dynamic = "force-static";

// GET: 준비물 전체 목록 조회
export async function GET() {
  const items = await getWeddingEssentials();
  return NextResponse.json({ success: true, data: items });
}

// POST: 준비물 단건 또는 대량 추가
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const currentItems = await getWeddingEssentials();

    // 대량(배치) 등록
    if (Array.isArray(body?.items)) {
      const newItems: WeddingEssentialItem[] = body.items.map(
        (item: Partial<WeddingEssentialItem>, idx: number) => ({
          id: item.id || `ess-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
          name: item.name || "상품명 미입력",
          brand: item.brand || "브랜드 미입력",
          priceText: item.priceText || "",
          stages: item.stages || ["studio_snap"],
          category: item.category || "innerwear",
          thumbnailUrl: item.thumbnailUrl || "/viewdding-hero-v48.png",
          affiliateUrl: item.affiliateUrl || "",
          platform: item.platform || "other",
          editorNote: item.editorNote || "추천 상품입니다.",
          tips: item.tips || "",
          tags: item.tags || [],
          isAffiliate: item.isAffiliate ?? true,
          isMustHave: item.isMustHave ?? false,
          order: currentItems.length + idx + 1,
          createdAt: new Date().toISOString(),
        })
      );

      const merged = [...currentItems, ...newItems];
      await saveWeddingEssentials(merged);
      return NextResponse.json({ success: true, data: merged, addedCount: newItems.length });
    }

    // 단건 등록
    const item = body as Partial<WeddingEssentialItem>;
    const newItem: WeddingEssentialItem = {
      id: item.id || `ess-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: item.name || "상품명 미입력",
      brand: item.brand || "브랜드 미입력",
      priceText: item.priceText || "",
      stages: item.stages || ["studio_snap"],
      category: item.category || "innerwear",
      thumbnailUrl: item.thumbnailUrl || "/viewdding-hero-v48.png",
      affiliateUrl: item.affiliateUrl || "",
      platform: item.platform || "other",
      editorNote: item.editorNote || "추천 상품입니다.",
      tips: item.tips || "",
      tags: item.tags || [],
      isAffiliate: item.isAffiliate ?? true,
      isMustHave: item.isMustHave ?? false,
      order: currentItems.length + 1,
      createdAt: new Date().toISOString(),
    };

    const updated = [newItem, ...currentItems];
    await saveWeddingEssentials(updated);
    return NextResponse.json({ success: true, data: updated, item: newItem });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "등록 중 오류가 발생했습니다.";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// PUT: 수정 또는 순서 변경
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const currentItems = await getWeddingEssentials();

    // 순서 전체 변경
    if (Array.isArray(body?.items)) {
      const updated = body.items as WeddingEssentialItem[];
      await saveWeddingEssentials(updated);
      return NextResponse.json({ success: true, data: updated });
    }

    // 단건 수정
    const targetId = body?.id;
    if (!targetId) {
      return NextResponse.json({ success: false, error: "id가 누락되었습니다." }, { status: 400 });
    }

    const nextItems = currentItems.map((it) => (it.id === targetId ? { ...it, ...body } : it));
    await saveWeddingEssentials(nextItems);
    return NextResponse.json({ success: true, data: nextItems });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "수정 중 오류가 발생했습니다.";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// DELETE: 아이템 삭제
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "삭제할 id가 필요합니다." }, { status: 400 });
    }

    const currentItems = await getWeddingEssentials();
    const filtered = currentItems.filter((it) => it.id !== id);
    await saveWeddingEssentials(filtered);

    return NextResponse.json({ success: true, data: filtered });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "삭제 중 오류가 발생했습니다.";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
