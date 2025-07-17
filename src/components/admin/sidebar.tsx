
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutGrid, CalendarCheck, FileText, Settings, Package, Users, LogOut, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const navLinks: NavLink[] = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/admin/booking-requests', label: 'Booking Requests', icon: CalendarCheck },
  { href: '/admin/cms', label: 'CMS', icon: FileText },
  { href: '/admin/manage-content', label: 'Manage Content', icon: Settings },
  { href: '/admin/manage-packages', label: 'Manage Packages', icon: Package },
  { href: '/admin/user-management', label: 'User Management', icon: Users },
];

const ADMIN_SESSION_KEY = 'adminUser';

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    router.push('/admin/login');
  };

  return (
    <aside className="hidden border-r bg-background md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold">
            <span className="font-serif text-xl tracking-[0.1em] text-primary">ADMIN</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                  (pathname.startsWith(link.href)) && 'bg-muted text-primary'
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-4">
            <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
            </Button>
        </div>
      </div>
    </aside>
  );
}
