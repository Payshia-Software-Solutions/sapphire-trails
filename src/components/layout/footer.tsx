import Link from 'next/link';
import { Facebook, Instagram, Youtube } from 'lucide-react';
import Image from 'next/image';

const FooterLogo = () => (
    <div className="flex flex-col items-center gap-1.5 text-center">
        <Image src="/img/logo.svg" alt="Sapphire Trails Logo" width={80} height={67} />
        <div className="mt-1">
            <p className="font-headline text-[10px] tracking-widest text-primary">SAPPHIRE TRAILS</p>
            <p className="text-[7px] tracking-[0.15em] text-muted-foreground/80 font-body uppercase">Professional Gem Tours</p>
        </div>
    </div>
);

const GrandSilverRayLogo = () => (
    <div className="font-headline text-center text-muted-foreground/80 -space-y-1">
      <p className="text-[9px] tracking-[0.15em]">GRAND</p>
      <p className="font-serif text-3xl tracking-tight leading-none scale-y-110">
        <span className="italic">S</span>R
      </p>
      <p className="text-[10px] tracking-[0.2em] !mt-0">Silver Ray</p>
      <p className="text-[6px] tracking-wider !mt-1.5">GRAND SILVER RAY</p>
      <p className="text-[5px] tracking-widest">RATHNAPURA</p>
    </div>
);

export function Footer() {
  return (
    <footer className="w-full bg-background border-t border-white/10">
      <div className="container mx-auto px-4 md:px-6 pt-16 pb-8">
        <div className="grid md:grid-cols-3 gap-12 items-start text-center md:text-left">
          
          <div className="flex justify-center md:justify-start">
            <FooterLogo />
          </div>
          
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-headline text-lg tracking-widest text-primary mb-4">SAPPHIRE TRAILS</h3>
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

        <div className="mt-16 pt-8 border-t border-white/10 text-center">
          <p className="text-balance text-sm leading-loose text-muted-foreground">
            © {new Date().getFullYear()} Sapphire Trails. All rights reserved.
          </p>
        </div>
      </div>
      <div className="h-1 bg-primary/80" />
    </footer>
  );
}
