"use client";

import { useState, useMemo } from "react";
import useApi from "@/hooks/useApi";
import useSubmit from "@/hooks/useSubmit";
import I18nField from "@/components/I18nField";
import { InputField } from "@/components/ui/Input";
import ImageUpload from "@/components/ImageUpload";
import Button from "@/components/ui/Button";
import { useAuth } from "@/contexts/auth-context";
import { hasMinRole } from "@/lib/permissions";
import BackButton from "@/components/ui/BackButton";

interface MediaItem {
  id: string;
  url: string;
  filename: string;
  mime_type: string;
  folder: string | null;
  alt_text_i18n: { en: string; pt: string };
  created_at: string;
}

type ViewMode = "browse" | "upload" | "detail";

function isImage(mimeType: string) {
  return mimeType.startsWith("image/");
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-200 rounded-xl aspect-square" />
          <div className="mt-2 h-3 bg-gray-200 rounded w-3/4" />
        </div>
      ))}
    </div>
  );
}

function FileIcon() {
  return (
    <div className="w-full aspect-square bg-gray-100 rounded-xl flex items-center justify-center">
      <svg
        className="w-10 h-10 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      </svg>
    </div>
  );
}

/* ── BackButton ── */


export default function MediaPage() {
  const { church } = useAuth();
  const canEdit = hasMinRole(church?.role, "editor");

  const [search, setSearch] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>("browse");
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  // Build dynamic URL with query params
  const apiUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (selectedFolder) params.set("folder", selectedFolder);
    const qs = params.toString();
    return `/media${qs ? `?${qs}` : ""}`;
  }, [search, selectedFolder]);

  const { data, loading, refetch } = useApi<MediaItem>(apiUrl);
  const { submit, loading: saving } = useSubmit();

  // Extract unique folders from data
  const folders = useMemo(() => {
    const set = new Set<string>();
    data.forEach((item) => {
      if (item.folder) set.add(item.folder);
    });
    return Array.from(set).sort();
  }, [data]);

  // Detail view state
  const [editAlt, setEditAlt] = useState<{ en: string; pt: string }>({
    en: "",
    pt: "",
  });

  const openDetail = (item: MediaItem) => {
    setSelectedMedia(item);
    setEditAlt(item.alt_text_i18n || { en: "", pt: "" });
    setView("detail");
  };

  const handleSaveAlt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedia) return;
    const res = await submit(`/media/${selectedMedia.id}`, {
      method: "PUT",
      body: { alt_text_i18n: editAlt },
    });
    if (res) {
      setSelectedMedia(null);
      setView("browse");
      refetch();
    }
  };

  const handleDeleteMedia = async () => {
    if (!selectedMedia) return;
    if (!confirm("Tem a certeza que quer apagar este item?")) return;
    const res = await submit(`/media/${selectedMedia.id}`, {
      method: "DELETE",
    });
    if (res) {
      setSelectedMedia(null);
      setView("browse");
      refetch();
    }
  };

  // Upload state
  const [uploadUrl, setUploadUrl] = useState("");
  const [uploadAlt, setUploadAlt] = useState<{ en: string; pt: string }>({
    en: "",
    pt: "",
  });
  const [uploadFolder, setUploadFolder] = useState("");

  const openUpload = () => {
    setUploadUrl("");
    setUploadAlt({ en: "", pt: "" });
    setUploadFolder("");
    setView("upload");
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadUrl) return;
    const res = await submit("/media", {
      method: "POST",
      body: {
        url: uploadUrl,
        alt_text_i18n: uploadAlt,
        folder: uploadFolder || null,
      },
    });
    if (res) {
      setView("browse");
      refetch();
    }
  };

  const goBack = () => {
    setView("browse");
    setSelectedMedia(null);
  };

  /* ── Upload full page view ── */
  if (view === "upload") {
    return (
      <div>
        <BackButton onClick={goBack} />
        <h1 className="text-xl md:text-2xl font-bold mb-6">Upload Media</h1>
        <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm max-w-3xl space-y-4">
          <form onSubmit={handleUpload} className="space-y-4">
            <ImageUpload
              label="File"
              value={uploadUrl}
              onChange={(url) => setUploadUrl(url)}
            />
            <I18nField
              label="Alt Text"
              value={uploadAlt}
              onChange={(v) => setUploadAlt(v)}
            />
            <InputField
              label="Folder"
              placeholder="e.g. banners, gallery, icons"
              value={uploadFolder}
              onChange={(v) => setUploadFolder(v)}
            />
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={goBack}>Cancelar</Button>
              <Button type="submit" loading={saving} disabled={!uploadUrl}>
                Upload
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  /* ── Detail / edit full page view ── */
  if (view === "detail" && selectedMedia) {
    return (
      <div>
        <BackButton onClick={goBack} />
        <h1 className="text-xl md:text-2xl font-bold mb-6">Media Details</h1>
        <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm max-w-3xl space-y-4">
          <form onSubmit={handleSaveAlt} className="space-y-4">
            {/* Preview */}
            {isImage(selectedMedia.mime_type) ? (
              <img
                src={selectedMedia.url}
                alt={selectedMedia.alt_text_i18n?.pt || selectedMedia.filename}
                className="w-full h-48 object-contain rounded-xl bg-gray-50 border border-gray-200"
              />
            ) : (
              <div className="w-full h-48 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center">
                <svg
                  className="w-16 h-16 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}

            {/* Info */}
            <div className="space-y-2 text-sm">
              <div className="flex items-start justify-between gap-2">
                <span className="text-gray-400 font-medium shrink-0">
                  Filename
                </span>
                <span className="text-gray-800 text-right break-all">
                  {selectedMedia.filename}
                </span>
              </div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-gray-400 font-medium shrink-0">
                  Type
                </span>
                <span className="text-gray-800">{selectedMedia.mime_type}</span>
              </div>
              {selectedMedia.folder && (
                <div className="flex items-start justify-between gap-2">
                  <span className="text-gray-400 font-medium shrink-0">
                    Folder
                  </span>
                  <span className="text-gray-800">
                    {selectedMedia.folder}
                  </span>
                </div>
              )}
              <div className="flex items-start justify-between gap-2">
                <span className="text-gray-400 font-medium shrink-0">
                  Created
                </span>
                <span className="text-gray-800">
                  {new Date(selectedMedia.created_at).toLocaleDateString("en")}
                </span>
              </div>
            </div>

            {/* Alt text */}
            <I18nField
              label="Alt Text"
              value={editAlt}
              onChange={(v) => setEditAlt(v)}
            />

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={goBack}>Cancelar</Button>
              {canEdit && (
                <Button type="submit" loading={saving}>Guardar</Button>
              )}
              {canEdit && (
                <Button
                  type="button"
                  variant="danger"
                  onClick={handleDeleteMedia}
                  disabled={saving}
                >Apagar</Button>
              )}
            </div>
          </form>
        </div>
      </div>
    );
  }

  /* ── Browse grid view ── */
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-bold">Media Library</h1>
        {canEdit && <Button onClick={openUpload}>+ Upload</Button>}
      </div>

      {/* Search bar */}
      <div className="mb-4">
        <InputField
          placeholder="Search files..."
          value={search}
          onChange={(v) => setSearch(v)}
        />
      </div>

      {/* Folder filter */}
      {folders.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedFolder(null)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              selectedFolder === null
                ? "bg-[var(--color-primary)] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          {folders.map((folder) => (
            <button
              key={folder}
              onClick={() =>
                setSelectedFolder(selectedFolder === folder ? null : folder)
              }
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                selectedFolder === folder
                  ? "bg-[var(--color-primary)] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {folder}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <SkeletonGrid />
      ) : data.length === 0 ? (
        <div className="text-center py-16">
          <svg
            className="w-12 h-12 text-gray-300 mx-auto mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-gray-400 text-sm font-medium">No media found</p>
          <p className="text-gray-300 text-xs mt-1">
            Upload your first file to get started
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {data.map((item) => (
            <button
              key={item.id}
              onClick={() => openDetail(item)}
              className="text-left group focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 rounded-xl transition-all"
            >
              {isImage(item.mime_type) ? (
                <div className="w-full aspect-square rounded-xl overflow-hidden border border-gray-200 group-hover:border-gray-300 transition-colors">
                  <img
                    src={item.url}
                    alt={item.alt_text_i18n?.pt || item.filename}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
              ) : (
                <FileIcon />
              )}
              <p className="mt-2 text-xs text-gray-600 truncate font-medium">
                {item.filename}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
