"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import useAuthFetch from "@/hooks/useAuthFetch";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  CalendarIcon,
  BookIcon,
  HeartIcon,
  BellIcon,
  PushIcon,
  ChurchIcon,
  HomeIcon,
  BibleIcon,
  GiftIcon,
  BlogIcon,
} from "@/components/icons";

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
  { label: "Generosidade", href: "/dashboard/generosidade", icon: GiftIcon },
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
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Acesso Rápido</h2>
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

