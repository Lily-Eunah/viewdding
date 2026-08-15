import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const CHECKED_AT = new Date().toISOString().slice(0, 10);

function normalize(value) {
  return (value ?? "")
    .toLocaleLowerCase("ko")
    .replace(/[^0-9a-z가-힣]/g, "");
}

function nameMatches(text, name) {
  const normalizedText = normalize(text);
  const normalizedName = normalize(name);
  if (normalizedText.includes(normalizedName)) return true;

  const tokens = (name ?? "")
    .toLocaleLowerCase("ko")
    .split(/[^0-9a-z가-힣]+/)
    .map(normalize)
    .filter((token) => token.length >= 2);

  return tokens.length > 0 && tokens.every((token) => normalizedText.includes(token));
}

export async function loadReviewState(root) {
  const queue = JSON.parse(
    await readFile(
      path.join(root, "scripts/data/missing-hall-photo-queue.generated.json"),
      "utf8",
    ),
  );
  const audit = JSON.parse(
    await readFile(
      path.join(root, "src/data/hall-photo-audit.generated.json"),
      "utf8",
    ),
  );
  const auditByHallId = new Map(audit.map((row) => [row.hallId, row]));
  const targets = queue.filter(
    (row) =>
      row.priority === 1 && auditByHallId.get(row.hallId)?.result === "needs_review",
  );

  let results = [];
  try {
    results = JSON.parse(
      await readFile(
        path.join(root, "scripts/data/hall-photo-naver-audit.generated.json"),
        "utf8",
      ),
    );
  } catch {
    // The first browser-review batch creates the file.
  }

  return { targets, results };
}

export async function saveReviewResults(root, results) {
  const merged = [
    ...new Map(results.map((row) => [row.hallId, row])).values(),
  ].sort((left, right) => left.hallId.localeCompare(right.hallId));
  await writeFile(
    path.join(root, "scripts/data/hall-photo-naver-audit.generated.json"),
    `${JSON.stringify(merged, null, 2)}\n`,
    "utf8",
  );
  return merged;
}

export async function reviewNaverHall(row, tab) {
  const query = `${row.venueName} ${row.hallName} 본식 후기`;

  try {
    await tab.goto(
      `https://search.naver.com/search.naver?where=nexearch&query=${encodeURIComponent(query)}`,
    );
    await tab.playwright
      .waitForLoadState({ state: "domcontentloaded", timeoutMs: 20_000 })
      .catch(() => {});

    const links = await tab.playwright.evaluate(() =>
      [...document.querySelectorAll("a[href]")]
        .map((anchor) => ({
          href: anchor.href,
          text: (anchor.innerText || anchor.textContent || "").trim(),
        }))
        .filter((link) => link.href && link.text)
        .slice(0, 600),
    );
    const posts = [
      ...new Map(
        links
          .filter((link) =>
            /^https?:\/\/(?:m\.)?blog\.naver\.com\/[^/?#]+\/\d+/.test(
              link.href,
            ),
          )
          .map((link) => [link.href.split("?")[0], link]),
      ).values(),
    ].slice(0, 1);

    for (const post of posts) {
      await tab.goto(post.href);
      await tab.playwright
        .waitForLoadState({ state: "domcontentloaded", timeoutMs: 15_000 })
        .catch(() => {});

      let meta = null;
      try {
        const frame = tab.playwright.frameLocator("iframe");
        await frame
          .locator('meta[property="og:image"]')
          .waitFor({ state: "attached", timeoutMs: 5_000 })
          .catch(() => {});
        const html = frame.locator("html");
        if (await html.count()) {
          meta = await html.evaluate((element) => ({
            title: element.ownerDocument.title,
            description:
              element.ownerDocument
                .querySelector('meta[property="og:description"]')
                ?.getAttribute("content") ?? "",
            image:
              element.ownerDocument
                .querySelector('meta[property="og:image"]')
                ?.getAttribute("content") ?? "",
            text: (element.innerText ?? "").slice(0, 7_000),
          }));
        }
      } catch {
        // Some mobile or legacy Naver posts do not use the mainFrame iframe.
      }

      if (!meta) {
        meta = await tab.playwright.evaluate(() => ({
          title: document.title,
          description:
            document
              .querySelector('meta[property="og:description"]')
              ?.getAttribute("content") ?? "",
          image:
            document
              .querySelector('meta[property="og:image"]')
              ?.getAttribute("content") ?? "",
          text: (document.body?.innerText ?? "").slice(0, 7_000),
        }));
      }

      const authoritativeText = `${meta.title ?? ""} ${meta.description ?? ""}`;
      const venueMatch = nameMatches(authoritativeText, row.venueName);
      const hallMatch = nameMatches(authoritativeText, row.hallName);
      const weddingContext = /본식|웨딩|예식|결혼식|wedding/i.test(
        `${authoritativeText} ${meta.text.slice(0, 2_500)}`,
      );

      if (
        meta.image &&
        venueMatch &&
        (hallMatch || row.venueHallCount === 1) &&
        weddingContext
      ) {
        const bareTitle = (meta.title ?? "").split(" : 네이버")[0];
        const titleIndex = meta.text.indexOf(bareTitle);
        const dateContext =
          titleIndex >= 0
            ? meta.text.slice(titleIndex, titleIndex + 500)
            : meta.text.slice(0, 1_000);
        const postDate =
          dateContext.match(/20\d{2}\.\s*\d{1,2}\.\s*\d{1,2}\.?/)?.[0] ??
          null;

        return {
          hallId: row.hallId,
          venueId: row.venueId,
          venueName: row.venueName,
          hallName: row.hallName,
          query,
          result: "candidate",
          imageUrl: meta.image,
          sourceUrl: post.href,
          sourceType: "public_listing",
          verificationMethod: "public_named_listing",
          title: meta.title,
          description: meta.description,
          postDate,
          checkedAt: CHECKED_AT,
        };
      }
    }

    return {
      hallId: row.hallId,
      venueId: row.venueId,
      venueName: row.venueName,
      hallName: row.hallName,
      query,
      result: "unresolved",
      reason:
        "네이버 최신 본식 검색결과에서 업체·개별홀명이 함께 확인되는 사진 게시물을 찾지 못함.",
      checkedAt: CHECKED_AT,
    };
  } catch (error) {
    return {
      hallId: row.hallId,
      venueId: row.venueId,
      venueName: row.venueName,
      hallName: row.hallName,
      query,
      result: "unresolved",
      reason: `네이버 브라우저 확인 중 접근 실패: ${String(error?.message ?? error).slice(0, 300)}`,
      checkedAt: CHECKED_AT,
    };
  }
}
