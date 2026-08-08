import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FavoriteButton } from "@/components/FavoriteButton";
import { HallPhotoMedia } from "@/components/HallPhotoMedia";
import { getHall, halls } from "@/lib/data";
import { ceremonyLabel, hallTags, mealLabels, rangeLabel } from "@/lib/labels";

export function generateStaticParams() { return halls.map((hall) => ({ id: hall.id })); }

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const hall = getHall((await params).id);
  return hall ? { title: `${hall.venueName} ${hall.hallName}`, description: `${hall.district} ${hall.venueName} ${hall.hallName}의 수용인원, 예식 간격, 홀 분류와 출처 정보입니다.` } : {};
}

export default async function HallDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const hall = getHall((await params).id);
  if (!hall) notFound();
  const isGyeonggi = hall.id.startsWith("H-GG-");
  const displayAddress = hall.locationAddress ?? hall.address;
  const facts = [
    ["최대 수용", rangeLabel(hall.capacity)], ["최소 보증", rangeLabel(hall.guarantee)],
    ["예식 간격", rangeLabel(hall.interval, "분")], ["식사", mealLabels(hall.meals)],
  ];
  const classifications = [
    ["조도", hall.lighting === "bright" ? "밝은홀" : hall.lighting === "dark" ? "어두운홀" : hall.lighting === "transitional" ? "전환형홀" : "확인 필요"],
    ["자연광", hall.naturalLight === "yes" ? "있음" : hall.naturalLight === "partial" ? "부분" : hall.naturalLight === "no" ? "없음" : "확인 필요"],
    ["채플 스타일", hall.chapel === null ? "확인 필요" : hall.chapel ? "해당" : "해당 없음"],
    ["하우스웨딩", hall.house === null ? "확인 필요" : hall.house ? "해당" : "해당 없음"],
    ["실내외", hall.indoorOutdoor === "both" ? "실내외 병행" : hall.indoorOutdoor === "outdoor" ? "야외" : hall.indoorOutdoor === "indoor" ? "실내" : "확인 필요"],
  ];
  return (
    <article className="detail-page">
      <nav className="breadcrumb"><Link href={isGyeonggi ? "/gyeonggi/wedding-halls/" : "/seoul/wedding-halls/"}>{isGyeonggi ? "경기 웨딩홀" : "서울 웨딩홀"}</Link><span>›</span><span>{hall.district}</span></nav>
      {hall.photos && hall.photos.length > 0 ? <section className="hall-photo-gallery" aria-label={`${hall.venueName} ${hall.hallName} 공식 사진`}>{hall.photos.map((photo) => <HallPhotoMedia key={photo.id} photo={photo} variant="detail" />)}</section> : null}
      <header className="detail-header"><div><p className="eyebrow">{hall.venueName}</p><h1>{hall.hallName}</h1><p>{hall.district}{displayAddress ? ` · ${displayAddress}` : ""}</p><div className="chip-row">{hallTags(hall).map((tag) => <span className="chip" key={tag}>{tag}</span>)}</div></div><FavoriteButton hallId={hall.id} /></header>
      <dl className="fact-grid">{facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      <section className="detail-section"><h2>분류 정보</h2><div className="quiet-table">{classifications.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div></section>
      <section className="detail-section"><h2>예식·공간 정보</h2><div className="quiet-table"><div><span>예식 형태</span><strong>{ceremonyLabel(hall.ceremonyFormat)}</strong></div><div><span>착석 인원</span><strong>{rangeLabel(hall.seated)}</strong></div><div><span>예식 시간</span><strong>{hall.ceremonyTime ?? "확인 필요"}</strong></div><div><span>버진로드</span><strong>{hall.virginRoad ?? "확인 필요"}</strong></div><div><span>천고</span><strong>{hall.ceilingHeight ?? "확인 필요"}</strong></div></div></section>
      <section className="detail-section"><h2>정보 출처</h2><p className="source-summary">{hall.sourceType ?? "출처 유형 확인 필요"} · {hall.detailCheckedAt ?? hall.classificationCheckedAt ?? "확인일 미상"} · 신뢰도 {hall.confidence ?? "확인 필요"}</p>{hall.classificationEvidence ? <p>{hall.classificationEvidence}</p> : null}<div className="source-links">{hall.sourceUrl ? <a href={hall.sourceUrl} target="_blank" rel="noreferrer">상세 출처 보기</a> : null}{hall.locationSourceUrl ? <a href={hall.locationSourceUrl} target="_blank" rel="noreferrer">주소 출처 보기</a> : null}{hall.website ? <a href={hall.website} target="_blank" rel="noreferrer">공식 홈페이지</a> : null}{hall.instagram ? <a href={hall.instagram} target="_blank" rel="noreferrer">공식 인스타그램</a> : null}{hall.locationPlaceUrl ?? hall.mapUrl ? <a href={hall.locationPlaceUrl ?? hall.mapUrl ?? undefined} target="_blank" rel="noreferrer">지도 보기</a> : null}</div></section>
      <p className="data-notice">예식 운영과 보증인원은 날짜·시간대에 따라 바뀔 수 있으므로 계약 전 업체에 다시 확인해주세요.</p>
    </article>
  );
}
