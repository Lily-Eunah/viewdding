import hallsJson from "./halls.generated.json";
import discoveredPhotoSeedsJson from "./hall-photos.discovered.generated.json";
import hallPhotoReplacementsJson from "./hall-photo-replacements.generated.json";
import hallPhotoVerificationOverridesJson from "./hall-photo-verification.generated.json";
import {
  siblingDuplicateHallIds,
  verificationForPhoto,
  type HallPhotoVerificationOverrides,
} from "../domain/hall-photo-audit";
import type { HallPhoto } from "@/domain/types";

// Images remain hosted by their source pages. A linked source status does not
// imply that Viewdding owns the copyright or has a separate reuse license.
type OfficialPhotoSeed = Pick<
  HallPhoto,
  "url" | "sourceUrl" | "photoKind"
>;

type DiscoveredPhotoSeed = OfficialPhotoSeed &
  Pick<HallPhoto, "sourceType" | "usageStatus" | "checkedAt"> & {
    hallId: string;
  };

type ReplacementPhotoSeed = DiscoveredPhotoSeed;

const officialPhotoSeeds: Readonly<Record<string, OfficialPhotoSeed>> = {
  "H-SEO-20260728-002": {
    url: "https://cdn.imweb.me/upload/S20200508a1f500ca054db/f990d1d98f92a.png",
    sourceUrl: "https://chungdamvilladegd.com/EspaceEmpyree",
    photoKind: "wedding_setup",
  },
  "H-SEO-20260728-004": {
    url: "https://www.hotelnaruseoul.com/wp-content/uploads/sites/18/2023/02/NR-MG-Naru-Ballroom-round-wall_logo-2200x1200.jpg",
    sourceUrl: "https://www.hotelnaruseoul.com/meetings-events/naru-ballroom/",
    photoKind: "space_overview",
  },
  "H-SEO-20260728-009": {
    url: "https://www.shillahotels.com/hbcimages/260528/20260528222328_80eda37f-bc62-4405-adcb-46a3602a1f00.jpg",
    sourceUrl: "https://www.shillahotels.com/ko/theshilla/seoul/meetingEvent/event/grandballroom.do",
    photoKind: "space_overview",
  },
  "H-SEO-20260728-014": {
    url: "https://www.theraum.co.kr/_skin/raum_251230/img/etc/w_majestic_01.jpg",
    sourceUrl: "https://www.theraum.co.kr/content/content.php?cont=wedding",
    photoKind: "wedding_setup",
  },
  "H-SEO-20260728-015": {
    url: "https://www.theraum.co.kr/_skin/raum_251230/img/etc/w_grass_01.jpg",
    sourceUrl: "https://www.theraum.co.kr/content/content.php?cont=wedding",
    photoKind: "wedding_setup",
  },
  "H-SEO-20260728-016": {
    url: "https://www.theraum.co.kr/_skin/raum_251230/img/etc/w_pond_01.jpg",
    sourceUrl: "https://www.theraum.co.kr/content/content.php?cont=wedding",
    photoKind: "wedding_setup",
  },
  "H-SEO-20260728-017": {
    url: "https://www.theraum.co.kr/_skin/raum_251230/img/etc/w_chamber_01.jpg",
    sourceUrl: "https://www.theraum.co.kr/content/content.php?cont=wedding",
    photoKind: "wedding_setup",
  },
  "H-SEO-20260728-026": {
    url: "https://wedding.seoulwomen.or.kr/app/uploads/2024/05/36-scaled.jpg",
    sourceUrl: "https://wedding.seoulwomen.or.kr/facilities/372",
    photoKind: "space_overview",
  },
  "H-SEO-20260728-030": {
    url: "https://www.sonofeliceconvention.com/homepage/images/sub/img_diamon02_edit_20251231.jpg",
    sourceUrl: "https://www.sonofeliceconvention.com/subMain/space.sc",
    photoKind: "wedding_setup",
  },
  "H-SEO-20260728-031": {
    url: "https://thecheongdam.com/wp-content/uploads/2025/06/BHK001921-1024x683.jpg",
    sourceUrl: "https://thecheongdam.com/noblesse/",
    photoKind: "wedding_setup",
  },
  "H-SEO-20260728-059": {
    url: "https://wedding.seoulwomen.or.kr/app/uploads/2024/05/%EC%8B%9D%EC%9E%A5-scaled.jpg",
    sourceUrl: "https://wedding.seoulwomen.or.kr/facilities/588",
    photoKind: "wedding_setup",
  },
  "H-SEO-20260728-062": {
    url: "https://wedding.seoulwomen.or.kr/app/uploads/2025/06/%EC%9B%94%EB%93%9C%EC%BB%B5%EA%B3%B5%EC%9B%90-%ED%8F%89%ED%99%94%EC%9E%94%EB%94%94%EA%B4%91%EC%9E%A5%EC%B2%AB%EC%98%88%EC%8B%9D%EC%9D%B4%EB%B2%A4%ED%8A%B81-scaled.jpg",
    sourceUrl: "https://wedding.seoulwomen.or.kr/facilities/3480",
    photoKind: "wedding_setup",
  },
  "H-SEO-20260728-065": {
    url: "https://d3n14jmbdg5y6n.cloudfront.net/wp-content/uploads/2019/02/file-1.png",
    sourceUrl: "https://www.rysehotel.co.kr/ryse_wedding/",
    photoKind: "wedding_setup",
  },
  "H-SEO-20260728-066": {
    url: "https://www.seoulgarden.co.kr/SeoulGarden_common/images/homepage/wedding/wedding03.jpg",
    sourceUrl: "https://www.seoulgarden.co.kr/view/viewLink.do?page=homepage%2FKOR%2Ffacilities%2Fwedding",
    photoKind: "wedding_setup",
  },
  "H-SEO-20260728-076": {
    url: "https://wedding.seoulwomen.or.kr/app/uploads/2025/06/%EC%9E%A5%EC%B6%A9%EC%9E%90%EB%9D%BD-scaled.jpg",
    sourceUrl: "https://wedding.seoulwomen.or.kr/facilities/3190",
    photoKind: "space_overview",
  },
  "H-SEO-20260728-080": {
    url: "https://ambatel.com/RES/PRODUCT/202602/novoteldongdaemunwedding_11_20260223110233.png",
    sourceUrl: "https://ambatel.com/novotel/dongdaemun/ko/weddingView.do?wedding_contents_seq=63",
    photoKind: "wedding_setup",
  },
  "H-SEO-20260728-082": {
    url: "https://cdn.imweb.me/thumbnail/20250219/83775beda9e92.jpg",
    sourceUrl: "https://www.laviedouce.co.kr/20",
    photoKind: "wedding_setup",
  },
  "H-SEO-20260729-105": {
    url: "https://thecheongdam.com/wp-content/uploads/2025/06/BHK00208-1-1024x683.jpg",
    sourceUrl: "https://thecheongdam.com/thedome/",
    photoKind: "wedding_setup",
  },
  "H-SEO-20260729-120": {
    url: "https://storage.googleapis.com/cr-resource/image/a5e7d71783ddc98b29857ebc97c85165/sunwoongak/650/f7b0e6b2009510845a07288bdf246ca2.jpg?_1786074423",
    sourceUrl: "https://www.sunwoongak-kwedding.com/",
    photoKind: "space_overview",
  },
  "H-SEO-20260729-128": {
    url: "https://cdn.imweb.me/thumbnail/20251002/3abc37007d44f.jpg",
    sourceUrl: "https://www.botanicparkwedding.com/orchid",
    photoKind: "wedding_setup",
  },
  "H-SEO-20260729-131": {
    url: "https://wedding.seoulwomen.or.kr/app/uploads/2025/06/%EA%B0%95%EC%84%9C%EA%B5%AC_%EC%84%9C%EC%9A%B8%EC%8B%9D%EB%AC%BC%EC%9B%90-%EC%82%AC%EC%83%89%EC%9D%98%EC%A0%95%EC%9B%90.png",
    sourceUrl: "https://wedding.seoulwomen.or.kr/facilities/3209",
    photoKind: "space_overview",
  },
  "H-SEO-20260729-132": {
    url: "https://wedding.seoulwomen.or.kr/app/uploads/2025/06/%EC%84%9C%EC%9A%B8%EC%8B%9D%EB%AC%BC%EC%9B%90-1.png",
    sourceUrl: "https://wedding.seoulwomen.or.kr/facilities/3201",
    photoKind: "space_overview",
  },
  "H-SEO-20260729-133": {
    url: "https://wedding.seoulwomen.or.kr/app/uploads/2025/06/12.%EC%96%B4%EC%9A%B8%EB%A6%BC%ED%94%8C%EB%9D%BC%EC%9E%90.png",
    sourceUrl: "https://wedding.seoulwomen.or.kr/facilities/3214",
    photoKind: "space_overview",
  },
  "H-SEO-20260729-138": {
    url: "https://wedding.seoulwomen.or.kr/app/uploads/2025/06/14.%EC%84%9C%EC%9A%B8%EC%8B%9C%EB%AF%BC%EB%8C%80%ED%95%99.png",
    sourceUrl: "https://wedding.seoulwomen.or.kr/facilities/3223",
    photoKind: "space_overview",
  },
  "H-SEO-20260729-144": {
    url: "https://cdn.imweb.me/upload/S2025052038998f58f091c/b4106cf0f0c71.png",
    sourceUrl: "https://www.weddingsquare.co.kr/",
    photoKind: "wedding_setup",
  },
  "H-SEO-20260729-150": {
    url: "https://wedding.seoulwomen.or.kr/app/uploads/2025/06/%EC%96%B4%EB%A6%B0%EC%9D%B4%EB%8C%80%EA%B3%B5%EC%9B%90_2-scaled.jpg",
    sourceUrl: "https://wedding.seoulwomen.or.kr/facilities/3200",
    photoKind: "wedding_setup",
  },
  "H-SEO-20260729-160": {
    url: "https://wedding.seoulwomen.or.kr/app/uploads/2025/06/%ED%91%B8%EB%A5%B8%EC%88%98%EB%AA%A9%EC%9B%90-%EC%9E%94%EB%94%94%EB%A7%88%EB%8B%B9-%EC%82%AC%EC%A7%841-4-scaled.jpg",
    sourceUrl: "https://wedding.seoulwomen.or.kr/facilities/3202",
    photoKind: "space_overview",
  },
  "H-SEO-20260729-162": {
    url: "https://wedding.seoulwomen.or.kr/app/uploads/2025/06/31.%EA%B8%88%EC%B2%9C%EA%B5%AC-%EB%85%B9%EC%83%89%EA%B4%91%EC%9E%A5-%EC%9E%94%EB%94%94%EB%A7%88%EB%8B%B9-scaled.jpg",
    sourceUrl: "https://wedding.seoulwomen.or.kr/facilities/3204",
    photoKind: "space_overview",
  },
  "H-SEO-20260729-163": {
    url: "https://cdn.imweb.me/thumbnail/20251107/6bb24b4911555.jpg",
    sourceUrl: "https://bntconvention.com/hall",
    photoKind: "wedding_setup",
  },
  "H-SEO-20260729-166": {
    url: "https://wedding.seoulwomen.or.kr/app/uploads/2025/06/%ED%99%94%EB%9E%91%EB%8C%80-%EC%B2%A0%EB%8F%84-1.png",
    sourceUrl: "https://wedding.seoulwomen.or.kr/facilities/3205",
    photoKind: "space_overview",
  },
  "H-SEO-20260729-170": {
    url: "https://wedding.seoulwomen.or.kr/app/uploads/2025/06/17.%EB%8F%84%EB%B4%89%EA%B5%AC%EC%B2%AD%EC%84%A0%EC%9D%B8%EB%B4%89%ED%99%80.jpg",
    sourceUrl: "https://wedding.seoulwomen.or.kr/facilities/3220",
    photoKind: "space_overview",
  },
  "H-SEO-20260729-171": {
    url: "https://wedding.seoulwomen.or.kr/app/uploads/2025/06/18.%EC%B4%88%EC%95%88%EC%82%B0%EA%B0%80%EB%93%9C%EB%8B%9D%EC%84%BC%ED%84%B0.jpg",
    sourceUrl: "https://wedding.seoulwomen.or.kr/facilities/3222",
    photoKind: "space_overview",
  },
  "H-SEO-20260729-184": {
    url: "https://wedding.seoulwomen.or.kr/app/uploads/2024/05/KakaoTalk_20251001_111338926-scaled.jpg",
    sourceUrl: "https://wedding.seoulwomen.or.kr/facilities/520",
    photoKind: "wedding_setup",
  },
  "H-SEO-20260729-191": {
    url: "https://wedding.seoulwomen.or.kr/app/uploads/2025/06/30.%EC%84%9C%EB%8C%80%EB%AC%B8%EC%95%88%EC%82%B0%EC%9E%94%EB%94%94%EB%A7%88%EB%8B%B9.png",
    sourceUrl: "https://wedding.seoulwomen.or.kr/facilities/3203",
    photoKind: "space_overview",
  },
  "H-SEO-20260729-192": {
    url: "https://wedding.seoulwomen.or.kr/app/uploads/2025/06/%EC%B2%AD%EB%85%84%EC%98%88%EC%88%A0%EC%B2%AD.jpg",
    sourceUrl: "https://wedding.seoulwomen.or.kr/facilities/3211",
    photoKind: "space_overview",
  },
  "H-SEO-20260729-200": {
    url: "https://cdn.imweb.me/thumbnail/20250724/7c055fd75d8b1.jpg",
    sourceUrl: "https://www.saintmaries.co.kr/",
    photoKind: "wedding_setup",
  },
  "H-SEO-20260729-215": {
    url: "https://wedding.seoulwomen.or.kr/app/uploads/2025/06/%EC%84%9C%EC%9A%B8%EA%B5%90%EB%8C%80-%EA%B7%B8%EB%9E%9C%EB%93%9C%ED%99%80.png",
    sourceUrl: "https://wedding.seoulwomen.or.kr/facilities/3224",
    photoKind: "space_overview",
  },
  "H-SEO-20260729-217": {
    url: "https://wedding.seoulwomen.or.kr/app/uploads/2025/06/10.%EC%84%9C%EC%9A%B8%EB%AC%B8%ED%99%94%EC%98%88%EC%88%A0%EA%B5%90%EC%9C%A1%EC%84%BC%ED%84%B0%EC%84%9C%EC%B4%88.png",
    sourceUrl: "https://wedding.seoulwomen.or.kr/facilities/3212",
    photoKind: "space_overview",
  },
  "H-SEO-20260729-224": {
    url: "https://wedding.seoulwomen.or.kr/app/uploads/2025/06/%EC%84%9C%EC%9A%B8%EC%88%B2-%EC%84%A4%EB%A0%98%EC%A0%95%EC%9B%901-1.jpg",
    sourceUrl: "https://wedding.seoulwomen.or.kr/facilities/3199",
    photoKind: "space_overview",
  },
  "H-SEO-20260729-225": {
    url: "https://wedding.seoulwomen.or.kr/app/uploads/2026/02/KakaoTalk_20260629_132237743_01-scaled.jpg",
    sourceUrl: "https://wedding.seoulwomen.or.kr/facilities/6411",
    photoKind: "space_overview",
  },
  "H-SEO-20260729-247": {
    url: "https://wedding.seoulwomen.or.kr/app/uploads/2025/06/%ED%95%9C%EC%84%B1%EB%B0%B1%EC%A0%9C1-1.jpeg",
    sourceUrl: "https://wedding.seoulwomen.or.kr/facilities/3198",
    photoKind: "space_overview",
  },
  "H-SEO-20260729-267": {
    url: "https://wedding.seoulwomen.or.kr/app/uploads/2025/06/13.%EC%98%81%EC%A4%91%EC%A2%85%ED%95%A9%EC%82%AC%ED%9A%8C%EB%B3%B5%EC%A7%80%EA%B4%80-1.png",
    sourceUrl: "https://wedding.seoulwomen.or.kr/facilities/3215",
    photoKind: "space_overview",
  },
  "H-SEO-20260729-279": {
    url: "https://wedding.seoulwomen.or.kr/app/uploads/2025/06/%EB%82%A8%EC%82%B0-%ED%95%9C%EB%82%A8-%EC%9B%A8%EB%94%A9%EA%B0%80%EB%93%A0-scaled.jpg",
    sourceUrl: "https://wedding.seoulwomen.or.kr/facilities/3191",
    photoKind: "space_overview",
  },
  "H-SEO-20260729-280": {
    url: "https://wedding.seoulwomen.or.kr/app/uploads/2025/07/3.jpg",
    sourceUrl: "https://wedding.seoulwomen.or.kr/facilities/4187",
    photoKind: "wedding_setup",
  },
  "H-SEO-20260729-284": {
    url: "https://wedding.seoulwomen.or.kr/app/uploads/2025/06/11.%EC%84%9C%EC%9A%B8%EB%AC%B8%ED%99%94%EC%98%88%EC%88%A0%EA%B5%90%EC%9C%A1%EC%84%BC%ED%84%B0%EC%9D%80%ED%8F%89.png",
    sourceUrl: "https://wedding.seoulwomen.or.kr/facilities/3213",
    photoKind: "space_overview",
  },
  "H-SEO-20260729-298": {
    url: "https://wedding.seoulwomen.or.kr/app/uploads/2025/06/21.%EB%B0%B1%EC%9D%B8%EC%A0%9C%EA%B0%80%EC%98%A5.jpg",
    sourceUrl: "https://wedding.seoulwomen.or.kr/facilities/3208",
    photoKind: "space_overview",
  },
  "H-SEO-20260729-305": {
    url: "https://cdn.imweb.me/upload/S20250617bb376dcf6ff0e/d8cea9329d49b.png",
    sourceUrl: "https://www.weddingsquare.co.kr/",
    photoKind: "wedding_setup",
  },
  "H-SEO-20260729-306": {
    url: "https://cdn.imweb.me/upload/S20250617bb376dcf6ff0e/b99a488fd92db.png",
    sourceUrl: "https://www.weddingsquare.co.kr/",
    photoKind: "wedding_setup",
  },
  "H-SEO-20260730-001": {
    url: "https://lunasgarden.co.kr/images/main_01.jpg",
    sourceUrl: "https://lunasgarden.co.kr/",
    photoKind: "wedding_setup",
  },
  "H-SEO-20260730-005": {
    url: "https://arteseoul.kr/images/lumiere_1.jpg",
    sourceUrl: "https://arteseoul.kr/",
    photoKind: "wedding_setup",
  },
};

