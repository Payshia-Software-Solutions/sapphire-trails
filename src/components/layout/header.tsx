import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background border-t border-white/10">
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-headline text-2xl tracking-[0.2em] text-primary">SAPPHIRE TRAILS</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-8 text-sm font-headline uppercase tracking-widest">
          <Link href="#about" className="text-primary hover:text-primary/80 transition-colors">About</Link>
          <Link href="#tours" className="text-primary hover:text-primary/80 transition-colors">Tours</Link>
          <Link href="#ratnapura" className="text-primary hover:text-primary/80 transition-colors">Explore Ratnapura</Link>
          <Link href="#booking" className="text-primary hover:text-primary/80 transition-colors">Book Now</Link>
          <Link href="#contact" className="text-primary hover:text-primary/80 transition-colors">Contact</Link>
        </nav>
      </div>
    </header>
  );
}
