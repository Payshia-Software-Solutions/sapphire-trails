
'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { 
  Home,
  Menu, 
  User, 
  LogOut, 
  Shield, 
  Mail, 
  Phone, 
  Sun, 
  Moon, 
  Sparkles, 
  Compass, 
  Gem, 
  MapPin, 
  BookOpen, 
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useAuth } from '@/contexts/auth-context';
import { useSiteContent, getContactPhone, getCleanPhone, getWhatsappUrl, getTopBarConfig } from '@/lib/site-content';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from '@/contexts/theme-context';

const navLinks = [
  { href: '/', label: 'Home', icon: Home, badge: null },
  { href: '/about', label: 'About', icon: Sparkles, badge: null },
  { href: '/tours', label: 'Tours', icon: Compass, badge: 'Popular' },
  { href: '/custom-proposal-package', label: 'Proposal Package', icon: Gem, badge: 'Exclusive' },
  { href: '/explore-ratnapura', label: 'Explore Ratnapura', icon: MapPin, badge: null },
  { href: '/articles', label: 'Articles', icon: BookOpen, badge: null },
  { href: '/contact', label: 'Contact', icon: Mail, badge: null },
];

const isLinkActive = (currentPath: string, linkHref: string) => {
  if (linkHref === '/') {
    return currentPath === '/';
  }
  return currentPath === linkHref || currentPath.startsWith(`${linkHref}/`);
};

