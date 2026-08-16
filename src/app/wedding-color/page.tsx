import type { Metadata } from "next";
import { Suspense } from "react";
import { PersonalColorSearchExperience } from "@/components/PersonalColorSearchExperience";
import { personalColors } from "@/lib/personal-colors";

export const metadata: Metadata = {
  title: "웨딩 퍼스널 컬러·골격진단 업체 찾기 | Viewdding",
  description: "드레스 투어, 본식 헤어/메이크업, 신랑 예복 준비 전 필수! 전국 130개 웨딩 특화 퍼스널 컬러 및 체형/골격 진단 업체를 지도와 리스트로 찾아보세요.",
};

export default function WeddingColorPage() {
  return (
    <Suspense fallback={<div className="search-loading-fallback">업체 목록을 불러오는 중...</div>}>
      <PersonalColorSearchExperience
        vendors={personalColors}
        kakaoMapAppKey={process.env.NEXT_PUBLIC_KAKAO_MAP_JS_KEY ?? ""}
      />
    </Suspense>
  );
}
