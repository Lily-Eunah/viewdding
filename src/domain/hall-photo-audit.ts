import type {
  HallPhotoIdentityStatus,
  HallPhotoVerificationMethod,
} from "./types";

export interface HallPhotoAuditHall {
  id: string;
  venueId: string;
}

export interface HallPhotoAuditSeed {
  hallId: string;
  url: string;
}

export interface HallPhotoVerification {
  identityStatus: HallPhotoIdentityStatus;
  verificationMethod: HallPhotoVerificationMethod;
  verificationNote: string;
}

export type HallPhotoVerificationOverrides = Readonly<
  Record<string, HallPhotoVerification>
>;

export interface HallPhotoAssetCandidate {
  url: string;
  sourceUrl?: string;
  alt?: string;
  context?: string;
}

const KNOWN_REJECTED_HALL_PHOTO_URLS = new Set([
  "https://www.hotelnaruseoul.com/wp-content/uploads/sites/18/2026/03/%EB%B8%8C%EB%A1%9C%EC%8A%88%EC%96%B4-%EB%B2%84%ED%8A%BC-300x54.jpg",
  "https://www.snufacultyclub.com/assets/images/main/top_btn_pc.png",
  "https://u.kyusoodang.co.kr/attachList/upload/user/NEWS/c20240310172441363/img20240310172545977.jpg",
  "https://www.pharosconvention.co.kr/attachList/upload/user/NEWS/em20260423120910550.jpg",
  "https://cache.marriott.com/content/dam/marriott-renditions/SELFG/selfg-meeting-room-3277-hor-wide.jpg?output-quality=70&interpolation=progressive-bilinear&downsize=1336px:*",
  "https://wedding.seoulwomen.or.kr/app/uploads/2024/05/36-scaled.jpg",
]);

export function isKnownRejectedHallPhotoAsset({
  url,
}: Pick<HallPhotoAssetCandidate, "url">): boolean {
  return KNOWN_REJECTED_HALL_PHOTO_URLS.has(url);
}

function safelyDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/**
 * Rejects image assets that cannot serve as an identifiable wedding-hall photo.
 * Source page URLs are intentionally excluded from the generic pattern check:
 * valid wedding pages can contain words such as `meeting` or `newsroom`.
 */
export function isRejectedHallPhotoAsset({
  url,
  alt = "",
  context = "",
}: HallPhotoAssetCandidate): boolean {
  if (isKnownRejectedHallPhotoAsset({ url })) return true;

  const decodedUrl = safelyDecode(url);
  const semanticText = `${safelyDecode(alt)} ${safelyDecode(context)}`;
  const assetPattern =
    /(?:^|[\/_\-.])(?:logos?|icons?|sprites?|arrows?|btn|buttons?|brochures?|awards?|troph(?:y|ies)|winners?|prizes?|certificates?|notices?|announcements?|reservations?|bookings?|counsel(?:ing)?|profiles?|portraits?|people|persons?|couples?|brides?|grooms?|models?)(?:[\/_\-.]|$)|(?:^|[\/_\-.])(?:meeting|seminar|conference)[-_ ]?(?:room|hall)(?:[\/_\-.]|$)|\/user\/news\//i;
  const semanticPattern =
    /로고|아이콘|버튼|브로슈어|다운로드|수상\s*(?:이미지|사진|내역|경력|결과|소식)|수상작|트로피|시상|공지|예약실|상담실|회의실|세미나실|컨퍼런스룸|인물(?:\s*사진)?|프로필(?:\s*사진)?|신랑|신부|커플|모델|사람/i;

  return (
    assetPattern.test(decodedUrl) ||
    semanticPattern.test(decodedUrl) ||
    semanticPattern.test(semanticText)
  );
}

export function siblingDuplicateHallIds(
  halls: readonly HallPhotoAuditHall[],
  photoSeeds: readonly HallPhotoAuditSeed[],
): ReadonlySet<string> {
  const venueIdByHallId = new Map(halls.map((hall) => [hall.id, hall.venueId]));
  const hallIdsByVenueAndUrl = new Map<string, string[]>();

  for (const photo of photoSeeds) {
    const venueId = venueIdByHallId.get(photo.hallId);
    if (!venueId) continue;
    const key = `${venueId}\u0000${photo.url}`;
    const hallIds = hallIdsByVenueAndUrl.get(key) ?? [];
    hallIds.push(photo.hallId);
    hallIdsByVenueAndUrl.set(key, hallIds);
  }

  return new Set(
    [...hallIdsByVenueAndUrl.values()]
      .filter((hallIds) => hallIds.length > 1)
      .flat(),
  );
}

export function duplicatePhotoHallIds(
  photoSeeds: readonly HallPhotoAuditSeed[],
): ReadonlySet<string> {
  const hallIdsByUrl = new Map<string, string[]>();

  for (const photo of photoSeeds) {
    const hallIds = hallIdsByUrl.get(photo.url) ?? [];
    hallIds.push(photo.hallId);
    hallIdsByUrl.set(photo.url, hallIds);
  }

  return new Set(
    [...hallIdsByUrl.values()]
      .filter((hallIds) => new Set(hallIds).size > 1)
      .flat(),
  );
}

export function verificationForPhoto(
  hallId: string,
  siblingDuplicateIds: ReadonlySet<string>,
  overrides: HallPhotoVerificationOverrides,
): HallPhotoVerification {
  if (siblingDuplicateIds.has(hallId)) {
    return {
      identityStatus: "venue_only",
      verificationMethod: "venue_representative",
      verificationNote:
        "같은 업체의 다른 홀에 동일한 이미지 URL이 연결되어 개별 홀 사진으로 공개하지 않음.",
    };
  }

  const override = overrides[hallId];
  if (override) return override;

  return {
    identityStatus: "needs_review",
    verificationMethod: "unreviewed",
    verificationNote: "개별 홀과 사진의 연결 근거를 재검증해야 함.",
  };
}
