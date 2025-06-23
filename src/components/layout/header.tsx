import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background">
      <div className="container flex h-20 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-headline text-2xl tracking-widest text-foreground">SAPPHIRE TRAILS</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium uppercase tracking-wider">
          <Link href="#about" className="text-foreground hover:text-primary transition-colors">About</Link>
          <Link href="#tours" className="text-foreground hover:text-primary transition-colors">Tours</Link>
          <Link href="#ratnapura" className="text-foreground hover:text-primary transition-colors">Explore Ratnapura</Link>
          <Link href="#booking" className="text-foreground hover:text-primary transition-colors">Book Now</Link>
          <Link href="#contact" className="text-foreground hover:text-primary transition-colors">Contact</Link>
        </nav>
      </div>
    </header>
  );
}
