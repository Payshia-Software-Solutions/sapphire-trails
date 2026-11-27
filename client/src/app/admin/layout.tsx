
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { AdminSidebar, navLinks, AdminNavDropdownList, isAdminNavActive } from '@/components/admin/sidebar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu, LoaderCircle, Sun, Moon, Globe, ExternalLink, Gem, ShieldCheck, LogOut, UserCheck } from 'lucide-react';

import { cn, API_BASE_URL } from '@/lib/utils';
import { authFetch, removeAuthToken } from '@/lib/api';
import type { User as AuthUser } from '@/contexts/auth-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
    let cancelled = false;
    const clearAndRedirect = () => {
      removeAuthToken();
      localStorage.removeItem(ADMIN_SESSION_KEY);
      localStorage.removeItem('sapphire-user');
      if (!cancelled) {
        setAdminUser(null);
        router.push('/auth?redirect=' + encodeURIComponent(pathname || '/admin/dashboard'));
      }
    };

    const userSessionRaw = localStorage.getItem(ADMIN_SESSION_KEY);
    const token = localStorage.getItem('sapphire_token');
    if (!userSessionRaw || !token) {
      clearAndRedirect();
      return;
    }

    let parsedUser: AuthUser | null = null;
    try {
      parsedUser = JSON.parse(userSessionRaw);
    } catch (e) {
      console.error('Failed to parse user session', e);
      clearAndRedirect();
      return;
    }

    if (!parsedUser || parsedUser.type !== 'admin') {
      clearAndRedirect();
      return;
    }

    // Verify token is genuinely valid and has admin privileges on the backend
    authFetch(`${API_BASE_URL}/analytics/settings/`, { method: 'GET' })
      .then((res) => {
        if (cancelled) return;
        if (res.status === 401 || res.status === 403) {
          clearAndRedirect();
        } else {
          setAdminUser(parsedUser);
        }
      })
      .catch(() => {
        // On transient network failure keep local check, authFetch handles 401 on API calls
        if (!cancelled) {
          setAdminUser(parsedUser);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  const activeNavItem = navLinks.find((item) => isAdminNavActive(pathname || '', item.href));

  const getAdminInitials = (name?: string) => {
    if (!name) return 'AD';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const handleHeaderLogout = () => {
    removeAuthToken();
    localStorage.removeItem(ADMIN_SESSION_KEY);
    localStorage.removeItem('sapphire-user');
    router.push('/auth');
  };

  const layout = (
      <div className="fixed inset-0 grid w-full h-full overflow-hidden md:grid-cols-[240px_1fr] lg:grid-cols-[276px_1fr] bg-background">
        <AdminSidebar />
        <div className="flex flex-col h-full overflow-hidden min-w-0">
          <header className="flex h-16 items-center justify-between gap-4 border-b border-border/80 bg-card/95 backdrop-blur-md px-4 sm:px-6 shrink-0 z-10">
            <div className="flex items-center gap-3 min-w-0">
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 md:hidden rounded-xl border-border/80"
                  >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="flex flex-col bg-[#08111e] text-slate-200 border-r border-white/10 p-0 w-[280px]"
                >
                  <SheetHeader className="h-16 px-5 border-b border-white/10 flex flex-row items-center gap-3 space-y-0">
                    <div className="h-9 w-9 rounded-xl bg-primary/15 border border-primary/40 flex items-center justify-center text-amber-300 shrink-0">
                      <Gem className="h-4 w-4" />
                    </div>
                    <div className="text-left min-w-0">
                      <SheetTitle className="font-brand text-sm font-bold tracking-[0.18em] text-white">
                        SAPPHIRE TRAILS
                      </SheetTitle>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-300/90">
                        Concierge Studio
                      </p>
                    </div>
                  </SheetHeader>

                  <div className="flex-1 overflow-y-auto admin-scrollbar p-3">
                    <AdminNavDropdownList onNavigate={() => setIsSheetOpen(false)} />
                  </div>

                  <div className="mt-auto p-3 border-t border-white/10 space-y-2 bg-[#060d18]">
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-xs text-slate-300 hover:text-white hover:bg-white/5 rounded-xl h-9"
                    >
                      <Link href="/profile" onClick={() => setIsSheetOpen(false)}>
                        <UserCheck className="mr-2 h-4 w-4 text-amber-300" />
                        <span>VIP Member Portal</span>
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsSheetOpen(false);
                        handleHeaderLogout();
                      }}
                      className="w-full justify-start text-xs text-slate-300 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl h-9"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign Out</span>
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Active Module Breadcrumb */}
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-lg shrink-0">
                  <ShieldCheck className="h-3 w-3" /> Studio
                </span>
                <span className="text-sm font-headline font-bold text-foreground truncate">
                  {activeNavItem?.label || 'Administration'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              {/* Live Public Website Link */}
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-9 px-3.5 gap-1.5 rounded-xl text-xs font-semibold border-primary/30 text-primary hover:bg-primary/10 transition-colors shadow-sm"
              >
                <Link href="/" target="_blank" rel="noopener noreferrer" title="View Public Website">
                  <Globe className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Live Website</span>
                  <ExternalLink className="h-3 w-3 opacity-70" />
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="h-9 w-9 rounded-xl text-primary hover:bg-primary/10 border border-border/60"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              {adminUser && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-9 pl-1.5 pr-2.5 rounded-xl border border-border/70 hover:bg-muted/60 gap-2"
                    >
                      <Avatar className="h-7 w-7 border border-primary/50 bg-[#08111e]">
                        <AvatarFallback className="bg-[#08111e] text-amber-300 text-[11px] font-headline font-bold">
                          {getAdminInitials(adminUser.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden lg:inline text-xs font-semibold text-foreground max-w-[120px] truncate">
                        {adminUser.name}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 rounded-xl">
                    <DropdownMenuLabel className="font-normal">
                      <p className="text-xs font-semibold text-foreground truncate">{adminUser.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{adminUser.email}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="cursor-pointer text-xs">
                      <Link href="/admin/profile">Admin Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer text-xs">
                      <Link href="/profile">VIP Member Portal</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer text-xs">
                      <Link href="/" target="_blank" rel="noopener noreferrer">
                        Visit Public Website
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleHeaderLogout}
                      className="cursor-pointer text-xs text-destructive focus:text-destructive"
                    >
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </header>

          <main className="flex-1 overflow-y-auto admin-scrollbar bg-background-alt/60 p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
            <div className="flex-1 w-full">
              {children}
            </div>
            <footer className="mt-10 pt-4 border-t border-border/60 w-full flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
              <p>&copy; {new Date().getFullYear()} Sapphire Trails Concierge Studio. All rights reserved.</p>
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
