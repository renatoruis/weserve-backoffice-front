/**
 * Converts a date string (ISO or yyyy-MM-dd) to the format required by HTML date inputs (yyyy-MM-dd).
 * Handles backend responses like "2025-02-12T00:00:00.000Z" which would otherwise show empty in <input type="date" />
 */
export function toDateInputValue(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  return String(dateStr).slice(0, 10);
}
