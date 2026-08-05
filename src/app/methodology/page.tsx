import type { Metadata } from "next";

export const metadata: Metadata = { title: "분류 기준과 데이터 정책" };

export default function MethodologyPage() {
  return <article className="methodology-page"><section className="page-intro"><p className="eyebrow">DATA METHODOLOGY</p><h1>분류 기준과 데이터 정책</h1><p>Viewdding은 하나의 대표 라벨이 아니라 조도·공간 스타일·예식장 형태를 각각 판정합니다.</p></section>
    <section className="detail-section"><h2>웨딩홀 타입</h2><div className="quiet-table"><div><span>밝은홀</span><strong>밝음·자연광 중심 또는 전환형</strong></div><div><span>어두운홀</span><strong>어두운 연출 중심 또는 전환형</strong></div><div><span>채플홀</span><strong>채플 스타일이 확인된 홀</strong></div><div><span>하우스웨딩홀</span><strong>하우스 스타일이 확인된 홀</strong></div><div><span>야외예식 가능</span><strong>야외 또는 실내외 병행</strong></div></div></section>
    <section className="detail-section"><h2>검색 결과 상태</h2><div className="quiet-table"><div><span>조건 확인된 홀</span><strong>선택한 모든 조건이 확인됨</strong></div><div><span>정보 확인이 필요한 홀</span><strong>불일치는 없지만 필요한 값 일부가 미공개</strong></div><div><span>결과 제외</span><strong>확인된 값이 선택 조건과 명확히 다름</strong></div></div></section>
    <section className="detail-section"><h2>출처 우선순위</h2><ol className="method-list"><li>공식 홈페이지·공식 공고</li><li>공식 SNS·최근 운영 사진</li><li>복수의 최근 웨딩 정보·후기</li><li>업체 문의가 필요한 변동 수치</li></ol><p>빈 값을 임의 추정하거나 ‘없음’으로 바꾸지 않습니다.</p></section>
  </article>;
}
