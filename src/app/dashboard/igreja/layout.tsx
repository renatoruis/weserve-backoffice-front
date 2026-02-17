import RequireRole from "@/components/RequireRole";

export default function IgrejaLayout({ children }: { children: React.ReactNode }) {
  return <RequireRole role="admin">{children}</RequireRole>;
}
