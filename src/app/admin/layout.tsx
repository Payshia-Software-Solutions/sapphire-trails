
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { AdminSidebar, navLinks } from '@/components/admin/sidebar';
import type { NavLink } from '@/components/admin/sidebar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu, LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/shared/theme-provider';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import type { AdminUser } from '@/lib/schemas';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


const ADMIN_SESSION_KEY = 'adminUser';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/admin/login';
  const [isLoading, setIsLoading] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const isMounted = useRef(false);

  useEffect(() => {
    if (isMounted.current) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 1500); // Duration matches animation
      return () => clearTimeout(timer);
    } else {
      isMounted.current = true;
    }
  }, [pathname]);

   useEffect(() => {
    const adminUserRaw = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (adminUserRaw) {
      setAdminUser(JSON.parse(adminUserRaw));
    }
  }, [pathname]);


  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    router.push('/admin/login');
  };
  
  const getVisibleNavLinks = (role: 'admin' | 'superadmin' | undefined): NavLink[] => {
    if (!role) return [];
    if (role === 'superadmin') {
      return navLinks;
    }
    return navLinks.filter(link => link.href === '/admin/booking-requests' || link.href === '/admin/dashboard');
  }

  const layout = (
      isLoginPage ? (
        <>{children}</>
      ) : (
        <div className="grid h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
          <AdminSidebar />
          <div className="flex flex-col overflow-hidden">
            <header className="flex h-14 shrink-0 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="shrink-0 md:hidden"
                        >
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle navigation menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="flex flex-col">
                        <SheetHeader>
                            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                        </SheetHeader>
                        <nav className="grid gap-2 text-lg font-medium">
                            <Link
                                href="/admin/dashboard"
                                className="flex items-center gap-2 text-lg font-semibold mb-4"
                            >
                                <span className="font-serif text-xl tracking-[0.1em] text-primary">ADMIN</span>
                            </Link>
                            {getVisibleNavLinks(adminUser?.role).map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                'mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground',
                                (pathname.startsWith(link.href)) && 'bg-muted text-foreground'
                                )}
                            >
                                <link.icon className="h-5 w-5" />
                                {link.label}
                            </Link>
                            ))}
                        </nav>
                        <div className="mt-auto flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <ThemeToggle />
                                {adminUser && (
                                    <span className='text-sm text-muted-foreground'>Hi, {adminUser.username}</span>
                                )}
                            </div>
                            <Button asChild variant="outline">
                                <Link href="/admin/profile">
                                    <User className="mr-2 h-4 w-4" /> Profile
                                </Link>
                            </Button>
                            <Button variant="ghost" className="justify-center" onClick={handleLogout}>
                                <LogOut className="mr-2 h-4 w-4" />
                                Logout
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>
                <div className="w-full flex-1">
                    {/* Can add search or breadcrumbs here */}
                </div>
                 <div className="flex items-center gap-4">
                  <ThemeToggle />
                   {adminUser && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" className="rounded-full">
                          <Avatar>
                            <AvatarImage src={`https://placehold.co/100x100.png?text=${adminUser.username.charAt(0).toUpperCase()}`} />
                            <AvatarFallback>{adminUser.username.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="sr-only">Toggle user menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Hi, {adminUser.username}!</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild className="cursor-pointer">
                           <Link href="/admin/profile">Profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                          Logout
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                 </div>
            </header>
            <main className="flex-1 overflow-y-auto p-4 lg:p-6">
              {children}
            </main>
          </div>
        </div>
      )
  );

  return (
     <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
    >
        {isLoading && <div className="fixed top-0 left-0 right-0 h-1 bg-primary z-[200] animate-top-loading" />}
        {layout}
    </ThemeProvider>
  );
}
