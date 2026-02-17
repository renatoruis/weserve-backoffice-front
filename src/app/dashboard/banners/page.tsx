"use client";

import { useState } from "react";
import useApi from "@/hooks/useApi";
import useSubmit from "@/hooks/useSubmit";
import DataTable from "@/components/DataTable";
import I18nField from "@/components/I18nField";
import { InputField } from "@/components/ui/Input";
import ImageUpload from "@/components/ImageUpload";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { useAuth } from "@/contexts/auth-context";
import { hasMinRole } from "@/lib/permissions";
import { toDateInputValue } from "@/lib/date";

interface Banner {
  id: string;
  title_i18n: { en: string; pt: string };
  subtitle_i18n: { en: string; pt: string };
  link_label_i18n: { en: string; pt: string };
  image_url: string | null;
  link_url: string | null;
  sort_order: number;
  active: boolean;
  starts_at: string | null;
  ends_at: string | null;
}

const emptyForm = {
  title_i18n: { en: "", pt: "" },
  subtitle_i18n: { en: "", pt: "" },
  link_label_i18n: { en: "", pt: "" },
  image_url: "",
  link_url: "",
  sort_order: "0",
  active: true,
  starts_at: "",
  ends_at: "",
};

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-4">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><polyline points="12 19 5 12 12 5" /></svg>
      Back
    </button>
  );
}

export default function BannersPage() {
  const { data, loading, page, totalPages, setPage, refetch } = useApi<Banner>("/banners");
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
    const r = row as Banner;
    setForm({
      title_i18n: r.title_i18n || { en: "", pt: "" },
      subtitle_i18n: r.subtitle_i18n || { en: "", pt: "" },
      link_label_i18n: r.link_label_i18n || { en: "", pt: "" },
      image_url: r.image_url || "",
      link_url: r.link_url || "",
      sort_order: String(r.sort_order ?? 0),
      active: r.active,
      starts_at: toDateInputValue(r.starts_at),
      ends_at: toDateInputValue(r.ends_at),
    });
    setEditing(r.id);
    setShowForm(true);
  };

  const handleDelete = async (row: unknown) => {
    const r = row as Banner;
    await submit(`/banners/${r.id}`, { method: "DELETE" });
    refetch();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editing ? "PUT" : "POST";
    const url = editing ? `/banners/${editing}` : "/banners";
    const res = await submit(url, {
      method,
      body: {
        title_i18n: form.title_i18n,
        subtitle_i18n: form.subtitle_i18n,
        link_label_i18n: form.link_label_i18n,
        image_url: form.image_url || null,
        link_url: form.link_url || null,
        sort_order: Number(form.sort_order) || 0,
        active: form.active,
        starts_at: form.starts_at || null,
        ends_at: form.ends_at || null,
      },
    });
    if (res) {
      setShowForm(false);
      refetch();
    }
  };

  const columns = [
    {
      key: "image_url",
      label: "",
      hideOnMobile: true,
      render: (v: unknown) =>
        v ? (
          <img src={v as string} alt="" className="w-10 h-10 rounded-lg object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-gray-100" />
        ),
    },
    {
      key: "title_i18n",
      label: "Title",
      render: (v: unknown) => {
        const i = v as { pt: string; en: string } | null;
        return i?.pt || i?.en || "—";
      },
    },
    {
      key: "active",
      label: "Status",
      render: (v: unknown) => (
        <Badge variant={v ? "success" : "muted"}>
          {v ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "sort_order",
      label: "Order",
      render: (v: unknown) => String(v ?? "—"),
    },
    {
      key: "starts_at",
      label: "Starts",
      hideOnMobile: true,
      render: (v: unknown) => v ? new Date(v as string).toLocaleDateString("en") : "—",
    },
  ];

  if (showForm) {
    return (
      <div>
        <BackButton onClick={closeForm} />
        <h1 className="text-xl md:text-2xl font-bold mb-6">{editing ? "Edit Banner" : "New Banner"}</h1>
        <form onSubmit={handleSave} className="bg-white rounded-2xl p-4 md:p-6 shadow-sm max-w-3xl space-y-4">
          <I18nField label="Title" value={form.title_i18n} onChange={(v) => setForm((p) => ({ ...p, title_i18n: v }))} required />
          <I18nField label="Subtitle" value={form.subtitle_i18n} onChange={(v) => setForm((p) => ({ ...p, subtitle_i18n: v }))} />
          <I18nField label="Link Label" value={form.link_label_i18n} onChange={(v) => setForm((p) => ({ ...p, link_label_i18n: v }))} />
          <ImageUpload label="Banner Image" value={form.image_url} onChange={(v) => setForm((p) => ({ ...p, image_url: v }))} />
          <InputField
            label="Link URL"
            value={form.link_url}
            onChange={(v) => setForm((p) => ({ ...p, link_url: v }))}
            placeholder="https://..."
          />
          <InputField
            label="Sort Order"
            type="number"
            value={form.sort_order}
            onChange={(v) => setForm((p) => ({ ...p, sort_order: v }))}
          />
          <InputField
            label="Starts At"
            type="date"
            value={form.starts_at}
            onChange={(v) => setForm((p) => ({ ...p, starts_at: v }))}
          />
          <InputField
            label="Ends At"
            type="date"
            value={form.ends_at}
            onChange={(v) => setForm((p) => ({ ...p, ends_at: v }))}
          />
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
            />
            Active
          </label>
          <div className="flex gap-3 pt-2">
            <Button type="button" onClick={closeForm} className="flex-1 !bg-gray-100 !text-gray-700 hover:!bg-gray-200">
              Cancel
            </Button>
            <Button type="submit" loading={saving} className="flex-1">
              {editing ? "Save" : "Create"}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-bold">Banners</h1>
        {canEdit && <Button onClick={openNew}>+ New Banner</Button>}
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
