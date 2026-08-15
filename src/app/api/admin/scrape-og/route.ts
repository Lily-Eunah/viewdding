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
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function resolveUrl(baseUrl: string, relativeUrl: string): string {
  if (!relativeUrl) return "";
  let url = relativeUrl.trim();
  if (url.startsWith("//")) {
    return `https:${url}`;
  }
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  try {
    const base = new URL(baseUrl);
    return new URL(url, base.origin).toString();
  } catch {
    return url;
  }
}

/**
 * Extract Javascript redirect URL if page contains window.location / meta refresh
 */
function extractJsRedirect(html: string, currentUrl: string): string | null {
  // 1. Meta refresh
  const metaMatch = html.match(/<meta\s+http-equiv=["']refresh["']\s+content=["'][^"']*url=([^"']+)["']/i);
  if (metaMatch && metaMatch[1]) {
    return resolveUrl(currentUrl, metaMatch[1].trim());
  }

  // 2. JS location.replace("...") or location.href = "..."
  const jsMatch =
    html.match(/location\s*\.\s*replace\s*\(\s*["']([^"']+)["']\s*\)/i) ||
    html.match(/location\s*(?:\.href)?\s*=\s*["']([^"']+)["']/i) ||
    html.match(/window\s*\.\s*location\s*=\s*["']([^"']+)["']/i);

  if (jsMatch && jsMatch[1]) {
    const target = jsMatch[1].trim();
    if (target.startsWith("http://") || target.startsWith("https://") || target.startsWith("/")) {
      return resolveUrl(currentUrl, target);
    }
  }

  return null;
}

/**
 * Parse JSON-LD structured data for images & title
 */
function parseJsonLd(html: string): { title?: string; imageUrl?: string; description?: string } {
  try {
    const jsonLdMatches = html.match(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
    if (!jsonLdMatches) return {};

    for (const matchStr of jsonLdMatches) {
      const contentMatch = matchStr.match(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
      if (!contentMatch || !contentMatch[1]) continue;

      try {
        const data = JSON.parse(contentMatch[1]);
        const targetObj = Array.isArray(data) ? data[0] : data;

        if (!targetObj) continue;

        let title = targetObj.name || targetObj.headline || targetObj.title;
        let imageUrl: string | undefined;

        if (typeof targetObj.image === "string") {
          imageUrl = targetObj.image;
        } else if (Array.isArray(targetObj.image) && targetObj.image.length > 0) {
          imageUrl = typeof targetObj.image[0] === "string" ? targetObj.image[0] : targetObj.image[0]?.url;
        } else if (targetObj.image?.url) {
          imageUrl = targetObj.image.url;
        }

        const description = targetObj.description;

        if (title || imageUrl) {
          return {
            title: typeof title === "string" ? title : undefined,
            imageUrl: typeof imageUrl === "string" ? imageUrl : undefined,
            description: typeof description === "string" ? description : undefined,
          };
        }
      } catch {
        // Continue to next JSON-LD block
      }
    }
  } catch {
    // Ignore JSON-LD parse error
  }
  return {};
}

/**
 * Parse Next.js __NEXT_DATA__ script payload
 */
function parseNextData(html: string): { title?: string; imageUrl?: string } {
  try {
    const match = html.match(/<script\s+id=["']__NEXT_DATA__["']\s+type=["']application\/json["'][^>]*>([\s\S]*?)<\/script>/i);
    if (!match || !match[1]) return {};

    const data = JSON.parse(match[1]);
    const pageProps = data?.props?.pageProps;

    if (!pageProps) return {};

    const product = pageProps.product || pageProps.goods || pageProps.item || pageProps.initialData;
    if (product) {
      const title = product.name || product.title || product.goodsName;
      const imageUrl = product.imageUrl || product.image || product.thumbnailUrl || (product.images && product.images[0]);
      return {
        title: typeof title === "string" ? title : undefined,
        imageUrl: typeof imageUrl === "string" ? imageUrl : undefined,
      };
    }
  } catch {
    // Ignore Next.js data parse error
  }
  return {};
}

async function fetchHtmlWithFallback(targetUrl: string, depth = 0): Promise<{ html: string; finalUrl: string }> {
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
    "Sec-Ch-Ua": '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
    "Sec-Ch-Ua-Mobile": "?0",
    "Sec-Ch-Ua-Platform": '"Windows"',
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "cross-site",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1",
  };

  const response = await fetch(targetUrl, {
    method: "GET",
    headers,
    redirect: "follow",
    cache: "no-store",
  });

  const finalUrl = response.url || targetUrl;
  const html = response.ok ? await response.text() : "";

  // Check if JS redirect exists (e.g. naver.me intermediate page)
  if (depth < 2 && html) {
    const jsRedirectUrl = extractJsRedirect(html, finalUrl);
    if (jsRedirectUrl && jsRedirectUrl !== targetUrl && jsRedirectUrl !== finalUrl) {
      return fetchHtmlWithFallback(jsRedirectUrl, depth + 1);
    }
  }

  return { html, finalUrl };
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

    const { html, finalUrl } = await fetchHtmlWithFallback(targetUrl);
    const platform = detectPlatform(finalUrl);

    if (!html) {
      return NextResponse.json({
        success: true,
        data: {
          title: "",
          imageUrl: "",
          description: "",
          platform,
          finalUrl,
          warning: "페이지 HTML을 불러오지 못했습니다. 직접 입력해 주세요.",
        },
      });
    }

    // 1. OpenGraph extraction
    const ogTitleMatch =
      html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i) ||
      html.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:title["']/i);

    const ogImageMatch =
      html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
      html.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i);

    const ogDescMatch =
      html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i) ||
      html.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:description["']/i);

    // 2. Twitter Cards extraction
    const twTitleMatch = html.match(/<meta\s+name=["']twitter:title["']\s+content=["']([^"']+)["']/i);
    const twImageMatch = html.match(/<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i);
    const twDescMatch = html.match(/<meta\s+name=["']twitter:description["']\s+content=["']([^"']+)["']/i);

    // 3. Fallback <title> and <meta name="description">
    const htmlTitleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const htmlDescMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);

    // 4. Fallback Microdata itemprop="image"
    const itemPropImageMatch = html.match(/<meta\s+itemprop=["']image["']\s+content=["']([^"']+)["']/i);

    // 5. JSON-LD and NextData parsing
    const jsonLdData = parseJsonLd(html);
    const nextData = parseNextData(html);

    // Combine 5-tier fallback hierarchy
    let rawTitle =
      ogTitleMatch?.[1] ||
      twTitleMatch?.[1] ||
      jsonLdData.title ||
      nextData.title ||
      htmlTitleMatch?.[1] ||
      "";

    let rawImageUrl =
      ogImageMatch?.[1] ||
      twImageMatch?.[1] ||
      jsonLdData.imageUrl ||
      nextData.imageUrl ||
      itemPropImageMatch?.[1] ||
      "";

    let rawDesc =
      ogDescMatch?.[1] ||
      twDescMatch?.[1] ||
      jsonLdData.description ||
      htmlDescMatch?.[1] ||
      "";

    // Filter out placeholder/icon/logo images
    if (
      rawImageUrl.includes("blank.gif") ||
      rawImageUrl.includes("placeholder") ||
      rawImageUrl.includes("kakaomap_logo")
    ) {
      rawImageUrl = "";
    }

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
