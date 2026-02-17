"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import useAuthFetch from "@/hooks/useAuthFetch";
import { Skeleton } from "@/components/ui/Skeleton";

interface Stats {
  events: number;
  sermons: number;
  prayers: number;
  notices: number;
  subscribers: number;
}

const cards = [
  { key: "events", label: "Events", href: "/dashboard/agenda", icon: CalendarIcon },
  { key: "sermons", label: "Sermons", href: "/dashboard/sermoes", icon: BookIcon },
  { key: "prayers", label: "Prayer Requests", href: "/dashboard/oracoes", icon: HeartIcon },
  { key: "notices", label: "Notices", href: "/dashboard/avisos", icon: BellIcon },
  { key: "subscribers", label: "Push Subscribers", href: "/dashboard/push", icon: PushIcon },
] as const;

const extraCards = [
  { label: "Church Details", href: "/dashboard/igreja", icon: ChurchIcon },
  { label: "Home / Banner", href: "/dashboard/home-content", icon: HomeIcon },
  { label: "Bible Versions", href: "/dashboard/biblia", icon: BibleIcon },
  { label: "Pages", href: "/dashboard/pages", icon: PageIcon },
  { label: "Blog", href: "/dashboard/blog", icon: BlogIcon },
];

export default function DashboardPage() {
  const { adminFetch } = useAuthFetch();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    adminFetch("/stats")
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(() => {
        fetchedRef.current = false; // allow retry on error
      })
      .finally(() => setLoading(false));
  }, [adminFetch]);

  return (
    <div>
      <h1 className="text-xl md:text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-8">
        {cards.map((card) => (
          <Link
            key={card.key}
            href={card.href}
            className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
          >
            <span className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
              <card.icon />
            </span>
            <div>
              <p className="text-sm font-medium text-gray-500">{card.label}</p>
              {loading ? (
                <Skeleton className="h-7 w-12 mt-1" />
              ) : (
                <p className="text-2xl font-bold text-[var(--color-primary)] mt-0.5">
                  {stats?.[card.key as keyof Stats] ?? "—"}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Quick Access</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {extraCards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3"
          >
            <span className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
              <card.icon />
            </span>
            <p className="text-sm font-medium">{card.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ── SVG Icons ── */

function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  );
}

function PushIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 17H2a3 3 0 003 3h14a3 3 0 003-3z" /><circle cx="18" cy="8" r="3" />
    </svg>
  );
}

function ChurchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2H6a2 2 0 00-2 2v16l6-3 6 3V4a2 2 0 00-2-2z" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function BibleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /><line x1="12" y1="6" x2="12" y2="13" /><line x1="8.5" y1="9.5" x2="15.5" y2="9.5" />
    </svg>
  );
}

function PageIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function BlogIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}
