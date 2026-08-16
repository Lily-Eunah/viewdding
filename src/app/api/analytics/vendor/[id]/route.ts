import { NextResponse } from "next/server";
import { getAllVendorIds, getVendorPerformanceSummary } from "@/lib/analytics-store";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllVendorIds().map((id) => ({ id }));
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const vendorSummary = await getVendorPerformanceSummary(id);

    if (!vendorSummary) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    return NextResponse.json(vendorSummary);
  } catch (err) {
    console.error("[Vendor Analytics API Error]", err);
    return NextResponse.json({ error: "Failed to fetch vendor analytics" }, { status: 500 });
  }
}
