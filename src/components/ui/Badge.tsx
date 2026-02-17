const variants = {
  success: "bg-green-50 text-green-700",
  warning: "bg-yellow-50 text-yellow-700",
  danger: "bg-red-50 text-red-600",
  muted: "bg-gray-100 text-gray-500",
  info: "bg-blue-50 text-blue-700",
} as const;

interface BadgeProps {
  variant?: keyof typeof variants;
  children: React.ReactNode;
  className?: string;
}

export default function Badge({
  variant = "muted",
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
