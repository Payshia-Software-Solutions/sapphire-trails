
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu, User, LogOut, Shield, Mail, Phone, Sun, Moon } from 'lucide-react';
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
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/theme-context';


const navLinks = [
  { href: '/about', label: 'About' },
  { href: '/tours', label: 'Tours' },
  { href: '/explore-ratnapura', label: 'Explore Ratnapura' },
  { href: '/articles', label: 'Articles' },
  { href: '/contact', label: 'Contact' },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showTopBar, setShowTopBar] = useState(true);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

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
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-primary hover:text-primary/80 transition-colors">
              {link.label}
            </Link>
          ))}
          
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
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6 text-primary" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-sm bg-background p-6 flex flex-col">
              <SheetHeader>
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              </SheetHeader>
              <div className="text-center mb-8">
                <Link href="/" className="inline-block" onClick={() => setIsMenuOpen(false)}>
                   <Image 
                    src="/img/logo4.png"
                    alt="Sapphire Trails Logo"
                    width={100}
                    height={60}
                  />
                </Link>
              </div>

              <nav className="flex flex-col items-center gap-y-6 text-lg font-serif uppercase tracking-widest">
                {navLinks.map((link) => (
                  <Link 
                    key={link.href} 
                    href={link.href} 
                    className="text-primary hover:text-primary/80 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-auto pt-6 border-t border-border flex flex-col gap-4">
                <Button variant="outline" onClick={toggleTheme} className="w-full text-primary border-primary hover:bg-primary/10">
                  {theme === 'dark' ? (
                    <span className="flex items-center justify-center gap-2"><Sun className="h-5 w-5" /> Light Mode</span>
                  ) : (
                    <span className="flex items-center justify-center gap-2"><Moon className="h-5 w-5" /> Dark Mode</span>
                  )}
                </Button>
                {user ? (
                  <div className="flex flex-col items-center gap-4 w-full">
                     {user.type === 'admin' && (
                        <Button variant="ghost" className="w-full" onClick={handleAdminClick}>
                           <Shield className="mr-2 h-5 w-5" />
                           Admin Panel
                        </Button>
                     )}
                     <Button variant="ghost" className="w-full" onClick={handleProfileClick}>
                        <User className="mr-2 h-5 w-5" />
                        Profile
                      </Button>
                      <Button variant="ghost" className="w-full" onClick={handleLogout}>
                        <LogOut className="mr-2 h-5 w-5" />
                        Log Out
                      </Button>
                  </div>
                ) : (
                  <Button asChild className="w-full" onClick={() => setIsMenuOpen(false)}>
                    <Link href="/auth">Login / Sign Up</Link>
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
