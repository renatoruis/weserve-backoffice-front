"use client";

import { useState } from "react";
import useApi from "@/hooks/useApi";
import useSubmit from "@/hooks/useSubmit";
import DataTable from "@/components/DataTable";
import I18nField from "@/components/I18nField";
import { InputField } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAuth } from "@/contexts/auth-context";
import { hasMinRole } from "@/lib/permissions";
import BackButton from "@/components/ui/BackButton";


interface BlogCategory {
  id: string;
  name_i18n: { en: string; pt: string };
  slug: string;
  sort_order: number;
}

const emptyForm = {
  name_i18n: { en: "", pt: "" },
  slug: "",
  sort_order: "0",
};

export default function BlogCategoriesPage() {
  const { data, loading, page, totalPages, setPage, refetch } = useApi<BlogCategory>("/blog-categories");
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
    const r = row as BlogCategory;
    setForm({
      name_i18n: r.name_i18n || { en: "", pt: "" },
      slug: r.slug || "",
      sort_order: String(r.sort_order ?? 0),
    });
    setEditing(r.id);
    setShowForm(true);
  };

  const handleDelete = async (row: unknown) => {
    const r = row as BlogCategory;
    await submit(`/blog-categories/${r.id}`, { method: "DELETE" });
    refetch();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editing ? "PUT" : "POST";
    const url = editing ? `/blog-categories/${editing}` : "/blog-categories";
    const res = await submit(url, {
      method,
      body: {
        name_i18n: form.name_i18n,
        slug: form.slug,
        sort_order: Number(form.sort_order) || 0,
      },
    });
    if (res) {
      setShowForm(false);
      refetch();
    }
  };

  const columns = [
    {
      key: "name",
      label: "Name",
      render: (_v: unknown, row: unknown) => {
        const r = row as BlogCategory;
        return r.name_i18n?.pt || r.name_i18n?.en || "—";
      },
    },
    {
      key: "slug",
      label: "Slug",
      hideOnMobile: true,
      render: (_v: unknown, row: unknown) => {
        const r = row as BlogCategory;
        return r.slug || "—";
      },
    },
    {
      key: "sort_order",
      label: "Order",
      hideOnMobile: true,
      render: (_v: unknown, row: unknown) => {
        const r = row as BlogCategory;
        return r.sort_order ?? "—";
      },
    },
  ];

  if (showForm) {
    return (
      <div>
        <BackButton onClick={closeForm} />
        <h1 className="text-xl md:text-2xl font-bold mb-6">
          {editing ? "Edit Category" : "New Category"}
        </h1>
        <form onSubmit={handleSave} className="bg-white rounded-2xl p-4 md:p-6 shadow-sm max-w-3xl space-y-4">
          <I18nField
            label="Name"
            value={form.name_i18n}
            onChange={(v) => setForm((p) => ({ ...p, name_i18n: v }))}
            required
          />
          <InputField
            label="Slug"
            value={form.slug}
            onChange={(v) => setForm((p) => ({ ...p, slug: v }))}
            required
            placeholder="e.g. devotionals"
          />
          <InputField
            label="Sort Order"
            type="number"
            value={form.sort_order}
            onChange={(v) => setForm((p) => ({ ...p, sort_order: v }))}
          />
          <div className="flex gap-3 pt-2">
            <Button type="button" onClick={closeForm} className="bg-gray-100 text-gray-700 hover:bg-gray-200">Cancelar</Button>
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
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Blog Categories</h1>
          <p className="text-sm text-gray-500 mt-1">Manage blog categories</p>
        </div>
        {canEdit && <Button onClick={openNew}>+ Novo Category</Button>}
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
