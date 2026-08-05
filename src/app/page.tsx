import { SearchExperience } from "@/components/SearchExperience";

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <p className="eyebrow">SEOUL WEDDING VENUE FINDER</p>
        <h1>
          <span>흩어진 서울 웨딩홀을</span>
          <span>조건별로 한 번에</span>
          <span>찾아보세요.</span>
        </h1>
        <p>개별홀 기준으로 비교하고, 확인된 정보만 간결하게 보여드려요.</p>
      </section>
      <SearchExperience />
    </>
  );
}
