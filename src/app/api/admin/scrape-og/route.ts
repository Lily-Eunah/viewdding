import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-static";

type Platform = "naver" | "coupang" | "oliveyoung" | "dorosiwa" | "uniqlo" | "ably" | "zigzag" | "brand" | "other";

function detectPlatform(url: string): Platform {
  const lower = url.toLowerCase();
  if (lower.includes("naver.com") || lower.includes("naver.me")) return "naver";
  if (lower.includes("coupang.com")) return "coupang";
  if (lower.includes("oliveyoung.co.kr") || lower.includes("oy.run")) return "oliveyoung";
  if (lower.includes("dorosiwa.co.kr")) return "dorosiwa";
  if (lower.includes("uniqlo.com") || lower.includes("uniqlo.co.kr")) return "uniqlo";
  if (lower.includes("a-bly.com") || lower.includes("applink.a-bly.com")) return "ably";
  if (lower.includes("zigzag.kr") || lower.includes("kakaostyle")) return "zigzag";
  if (lower.includes("brandconnect.naver.com")) return "naver";
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

// ──────────────────────────────────────────────────────────────────────────
// Platform-specific redirect resolvers
// ──────────────────────────────────────────────────────────────────────────

/**
 * oy.run (OliveYoung affiliate shortener)
 * HTML contains: window.__SERVER_DATA__ = { targetUrl: "https://m.oliveyoung.co.kr/..." }
 * The targetUrl itself is behind WAF, so we extract it and return as finalUrl
 * for the admin to manually grab image from.
 */
function extractOyRunTargetUrl(html: string): string | null {
  const match = html.match(/__SERVER_DATA__\s*=\s*(\{[\s\S]*?\})\s*;?\s*<\/script/i);
  if (!match) return null;
  try {
    const data = JSON.parse(match[1]);
    return data.targetUrl || null;
  } catch {
    return null;
  }
}

/**
 * brandconnect.naver.com (Naver affiliate bridge)
 * URL pattern: /affiliates/{id}?channelProductNo={pno}
 * This is a CSR SPA shell with no OG tags. We reconstruct the smartstore URL.
 */
function extractNaverSmartStoreUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (!u.hostname.includes("brandconnect.naver.com")) return null;
    const channelProductNo = u.searchParams.get("channelProductNo");
    if (channelProductNo) {
      // Try fetching the smartstore product page directly
      return `https://smartstore.naver.com/main/products/${channelProductNo}`;
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * applink.a-bly.com (Ably affiliate deep link via Airbridge)
 * After HTTP redirect, lands on m.a-bly.com/goods/{id} but gets CAPTCHA 403.
 * Extract goods ID from the final URL.
 */
function extractAblyGoodsId(finalUrl: string): string | null {
  const match = finalUrl.match(/m\.a-bly\.com\/goods\/(\d+)/i);
  return match ? match[1] : null;
}

// ──────────────────────────────────────────────────────────────────────────
// Generic JS redirect & metadata parsers (existing logic preserved)
// ──────────────────────────────────────────────────────────────────────────

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

// ──────────────────────────────────────────────────────────────────────────
// Fetch with redirect following and platform-specific handling
// ──────────────────────────────────────────────────────────────────────────

const BROWSER_HEADERS = {
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

interface FetchResult {
  html: string;
  finalUrl: string;
  httpStatus: number;
  /** true if the page returned a WAF/CAPTCHA block */
  wasBlocked: boolean;
}

async function fetchHtmlWithFallback(targetUrl: string, depth = 0): Promise<FetchResult> {
  const response = await fetch(targetUrl, {
    method: "GET",
    headers: BROWSER_HEADERS,
    redirect: "follow",
    cache: "no-store",
  });

  const finalUrl = response.url || targetUrl;
  const httpStatus = response.status;
  const html = await response.text();

  // Detect WAF / CAPTCHA blocks
  const wasBlocked =
    (!response.ok && httpStatus === 403) ||
    html.includes("보안 확인 중") ||
    html.includes("잠시만 기다려 주세요") ||
    (httpStatus === 403 && html.includes("Access Denied"));

  // Check if JS redirect exists (e.g. naver.me intermediate page)
  if (depth < 2 && html && !wasBlocked) {
    const jsRedirectUrl = extractJsRedirect(html, finalUrl);
    if (jsRedirectUrl && jsRedirectUrl !== targetUrl && jsRedirectUrl !== finalUrl) {
      return fetchHtmlWithFallback(jsRedirectUrl, depth + 1);
    }
  }

  return { html, finalUrl, httpStatus, wasBlocked };
}

// ──────────────────────────────────────────────────────────────────────────
// Standard HTML metadata extraction
// ──────────────────────────────────────────────────────────────────────────

function extractMetadataFromHtml(
  html: string,
  baseUrl: string
): { title: string; imageUrl: string; description: string } {
  // 1. OpenGraph
  const ogTitleMatch =
    html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i) ||
    html.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:title["']/i);
  const ogImageMatch =
    html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
    html.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i);
  const ogDescMatch =
    html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i) ||
    html.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:description["']/i);

  // 2. Twitter Cards
  const twTitleMatch = html.match(/<meta\s+name=["']twitter:title["']\s+content=["']([^"']+)["']/i);
  const twImageMatch = html.match(/<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i);
  const twDescMatch = html.match(/<meta\s+name=["']twitter:description["']\s+content=["']([^"']+)["']/i);

  // 3. HTML fallbacks
  const htmlTitleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const htmlDescMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);

  // 4. Microdata
  const itemPropImageMatch = html.match(/<meta\s+itemprop=["']image["']\s+content=["']([^"']+)["']/i);

  // 5. Structured data
  const jsonLdData = parseJsonLd(html);
  const nextData = parseNextData(html);

  // Combine 5-tier fallback hierarchy
  let rawTitle =
    ogTitleMatch?.[1] || twTitleMatch?.[1] || jsonLdData.title || nextData.title || htmlTitleMatch?.[1] || "";
  let rawImageUrl =
    ogImageMatch?.[1] || twImageMatch?.[1] || jsonLdData.imageUrl || nextData.imageUrl || itemPropImageMatch?.[1] || "";
  let rawDesc =
    ogDescMatch?.[1] || twDescMatch?.[1] || jsonLdData.description || htmlDescMatch?.[1] || "";

  // Filter out placeholder images
  if (
    rawImageUrl.includes("blank.gif") ||
    rawImageUrl.includes("placeholder") ||
    rawImageUrl.includes("kakaomap_logo")
  ) {
    rawImageUrl = "";
  }

  return {
    title: cleanTitle(rawTitle),
    imageUrl: resolveUrl(baseUrl, rawImageUrl.trim()),
    description: cleanTitle(rawDesc),
  };
}

// ──────────────────────────────────────────────────────────────────────────
// Known WAF-blocked platforms and their manual hints
// ──────────────────────────────────────────────────────────────────────────

const MANUAL_HINTS: Record<string, string> = {
  coupang:
    "쿠팡은 강력한 봇 차단(Akamai)을 사용합니다. 상품 페이지에서 대표 이미지를 우클릭 → [이미지 주소 복사]하고, 상품명을 드래그 복사해 주세요.",
  oliveyoung:
    "올리브영은 봇 차단(WAF)을 사용합니다. 상품 페이지에서 대표 이미지를 우클릭 → [이미지 주소 복사]하고, 상품명을 드래그 복사해 주세요.",
  ably:
    "에이블리는 보안 확인(CAPTCHA)을 사용합니다. 상품 페이지에서 대표 이미지를 우클릭 → [이미지 주소 복사]하고, 상품명을 드래그 복사해 주세요.",
  brandconnect:
    "네이버 브랜드커넥트는 SPA 앱이라 자동 수집이 어렵습니다. 상품 페이지에서 대표 이미지를 우클릭 → [이미지 주소 복사]하고, 상품명을 드래그 복사해 주세요.",
};

// ──────────────────────────────────────────────────────────────────────────
// Main POST handler
// ──────────────────────────────────────────────────────────────────────────

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

    // ── Platform-specific pre-processing ──────────────────────────────

    // 1. oy.run → extract __SERVER_DATA__.targetUrl, then try to scrape it
    if (targetUrl.includes("oy.run/")) {
      const oyRes = await fetch(targetUrl, { headers: BROWSER_HEADERS, redirect: "follow" });
      const oyHtml = await oyRes.text();
      const oyTargetUrl = extractOyRunTargetUrl(oyHtml);
      const resolvedUrl = oyTargetUrl || targetUrl;

      // Try fetching the actual OliveYoung page
      if (oyTargetUrl) {
        const { html, finalUrl, wasBlocked } = await fetchHtmlWithFallback(oyTargetUrl);
        if (!wasBlocked && html) {
          const meta = extractMetadataFromHtml(html, finalUrl);
          if (meta.title || meta.imageUrl) {
            return NextResponse.json({
              success: true,
              data: {
                ...meta,
                platform: "oliveyoung" as Platform,
                finalUrl,
                canAutoScrape: true,
              },
            });
          }
        }
      }

      // OliveYoung WAF blocked → return manual hint
      return NextResponse.json({
        success: true,
        data: {
          title: "",
          imageUrl: "",
          description: "",
          platform: "oliveyoung" as Platform,
          finalUrl: oyTargetUrl || targetUrl,
          canAutoScrape: false,
          manualHint: MANUAL_HINTS.oliveyoung,
        },
      });
    }

    // 2. Coupang → known WAF block, skip fetch entirely
    if (targetUrl.includes("coupang.com/")) {
      return NextResponse.json({
        success: true,
        data: {
          title: "",
          imageUrl: "",
          description: "",
          platform: "coupang" as Platform,
          finalUrl: targetUrl,
          canAutoScrape: false,
          manualHint: MANUAL_HINTS.coupang,
        },
      });
    }

    // 3. applink.a-bly.com → known CAPTCHA block
    if (targetUrl.includes("applink.a-bly.com/")) {
      // Follow redirect to get the actual m.a-bly.com URL
      try {
        const ablyRes = await fetch(targetUrl, { headers: BROWSER_HEADERS, redirect: "follow" });
        const ablyFinalUrl = ablyRes.url || targetUrl;
        const goodsId = extractAblyGoodsId(ablyFinalUrl);

        return NextResponse.json({
          success: true,
          data: {
            title: "",
            imageUrl: "",
            description: "",
            platform: "ably" as Platform,
            finalUrl: ablyFinalUrl,
            canAutoScrape: false,
            manualHint: MANUAL_HINTS.ably,
            ...(goodsId ? { goodsId } : {}),
          },
        });
      } catch {
        return NextResponse.json({
          success: true,
          data: {
            title: "",
            imageUrl: "",
            description: "",
            platform: "ably" as Platform,
            finalUrl: targetUrl,
            canAutoScrape: false,
            manualHint: MANUAL_HINTS.ably,
          },
        });
      }
    }

    // ── Standard fetch flow ───────────────────────────────────────────

    const { html, finalUrl, wasBlocked } = await fetchHtmlWithFallback(targetUrl);
    let platform = detectPlatform(finalUrl);

    // 4. brandconnect.naver.com → CSR SPA, try reconstructing smartstore URL
    if (finalUrl.includes("brandconnect.naver.com")) {
      const smartStoreUrl = extractNaverSmartStoreUrl(finalUrl);
      if (smartStoreUrl) {
        try {
          const ssRes = await fetchHtmlWithFallback(smartStoreUrl);
          if (!ssRes.wasBlocked && ssRes.html) {
            const meta = extractMetadataFromHtml(ssRes.html, ssRes.finalUrl);
            if (meta.title || meta.imageUrl) {
              return NextResponse.json({
                success: true,
                data: {
                  ...meta,
                  platform: "naver" as Platform,
                  finalUrl: ssRes.finalUrl,
                  canAutoScrape: true,
                },
              });
            }
          }
        } catch {
          // Fall through to manual hint
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          title: "",
          imageUrl: "",
          description: "",
          platform: "naver" as Platform,
          finalUrl,
          canAutoScrape: false,
          manualHint: MANUAL_HINTS.brandconnect,
        },
      });
    }

    // 5. Generic WAF block detected (any other platform)
    if (wasBlocked || !html) {
      const platformKey = platform as string;
      return NextResponse.json({
        success: true,
        data: {
          title: "",
          imageUrl: "",
          description: "",
          platform,
          finalUrl,
          canAutoScrape: false,
          manualHint:
            MANUAL_HINTS[platformKey] ||
            "이 사이트는 자동 수집이 어렵습니다. 상품 페이지에서 이미지 주소와 상품명을 직접 복사해 주세요.",
        },
      });
    }

    // ── Standard metadata extraction ──────────────────────────────────

    const meta = extractMetadataFromHtml(html, finalUrl);

    // If we got title and image → auto scrape success
    const canAutoScrape = !!(meta.title && meta.imageUrl);

    return NextResponse.json({
      success: true,
      data: {
        ...meta,
        platform,
        finalUrl,
        canAutoScrape,
        ...(canAutoScrape
          ? {}
          : {
              manualHint:
                "일부 정보를 자동으로 가져오지 못했습니다. 누락된 항목을 직접 입력해 주세요.",
            }),
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
