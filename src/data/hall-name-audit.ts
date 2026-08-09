import type { HallRecord } from "../domain/types";

const CHECKED_AT = "2026-08-08";
const SINGLE_UNNAMED = "단독홀(고유명칭 미공개)";
const UNDER_REVIEW = "홀 정보 확인 중";

type HallNameStatus = NonNullable<HallRecord["hallNameStatus"]>;

interface HallNameVariant {
  id: string;
  hallName: string;
  status: HallNameStatus;
  sourceUrl: string;
  evidence: string;
  patch?: Partial<HallRecord>;
}

interface HallNameRule {
  sourceHallId: string;
  variants: HallNameVariant[];
}

const official = (
  id: string,
  hallName: string,
  sourceUrl: string,
  evidence: string,
  patch?: Partial<HallRecord>,
): HallNameVariant => ({ id, hallName, status: "official", sourceUrl, evidence, patch });

const single = (id: string, sourceUrl: string, evidence: string): HallNameVariant => ({
  id,
  hallName: SINGLE_UNNAMED,
  status: "single_unnamed",
  sourceUrl,
  evidence,
});

const review = (id: string, sourceUrl: string, evidence: string): HallNameVariant => ({
  id,
  hallName: UNDER_REVIEW,
  status: "unverified",
  sourceUrl,
  evidence,
});

/**
 * 기존 마스터의 홀명 가운데 구조적으로 잘못된 값과 복수 홀 누락을 바로잡는 규칙입니다.
 * 원본 엑셀을 다시 내보내도 같은 수정이 유지되도록 공개 데이터 생성 단계에서 적용합니다.
 */
