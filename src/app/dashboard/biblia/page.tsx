"use client";

import { useState } from "react";
import useApi from "@/hooks/useApi";
import useSubmit from "@/hooks/useSubmit";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import { InputField, SelectField } from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { useAuth } from "@/contexts/auth-context";
import { hasMinRole } from "@/lib/permissions";

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
  const { data, loading, page, totalPages, setPage, refetch } = useApi<BibleVersion>("/bible-versions");
  const { submit, loading: saving } = useSubmit();
  const { church } = useAuth();
  const canEdit = hasMinRole(church?.role, "admin");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openNew = () => {
    setForm(emptyForm);
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (row: unknown) => {
    const r = row as BibleVersion;
    setForm({
      bible_id: r.bible_id.toString(),
      label: r.label,
      abbreviation: r.abbreviation,
      locale: r.locale,
      is_default: r.is_default,
    });
    setEditing(r.id);
    setModalOpen(true);
  };

  const handleDelete = async (row: unknown) => {
    const r = row as BibleVersion;
    await submit(`/bible-versions/${r.id}`, { method: "DELETE" });
    refetch();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editing ? "PUT" : "POST";
    const url = editing ? `/bible-versions/${editing}` : "/bible-versions";
    const res = await submit(url, {
      method,
      body: {
        bible_id: Number(form.bible_id),
        label: form.label,
        abbreviation: form.abbreviation,
        locale: form.locale,
        is_default: form.is_default,
      },
    });
    if (res) {
      setModalOpen(false);
      refetch();
    }
  };

  const columns = [
    { key: "bible_id", label: "YouVersion ID" },
    { key: "label", label: "Version" },
    { key: "abbreviation", label: "Abbr", hideOnMobile: true },
    { key: "locale", label: "Lang", hideOnMobile: true },
    {
      key: "is_default",
      label: "Default",
      render: (v: unknown) =>
        v ? <Badge variant="success">Yes</Badge> : <span className="text-xs text-gray-400">No</span>,
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Bible Versions</h1>
          <p className="text-sm text-gray-500 mt-1">Configure which Bible versions are available in the app</p>
        </div>
        {canEdit && <Button onClick={openNew}>+ Add Version</Button>}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-800">
        <strong>Common YouVersion Bible IDs:</strong>
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs">
          <span><strong>111</strong> -- NIV (English)</span>
          <span><strong>129</strong> -- NVI-PT (Portugues)</span>
          <span><strong>1</strong> -- KJV (English)</span>
          <span><strong>59</strong> -- ESV (English)</span>
          <span><strong>114</strong> -- ARC (Portugues)</span>
          <span><strong>1930</strong> -- NAA (Portugues)</span>
        </div>
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Bible Version" : "Add Bible Version"}>
        <form onSubmit={handleSave} className="space-y-4">
          <InputField label="YouVersion Bible ID" type="number" value={form.bible_id} onChange={(v) => setForm((p) => ({ ...p, bible_id: v }))} required placeholder="e.g. 111 for NIV" />
          <InputField label="Version Name" value={form.label} onChange={(v) => setForm((p) => ({ ...p, label: v }))} required placeholder="e.g. New International Version" />
          <InputField label="Abbreviation" value={form.abbreviation} onChange={(v) => setForm((p) => ({ ...p, abbreviation: v }))} required placeholder="e.g. NIV" />
          <SelectField
            label="Language"
            value={form.locale}
            onChange={(v) => setForm((p) => ({ ...p, locale: v }))}
            options={[
              { value: "pt", label: "Portugues" },
              { value: "en", label: "English" },
              { value: "es", label: "Espanol" },
            ]}
          />
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_default}
              onChange={(e) => setForm((p) => ({ ...p, is_default: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
            />
            <span className="text-sm text-gray-700">Default version for this language</span>
          </label>
          <Button type="submit" loading={saving} className="w-full">
            {editing ? "Save" : "Add"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
