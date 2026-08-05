import { SearchExperience } from "@/components/SearchExperience";
import { metadata } from "@/lib/data";

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <p className="eyebrow">SEOUL WEDDING VENUE FINDER</p>
        <h1>흩어진 서울 웨딩홀 정보를<br />조건별로 한 번에 찾아보세요.</h1>
        <p>예식장 단위가 아닌 개별홀 기준으로 비교하고, 확인되지 않은 값은 숨기거나 추정하지 않습니다.</p>
        <div className="data-status">서울 개별홀 {metadata.exportedHalls}개 · 최근 데이터 {metadata.sourceFile.includes("20260731") ? "2026.07.31" : "갱신됨"}</div>
      </section>
      <SearchExperience />
    </>
  );
}
