
'use client';

import Link from 'next/link';
import { Facebook, Instagram, Youtube } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';

const CMS_DATA_KEY = 'sapphire-cms-data';

const defaultSocials = {
    facebookUrl: 'https://facebook.com',
    instagramUrl: 'https://instagram.com',
    youtubeUrl: 'https://youtube.com',
};


const navLinks = [
  { href: '/about', label: 'About' },
  { href: '/tours', label: 'Tours' },
  { href: '/explore-ratnapura', label: 'Explore Ratnapura' },
  { href: '/virtual-tour', label: 'Virtual Tour' },
  { href: '/contact', label: 'Contact' },
];

const FooterLogo = () => (
    <>
        <Image src="/img/logo4.png" alt="Sapphire Trails Logo" width={100} height={60} />
        <h3 className="font-serif text-l tracking-[0.2em] text-primary mt-4">SAPPHIRE TRAILS</h3>
        <p className="text-sm text-muted-foreground max-w-xs mt-2">Sri Lanka&apos;s only luxury gem experience.</p>
    </>
);

const GrandSilverRayLogo = () => (
    <div>
      <Image src="/img/logo2.png" alt="Grand Silver Ray Logo" width={100} height={100} />
    </div>
);

export function Footer() {
  const [socials, setSocials] = useState(defaultSocials);

    useEffect(() => {
        try {
            const storedDataRaw = localStorage.getItem(CMS_DATA_KEY);
            if (storedDataRaw) {
                const storedData = JSON.parse(storedDataRaw);
                if (storedData.footer) {
                    setSocials({ ...defaultSocials, ...storedData.footer });
                }
            }
        } catch (error) {
            console.error("Failed to load footer CMS data", error);
        }
    }, []);

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
               <Link href={socials.facebookUrl} className="text-muted-foreground hover:text-primary transition-colors" aria-label="Facebook">
                 <Facebook className="h-5 w-5" />
               </Link>
               <Link href={socials.instagramUrl} className="text-muted-foreground hover:text-primary transition-colors" aria-label="Instagram">
                 <Instagram className="h-5 w-5" />
               </Link>
               <Link href={socials.youtubeUrl} className="text-muted-foreground hover:text-primary transition-colors" aria-label="YouTube">
                 <Youtube className="h-5 w-5" />
               </Link>
             </div>
          </div>

        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground gap-2">
          <p>
            © {new Date().getFullYear()} Sapphire Trails. All rights reserved.
          </p>
          <Link href="https://payshia.com/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
            Powered by Payshia Software Solutions
          </Link>
        </div>
      </div>
      <div className="h-1 bg-primary/80" />
    </footer>
  );
}
