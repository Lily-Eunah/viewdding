import type { Metadata } from "next";
import { FavoritesClient } from "./FavoritesClient";

export const metadata: Metadata = { title: "즐겨찾기" };
export default function FavoritesPage() { return <><section className="page-intro"><p className="eyebrow">SAVED VENUES</p><h1>즐겨찾기</h1></section><FavoritesClient /></>; }
