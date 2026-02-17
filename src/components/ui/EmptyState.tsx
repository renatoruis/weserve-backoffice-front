interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({
  title = "No records found",
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="bg-white rounded-2xl p-12 text-center">
      <svg
        className="mx-auto w-12 h-12 text-gray-300 mb-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
        />
      </svg>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      {description && (
        <p className="text-xs text-gray-400 mt-1">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
