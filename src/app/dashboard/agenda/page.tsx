"use client";

import { useState, useEffect, useCallback } from "react";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import FormField from "@/components/FormField";
import ImageUpload from "@/components/ImageUpload";
import GooglePlacesInput from "@/components/GooglePlacesInput";

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  image_url: string;
}

const emptyForm = { title: "", description: "", event_date: "", event_time: "", location: "", image_url: "" };

export default function AgendaPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    fetch("/api/proxy/admin/events")
      .then((r) => r.json())
      .then((d) => setEvents(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = () => {
    setForm(emptyForm);
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (row: Event) => {
    const dt = row.event_date ? new Date(row.event_date) : null;
    setForm({
      title: row.title,
      description: row.description || "",
      event_date: dt ? dt.toISOString().slice(0, 10) : "",
      event_time: dt ? dt.toTimeString().slice(0, 5) : "",
      location: row.location || "",
      image_url: row.image_url || "",
    });
    setEditing(row.id);
    setModalOpen(true);
  };

  const handleDelete = async (row: Event) => {
    if (!confirm("Delete this event?")) return;
    await fetch(`/api/proxy/admin/events/${row.id}`, { method: "DELETE" });
    load();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const method = editing ? "PUT" : "POST";
      const url = editing ? `/api/proxy/admin/events/${editing}` : "/api/proxy/admin/events";

      // Combine date + time
      const event_date = form.event_time
        ? `${form.event_date}T${form.event_time}:00`
        : `${form.event_date}T00:00:00`;

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          event_date,
          location: form.location,
          image_url: form.image_url || null,
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
    {
      key: "image_url",
      label: "",
      render: (v: string) =>
        v ? (
          <img src={v} alt="" className="w-12 h-12 rounded-lg object-cover" />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-gray-100" />
        ),
    },
    { key: "title", label: "Title" },
    {
      key: "event_date",
      label: "Date",
      render: (v: string) =>
        v
          ? new Date(v).toLocaleDateString("en", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "",
    },
    { key: "location", label: "Location" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Events</h1>
        <button onClick={openNew} className="px-4 py-2 bg-[var(--color-primary)] text-white text-sm font-semibold rounded-xl hover:opacity-90">
          + New Event
        </button>
      </div>

      <DataTable columns={columns} data={events} onEdit={openEdit} onDelete={handleDelete} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Event" : "New Event"}>
        <form onSubmit={handleSave} className="space-y-4">
          <FormField label="Title" name="title" value={form.title} onChange={set("title")} required />
          <FormField label="Description" name="description" value={form.description} onChange={set("description")} rows={3} />
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Date" name="event_date" type="date" value={form.event_date} onChange={set("event_date")} required />
            <FormField label="Time" name="event_time" type="time" value={form.event_time} onChange={set("event_time")} />
          </div>
          <GooglePlacesInput
            value={form.location}
            onChange={set("location")}
            onPlaceSelect={(place) => setForm((prev) => ({ ...prev, location: place.address }))}
          />
          <ImageUpload label="Event Image" value={form.image_url} onChange={set("image_url")} />
          <button type="submit" disabled={saving} className="w-full py-2.5 bg-[var(--color-primary)] text-white text-sm font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">
            {saving ? "Saving..." : editing ? "Save" : "Create"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
