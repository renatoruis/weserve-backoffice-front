"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { hasMinRole } from "@/lib/permissions";
import {
  DashboardIcon,
  AnalyticsIcon,
  HomeIcon,
  WidgetsIcon,
  CalendarIcon,
  BookIcon,
  BellIcon,
  BlogIcon,
  BlogCategoriesIcon,
  ResourcesIcon,
  GiftIcon,
  HeartIcon,
  ContactMessagesIcon,
  PushIcon,
  WebhooksIcon,
  ChurchIcon,
  BibleIcon,
  MediaLibraryIcon,
} from "@/components/icons";

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
    { href: "/dashboard/agenda", label: "Eventos", icon: CalendarIcon },
    { href: "/dashboard/sermoes", label: "Sermons", icon: BookIcon },
    { href: "/dashboard/avisos", label: "Notices", icon: BellIcon },
    { href: "/dashboard/blog", label: "Blog", icon: BlogIcon },
    { href: "/dashboard/blog-categories", label: "Blog Categories", icon: BlogCategoriesIcon },
    { href: "/dashboard/resources", label: "Resources", icon: ResourcesIcon },
  ],
};

const communitySection: MenuSection = {
  title: "Community",
  items: [
    { href: "/dashboard/generosidade", label: "Generosidade", icon: GiftIcon },
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
