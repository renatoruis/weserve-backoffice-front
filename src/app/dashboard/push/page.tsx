"use client";

import { useState, useEffect } from "react";

interface Subscriber {
  id: string;
  endpoint: string;
  created_at: string;
}

export default function PushPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number; total: number } | null>(null);
  const [error, setError] = useState("");

  const loadSubscribers = () => {
    fetch("/api/proxy/admin/push/subscribers")
      .then((r) => r.json())
      .then((d) => setSubscribers(d.subscribers ?? []))
      .catch(() => {});
  };

  useEffect(() => {
    loadSubscribers();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    setSending(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/proxy/admin/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body }),
      });
      if (!res.ok) throw new Error("Failed to send");
      const data = await res.json();
      setResult(data);
      setTitle("");
      setBody("");
      loadSubscribers();
    } catch {
      setError("Failed to send notifications");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-1">Push Notifications</h1>
      <p className="text-sm text-gray-500 mb-6">
        Envie notificações para todos os dispositivos inscritos.
        <span className="ml-1 font-semibold text-gray-700">
          {subscribers.length} dispositivo{subscribers.length !== 1 ? "s" : ""} ativo{subscribers.length !== 1 ? "s" : ""}
        </span>
      </p>

      <form onSubmit={handleSend} className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Notification title"
            className="w-full border rounded-lg px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Message</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Notification message..."
            rows={4}
            className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
            required
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
            <p className="font-medium text-green-800">Notifications sent!</p>
            <p className="text-green-700 mt-1">
              Sent: {result.sent} | Failed: {result.failed} | Total: {result.total}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={sending}
          className="bg-[var(--color-primary)] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity self-start"
        >
          {sending ? "Sending..." : "Send Notification"}
        </button>
      </form>
      {/* Subscribers list */}
      {subscribers.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-3">Dispositivos Inscritos</h2>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">#</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Plataforma</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Endpoint</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Inscrito em</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((sub, i) => {
                  const url = new URL(sub.endpoint);
                  const platform = url.hostname.includes("google")
                    ? "Android / Chrome"
                    : url.hostname.includes("apple") || url.hostname.includes("push.apple")
                    ? "iPhone / Safari"
                    : url.hostname.includes("mozilla") || url.hostname.includes("push.services.mozilla")
                    ? "Firefox"
                    : url.hostname.includes("windows") || url.hostname.includes("wns")
                    ? "Windows"
                    : url.hostname;

                  return (
                    <tr key={sub.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                          {platform}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 truncate max-w-[300px]" title={sub.endpoint}>
                        ...{sub.endpoint.slice(-40)}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(sub.created_at).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
