
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
import { useSiteContent, getContactPhone, getCleanPhone, getWhatsappUrl } from '@/lib/site-content';
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

  const primaryPhone = getContactPhone(content);
  const primaryPhoneTel = `tel:${getCleanPhone(primaryPhone)}`;
  const primaryEmail = content?.contact?.primaryEmail || 'info@sapphiretrails.lk';
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
        document.documentElement.style.setProperty('--header-height', `${height}px`);
      }
    };
    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
    return () => window.removeEventListener('resize', updateHeaderHeight);
  }, [showTopBar]);

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
    <header ref={headerRef} className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border">
      {/* Top Bar */}
      <div className={cn(
        "w-full bg-background-alt/40 text-xs text-muted-foreground border-b border-border py-1.5 transition-all duration-300 ease-in-out overflow-hidden origin-top",
        showTopBar ? "max-h-[40px] opacity-100" : "max-h-0 opacity-0 py-0 border-b-transparent"
      )}>
        <div className="container mx-auto max-w-screen-2xl flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-3 sm:gap-6">
            <a href={`mailto:${primaryEmail}`} className="flex items-center gap-1.5 hover:text-primary transition-colors text-[11px] sm:text-xs">
              <Mail className="h-3 w-3 text-primary shrink-0" />
              <span>{primaryEmail}</span>
            </a>
            <a href={primaryPhoneTel} className="flex items-center gap-1.5 hover:text-primary transition-colors text-[11px] sm:text-xs shrink-0">
              <Phone className="h-3 w-3 text-primary shrink-0" />
              <span>{primaryPhone}</span>
            </a>
          </div>
          <div className="hidden sm:block text-primary/75 font-serif tracking-[0.15em] uppercase text-[10px]">
            Luxury Gem Tours
          </div>
        </div>
      </div>

      <div className="container mx-auto flex h-20 max-w-screen-2xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center" onClick={() => setIsMenuOpen(false)}>
          <span className="font-serif text-lg md:text-2xl tracking-widest md:tracking-[0.2em] text-primary">SAPPHIRE TRAILS</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-3.5 lg:space-x-5 xl:space-x-6 text-[13px] xl:text-sm font-serif uppercase tracking-wider xl:tracking-widest">
          {navLinks.map((link) => {
            const isActive = isLinkActive(pathname, link.href);
            return (
              <Link 
                key={link.href} 
                href={link.href} 
                className={cn(
                  "transition-colors hover:text-primary relative py-1",
                  isActive 
                    ? "text-primary font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-primary after:rounded-full" 
                    : "text-foreground/80"
                )}
              >
                {link.label}
              </Link>
            );
          })}

          
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full text-primary hover:bg-primary/10">
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
            {user ? (
               <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
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
                <Button asChild variant="outline" className="text-primary border-primary hover:bg-primary/10 hover:text-primary font-serif uppercase tracking-widest text-xs px-6 py-2 h-auto rounded-full">
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
                className="hover:bg-primary/10 rounded-full h-10 w-10 text-primary border border-primary/20"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open navigation menu</span>
              </Button>
            </SheetTrigger>
            
            <SheetContent 
              side="right" 
              className="w-[85vw] max-w-sm bg-background/98 backdrop-blur-2xl border-l border-border/40 p-0 flex flex-col justify-between shadow-2xl"
            >
              {/* Drawer Top / Header */}
              <div className="px-6 py-6 border-b border-border/30">
                <SheetHeader className="text-left space-y-0">
                  <SheetTitle className="sr-only">Sapphire Trails Navigation</SheetTitle>
                </SheetHeader>
                
                <Link 
                  href="/" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 group transition-opacity hover:opacity-85 pr-8"
                >
                  <Image 
                    src="/img/logo4.png"
                    alt="Sapphire Trails"
                    width={34}
                    height={34}
                    className="object-contain"
                  />
                  <div>
                    <span className="block font-serif text-sm tracking-[0.22em] uppercase text-primary font-medium">
                      SAPPHIRE TRAILS
                    </span>
                    <span className="block text-[9px] font-serif tracking-[0.2em] uppercase text-muted-foreground/70 mt-0.5">
                      Luxury Gem Tours
                    </span>
                  </div>
                </Link>
              </div>

              {/* Scrollable Navigation Links Area */}
              <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col justify-between">
                <nav className="flex flex-col space-y-1">
                  {navLinks.map((link) => {
                    const isActive = isLinkActive(pathname, link.href);
                    
                    return (
                      <Link 
                        key={link.href} 
                        href={link.href} 
                        onClick={() => setIsMenuOpen(false)}
                        className={cn(
                          "group flex items-center justify-between py-3 px-2 rounded-md transition-all duration-200 border-b border-border/15",
                          isActive 
                            ? "text-primary font-medium" 
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            "w-1 h-1 rounded-full transition-all duration-300",
                            isActive 
                              ? "bg-primary scale-125" 
                              : "bg-transparent scale-0 group-hover:bg-primary/50 group-hover:scale-75"
                          )} />
                          <span className="font-serif text-[15px] tracking-[0.14em] uppercase">
                            {link.label}
                          </span>
                        </div>

                        {link.badge && (
                          <span className="text-[9px] font-sans tracking-[0.2em] uppercase text-primary/70">
                            {link.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>

                {/* Quiet Concierge Touchpoint */}
                <div className="mt-8 pt-6 border-t border-border/30">
                  <p className="text-[9px] font-serif uppercase tracking-[0.25em] text-muted-foreground/60 mb-3">
                    Private Concierge
                  </p>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <a 
                      href={primaryPhoneTel} 
                      className="flex items-center gap-2.5 hover:text-primary transition-colors py-0.5"
                    >
                      <Phone className="h-3.5 w-3.5 text-primary/70" />
                      <span className="tracking-wider">{primaryPhone}</span>
                    </a>
                    {whatsappUrl && (
                      <a 
                        href={whatsappUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center gap-2.5 hover:text-primary transition-colors py-0.5"
                      >
                        <MessageSquare className="h-3.5 w-3.5 text-primary/70" />
                        <span className="tracking-wider">WhatsApp Concierge</span>
                      </a>
                    )}
                    <a 
                      href={`mailto:${primaryEmail}`} 
                      className="flex items-center gap-2.5 hover:text-primary transition-colors py-0.5"
                    >
                      <Mail className="h-3.5 w-3.5 text-primary/70" />
                      <span className="tracking-wider">{primaryEmail}</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Bottom Sticky Action & Theme Drawer Footer */}
              <div className="p-6 border-t border-border/30 bg-background-alt/10 flex flex-col gap-4">
                {/* Theme Toggle Button */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-serif uppercase tracking-[0.2em] text-muted-foreground/60">Appearance</span>
                  <button 
                    onClick={toggleTheme} 
                    className="flex items-center gap-2 text-xs font-serif uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
                  >
                    {theme === 'dark' ? (
                      <>
                        <Sun className="h-3.5 w-3.5 text-primary" />
                        <span>Light Mode</span>
                      </>
                    ) : (
                      <>
                        <Moon className="h-3.5 w-3.5 text-primary" />
                        <span>Dark Mode</span>
                      </>
                    )}
                  </button>
                </div>

                {/* User Profile / Admin or Auth Login */}
                {user ? (
                  <div className="space-y-3 pt-3 border-t border-border/20">
                    <div className="flex items-center justify-between">
                      <div className="overflow-hidden">
                        <p className="text-xs font-medium truncate text-foreground">{user.email}</p>
                        <p className="text-[9px] font-serif uppercase tracking-widest text-primary/80 mt-0.5">
                          {user.type === 'admin' ? 'Administrator' : 'Client Account'}
                        </p>
                      </div>
                      <button 
                        onClick={handleLogout} 
                        className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                        title="Log Out"
                      >
                        <LogOut className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {user.type === 'admin' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 text-[10px] font-serif uppercase tracking-widest border-border/60 hover:border-primary/40 hover:text-primary h-8 rounded-md"
                          onClick={handleAdminClick}
                        >
                          <Shield className="mr-1.5 h-3 w-3" />
                          Admin
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 text-[10px] font-serif uppercase tracking-widest border-border/60 hover:border-primary/40 hover:text-primary h-8 rounded-md"
                        onClick={handleProfileClick}
                      >
                        <User className="mr-1.5 h-3 w-3" />
                        Profile
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button 
                    asChild 
                    variant="outline"
                    className="w-full border-primary/30 hover:border-primary text-primary hover:bg-primary/5 font-serif uppercase tracking-[0.2em] text-[10px] h-9 rounded-md transition-all"
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

