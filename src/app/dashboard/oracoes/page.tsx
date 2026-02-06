"use client";

import { useState, useEffect, useCallback } from "react";
import DataTable from "@/components/DataTable";

interface Prayer {
  id: string;
  name: string;
  message: string;
  phone: string | null;
  is_public: boolean;
  pray_count: number;
  created_at: string;
}

export default function OracoesPage() {
  const [prayers, setPrayers] = useState<Prayer[]>([]);

  const load = useCallback(() => {
    fetch("/api/proxy/admin/prayers")
      .then((r) => r.json())
      .then((d) => setPrayers(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (row: Prayer) => {
    if (!confirm("Delete this prayer request?")) return;
    await fetch(`/api/proxy/admin/prayers/${row.id}`, { method: "DELETE" });
    load();
  };

  const columns = [
    { key: "name", label: "Name" },
    {
      key: "message",
      label: "Message",
      render: (v: string) => (
        <span className="line-clamp-2 max-w-xs text-sm">{v}</span>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      render: (v: string | null) =>
        v ? (
          <a href={`tel:${v}`} className="text-sm text-blue-600 hover:underline">
            {v}
          </a>
        ) : (
          <span className="text-xs text-gray-300">—</span>
        ),
    },
    {
      key: "is_public",
      label: "Visibility",
      render: (v: boolean) => (
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${v ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>
          {v ? "Public" : "Private"}
        </span>
      ),
    },
    {
      key: "pray_count",
      label: "Prayed",
      render: (v: number) => (
        <span className="text-sm font-medium">
          {v > 0 ? `${v} 🙏` : "—"}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Date",
      render: (v: string) => v ? new Date(v).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "",
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Prayer Requests</h1>
        <span className="text-sm text-gray-500">{prayers.length} total</span>
      </div>
      <DataTable columns={columns} data={prayers} onDelete={handleDelete} />
    </div>
  );
}
