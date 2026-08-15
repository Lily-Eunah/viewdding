import { describe, it, expect } from "vitest";

describe("OG Scraper & Platform Detection Logic", () => {
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
      .replace(/\s+/g, " ")
      .trim();
  }

  it("correctly identifies platforms from URLs", () => {
    expect(detectPlatform("https://brand.naver.com/anvely/products/10079105467")).toBe("naver");
    expect(detectPlatform("https://naver.me/xUwhMUo9")).toBe("naver");
    expect(detectPlatform("https://www.uniqlo.com/kr/ko/products/E484940-000/00")).toBe("uniqlo");
    expect(detectPlatform("https://dorosiwa.co.kr/product/골반-볼륨업-심리스-팬티/8160/")).toBe("dorosiwa");
    expect(detectPlatform("https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000223493")).toBe("oliveyoung");
    expect(detectPlatform("https://a-bly.com/app/goods/12345")).toBe("ably");
    expect(detectPlatform("https://zigzag.kr/catalog/products/67890")).toBe("zigzag");
    expect(detectPlatform("https://random-wedding-shop.com")).toBe("other");
  });

  it("cleans HTML entities and whitespaces in product titles", () => {
    const raw = "  [앙블리] 4cm &amp; 2cm 볼륨업 &quot;코르셋&quot; 누브라   ";
    expect(cleanTitle(raw)).toBe('[앙블리] 4cm & 2cm 볼륨업 "코르셋" 누브라');
  });
});
