'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { removeAuthToken } from '@/lib/api';
import {
  LayoutGrid,
  CalendarCheck,
  CalendarDays,
  FileText,
  Settings,
  Package,
  Users,
  LogOut,
  type LucideIcon,
  MessageSquare,
  Mail,
  Receipt,
  Activity,
  BookOpen,
  Star,
  Send,
  Megaphone,
  Award,
  Gem,
  UserCheck,
  ChevronDown,
  Database,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface NavGroup {
  title: string;
  items: NavLink[];
}

export const navGroups: NavGroup[] = [
  {
    title: 'Operations',
    items: [
      { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutGrid },
      { href: '/admin/booking-requests', label: 'Booking Requests', icon: CalendarCheck },
      { href: '/admin/calendar', label: 'Booking Calendar', icon: CalendarDays },
      { href: '/admin/contact-submissions', label: 'Contact Submissions', icon: MessageSquare },
    ],
  },
  {
    title: 'Revenue & Partners',
    items: [
      { href: '/admin/invoices', label: 'Invoices', icon: Receipt },
      { href: '/admin/referrals', label: 'Referrals & Agents', icon: Award },
      { href: '/admin/subscribers', label: 'Newsletter & Leads', icon: Send },
      { href: '/admin/analytics', label: 'Analytics & Pixels', icon: Activity },
    ],
  },
  {
    title: 'Studio & Content',
    items: [
      { href: '/admin/manage-packages', label: 'Manage Packages', icon: Package },
      { href: '/admin/manage-content', label: 'Manage Locations', icon: Settings },
      { href: '/admin/manage-articles', label: 'Manage Articles', icon: BookOpen },
      { href: '/admin/manage-reviews', label: 'Manage Reviews', icon: Star },
      { href: '/admin/promo-banner', label: 'Promo Banner', icon: Megaphone },
      { href: '/admin/cms', label: 'Master CMS', icon: FileText },
    ],
  },
  {
    title: 'System & Access',
    items: [
      { href: '/admin/user-management', label: 'User Management', icon: Users },
      { href: '/admin/mail-settings', label: 'Mail & Logs', icon: Mail },
      { href: '/admin/system-schema', label: 'Database & Updates', icon: Database },
    ],
  },
];

export const navLinks: NavLink[] = navGroups.flatMap((group) => group.items);

const ADMIN_SESSION_KEY = 'adminUser';

export function isAdminNavActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (pathname.startsWith(href) && href !== '/admin/dashboard') return true;
  if (
    href === '/admin/manage-content' &&
    (pathname.startsWith('/admin/edit-content') || pathname.startsWith('/admin/add-content'))
  ) {
    return true;
  }
  if (
    href === '/admin/manage-packages' &&
    (pathname.startsWith('/admin/manage-packages/add') || pathname.startsWith('/admin/manage-packages/edit'))
  ) {
    return true;
  }
  return false;
}

interface AdminNavDropdownListProps {
  onNavigate?: () => void;
}

/** Collapsible grouped navigation list shared by both desktop sidebar and mobile sheet. */
export function AdminNavDropdownList({ onNavigate }: AdminNavDropdownListProps) {
  const pathname = usePathname() || '';

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const group of navGroups) {
      initial[group.title] = group.items.some((item) => isAdminNavActive(pathname, item.href));
    }
    if (!Object.values(initial).some(Boolean)) {
      initial['Operations'] = true;
    }
    return initial;
  });

  // Automatically expand the group matching the active route when navigating
  useEffect(() => {
    const activeGroup = navGroups.find((group) =>
      group.items.some((item) => isAdminNavActive(pathname, item.href))
    );
    if (activeGroup) {
      setOpenGroups((prev) =>
        prev[activeGroup.title] ? prev : { ...prev, [activeGroup.title]: true }
      );
    }
  }, [pathname]);

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <div className="space-y-2">
      {navGroups.map((group) => {
        const hasActiveChild = group.items.some((item) => isAdminNavActive(pathname, item.href));
        const isOpen = !!openGroups[group.title];

        return (
          <div key={group.title} className="space-y-1">
            <button
              type="button"
              onClick={() => toggleGroup(group.title)}
              aria-expanded={isOpen}
              className={cn(
                'w-full flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-left transition-colors group',
                hasActiveChild
                  ? 'bg-white/[0.06] text-amber-300'
                  : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
              )}
            >
              <span className="flex items-center gap-2 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] truncate">
                  {group.title}
                </span>
                {hasActiveChild && !isOpen && (
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                )}
              </span>

              <span className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] font-mono text-slate-500 group-hover:text-slate-400">
                  {group.items.length}
                </span>
                <ChevronDown
                  className={cn(
                    'h-3.5 w-3.5 transition-transform duration-200',
                    isOpen ? 'rotate-0 text-amber-300' : '-rotate-90 text-slate-500'
                  )}
                />
              </span>
            </button>

            {isOpen && (
              <nav className="grid gap-1 text-xs font-medium ml-2 pl-2.5 border-l border-white/10 pb-1">
                {group.items.map((link) => {
                  const active = isAdminNavActive(pathname, link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={onNavigate}
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-3 py-2 transition-all',
                        active
                          ? 'bg-white/10 text-amber-300 border border-amber-400/25 font-semibold shadow-sm'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent'
                      )}
                    >
                      <link.icon
                        className={cn(
                          'h-4 w-4 shrink-0 transition-colors',
                          active ? 'text-amber-300' : 'text-slate-400'
                        )}
                      />
                      <span className="truncate">{link.label}</span>
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function AdminSidebar() {
  const router = useRouter();

  const handleLogout = () => {
    removeAuthToken();
    localStorage.removeItem(ADMIN_SESSION_KEY);
    localStorage.removeItem('sapphire-user');
    router.push('/auth');
  };

  return (
    <aside className="hidden md:flex md:flex-col h-full bg-[#08111e] text-slate-200 border-r border-white/10 select-none">
      {/* Midnight Sapphire Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-5 shrink-0">
        <Link href="/admin/dashboard" className="flex items-center gap-3 group min-w-0">
          <div className="h-9 w-9 rounded-xl bg-primary/15 border border-primary/40 flex items-center justify-center text-amber-300 shrink-0 group-hover:bg-primary/25 transition-colors">
            <Gem className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <span className="font-brand text-sm font-bold tracking-[0.18em] text-white block truncate">
              SAPPHIRE TRAILS
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-300/90 block">
              Concierge Studio
            </span>
          </div>
        </Link>
      </div>

      {/* Collapsible Categorized Navigation */}
      <div className="flex-1 overflow-y-auto admin-scrollbar py-4 px-3">
        <AdminNavDropdownList />
      </div>

      {/* Footer Actions */}
      <div className="mt-auto p-3 border-t border-white/10 space-y-2 bg-[#060d18]">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="w-full justify-start text-xs text-slate-300 hover:text-white hover:bg-white/5 rounded-xl h-9"
        >
          <Link href="/profile">
            <UserCheck className="mr-2 h-4 w-4 text-amber-300" />
            <span>VIP Member Portal</span>
          </Link>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start text-xs text-slate-300 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl h-9"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </Button>

        <div className="pt-1.5 text-center border-t border-white/5">
          <a
            href="https://nebulync.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1 text-[11px] text-slate-400 hover:text-amber-300 transition-colors font-medium group"
          >
            <span>Powered by</span>
            <span className="font-semibold text-slate-200 group-hover:text-amber-300 underline decoration-primary/40 underline-offset-2">
              Nebulync.com
            </span>
          </a>
        </div>
      </div>
    </aside>
  );
}
