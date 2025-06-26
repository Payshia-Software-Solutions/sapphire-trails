'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/about', label: 'About' },
  { href: '/tours', label: 'Tours' },
  { href: '/explore-ratnapura', label: 'Explore Ratnapura' },
  { href: '/virtual-tour', label: 'Virtual Tour' },
  { href: '/contact', label: 'Contact' },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-t border-white/10">
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center" onClick={() => setIsMenuOpen(false)}>
          <span className="font-serif text-2xl tracking-[0.2em] text-primary">SAPPHIRE TRAILS</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-serif uppercase tracking-widest">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-primary hover:text-primary/80 transition-colors">
              {link.label}
            </Link>
          ))}
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
              <div className="text-center mb-8">
                <Link href="/" className="inline-block" onClick={() => setIsMenuOpen(false)}>
                    <span className="font-serif text-xl tracking-[0.2em] text-primary">SAPPHIRE TRAILS</span>
                </Link>
              </div>

              <nav className="grid grid-cols-2 gap-x-4 gap-y-8 text-lg font-serif uppercase tracking-widest text-center">
                {navLinks.map((link, index) => (
                  <Link 
                    key={link.href} 
                    href={link.href} 
                    className={cn(
                      "text-primary hover:text-primary/80 transition-colors",
                      navLinks.length % 2 !== 0 && index === navLinks.length - 1 && "col-span-2"
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
