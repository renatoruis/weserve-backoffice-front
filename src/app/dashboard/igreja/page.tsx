"use client";

import { useState, useEffect } from "react";
import FormField from "@/components/FormField";
import GooglePlacesInput from "@/components/GooglePlacesInput";
import ImageUpload from "@/components/ImageUpload";

export default function IgrejaPage() {
  const [form, setForm] = useState({
    name: "",
    slug: "",
    locale: "pt",
    address: "",
    lat: "",
    lng: "",
    logo_url: "",
    primary_color: "#C0DF16",
    heading_color: "#242121",
    about_text: "",
    donation_url: "",
    service_times: [] as { day: string; time: string; label: string }[],
    social_links: [] as { platform: string; url: string }[],
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/proxy/admin/churches")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const c = data[0];
          setForm({
            name: c.name || "",
            slug: c.slug || "",
            locale: c.locale || "pt",
            address: c.address || "",
            lat: c.lat?.toString() || "",
            lng: c.lng?.toString() || "",
            logo_url: c.logo_url || "",
            primary_color: c.primary_color || "#C0DF16",
            heading_color: c.heading_color || "#242121",
            about_text: c.about_text || "",
            donation_url: c.donation_url || "",
            service_times: Array.isArray(c.service_times) ? c.service_times : [],
            social_links: Array.isArray(c.social_links) ? c.social_links : [],
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/proxy/admin/churches", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          lat: form.lat ? parseFloat(form.lat) : null,
          lng: form.lng ? parseFloat(form.lng) : null,
          about_text: form.about_text || null,
          donation_url: form.donation_url || null,
          service_times: form.service_times,
          social_links: form.social_links,
        }),
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

  const handlePlaceSelect = (place: { address: string; lat: number; lng: number }) => {
    setForm((prev) => ({
      ...prev,
      address: place.address,
      lat: place.lat.toString(),
      lng: place.lng.toString(),
    }));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Church Details</h1>
      <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 shadow-sm max-w-2xl space-y-4">
        <ImageUpload label="Church Logo" value={form.logo_url} onChange={set("logo_url")} />
        <FormField label="Name" name="name" value={form.name} onChange={set("name")} required />
        <FormField label="Slug" name="slug" value={form.slug} onChange={set("slug")} required />
        <FormField label="Locale" name="locale" value={form.locale} onChange={set("locale")} />
        <GooglePlacesInput
          value={form.address}
          onChange={set("address")}
          onPlaceSelect={handlePlaceSelect}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Latitude" name="lat" value={form.lat} onChange={set("lat")} />
          <FormField label="Longitude" name="lng" value={form.lng} onChange={set("lng")} />
        </div>

        {/* Theme Colors */}
        <div className="border-t pt-4 mt-4">
          <h2 className="text-lg font-semibold mb-3">Theme Colors</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Primary Color (Accent)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.primary_color}
                  onChange={(e) => set("primary_color")(e.target.value)}
                  className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={form.primary_color}
                  onChange={(e) => set("primary_color")(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono"
                  maxLength={7}
                  placeholder="#C0DF16"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Heading Color (Titles)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.heading_color}
                  onChange={(e) => set("heading_color")(e.target.value)}
                  className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={form.heading_color}
                  onChange={(e) => set("heading_color")(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono"
                  maxLength={7}
                  placeholder="#242121"
                />
              </div>
            </div>
          </div>
          {/* Preview */}
          <div className="mt-4 p-4 rounded-xl border border-gray-100" style={{ backgroundColor: form.heading_color }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: form.primary_color }}>
              Preview
            </p>
            <p className="text-sm text-white/80">
              This is how cards will look with these colors.
            </p>
          </div>
        </div>

        {/* About */}
        <div className="border-t pt-4 mt-4">
          <h2 className="text-lg font-semibold mb-3">About / Description</h2>
          <FormField label="About Text" value={form.about_text} onChange={set("about_text")} type="textarea" />
        </div>

        {/* Donation URL */}
        <div className="border-t pt-4 mt-4">
          <h2 className="text-lg font-semibold mb-3">Donations</h2>
          <FormField label="Donation URL" value={form.donation_url} onChange={set("donation_url")} placeholder="https://..." />
        </div>

        {/* Service Times */}
        <div className="border-t pt-4 mt-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Service Times</h2>
            <button
              type="button"
              onClick={() => setForm(p => ({ ...p, service_times: [...p.service_times, { day: "", time: "", label: "" }] }))}
              className="text-sm text-[var(--color-primary)] font-semibold"
            >
              + Add
            </button>
          </div>
          {form.service_times.map((st, i) => (
            <div key={i} className="grid grid-cols-4 gap-2 mb-2">
              <input
                type="text" placeholder="Label (e.g. Sunday Worship)" value={st.label}
                onChange={e => { const arr = [...form.service_times]; arr[i] = { ...arr[i], label: e.target.value }; setForm(p => ({ ...p, service_times: arr })); }}
                className="px-3 py-2 border rounded-lg text-sm col-span-2"
              />
              <input
                type="text" placeholder="Day" value={st.day}
                onChange={e => { const arr = [...form.service_times]; arr[i] = { ...arr[i], day: e.target.value }; setForm(p => ({ ...p, service_times: arr })); }}
                className="px-3 py-2 border rounded-lg text-sm"
              />
              <div className="flex gap-1">
                <input
                  type="text" placeholder="Time" value={st.time}
                  onChange={e => { const arr = [...form.service_times]; arr[i] = { ...arr[i], time: e.target.value }; setForm(p => ({ ...p, service_times: arr })); }}
                  className="flex-1 px-3 py-2 border rounded-lg text-sm"
                />
                <button type="button" onClick={() => { const arr = form.service_times.filter((_, j) => j !== i); setForm(p => ({ ...p, service_times: arr })); }} className="text-red-400 text-sm px-2">x</button>
              </div>
            </div>
          ))}
        </div>

        {/* Social Links */}
        <div className="border-t pt-4 mt-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Social Links</h2>
            <button
              type="button"
              onClick={() => setForm(p => ({ ...p, social_links: [...p.social_links, { platform: "", url: "" }] }))}
              className="text-sm text-[var(--color-primary)] font-semibold"
            >
              + Add
            </button>
          </div>
          {form.social_links.map((sl, i) => (
            <div key={i} className="grid grid-cols-3 gap-2 mb-2">
              <select
                value={sl.platform}
                onChange={e => { const arr = [...form.social_links]; arr[i] = { ...arr[i], platform: e.target.value }; setForm(p => ({ ...p, social_links: arr })); }}
                className="px-3 py-2 border rounded-lg text-sm"
              >
                <option value="">Platform</option>
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="youtube">YouTube</option>
                <option value="twitter">Twitter / X</option>
                <option value="tiktok">TikTok</option>
                <option value="website">Website</option>
              </select>
              <div className="col-span-2 flex gap-1">
                <input
                  type="url" placeholder="https://..." value={sl.url}
                  onChange={e => { const arr = [...form.social_links]; arr[i] = { ...arr[i], url: e.target.value }; setForm(p => ({ ...p, social_links: arr })); }}
                  className="flex-1 px-3 py-2 border rounded-lg text-sm"
                />
                <button type="button" onClick={() => { const arr = form.social_links.filter((_, j) => j !== i); setForm(p => ({ ...p, social_links: arr })); }} className="text-red-400 text-sm px-2">x</button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 text-sm font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
            style={{ backgroundColor: form.primary_color, color: form.heading_color }}
          >
            {loading ? "Saving..." : "Save"}
          </button>
          {saved && <span className="text-sm text-green-600">Saved!</span>}
        </div>
      </form>
    </div>
  );
}
