const ROLE_LEVEL: Record<string, number> = {
  owner: 40,
  admin: 30,
  editor: 20,
  member: 10,
};

export function hasMinRole(userRole: string | undefined, required: string): boolean {
  return (ROLE_LEVEL[userRole || ""] || 0) >= (ROLE_LEVEL[required] || 999);
}
