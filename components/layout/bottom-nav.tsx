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
      className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-surface"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-[480px] items-stretch">
        {links.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 py-3 text-xs transition-colors",
                active ? "text-accent" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={1.75} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
