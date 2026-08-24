"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/src/lib/utils";
import { Zap } from "lucide-react";

const TABS = [
  { href: "/", label: "PDF Parser" },
  { href: "/query", label: "Knowledge Query" },
  { href: "/batch", label: "Batch Parse" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 h-14">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 text-blue-600 font-bold text-lg tracking-tight">
          <Zap className="h-5 w-5 fill-blue-600" />
          Captain
        </Link>

        {/* Tab nav */}
        <nav className="flex items-center gap-1">
          {TABS.map(({ href, label }) => {
            const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
