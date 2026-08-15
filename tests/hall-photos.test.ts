import { describe, expect, it } from "vitest";
import hallsJson from "../src/data/halls.generated.json";
import visualRejectionsJson from "../src/data/hall-photo-visual-rejections.generated.json";
import { hallPhotosByHallId, photosForHall } from "../src/data/hall-photos";
import {
  duplicatePhotoHallIds,
  isKnownRejectedHallPhotoAsset,
  isRejectedHallPhotoAsset,
} from "../src/domain/hall-photo-audit";

describe("hall photo registry", () => {
  const hallIds = new Set(hallsJson.map((hall) => hall.id));
  const entries = Object.entries(hallPhotosByHallId);

  it("publishes the verified and source-linked hall photo set", () => {
    expect(entries.length).toBeGreaterThan(0);
    expect(entries.flatMap(([, photos]) => photos)).toHaveLength(entries.length);
  });

  it("only references existing halls", () => {
    for (const [hallId] of entries) expect(hallIds.has(hallId)).toBe(true);
  });

  it("publishes traceable HTTPS photos with explicit source status", () => {
    for (const photos of Object.values(hallPhotosByHallId)) {
      for (const photo of photos) {
        expect(photo.url).toMatch(/^https:\/\//);
        expect(photo.sourceUrl).toMatch(/^https:\/\//);
        const parsedPhotoUrl = new URL(photo.url);
        expect(parsedPhotoUrl.hostname).not.toMatch(/https?$/i);
        expect(parsedPhotoUrl.pathname).not.toMatch(/https?\/\//i);
        expect(["official_website", "public_listing"]).toContain(photo.sourceType);
        expect(["official_source_linked", "public_source_linked"]).toContain(
          photo.usageStatus,
        );
        expect(["wedding_setup", "space_overview"]).toContain(photo.photoKind);
        expect(["hall_confirmed", "venue_only", "needs_review"]).toContain(
          photo.identityStatus,
        );
        expect(photo.alt.length).toBeGreaterThan(10);
      }
    }
  });

  it("returns primary photos first and no placeholder for missing halls", () => {
    expect(photosForHall("missing-hall")).toEqual([]);
  });

  it("does not publish an unverified venue image as multiple sibling hall photos", () => {
    const photoSeeds = entries.flatMap(([hallId, photos]) =>
      photos.map((photo) => ({ hallId, url: photo.url })),
    );
    const duplicateHallIds = duplicatePhotoHallIds(photoSeeds);

    expect(duplicateHallIds.size).toBeGreaterThan(0);
    for (const hallId of duplicateHallIds) {
      expect(photosForHall(hallId)).toEqual([]);
    }
  });

  it("never publishes UI assets as hall photos", () => {
    for (const [hallId] of entries) {
      for (const photo of photosForHall(hallId)) {
        expect(photo.url).not.toMatch(
          /\/(?:txt|logos?|icons?)\/|(?:^|\/)(?:txt_|slide[_-]?arr|arrow|btn[_-]|sprite)/i,
        );
      }
    }
  });

  it.each([
    "https://example.com/assets/logo.svg",
    "https://example.com/images/icon-heart.png",
    "https://example.com/uploads/button-download.jpg",
    "https://example.com/user/NEWS/award-winner.jpg",
    "https://example.com/gallery/reservation-room.jpg",
    "https://example.com/photos/meeting-room-1.jpg",
    "https://example.com/photos/profile-person.jpg",
  ])("rejects non-hall asset %s", (url) => {
    expect(isRejectedHallPhotoAsset({ url })).toBe(true);
  });

  it.each([
    "https://www.hotelnaruseoul.com/wp-content/uploads/sites/18/2026/03/%EB%B8%8C%EB%A1%9C%EC%8A%88%EC%96%B4-%EB%B2%84%ED%8A%BC-300x54.jpg",
    "https://www.snufacultyclub.com/assets/images/main/top_btn_pc.png",
    "https://u.kyusoodang.co.kr/attachList/upload/user/NEWS/c20240310172441363/img20240310172545977.jpg",
    "https://www.pharosconvention.co.kr/attachList/upload/user/NEWS/em20260423120910550.jpg",
    "https://cache.marriott.com/content/dam/marriott-renditions/SELFG/selfg-meeting-room-3277-hor-wide.jpg?output-quality=70&interpolation=progressive-bilinear&downsize=1336px:*",
    "https://wedding.seoulwomen.or.kr/app/uploads/2024/05/36-scaled.jpg",
  ])("keeps a regression blocklist for the six reported bad images: %s", (url) => {
    expect(isRejectedHallPhotoAsset({ url })).toBe(true);
  });

  it.each([
    { url: "https://example.com/photo.jpg", alt: "수상 이미지" },
    { url: "https://example.com/photo.jpg", alt: "예약실 안내" },
    { url: "https://example.com/photo.jpg", context: "인물 사진" },
  ])("rejects non-hall semantic metadata %#", (candidate) => {
    expect(isRejectedHallPhotoAsset(candidate)).toBe(true);
  });

  it("does not reject valid wedding pages because their source URL mentions meetings or newsroom", () => {
    expect(
      isRejectedHallPhotoAsset({
        url: "https://example.com/images/lilac-wedding.jpg",
        sourceUrl: "https://example.com/newsroom/meetings-events/wedding",
        alt: "라일락홀 예식 세팅",
      }),
    ).toBe(false);
  });

  it("does not mistake the watersports venue name for an award image", () => {
    expect(
      isRejectedHallPhotoAsset({
        url: "https://wedding.seoulwomen.or.kr/app/uploads/2025/06/KakaoTalk_20250825_113739498-scaled.jpg",
        alt: "서울수상레포츠센터 루프탑 웨딩홀 예식 세팅 전경",
      }),
    ).toBe(false);
  });

  it("allows a general auditorium when it is rented and set up for a wedding", () => {
    expect(
      isRejectedHallPhotoAsset({
        url: "https://example.com/photos/auditorium.jpg",
        alt: "일반 강당 예식 세팅 전경",
      }),
    ).toBe(false);
  });

  it("keeps previously collected photos unless their exact URL was already rejected", () => {
    for (const [hallId] of entries) {
      for (const photo of photosForHall(hallId)) {
        expect(isKnownRejectedHallPhotoAsset(photo)).toBe(false);
      }
    }
  });

  it("never publishes a candidate rejected by manual visual review", () => {
    const rejectedUrls = new Set(visualRejectionsJson.map((entry) => entry.url));

    for (const [hallId] of entries) {
      for (const photo of photosForHall(hallId)) {
        expect(rejectedUrls.has(photo.url)).toBe(false);
      }
    }
  });

  it("only publishes photos whose exact hall identity was verified", () => {
    for (const [hallId, photos] of entries) {
      const publicPhotos = photosForHall(hallId);
      expect(publicPhotos.every((photo) => photo.identityStatus === "hall_confirmed")).toBe(
        true,
      );
      expect(publicPhotos.length).toBeLessThanOrEqual(photos.length);
    }
  });
});
