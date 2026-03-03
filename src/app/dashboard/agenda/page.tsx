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
import BackButton from "@/components/ui/BackButton";

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
  event_end_date: string | null;
  location: string;
  image_url: string;
  category: string;
  tags: string[];
  recurrence: string | null;
  recurrence_end: string | null;
  meta_title_i18n: I18n;
  meta_description_i18n: I18n;
  og_image_url: string;
}

/* ── Recurrence ── */

const RECURRENCE_OPTIONS = [
  { value: "none",             label: "Pontual",       hint: "Evento único" },
  { value: "daily",            label: "Diário",        hint: "Todos os dias" },
  { value: "weekly",           label: "Semanal",       hint: "Mesmo dia da semana" },
  { value: "biweekly",         label: "Bissemanal",    hint: "De 2 em 2 semanas" },
  { value: "monthly",          label: "Mensal",        hint: "Mesmo dia do mês" },
  { value: "monthly_weekday",  label: "Mensal — dia",  hint: "Ex: 1ª sexta do mês" },
  { value: "yearly",           label: "Anual",         hint: "Mesma data do ano" },
] as const;

type RecurrenceValue = typeof RECURRENCE_OPTIONS[number]["value"];

const RECURRENCE_LABEL: Record<RecurrenceValue, string> = {
  none:            "Pontual",
  daily:           "Diário",
  weekly:          "Semanal",
  biweekly:        "Bissemanal",
  monthly:         "Mensal",
  monthly_weekday: "Mensal (dia)",
  yearly:          "Anual",
};

/* ── Natural-language description of recurrence given event_date ── */

const PT_WEEKDAYS = ["domingo","segunda-feira","terça-feira","quarta-feira","quinta-feira","sexta-feira","sábado"];
const PT_ORDINALS  = ["1ª","2ª","3ª","4ª","última"];
const PT_MONTHS    = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];

function describeRecurrence(recurrence: RecurrenceValue, eventDate: string): string | null {
  if (!eventDate || recurrence === "none") return null;
  const d = new Date(eventDate + "T00:00:00");
  if (isNaN(d.getTime())) return null;

  const weekday  = PT_WEEKDAYS[d.getDay()];
  const dom      = d.getDate();
  const month    = PT_MONTHS[d.getMonth()];
  const position = Math.ceil(dom / 7);
  const ordinal  = PT_ORDINALS[Math.min(position - 1, 3)];

  switch (recurrence) {
    case "daily":           return "Repete todos os dias";
    case "weekly":          return `Repete toda a ${weekday}`;
    case "biweekly":        return `Repete de 2 em 2 semanas à ${weekday}`;
    case "monthly":         return `Repete dia ${dom} de cada mês`;
    case "monthly_weekday": return `Repete a ${ordinal} ${weekday} de cada mês`;
    case "yearly":          return `Repete a ${dom} de ${month} todos os anos`;
    default:                return null;
  }
}

/* ── Category quick-select ── */

const CATEGORY_OPTIONS = [
  { value: "worship",  label: "Culto" },
  { value: "study",    label: "Estudo" },
  { value: "youth",    label: "Jovens" },
  { value: "prayer",   label: "Oração" },
  { value: "retreat",  label: "Retiro" },
  { value: "other",    label: "Outro" },
];

/* ── Empty form ── */

const emptyI18n: I18n = { en: "", pt: "" };

const emptyForm = {
  title_i18n:           { ...emptyI18n },
  description_i18n:     { ...emptyI18n },
  event_date:           "",
  event_time:           "",
  event_end_date:       "",
  event_end_time:       "",
  location:             "",
  image_url:            "",
  category:             "",
  tags:                 "",
  recurrence:           "none" as RecurrenceValue,
  recurrence_end:       "",
  meta_title_i18n:      { ...emptyI18n },
  meta_description_i18n:{ ...emptyI18n },
  og_image_url:         "",
};

/* ── Collapsible section ── */

