"use client";

import { useState, useEffect, useCallback } from "react";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import FormField from "@/components/FormField";

interface BibleVersion {
  id: string;
  bible_id: number;
  label: string;
  abbreviation: string;
  locale: string;
  is_default: boolean;
}

const emptyForm = { bible_id: "", label: "", abbreviation: "", locale: "pt", is_default: false };

export default function BibliaPage() {
  const [versions, setVersions] = useState<BibleVersion[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    fetch("/api/proxy/admin/bible-versions")
      .then((r) => r.json())
      .then((d) => setVersions(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = () => {
    setForm(emptyForm);
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (row: BibleVersion) => {
    setForm({
      bible_id: row.bible_id.toString(),
      label: row.label,
      abbreviation: row.abbreviation,
      locale: row.locale,
      is_default: row.is_default,
    });
    setEditing(row.id);
    setModalOpen(true);
  };

  const handleDelete = async (row: BibleVersion) => {
    if (!confirm("Delete this bible version?")) return;
    await fetch(`/api/proxy/admin/bible-versions/${row.id}`, { method: "DELETE" });
    load();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const method = editing ? "PUT" : "POST";
      const url = editing ? `/api/proxy/admin/bible-versions/${editing}` : "/api/proxy/admin/bible-versions";

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bible_id: Number(form.bible_id),
          label: form.label,
          abbreviation: form.abbreviation,
          locale: form.locale,
          is_default: form.is_default,
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
    { key: "bible_id", label: "YouVersion ID" },
    { key: "label", label: "Version Name" },
    { key: "abbreviation", label: "Abbreviation" },
    { key: "locale", label: "Language" },
    {
      key: "is_default",
      label: "Default",
      render: (v: boolean) =>
        v ? (
          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Yes</span>
        ) : (
          <span className="text-xs text-gray-400">No</span>
        ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Bible Versions</h1>
          <p className="text-sm text-gray-500 mt-1">Configure which Bible versions are available in the app</p>
        </div>
        <button onClick={openNew} className="px-4 py-2 bg-[var(--color-primary)] text-white text-sm font-semibold rounded-xl hover:opacity-90">
          + Add Version
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-800">
        <strong>Common YouVersion Bible IDs:</strong>
        <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
          <span><strong>111</strong> — NIV (English)</span>
          <span><strong>129</strong> — NVI-PT (Português)</span>
          <span><strong>1</strong> — KJV (English)</span>
          <span><strong>59</strong> — ESV (English)</span>
          <span><strong>114</strong> — ARC (Português)</span>
          <span><strong>1930</strong> — NAA (Português)</span>
          <span><strong>211</strong> — NVI (Español)</span>
          <span><strong>128</strong> — NVT (Português)</span>
        </div>
      </div>

      <DataTable columns={columns} data={versions} onEdit={openEdit} onDelete={handleDelete} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Bible Version" : "Add Bible Version"}>
        <form onSubmit={handleSave} className="space-y-4">
          <FormField
            label="YouVersion Bible ID"
            name="bible_id"
            type="number"
            value={form.bible_id}
            onChange={set("bible_id")}
            required
            placeholder="e.g. 111 for NIV"
          />
          <FormField label="Version Name" name="label" value={form.label} onChange={set("label")} required placeholder="e.g. New International Version" />
          <FormField label="Abbreviation" name="abbreviation" value={form.abbreviation} onChange={set("abbreviation")} required placeholder="e.g. NIV" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
            <select
              value={form.locale}
              onChange={(e) => setForm((prev) => ({ ...prev, locale: e.target.value }))}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-20"
            >
              <option value="pt">Português</option>
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_default}
              onChange={(e) => setForm((prev) => ({ ...prev, is_default: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
            />
            <span className="text-sm text-gray-700">Default version for this language</span>
          </label>
          <button type="submit" disabled={saving} className="w-full py-2.5 bg-[var(--color-primary)] text-white text-sm font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">
            {saving ? "Saving..." : editing ? "Save" : "Add"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
