"use client";

import { useState } from "react";
import useApi from "@/hooks/useApi";
import useSubmit from "@/hooks/useSubmit";
import DataTable from "@/components/DataTable";
import I18nField from "@/components/I18nField";
import { InputField } from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import BackButton from "@/components/ui/BackButton";
import { useAuth } from "@/contexts/auth-context";
import { hasMinRole } from "@/lib/permissions";

/* ── Types ── */

interface GenerosityMethod {
  id: string;
  type: "mbway" | "iban" | "mb_reference" | "other";
  label: string;
  label_i18n: { en: string; pt: string };
  description: string | null;
  description_i18n: { pt: string; en?: string } | null;
  /* type-specific */
  phone?: string;
  holder_name?: string;
  iban?: string;
  bic?: string;
  entity?: string;
  reference?: string;
  is_active: boolean;
  sort_order: number;
}

const emptyForm = {
  type: "mbway" as GenerosityMethod["type"],
  label_i18n: { en: "", pt: "" },
  description_i18n: { en: "", pt: "" },
  /* mbway */
  phone: "",
  /* iban */
  holder_name: "",
  iban: "",
  bic: "",
  /* mb_reference */
  entity: "",
  reference: "",
  is_active: true,
  sort_order: "0",
};

const TYPE_LABELS: Record<GenerosityMethod["type"], string> = {
  mbway: "MBWAY",
  iban: "Transferência Bancária (IBAN)",
  mb_reference: "Referência Multibanco",
  other: "Outro",
};

const typeOptions = Object.entries(TYPE_LABELS).map(([value, label]) => ({ value, label }));

/* ── Summary chip for list view ── */
function methodSummary(m: GenerosityMethod): string {
  if (m.type === "mbway" && m.phone) return m.phone;
  if (m.type === "iban" && m.iban) return m.iban;
  if (m.type === "mb_reference" && m.entity && m.reference)
    return `Ent. ${m.entity} · Ref. ${m.reference}`;
  return "—";
}