function Section({
  title,
  defaultOpen = false,
  badge,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <details open={defaultOpen} className="group border border-gray-100 rounded-xl overflow-hidden">
      <summary className="flex items-center justify-between cursor-pointer px-4 py-3 bg-gray-50/60 hover:bg-gray-50 transition-colors select-none">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">{title}</span>
          {badge && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-600">
              {badge}
            </span>
          )}
        </div>
        <svg
          className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-180"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
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

  /* ── Helpers ── */

  const closeForm = () => { setShowForm(false); setEditing(null); };

  const openNew = () => {
    setForm({
      ...emptyForm,
      title_i18n: { ...emptyI18n },
      description_i18n: { ...emptyI18n },
      meta_title_i18n: { ...emptyI18n },
      meta_description_i18n: { ...emptyI18n },
    });
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (row: unknown) => {
    const r = row as Event;
    const startDt  = r.event_date     ? new Date(r.event_date)     : null;
    const endDt    = r.event_end_date  ? new Date(r.event_end_date)  : null;
    setForm({
      title_i18n:           r.title_i18n            || { en: r.title || "", pt: r.title || "" },
      description_i18n:     r.description_i18n      || { en: r.description || "", pt: r.description || "" },
      event_date:           toDateInputValue(r.event_date),
      event_time:           startDt ? startDt.toTimeString().slice(0, 5) : "",
      event_end_date:       toDateInputValue(r.event_end_date),
      event_end_time:       endDt   ? endDt.toTimeString().slice(0, 5)   : "",
      location:             r.location   || "",
      image_url:            r.image_url  || "",
      category:             r.category   || "",
      tags:                 Array.isArray(r.tags) ? r.tags.join(", ") : "",
      recurrence:           (r.recurrence as RecurrenceValue) || "none",
      recurrence_end:       toDateInputValue(r.recurrence_end),
      meta_title_i18n:      r.meta_title_i18n       || { ...emptyI18n },
      meta_description_i18n:r.meta_description_i18n || { ...emptyI18n },
      og_image_url:         r.og_image_url || "",
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
    const url    = editing ? `/events/${editing}` : "/events";

    const event_date = form.event_time
      ? `${form.event_date}T${form.event_time}:00`
      : `${form.event_date}T00:00:00`;

    /* event_end_date = fim da duração do evento (mesmo dia ou multi-dia) */
    const event_end_date = form.event_end_date
      ? form.event_end_time
        ? `${form.event_end_date}T${form.event_end_time}:00`
        : `${form.event_end_date}T23:59:00`
      : null;

    const tagsArray = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
    const isRecurring = form.recurrence !== "none";

    const res = await submit(url, {
      method,
      body: {
        title_i18n:           form.title_i18n,
        description_i18n:     form.description_i18n,
        event_date,
        event_end_date,
        location:             form.location || null,
        image_url:            form.image_url || null,
        category:             form.category || null,
        tags:                 tagsArray,
        recurrence:           isRecurring ? form.recurrence : "none",
        recurrence_end:       isRecurring ? (form.recurrence_end || null) : null,
        meta_title_i18n:      form.meta_title_i18n,
        meta_description_i18n:form.meta_description_i18n,
        og_image_url:         form.og_image_url || form.image_url || null,
      },
    });
    if (res) { closeForm(); refetch(); }
  };

  /* ── Table columns ── */

  const columns = [
    {
      key: "image_url",
      label: "",
      hideOnMobile: true,
      render: (v: unknown) =>
        v
          ? <img src={v as string} alt="" className="w-10 h-10 rounded-lg object-cover" />
          : <div className="w-10 h-10 rounded-lg bg-gray-100" />,
    },
    {
      key: "title",
      label: "Título",
      render: (_v: unknown, row: unknown) => {
        const r = row as Event;
        const label = r.title_i18n?.pt || r.title || "—";
        const cat = r.category ? CATEGORY_OPTIONS.find(c => c.value === r.category)?.label ?? r.category : null;
        return (
          <div>
            <p className="font-medium">{label}</p>
            {cat && <p className="text-xs text-gray-400 mt-0.5">{cat}</p>}
          </div>
        );
      },
    },
    {
      key: "event_date",
      label: "Data",
      render: (v: unknown) =>
        v
          ? new Date(v as string).toLocaleDateString("pt-PT", {
              day: "numeric", month: "short", year: "numeric",
              hour: "2-digit", minute: "2-digit",
            })
          : "",
    },
    {
      key: "recurrence",
      label: "Recorrência",
      hideOnMobile: true,
      render: (v: unknown) => {
        const val = v as RecurrenceValue | null;
        if (!val || val === "none") return <span className="text-gray-300 text-xs">—</span>;
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 2l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
            </svg>
            {RECURRENCE_LABEL[val] ?? val}
          </span>
        );
      },
    },
    { key: "location", label: "Local", hideOnMobile: true },
  ];

  /* ── Form view ── */

  if (showForm) {
    const isRecurring = form.recurrence !== "none";

    return (
      <div>
        <BackButton onClick={closeForm} />
        <h1 className="text-xl md:text-2xl font-bold mb-6">
          {editing ? "Editar Evento" : "Novo Evento"}
        </h1>
        <form onSubmit={handleSave} className="bg-white rounded-2xl p-4 md:p-6 shadow-sm max-w-3xl space-y-4">

          {/* ── Secção 1: Informação Básica ── */}
          <Section title="Informação Básica" defaultOpen>
            <I18nField
              label="Título"
              value={form.title_i18n}
              onChange={(v) => setForm((p) => ({ ...p, title_i18n: v }))}
              required
            />
            <I18nField
              label="Descrição"
              value={form.description_i18n}
              onChange={(v) => setForm((p) => ({ ...p, description_i18n: v }))}
              rows={3}
            />

            {/* Data e hora de início */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1.5">
                Início
              </p>
              <div className="grid grid-cols-2 gap-3">
                <InputField
                  label="Data"
                  type="date"
                  value={form.event_date}
                  onChange={(v) => setForm((p) => ({ ...p, event_date: v }))}
                  required
                />
                <InputField
                  label="Hora"
                  type="time"
                  value={form.event_time}
                  onChange={(v) => setForm((p) => ({ ...p, event_time: v }))}
                />
              </div>
            </div>

            {/* Data e hora de fim (duração) */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1.5">
                Fim do evento
                <span className="ml-1 text-[11px] font-normal text-gray-400">
                  — duração desta ocorrência
                </span>
              </p>
              <div className="grid grid-cols-2 gap-3">
                <InputField
                  label="Data"
                  type="date"
                  value={form.event_end_date}
                  onChange={(v) => setForm((p) => ({ ...p, event_end_date: v }))}
                />
                <InputField
                  label="Hora"
                  type="time"
                  value={form.event_end_time}
                  onChange={(v) => setForm((p) => ({ ...p, event_end_time: v }))}
                />
              </div>
              {isRecurring && (
                <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mt-2">
                  A duração é preservada em todas as ocorrências futuras.
                  Para terminar a série, use &quot;Terminar recorrência em&quot; na secção abaixo.
                </p>
              )}
            </div>

            <GooglePlacesInput
              value={form.location}
              onChange={(v) => setForm((p) => ({ ...p, location: v }))}
              onPlaceSelect={(place) => setForm((p) => ({ ...p, location: place.address }))}
            />
            <ImageUpload
              label="Imagem do Evento"
              value={form.image_url}
              onChange={(v) => setForm((p) => ({ ...p, image_url: v }))}
            />
          </Section>

          {/* ── Secção 2: Recorrência ── */}
          <Section
            title="Recorrência"
            badge={isRecurring ? RECURRENCE_LABEL[form.recurrence] : undefined}
          >
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Frequência</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {RECURRENCE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      setForm((p) => ({
                        ...p,
                        recurrence: opt.value,
                        recurrence_end: opt.value === "none" ? "" : p.recurrence_end,
                      }))
                    }
                    className={`flex flex-col items-start px-3 py-2.5 rounded-xl border text-sm transition-colors ${
                      form.recurrence === opt.value
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]"
                        : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <span className="font-medium text-sm">{opt.label}</span>
                    <span className={`text-[10px] mt-0.5 leading-tight ${form.recurrence === opt.value ? "text-[var(--color-primary)]/70" : "text-gray-400"}`}>
                      {opt.hint}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Descrição em linguagem natural — aparece quando há data e recorrência */}
            {(() => {
              const desc = describeRecurrence(form.recurrence, form.event_date);
              if (!desc) return null;
              const isWeekday = form.recurrence === "monthly_weekday";
              return (
                <div className={`flex items-start gap-2.5 rounded-xl px-3.5 py-3 text-sm ${
                  isWeekday
                    ? "bg-indigo-50 border border-indigo-100 text-indigo-700"
                    : "bg-gray-50 border border-gray-100 text-gray-600"
                }`}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                    <path d="M17 2l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
                  </svg>
                  <span>
                    <strong>{desc}</strong>
                    {isWeekday && !form.event_date && (
                      <span className="block text-xs text-indigo-500 mt-0.5">
                        Defina a data de início para calcular o dia da semana.
                      </span>
                    )}
                    {isWeekday && form.event_date && (
                      <span className="block text-xs text-indigo-500 mt-0.5">
                        A API deriva a posição automaticamente a partir da data de início.
                      </span>
                    )}
                  </span>
                </div>
              );
            })()}

            {/* Terminar recorrência — só aparece quando há recorrência */}
            {isRecurring && (
              <div className="border-t border-dashed border-gray-100 pt-4">
                <InputField
                  label="Terminar recorrência em (opcional)"
                  type="date"
                  value={form.recurrence_end}
                  onChange={(v) => setForm((p) => ({ ...p, recurrence_end: v }))}
                  hint="Deixe em branco para repetição indefinida"
                />
              </div>
            )}
          </Section>

          {/* ── Secção 3: Categoria e Tags ── */}
          <Section title="Categoria e Tags">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Categoria</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {CATEGORY_OPTIONS.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() =>
                      setForm((p) => ({
                        ...p,
                        category: p.category === cat.value ? "" : cat.value,
                      }))
                    }
                    className={`px-3 py-1.5 rounded-full border text-sm transition-colors ${
                      form.category === cat.value
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)] font-medium"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              {/* Campo livre para categorias personalizadas */}
              {!CATEGORY_OPTIONS.some((c) => c.value === form.category) && (
                <InputField
                  label=""
                  value={form.category}
                  onChange={(v) => setForm((p) => ({ ...p, category: v }))}
                  placeholder="Categoria personalizada..."
                />
              )}
            </div>
            <InputField
              label="Tags"
              value={form.tags}
              onChange={(v) => setForm((p) => ({ ...p, tags: v }))}
              placeholder="worship, música, oração"
              hint="Separar com vírgulas"
            />
          </Section>

          {/* ── Secção 4: SEO ── */}
          <Section title="SEO">
            <I18nField
              label="Meta Título"
              value={form.meta_title_i18n}
              onChange={(v) => setForm((p) => ({ ...p, meta_title_i18n: v }))}
            />
            <I18nField
              label="Meta Descrição"
              value={form.meta_description_i18n}
              onChange={(v) => setForm((p) => ({ ...p, meta_description_i18n: v }))}
              rows={2}
            />
            <ImageUpload
              label="Imagem OG"
              value={form.og_image_url}
              onChange={(v) => setForm((p) => ({ ...p, og_image_url: v }))}
            />
          </Section>

          {/* Acções */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={closeForm}>Cancelar</Button>
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
        <h1 className="text-xl md:text-2xl font-bold">Eventos</h1>
        {canEdit && <Button onClick={openNew}>+ Novo Evento</Button>}
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
