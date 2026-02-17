"use client";

import { useState } from "react";
import useApi from "@/hooks/useApi";
import useSubmit from "@/hooks/useSubmit";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { useAuth } from "@/contexts/auth-context";
import { hasMinRole } from "@/lib/permissions";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  read: boolean;
  created_at: string;
}

export default function ContactMessagesPage() {
  const { church } = useAuth();
  const canEdit = hasMinRole(church?.role, "editor");

  const { data, loading, page, totalPages, setPage, refetch } = useApi<ContactMessage>("/contact-messages");
  const { submit, loading: saving } = useSubmit();
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  const openDetail = (row: unknown) => {
    const r = row as ContactMessage;
    setSelected(r);
    setModalOpen(true);
  };

  const handleDelete = async (row: unknown) => {
    const r = row as ContactMessage;
    await submit(`/contact-messages/${r.id}`, { method: "DELETE" });
    refetch();
  };

  const handleMarkRead = async () => {
    if (!selected) return;
    const res = await submit(`/contact-messages/${selected.id}`, {
      method: "PUT",
      body: { read: true },
    });
    if (res) {
      setSelected((prev) => (prev ? { ...prev, read: true } : prev));
      refetch();
    }
  };

  const columns = [
    {
      key: "name",
      label: "Name",
      render: (v: unknown) => (v as string) || "—",
    },
    {
      key: "subject",
      label: "Subject",
      hideOnMobile: true,
      render: (v: unknown) => (v as string) || "—",
    },
    {
      key: "email",
      label: "Email",
      hideOnMobile: true,
      render: (v: unknown) => (v as string) || "—",
    },
    {
      key: "read",
      label: "Status",
      render: (v: unknown) => (
        <Badge variant={v ? "success" : "warning"}>
          {v ? "Read" : "Unread"}
        </Badge>
      ),
    },
    {
      key: "created_at",
      label: "Date",
      hideOnMobile: true,
      render: (v: unknown) => (v ? new Date(v as string).toLocaleDateString("en") : ""),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-bold">Contact Messages</h1>
      </div>

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        onEdit={openDetail}
        onDelete={canEdit ? handleDelete : undefined}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyTitle="No messages yet"
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Message Details"
      >
        {selected && (
          <div className="space-y-4">
            {/* Status badge */}
            <div className="flex items-center gap-2">
              <Badge variant={selected.read ? "success" : "warning"}>
                {selected.read ? "Read" : "Unread"}
              </Badge>
              {selected.created_at && (
                <span className="text-xs text-gray-400">
                  {new Date(selected.created_at).toLocaleString("en")}
                </span>
              )}
            </div>

            {/* Detail fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Name</label>
                <p className="text-sm text-gray-800">{selected.name || "—"}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Email</label>
                <p className="text-sm text-gray-800">
                  <a href={`mailto:${selected.email}`} className="text-[var(--color-primary)] hover:underline">
                    {selected.email}
                  </a>
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Phone</label>
                <p className="text-sm text-gray-800">{selected.phone || "—"}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Subject</label>
                <p className="text-sm text-gray-800">{selected.subject || "—"}</p>
              </div>
            </div>

            {/* Message body */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Message</label>
              <div className="p-3 bg-gray-50 rounded-xl text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {selected.message}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-gray-100">
              {!selected.read && (
                <Button
                  onClick={handleMarkRead}
                  loading={saving}
                  className="flex-1"
                >
                  Mark as Read
                </Button>
              )}
              <Button
                variant="secondary"
                onClick={() => setModalOpen(false)}
                className={selected.read ? "w-full" : "flex-1"}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
