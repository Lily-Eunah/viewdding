import type { Metadata } from "next";
import { FavoritesClient } from "./FavoritesClient";

export const metadata: Metadata = {
  title: "나의 보관함",
  robots: { index: false, follow: false },
};

export default function FavoritesPage() {
  return (
    <>
      <section className="page-intro">
        <p className="eyebrow">SAVED ARCHIVE</p>
        <h1>나의 보관함</h1>
      </section>
      <FavoritesClient />
    </>
  );
}
