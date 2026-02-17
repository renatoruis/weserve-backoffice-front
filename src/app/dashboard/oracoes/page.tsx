"use client";

import useApi from "@/hooks/useApi";
import useSubmit from "@/hooks/useSubmit";
import DataTable from "@/components/DataTable";
import Badge from "@/components/ui/Badge";
import { useAuth } from "@/contexts/auth-context";
import { hasMinRole } from "@/lib/permissions";

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
  const { data, loading, page, totalPages, setPage, refetch } = useApi<Prayer>("/prayers");
  const { submit } = useSubmit();
  const { church } = useAuth();
  const canEdit = hasMinRole(church?.role, "editor");

  const handleDelete = async (row: unknown) => {
    const r = row as Prayer;
    await submit(`/prayers/${r.id}`, { method: "DELETE" });
    refetch();
  };

  const columns = [
    { key: "name", label: "Name" },
    {
      key: "message",
      label: "Message",
      render: (v: unknown) => (
        <span className="line-clamp-2 max-w-xs text-sm">{v as string}</span>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      hideOnMobile: true,
      render: (v: unknown) =>
        v ? (
          <a href={`tel:${v}`} className="text-sm text-blue-600 hover:underline">{v as string}</a>
        ) : (
          <span className="text-xs text-gray-300">--</span>
        ),
    },
    {
      key: "is_public",
      label: "Visibility",
      render: (v: unknown) => (
        <Badge variant={v ? "success" : "warning"}>
          {v ? "Public" : "Private"}
        </Badge>
      ),
    },
    {
      key: "pray_count",
      label: "Prayed",
      hideOnMobile: true,
      render: (v: unknown) => (
        <span className="text-sm font-medium">{(v as number) > 0 ? v as number : "--"}</span>
      ),
    },
    {
      key: "created_at",
      label: "Date",
      hideOnMobile: true,
      render: (v: unknown) => v ? new Date(v as string).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" }) : "",
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-bold">Prayer Requests</h1>
        <span className="text-sm text-gray-500">{data.length} total</span>
      </div>

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        onDelete={canEdit ? handleDelete : undefined}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
