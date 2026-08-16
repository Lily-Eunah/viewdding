"use client";

import Link from "next/link";
import { Buildings, Camera, EnvelopeSimple, House, ShoppingBagOpen } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";

export function BottomNav() {
  const pathname = usePathname() ?? "";

  const navItems = [
    { key: "home", href: "/", label: "홈", Icon: House, active: pathname === "/" },
    {
      key: "wedding",
      href: "/search/",
      label: "웨딩홀",
      Icon: Buildings,
      active: pathname.startsWith("/search") || pathname.startsWith("/halls"),
    },
    {
      key: "gatherings",
      href: "/gatherings/?purpose=invitation",
      label: "모임장소",
      Icon: EnvelopeSimple,
      active: pathname.startsWith("/gatherings"),
    },
    {
      key: "self_snap",
      href: "/self-snap/",
      label: "셀프스냅",
      Icon: Camera,
      active: pathname.startsWith("/self-snap"),
    },
    {
      key: "essentials",
      href: "/essentials/",
      label: "준비물",
      Icon: ShoppingBagOpen,
      active: pathname.startsWith("/essentials"),
    },
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

