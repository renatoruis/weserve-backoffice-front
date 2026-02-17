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

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-4">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><polyline points="12 19 5 12 12 5" /></svg>
      Back
    </button>
  );
}

interface Resource {
  id: string;
  title_i18n: { en: string; pt: string };
  description_i18n: { en: string; pt: string };
  file_url: string;
  file_type: string;
  category: string | null;
  published: boolean;
}

const emptyForm = {
  title_i18n: { en: "", pt: "" },
  description_i18n: { en: "", pt: "" },
  file_url: "",
  file_type: "pdf",
  category: "",
  published: true,
};

const fileTypeOptions = [
  { value: "pdf", label: "PDF" },
  { value: "doc", label: "Document" },
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
  { value: "audio", label: "Audio" },
  { value: "other", label: "Other" },
];

export default function ResourcesPage() {
  const { church } = useAuth();
  const canEdit = hasMinRole(church?.role, "editor");

  const { data, loading, page, totalPages, setPage, refetch } = useApi<Resource>("/resources");
  const { submit, loading: saving } = useSubmit();
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
    const r = row as Resource;
    setForm({
      title_i18n: r.title_i18n || { en: "", pt: "" },
      description_i18n: r.description_i18n || { en: "", pt: "" },
      file_url: r.file_url || "",
      file_type: r.file_type || "pdf",
      category: r.category || "",
      published: r.published,
    });
    setEditing(r.id);
    setShowForm(true);
  };

  const handleDelete = async (row: unknown) => {
    const r = row as Resource;
    await submit(`/resources/${r.id}`, { method: "DELETE" });
    refetch();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editing ? "PUT" : "POST";
    const url = editing ? `/resources/${editing}` : "/resources";
    const res = await submit(url, {
      method,
      body: {
        title_i18n: form.title_i18n,
        description_i18n: form.description_i18n,
        file_url: form.file_url,
        file_type: form.file_type,
        category: form.category || null,
        published: form.published,
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
        const r = row as Resource;
        return r.title_i18n?.pt || "—";
      },
    },
    {
      key: "file_type",
      label: "Type",
      render: (v: unknown) => (
        <Badge variant="info">
          {(v as string)?.toUpperCase() || "—"}
        </Badge>
      ),
    },
    {
      key: "category",
      label: "Category",
      hideOnMobile: true,
      render: (v: unknown) => (v as string) || "—",
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
  ];

  if (showForm) {
    return (
      <div>
        <BackButton onClick={closeForm} />
        <h1 className="text-xl md:text-2xl font-bold mb-6">
          {editing ? "Edit Resource" : "New Resource"}
        </h1>
        <form onSubmit={handleSave} className="bg-white rounded-2xl p-4 md:p-6 shadow-sm max-w-3xl space-y-4">
          <I18nField label="Title" value={form.title_i18n} onChange={(v) => setForm((p) => ({ ...p, title_i18n: v }))} required />
          <I18nField label="Description" value={form.description_i18n} onChange={(v) => setForm((p) => ({ ...p, description_i18n: v }))} rows={3} />
          <InputField
            label="File URL"
            value={form.file_url}
            onChange={(v) => setForm((p) => ({ ...p, file_url: v }))}
            required
            placeholder="https://..."
          />
          <SelectField
            label="File Type"
            options={fileTypeOptions}
            value={form.file_type}
            onChange={(v) => setForm((p) => ({ ...p, file_type: v }))}
          />
          <InputField
            label="Category"
            value={form.category}
            onChange={(v) => setForm((p) => ({ ...p, category: v }))}
            placeholder="e.g. Study Material, Worship"
          />
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
            <Button type="button" onClick={closeForm} className="bg-gray-100 text-gray-700 hover:bg-gray-200">
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
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
        <h1 className="text-xl md:text-2xl font-bold">Resources</h1>
        {canEdit && <Button onClick={openNew}>+ New Resource</Button>}
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
