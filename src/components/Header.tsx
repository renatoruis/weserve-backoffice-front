interface HeaderProps {
  user: {
    name?: string;
    email?: string;
    picture?: string;
  };
}

export default function Header({ user }: HeaderProps) {
  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      <div />
      <div className="flex items-center gap-3">
        <span className="text-sm text-[var(--color-text-muted)]">
          {user.name || user.email}
        </span>
        {user.picture && (
          <img
            src={user.picture}
            alt="Avatar"
            className="w-8 h-8 rounded-full"
          />
        )}
        <a
          href="/auth/logout"
          className="text-xs text-red-500 hover:text-red-700 font-medium ml-2"
        >
          Logout
        </a>
      </div>
    </header>
  );
}
