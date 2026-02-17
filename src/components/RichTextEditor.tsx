"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

declare global {
  interface Window {
    Quill: any;
  }
}

let quillLoaded = false;
let quillLoadingPromise: Promise<void> | null = null;

function loadQuill(): Promise<void> {
  if (quillLoaded && window.Quill) return Promise.resolve();
  if (quillLoadingPromise) return quillLoadingPromise;

  quillLoadingPromise = new Promise((resolve) => {
    if (!document.querySelector('link[href*="quill.snow.css"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.snow.css";
      document.head.appendChild(link);
    }

    if (window.Quill) {
      quillLoaded = true;
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.js";
    script.onload = () => {
      quillLoaded = true;
      resolve();
    };
    document.body.appendChild(script);
  });

  return quillLoadingPromise;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<any>(null);
  const isInternalChange = useRef(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadQuill().then(() => setReady(true));
  }, []);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!ready || !editorRef.current || quillRef.current) return;

    const q = new window.Quill(editorRef.current, {
      theme: "snow",
      placeholder: placeholder || "Write content...",
      modules: {
        toolbar: [
          [{ header: [2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["blockquote", "link", "image"],
          [{ align: [] }],
          ["clean"],
        ],
      },
    });

    if (value) {
      q.root.innerHTML = value;
    }

    q.on("text-change", () => {
      isInternalChange.current = true;
      const html = q.root.innerHTML;
      onChangeRef.current(html === "<p><br></p>" ? "" : html);
    });

    quillRef.current = q;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  useEffect(() => {
    if (!quillRef.current) return;
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    const current = quillRef.current.root.innerHTML;
    const normalized = value || "";
    if (current !== normalized) {
      quillRef.current.root.innerHTML = normalized;
    }
  }, [value]);

  if (!ready) {
    return (
      <div className="w-full h-[200px] bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center text-sm text-gray-400">
        Loading editor...
      </div>
    );
  }

  return (
    <div className="rich-text-editor">
      <div ref={editorRef} />
      <style jsx global>{`
        .rich-text-editor .ql-toolbar {
          border-top-left-radius: 0.75rem;
          border-top-right-radius: 0.75rem;
          border-color: #e5e7eb;
          background: #f9fafb;
        }
        .rich-text-editor .ql-container {
          border-bottom-left-radius: 0.75rem;
          border-bottom-right-radius: 0.75rem;
          border-color: #e5e7eb;
          min-height: 200px;
          font-size: 0.875rem;
        }
        .rich-text-editor .ql-editor {
          min-height: 200px;
        }
        .rich-text-editor .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }
      `}</style>
    </div>
  );
}
