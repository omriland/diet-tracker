"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  {
    href: "/",
    label: "Today",
    match: (p: string) => p === "/" || p.startsWith("/day/"),
  },
  {
    href: "/weight",
    label: "Weight",
    match: (p: string) => p === "/weight",
  },
  {
    href: "/settings",
    label: "Settings",
    match: (p: string) => p === "/settings",
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-background/85 backdrop-blur-md"
      style={{
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="mx-auto flex max-w-[480px] items-stretch">
        {links.map(({ href, label, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex flex-1 items-center justify-center py-4 text-[10px] tracking-[0.18em] uppercase transition-colors",
                active
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {active && (
                <span
                  aria-hidden
                  className="absolute top-0 h-px w-8 bg-accent"
                />
              )}
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
