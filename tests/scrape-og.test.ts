import { describe, it, expect } from "vitest";

describe("OG Scraper & Deep Metadata Parser Logic", () => {
  function detectPlatform(url: string): string {
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

  function extractJsRedirect(html: string): string | null {
    const metaMatch = html.match(/<meta\s+http-equiv=["']refresh["']\s+content=["'][^"']*url=([^"']+)["']/i);
    if (metaMatch && metaMatch[1]) {
      return metaMatch[1].trim();
    }
    const jsMatch =
      html.match(/location\s*\.\s*replace\s*\(\s*["']([^"']+)["']\s*\)/i) ||
      html.match(/location\s*(?:\.href)?\s*=\s*["']([^"']+)["']/i) ||
      html.match(/window\s*\.\s*location\s*=\s*["']([^"']+)["']/i);
    if (jsMatch && jsMatch[1]) {
      return jsMatch[1].trim();
    }
    return null;
  }

  function parseJsonLd(html: string): { title?: string; imageUrl?: string } {
    try {
      const jsonLdMatches = html.match(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
      if (!jsonLdMatches) return {};
      for (const matchStr of jsonLdMatches) {
        const contentMatch = matchStr.match(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
        if (!contentMatch || !contentMatch[1]) continue;
        const data = JSON.parse(contentMatch[1]);
        const targetObj = Array.isArray(data) ? data[0] : data;
        if (targetObj) {
          return {
            title: targetObj.name || targetObj.headline,
            imageUrl: typeof targetObj.image === "string" ? targetObj.image : targetObj.image?.url,
          };
        }
      }
    } catch {
      // Ignore
    }
    return {};
  }

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

  function extractNaverSmartStoreUrl(url: string): string | null {
    try {
      const u = new URL(url);
      if (!u.hostname.includes("brandconnect.naver.com")) return null;
      const channelProductNo = u.searchParams.get("channelProductNo");
      if (channelProductNo) {
        return `https://smartstore.naver.com/main/products/${channelProductNo}`;
      }
    } catch {
      // ignore
    }
    return null;
  }

  function extractAblyGoodsId(finalUrl: string): string | null {
    const match = finalUrl.match(/m\.a-bly\.com\/goods\/(\d+)/i);
    return match ? match[1] : null;
  }

  it("correctly identifies platforms from URLs", () => {
    expect(detectPlatform("https://brand.naver.com/anvely/products/10079105467")).toBe("naver");
    expect(detectPlatform("https://naver.me/xUwhMUo9")).toBe("naver");
    expect(detectPlatform("https://www.uniqlo.com/kr/ko/products/E484940-000/00")).toBe("uniqlo");
    expect(detectPlatform("https://dorosiwa.co.kr/product/골반-볼륨업-심리스-팬티/8160/")).toBe("dorosiwa");
    expect(detectPlatform("https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000223493")).toBe("oliveyoung");
    expect(detectPlatform("https://oy.run/g1ip6hEbG0GQsu")).toBe("oliveyoung");
    expect(detectPlatform("https://www.coupang.com/vp/products/123")).toBe("coupang");
    expect(detectPlatform("https://applink.a-bly.com/8oxuw6")).toBe("ably");
    expect(detectPlatform("https://s.zigzag.kr/abr/yAveRaoNB1")).toBe("zigzag");
  });

  it("cleans HTML entities and whitespaces in product titles", () => {
    const raw = '  [앙블리] 4cm &amp; 2cm 볼륨업 &quot;코르셋&quot; 누브라&nbsp;&nbsp;   ';
    expect(cleanTitle(raw)).toBe('[앙블리] 4cm & 2cm 볼륨업 "코르셋" 누브라');
  });

  it("extracts JS location.replace redirects for short URLs", () => {
    const htmlWithJs = `<html><head><script>window.location.replace("https://smartstore.naver.com/anvely/products/123");</script></head></html>`;
    const redirectedUrl = extractJsRedirect(htmlWithJs);
    expect(redirectedUrl).toBe("https://smartstore.naver.com/anvely/products/123");
  });

  it("extracts image and title from JSON-LD structured data fallback", () => {
    const htmlWithJsonLd = `
      <html>
        <head>
          <script type="application/ld+json">
            {
              "@context": "https://schema.org/",
              "@type": "Product",
              "name": "도로시와 골반 볼륨업 팬티",
              "image": "https://dorosiwa.co.kr/image.jpg"
            }
          </script>
        </head>
      </html>
    `;
    const parsed = parseJsonLd(htmlWithJsonLd);
    expect(parsed.title).toBe("도로시와 골반 볼륨업 팬티");
    expect(parsed.imageUrl).toBe("https://dorosiwa.co.kr/image.jpg");
  });

  it("extracts oy.run __SERVER_DATA__ targetUrl", () => {
    const html = `<html><head><script>window.__SERVER_DATA__={"targetUrl":"https://m.oliveyoung.co.kr/m/goods/getGoodsDetail.do?goodsNo=A000000235913&utm_source=shutter","status":200,"isAppOnlyUrl":false}</script></head></html>`;
    const target = extractOyRunTargetUrl(html);
    expect(target).toBe(
      "https://m.oliveyoung.co.kr/m/goods/getGoodsDetail.do?goodsNo=A000000235913&utm_source=shutter"
    );
  });

  it("reconstructs smartstore URL from brandconnect.naver.com affiliate link", () => {
    const url = "https://brandconnect.naver.com/affiliates/974820704610752?channelProductNo=11864161535";
    const result = extractNaverSmartStoreUrl(url);
    expect(result).toBe("https://smartstore.naver.com/main/products/11864161535");
  });

  it("returns null for non-brandconnect naver URLs", () => {
    const url = "https://brand.naver.com/anvely/products/10079105467";
    const result = extractNaverSmartStoreUrl(url);
    expect(result).toBeNull();
  });

  it("extracts goods ID from ably final redirect URL", () => {
    const finalUrl = "https://m.a-bly.com/goods/49251809?uid=90cc078c8389115&tracking_content=141130b8001a4c3";
    const goodsId = extractAblyGoodsId(finalUrl);
    expect(goodsId).toBe("49251809");
  });
});
