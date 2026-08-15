import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";
import type { PersonalColorRecord } from "../src/domain/personal-color-types";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");
const { loadEnvConfig } = nextEnv;
loadEnvConfig(projectRoot);

const kakaoRestApiKey = process.env.KAKAO_REST_API_KEY?.trim() ?? "";
const personalColorsPath = path.join(projectRoot, "src", "data", "personal-colors.generated.json");
const outputPath = path.join(projectRoot, "src", "data", "personal-color-photos.generated.json");

export interface PersonalColorPhotoEntry {
  vendorId: string;
  name: string;
  photoUrl: string | null;
  thumbnailUrl: string | null;
  sourceType: "kakao_place" | "none";
  placeUrl: string | null;
  updatedAt: string;
}

type PhotoCache = Record<string, PersonalColorPhotoEntry>;

function extractCleanOfficialPhotoUrl(ogImageUrl: string): string | null {
  if (!ogImageUrl) return null;

  // Filter out static maps and generic logos
  if (
    ogImageUrl.includes("staticmap") ||
    ogImageUrl.includes("default") ||
    ogImageUrl.includes("map_icon") ||
    ogImageUrl.includes("kakaomap_logo") ||
    ogImageUrl.includes("placeholder")
  ) {
    return null;
  }

  let url = ogImageUrl;
  if (url.startsWith("//")) {
    url = `https:${url}`;
  }

  const fnameMatch = url.match(/[?&]fname=([^&]+)/);
  if (fnameMatch) {
    try {
      const decoded = decodeURIComponent(fnameMatch[1]);
      url = decoded.startsWith("http://") ? decoded.replace("http://", "https://") : decoded;
    } catch {
      // keep url as is
    }
  }

  // Filter out personal blog attachments (which often contain low-quality screenshots/selfies)
  // Only accept official store photos from Kakao/Daum place CDN
  const isOfficialStorePhoto =
    url.includes("mystore") ||
    url.includes("fiy_reboot") ||
    url.includes("kakaomapPhoto") ||
    url.includes("/place/") ||
    url.includes("cfile");

  if (!isOfficialStorePhoto && (url.includes("pstatic.net") || url.includes("blogfiles"))) {
    return null; // Reject random user blog post photos in favor of clean brand visual
  }

  return url.startsWith("http://") ? url.replace("http://", "https://") : url;
}

async function fetchKakaoPlacePhoto(
  v: PersonalColorRecord
): Promise<{ photoUrl: string | null; placeUrl: string | null; sourceType: PersonalColorPhotoEntry["sourceType"] }> {
  if (!kakaoRestApiKey) {
    return { photoUrl: null, placeUrl: null, sourceType: "none" };
  }

  const queries = [
    `${v.name} ${v.sigungu}`.trim(),
    `${v.name} ${v.district}`.trim(),
    v.name.trim(),
    `${v.sigungu} ${v.name}`.trim(),
  ];

  for (const query of queries) {
    try {
      const searchUrl = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}&size=5`;
      const searchRes = await fetch(searchUrl, {
        headers: { Authorization: `KakaoAK ${kakaoRestApiKey}` },
      });

      if (searchRes.ok) {
        const searchData = (await searchRes.json()) as {
          documents?: Array<{ id: string; place_name: string; place_url: string; address_name: string; road_address_name: string }>;
        };

        if (searchData.documents && searchData.documents.length > 0) {
          const doc =
            searchData.documents.find(
              (d) =>
                d.place_name.includes(v.name) ||
                v.name.includes(d.place_name) ||
                d.address_name.includes(v.sigungu) ||
                d.road_address_name.includes(v.sigungu)
            ) ?? searchData.documents[0];

          const placeId = doc.id;
          const placeUrl = doc.place_url;

          // Fetch official place page HTML
          const pageRes = await fetch(`https://place.map.kakao.com/${placeId}`, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            },
          });

          if (pageRes.ok) {
            const html = await pageRes.text();
            const ogMatch =
              html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
              html.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i);

            if (ogMatch?.[1]) {
              const cleanPhoto = extractCleanOfficialPhotoUrl(ogMatch[1]);
              if (cleanPhoto) {
                return { photoUrl: cleanPhoto, placeUrl, sourceType: "kakao_place" };
              }
            }
          }
        }
      }
    } catch {
      // try next query
    }
  }

  return { photoUrl: null, placeUrl: null, sourceType: "none" };
}

async function main() {
  console.log("Starting Wedding Personal Color official store photos collection...");

  const raw = await fs.readFile(personalColorsPath, "utf-8");
  const vendors = JSON.parse(raw) as PersonalColorRecord[];

  const cache: PhotoCache = {};
  const now = new Date().toISOString();
  let successCount = 0;
  let fallbackCount = 0;

  for (let i = 0; i < vendors.length; i += 1) {
    const v = vendors[i];
    const key = v.id;

    const { photoUrl, placeUrl, sourceType } = await fetchKakaoPlacePhoto(v);

    if (photoUrl) {
      successCount += 1;
      v.photoUrl = photoUrl;
      console.log(`[${i + 1}/${vendors.length}] Official store photo for ${v.name}: ${photoUrl.slice(0, 70)}...`);
    } else {
      fallbackCount += 1;
      v.photoUrl = null;
      console.log(`[${i + 1}/${vendors.length}] Clean brand visual for ${v.name}`);
    }

    cache[key] = {
      vendorId: v.id,
      name: v.name,
      photoUrl,
      thumbnailUrl: photoUrl,
      sourceType,
      placeUrl,
      updatedAt: now,
    };
  }

  // Save photos cache and updated personal-colors.generated.json
  await fs.writeFile(outputPath, JSON.stringify(cache, null, 2), "utf-8");
  await fs.writeFile(personalColorsPath, JSON.stringify(vendors, null, 2), "utf-8");

  console.log(`\nOfficial store photos collection summary:`);
  console.log(`Total: ${vendors.length}`);
  console.log(`Official store photos: ${successCount}`);
  console.log(`Clean brand visual: ${fallbackCount}`);
  console.log(`Saved to ${outputPath}`);
}

main().catch((err) => {
  console.error("Photo build failed:", err);
  process.exit(1);
});
