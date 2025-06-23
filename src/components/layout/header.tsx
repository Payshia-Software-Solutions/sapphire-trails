'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

const navLinks = [
  { href: '/about', label: 'About' },
  { href: '/tours', label: 'Tours' },
  { href: '/explore-ratnapura', label: 'Explore Ratnapura' },
  { href: '/contact', label: 'Contact' },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-t border-white/10">
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center space-x-2" onClick={() => setIsMenuOpen(false)}>
          <span className="font-headline text-2xl tracking-[0.2em] text-primary">SAPPHIRE TRAILS</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-headline uppercase tracking-widest">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-primary hover:text-primary/80 transition-colors">
              {link.label}
            </Link>
          ))}
          <Button asChild size="sm" className="rounded-md">
            <Link href="/contact">Book Now</Link>
          </Button>
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
            <SheetContent side="right" className="w-full max-w-sm bg-background p-6">
              <div className="flex justify-between items-center mb-8">
                <Link href="/" onClick={() => setIsMenuOpen(false)}>
                    <span className="font-headline text-xl tracking-[0.2em] text-primary">SAPPHIRE TRAILS</span>
                </Link>
              </div>

              <nav className="flex flex-col space-y-6 text-lg font-headline uppercase tracking-widest text-center">
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
                 <Button asChild size="lg" className="w-full mt-6" onClick={() => setIsMenuOpen(false)}>
                    <Link href="/contact">Book Now</Link>
                 </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
