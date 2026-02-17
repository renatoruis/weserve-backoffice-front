"use client";

import { useState } from "react";
import useApi from "@/hooks/useApi";
import useSubmit from "@/hooks/useSubmit";
import DataTable from "@/components/DataTable";
import I18nField from "@/components/I18nField";
import { InputField, SelectField } from "@/components/ui/Input";
import ImageUpload from "@/components/ImageUpload";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { useAuth } from "@/contexts/auth-context";
import { hasMinRole } from "@/lib/permissions";
import { toDateInputValue } from "@/lib/date";

interface CmsPage {
  id: string;
  slug: string;
  title_i18n: { en: string; pt: string };
  content_i18n: { en: string; pt: string };
  excerpt_i18n: { en: string; pt: string };
  cover_image_url: string | null;
  published: boolean;
  sort_order: number;
  template: string;
  parent_id: string | null;
  cta_label_i18n: { en: string; pt: string };
  cta_url: string | null;
  cta_style: string;
  published_at: string | null;
  meta_title_i18n: { en: string; pt: string };
  meta_description_i18n: { en: string; pt: string };
  og_image_url: string | null;
  created_at: string;
}

const emptyForm = {
  slug: "",
  title_i18n: { en: "", pt: "" },
  content_i18n: { en: "", pt: "" },
  excerpt_i18n: { en: "", pt: "" },
  cover_image_url: "",
  published: false,
  sort_order: "0",
  template: "default",
  parent_id: "",
  cta_label_i18n: { en: "", pt: "" },
  cta_url: "",
  cta_style: "primary",
  published_at: "",
  meta_title_i18n: { en: "", pt: "" },
  meta_description_i18n: { en: "", pt: "" },
  og_image_url: "",
};

const templateOptions = [
  { value: "default", label: "Default" },
  { value: "full-width", label: "Full Width" },
  { value: "landing", label: "Landing" },
  { value: "sidebar", label: "Sidebar" },
];

const ctaStyleOptions = [
  { value: "primary", label: "Primary" },
  { value: "secondary", label: "Secondary" },
  { value: "outline", label: "Outline" },
];

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-4">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><polyline points="12 19 5 12 12 5" /></svg>
      Back
    </button>
  );
}

