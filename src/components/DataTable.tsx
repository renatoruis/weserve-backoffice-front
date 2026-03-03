"use client";

import { useState } from "react";
import { SkeletonTable } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import Button from "@/components/ui/Button";

interface Column {
  key: string;
  label: string;
  hideOnMobile?: boolean;
  render?: (value: unknown, row: unknown) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: unknown[];
  loading?: boolean;
  onEdit?: (row: unknown) => void;
  onDelete?: (row: unknown) => Promise<void> | void;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  emptyTitle?: string;
  emptyAction?: React.ReactNode;
}

export default function DataTable({
  columns,
  data,
  loading = false,
  onEdit,
  onDelete,
  page,
  totalPages,
  onPageChange,
  emptyTitle,
  emptyAction,
}: DataTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (loading) {
    return <SkeletonTable rows={5} cols={columns.length} />;
  }

  if (!Array.isArray(data) || data.length === 0) {
    return <EmptyState title={emptyTitle} action={emptyAction} />;
  }

  const handleDelete = async (row: Record<string, unknown>) => {
    if (!onDelete || deletingId) return;
    if (!confirm("Tem a certeza que quer apagar este item?")) return;
    const id = (row.id || row.bible_id || "") as string;
    setDeletingId(id);
    try {
      await onDelete(row);
    } finally {
      setDeletingId(null);
    }
  };

  const hasActions = !!(onEdit || onDelete);

  return (
    <div>
      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {columns.map((col) => (
                <th key={col.key} className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">
                  {col.label}
                </th>
              ))}
              {hasActions && (
                <th className="text-right px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide w-32">
                  Ações
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((row: unknown, i: number) => {
              const r = row as Record<string, unknown>;
              const rowId = (r.id || String(i)) as string;
              return (
                <tr key={rowId} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      {col.render ? col.render(r[col.key], r) : (r[col.key] as React.ReactNode)}
                    </td>
                  ))}
                  {hasActions && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        {onEdit && (
                          <Button variant="secondary" size="sm" onClick={() => onEdit(r)}>
                            Editar
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="danger"
                            size="sm"
                            loading={deletingId === rowId}
                            disabled={deletingId !== null}
                            onClick={() => handleDelete(r)}
                          >
                            Apagar
                          </Button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {data.map((row: unknown, i: number) => {
          const r = row as Record<string, unknown>;
          const rowId = (r.id || String(i)) as string;
          return (
            <div key={rowId} className="bg-white rounded-xl shadow-sm p-4 space-y-2">
              {columns
                .filter((col) => !col.hideOnMobile)
                .map((col) => (
                  <div key={col.key} className="flex items-start justify-between gap-2">
                    {col.label && (
                      <span className="text-xs font-medium text-gray-400 shrink-0">{col.label}</span>
                    )}
                    <span className="text-sm text-right">
                      {col.render ? col.render(r[col.key], r) : (r[col.key] as React.ReactNode)}
                    </span>
                  </div>
                ))}
                {hasActions && (
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  {onEdit && (
                    <Button variant="secondary" size="sm" onClick={() => onEdit(r)} className="flex-1">
                      Editar
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="danger"
                      size="sm"
                      loading={deletingId === rowId}
                      disabled={deletingId !== null}
                      onClick={() => handleDelete(r)}
                      className="flex-1"
                    >
                      Apagar
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {page && totalPages && onPageChange && (
        <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
      )}
    </div>
  );
}
