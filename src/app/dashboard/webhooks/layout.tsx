import RequireRole from "@/components/RequireRole";

export default function WebhooksLayout({ children }: { children: React.ReactNode }) {
  return <RequireRole role="admin">{children}</RequireRole>;
}