export default function PagesPage() {
  const { data, loading, page, totalPages, setPage, refetch } = useApi<CmsPage>("/pages");
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
    const r = row as CmsPage;
    setForm({
      slug: r.slug || "",
      title_i18n: r.title_i18n || { en: "", pt: "" },
      content_i18n: r.content_i18n || { en: "", pt: "" },
      excerpt_i18n: r.excerpt_i18n || { en: "", pt: "" },
      cover_image_url: r.cover_image_url || "",
      published: r.published,
      sort_order: String(r.sort_order ?? 0),
      template: r.template || "default",
      parent_id: r.parent_id || "",
      cta_label_i18n: r.cta_label_i18n || { en: "", pt: "" },
      cta_url: r.cta_url || "",
      cta_style: r.cta_style || "primary",
      published_at: toDateInputValue(r.published_at),
      meta_title_i18n: r.meta_title_i18n || { en: "", pt: "" },
      meta_description_i18n: r.meta_description_i18n || { en: "", pt: "" },
      og_image_url: r.og_image_url || "",
    });
    setEditing(r.id);
    setShowForm(true);
  };

  const handleDelete = async (row: unknown) => {
    const r = row as CmsPage;
    await submit(`/pages/${r.id}`, { method: "DELETE" });
    refetch();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editing ? "PUT" : "POST";
    const url = editing ? `/pages/${editing}` : "/pages";
    const ogImage = form.og_image_url || form.cover_image_url || null;

    const res = await submit(url, {
      method,
      body: {
        slug: form.slug,
        title_i18n: form.title_i18n,
        content_i18n: form.content_i18n,
        excerpt_i18n: form.excerpt_i18n,
        cover_image_url: form.cover_image_url || null,
        published: form.published,
        sort_order: Number(form.sort_order) || 0,
        template: form.template,
        parent_id: form.parent_id || null,
        cta_label_i18n: form.cta_label_i18n,
        cta_url: form.cta_url || null,
        cta_style: form.cta_style,
        published_at: form.published_at || null,
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

  const columns = [
    {
      key: "title_i18n",
      label: "Title",
      render: (v: unknown) => {
        const i = v as { pt: string; en: string } | null;
        return i?.pt || i?.en || "--";
      },
    },
    { key: "slug", label: "Slug", hideOnMobile: true },
    {
      key: "template",
      label: "Template",
      hideOnMobile: true,
      render: (v: unknown) => {
        const t = v as string;
        return t ? t.charAt(0).toUpperCase() + t.slice(1) : "Default";
      },
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
    { key: "sort_order", label: "Order", hideOnMobile: true },
  ];

  if (showForm) {
    return (
      <div>
        <BackButton onClick={closeForm} />
        <h1 className="text-xl md:text-2xl font-bold mb-6">{editing ? "Edit Page" : "New Page"}</h1>
        <form onSubmit={handleSave} className="bg-white rounded-2xl p-4 md:p-6 shadow-sm max-w-3xl space-y-4">
          {/* ── Basic ── */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wider">Basic</h3>
            <div className="space-y-4">
              <InputField label="Slug" value={form.slug} onChange={(v) => setForm((p) => ({ ...p, slug: v }))} required placeholder="e.g. about-us" hint="URL-friendly identifier" />
              <I18nField label="Title" value={form.title_i18n} onChange={(v) => setForm((p) => ({ ...p, title_i18n: v }))} required />
              <I18nField label="Excerpt" value={form.excerpt_i18n} onChange={(v) => setForm((p) => ({ ...p, excerpt_i18n: v }))} rows={2} />
              <I18nField label="Content" value={form.content_i18n} onChange={(v) => setForm((p) => ({ ...p, content_i18n: v }))} rows={6} required />
              <ImageUpload label="Cover Image" value={form.cover_image_url} onChange={(v) => setForm((p) => ({ ...p, cover_image_url: v }))} />
              <SelectField
                label="Template"
                options={templateOptions}
                value={form.template}
                onChange={(v) => setForm((p) => ({ ...p, template: v }))}
              />
              <InputField label="Parent Page ID" value={form.parent_id} onChange={(v) => setForm((p) => ({ ...p, parent_id: v }))} placeholder="Parent page UUID" />
              <InputField label="Sort Order" type="number" value={form.sort_order} onChange={(v) => setForm((p) => ({ ...p, sort_order: v }))} />
              <InputField label="Published Date" type="date" value={form.published_at} onChange={(v) => setForm((p) => ({ ...p, published_at: v }))} />
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => setForm((p) => ({ ...p, published: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                Published
              </label>
            </div>
          </div>

          {/* ── CTA ── */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wider">Call to Action</h3>
            <div className="space-y-4">
              <I18nField label="CTA Label" value={form.cta_label_i18n} onChange={(v) => setForm((p) => ({ ...p, cta_label_i18n: v }))} />
              <InputField label="CTA URL" value={form.cta_url} onChange={(v) => setForm((p) => ({ ...p, cta_url: v }))} placeholder="https://..." />
              <SelectField
                label="CTA Style"
                options={ctaStyleOptions}
                value={form.cta_style}
                onChange={(v) => setForm((p) => ({ ...p, cta_style: v }))}
              />
            </div>
          </div>

          {/* ── SEO ── */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wider">SEO</h3>
            <div className="space-y-4">
              <I18nField label="Meta Title" value={form.meta_title_i18n} onChange={(v) => setForm((p) => ({ ...p, meta_title_i18n: v }))} />
              <I18nField label="Meta Description" value={form.meta_description_i18n} onChange={(v) => setForm((p) => ({ ...p, meta_description_i18n: v }))} rows={2} />
              <ImageUpload label="OG Image" value={form.og_image_url} onChange={(v) => setForm((p) => ({ ...p, og_image_url: v }))} />
            </div>
          </div>

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
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Pages</h1>
          <p className="text-sm text-gray-500 mt-1">Custom CMS pages for the app</p>
        </div>
        {canEdit && <Button onClick={openNew}>+ New Page</Button>}
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
