"use client";

import { useState } from "react";
import useApi from "@/hooks/useApi";
import useSubmit from "@/hooks/useSubmit";
import DataTable from "@/components/DataTable";
import I18nField from "@/components/I18nField";
import { InputField } from "@/components/ui/Input";
import FileUpload, { type UploadedFile } from "@/components/FileUpload";
import ImageUpload from "@/components/ImageUpload";
import Button from "@/components/ui/Button";
import { useAuth } from "@/contexts/auth-context";
import { hasMinRole } from "@/lib/permissions";
import { toDateInputValue } from "@/lib/date";

interface Sermon {
  id: string;
  title?: string;
  title_i18n: { en: string; pt: string };
  description_i18n?: { en: string; pt: string };
  youtube_url?: string;
  pdf_url?: string;
  tags: string[];
  sermon_date: string;
  materials: UploadedFile[] | { type?: string; url?: string }[];
  meta_title_i18n?: { en: string; pt: string };
  meta_description_i18n?: { en: string; pt: string };
  og_image_url?: string;
}

const emptyI18n = { en: "", pt: "" };

const emptyForm = {
  title_i18n: { ...emptyI18n },
  description_i18n: { ...emptyI18n },
  youtube_url: "",
  pdf_url: "",
  sermon_date: "",
  tags: "",
  materials: [] as UploadedFile[],
  meta_title_i18n: { ...emptyI18n },
  meta_description_i18n: { ...emptyI18n },
  og_image_url: "",
};

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

/* ── Section divider ── */
function SectionDivider({ title }: { title: string }) {
  return (
    <div className="relative pt-4 pb-1">
      <div className="absolute inset-0 flex items-center pt-4" aria-hidden="true">
        <div className="w-full border-t border-gray-200" />
      </div>
      <div className="relative flex justify-start">
        <span className="bg-white pr-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          {title}
        </span>
      </div>
    </div>
  );
}