export function Header() {


  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showTopBar, setShowTopBar] = useState(true);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { content } = useSiteContent();
  const topbar = getTopBarConfig(content);

  const primaryPhone = topbar.phone || getContactPhone(content);
  const primaryPhoneTel = `tel:${getCleanPhone(primaryPhone)}`;
  const primaryEmail = topbar.email || content?.contact?.primaryEmail || 'info@sapphiretrails.lk';
  const whatsappUrl = getWhatsappUrl(content);

  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setShowTopBar(false);
      } else {
        setShowTopBar(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        const height = headerRef.current.getBoundingClientRect().height;
        if (height > 0) {
          document.documentElement.style.setProperty('--header-height', `${Math.round(height)}px`);
        }
      }
    };
    updateHeaderHeight();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && headerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        updateHeaderHeight();
      });
      resizeObserver.observe(headerRef.current);
    }

    window.addEventListener('resize', updateHeaderHeight);
    return () => {
      window.removeEventListener('resize', updateHeaderHeight);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [showTopBar, topbar.enabled]);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  }

  const handleProfileClick = () => {
    router.push('/profile');
    setIsMenuOpen(false);
  }
  
  const handleAdminClick = () => {
    router.push('/admin/dashboard');
    setIsMenuOpen(false);
  }

  return (
    <header ref={headerRef} className="sticky top-0 z-50 w-full bg-white dark:bg-background border-b border-border shadow-sm">
      {/* Top Bar - Hidden on small mobile screens (<640px) to maximize screen real estate */}
      {topbar.enabled && (
        <div className={cn(
          "hidden sm:block w-full bg-white dark:bg-background-alt text-xs text-muted-foreground border-b border-border py-1.5 transition-all duration-300 ease-in-out overflow-hidden origin-top",
          showTopBar ? "max-h-[40px] opacity-100" : "max-h-0 opacity-0 py-0 border-b-transparent"
        )}>
          <div className="container mx-auto max-w-screen-2xl flex items-center justify-between px-4 md:px-6">
            <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-3 sm:gap-6">
              {primaryEmail && (
                <a href={`mailto:${primaryEmail}`} className="flex items-center gap-1.5 hover:text-primary transition-colors text-[11px] sm:text-xs">
                  <Mail className="h-3 w-3 text-primary shrink-0" />
                  <span>{primaryEmail}</span>
                </a>
              )}
              {primaryPhone && (
                <a href={primaryPhoneTel} className="flex items-center gap-1.5 hover:text-primary transition-colors text-[11px] sm:text-xs shrink-0">
                  <Phone className="h-3 w-3 text-primary shrink-0" />
                  <span>{primaryPhone}</span>
                </a>
              )}
            </div>
            {topbar.tagline && (
              topbar.taglineLink ? (
                <Link href={topbar.taglineLink} className="hidden sm:block text-primary/80 hover:text-primary transition-colors font-sans tracking-wide uppercase text-[11px] font-medium">
                  {topbar.tagline}
                </Link>
              ) : (
                <div className="hidden sm:block text-primary/80 font-sans tracking-wide uppercase text-[11px] font-medium">
                  {topbar.tagline}
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Main Navbar - Compact h-14 (56px) on mobile, scaling to h-16 (tablet) and h-20 (desktop) */}
      <div className="container mx-auto flex h-14 sm:h-16 md:h-20 max-w-screen-2xl items-center justify-between px-4 md:px-6 transition-all duration-300">
        <Link href="/" className="flex items-center" onClick={() => setIsMenuOpen(false)}>
          <span className="font-brand text-base sm:text-lg md:text-2xl tracking-wider sm:tracking-widest md:tracking-[0.2em] text-primary">
            SAPPHIRE TRAILS
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-3.5 lg:space-x-5 xl:space-x-6 text-[13px] xl:text-[14px] font-sans font-medium">
          {navLinks.map((link) => {
            const isActive = isLinkActive(pathname, link.href);
            return (
              <Link 
                key={link.href} 
                href={link.href} 
                className={cn(
                  "transition-colors hover:text-primary relative py-1",
                  isActive 
                    ? "text-primary font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-primary after:rounded-full" 
                    : "text-foreground/80"
                )}
              >
                {link.label}
              </Link>
            );
          })}

          
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full text-primary hover:bg-primary/10 h-10 w-10 min-h-[44px] min-w-[44px]" aria-label="Toggle theme">
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
            {user ? (
               <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 min-h-[44px] min-w-[44px]" aria-label="User account menu">
                    <User className="h-5 w-5 text-primary" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user.type === 'admin' && (
                    <DropdownMenuItem onClick={() => router.push('/admin/dashboard')} className="cursor-pointer">
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Admin Panel</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => router.push('/profile')} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()} className="cursor-pointer">
                     <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
               </DropdownMenu>
            ) : (
                <Button asChild className="bg-[#0B1E38] hover:bg-[#071527] text-white border border-[#0B1E38] font-sans font-medium text-xs px-5 py-1.5 h-auto rounded-full shadow-xs transition-all min-h-[40px]">
                    <Link href="/auth">Login</Link>
                </Button>
            )}
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                aria-label="Open navigation menu"
                className="hover:bg-primary/10 rounded-full h-10 w-10 min-h-[44px] min-w-[44px] text-primary border border-primary/20"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open navigation menu</span>
              </Button>
            </SheetTrigger>
            
            <SheetContent 
              side="right" 
              className="w-[85vw] max-w-sm bg-white dark:bg-[#0B1118] text-foreground border-l border-border/70 p-0 flex flex-col justify-between shadow-2xl z-50"
            >
              {/* Drawer Top / Header with Text-Only Logo */}
              <div className="px-6 py-5 border-b border-border/70">
                <SheetHeader className="text-left space-y-0">
                  <SheetTitle className="sr-only">Sapphire Trails Navigation</SheetTitle>
                </SheetHeader>
                
                <Link 
                  href="/" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex flex-col group transition-opacity hover:opacity-85 pr-8"
                >
                  <span className="font-brand text-lg tracking-[0.18em] uppercase text-primary font-normal">
                    SAPPHIRE TRAILS
                  </span>
                  <span className="text-[10px] font-sans tracking-[0.22em] uppercase text-muted-foreground mt-0.5 font-medium">
                    Luxury Gem Tours • Sri Lanka
                  </span>
                </Link>
              </div>

              {/* Scrollable Navigation Links Area */}
              <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col justify-between">
                <nav className="flex flex-col space-y-1">
                  {navLinks.map((link) => {
                    const isActive = isLinkActive(pathname, link.href);
                    
                    return (
                      <Link 
                        key={link.href} 
                        href={link.href} 
                        onClick={() => setIsMenuOpen(false)}
                        className={cn(
                          "group flex items-center justify-between py-2.5 px-3.5 rounded-xl transition-all duration-200 font-sans text-[15px]",
                          isActive 
                            ? "text-[#0B1E38] dark:text-blue-200 font-semibold bg-[#0B1E38]/8 dark:bg-white/10" 
                            : "text-foreground/80 hover:text-[#0B1E38] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 font-medium"
                        )}
                      >
                        <span>
                          {link.label}
                        </span>

                        {link.badge && (
                          <span className="shrink-0 ml-3 text-[10px] font-sans font-medium tracking-wide uppercase px-2 py-0.5 rounded-full bg-[#0B1E38]/10 text-[#0B1E38] dark:bg-white/15 dark:text-blue-200 shadow-2xs">
                            {link.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>

                {/* Quiet Concierge Touchpoint in subtle card */}
                <div className="mt-6 pt-5 border-t border-border/60">
                  <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-muted-foreground mb-3 font-semibold">
                    Private Concierge
                  </p>
                  <div className="bg-[#0B1E38]/[0.03] dark:bg-white/[0.03] border border-[#0B1E38]/10 dark:border-white/10 rounded-2xl p-3.5 space-y-2 text-xs">
                    <a 
                      href={primaryPhoneTel} 
                      className="flex items-center gap-2.5 text-foreground/80 hover:text-[#0B1E38] dark:hover:text-blue-300 transition-colors py-0.5 font-sans"
                    >
                      <Phone className="h-3.5 w-3.5 text-[#0B1E38] dark:text-blue-300 shrink-0" />
                      <span>{primaryPhone}</span>
                    </a>
                    {whatsappUrl && (
                      <a 
                        href={whatsappUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center gap-2.5 text-foreground/80 hover:text-[#0B1E38] dark:hover:text-blue-300 transition-colors py-0.5 font-sans"
                      >
                        <MessageSquare className="h-3.5 w-3.5 text-[#0B1E38] dark:text-blue-300 shrink-0" />
                        <span>WhatsApp Concierge</span>
                      </a>
                    )}
                    <a 
                      href={`mailto:${primaryEmail}`} 
                      className="flex items-center gap-2.5 text-foreground/80 hover:text-[#0B1E38] dark:hover:text-blue-300 transition-colors py-0.5 font-sans"
                    >
                      <Mail className="h-3.5 w-3.5 text-[#0B1E38] dark:text-blue-300 shrink-0" />
                      <span>{primaryEmail}</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Bottom Sticky Action & Theme Drawer Footer */}
              <div className="p-5 border-t border-border/70 bg-muted/20 dark:bg-card/40 flex flex-col gap-3.5 font-sans">
                {/* Theme Toggle Button */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-sans uppercase tracking-wider text-muted-foreground font-semibold">Appearance</span>
                  <button 
                    onClick={toggleTheme} 
                    aria-label="Toggle visual theme"
                    className="flex items-center gap-2 text-xs font-sans font-medium text-foreground/80 hover:text-[#0B1E38] dark:hover:text-white transition-colors py-2 px-3 rounded-lg min-h-[44px]"
                  >
                    {theme === 'dark' ? (
                      <>
                        <Sun className="h-4 w-4 text-amber-400" />
                        <span>Light Mode</span>
                      </>
                    ) : (
                      <>
                        <Moon className="h-4 w-4 text-[#0B1E38]" />
                        <span>Dark Mode</span>
                      </>
                    )}
                  </button>
                </div>

                {/* User Profile / Admin or Auth Login */}
                {user ? (
                  <div className="space-y-3 pt-3 border-t border-border/50">
                    <div className="flex items-center justify-between">
                      <div className="overflow-hidden">
                        <p className="text-xs font-semibold truncate text-foreground">{user.email}</p>
                        <p className="text-[11px] font-sans uppercase tracking-wider text-[#0B1E38] dark:text-blue-200 font-medium mt-0.5">
                          {user.type === 'admin' ? 'Administrator' : 'Client Account'}
                        </p>
                      </div>
                      <button 
                        onClick={handleLogout} 
                        className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                        title="Log Out"
                        aria-label="Log Out"
                      >
                        <LogOut className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {user.type === 'admin' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 text-xs font-sans font-medium border-border hover:border-[#0B1E38] text-foreground hover:text-[#0B1E38] h-8 rounded-lg bg-background"
                          onClick={handleAdminClick}
                        >
                          <Shield className="mr-1.5 h-3 w-3 text-[#0B1E38] dark:text-blue-300" />
                          Admin
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 text-xs font-sans font-medium border-border hover:border-[#0B1E38] text-foreground hover:text-[#0B1E38] h-8 rounded-lg bg-background"
                        onClick={handleProfileClick}
                      >
                        <User className="mr-1.5 h-3 w-3 text-[#0B1E38] dark:text-blue-300" />
                        Profile
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button 
                    asChild 
                    className="w-full bg-[#0B1E38] hover:bg-[#071527] text-white font-sans font-medium text-xs h-10 rounded-full transition-all border border-[#0B1E38] shadow-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Link href="/auth">
                      Sign In / Register
                    </Link>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

