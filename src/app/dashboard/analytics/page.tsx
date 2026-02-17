"use client";

import { useState, useEffect, useRef } from "react";
import useAuthFetch from "@/hooks/useAuthFetch";
import { Skeleton } from "@/components/ui/Skeleton";

interface OverviewData {
  total_hits: number;
  total_visitors: number;
  daily: { date: string; hits: number; visitors: number }[];
}

interface ModuleData {
  module: string;
  hits: number;
}

interface ContentItem {
  id: string;
  title: string;
  type: string;
  views: number;
}

interface VisitorDay {
  date: string;
  admin: number;
  public: number;
}

const PERIODS = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
];

const CONTENT_TYPES = [
  { value: "sermon", label: "Sermons" },
  { value: "event", label: "Events" },
  { value: "page", label: "Pages" },
  { value: "blog_post", label: "Blog" },
];

export default function AnalyticsPage() {
  const { adminFetch } = useAuthFetch();
  const [period, setPeriod] = useState("30d");
  const [contentType, setContentType] = useState("sermon");

  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [modules, setModules] = useState<ModuleData[]>([]);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [visitors, setVisitors] = useState<VisitorDay[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchedRef = useRef(false);
  const currentPeriod = useRef(period);
  const currentType = useRef(contentType);

  const fetchAll = async (p: string, ct: string) => {
    setLoading(true);
    try {
      const [ovRes, modRes, contRes, visRes] = await Promise.all([
        adminFetch(`/analytics/overview?period=${p}`),
        adminFetch(`/analytics/modules?period=${p}`),
        adminFetch(`/analytics/content?period=${p}&type=${ct}&limit=10`),
        adminFetch(`/analytics/visitors?period=${p}`),
      ]);

      const [ovData, modData, contData, visData] = await Promise.all([
        ovRes.ok ? ovRes.json() : null,
        modRes.ok ? modRes.json() : [],
        contRes.ok ? contRes.json() : [],
        visRes.ok ? visRes.json() : [],
      ]);

      setOverview(ovData);
      setModules(Array.isArray(modData) ? modData : modData?.data ?? []);
      setContent(Array.isArray(contData) ? contData : contData?.data ?? []);
      setVisitors(Array.isArray(visData) ? visData : visData?.data ?? []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchAll(period, contentType);
      return;
    }
    if (currentPeriod.current !== period || currentType.current !== contentType) {
      currentPeriod.current = period;
      currentType.current = contentType;
      fetchAll(period, contentType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, contentType]);

  const maxHits = overview?.daily
    ? Math.max(...overview.daily.map((d) => d.hits), 1)
    : 1;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-xl md:text-2xl font-bold">Analytics</h1>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                period === p.value
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
        <StatCard
          label="Total Hits"
          value={overview?.total_hits}
          loading={loading}
        />
        <StatCard
          label="Unique Visitors"
          value={overview?.total_visitors}
          loading={loading}
        />
        <StatCard
          label="Top Module"
          value={modules[0]?.module}
          sub={modules[0] ? `${modules[0].hits} hits` : undefined}
          loading={loading}
        />
        <StatCard
          label={`Top ${CONTENT_TYPES.find((t) => t.value === contentType)?.label ?? "Content"}`}
          value={content[0]?.title}
          sub={content[0] ? `${content[0].views} views` : undefined}
          loading={loading}
        />
      </div>

      {/* Daily chart */}
      <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Daily Hits
        </h2>
        {loading ? (
          <Skeleton className="h-32 w-full" />
        ) : overview?.daily && overview.daily.length > 0 ? (
          <div className="flex items-end gap-[2px] h-32">
            {overview.daily.map((d) => (
              <div
                key={d.date}
                className="flex-1 bg-[var(--color-primary)] rounded-t opacity-70 hover:opacity-100 transition-opacity relative group"
                style={{
                  height: `${Math.max((d.hits / maxHits) * 100, 2)}%`,
                }}
                title={`${d.date}: ${d.hits} hits, ${d.visitors} visitors`}
              >
                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">
                  {d.date}: {d.hits}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-8">
            No data for this period
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Modules ranking */}
        <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Module Usage
          </h2>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : modules.length > 0 ? (
            <div className="space-y-2">
              {modules.map((mod, i) => {
                const maxModHits = modules[0]?.hits || 1;
                return (
                  <div key={mod.module} className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-5 text-right">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium capitalize">
                          {mod.module.replace(/_/g, " ")}
                        </span>
                        <span className="text-xs text-gray-400">
                          {mod.hits}
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[var(--color-primary)] rounded-full"
                          style={{
                            width: `${(mod.hits / maxModHits) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">No data</p>
          )}
        </div>

        {/* Top content */}
        <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Top Content
            </h2>
            <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
              {CONTENT_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setContentType(t.value)}
                  className={`px-2 py-1 text-[10px] font-medium rounded-md transition-colors ${
                    contentType === t.value
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : content.length > 0 ? (
            <div className="space-y-2">
              {content.map((item, i) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 py-1.5"
                >
                  <span className="text-xs text-gray-400 w-5 text-right">
                    {i + 1}
                  </span>
                  <span className="text-sm flex-1 truncate">{item.title}</span>
                  <span className="text-xs text-gray-400 shrink-0">
                    {item.views} views
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">No data</p>
          )}
        </div>
      </div>

      {/* Visitors by day */}
      {visitors.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 mt-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Visitors (Admin vs Public)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-3 py-2 font-semibold text-gray-500 text-xs">
                    Date
                  </th>
                  <th className="text-right px-3 py-2 font-semibold text-gray-500 text-xs">
                    Admin
                  </th>
                  <th className="text-right px-3 py-2 font-semibold text-gray-500 text-xs">
                    Public
                  </th>
                  <th className="text-right px-3 py-2 font-semibold text-gray-500 text-xs">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {visitors.slice(0, 14).map((v) => (
                  <tr
                    key={v.date}
                    className="border-b border-gray-50"
                  >
                    <td className="px-3 py-2 text-gray-600">{v.date}</td>
                    <td className="px-3 py-2 text-right text-gray-500">
                      {v.admin}
                    </td>
                    <td className="px-3 py-2 text-right text-gray-500">
                      {v.public}
                    </td>
                    <td className="px-3 py-2 text-right font-medium">
                      {v.admin + v.public}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  loading,
}: {
  label: string;
  value?: string | number | null;
  sub?: string;
  loading: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      {loading ? (
        <Skeleton className="h-7 w-16 mt-1" />
      ) : (
        <>
          <p className="text-xl font-bold text-[var(--color-primary)] mt-0.5 truncate">
            {value ?? "—"}
          </p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </>
      )}
    </div>
  );
}
