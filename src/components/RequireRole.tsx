"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { hasMinRole } from "@/lib/permissions";

interface RequireRoleProps {
  role: string;
  /** If true, requires is_super_admin instead of church role */
  superAdmin?: boolean;
  children: React.ReactNode;
}

export default function RequireRole({ role, superAdmin, children }: RequireRoleProps) {
  const { church, user, isLoading } = useAuth();
  const router = useRouter();

  const hasAccess = superAdmin
    ? user?.is_super_admin === true
    : hasMinRole(church?.role, role);

  useEffect(() => {
    if (!isLoading && !hasAccess) {
      router.push("/dashboard");
    }
  }, [isLoading, hasAccess, router]);

  if (isLoading || !hasAccess) return null;

  return <>{children}</>;
}
