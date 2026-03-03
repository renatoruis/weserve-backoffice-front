"use client";

import { useAuth } from "@/contexts/auth-context";

interface HeaderProps {
  onMenuToggle: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const { user, church, signOut } = useAuth();

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 shrink-0">
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuToggle}
        className="md:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700"
        aria-label="Toggle menu"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Church name — desktop */}
      <div className="hidden md:block text-sm font-medium text-gray-600">
        {church?.name ?? "Church App"}
      </div>

      {/* user */}
      <div className="flex items-center gap-3">
        {user?.is_super_admin && (
          <span className="text-[10px] font-bold uppercase tracking-wide bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
            Super Admin
          </span>
        )}
        <span className="hidden sm:inline text-sm text-gray-500">
          {user?.name || user?.email}
        </span>
        {user?.picture && (
          <img
            src={user.picture}
            alt=""
            className="w-8 h-8 rounded-full"
          />
        )}
        <button
          onClick={signOut}
          className="text-xs text-red-500 hover:text-red-700 font-medium ml-1 cursor-pointer"
        >
          Sair
        </button>
      </div>
    </header>
  );
}
