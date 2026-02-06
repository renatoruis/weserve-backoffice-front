"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Stats {
  events: number;
  sermons: number;
  prayers: number;
  notices: number;
  subscribers: number;
}

const cards = [
  { key: "events", label: "Events", href: "/dashboard/agenda", icon: "📅" },
  { key: "sermons", label: "Sermons", href: "/dashboard/sermoes", icon: "📖" },
  { key: "prayers", label: "Prayer Requests", href: "/dashboard/oracoes", icon: "🙏" },
  { key: "notices", label: "Notices", href: "/dashboard/avisos", icon: "📢" },
  { key: "subscribers", label: "Push Subscribers", href: "/dashboard/push", icon: "🔔" },
] as const;

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/proxy/admin/stats")
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Link
            key={card.key}
            href={card.href}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
          >
            <span className="text-3xl">{card.icon}</span>
            <div>
              <p className="text-base font-semibold">{card.label}</p>
              {stats && (
                <p className="text-2xl font-bold text-[var(--color-primary)] mt-0.5">
                  {stats[card.key as keyof Stats]}
                </p>
              )}
            </div>
          </Link>
        ))}
        <Link
          href="/dashboard/igreja"
          className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
        >
          <span className="text-3xl">⛪</span>
          <p className="text-base font-semibold">Church Details</p>
        </Link>
        <Link
          href="/dashboard/home-content"
          className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
        >
          <span className="text-3xl">✨</span>
          <p className="text-base font-semibold">Home / Banner</p>
        </Link>
      </div>
    </div>
  );
}
