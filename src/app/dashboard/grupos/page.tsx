"use client";

import { useState, useEffect, useCallback } from "react";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import FormField from "@/components/FormField";

interface Group {
  id: string;
  name: string;
  leader: string | null;
  day: string | null;
  time: string | null;
  location: string | null;
  description: string | null;
}

const emptyForm = { name: "", leader: "", day: "", time: "", location: "", description: "" };

export default function GruposPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    fetch("/api/proxy/admin/groups")
      .then((r) => r.json())
      .then((d) => setGroups(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = () => {
    setForm(emptyForm);
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (row: Group) => {
    setForm({
      name: row.name,
      leader: row.leader || "",
      day: row.day || "",
      time: row.time || "",
      location: row.location || "",
      description: row.description || "",
    });
    setEditing(row.id);
    setModalOpen(true);
  };

  const handleDelete = async (row: Group) => {
    if (!confirm("Delete this group?")) return;
    await fetch(`/api/proxy/admin/groups/${row.id}`, { method: "DELETE" });
    load();
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        leader: form.leader || null,
        day: form.day || null,
        time: form.time || null,
        location: form.location || null,
        description: form.description || null,
      };

      if (editing) {
        await fetch(`/api/proxy/admin/groups/${editing}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/proxy/admin/groups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      setModalOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const set = (key: string, val: string) => setForm((p) => ({ ...p, [key]: val }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Groups / Cells</h1>
          <p className="text-sm text-gray-500">{groups.length} groups</p>
        </div>
        <button
          onClick={openNew}
          className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90"
        >
          + New Group
        </button>
      </div>

      <DataTable
        columns={[
          { key: "name", label: "Name" },
          { key: "leader", label: "Leader" },
          { key: "day", label: "Day" },
          { key: "time", label: "Time" },
          { key: "location", label: "Location" },
        ]}
        data={groups}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Group" : "New Group"}>
        <div className="flex flex-col gap-4">
          <FormField label="Name *" value={form.name} onChange={(v) => set("name", v)} />
          <FormField label="Leader" value={form.leader} onChange={(v) => set("leader", v)} />
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Day" value={form.day} onChange={(v) => set("day", v)} placeholder="e.g. Wednesday" />
            <FormField label="Time" value={form.time} onChange={(v) => set("time", v)} placeholder="e.g. 19:30" />
          </div>
          <FormField label="Location" value={form.location} onChange={(v) => set("location", v)} />
          <FormField label="Description" value={form.description} onChange={(v) => set("description", v)} type="textarea" />
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[var(--color-primary)] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 self-end disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
