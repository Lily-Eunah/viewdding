"use client";

import Link from "next/link";
import { Buildings, ForkKnife, Heart, House } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "홈", Icon: House, paths: ["/"] },
  { href: "/search/", label: "웨딩홀", Icon: Buildings, paths: ["/search", "/halls"] },
  { href: "/gatherings/", label: "모임장소", Icon: ForkKnife, paths: ["/gatherings", "/restaurants"] },
  { href: "/favorites/", label: "저장", Icon: Heart, paths: ["/favorites"] },
] as const;

function isActivePath(pathname: string, paths: readonly string[]): boolean {
  if (paths.includes("/") && pathname === "/") return true;
  return paths.filter((path) => path !== "/").some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav" aria-label="주요 메뉴">
      {NAV_ITEMS.map(({ href, label, Icon, paths }) => {
        const active = isActivePath(pathname, paths);
        return (
          <Link key={href} href={href} className={active ? "is-active" : undefined} aria-current={active ? "page" : undefined}>
            <Icon aria-hidden="true" size={22} weight={active ? "fill" : "regular"} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
