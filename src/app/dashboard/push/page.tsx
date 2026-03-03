"use client";

import { useState, useEffect, useRef } from "react";
import useAuthFetch from "@/hooks/useAuthFetch";
import useSubmit from "@/hooks/useSubmit";
import { InputField, TextArea } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAuth } from "@/contexts/auth-context";
import { hasMinRole } from "@/lib/permissions";

export default function PushPage() {
  const { adminFetch } = useAuthFetch();
  const { church } = useAuth();
  const canEdit = hasMinRole(church?.role, "editor");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const { submit, loading: sending } = useSubmit();
  const [result, setResult] = useState<{ sent: number; failed: number; total: number } | null>(null);
  const [error, setError] = useState("");

  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    adminFetch("/push/subscribers")
      .then((r) => r.json())
      .then((d) => setSubscriberCount(d.count ?? 0))
      .catch(() => {
        fetchedRef.current = false;
      });
  }, [adminFetch]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    setError("");
    setResult(null);

    const res = await submit("/push/send", {
      method: "POST",
      body: { title, body },
    });

    if (res) {
      const data = await res.json();
      setResult(data);
      setTitle("");
      setBody("");
    } else {
      setError("Erro ao enviar notificações");
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl md:text-2xl font-bold mb-1">Notificações Push</h1>
      <p className="text-sm text-gray-500 mb-6">
        Enviar notificações push para todos os utilizadores da app com subscrição activa.
        {subscriberCount !== null && (
          <span className="ml-1 font-semibold text-gray-700">
            {subscriberCount} subscrit{subscriberCount !== 1 ? "os" : "o"}
          </span>
        )}
      </p>

      {canEdit ? (
        <form onSubmit={handleSend} className="bg-white rounded-2xl shadow-sm p-4 md:p-6 flex flex-col gap-4">
          <InputField
            label="Título"
            value={title}
            onChange={setTitle}
            placeholder="Título da notificação"
            required
          />
          <TextArea
            label="Mensagem"
            value={body}
            onChange={setBody}
            placeholder="Mensagem da notificação..."
            rows={4}
            required
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          {result && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm">
              <p className="font-medium text-green-800">Notificações enviadas!</p>
              <p className="text-green-700 mt-1">
                Enviadas: {result.sent} | Falhadas: {result.failed} | Total: {result.total}
              </p>
            </div>
          )}

          <Button type="submit" loading={sending} className="self-start">
            Enviar Notificação
          </Button>
        </form>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 text-sm text-gray-500">
          Não tem permissão para enviar notificações push.
        </div>
      )}
    </div>
  );
}
