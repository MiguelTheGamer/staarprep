"use client";

/**
 * components/Sidebar.tsx
 * Persistent dashboard navigation. Highlights the active route and handles
 * sign-out. Matches the prototype's navy sidebar design.
 */

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  {
    href: "/dashboard",
    label: "Generate",
    icon: (
      <path
        d="M9 2v3M9 13v3M2 9h3M13 9h3M4.5 4.5l2 2M11.5 11.5l2 2M13.5 4.5l-2 2M6.5 11.5l-2 2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    ),
    extra: <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />,
  },
  {
    href: "/dashboard/sets",
    label: "My Question Sets",
    icon: <rect x="2.5" y="3" width="13" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />,
    extra: <path d="M2.5 6.5h13M6 3v12" stroke="currentColor" strokeWidth="1.5" />,
  },
  {
    href: "/dashboard/students",
    label: "Students",
    icon: <circle cx="9" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.5" />,
    extra: <path d="M4 15c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />,
  },
  {
    href: "/dashboard/analytics",
    label: "TEKS Analytics",
    icon: (
      <path
        d="M3 15V3M3 15h12M6 12V8M9.5 12V5M13 12V9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
];

export function Sidebar({ name, plan }: { name: string; plan: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-60 flex-col bg-navy">
      <div className="flex items-center gap-2 border-b border-white/10 p-6">
        <div
          className="h-[26px] w-[26px] bg-white"
          style={{
            clipPath:
              "polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)",
          }}
        />
        <span className="font-display text-[17px] text-white">StarPrep AI</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV.map((item) => {
          // Active when on the exact route, or on any child route. Dashboard
          // root must be exact-match so it doesn't capture every subpage.
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-3 text-sm transition ${
                active
                  ? "bg-white/10 font-medium text-white"
                  : "text-white/55 hover:bg-white/[0.06] hover:text-white/90"
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                {item.icon}
                {item.extra}
              </svg>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-3 border-t border-white/10 p-4">
        <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-red text-[13px] font-semibold text-white">
          {initials || "T"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-medium text-white">{name || "Teacher"}</div>
          <div className="truncate text-xs capitalize text-white/40">{plan} plan</div>
        </div>
        <button
          onClick={signOut}
          title="Sign out"
          className="text-white/40 transition hover:text-white"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M11 5V4a1.5 1.5 0 0 0-1.5-1.5h-5A1.5 1.5 0 0 0 3 4v10a1.5 1.5 0 0 0 1.5 1.5h5A1.5 1.5 0 0 0 11 14v-1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M8 9h7m0 0l-2.5-2.5M15 9l-2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
