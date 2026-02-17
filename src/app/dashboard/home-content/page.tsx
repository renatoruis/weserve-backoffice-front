"use client";

import { useState, useEffect, useRef } from "react";
import useAuthFetch from "@/hooks/useAuthFetch";
import useSubmit from "@/hooks/useSubmit";
import ImageUpload from "@/components/ImageUpload";
import { InputField } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { useAuth } from "@/contexts/auth-context";
import { hasMinRole } from "@/lib/permissions";

export default function HomeContentPage() {
  const { adminFetch } = useAuthFetch();
  const { church } = useAuth();
  const canEdit = hasMinRole(church?.role, "editor");
  const [form, setForm] = useState({
    banner_url: "",
    verse_text: "",
    verse_ref: "",
    live_url: "",
    live_active: false,
    featured_event_id: "",
    featured_sermon_id: "",
    featured_blog_id: "",
  });
  const [pageLoading, setPageLoading] = useState(true);
  const { submit, loading: saving } = useSubmit();
  const [saved, setSaved] = useState(false);

  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    adminFetch("/home")
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          setForm({
            banner_url: data.banner_url || "",
            verse_text: data.verse_text || "",
            verse_ref: data.verse_ref || "",
            live_url: data.live_url || "",
            live_active: data.live_active || false,
            featured_event_id: data.featured_event_id || "",
            featured_sermon_id: data.featured_sermon_id || "",
            featured_blog_id: data.featured_blog_id || "",
          });
        }
      })
      .catch(() => {
        fetchedRef.current = false;
      })
      .finally(() => setPageLoading(false));
  }, [adminFetch]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await submit("/home", {
      method: "PUT",
      body: {
        banner_url: form.banner_url || null,
        verse_text: form.verse_text || null,
        verse_ref: form.verse_ref || null,
        live_url: form.live_url || null,
        live_active: form.live_active,
        featured_event_id: form.featured_event_id || null,
        featured_sermon_id: form.featured_sermon_id || null,
        featured_blog_id: form.featured_blog_id || null,
      },
    });
    if (res) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const set = (key: string) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  if (pageLoading) {
    return (
      <div>
        <h1 className="text-xl md:text-2xl font-bold mb-6">Home Content</h1>
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl md:text-2xl font-bold mb-6">Home Content</h1>
      <form onSubmit={handleSave} className="bg-white rounded-2xl p-4 md:p-6 shadow-sm max-w-2xl space-y-4">
        <ImageUpload label="Banner Image" value={form.banner_url} onChange={set("banner_url")} />

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
          <p className="font-medium mb-1">Verse of the Day</p>
          <p className="text-blue-600/80">
            The verse is automatically fetched daily from YouVersion. No manual configuration needed.
          </p>
        </div>

        {/* Live Stream */}
        <div className="border-t pt-4 mt-4">
          <h2 className="text-base font-semibold mb-3">Live Stream</h2>
          <div className="flex items-center gap-3 mb-4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.live_active}
                onChange={(e) => setForm((p) => ({ ...p, live_active: e.target.checked }))}
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
          <InputField
            label="Live Stream URL"
            value={form.live_url}
            onChange={set("live_url")}
            placeholder="https://youtube.com/live/..."
          />
        </div>

        {/* Featured Content */}
        <div className="border-t pt-4 mt-4">
          <h2 className="text-base font-semibold mb-3">Featured Content</h2>
          <div className="space-y-4">
            <InputField
              label="Featured Event ID"
              value={form.featured_event_id}
              onChange={set("featured_event_id")}
              placeholder="Event UUID"
            />
            <InputField
              label="Featured Sermon ID"
              value={form.featured_sermon_id}
              onChange={set("featured_sermon_id")}
              placeholder="Sermon UUID"
            />
            <InputField
              label="Featured Blog Post ID"
              value={form.featured_blog_id}
              onChange={set("featured_blog_id")}
              placeholder="Blog Post UUID"
            />
          </div>
        </div>

        {canEdit && (
          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" loading={saving}>Save</Button>
            {saved && <span className="text-sm text-green-600">Saved!</span>}
          </div>
        )}
      </form>
    </div>
  );
}
