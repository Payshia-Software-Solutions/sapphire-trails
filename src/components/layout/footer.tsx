import Link from 'next/link';
import { Facebook, Instagram, Youtube } from 'lucide-react';
import Image from 'next/image';

const FooterLogo = () => (
    <div className="flex flex-col items-center gap-1.5 text-center">
        <Image src="/img/logo.png" alt="Sapphire Trails Logo" width={150} height={90} />
    </div>
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
        <div className="grid md:grid-cols-3 gap-12 items-center text-center md:text-left">
          
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
