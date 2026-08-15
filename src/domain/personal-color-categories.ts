import type { PersonalColorServiceTag, VerificationGrade } from "./personal-color-types";

export interface ServiceTagMetadata {
  id: PersonalColorServiceTag;
  label: string;
  shortLabel: string;
  description: string;
}

export const PERSONAL_COLOR_SERVICE_TAGS: ServiceTagMetadata[] = [
  {
    id: "body_shape",
    label: "골격·체형 분석",
    shortLabel: "골격/체형",
    description: "바디핏 & 실루엣 분석",
  },
  {
    id: "dress",
    label: "드레스 라인·소재",
    shortLabel: "드레스/소재",
    description: "드레스 넥라인, 원단, 화이트 톤 추천",
  },
  {
    id: "makeup_hair",
    label: "헤어·메이크업 코칭",
    shortLabel: "헤어/메이크업",
    description: "본식 메이크업 시안 & 웨딩 염색",
  },
  {
    id: "couple",
    label: "신랑 예복·커플 동반",
    shortLabel: "커플/예복",
    description: "신랑신부 커플 진단 & 남성 예복",
  },
  {
    id: "total_wedding",
    label: "토탈 웨딩 컨설팅",
    shortLabel: "토탈 웨딩",
    description: "부케, 티아라, 액세서리, 스튜디오 총괄",
  },
  {
    id: "color",
    label: "퍼스널컬러 진단",
    shortLabel: "퍼스널컬러",
    description: "기본 웜/쿨 & 세부 톤 드레이핑",
  },
];

export function isPersonalColorServiceTag(value: unknown): value is PersonalColorServiceTag {
  return typeof value === "string" && PERSONAL_COLOR_SERVICE_TAGS.some((tag) => tag.id === value);
}

export function serviceTagMeta(tag: PersonalColorServiceTag): ServiceTagMetadata {
  return PERSONAL_COLOR_SERVICE_TAGS.find((item) => item.id === tag) ?? {
    id: tag,
    label: tag,
    shortLabel: tag,
    description: "",
  };
}

export function gradeLabel(grade: VerificationGrade): string {
  switch (grade) {
    case "A":
      return "검증 A등급";
    case "B":
      return "검증 B등급";
    case "C":
      return "검증 C등급";
    default:
      return "검증 완료";
  }
}
