"use client";

import Link from "next/link";
import { Buildings, EnvelopeSimple, Heart, House, Wine } from "@phosphor-icons/react";
import { usePathname, useSearchParams } from "next/navigation";

export function BottomNav() {
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();
  const purpose = searchParams?.get("purpose");

  const navItems = [
    { key: "home", href: "/", label: "홈", Icon: House, active: pathname === "/" },
    { key: "wedding", href: "/search/", label: "웨딩홀", Icon: Buildings, active: pathname.startsWith("/search") || pathname.startsWith("/halls") },
    {
      key: "invitation",
      href: "/gatherings/?purpose=invitation",
      label: "청첩장 모임",
      Icon: EnvelopeSimple,
      active: pathname.startsWith("/gatherings") && purpose !== "family_meeting",
    },
    {
      key: "family_meeting",
      href: "/gatherings/?purpose=family_meeting",
      label: "상견례",
      Icon: Wine,
      active: pathname.startsWith("/gatherings") && purpose === "family_meeting",
    },
    { key: "favorites", href: "/favorites/", label: "저장", Icon: Heart, active: pathname.startsWith("/favorites") },
  ];

  return (
    <nav className="bottom-nav" aria-label="주요 메뉴">
      {navItems.map(({ key, href, label, Icon, active }) => (
        <Link key={key} href={href} className={active ? "is-active" : undefined} aria-current={active ? "page" : undefined}>
          <Icon aria-hidden="true" size={22} weight={active ? "fill" : "regular"} />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