export const HALL_NAME_RULES: HallNameRule[] = [
  {
    sourceHallId: "H-SEO-20260728-024",
    variants: [official("H-SEO-20260728-024", "마루공원", "https://wedding.seoulwomen.or.kr/facilities", "서울시 공공예식장 공식 시설명")],
  },
  {
    sourceHallId: "H-SEO-20260728-025",
    variants: [official("H-SEO-20260728-025", "압구정 루프탑 웨딩홀", "https://wedding.seoulwomen.or.kr/facilities/3195", "서울시 공식 예식장소명")],
  },
  {
    sourceHallId: "H-SEO-20260728-028",
    variants: [
      official("H-SEO-20260728-028", "가든웨딩", "https://yozmwedding.co.kr/venue/?bmode=view&idx=18410968", "현재 판매되는 야외 가든 웨딩 공간"),
      official("H-SEO-20260808-004", "파크홀", "https://yozmwedding.co.kr/venue/?bmode=view&idx=18410968", "현재 판매되는 실내 웨딩 공간", {
        indoorOutdoor: "indoor",
        featureTags: ["실내 웨딩", "홀명 확인"],
      }),
    ],
  },
  {
    sourceHallId: "H-SEO-20260728-032",
    variants: [single("H-SEO-20260728-032", "RAW-기존자료", "단독 하우스웨딩 운영은 확인됐으나 고유 홀명은 확인되지 않음")],
  },
  {
    sourceHallId: "H-SEO-20260728-033",
    variants: [
      official("H-SEO-20260728-033", "메리엘홀", "https://saintmeriel.co.kr/", "1층 밝은 톤의 공식 판매 홀"),
      official("H-SEO-20260808-003", "세인트홀", "https://saintmeriel.co.kr/", "2층 어두운 톤의 공식 판매 홀", {
        lighting: "dark",
        naturalLight: "no",
        chapel: true,
        featureTags: ["조도:어두운홀", "공간:채플홀", "실내외:실내"],
        classificationEvidence: "세인트메리엘 공식 채널과 최근 웨딩 플랫폼에서 2층 세인트홀의 어두운 채플 스타일을 확인.",
      }),
    ],
  },
  {
    sourceHallId: "H-SEO-20260728-035",
    variants: [single("H-SEO-20260728-035", "https://apelgamo.com/home/wedding4", "공식 페이지에서 단일 웨딩홀 운영 확인, 별도 고유명 없음")],
  },
  {
    sourceHallId: "H-SEO-20260728-037",
    variants: [official("H-SEO-20260728-037", "NOBLE VALENTI DAECHI HALL", "https://noblevalentidaechi.co.kr/", "공식 홀 페이지 표기")],
  },
  {
    sourceHallId: "H-SEO-20260728-038",
    variants: [official("H-SEO-20260728-038", "디 아이올라홀", "http://fs-cna.com", "공식 가격표와 홀 안내의 단일 예식홀명")],
  },
  {
    sourceHallId: "H-SEO-20260728-043",
    variants: [official("H-SEO-20260728-043", "더화이트홀", "https://yozmwedding.co.kr/60/?bmode=view&idx=164275550", "현재 판매 페이지의 홀명")],
  },
  {
    sourceHallId: "H-SEO-20260728-044",
    variants: [
      official("H-SEO-20260728-044", "오크·프리미어 룸", "https://www.homehmc.com/ko/oakwood-seoul-coex/banquets-and-events/weddings/", "공식 웨딩 페이지에 노출된 연회장", {
        seated: { min: 80, max: 180, raw: "80~180" },
        capacity: { min: 80, max: 180, raw: "80~180" },
      }),
      official("H-SEO-20260808-007", "프리미어 룸", "https://www.homehmc.com/ko/oakwood-seoul-coex/banquets-and-events/weddings/", "공식 웨딩 페이지에 노출된 연회장", {
        seated: { min: 50, max: 90, raw: "50~90" },
        capacity: { min: 50, max: 90, raw: "50~90" },
      }),
      official("H-SEO-20260808-008", "오크 룸", "https://www.homehmc.com/ko/oakwood-seoul-coex/banquets-and-events/weddings/", "공식 웨딩 페이지에 노출된 연회장", {
        seated: { min: 30, max: 70, raw: "30~70" },
        capacity: { min: 30, max: 70, raw: "30~70" },
      }),
    ],
  },
  {
    sourceHallId: "H-SEO-20260728-047",
    variants: [official("H-SEO-20260728-047", "쿤스트할레", "https://www.onze-droom.com/", "온즈드롬 도산의 공식 운영 공간명")],
  },
  {
    sourceHallId: "H-SEO-20260728-048",
    variants: [single("H-SEO-20260728-048", "https://thebaileyhouse.com/", "단독홀 운영 확인, 별도 고유명 없음")],
  },
  {
    sourceHallId: "H-SEO-20260728-049",
    variants: [single("H-SEO-20260728-049", "https://nonhyeonvilladegd.com/Weddinghall", "공식 페이지에서 1층 단독 웨딩홀 확인, 별도 고유명 없음")],
  },
  {
    sourceHallId: "H-SEO-20260728-050",
    variants: [official("H-SEO-20260728-050", "토브 가든", "https://tovhesed.com/app/service/wedding.php", "공식 웨딩 페이지의 예식 공간명")],
  },
  {
    sourceHallId: "H-SEO-20260728-051",
    variants: [
      official("H-SEO-20260728-051", "살롱 1 + 2", "https://www.marriott.com/ko/hotels/selag-ac-hotel-seoul-gangnam/events/", "메리어트 공식 웨딩 갤러리와 수용표에 노출된 실내 웨딩 공간", {
        indoorOutdoor: "indoor",
        seated: { min: 77, max: 77, raw: 77 },
        capacity: { min: 130, max: 130, raw: 130 },
      }),
      official("H-SEO-20260808-005", "클라우드", "https://www.marriott.com/ko/hotels/selag-ac-hotel-seoul-gangnam/events/", "메리어트 공식 페이지의 루프탑 야외 웨딩 공간", {
        lighting: "bright",
        naturalLight: "yes",
        indoorOutdoor: "outdoor",
        seated: { min: 30, max: 30, raw: 30 },
        capacity: { min: 100, max: 100, raw: 100 },
        featureTags: ["루프탑 웨딩", "실내외:야외"],
        classificationEvidence: "메리어트 공식 웨딩 갤러리에서 클라우드 야외 결혼식과 최대 수용 100명을 확인.",
      }),
    ],
  },
  {
    sourceHallId: "H-SEO-20260728-052",
    variants: [single("H-SEO-20260728-052", "https://thechapel.co.kr/home/wedding3", "공식 페이지에서 1층 단일 웨딩홀 확인, 별도 고유명 없음")],
  },
  {
    sourceHallId: "H-SEO-20260728-058",
    variants: [single("H-SEO-20260728-058", "https://tradinoi.com/", "단독 웨딩 운영 확인, 별도 고유명 없음")],
  },
  {
    sourceHallId: "H-SEO-20260728-059",
    variants: [official("H-SEO-20260728-059", "야외무대", "https://wedding.seoulwomen.or.kr/facilities/588", "서울시 공식 예식장소명")],
  },
  {
    sourceHallId: "H-SEO-20260728-060",
    variants: [official("H-SEO-20260728-060", "서울수상레포츠센터 루프탑 웨딩홀", "https://wedding.seoulwomen.or.kr/facilities/3192", "서울시 공식 예식장소명")],
  },
  {
    sourceHallId: "H-SEO-20260728-061",
    variants: [official("H-SEO-20260728-061", "망원 루프탑 웨딩홀", "https://wedding.seoulwomen.or.kr/facilities/3193", "서울시 공식 예식장소명")],
  },
  {
    sourceHallId: "H-SEO-20260728-063",
    variants: [official("H-SEO-20260728-063", "월드컵공원 평화의 공원(새록결혼식)", "https://wedding.seoulwomen.or.kr/facilities/3206", "서울시 공식 예식장소명")],
  },
  {
    sourceHallId: "H-SEO-20260728-072",
    variants: [single("H-SEO-20260728-072", "https://www.onze-droom.com/66", "건물 전체 단독 웨딩 운영 확인, 별도 고유명 없음")],
  },
  {
    sourceHallId: "H-SEO-20260728-073",
    variants: [single("H-SEO-20260728-073", "https://www.hotelamanti.com/", "공식 웨딩 페이지에서 2층 단일 예식홀 확인, 별도 고유명 없음")],
  },
  {
    sourceHallId: "H-SEO-20260728-074",
    variants: [official("H-SEO-20260728-074", "서울도시건축전시관", "https://wedding.seoulwomen.or.kr/facilities", "서울시 공공예식장 공식 시설명")],
  },
  {
    sourceHallId: "H-SEO-20260728-075",
    variants: [official("H-SEO-20260728-075", "남산호현당", "https://wedding.seoulwomen.or.kr/facilities/3189", "서울시 공식 예식장소명")],
  },
  {
    sourceHallId: "H-SEO-20260728-077",
    variants: [official("H-SEO-20260728-077", "카페마루 웨딩홀", "https://wedding.seoulwomen.or.kr/facilities/3216", "서울시 공식 예식장소명")],
  },
  {
    sourceHallId: "H-SEO-20260728-083",
    variants: [official("H-SEO-20260728-083", "중정", "https://www.kh.or.kr/cms/content/view/542", "한국의집 공식 전통혼례 공간명")],
  },
  {
    sourceHallId: "H-SEO-20260728-084",
    variants: [review("H-SEO-20260728-084", "https://www.lescapehotel.com/", "현재 공식 웨딩 상품의 홀명과 단독 운영 여부를 확인하지 못함")],
  },
  {
    sourceHallId: "H-SEO-20260728-085",
    variants: [
      official("H-SEO-20260728-085", "그랜드 볼룸", "https://www.marriott.com/ko/hotels/selwi-the-westin-josun-seoul/events/", "메리어트 공식 이벤트 페이지의 대형 웨딩 공간"),
      official("H-SEO-20260808-006", "라일락 홀", "https://www.shinsegaegroupnewsroom.com/westin-chosun-seoul-wedding-concept/", "운영사 공식 뉴스룸에서 전용 웨딩 콘셉트를 확인한 소규모 홀", {
        lighting: "bright",
        naturalLight: "yes",
        seated: { min: 40, max: 40, raw: 40 },
        capacity: { min: 40, max: 50, raw: "40~50" },
        featureTags: ["소규모 웨딩", "환구단 전망", "자연광"],
        classificationEvidence: "신세계그룹 공식 뉴스룸에서 라일락홀 전용 웨딩 콘셉트와 전면 자연광을 확인.",
      }),
    ],
  },
  {
    sourceHallId: "H-SEO-20260728-089",
    variants: [single("H-SEO-20260728-089", "https://www.onze-droom.com/", "명동점 단독 웨딩 운영 확인, 별도 고유명 없음")],
  },
  {
    sourceHallId: "H-SEO-20260729-124",
    variants: [official("H-SEO-20260729-124", "더마리아칼라스홀", "https://venueg.co.kr", "공식 홀 안내에 노출된 현재 홀명")],
  },
  {
    sourceHallId: "H-SEO-20260729-163",
    variants: [official("H-SEO-20260729-163", "르씨엘홀", "https://bntconvention.com/hall", "공식 홀 페이지명")],
  },
  {
    sourceHallId: "H-SEO-20260729-165",
    variants: [single("H-SEO-20260729-165", "https://www.jwconvention.co.kr/", "단독홀 운영 확인, 별도 고유명 없음")],
  },
  {
    sourceHallId: "H-SEO-20260729-169",
    variants: [review("H-SEO-20260729-169", "https://www.instagram.com/maydining_wed/", "시크릿가든·힐가든·플랫가든의 독립 판매 여부를 공개 자료로 확정하지 못함")],
  },
  {
    sourceHallId: "H-SEO-20260729-174",
    variants: [
      official("H-SEO-20260729-174", "벨라홀", "https://www.bellaluceseoul.co.kr/view/floce", "공식 페이지의 2층 홀명"),
      official("H-SEO-20260808-001", "루체홀", "https://www.bellaluceseoul.co.kr/view/floce", "공식 페이지의 3층 홀명", {
        lighting: "transitional",
        naturalLight: "unknown",
        featureTags: ["가든웨딩", "조도 전환 가능"],
        classificationEvidence: "공식 페이지에서 밝은 가든웨딩과 톤다운 나이트 가든웨딩 연출을 모두 확인.",
      }),
      official("H-SEO-20260808-002", "플로체홀", "https://www.bellaluceseoul.co.kr/view/floce", "공식 페이지의 7층 홀명", {
        lighting: "bright",
        naturalLight: "unknown",
        chapel: true,
        featureTags: ["채플", "가든웨딩", "돔 천장"],
        classificationEvidence: "공식 페이지에서 채플·가든 스타일과 돔형 높은 천장을 확인.",
      }),
    ],
  },
  {
    sourceHallId: "H-SEO-20260729-196",
    variants: [official("H-SEO-20260729-196", "그랜드볼룸", "https://banpo.theconvention.co.kr/", "공식 지점 페이지의 홀명")],
  },
  {
    sourceHallId: "H-SEO-20260729-239",
    variants: [single("H-SEO-20260729-239", "https://thewedd.com/hall-35/", "단독홀 운영 확인, 별도 고유명 없음")],
  },
  {
    sourceHallId: "H-SEO-20260729-244",
    variants: [review("H-SEO-20260729-244", "http://elorawedding.com", "마스터의 엘로라홀 명칭을 공식 채널에서 확인하지 못함")],
  },
  {
    sourceHallId: "H-SEO-20260729-276",
    variants: [single("H-SEO-20260729-276", "https://yozmwedding.co.kr/venue/?bmode=view&idx=152252289", "단독 웨딩 운영 확인, 별도 고유명 없음")],
  },
  {
    sourceHallId: "H-SEO-20260729-278",
    variants: [single("H-SEO-20260729-278", "https://yozmwedding.co.kr/venue/?bmode=view&idx=18336016", "단독 웨딩 운영 확인, 별도 고유명 없음")],
  },
  {
    sourceHallId: "H-SEO-20260729-283",
    variants: [review("H-SEO-20260729-283", "https://wedding.seoulwomen.or.kr/facilities", "은평한옥마을 내 정확한 예식 공간명을 확인하지 못함")],
  },
  {
    sourceHallId: "H-SEO-20260729-286",
    variants: [single("H-SEO-20260729-286", "https://wedding.seoulwomen.or.kr/facilities", "단독 예식 운영 확인, 별도 고유명 없음")],
  },
  {
    sourceHallId: "H-SEO-20260729-287",
    variants: [single("H-SEO-20260729-287", "https://www.lapige.com/", "단독홀 운영 확인, 별도 고유명 없음")],
  },
  {
    sourceHallId: "H-SEO-20260729-288",
    variants: [single("H-SEO-20260729-288", "https://wedding.seoulwomen.or.kr/facilities", "단독 예식 운영 확인, 별도 고유명 없음")],
  },
  {
    sourceHallId: "H-SEO-20260729-289",
    variants: [single("H-SEO-20260729-289", "https://wedding.seoulwomen.or.kr/facilities", "단독 예식 운영 확인, 별도 고유명 없음")],
  },
  {
    sourceHallId: "H-SEO-20260729-290",
    variants: [single("H-SEO-20260729-290", "https://wedding.seoulwomen.or.kr/facilities", "단독 예식 운영 확인, 별도 고유명 없음")],
  },
  {
    sourceHallId: "H-SEO-20260729-340",
    variants: [review("H-SEO-20260729-340", "https://www.proposewedding.co.kr/", "공식 채널에서 현재 글로리홀 운영을 확인하지 못함")],
  },
  {
    sourceHallId: "H-GG-GP-20260808-008",
    variants: [single("H-GG-GP-20260808-008", "https://www.lavieenlumi.co.kr/About", "단독 웨딩 운영 확인, 별도 고유명 없음")],
  },
  {
    sourceHallId: "H-GG-GP-20260808-010",
    variants: [official("H-GG-GP-20260808-010", "아트홀", "https://centrium-wedding.com/art-hall/", "공식 홀 페이지명")],
  },
  {
    sourceHallId: "H-GG-REST-20260808-036",
    variants: [single("H-GG-REST-20260808-036", "https://www.gwed.co.kr", "단독 웨딩홀 운영 확인, 별도 고유명 없음")],
  },
  {
    sourceHallId: "H-GG-REST-20260808-038",
    variants: [single("H-GG-REST-20260808-038", "https://thereina.kr/44", "공식 페이지에서 단독홀 운영 확인, 별도 고유명 없음")],
  },
  {
    sourceHallId: "H-GG-REST-20260808-047",
    variants: [single("H-GG-REST-20260808-047", "https://thebloomhousewedding.kr/", "단독 하우스웨딩 운영 확인, 별도 고유명 없음")],
  },
  {
    sourceHallId: "H-GG-SHG-20260808-004",
    variants: [single("H-GG-SHG-20260808-004", "https://www.ndex.kr/data/hwain2014", "단독홀 운영 확인, 별도 고유명 없음")],
  },
  {
    sourceHallId: "H-GG-SHG-20260808-006",
    variants: [official("H-GG-SHG-20260808-006", "그랜드볼룸홀", "https://www.weddingbook.com/review/193589", "현재 웨딩 안내에 반복 노출되는 홀명")],
  },
  {
    sourceHallId: "H-GG-SHG-20260808-008",
    variants: [single("H-GG-SHG-20260808-008", "https://www.directwedding.co.kr/weddinghall/hall0209", "단독 웨딩 운영 확인, 별도 고유명 없음")],
  },
  {
    sourceHallId: "H-GG-PA-20260808-015",
    variants: [single("H-GG-PA-20260808-015", "https://www.jobkorea.co.kr/company/49311097/recruit", "단독홀 운영 정보만 확인, 별도 고유명 없음")],
  },
  {
    sourceHallId: "H-IC-P1-20260808-014",
    variants: [single("H-IC-P1-20260808-014", "https://incheon.wedding/collections/weddinghall-chapelle-de-mien/", "단독홀 운영 확인, 별도 고유명 없음")],
  },
];

