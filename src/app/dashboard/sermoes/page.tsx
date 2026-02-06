"use client";

import { useState, useEffect, useCallback } from "react";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import FormField from "@/components/FormField";
import FileUpload, { type UploadedFile } from "@/components/FileUpload";

interface Sermon {
  id: string;
  title: string;
  youtube_url: string;
  pdf_url: string;
  tags: string[];
  sermon_date: string;
  materials: UploadedFile[];
}

const emptyForm = { title: "", youtube_url: "", tags: "", sermon_date: "", materials: [] as UploadedFile[] };

export default function SermoesPage() {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    fetch("/api/proxy/admin/sermons")
      .then((r) => r.json())
      .then((d) => setSermons(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = () => {
    setForm(emptyForm);
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (row: Sermon) => {
    setForm({
      title: row.title,
      youtube_url: row.youtube_url || "",
      tags: row.tags?.join(", ") || "",
      sermon_date: row.sermon_date || "",
      materials: Array.isArray(row.materials) ? row.materials : [],
    });
    setEditing(row.id);
    setModalOpen(true);
  };

  const handleDelete = async (row: Sermon) => {
    if (!confirm("Delete this sermon?")) return;
    await fetch(`/api/proxy/admin/sermons/${row.id}`, { method: "DELETE" });
    load();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const method = editing ? "PUT" : "POST";
      const url = editing ? `/api/proxy/admin/sermons/${editing}` : "/api/proxy/admin/sermons";

      // Extract first PDF from materials as pdf_url for backward compatibility
      const pdfMaterial = form.materials.find((m) => m.type === "PDF");

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          youtube_url: form.youtube_url || null,
          pdf_url: pdfMaterial?.url || null,
          tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
          sermon_date: form.sermon_date,
          materials: form.materials,
        }),
      });
      setModalOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const set = (key: string) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const columns = [
    { key: "title", label: "Title" },
    {
      key: "sermon_date",
      label: "Date",
      render: (v: string) => v ? new Date(v).toLocaleDateString("en") : "",
    },
    {
      key: "tags",
      label: "Tags",
      render: (v: string[]) => v?.join(", ") || "",
    },
    {
      key: "materials",
      label: "Files",
      render: (v: UploadedFile[]) => {
        if (!Array.isArray(v) || v.length === 0) return "—";
        return (
          <span className="text-xs text-gray-500">
            {v.length} file{v.length > 1 ? "s" : ""}
          </span>
        );
      },
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Sermons</h1>
        <button onClick={openNew} className="px-4 py-2 bg-[var(--color-primary)] text-white text-sm font-semibold rounded-xl hover:opacity-90">
          + New Sermon
        </button>
      </div>

      <DataTable columns={columns} data={sermons} onEdit={openEdit} onDelete={handleDelete} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Sermon" : "New Sermon"}>
        <form onSubmit={handleSave} className="space-y-4">
          <FormField label="Title" name="title" value={form.title} onChange={set("title")} required />
          <FormField label="YouTube URL" name="youtube_url" value={form.youtube_url} onChange={set("youtube_url")} placeholder="https://youtube.com/watch?v=..." />
          <FormField label="Tags (comma separated)" name="tags" value={form.tags} onChange={set("tags")} placeholder="faith, grace, love" />
          <FormField label="Date" name="sermon_date" type="date" value={form.sermon_date} onChange={set("sermon_date")} required />

          <FileUpload
            label="Materials (PDF, Documents, Images)"
            value={form.materials}
            onChange={(files) => setForm((prev) => ({ ...prev, materials: files }))}
          />

          <button type="submit" disabled={saving} className="w-full py-2.5 bg-[var(--color-primary)] text-white text-sm font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">
            {saving ? "Saving..." : editing ? "Save" : "Create"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
