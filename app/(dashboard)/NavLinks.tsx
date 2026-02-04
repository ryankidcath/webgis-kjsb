"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map } from "lucide-react";

const NAV_ITEMS: { href: string; label: string; icon?: typeof Map }[] = [
  { href: "/", label: "Peta", icon: Map },
  { href: "/tahap/1", label: "Tahap 1" },
  { href: "/tahap/2", label: "Tahap 2" },
  { href: "/tahap/3", label: "Tahap 3" },
  { href: "/tahap/4", label: "Tahap 4" },
  { href: "/tahap/5", label: "Tahap 5" },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 flex-wrap">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const isActive =
          href === "/"
            ? pathname === "/"
            : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`
              flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-colors duration-200
              ${isActive
                ? "bg-primary-100 text-primary-700 font-medium"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
              }
            `}
          >
            {Icon ? <Icon className="w-4 h-4" /> : null}
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
