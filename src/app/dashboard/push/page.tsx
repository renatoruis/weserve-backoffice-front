"use client";

import { useState, useEffect } from "react";

export default function PushPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number; total: number } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/proxy/admin/push/subscribers")
      .then((r) => r.json())
      .then((d) => setSubscriberCount(d.count ?? 0))
      .catch(() => {});
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
        Send push notifications to all subscribed app users.
        {subscriberCount !== null && (
          <span className="ml-1 font-semibold text-gray-700">
            {subscriberCount} subscriber{subscriberCount !== 1 ? "s" : ""}
          </span>
        )}
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
    </div>
  );
}
