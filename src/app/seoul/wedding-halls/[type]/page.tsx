import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HallSeoCollection } from "@/components/HallSeoCollection";
import { halls } from "@/lib/data";
import {
  collectionHalls,
  collectionVenueCount,
  getHallSeoConfig,
  hallSeoPath,
  HALL_SEO_SLUGS,
  isHallSeoSlug,
} from "@/lib/hall-seo";

type Props = { params: Promise<{ type: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return HALL_SEO_SLUGS.map((type) => ({ type }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params;
  if (!isHallSeoSlug(type)) return {};
  const config = getHallSeoConfig(type);
  const collection = collectionHalls(halls, type);
  const venueCount = collectionVenueCount(collection);
  const title = `${config.titleLabel} ${collection.length}개`;
  const description = `${config.searchTerms}을 모았습니다. 서울 ${venueCount}개 예식장의 ${collection.length}개 개별홀을 지역, 수용인원과 예식 조건별로 비교해 보세요.`;
  const canonical = hallSeoPath(type);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      title,
      description,
      images: [{ url: "/viewdding-hero-v48.png", alt: config.heading }],
    },
  };
}

export default async function SeoulWeddingHallTypePage({ params }: Props) {
  const { type } = await params;
  if (!isHallSeoSlug(type)) notFound();
  return <HallSeoCollection collectionKey={type} />;
}
