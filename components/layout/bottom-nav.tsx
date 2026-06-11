"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Flame, BarChart3, Scale, Settings as SettingsIcon, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { getJerusalemDateString } from "@/lib/dates/jerusalem";
import { ADD_MEAL_EVENT } from "@/lib/meals/add-meal-signal";

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const today = getJerusalemDateString();
  const onDayView = pathname === "/" || pathname.startsWith("/day/");

  const left = [
    {
      href: `/day/${today}`,
      label: "Today",
      icon: Flame,
      match: (p: string) => p === "/" || p.startsWith("/day/"),
    },
    {
      href: "/stats",
      label: "Stats",
      icon: BarChart3,
      match: (p: string) => p === "/stats",
    },
  ];
  const right = [
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

  function handleAdd() {
    if (onDayView) {
      window.dispatchEvent(new CustomEvent(ADD_MEAL_EVENT));
    } else {
      router.push(`/day/${today}?add=1`);
    }
  }

  return (
    <nav
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-5"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.75rem)" }}
    >
      <div className="dock-in glass-strong pointer-events-auto flex w-full max-w-[400px] items-center justify-between rounded-pill px-2.5 py-2 shadow-[0_18px_50px_rgba(0,0,0,0.55)]">
        {left.map((item) => (
          <DockTab key={item.href} {...item} active={item.match(pathname)} />
        ))}

        <button
          type="button"
          onClick={handleAdd}
          aria-label="Add meal"
          className="glow-accent -my-4 flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground transition-all duration-200 active:scale-90 active:shadow-none"
        >
          <Plus className="h-7 w-7" strokeWidth={2.5} />
        </button>

        {right.map((item) => (
          <DockTab key={item.href} {...item} active={item.match(pathname)} />
        ))}
      </div>
    </nav>
  );
}

interface DockTabProps {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  active: boolean;
}

function DockTab({ href, label, icon: Icon, active }: DockTabProps) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      aria-label={label}
      className={cn(
        "flex w-14 flex-col items-center gap-1 rounded-2xl py-1.5 transition-all active:scale-90",
        active ? "text-accent" : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.4 : 1.8} />
      <span
        className={cn(
          "h-1 w-1 rounded-full transition-all duration-300",
          active ? "bg-accent" : "bg-transparent"
        )}
        aria-hidden
      />
    </Link>
  );
}
