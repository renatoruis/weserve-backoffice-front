"use client";

import { useState, useEffect } from "react";
import ImageUpload from "@/components/ImageUpload";
import FormField from "@/components/FormField";

export default function HomeContentPage() {
  const [form, setForm] = useState({
    banner_url: "",
    verse_text: "",
    verse_ref: "",
    live_url: "",
    live_active: false,
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/proxy/admin/home")
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          setForm({
            banner_url: data.banner_url || "",
            verse_text: data.verse_text || "",
            verse_ref: data.verse_ref || "",
            live_url: data.live_url || "",
            live_active: data.live_active || false,
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/proxy/admin/home", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const set = (key: string) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Home Content</h1>
      <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 shadow-sm max-w-2xl space-y-4">
        <ImageUpload label="Banner Image" value={form.banner_url} onChange={set("banner_url")} />

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
          <p className="font-medium mb-1">Verse of the Day</p>
          <p className="text-blue-600/80">
            The verse is automatically fetched daily from YouVersion. No manual configuration needed.
          </p>
        </div>

        {/* Live Stream */}
        <div className="border-t pt-4 mt-4">
          <h2 className="text-lg font-semibold mb-3">Live Stream</h2>
          <div className="flex items-center gap-3 mb-4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.live_active}
                onChange={(e) => setForm(p => ({ ...p, live_active: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500" />
            </label>
            <span className="text-sm font-medium">
              {form.live_active ? (
                <span className="text-red-500 font-bold">LIVE is ON</span>
              ) : (
                <span className="text-gray-500">Live is OFF</span>
              )}
            </span>
          </div>
          <FormField
            label="Live Stream URL"
            value={form.live_url}
            onChange={set("live_url")}
            placeholder="https://youtube.com/live/..."
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-[var(--color-primary)] text-white text-sm font-semibold rounded-xl hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save"}
          </button>
          {saved && <span className="text-sm text-green-600">Saved!</span>}
        </div>
      </form>
    </div>
  );
}
