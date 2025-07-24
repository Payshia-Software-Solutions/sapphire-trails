
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { AdminSidebar, navLinks } from '@/components/admin/sidebar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu, LoaderCircle, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import type { User as AuthUser } from '@/contexts/auth-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import './admin.css';


const ADMIN_SESSION_KEY = 'adminUser';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [adminUser, setAdminUser] = useState<AuthUser | null>(null);
  const isMounted = useRef(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { serverStatus } = useAuth(); // Get server status from context

  useEffect(() => {
    // Force light theme on the admin panel
    document.documentElement.classList.add('light');
    
    // Cleanup function to remove the light theme when leaving the admin panel
    return () => {
      document.documentElement.classList.remove('light');
    };
  }, []);

  useEffect(() => {
    if (isMounted.current) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 1500);
      return () => clearTimeout(timer);
    } else {
      isMounted.current = true;
    }
  }, [pathname]);

   useEffect(() => {
    const userSessionRaw = localStorage.getItem(ADMIN_SESSION_KEY);
    if (userSessionRaw) {
      try {
        const user: AuthUser = JSON.parse(userSessionRaw);
        if (user && user.type === 'admin') {
          setAdminUser(user);
        } else {
          localStorage.removeItem(ADMIN_SESSION_KEY);
          router.push('/auth?redirect=/admin/dashboard');
        }
      } catch (e) {
        console.error("Failed to parse user session", e);
        localStorage.removeItem(ADMIN_SESSION_KEY);
        router.push('/auth?redirect=/admin/dashboard');
      }
    } else {
        router.push('/auth?redirect=/admin/dashboard');
    }
  }, [pathname, router]);

  // Handle server status
  if (serverStatus === 'connecting') {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background text-foreground">
            <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Connecting to server...</p>
        </div>
    )
  }
  if (serverStatus === 'error') {
      return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background text-foreground">
            <WifiOff className="h-12 w-12 text-destructive" />
            <h2 className="text-xl font-semibold">Connection Error</h2>
            <p className="text-muted-foreground text-center max-w-sm">Could not connect to the backend server. Please check your connection or try again later.</p>
        </div>
    )
  }


  const layout = (
      <div className="grid h-screen w-full overflow-hidden md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <AdminSidebar />
        <div className="grid grid-rows-[auto_1fr] overflow-hidden">
          <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
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
                              onClick={() => setIsSheetOpen(false)}
                          >
                              <span className="font-serif text-xl tracking-[0.1em] text-primary">ADMIN</span>
                          </Link>
                          {navLinks.map((link) => (
                          <Link
                              key={link.href}
                              href={link.href}
                              onClick={() => setIsSheetOpen(false)}
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
                  </SheetContent>
              </Sheet>
              <div className="w-full flex-1">
                  {/* Can add search or breadcrumbs here */}
              </div>
              <div className="flex items-center gap-4">
                {adminUser && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="icon" className="rounded-full">
                        <Avatar>
                          <AvatarImage src={`https://placehold.co/100x100.png?text=${adminUser.name.charAt(0).toUpperCase()}`} />
                          <AvatarFallback>{adminUser.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="sr-only">Toggle user menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Hi, {adminUser.name}!</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild className="cursor-pointer">
                          <Link href="/admin/profile">Profile</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
          </header>
          <main className="overflow-y-auto p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
  );

  return (
    <>
        {isLoading && <div className="fixed top-0 left-0 right-0 h-1 bg-primary z-[200] animate-top-loading" />}
        {adminUser && layout}
    </>
  );
}
