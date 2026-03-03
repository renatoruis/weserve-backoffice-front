"use client";

import { useState, useEffect } from "react";
import useApi from "@/hooks/useApi";
import useSubmit from "@/hooks/useSubmit";
import Modal from "@/components/Modal";
import { InputField, SelectField, TextArea } from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { useAuth } from "@/contexts/auth-context";
import { hasMinRole } from "@/lib/permissions";

interface Widget {
  id: string;
  widget_type: string;
  title: string | null;
  config: Record<string, unknown>;
  sort_order: number;
  active: boolean;
}

const WIDGET_TYPES = [
  { value: "hero_banner", label: "Hero Banner" },
  { value: "upcoming_events", label: "Upcoming Events" },
  { value: "latest_sermons", label: "Latest Sermons" },
  { value: "latest_blog", label: "Latest Blog" },
  { value: "verse_of_day", label: "Verse of the Day" },
  { value: "quick_links", label: "Quick Links" },
  { value: "live_stream", label: "Live Stream" },
  { value: "gallery_preview", label: "Gallery Preview" },
  { value: "testimonials", label: "Testimonials" },
  { value: "newsletter_signup", label: "Newsletter Signup" },
];

const emptyForm = {
  title: "",
  widget_type: "hero_banner",
  config: "{}",
  sort_order: "0",
  active: true,
};

function widgetTypeLabel(type: string): string {
  return WIDGET_TYPES.find((t) => t.value === type)?.label ?? type;
}

export default function WidgetsPage() {
  const { data, loading, refetch } = useApi<Widget>("/home-widgets");
  const { submit, loading: saving } = useSubmit();
  const { church } = useAuth();
  const canEdit = hasMinRole(church?.role, "editor");
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  // Sync local widgets list whenever API data changes
  useEffect(() => {
    if (data.length > 0) {
      setWidgets([...data].sort((a, b) => a.sort_order - b.sort_order));
    } else if (!loading) {
      setWidgets([]);
    }
  }, [data, loading]);

  /* ── Open modals ── */

  const openNew = () => {
    setForm(emptyForm);
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (w: Widget) => {
    setForm({
      title: w.title ?? "",
      widget_type: w.widget_type,
      config: JSON.stringify(w.config ?? {}, null, 2),
      sort_order: String(w.sort_order ?? 0),
      active: w.active,
    });
    setEditing(w.id);
    setModalOpen(true);
  };

  /* ── CRUD ── */

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    let parsedConfig: Record<string, unknown>;
    try {
      parsedConfig = JSON.parse(form.config);
    } catch {
      alert("JSON inválido no campo de configuração. Por favor corrija antes de guardar.");
      return;
    }

    const method = editing ? "PUT" : "POST";
    const url = editing
      ? `/home-widgets/${editing}`
      : "/home-widgets";

    const res = await submit(url, {
      method,
      body: {
        title: form.title || null,
        widget_type: form.widget_type,
        config: parsedConfig,
        sort_order: Number(form.sort_order) || 0,
        active: form.active,
      },
    });

    if (res) {
      setModalOpen(false);
      refetch();
    }
  };

  const handleDelete = async (id: string) => {
    const res = await submit(`/home-widgets/${id}`, { method: "DELETE" });
    if (res) refetch();
  };

  /* ── Reorder ── */

  const moveWidget = async (index: number, direction: "up" | "down") => {
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= widgets.length) return;

    const updated = [...widgets];
    const temp = updated[index];
    updated[index] = updated[swapIndex];
    updated[swapIndex] = temp;
    setWidgets(updated);

    await submit("/home-widgets/reorder", {
      method: "PUT",
      body: { order: updated.map((w) => w.id) },
    });
  };

  /* ── Loading skeleton ── */

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl md:text-2xl font-bold">Home Widgets</h1>
          <div className="h-10 w-32 bg-gray-200 rounded-xl animate-pulse" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100"
            >
              <div className="w-6 h-8 bg-gray-200 rounded animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-8 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-8 w-8 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-8 w-8 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-8 w-8 bg-gray-200 rounded-lg animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Page ── */

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-bold">Home Widgets</h1>
        {canEdit && <Button onClick={openNew}>+ Novo Widget</Button>}
      </div>

      {widgets.length === 0 && (
        <div className="text-center py-16 text-gray-400 text-sm">
          Nenhum widget configurado. Clique em &quot;+ Novo Widget&quot; para começar.
        </div>
      )}

      <div className="space-y-3">
        {widgets.map((w, index) => (
          <div
            key={w.id}
            className="flex items-center gap-3 md:gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm"
          >
            {/* Drag handle (visual only) */}
            <div className="text-gray-300 shrink-0 cursor-grab" title="Drag to reorder">
              <svg
                width="16"
                height="24"
                viewBox="0 0 16 24"
                fill="currentColor"
              >
                <circle cx="5" cy="4" r="1.5" />
                <circle cx="11" cy="4" r="1.5" />
                <circle cx="5" cy="10" r="1.5" />
                <circle cx="11" cy="10" r="1.5" />
                <circle cx="5" cy="16" r="1.5" />
                <circle cx="11" cy="16" r="1.5" />
                <circle cx="5" cy="22" r="1.5" />
                <circle cx="11" cy="22" r="1.5" />
              </svg>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="info">{widgetTypeLabel(w.widget_type)}</Badge>
                <Badge variant={w.active ? "success" : "muted"}>
                  {w.active ? "Activo" : "Inactivo"}
                </Badge>
              </div>
              <p className="text-sm font-medium text-gray-800 mt-1 truncate">
                {w.title || widgetTypeLabel(w.widget_type)}
              </p>
              <p className="text-xs text-gray-400">Ordem: {w.sort_order}</p>
            </div>

            {/* Actions */}
            {canEdit && (
              <div className="flex items-center gap-1 shrink-0">
                {/* Move Up */}
                <button
                  onClick={() => moveWidget(index, "up")}
                  disabled={index === 0}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Move up"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="18 15 12 9 6 15" />
                  </svg>
                </button>

                {/* Move Down */}
                <button
                  onClick={() => moveWidget(index, "down")}
                  disabled={index === widgets.length - 1}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Move down"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {/* Edit */}
                <button
                  onClick={() => openEdit(w)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  title="Edit"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(w.id)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Delete"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Editar Widget" : "Novo Widget"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <InputField
            label="Título"
            value={form.title}
            onChange={(v) => setForm((p) => ({ ...p, title: v }))}
            placeholder="Título de exibição (opcional)"
          />
          <SelectField
            label="Tipo de Widget"
            value={form.widget_type}
            options={WIDGET_TYPES}
            onChange={(v) => setForm((p) => ({ ...p, widget_type: v }))}
          />
          <TextArea
            label="Configuração (JSON)"
            value={form.config}
            onChange={(v) => setForm((p) => ({ ...p, config: v }))}
            rows={4}
            hint="Configuração em formato JSON"
            placeholder="{}"
          />
          <InputField
            label="Ordem"
            type="number"
            value={form.sort_order}
            onChange={(v) => setForm((p) => ({ ...p, sort_order: v }))}
          />
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
            />
            Activo
          </label>
          <Button type="submit" loading={saving} className="w-full">
            {editing ? "Guardar" : "Criar"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