export default function SermoesPage() {
  const { data, loading, page, totalPages, setPage, refetch } = useApi<Sermon>("/sermons");
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
    setForm({ ...emptyForm, title_i18n: { ...emptyI18n }, description_i18n: { ...emptyI18n }, meta_title_i18n: { ...emptyI18n }, meta_description_i18n: { ...emptyI18n }, materials: [] });
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (row: unknown) => {
    const r = row as Sermon;
    const materials = Array.isArray(r.materials) ? r.materials : [];
    const materialsAsUploaded: UploadedFile[] = materials.map((m) => {
      if (typeof m === "object" && m !== null && "url" in m) {
        const obj = m as { url: string; type?: string; name?: string };
        return {
          name: obj.name || obj.url.split("/").pop() || "file",
          url: obj.url,
          type: obj.type || "PDF",
        };
      }
      return m as UploadedFile;
    });
    setForm({
      title_i18n: r.title_i18n || { en: r.title || "", pt: r.title || "" },
      description_i18n: r.description_i18n || { ...emptyI18n },
      youtube_url: r.youtube_url || "",
      pdf_url: r.pdf_url || "",
      sermon_date: toDateInputValue(r.sermon_date),
      tags: r.tags?.join(", ") || "",
      materials: materialsAsUploaded,
      meta_title_i18n: r.meta_title_i18n || { ...emptyI18n },
      meta_description_i18n: r.meta_description_i18n || { ...emptyI18n },
      og_image_url: r.og_image_url || "",
    });
    setEditing(r.id);
    setShowForm(true);
  };

  const handleDelete = async (row: unknown) => {
    const r = row as Sermon;
    await submit(`/sermons/${r.id}`, { method: "DELETE" });
    refetch();
  };

  const getYouTubeThumbnail = (url: string): string | null => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?#]+)/);
    return match ? `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg` : null;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editing ? "PUT" : "POST";
    const url = editing ? `/sermons/${editing}` : "/sermons";
    const pdfMaterial = form.materials.find((m) => m.type === "PDF");

    const ogImage = form.og_image_url || getYouTubeThumbnail(form.youtube_url) || null;

    const res = await submit(url, {
      method,
      body: {
        title_i18n: form.title_i18n,
        description_i18n: form.description_i18n,
        youtube_url: form.youtube_url || null,
        pdf_url: pdfMaterial?.url || form.pdf_url || null,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        sermon_date: form.sermon_date,
        materials: form.materials.map((m) => ({ type: m.type || "PDF", url: m.url })),
        meta_title_i18n: form.meta_title_i18n,
        meta_description_i18n: form.meta_description_i18n,
        og_image_url: ogImage,
      },
    });
    if (res) {
      setShowForm(false);
      refetch();
    }
  };

  /* ── helper ── */
  const set = <K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) =>
    setForm((p) => ({ ...p, [key]: value }));

  const columns = [
    {
      key: "title",
      label: "Title",
      render: (_v: unknown, row: unknown) => {
        const r = row as Sermon;
        return r.title_i18n?.pt || r.title || "—";
      },
    },
    {
      key: "sermon_date",
      label: "Date",
      render: (v: unknown) => v ? new Date(v as string).toLocaleDateString("en") : "",
    },
    {
      key: "tags",
      label: "Tags",
      hideOnMobile: true,
      render: (v: unknown) => (v as string[])?.join(", ") || "",
    },
    {
      key: "materials",
      label: "Files",
      hideOnMobile: true,
      render: (v: unknown) => {
        const arr = v as { url?: string }[];
        if (!Array.isArray(arr) || arr.length === 0) return "—";
        return <span className="text-xs text-gray-500">{arr.length} file{arr.length > 1 ? "s" : ""}</span>;
      },
    },
  ];

  /* ── Render: Full-page form ── */

  if (showForm) {
    return (
      <div>
        <BackButton onClick={closeForm} />
        <h1 className="text-xl md:text-2xl font-bold mb-6">{editing ? "Edit Sermon" : "New Sermon"}</h1>
        <form onSubmit={handleSave} className="bg-white rounded-2xl p-4 md:p-6 shadow-sm max-w-3xl space-y-4">

          {/* ─── 1. Basic Info ─── */}
          <SectionDivider title="Basic Info" />

          <I18nField
            label="Title"
            value={form.title_i18n}
            onChange={(v) => set("title_i18n", v)}
            required
          />

          <I18nField
            label="Description"
            value={form.description_i18n}
            onChange={(v) => set("description_i18n", v)}
            rows={3}
          />

          <InputField
            label="Date"
            type="date"
            value={form.sermon_date}
            onChange={(v) => set("sermon_date", v)}
            required
          />

          <InputField
            label="YouTube URL"
            value={form.youtube_url}
            onChange={(v) => set("youtube_url", v)}
            placeholder="https://youtube.com/watch?v=..."
          />

          <InputField
            label="PDF URL (or add via Materials below)"
            value={form.pdf_url}
            onChange={(v) => set("pdf_url", v)}
            placeholder="https://..."
          />

          {/* ─── 2. Tags & Materials ─── */}
          <SectionDivider title="Tags & Materials" />

          <InputField
            label="Tags (comma separated)"
            value={form.tags}
            onChange={(v) => set("tags", v)}
            placeholder="faith, grace, love"
          />

          <FileUpload
            label="Materials (PDF, Documents, Images)"
            value={form.materials}
            onChange={(files) => set("materials", files)}
          />

          {/* ─── 4. SEO ─── */}
          <SectionDivider title="SEO" />

          <I18nField
            label="Meta Title"
            value={form.meta_title_i18n}
            onChange={(v) => set("meta_title_i18n", v)}
          />

          <I18nField
            label="Meta Description"
            value={form.meta_description_i18n}
            onChange={(v) => set("meta_description_i18n", v)}
            rows={2}
          />

          <ImageUpload
            label="OG Image"
            value={form.og_image_url}
            onChange={(v) => set("og_image_url", v)}
          />

          {/* ─── Actions ─── */}
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
        <h1 className="text-xl md:text-2xl font-bold">Sermons</h1>
        {canEdit && <Button onClick={openNew}>+ New Sermon</Button>}
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
