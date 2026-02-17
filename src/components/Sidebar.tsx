"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { hasMinRole } from "@/lib/permissions";

/* ── Menu structure ── */

interface MenuItem {
  href: string;
  label: string;
  icon: () => React.ReactNode;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

/* Sections visible to ALL roles */
const overviewSection: MenuSection = {
  title: "Overview",
  items: [
    { href: "/dashboard", label: "Dashboard", icon: DashboardIcon },
    { href: "/dashboard/analytics", label: "Analytics", icon: AnalyticsIcon },
  ],
};

/* Editor+ */
const contentSection: MenuSection = {
  title: "Content",
  items: [
    { href: "/dashboard/home-content", label: "Home Content", icon: HomeIcon },
    { href: "/dashboard/widgets", label: "Home Widgets", icon: WidgetsIcon },
    { href: "/dashboard/banners", label: "Banners", icon: BannersIcon },
    { href: "/dashboard/agenda", label: "Events", icon: CalendarIcon },
    { href: "/dashboard/sermoes", label: "Sermons", icon: BookIcon },
    { href: "/dashboard/avisos", label: "Notices", icon: BellIcon },
    { href: "/dashboard/blog", label: "Blog", icon: BlogIcon },
    { href: "/dashboard/blog-categories", label: "Blog Categories", icon: BlogCategoriesIcon },
    { href: "/dashboard/pages", label: "Pages", icon: PageIcon },
    { href: "/dashboard/resources", label: "Resources", icon: ResourcesIcon },
  ],
};

const communitySection: MenuSection = {
  title: "Community",
  items: [
    { href: "/dashboard/oracoes", label: "Prayers", icon: HeartIcon },
    { href: "/dashboard/contact-messages", label: "Contact Messages", icon: ContactMessagesIcon },
    { href: "/dashboard/push", label: "Push Notifications", icon: PushIcon },
  ],
};

/* Admin+ */
const managementSection: MenuSection = {
  title: "Management",
  items: [
    { href: "/dashboard/webhooks", label: "Webhooks", icon: WebhooksIcon },
  ],
};

/* Admin+ */
const settingsSection: MenuSection = {
  title: "Settings",
  items: [
    { href: "/dashboard/igreja", label: "Church", icon: ChurchIcon },
    { href: "/dashboard/biblia", label: "Bible Versions", icon: BibleIcon },
    { href: "/dashboard/media", label: "Media Library", icon: MediaLibraryIcon },
  ],
};

/* ── Component ── */

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { church } = useAuth();

  const role = church?.role ?? "admin";

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  // Build sections based on role
  const sections: MenuSection[] = [overviewSection];

  if (hasMinRole(role, "editor")) {
    sections.push(contentSection);
    sections.push(communitySection);
  }

  if (hasMinRole(role, "admin")) {
    sections.push(managementSection);
  }

  if (hasMinRole(role, "admin")) {
    sections.push(settingsSection);
  }

  const nav = (
    <>
      <div className="p-5 border-b border-white/10">
        <h1 className="text-lg font-bold tracking-tight text-white truncate">
          {church?.name || "Church App"}
        </h1>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-[11px] text-white/40">{role || "Admin Panel"}</p>
        </div>
      </div>

      <nav className="flex-1 py-3 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.title} className="mb-1">
            <p className="px-5 pt-4 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-white/30">
              {section.title}
            </p>
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-5 py-2 text-sm transition-colors ${
                  isActive(item.href)
                    ? "bg-white/10 text-white font-medium"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="w-[18px] h-[18px] shrink-0">{item.icon()}</span>
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 bg-[var(--color-sidebar)] flex-col shrink-0 h-screen">
        {nav}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-[var(--color-sidebar)] flex flex-col animate-in slide-in-from-left duration-200">
            {nav}
          </aside>
        </div>
      )}
    </>
  );
}

/* ── Icons (SVG inline, 18x18) ── */

function DashboardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function AnalyticsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  );
}

function BlogIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

function PageIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  );
}

function PushIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 17H2a3 3 0 003 3h14a3 3 0 003-3z" /><path d="M3.77 13.77A9.97 9.97 0 012 8C2 4.69 4.69 2 8 2" /><path d="M8.8 8.8A4 4 0 0112 4" /><circle cx="18" cy="8" r="3" /><path d="M18 2v1" />
    </svg>
  );
}

function ChurchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2H6a2 2 0 00-2 2v16l6-3 6 3V4a2 2 0 00-2-2z" />
    </svg>
  );
}

function BibleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /><line x1="12" y1="6" x2="12" y2="13" /><line x1="8.5" y1="9.5" x2="15.5" y2="9.5" />
    </svg>
  );
}

function BannersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><path d="M8 21h8" /><path d="M12 17v4" /><circle cx="7.5" cy="8.5" r="1.5" /><path d="M21 13l-4-4L6 17" />
    </svg>
  );
}

function BlogCategoriesIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
    </svg>
  );
}

function ResourcesIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function ContactMessagesIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22 6 12 13 2 6" />
    </svg>
  );
}

function MediaLibraryIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function WidgetsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  );
}

function WebhooksIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
