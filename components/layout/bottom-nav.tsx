"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BarChart3, Scale, Settings as SettingsIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { getJerusalemDateString } from "@/lib/dates/jerusalem";

export function BottomNav() {
  const pathname = usePathname();
  const today = getJerusalemDateString();

  const links = [
    {
      href: `/day/${today}`,
      label: "Today",
      icon: Home,
      match: (p: string) => p === "/" || p.startsWith("/day/"),
    },
    {
      href: "/stats",
      label: "Stats",
      icon: BarChart3,
      match: (p: string) => p === "/stats",
    },
    {
      href: "/weight",
      label: "Weight",
      icon: Scale,
      match: (p: string) => p === "/weight",
    },
    {
      href: "/settings",
      label: "Settings",
      icon: SettingsIcon,
      match: (p: string) => p === "/settings",
    },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-surface/85 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-[480px] items-stretch px-2">
        {links.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 pb-2.5 pt-2 text-[11px] font-medium transition-all active:scale-95",
                active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-14 items-center justify-center rounded-full transition-colors duration-200",
                  active && "bg-subtle"
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.25 : 1.75} />
              </span>
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
