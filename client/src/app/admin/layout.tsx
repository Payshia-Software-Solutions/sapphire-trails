
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { AdminSidebar, navLinks } from '@/components/admin/sidebar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu, LoaderCircle, Sun, Moon, Globe, ExternalLink } from 'lucide-react';

import { cn } from '@/lib/utils';
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
import { useTheme } from '@/contexts/theme-context';
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

  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    window.scrollTo(0, 0);
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
    const token = localStorage.getItem('sapphire_token');
    if (userSessionRaw && token) {
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

  const layout = (
      <div className="fixed inset-0 grid w-full h-full overflow-hidden md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] bg-background">
        <AdminSidebar />
        <div className="flex flex-col h-full overflow-hidden">
          <header className="flex h-14 items-center gap-4 border-b bg-background-alt px-4 lg:h-[60px] lg:px-6 shrink-0 z-10">
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
                      <div className="mt-auto pt-6 border-t border-border/40 text-center">
                          <a 
                              href="https://nebulync.com/" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors font-medium group"
                          >
                              <span>Powered by</span>
                              <span className="font-semibold text-foreground group-hover:text-primary underline decoration-primary/40 underline-offset-2">Nebulync.com</span>
                          </a>
                      </div>
                  </SheetContent>
              </Sheet>
              <div className="w-full flex-1">
                  {/* Can add search or breadcrumbs here */}
              </div>
              <div className="flex items-center gap-3">
                {/* Live Public Website Link */}
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-9 px-3 gap-1.5 rounded-full text-xs font-semibold border-primary/30 text-primary hover:bg-primary/10 transition-colors shadow-xs"
                >
                  <Link href="/" target="_blank" rel="noopener noreferrer" title="View Public Website">
                    <Globe className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Live Website</span>
                    <ExternalLink className="h-3 w-3 opacity-70" />
                  </Link>
                </Button>

                <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full text-primary hover:bg-primary/10">
                  {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
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
                      <DropdownMenuItem asChild className="cursor-pointer">
                          <Link href="/" target="_blank" rel="noopener noreferrer">Visit Public Website</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 lg:p-6 flex flex-col justify-between">
            <div className="flex-1">
              {children}
            </div>
            <footer className="mt-8 pt-4 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
              <p>&copy; {new Date().getFullYear()} Sapphire Trails. All rights reserved.</p>
              <p className="flex items-center gap-1">
                <span>Powered by</span>
                <a 
                  href="https://nebulync.com/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="font-semibold text-foreground hover:text-primary transition-colors underline decoration-primary/40 underline-offset-2"
                >
                  Nebulync.com
                </a>
              </p>
            </footer>
          </main>
        </div>
      </div>
  );


  return (
    <>
        {isLoading && <div className="fixed top-0 left-0 right-0 h-1 bg-primary z-[200] animate-top-loading" />}
        {adminUser ? layout : (
             <div className="flex h-screen items-center justify-center">
                <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
             </div>
        )}
    </>
  );
}
