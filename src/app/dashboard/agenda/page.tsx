"use client";

import { useState } from "react";
import useApi from "@/hooks/useApi";
import useSubmit from "@/hooks/useSubmit";
import DataTable from "@/components/DataTable";
import I18nField from "@/components/I18nField";
import { InputField } from "@/components/ui/Input";
import ImageUpload from "@/components/ImageUpload";
import GooglePlacesInput from "@/components/GooglePlacesInput";
import Button from "@/components/ui/Button";
import { useAuth } from "@/contexts/auth-context";
import { hasMinRole } from "@/lib/permissions";
import { toDateInputValue } from "@/lib/date";

/* ── Types ── */

interface I18n {
  en: string;
  pt: string;
}

interface Event {
  id: string;
  title: string;
  title_i18n: I18n;
  description: string;
  description_i18n: I18n;
  event_date: string;
  event_end_date: string;
  location: string;
  image_url: string;
  category: string;
  tags: string[];
  recurrence_rule: string;
  recurrence_end: string;
  meta_title_i18n: I18n;
  meta_description_i18n: I18n;
  og_image_url: string;
}

/* ── Empty form ── */

const emptyI18n: I18n = { en: "", pt: "" };

const emptyForm = {
  title_i18n: { ...emptyI18n },
  description_i18n: { ...emptyI18n },
  event_date: "",
  event_time: "",
  event_end_date: "",
  location: "",
  image_url: "",
  category: "",
  tags: "",
  recurrence_rule: "",
  recurrence_end: "",
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

/* ── Collapsible section ── */

function Section({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details open={defaultOpen} className="group border border-gray-100 rounded-xl overflow-hidden">
      <summary className="flex items-center justify-between cursor-pointer px-4 py-3 bg-gray-50/60 hover:bg-gray-50 transition-colors select-none">
        <span className="text-sm font-semibold text-gray-700">{title}</span>
        <svg
          className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-180"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="p-4 space-y-4">{children}</div>
    </details>
  );
}

/* ── Page ── */

export default function AgendaPage() {
  const { data, loading, page, totalPages, setPage, refetch } = useApi<Event>("/events");
  const { submit, loading: saving } = useSubmit();
  const { church } = useAuth();
  const canEdit = hasMinRole(church?.role, "editor");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  /* ── Handlers ── */

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  const openNew = () => {
    setForm({ ...emptyForm, title_i18n: { ...emptyI18n }, description_i18n: { ...emptyI18n }, meta_title_i18n: { ...emptyI18n }, meta_description_i18n: { ...emptyI18n } });
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (row: unknown) => {
    const r = row as Event;
    const dt = r.event_date ? new Date(r.event_date) : null;
    setForm({
      title_i18n: r.title_i18n || { en: r.title || "", pt: r.title || "" },
      description_i18n: r.description_i18n || { en: r.description || "", pt: r.description || "" },
      event_date: toDateInputValue(r.event_date),
      event_time: dt ? dt.toTimeString().slice(0, 5) : "",
      event_end_date: toDateInputValue(r.event_end_date),
      location: r.location || "",
      image_url: r.image_url || "",
      category: r.category || "",
      tags: Array.isArray(r.tags) ? r.tags.join(", ") : "",
      recurrence_rule: r.recurrence_rule || "",
      recurrence_end: toDateInputValue(r.recurrence_end),
      meta_title_i18n: r.meta_title_i18n || { ...emptyI18n },
      meta_description_i18n: r.meta_description_i18n || { ...emptyI18n },
      og_image_url: r.og_image_url || "",
    });
    setEditing(r.id);
    setShowForm(true);
  };

  const handleDelete = async (row: unknown) => {
    const r = row as Event;
    await submit(`/events/${r.id}`, { method: "DELETE" });
    refetch();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editing ? "PUT" : "POST";
    const url = editing ? `/events/${editing}` : "/events";

    const event_date = form.event_time
      ? `${form.event_date}T${form.event_time}:00`
      : `${form.event_date}T00:00:00`;

    const tagsArray = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const ogImage = form.og_image_url || form.image_url || null;

    const res = await submit(url, {
      method,
      body: {
        title_i18n: form.title_i18n,
        description_i18n: form.description_i18n,
        event_date,
        event_end_date: form.event_end_date || null,
        location: form.location,
        image_url: form.image_url || null,
        category: form.category || null,
        tags: tagsArray.length > 0 ? tagsArray : [],
        recurrence_rule: form.recurrence_rule || null,
        recurrence_end: form.recurrence_end || null,
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

  /* ── Table columns ── */

  const columns = [
    {
      key: "image_url",
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
      key: "title",
      label: "Title",
      render: (_v: unknown, row: unknown) => {
        const r = row as Event;
        return r.title_i18n?.pt || r.title || "—";
      },
    },
    {
      key: "event_date",
      label: "Date",
      render: (v: unknown) =>
        v
          ? new Date(v as string).toLocaleDateString("en", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "",
    },
    { key: "location", label: "Location", hideOnMobile: true },
    { key: "category", label: "Category", hideOnMobile: true },
  ];

  /* ── Render: Full-page form ── */

  if (showForm) {
    return (
      <div>
        <BackButton onClick={closeForm} />
        <h1 className="text-xl md:text-2xl font-bold mb-6">{editing ? "Edit Event" : "New Event"}</h1>
        <form onSubmit={handleSave} className="bg-white rounded-2xl p-4 md:p-6 shadow-sm max-w-3xl space-y-4">
          {/* Section 1 — Basic Info */}
          <Section title="Basic Info" defaultOpen>
            <I18nField
              label="Title"
              value={form.title_i18n}
              onChange={(v) => setForm((p) => ({ ...p, title_i18n: v }))}
              required
            />
            <I18nField
              label="Description"
              value={form.description_i18n}
              onChange={(v) => setForm((p) => ({ ...p, description_i18n: v }))}
              rows={3}
            />
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Start Date"
                type="date"
                value={form.event_date}
                onChange={(v) => setForm((p) => ({ ...p, event_date: v }))}
                required
              />
              <InputField
                label="Time"
                type="time"
                value={form.event_time}
                onChange={(v) => setForm((p) => ({ ...p, event_time: v }))}
              />
            </div>
            <InputField
              label="End Date"
              type="date"
              value={form.event_end_date}
              onChange={(v) => setForm((p) => ({ ...p, event_end_date: v }))}
            />
            <GooglePlacesInput
              value={form.location}
              onChange={(v) => setForm((p) => ({ ...p, location: v }))}
              onPlaceSelect={(place) => setForm((p) => ({ ...p, location: place.address }))}
            />
            <ImageUpload
              label="Event Image"
              value={form.image_url}
              onChange={(v) => setForm((p) => ({ ...p, image_url: v }))}
            />
          </Section>

          {/* Section 2 — Recurrence */}
          <Section title="Recurrence">
            <InputField
              label="Recurrence Rule"
              value={form.recurrence_rule}
              onChange={(v) => setForm((p) => ({ ...p, recurrence_rule: v }))}
              placeholder="e.g. FREQ=WEEKLY;BYDAY=SU"
            />
            <InputField
              label="Recurrence End"
              type="date"
              value={form.recurrence_end}
              onChange={(v) => setForm((p) => ({ ...p, recurrence_end: v }))}
            />
          </Section>

          {/* Section 3 — Tags & Category */}
          <Section title="Tags & Category">
            <InputField
              label="Category"
              value={form.category}
              onChange={(v) => setForm((p) => ({ ...p, category: v }))}
              placeholder="e.g. Worship, Youth, Conference"
            />
            <InputField
              label="Tags"
              value={form.tags}
              onChange={(v) => setForm((p) => ({ ...p, tags: v }))}
              placeholder="Comma-separated: worship, music, prayer"
              hint="Separate tags with commas"
            />
          </Section>

          {/* Section 4 — SEO */}
          <Section title="SEO">
            <I18nField
              label="Meta Title"
              value={form.meta_title_i18n}
              onChange={(v) => setForm((p) => ({ ...p, meta_title_i18n: v }))}
            />
            <I18nField
              label="Meta Description"
              value={form.meta_description_i18n}
              onChange={(v) => setForm((p) => ({ ...p, meta_description_i18n: v }))}
              rows={2}
            />
            <ImageUpload
              label="OG Image"
              value={form.og_image_url}
              onChange={(v) => setForm((p) => ({ ...p, og_image_url: v }))}
            />
          </Section>

          {/* Actions */}
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
        <h1 className="text-xl md:text-2xl font-bold">Events</h1>
        {canEdit && <Button onClick={openNew}>+ New Event</Button>}
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
