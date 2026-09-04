'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutGrid, CalendarCheck, CalendarDays, FileText, Settings, Package, Users, LogOut, type LucideIcon, MessageSquare, Mail, Receipt, Activity, BookOpen, Star, Send } from 'lucide-react';

import { Button } from '@/components/ui/button';

export interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const navLinks: NavLink[] = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/admin/booking-requests', label: 'Booking Requests', icon: CalendarCheck },
  { href: '/admin/calendar', label: 'Booking Calendar', icon: CalendarDays },
  { href: '/admin/invoices', label: 'Invoices', icon: Receipt },
  { href: '/admin/contact-submissions', label: 'Contact Submissions', icon: MessageSquare },
  { href: '/admin/subscribers', label: 'Newsletter & Leads', icon: Send },
  { href: '/admin/mail-settings', label: 'Mail & Logs', icon: Mail },
  { href: '/admin/analytics', label: 'Analytics & Pixels', icon: Activity },
  { href: '/admin/cms', label: 'Master CMS', icon: FileText },
  { href: '/admin/manage-articles', label: 'Manage Articles', icon: BookOpen },

  { href: '/admin/manage-reviews', label: 'Manage Reviews', icon: Star },
  { href: '/admin/manage-content', label: 'Manage Locations', icon: Settings },
  { href: '/admin/manage-packages', label: 'Manage Packages', icon: Package },
  { href: '/admin/user-management', label: 'User Management', icon: Users },
];


const ADMIN_SESSION_KEY = 'adminUser';

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    localStorage.removeItem('sapphire-user'); // Also remove main user key
    router.push('/auth');
  };

  return (
    <aside className="hidden border-r bg-background-alt md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold">
            <span className="font-serif text-xl tracking-[0.1em] text-primary">ADMIN</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navLinks.map((link) => {
              const isActive = (pathname === link.href) || 
                               (pathname.startsWith(link.href) && link.href !== '/admin/dashboard') ||
                               (pathname.startsWith('/admin/edit-content') && link.href === '/admin/manage-content') ||
                               (pathname.startsWith('/admin/add-content') && link.href === '/admin/manage-content') ||
                               (pathname.startsWith('/admin/manage-packages/add') && link.href === '/admin/manage-packages') ||
                               (pathname.startsWith('/admin/manage-packages/edit') && link.href === '/admin/manage-packages');
              return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                  isActive && 'bg-muted text-primary'
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            )})}
          </nav>
        </div>
        <div className="mt-auto p-4 border-t border-border/40 space-y-2">
            <Button variant="ghost" className="w-full justify-start text-xs text-muted-foreground hover:text-foreground" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
            </Button>
            <div className="pt-1 text-center">
                <a 
                    href="https://nebulync.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors font-medium group"
                >
                    <span>Powered by</span>
                    <span className="font-semibold text-foreground group-hover:text-primary underline decoration-primary/40 underline-offset-2">Nebulync.com</span>
                </a>
            </div>
        </div>
      </div>
    </aside>
  );
}

