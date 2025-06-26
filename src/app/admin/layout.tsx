
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AdminSidebar, navLinks } from '@/components/admin/sidebar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu, LogOut } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/shared/theme-provider';
import { ThemeToggle } from '@/components/shared/theme-toggle';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/admin/login';

  const handleLogout = () => {
    sessionStorage.removeItem('isAdminAuthenticated');
    router.push('/admin/login');
  };

  const layout = (
      isLoginPage ? (
        <>{children}</>
      ) : (
        <div className="grid h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
          <AdminSidebar />
          <div className="flex flex-col">
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
                                href="/admin/booking-requests"
                                className="flex items-center gap-2 text-lg font-semibold mb-4"
                            >
                                <Image src="/img/logo.png" alt="Sapphire Trails Logo" width={28} height={23} />
                                <span className="font-serif text-xl tracking-[0.1em] text-primary">ADMIN</span>
                            </Link>
                            {navLinks.map((link) => (
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
                        <div className="mt-auto flex items-center justify-between">
                            <Button variant="ghost" className="justify-start" onClick={handleLogout}>
                                <LogOut className="mr-2 h-4 w-4" />
                                Logout
                            </Button>
                            <ThemeToggle />
                        </div>
                    </SheetContent>
                </Sheet>
                <div className="w-full flex-1">
                    {/* Can add search or breadcrumbs here */}
                </div>
                <ThemeToggle />
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      )
  );

  return (
     <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
    >
        {layout}
    </ThemeProvider>
  );
}