export default function GenerosidadePage() {
  const { data, loading, page, totalPages, setPage, refetch } =
    useApi<GenerosityMethod>("/generosity");
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
    const r = row as GenerosityMethod;
    setForm({
      type: r.type,
      label_i18n: r.label_i18n || { en: r.label || "", pt: r.label || "" },
      description_i18n:
        (r.description_i18n as { en: string; pt: string }) ||
        { en: r.description || "", pt: r.description || "" },
      phone: r.phone || "",
      holder_name: r.holder_name || "",
      iban: r.iban || "",
      bic: r.bic || "",
      entity: r.entity || "",
      reference: r.reference || "",
      is_active: r.is_active,
      sort_order: String(r.sort_order ?? 0),
    });
    setEditing(r.id);
    setShowForm(true);
  };

  const handleDelete = async (row: unknown) => {
    const r = row as GenerosityMethod;
    await submit(`/generosity/${r.id}`, { method: "DELETE" });
    refetch();
  };

  const handleToggle = async (row: unknown) => {
    const r = row as GenerosityMethod;
    await submit(`/generosity/${r.id}/toggle`, { method: "PUT" });
    refetch();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editing ? "PUT" : "POST";
    const url = editing ? `/generosity/${editing}` : "/generosity";

    const body: Record<string, unknown> = {
      type: form.type,
      label_i18n: form.label_i18n,
      description_i18n: form.description_i18n,
      is_active: form.is_active,
      sort_order: Number(form.sort_order) || 0,
    };

    /* Type-specific fields */
    if (form.type === "mbway") body.phone = form.phone || null;
    if (form.type === "iban") {
      body.holder_name = form.holder_name || null;
      body.iban = form.iban || null;
      body.bic = form.bic || null;
    }
    if (form.type === "mb_reference") {
      body.entity = form.entity || null;
      body.reference = form.reference || null;
    }

    const res = await submit(url, { method, body });
    if (res) {
      closeForm();
      refetch();
    }
  };

  /* ── Table columns ── */

  const columns = [
    {
      key: "label",
      label: "Método",
      render: (_v: unknown, row: unknown) => {
        const r = row as GenerosityMethod;
        return (
          <div>
            <p className="font-medium text-gray-900">
              {r.label_i18n?.pt || r.label || "—"}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {TYPE_LABELS[r.type] ?? r.type}
            </p>
          </div>
        );
      },
    },
    {
      key: "phone",
      label: "Detalhes",
      hideOnMobile: true,
      render: (_v: unknown, row: unknown) => {
        const r = row as GenerosityMethod;
        const summary = methodSummary(r);
        return summary !== "—" ? (
          <span className="text-xs font-mono text-gray-600 bg-gray-50 px-2 py-1 rounded-md">
            {summary}
          </span>
        ) : (
          <span className="text-gray-300">—</span>
        );
      },
    },
    {
      key: "sort_order",
      label: "Ordem",
      hideOnMobile: true,
      render: (v: unknown) => (
        <span className="text-sm text-gray-400">#{v as number}</span>
      ),
    },
    {
      key: "is_active",
      label: "Estado",
      render: (v: unknown, row: unknown) => {
        const r = row as GenerosityMethod;
        return (
          <div className="flex items-center gap-2">
            <Badge variant={v ? "success" : "muted"}>
              {v ? "Activo" : "Inactivo"}
            </Badge>
            {canEdit && (
              <button
                onClick={(e) => { e.stopPropagation(); handleToggle(r); }}
                className="text-[10px] text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
              >
                {v ? "Desactivar" : "Activar"}
              </button>
            )}
          </div>
        );
      },
    },
  ];

  /* ── Form view ── */

  if (showForm) {
    return (
      <div>
        <BackButton onClick={closeForm} />
        <h1 className="text-xl md:text-2xl font-bold mb-6">
          {editing ? "Editar Método" : "Novo Método de Generosidade"}
        </h1>
        <form
          onSubmit={handleSave}
          className="bg-white rounded-2xl p-4 md:p-6 shadow-sm max-w-3xl space-y-4"
        >
          {/* ── Tipo ── */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
              Tipo
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {typeOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setForm((p) => ({ ...p, type: opt.value as GenerosityMethod["type"] }))
                  }
                  className={`px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${
                    form.type === opt.value
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Label / Descrição ── */}
          <I18nField
            label="Nome / Label"
            value={form.label_i18n}
            onChange={(v) => setForm((p) => ({ ...p, label_i18n: v }))}
            required
          />
          <I18nField
            label="Descrição"
            value={form.description_i18n}
            onChange={(v) => setForm((p) => ({ ...p, description_i18n: v }))}
            rows={2}
          />

          {/* ── Campos específicos por tipo ── */}
          {form.type === "mbway" && (
            <div className="border-t pt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                MBWAY
              </p>
              <InputField
                label="Número de Telefone"
                value={form.phone}
                onChange={(v) => setForm((p) => ({ ...p, phone: v }))}
                placeholder="+351 912 345 678"
              />
            </div>
          )}

          {form.type === "iban" && (
            <div className="border-t pt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                Dados Bancários
              </p>
              <div className="space-y-3">
                <InputField
                  label="Titular da Conta"
                  value={form.holder_name}
                  onChange={(v) => setForm((p) => ({ ...p, holder_name: v }))}
                  placeholder="Ex: Igreja Demo"
                />
                <InputField
                  label="IBAN"
                  value={form.iban}
                  onChange={(v) => setForm((p) => ({ ...p, iban: v }))}
                  placeholder="PT50 0000 0000 0000 0000 0000 0"
                />
                <InputField
                  label="BIC / SWIFT"
                  value={form.bic}
                  onChange={(v) => setForm((p) => ({ ...p, bic: v }))}
                  placeholder="CGDIPTPL"
                />
              </div>
            </div>
          )}

          {form.type === "mb_reference" && (
            <div className="border-t pt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                Referência Multibanco
              </p>
              <div className="space-y-3">
                <InputField
                  label="Entidade"
                  value={form.entity}
                  onChange={(v) => setForm((p) => ({ ...p, entity: v }))}
                  placeholder="21234"
                />
                <InputField
                  label="Referência"
                  value={form.reference}
                  onChange={(v) => setForm((p) => ({ ...p, reference: v }))}
                  placeholder="123 456 789"
                />
              </div>
            </div>
          )}

          {/* ── Ordem e estado ── */}
          <div className="border-t pt-4 grid grid-cols-2 gap-4 items-end">
            <InputField
              label="Ordem"
              type="number"
              value={form.sort_order}
              onChange={(v) => setForm((p) => ({ ...p, sort_order: v }))}
            />
            <label className="flex items-center gap-2 text-sm cursor-pointer pb-2">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) =>
                  setForm((p) => ({ ...p, is_active: e.target.checked }))
                }
                className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
              />
              Activo
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={closeForm}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving} className="flex-1">
              {editing ? "Guardar" : "Criar"}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  /* ── List view ── */

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Generosidade</h1>
          <p className="text-sm text-gray-500 mt-1">
            Métodos de doação disponíveis na aplicação
          </p>
        </div>
        {canEdit && <Button onClick={openNew}>+ Novo Método</Button>}
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
        emptyTitle="Nenhum método de generosidade configurado"
        emptyAction={
          canEdit ? (
            <Button onClick={openNew} className="mt-2">
              + Novo Método
            </Button>
          ) : undefined
        }
      />
    </div>
  );
}
