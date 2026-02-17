"use client";

import { useState } from "react";
import useApi from "@/hooks/useApi";
import useSubmit from "@/hooks/useSubmit";
import DataTable from "@/components/DataTable";
import I18nField from "@/components/I18nField";
import { InputField, SelectField } from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { useAuth } from "@/contexts/auth-context";
import { hasMinRole } from "@/lib/permissions";
import { toDateInputValue } from "@/lib/date";

interface Notice {
  id: string;
  title: string;
  title_i18n: { en: string; pt: string };
  body: string;
  body_i18n: { en: string; pt: string };
  published: boolean;
  pinned: boolean;
  sort_order: number;
  notice_type: string;
  expires_at: string | null;
  created_at: string;
}

const emptyForm = {
  title_i18n: { en: "", pt: "" },
  body_i18n: { en: "", pt: "" },
  published: true,
  pinned: false,
  sort_order: "0",
  notice_type: "general",
  expires_at: "",
};

const noticeTypeOptions = [
  { value: "general", label: "General" },
  { value: "urgent", label: "Urgent" },
  { value: "info", label: "Info" },
  { value: "warning", label: "Warning" },
];

/* ── Back button ── */

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-4"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5" /><polyline points="12 19 5 12 12 5" />
      </svg>
      Back
    </button>
  );
}

export default function AvisosPage() {
  const { data, loading, page, totalPages, setPage, refetch } = useApi<Notice>("/notices");
  const { submit, loading: saving } = useSubmit();
  const { church } = useAuth();
  const canEdit = hasMinRole(church?.role, "editor");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  const openNew = () => {
    setForm(emptyForm);
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (row: unknown) => {
    const r = row as Notice;
    setForm({
      title_i18n: r.title_i18n || { en: r.title || "", pt: r.title || "" },
      body_i18n: r.body_i18n || { en: r.body || "", pt: r.body || "" },
      published: r.published,
      pinned: r.pinned || false,
      sort_order: String(r.sort_order ?? 0),
      notice_type: r.notice_type || "general",
      expires_at: toDateInputValue(r.expires_at),
    });
    setEditing(r.id);
    setShowForm(true);
  };

  const handleDelete = async (row: unknown) => {
    const r = row as Notice;
    await submit(`/notices/${r.id}`, { method: "DELETE" });
    refetch();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editing ? "PUT" : "POST";
    const url = editing ? `/notices/${editing}` : "/notices";
    const res = await submit(url, {
      method,
      body: {
        title_i18n: form.title_i18n,
        body_i18n: form.body_i18n,
        published: form.published,
        pinned: form.pinned,
        sort_order: Number(form.sort_order) || 0,
        notice_type: form.notice_type,
        expires_at: form.expires_at || null,
      },
    });
    if (res) {
      setShowForm(false);
      refetch();
    }
  };

  const columns = [
    {
      key: "title",
      label: "Title",
      render: (_v: unknown, row: unknown) => {
        const r = row as Notice;
        return r.title_i18n?.pt || r.title || "—";
      },
    },
    {
      key: "notice_type",
      label: "Type",
      hideOnMobile: true,
      render: (v: unknown) => {
        const t = v as string;
        const variantMap: Record<string, "info" | "danger" | "warning" | "muted"> = {
          urgent: "danger",
          info: "info",
          warning: "warning",
          general: "muted",
        };
        return (
          <Badge variant={variantMap[t] || "muted"}>
            {t ? t.charAt(0).toUpperCase() + t.slice(1) : "General"}
          </Badge>
        );
      },
    },
    {
      key: "pinned",
      label: "Pinned",
      hideOnMobile: true,
      render: (v: unknown) =>
        v ? <Badge variant="warning">Pinned</Badge> : <span className="text-gray-400 text-xs">—</span>,
    },
    {
      key: "published",
      label: "Status",
      render: (v: unknown) => (
        <Badge variant={v ? "success" : "muted"}>
          {v ? "Published" : "Draft"}
        </Badge>
      ),
    },
    {
      key: "created_at",
      label: "Date",
      hideOnMobile: true,
      render: (v: unknown) => v ? new Date(v as string).toLocaleDateString("en") : "",
    },
  ];

  /* ── Render: Full-page form ── */

  if (showForm) {
    return (
      <div>
        <BackButton onClick={closeForm} />
        <h1 className="text-xl md:text-2xl font-bold mb-6">{editing ? "Edit Notice" : "New Notice"}</h1>
        <form onSubmit={handleSave} className="bg-white rounded-2xl p-4 md:p-6 shadow-sm max-w-3xl space-y-4">
          <I18nField label="Title" value={form.title_i18n} onChange={(v) => setForm((p) => ({ ...p, title_i18n: v }))} required />
          <I18nField label="Content" value={form.body_i18n} onChange={(v) => setForm((p) => ({ ...p, body_i18n: v }))} rows={4} />
          <SelectField
            label="Notice Type"
            options={noticeTypeOptions}
            value={form.notice_type}
            onChange={(v) => setForm((p) => ({ ...p, notice_type: v }))}
          />
          <InputField
            label="Sort Order"
            type="number"
            value={form.sort_order}
            onChange={(v) => setForm((p) => ({ ...p, sort_order: v }))}
          />
          <InputField
            label="Expires At"
            type="date"
            value={form.expires_at}
            onChange={(v) => setForm((p) => ({ ...p, expires_at: v }))}
          />
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={form.pinned}
              onChange={(e) => setForm((p) => ({ ...p, pinned: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
            />
            Pinned
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm((p) => ({ ...p, published: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
            />
            Published
          </label>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={closeForm}>Cancel</Button>
            <Button type="submit" loading={saving} className="flex-1">
              {editing ? "Save" : "Create"}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  /* ── Render: List view ── */

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-bold">Notices</h1>
        {canEdit && <Button onClick={openNew}>+ New Notice</Button>}
      </div>

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        onEdit={canEdit ? openEdit : undefined}
        onDelete={canEdit ? handleDelete : undefined}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