const ruleByHallId = new Map(HALL_NAME_RULES.map((rule) => [rule.sourceHallId, rule]));

function defaultStatus(hallName: string): HallNameStatus {
  if (hallName === SINGLE_UNNAMED) return "single_unnamed";
  if (hallName === UNDER_REVIEW || /대표 예식공간|공식 웨딩홀 미확인|홀명 확인 필요/.test(hallName)) return "unverified";
  return "official";
}

export function applyHallNameAudit(halls: HallRecord[]): HallRecord[] {
  const audited = halls.flatMap((hall) => {
    const rule = ruleByHallId.get(hall.id);
    if (!rule) {
      const singleUnnamed = hall.hallName === "단독홀"
        || hall.hallName === "단독웨딩홀"
        || / 단독홀$/.test(hall.hallName);
      return [{
        ...hall,
        hallName: singleUnnamed ? SINGLE_UNNAMED : hall.hallName,
        hallNameStatus: singleUnnamed ? "single_unnamed" : defaultStatus(hall.hallName),
        hallNameSourceUrl: hall.website ?? hall.sourceUrl,
        hallNameCheckedAt: hall.detailCheckedAt ?? hall.classificationCheckedAt,
        hallNameEvidence: singleUnnamed
          ? "단독 웨딩 공간은 확인됐으나 별도 고유 홀명은 공개되지 않음"
          : "기존 마스터의 공식 홀명 필드 유지",
      }];
    }

    return rule.variants.map((variant) => ({
      ...hall,
      ...variant.patch,
      id: variant.id,
      hallName: variant.hallName,
      hallNameStatus: variant.status,
      hallNameSourceUrl: variant.sourceUrl,
      hallNameCheckedAt: CHECKED_AT,
      hallNameEvidence: variant.evidence,
    }));
  });

  const duplicateIds = audited.map((hall) => hall.id).filter((id, index, ids) => ids.indexOf(id) !== index);
  if (duplicateIds.length > 0) throw new Error(`홀명 감사 후 중복 hall_id: ${Array.from(new Set(duplicateIds)).join(", ")}`);

  return audited;
}
