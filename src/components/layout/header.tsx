
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, User, LogOut, Shield } from 'lucide-react';
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


const navLinks = [
  { href: '/about', label: 'About' },
  { href: '/tours', label: 'Tours' },
  { href: '/explore-ratnapura', label: 'Explore Ratnapura' },
  { href: '/virtual-tour', label: 'Virtual Tour' },
  { href: '/contact', label: 'Contact' },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

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
    <header className="sticky top-0 z-50 w-full bg-background border-t border-white/10">
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6">
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
                <Button asChild variant="outline" size="sm" className="text-primary border-primary hover:bg-primary/10 hover:text-primary">
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

              <div className="mt-auto pt-6 border-t border-border">
                {user ? (
                  <div className="flex flex-col items-center gap-4">
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
