import RequireRole from "@/components/RequireRole";

export default function BibliaLayout({ children }: { children: React.ReactNode }) {
  return <RequireRole role="admin">{children}</RequireRole>;
}
