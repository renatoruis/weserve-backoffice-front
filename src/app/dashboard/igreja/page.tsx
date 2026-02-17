"use client";

import { useState, useEffect, useRef } from "react";
import useAuthFetch from "@/hooks/useAuthFetch";
import useSubmit from "@/hooks/useSubmit";
import { InputField, TextArea } from "@/components/ui/Input";
import I18nField from "@/components/I18nField";
import GooglePlacesInput from "@/components/GooglePlacesInput";
import ImageUpload from "@/components/ImageUpload";
import GoogleFontPicker from "@/components/GoogleFontPicker";
import Button from "@/components/ui/Button";
import { SkeletonCard } from "@/components/ui/Skeleton";

export default function IgrejaPage() {
  const { adminFetch } = useAuthFetch();
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
    // Contact
    phone: "",
    email: "",
    // Theme Colors (extended)
    background_color: "#FFFFFF",
    accent_color: "#C0DF16",
    text_color: "#242121",
    footer_bg_color: "#242121",
    footer_text_color: "#FFFFFF",
    // Typography
    font_heading: "",
    font_body: "",
    font_size_base: "16",
    // SEO
    favicon_url: "",
    og_image_url: "",
    robots_txt: "",
    // Analytics
    ga_measurement_id: "",
    fb_pixel_id: "",
    gtm_id: "",
    // Footer
    copyright_text: "",
    footer_extra_html: "",
    // GDPR
    privacy_policy_url: "",
    cookie_banner_active: false,
    cookie_banner_text_i18n: { en: "", pt: "" },
    // Custom Code
    custom_css: "",
    custom_head_scripts: "",
    custom_body_scripts: "",
    // Notifications
    notification_email: "",
    notification_events: "",
  });
  const [pageLoading, setPageLoading] = useState(true);
  const { submit, loading: saving, error: submitError } = useSubmit();
  const [saved, setSaved] = useState(false);

  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    adminFetch("/churches")
      .then((r) => r.json())
      .then((data) => {
        // API returns a single church object (or legacy array)
        const c = Array.isArray(data) ? data[0] : data;
        if (c) {
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
            // Contact
            phone: c.phone || "",
            email: c.email || "",
            // Theme Colors (extended)
            background_color: c.background_color || "#FFFFFF",
            accent_color: c.accent_color || "#C0DF16",
            text_color: c.text_color || "#242121",
            footer_bg_color: c.footer_bg_color || "#242121",
            footer_text_color: c.footer_text_color || "#FFFFFF",
            // Typography
            font_heading: c.font_heading || "",
            font_body: c.font_body || "",
            font_size_base: c.font_size_base?.toString() || "16",
            // SEO
            favicon_url: c.favicon_url || "",
            og_image_url: c.og_image_url || "",
            robots_txt: c.robots_txt || "",
            // Analytics
            ga_measurement_id: c.ga_measurement_id || "",
            fb_pixel_id: c.fb_pixel_id || "",
            gtm_id: c.gtm_id || "",
            // Footer
            copyright_text: c.copyright_text || "",
            footer_extra_html: c.footer_extra_html || "",
            // GDPR
            privacy_policy_url: c.privacy_policy_url || "",
            cookie_banner_active: c.cookie_banner_active || false,
            cookie_banner_text_i18n: c.cookie_banner_text_i18n || { en: "", pt: "" },
            // Custom Code
            custom_css: c.custom_css || "",
            custom_head_scripts: c.custom_head_scripts || "",
            custom_body_scripts: c.custom_body_scripts || "",
            // Notifications
            notification_email: c.notification_email || "",
            notification_events: Array.isArray(c.notification_events) ? c.notification_events.join(", ") : c.notification_events || "",
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

    // Build body — only include non-empty values (avoid sending null for string fields)
    const body: Record<string, unknown> = {
      name: form.name,
      slug: form.slug,
      locale: form.locale,
      primary_color: form.primary_color,
      heading_color: form.heading_color,
      service_times: form.service_times,
      social_links: form.social_links,
      cookie_banner_active: form.cookie_banner_active,
      cookie_banner_text_i18n: form.cookie_banner_text_i18n,
      notification_events: form.notification_events
        ? form.notification_events.split(",").map((v) => v.trim()).filter(Boolean)
        : [],
    };

    // Optional string fields — only include if non-empty
    const optionalStrings: Record<string, string> = {
      address: form.address,
      logo_url: form.logo_url,
      about_text: form.about_text,
      donation_url: form.donation_url,
      phone: form.phone,
      email: form.email,
      background_color: form.background_color,
      accent_color: form.accent_color,
      text_color: form.text_color,
      footer_bg_color: form.footer_bg_color,
      footer_text_color: form.footer_text_color,
      font_heading: form.font_heading,
      font_body: form.font_body,
      favicon_url: form.favicon_url,
      og_image_url: form.og_image_url,
      robots_txt: form.robots_txt,
      ga_measurement_id: form.ga_measurement_id,
      fb_pixel_id: form.fb_pixel_id,
      gtm_id: form.gtm_id,
      copyright_text: form.copyright_text,
      footer_extra_html: form.footer_extra_html,
      privacy_policy_url: form.privacy_policy_url,
      custom_css: form.custom_css,
      custom_head_scripts: form.custom_head_scripts,
      custom_body_scripts: form.custom_body_scripts,
      notification_email: form.notification_email,
    };

    for (const [key, val] of Object.entries(optionalStrings)) {
      if (val) body[key] = val;
    }

    // Optional numbers
    if (form.lat) body.lat = parseFloat(form.lat);
    if (form.lng) body.lng = parseFloat(form.lng);
    if (form.font_size_base) body.font_size_base = Number(form.font_size_base);

    const res = await submit("/churches", { method: "PUT", body });
    if (res) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const set = (key: string) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const ColorField = ({ label, colorKey }: { label: string; colorKey: string }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={(form as Record<string, unknown>)[colorKey] as string}
          onChange={(e) => set(colorKey)(e.target.value)}
          className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
        />
        <input
          type="text"
          value={(form as Record<string, unknown>)[colorKey] as string}
          onChange={(e) => set(colorKey)(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono"
          maxLength={7}
        />
      </div>
    </div>
  );

  if (pageLoading) {
    return (
      <div>
        <h1 className="text-xl md:text-2xl font-bold mb-6">Church Details</h1>
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl md:text-2xl font-bold mb-6">Church Details</h1>
      <form onSubmit={handleSave} className="bg-white rounded-2xl p-4 md:p-6 shadow-sm max-w-2xl space-y-4">
        <ImageUpload label="Church Logo" value={form.logo_url} onChange={set("logo_url")} />
        <InputField label="Name" value={form.name} onChange={set("name")} required />
        <InputField label="Slug" value={form.slug} onChange={set("slug")} required />
        <InputField label="Locale" value={form.locale} onChange={set("locale")} />
        <GooglePlacesInput
          value={form.address}
          onChange={set("address")}
          onPlaceSelect={(place) => setForm((p) => ({ ...p, address: place.address, lat: place.lat.toString(), lng: place.lng.toString() }))}
        />
        <div className="grid grid-cols-2 gap-4">
          <InputField label="Latitude" value={form.lat} onChange={set("lat")} />
          <InputField label="Longitude" value={form.lng} onChange={set("lng")} />
        </div>

        {/* Contact */}
        <div className="border-t pt-4 mt-4">
          <h2 className="text-base font-semibold mb-3">Contact</h2>
          <div className="space-y-4">
            <InputField label="Phone" value={form.phone} onChange={set("phone")} placeholder="+1 555 1234" />
            <InputField label="Email" type="email" value={form.email} onChange={set("email")} placeholder="contact@church.com" />
          </div>
        </div>

        {/* Theme Colors */}
        <div className="border-t pt-4 mt-4">
          <h2 className="text-base font-semibold mb-3">Theme Colors</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ColorField label="Primary Color" colorKey="primary_color" />
            <ColorField label="Heading Color" colorKey="heading_color" />
            <ColorField label="Background Color" colorKey="background_color" />
            <ColorField label="Accent Color" colorKey="accent_color" />
            <ColorField label="Text Color" colorKey="text_color" />
            <ColorField label="Footer BG Color" colorKey="footer_bg_color" />
            <ColorField label="Footer Text Color" colorKey="footer_text_color" />
          </div>
          <div className="mt-4 p-4 rounded-xl border border-gray-100" style={{ backgroundColor: form.heading_color }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: form.primary_color }}>Preview</p>
            <p className="text-sm text-white/80">This is how cards will look with these colors.</p>
          </div>
        </div>

        {/* Typography */}
        <div className="border-t pt-4 mt-4">
          <h2 className="text-base font-semibold mb-3">Typography</h2>
          <div className="space-y-4">
            <GoogleFontPicker
              label="Heading Font"
              value={form.font_heading}
              onChange={set("font_heading")}
              placeholder="Select heading font..."
            />
            <GoogleFontPicker
              label="Body Font"
              value={form.font_body}
              onChange={set("font_body")}
              placeholder="Select body font..."
            />
            <InputField label="Base Font Size (px)" type="number" value={form.font_size_base} onChange={set("font_size_base")} />
          </div>
        </div>

        {/* About */}
        <div className="border-t pt-4 mt-4">
          <h2 className="text-base font-semibold mb-3">About / Description</h2>
          <TextArea label="About Text" value={form.about_text} onChange={set("about_text")} rows={4} />
        </div>

        {/* Donation URL */}
        <div className="border-t pt-4 mt-4">
          <h2 className="text-base font-semibold mb-3">Donations</h2>
          <InputField label="Donation URL" value={form.donation_url} onChange={set("donation_url")} placeholder="https://..." />
        </div>

        {/* SEO */}
        <div className="border-t pt-4 mt-4">
          <h2 className="text-base font-semibold mb-3">SEO</h2>
          <div className="space-y-4">
            <ImageUpload label="Favicon" value={form.favicon_url} onChange={set("favicon_url")} />
            <ImageUpload label="OG Image" value={form.og_image_url} onChange={set("og_image_url")} />
            <TextArea label="robots.txt" value={form.robots_txt} onChange={set("robots_txt")} rows={3} />
          </div>
        </div>

        {/* Analytics */}
        <div className="border-t pt-4 mt-4">
          <h2 className="text-base font-semibold mb-3">Analytics</h2>
          <div className="space-y-4">
            <InputField label="GA Measurement ID" value={form.ga_measurement_id} onChange={set("ga_measurement_id")} placeholder="G-XXXXXXXXXX" />
            <InputField label="Facebook Pixel ID" value={form.fb_pixel_id} onChange={set("fb_pixel_id")} placeholder="123456789" />
            <InputField label="GTM ID" value={form.gtm_id} onChange={set("gtm_id")} placeholder="GTM-XXXXXXX" />
          </div>
        </div>

        {/* Service Times */}
        <div className="border-t pt-4 mt-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">Service Times</h2>
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, service_times: [...p.service_times, { day: "", time: "", label: "" }] }))}
              className="text-sm text-[var(--color-primary)] font-semibold"
            >
              + Add
            </button>
          </div>
          {form.service_times.map((st, i) => (
            <div key={i} className="grid grid-cols-4 gap-2 mb-2">
              <input type="text" placeholder="Label" value={st.label} onChange={(e) => { const arr = [...form.service_times]; arr[i] = { ...arr[i], label: e.target.value }; setForm((p) => ({ ...p, service_times: arr })); }} className="px-3 py-2 border rounded-lg text-sm col-span-2" />
              <input type="text" placeholder="Day" value={st.day} onChange={(e) => { const arr = [...form.service_times]; arr[i] = { ...arr[i], day: e.target.value }; setForm((p) => ({ ...p, service_times: arr })); }} className="px-3 py-2 border rounded-lg text-sm" />
              <div className="flex gap-1">
                <input type="text" placeholder="Time" value={st.time} onChange={(e) => { const arr = [...form.service_times]; arr[i] = { ...arr[i], time: e.target.value }; setForm((p) => ({ ...p, service_times: arr })); }} className="flex-1 px-3 py-2 border rounded-lg text-sm" />
                <button type="button" onClick={() => setForm((p) => ({ ...p, service_times: p.service_times.filter((_, j) => j !== i) }))} className="text-red-400 text-sm px-2">x</button>
              </div>
            </div>
          ))}
        </div>

        {/* Social Links */}
        <div className="border-t pt-4 mt-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">Social Links</h2>
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, social_links: [...p.social_links, { platform: "", url: "" }] }))}
              className="text-sm text-[var(--color-primary)] font-semibold"
            >
              + Add
            </button>
          </div>
          {form.social_links.map((sl, i) => (
            <div key={i} className="grid grid-cols-3 gap-2 mb-2">
              <select value={sl.platform} onChange={(e) => { const arr = [...form.social_links]; arr[i] = { ...arr[i], platform: e.target.value }; setForm((p) => ({ ...p, social_links: arr })); }} className="px-3 py-2 border rounded-lg text-sm">
                <option value="">Platform</option>
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="youtube">YouTube</option>
                <option value="twitter">Twitter / X</option>
                <option value="tiktok">TikTok</option>
                <option value="website">Website</option>
              </select>
              <div className="col-span-2 flex gap-1">
                <input type="url" placeholder="https://..." value={sl.url} onChange={(e) => { const arr = [...form.social_links]; arr[i] = { ...arr[i], url: e.target.value }; setForm((p) => ({ ...p, social_links: arr })); }} className="flex-1 px-3 py-2 border rounded-lg text-sm" />
                <button type="button" onClick={() => setForm((p) => ({ ...p, social_links: p.social_links.filter((_, j) => j !== i) }))} className="text-red-400 text-sm px-2">x</button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t pt-4 mt-4">
          <h2 className="text-base font-semibold mb-3">Footer</h2>
          <div className="space-y-4">
            <InputField label="Copyright Text" value={form.copyright_text} onChange={set("copyright_text")} placeholder="© 2026 Your Church. All rights reserved." />
            <TextArea label="Footer Extra HTML" value={form.footer_extra_html} onChange={set("footer_extra_html")} rows={3} />
          </div>
        </div>

        {/* GDPR */}
        <div className="border-t pt-4 mt-4">
          <h2 className="text-base font-semibold mb-3">GDPR / Privacy</h2>
          <div className="space-y-4">
            <InputField label="Privacy Policy URL" value={form.privacy_policy_url} onChange={set("privacy_policy_url")} placeholder="https://..." />
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.cookie_banner_active}
                onChange={(e) => setForm((p) => ({ ...p, cookie_banner_active: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
              />
              Cookie Banner Active
            </label>
            <I18nField
              label="Cookie Banner Text"
              value={form.cookie_banner_text_i18n}
              onChange={(v) => setForm((p) => ({ ...p, cookie_banner_text_i18n: v }))}
              rows={2}
            />
          </div>
        </div>

        {/* Custom Code */}
        <div className="border-t pt-4 mt-4">
          <h2 className="text-base font-semibold mb-3">Custom Code</h2>
          <div className="space-y-4">
            <TextArea label="Custom CSS" value={form.custom_css} onChange={set("custom_css")} rows={4} />
            <TextArea label="Custom Head Scripts" value={form.custom_head_scripts} onChange={set("custom_head_scripts")} rows={3} />
            <TextArea label="Custom Body Scripts" value={form.custom_body_scripts} onChange={set("custom_body_scripts")} rows={3} />
          </div>
        </div>

        {/* Notifications */}
        <div className="border-t pt-4 mt-4">
          <h2 className="text-base font-semibold mb-3">Notifications</h2>
          <div className="space-y-4">
            <InputField label="Notification Email" type="email" value={form.notification_email} onChange={set("notification_email")} placeholder="admin@church.com" />
            <InputField label="Notification Events (comma separated)" value={form.notification_events} onChange={set("notification_events")} placeholder="new_member, prayer_request, donation" />
          </div>
        </div>

        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <p className="text-sm text-red-600">{submitError}</p>
          </div>
        )}

        <div className="flex items-center gap-3 pt-4">
          <Button type="submit" loading={saving} style={{ backgroundColor: form.primary_color, color: form.heading_color }}>
            Salvar
          </Button>
          {saved && <span className="text-sm text-green-600">Salvo com sucesso!</span>}
        </div>
      </form>
    </div>
  );
}
