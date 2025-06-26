import Link from 'next/link';
import { Facebook, Instagram, Youtube } from 'lucide-react';
import Image from 'next/image';

const navLinks = [
  { href: '/about', label: 'About' },
  { href: '/tours', label: 'Tours' },
  { href: '/explore-ratnapura', label: 'Explore Ratnapura' },
  { href: '/virtual-tour', label: 'Virtual Tour' },
  { href: '/contact', label: 'Contact' },
];

const FooterLogo = () => (
    <>
        <Image src="/img/logo3.png" alt="Sapphire Trails Logo" width={150} height={90} />
        <p className="text-sm text-muted-foreground max-w-xs mt-2">Sri Lanka's only luxury gem experience, offering immersive tours into the heart of Ratnapura's rich heritage.</p>
    </>
);

const GrandSilverRayLogo = () => (
    <div>
      <Image src="/img/logo2.png" alt="Grand Silver Ray Logo" width={100} height={100} />
    </div>
);

export function Footer() {
  return (
    <footer className="w-full bg-background border-t border-white/10">
      <div className="container mx-auto px-4 md:px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-center md:text-left">
          
          <div className="flex flex-col items-center md:items-start">
            <FooterLogo />
          </div>

          <div className="flex flex-col items-center md:items-start">
             <h3 className="font-headline text-lg tracking-widest text-primary mb-4">QUICK LINKS</h3>
             <div className="flex flex-col space-y-2">
                {navLinks.map((link) => (
                    <Link key={link.href} href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                        {link.label}
                    </Link>
                ))}
             </div>
          </div>
          
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-headline text-lg tracking-widest text-primary mb-4">CONTACT US</h3>
            <div className="space-y-1 text-sm text-muted-foreground font-body">
                <p>Email: info@sapphiretrails.com</p>
                <p>Phone: +94 77 123 4567</p>
                <p>Website: www.sapphiretrails.com</p>
            </div>
          </div>
          
          <div className="flex flex-col items-center md:items-end gap-4">
             <GrandSilverRayLogo />
             <div className="flex items-center gap-4 mt-2">
               <Link href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Facebook">
                 <Facebook className="h-5 w-5" />
               </Link>
               <Link href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Instagram">
                 <Instagram className="h-5 w-5" />
               </Link>
               <Link href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="YouTube">
                 <Youtube className="h-5 w-5" />
               </Link>
             </div>
          </div>

        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground gap-2">
          <p>
            © {new Date().getFullYear()} Sapphire Trails. All rights reserved.
          </p>
          <p>
            Powered by Payshia Software Solutions
          </p>
        </div>
      </div>
      <div className="h-1 bg-primary/80" />
    </footer>
  );
}
