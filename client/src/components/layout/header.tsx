
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { 
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
  ChevronRight, 
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useAuth } from '@/contexts/auth-context';
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
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border">
      {/* Top Bar */}
      <div className={cn(
        "w-full bg-background-alt/40 text-xs text-muted-foreground border-b border-border py-1.5 transition-all duration-300 ease-in-out overflow-hidden origin-top",
        showTopBar ? "max-h-[40px] opacity-100" : "max-h-0 opacity-0 py-0 border-b-transparent"
      )}>
        <div className="container mx-auto max-w-screen-2xl flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <a href="mailto:info@sapphiretrails.lk" className="flex items-center gap-1.5 hover:text-primary transition-colors text-[11px] sm:text-xs">
              <Mail className="h-3 w-3 text-primary" />
              <span>info@sapphiretrails.lk</span>
            </a>
            <a href="tel:+94712357700" className="flex items-center gap-1.5 hover:text-primary transition-colors text-[11px] sm:text-xs">
              <Phone className="h-3 w-3 text-primary" />
              <span>+94 71 235 7700</span>
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
        <nav className="hidden md:flex items-center space-x-6 text-sm font-serif uppercase tracking-widest">
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
              className="w-[88vw] max-w-sm sm:max-w-md bg-background/95 backdrop-blur-xl border-l border-primary/20 p-0 flex flex-col justify-between shadow-2xl"
            >
              {/* Drawer Top / Header */}
              <div className="p-6 pb-4 border-b border-border/60">
                <SheetHeader className="text-left space-y-0">
                  <SheetTitle className="sr-only">Sapphire Trails Navigation</SheetTitle>
                </SheetHeader>
                
                <div className="flex items-center gap-3">
                  <div className="relative p-1 rounded-xl bg-primary/10 border border-primary/25 shadow-inner">
                    <Image 
                      src="/img/logo4.png"
                      alt="Sapphire Trails"
                      width={44}
                      height={44}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <div className="font-serif text-base font-bold tracking-[0.18em] text-primary">
                      SAPPHIRE TRAILS
                    </div>
                    <div className="text-[10px] font-serif uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <span>Luxury Gem Tours</span>
                      <span className="inline-block w-1 h-1 rounded-full bg-primary/60" />
                      <span>Ratnapura</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scrollable Navigation Links Area */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5">
                <div className="px-2 py-1 text-[10px] font-serif uppercase tracking-[0.2em] text-muted-foreground/70">
                  Navigation
                </div>
                
                <nav className="flex flex-col space-y-1">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = isLinkActive(pathname, link.href);
                    
                    return (

                      <Link 
                        key={link.href} 
                        href={link.href} 
                        onClick={() => setIsMenuOpen(false)}
                        className={cn(
                          "group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-serif uppercase tracking-wider transition-all duration-200",
                          isActive 
                            ? "bg-primary/15 text-primary font-semibold border border-primary/30 shadow-sm" 
                            : "text-foreground/80 hover:text-primary hover:bg-primary/5"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2 rounded-lg transition-colors",
                            isActive 
                              ? "bg-primary text-primary-foreground shadow-sm" 
                              : "bg-muted/80 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                          )}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <span>{link.label}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {link.badge && (
                            <span className="text-[9px] font-sans font-medium px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 uppercase tracking-widest">
                              {link.badge}
                            </span>
                          )}
                          <ChevronRight className={cn(
                            "h-4 w-4 transition-transform duration-200",
                            isActive ? "text-primary translate-x-0.5" : "text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5"
                          )} />
                        </div>
                      </Link>
                    );
                  })}
                </nav>

                {/* Quick Booking CTA Banner */}
                <div className="pt-3 pb-1">
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-background border border-primary/25 p-4">
                    <div className="absolute -right-4 -bottom-4 opacity-10 text-primary pointer-events-none">
                      <Gem className="w-24 h-24" />
                    </div>
                    <div className="relative z-10">
                      <p className="text-xs font-serif uppercase tracking-wider text-primary font-semibold">
                        Exclusive Mining Tours
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 mb-3 leading-relaxed">
                        Book customized private gem tours & romantic proposal packages.
                      </p>
                      <Button 
                        asChild 
                        size="sm" 
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-serif uppercase tracking-widest text-[11px] h-8 rounded-lg shadow-sm"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Link href="/tours" className="flex items-center justify-center gap-1.5">
                          <span>Explore Tours</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Quick Direct Contacts */}
                <div className="pt-2 px-1">
                  <div className="grid grid-cols-2 gap-2">
                    <a 
                      href="tel:+94712357700" 
                      className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-muted/40 hover:bg-primary/10 text-[11px] text-muted-foreground hover:text-primary transition-colors border border-border"
                    >
                      <Phone className="h-3.5 w-3.5 text-primary" />
                      <span>Call Us</span>
                    </a>
                    <a 
                      href="https://wa.me/94712357700" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-muted/40 hover:bg-primary/10 text-[11px] text-muted-foreground hover:text-primary transition-colors border border-border"
                    >
                      <MessageSquare className="h-3.5 w-3.5 text-primary" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Bottom Sticky Action & Theme Drawer Footer */}
              <div className="p-4 border-t border-border/60 bg-background-alt/30 flex flex-col gap-3">
                {/* Theme Toggle Button */}
                <div className="flex items-center justify-between px-2">
                  <span className="text-xs text-muted-foreground font-serif tracking-wider uppercase">Appearance</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={toggleTheme} 
                    className="h-8 px-3 rounded-full text-xs font-serif uppercase tracking-wider text-primary border-primary/30 hover:bg-primary/10 flex items-center gap-1.5"
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
                  </Button>
                </div>

                {/* User Profile / Admin or Auth Login */}
                {user ? (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-card border border-border">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="h-8 w-8 rounded-full bg-primary/15 text-primary flex items-center justify-center flex-shrink-0 font-serif font-bold text-xs border border-primary/30">
                          {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-medium truncate">{user.email}</p>
                          <p className="text-[10px] text-primary font-serif uppercase tracking-wider">
                            {user.type === 'admin' ? 'Administrator' : 'Client Account'}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={handleLogout} 
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg flex-shrink-0"
                        title="Log Out"
                      >
                        <LogOut className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {user.type === 'admin' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full text-xs font-serif uppercase tracking-wider border-primary/30 hover:bg-primary/10 text-primary h-8"
                          onClick={handleAdminClick}
                        >
                          <Shield className="mr-1.5 h-3.5 w-3.5" />
                          Admin
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className={cn(
                          "text-xs font-serif uppercase tracking-wider border-primary/30 hover:bg-primary/10 text-primary h-8",
                          user.type === 'admin' ? "w-full" : "col-span-2 w-full"
                        )}
                        onClick={handleProfileClick}
                      >
                        <User className="mr-1.5 h-3.5 w-3.5" />
                        My Profile
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button 
                    asChild 
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-serif uppercase tracking-widest text-xs h-9 rounded-xl shadow-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Link href="/auth" className="flex items-center justify-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Sign In / Register</span>
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

