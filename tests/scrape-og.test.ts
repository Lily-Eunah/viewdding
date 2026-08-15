import { describe, it, expect } from "vitest";

describe("OG Scraper & Deep Metadata Parser Logic", () => {
  function detectPlatform(url: string): string {
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

  function extractJsRedirect(html: string, currentUrl: string): string | null {
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

  it("correctly identifies platforms from URLs", () => {
    expect(detectPlatform("https://brand.naver.com/anvely/products/10079105467")).toBe("naver");
    expect(detectPlatform("https://naver.me/xUwhMUo9")).toBe("naver");
    expect(detectPlatform("https://www.uniqlo.com/kr/ko/products/E484940-000/00")).toBe("uniqlo");
    expect(detectPlatform("https://dorosiwa.co.kr/product/골반-볼륨업-심리스-팬티/8160/")).toBe("dorosiwa");
    expect(detectPlatform("https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000223493")).toBe("oliveyoung");
  });

  it("cleans HTML entities and whitespaces in product titles", () => {
    const raw = "  [앙블리] 4cm &amp; 2cm 볼륨업 &quot;코르셋&quot; 누브라&nbsp;&nbsp;   ";
    expect(cleanTitle(raw)).toBe('[앙블리] 4cm & 2cm 볼륨업 "코르셋" 누브라');
  });

  it("extracts JS location.replace redirects for short URLs", () => {
    const htmlWithJs = `<html><head><script>window.location.replace("https://smartstore.naver.com/anvely/products/123");</script></head></html>`;
    const redirectedUrl = extractJsRedirect(htmlWithJs, "https://naver.me/xUwhMUo9");
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
});
