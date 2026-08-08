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

export function verificationForPhoto(
  hallId: string,
  siblingDuplicateIds: ReadonlySet<string>,
  overrides: HallPhotoVerificationOverrides,
): HallPhotoVerification {
  const override = overrides[hallId];
  if (override) return override;

  if (siblingDuplicateIds.has(hallId)) {
    return {
      identityStatus: "venue_only",
      verificationMethod: "venue_representative",
      verificationNote:
        "같은 업체의 다른 홀에 동일한 이미지 URL이 연결되어 개별 홀 사진으로 공개하지 않음.",
    };
  }

  return {
    identityStatus: "needs_review",
    verificationMethod: "unreviewed",
    verificationNote: "개별 홀과 사진의 연결 근거를 재검증해야 함.",
  };
}
