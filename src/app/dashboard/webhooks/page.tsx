"use client";

import { useState } from "react";
import useApi from "@/hooks/useApi";
import useSubmit from "@/hooks/useSubmit";
import DataTable from "@/components/DataTable";
import { InputField } from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { useAuth } from "@/contexts/auth-context";
import { hasMinRole } from "@/lib/permissions";

interface Webhook {
  id: string;
  url: string;
  events: string[];
  secret: string | null;
  active: boolean;
}

const emptyForm = {
  url: "",
  events: "",
  secret: "",
  active: true,
};

/* ── BackButton ── */

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-4">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><polyline points="12 19 5 12 12 5" /></svg>
      Back
    </button>
  );
}

export default function WebhooksPage() {
  const { church } = useAuth();
  const canEdit = hasMinRole(church?.role, "admin");

  const { data, loading, page, totalPages, setPage, refetch } = useApi<Webhook>("/webhooks");
  const { submit, loading: saving } = useSubmit();
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
    const r = row as Webhook;
    setForm({
      url: r.url || "",
      events: Array.isArray(r.events) ? r.events.join(", ") : "",
      secret: r.secret || "",
      active: r.active,
    });
    setEditing(r.id);
    setShowForm(true);
  };

  const handleDelete = async (row: unknown) => {
    const r = row as Webhook;
    await submit(`/webhooks/${r.id}`, { method: "DELETE" });
    refetch();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editing ? "PUT" : "POST";
    const url = editing ? `/webhooks/${editing}` : "/webhooks";
    const events = form.events
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const res = await submit(url, {
      method,
      body: {
        url: form.url,
        events,
        secret: form.secret || null,
        active: form.active,
      },
    });
    if (res) {
      setShowForm(false);
      refetch();
    }
  };

  const columns = [
    {
      key: "url",
      label: "URL",
      render: (v: unknown) => {
        const s = (v as string) || "";
        return (
          <span className="font-mono text-xs" title={s}>
            {s.length > 40 ? s.slice(0, 40) + "…" : s}
          </span>
        );
      },
    },
    {
      key: "events",
      label: "Events",
      hideOnMobile: true,
      render: (v: unknown) => {
        const arr = v as string[];
        return (
          <Badge variant="info">
            {Array.isArray(arr) ? arr.length : 0} event{Array.isArray(arr) && arr.length !== 1 ? "s" : ""}
          </Badge>
        );
      },
    },
    {
      key: "active",
      label: "Status",
      render: (v: unknown) => (
        <Badge variant={v ? "success" : "danger"}>
          {v ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ];

  /* ── Render ── */

  if (showForm) {
    return (
      <div>
        <BackButton onClick={closeForm} />
        <h1 className="text-xl md:text-2xl font-bold mb-6">
          {editing ? "Edit Webhook" : "New Webhook"}
        </h1>
        <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm max-w-3xl space-y-4">
          <form onSubmit={handleSave} className="space-y-4">
            <InputField
              label="URL"
              value={form.url}
              onChange={(v) => setForm((p) => ({ ...p, url: v }))}
              placeholder="https://your-server.com/webhook"
              required
            />
            <InputField
              label="Events"
              value={form.events}
              onChange={(v) => setForm((p) => ({ ...p, events: v }))}
              placeholder="e.g. payment.created, event.created"
              hint="Comma-separated: payment.created, payment.updated, event.created, event.updated, contact.created, newsletter.subscribed, form.submitted"
            />
            <InputField
              label="Secret"
              value={form.secret}
              onChange={(v) => setForm((p) => ({ ...p, secret: v }))}
              placeholder="Optional secret key"
            />
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
              />
              Active
            </label>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={closeForm}>
                Cancel
              </Button>
              <Button type="submit" loading={saving}>
                {editing ? "Save" : "Create"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-bold">Webhooks</h1>
        {canEdit && <Button onClick={openNew}>+ New Webhook</Button>}
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
