"use client";

import { useState, useEffect, useCallback } from "react";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import FormField from "@/components/FormField";

interface Notice {
  id: string;
  title: string;
  body: string;
  published: boolean;
  created_at: string;
}

const emptyForm = { title: "", body: "", published: true };

export default function AvisosPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    fetch("/api/proxy/admin/notices")
      .then((r) => r.json())
      .then((d) => setNotices(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = () => {
    setForm(emptyForm);
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (row: Notice) => {
    setForm({
      title: row.title,
      body: row.body || "",
      published: row.published,
    });
    setEditing(row.id);
    setModalOpen(true);
  };

  const handleDelete = async (row: Notice) => {
    if (!confirm("Delete this notice?")) return;
    await fetch(`/api/proxy/admin/notices/${row.id}`, { method: "DELETE" });
    load();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const method = editing ? "PUT" : "POST";
      const url = editing ? `/api/proxy/admin/notices/${editing}` : "/api/proxy/admin/notices";
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setModalOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const set = (key: string) => (value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const columns = [
    { key: "title", label: "Title" },
    {
      key: "published",
      label: "Status",
      render: (v: boolean) => (
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${v ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
          {v ? "Published" : "Draft"}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Date",
      render: (v: string) => v ? new Date(v).toLocaleDateString("en") : "",
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notices</h1>
        <button onClick={openNew} className="px-4 py-2 bg-[var(--color-primary)] text-white text-sm font-semibold rounded-xl hover:opacity-90">
          + New Notice
        </button>
      </div>

      <DataTable columns={columns} data={notices} onEdit={openEdit} onDelete={handleDelete} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Notice" : "New Notice"}>
        <form onSubmit={handleSave} className="space-y-4">
          <FormField label="Title" name="title" value={form.title} onChange={(v) => set("title")(v)} required />
          <FormField label="Content" name="body" value={form.body} onChange={(v) => set("body")(v)} rows={4} />
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => set("published")(e.target.checked)}
              className="accent-[var(--color-primary)]"
            />
            Published
          </label>
          <button type="submit" disabled={saving} className="w-full py-2.5 bg-[var(--color-primary)] text-white text-sm font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">
            {saving ? "Saving..." : editing ? "Save" : "Create"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
