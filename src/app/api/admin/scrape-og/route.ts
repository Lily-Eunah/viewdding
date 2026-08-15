import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-static";

function detectPlatform(url: string): "naver" | "coupang" | "oliveyoung" | "dorosiwa" | "uniqlo" | "ably" | "zigzag" | "brand" | "other" {
  const lower = url.toLowerCase();
  if (lower.includes("naver.com") || lower.includes("naver.me")) return "naver";
  if (lower.includes("coupang.com")) return "coupang";
  if (lower.includes("oliveyoung.co.kr")) return "oliveyoung";
  if (lower.includes("dorosiwa.co.kr")) return "dorosiwa";
  if (lower.includes("uniqlo.com") || lower.includes("uniqlo.co.kr")) return "uniqlo";
  if (lower.includes("a-bly.com") || lower.includes("ably")) return "ably";
  if (lower.includes("zigzag.kr") || lower.includes("kakaostyle")) return "zigzag";
  return "other";
}

function cleanTitle(title: string): string {
  if (!title) return "";
  return title
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function resolveUrl(baseUrl: string, relativeUrl: string): string {
  if (!relativeUrl) return "";
  if (relativeUrl.startsWith("//")) {
    return `https:${relativeUrl}`;
  }
  if (relativeUrl.startsWith("http://") || relativeUrl.startsWith("https://")) {
    return relativeUrl;
  }
  try {
    const base = new URL(baseUrl);
    return new URL(relativeUrl, base.origin).toString();
  } catch {
    return relativeUrl;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const targetUrl = typeof body?.url === "string" ? body.url.trim() : "";

    if (!targetUrl || (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://"))) {
      return NextResponse.json(
        { success: false, error: "올바른 http/https URL을 입력해주세요." },
        { status: 400 }
      );
    }

    // Follow redirects with custom browser User-Agent
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
      },
      redirect: "follow",
      cache: "no-store",
    });

    const finalUrl = response.url || targetUrl;
    const platform = detectPlatform(finalUrl);

    if (!response.ok) {
      return NextResponse.json({
        success: true,
        data: {
          title: "",
          imageUrl: "",
          description: "",
          platform,
          finalUrl,
          warning: `페이지 응답 상태 코드: ${response.status}. 직접 정보를 입력해주세요.`,
        },
      });
    }

    const html = await response.text();

    // Extract OpenGraph / Twitter metadata with regex
    const ogTitleMatch =
      html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i) ||
      html.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:title["']/i) ||
      html.match(/<meta\s+name=["']twitter:title["']\s+content=["']([^"']+)["']/i) ||
      html.match(/<title[^>]*>([^<]+)<\/title>/i);

    const ogImageMatch =
      html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
      html.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i) ||
      html.match(/<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i) ||
      html.match(/<link\s+rel=["']image_src["']\s+href=["']([^"']+)["']/i);

    const ogDescMatch =
      html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i) ||
      html.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:description["']/i) ||
      html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);

    let rawTitle = ogTitleMatch ? ogTitleMatch[1] : "";
    let rawImageUrl = ogImageMatch ? ogImageMatch[1] : "";
    let rawDesc = ogDescMatch ? ogDescMatch[1] : "";

    const title = cleanTitle(rawTitle);
    const imageUrl = resolveUrl(finalUrl, rawImageUrl.trim());
    const description = cleanTitle(rawDesc);

    return NextResponse.json({
      success: true,
      data: {
        title,
        imageUrl,
        description,
        platform,
        finalUrl,
      },
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "스크래핑 중 오류가 발생했습니다.";
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