const discoveredPhotoSeeds = discoveredPhotoSeedsJson as DiscoveredPhotoSeed[];
const replacementPhotoSeeds = hallPhotoReplacementsJson as ReplacementPhotoSeed[];
const allPhotoSeeds: Readonly<Record<string, OfficialPhotoSeed | DiscoveredPhotoSeed>> = {
  ...officialPhotoSeeds,
  ...Object.fromEntries(discoveredPhotoSeeds.map(({ hallId, ...photo }) => [hallId, photo])),
  ...Object.fromEntries(replacementPhotoSeeds.map(({ hallId, ...photo }) => [hallId, photo])),
};

const photoSeedRows = Object.entries(allPhotoSeeds).map(([hallId, photo]) => ({
  hallId,
  url: photo.url,
}));
const duplicateHallIds = siblingDuplicateHallIds(hallsJson, photoSeedRows);
const verificationOverrides =
  hallPhotoVerificationOverridesJson as HallPhotoVerificationOverrides;

const hallLabelsById = new Map(
  hallsJson.map((hall) => [
    hall.id,
    { venueName: hall.venueName, hallName: hall.hallName },
  ]),
);

export const hallPhotosByHallId: Readonly<Record<string, readonly HallPhoto[]>> =
  Object.fromEntries(
    Object.entries(allPhotoSeeds).map(([hallId, photo]) => {
      const label = hallLabelsById.get(hallId);
      const venueName = label?.venueName ?? "Viewdding";
      const hallName = label?.hallName ?? hallId;
      const sourceType = "sourceType" in photo ? photo.sourceType : "official_website";
      const usageStatus =
        "usageStatus" in photo ? photo.usageStatus : "official_source_linked";
      const sourceName =
        sourceType === "public_listing"
          ? "\uacf5\uac1c \uc6e8\ub529 \uc815\ubcf4 \ud398\uc774\uc9c0"
          : photo.sourceUrl.includes("wedding.seoulwomen.or.kr")
            ? "\uc11c\uc6b8\uc2dc \ub354 \uc544\ub984\ub2e4\uc6b4 \uacb0\ud63c\uc2dd \uacf5\uc2dd \ud398\uc774\uc9c0"
            : `${venueName} \uacf5\uc2dd \ud648\ud398\uc774\uc9c0`;
      const altSuffix =
        photo.photoKind === "wedding_setup"
          ? "\uc608\uc2dd \uc138\ud305 \uc804\uacbd"
          : "\uacf5\uac04 \uc804\uacbd";
      const verification = verificationForPhoto(
        hallId,
        duplicateHallIds,
        verificationOverrides,
      );

      return [
        hallId,
        [
          {
            id: `P-${hallId}-01`,
            ...photo,
            ...verification,
            sourceName,
            alt: `${venueName} ${hallName} ${altSuffix}`,
            sourceType,
            usageStatus,
            checkedAt: "checkedAt" in photo ? photo.checkedAt : "2026-08-07",
            isPrimary: true,
          },
        ],
      ];
    }),
  );

const publicUsageStatuses = new Set<HallPhoto["usageStatus"]>([
  "official_source_linked",
  "public_source_linked",
  "partner_provided",
  "licensed",
]);

export function photosForHall(hallId: string): HallPhoto[] {
  return [...(hallPhotosByHallId[hallId] ?? [])]
    .filter(
      (photo) =>
        publicUsageStatuses.has(photo.usageStatus) &&
        photo.identityStatus === "hall_confirmed",
    )
    .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));
}
