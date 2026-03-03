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
import BackButton from "@/components/ui/BackButton";

interface BlogPost {
  id: string;
  slug: string;
  title_i18n: { en: string; pt: string };
  content_i18n: { en: string; pt: string };
  excerpt_i18n: { en: string; pt: string };
  cover_image_url: string | null;
  author: string | null;
  tags: string[];
  published: boolean;
  published_at: string | null;
  category_id: string | null;
  featured: boolean;
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
  author: "",
  tags: "",
  published: false,
  published_at: "",
  category_id: "",
  featured: false,
  meta_title_i18n: { en: "", pt: "" },
  meta_description_i18n: { en: "", pt: "" },
  og_image_url: "",
};


export default function BlogPage() {
  const { data, loading, page, totalPages, setPage, refetch } = useApi<BlogPost>("/blog");
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
    const r = row as BlogPost;
    setForm({
      slug: r.slug || "",
      title_i18n: r.title_i18n || { en: "", pt: "" },
      content_i18n: r.content_i18n || { en: "", pt: "" },
      excerpt_i18n: r.excerpt_i18n || { en: "", pt: "" },
      cover_image_url: r.cover_image_url || "",
      author: r.author || "",
      tags: r.tags?.join(", ") || "",
      published: r.published,
      published_at: toDateInputValue(r.published_at),
      category_id: r.category_id || "",
      featured: r.featured || false,
      meta_title_i18n: r.meta_title_i18n || { en: "", pt: "" },
      meta_description_i18n: r.meta_description_i18n || { en: "", pt: "" },
      og_image_url: r.og_image_url || "",
    });
    setEditing(r.id);
    setShowForm(true);
  };

  const handleDelete = async (row: unknown) => {
    const r = row as BlogPost;
    await submit(`/blog/${r.id}`, { method: "DELETE" });
    refetch();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editing ? "PUT" : "POST";
    const url = editing ? `/blog/${editing}` : "/blog";
    const ogImage = form.og_image_url || form.cover_image_url || null;

    const res = await submit(url, {
      method,
      body: {
        slug: form.slug,
        title_i18n: form.title_i18n,
        content_i18n: form.content_i18n,
        excerpt_i18n: form.excerpt_i18n,
        cover_image_url: form.cover_image_url || null,
        author: form.author || null,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        published: form.published,
        published_at: form.published_at || null,
        category_id: form.category_id || null,
        featured: form.featured,
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
      key: "cover_image_url",
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
        return i?.pt || i?.en || "--";
      },
    },
    { key: "author", label: "Author", hideOnMobile: true },
    {
      key: "featured",
      label: "Featured",
      hideOnMobile: true,
      render: (v: unknown) =>
        v ? <Badge variant="warning">Featured</Badge> : <span className="text-gray-400 text-xs">—</span>,
    },
    {
      key: "published",
      label: "Status",
      render: (v: unknown) => (
        <Badge variant={v ? "success" : "muted"}>
          {v ? "Publicado" : "Rascunho"}
        </Badge>
      ),
    },
    {
      key: "published_at",
      label: "Date",
      hideOnMobile: true,
      render: (v: unknown) => v ? new Date(v as string).toLocaleDateString("en") : "--",
    },
  ];

  if (showForm) {
    return (
      <div>
        <BackButton onClick={closeForm} />
        <h1 className="text-xl md:text-2xl font-bold mb-6">{editing ? "Edit Post" : "New Post"}</h1>
        <form onSubmit={handleSave} className="bg-white rounded-2xl p-4 md:p-6 shadow-sm max-w-3xl space-y-4">
          <InputField label="Slug" value={form.slug} onChange={(v) => setForm((p) => ({ ...p, slug: v }))} required placeholder="e.g. my-first-post" hint="URL-friendly identifier" />
          <I18nField label="Title" value={form.title_i18n} onChange={(v) => setForm((p) => ({ ...p, title_i18n: v }))} required />
          <I18nField label="Excerpt" value={form.excerpt_i18n} onChange={(v) => setForm((p) => ({ ...p, excerpt_i18n: v }))} rows={2} />
          <I18nField label="Content" value={form.content_i18n} onChange={(v) => setForm((p) => ({ ...p, content_i18n: v }))} richText required />
          <ImageUpload label="Cover Image" value={form.cover_image_url} onChange={(v) => setForm((p) => ({ ...p, cover_image_url: v }))} />
          <InputField label="Author" value={form.author} onChange={(v) => setForm((p) => ({ ...p, author: v }))} placeholder="Author name" />
          <InputField label="Tags (comma separated)" value={form.tags} onChange={(v) => setForm((p) => ({ ...p, tags: v }))} placeholder="news, devotional" />
          <InputField label="Category ID" value={form.category_id} onChange={(v) => setForm((p) => ({ ...p, category_id: v }))} placeholder="Category UUID" />
          <InputField label="Publish Date" type="date" value={form.published_at} onChange={(v) => setForm((p) => ({ ...p, published_at: v }))} />
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm((p) => ({ ...p, featured: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
            />
            Featured
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

          {/* SEO Section */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wider">SEO</h3>
            <div className="space-y-4">
              <I18nField label="Meta Title" value={form.meta_title_i18n} onChange={(v) => setForm((p) => ({ ...p, meta_title_i18n: v }))} />
              <I18nField label="Meta Description" value={form.meta_description_i18n} onChange={(v) => setForm((p) => ({ ...p, meta_description_i18n: v }))} rows={2} />
              <ImageUpload label="OG Image" value={form.og_image_url} onChange={(v) => setForm((p) => ({ ...p, og_image_url: v }))} />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" onClick={closeForm} className="flex-1 !bg-gray-100 !text-gray-700 hover:!bg-gray-200">Cancelar</Button>
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
          <h1 className="text-xl md:text-2xl font-bold">Blog</h1>
          <p className="text-sm text-gray-500 mt-1">Manage blog posts</p>
        </div>
        {canEdit && <Button onClick={openNew}>+ Novo Post</Button>}
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
