
'use client';

import Link from 'next/link';
import { Facebook, Instagram, Youtube, MapPin } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';

const CMS_DATA_KEY = 'sapphire-cms-data';

const defaultSocials = {
    facebookUrl: 'https://www.facebook.com/p/Sapphire-Trails-61573050367074/',
    instagramUrl: 'https://instagram.com',
    youtubeUrl: 'https://youtube.com',
};


const tourLinks = [
  { href: '/tours', label: 'Gem Mine Tours' },
  { href: '/explore-ratnapura', label: 'Gem City Attractions' },
  { href: '/tours', label: 'Day Gem Mine Tours' },
  { href: '/tours', label: 'Luxury Gem Mining Packages' },
  { href: '/explore-ratnapura', label: 'Ratnapura Gem Market Visits' },
];

const FooterLogo = () => (
    <>
        <Image src="/img/logo4.png" alt="Sapphire Trails Logo" width={100} height={60} />
        <h3 className="font-serif text-l tracking-[0.2em] text-primary mt-4">SAPPHIRE TRAILS</h3>
        <p className="text-sm text-muted-foreground max-w-xs mt-2">Sapphire Trails offers exclusive Gem Mine Tours in Ratnapura, Sri Lanka. Experience the complete journey from traditional mining pits to the gem market with our expert guides.</p>
    </>
);

const GrandSilverRayLogo = () => (
    <div className="flex flex-col items-center md:items-end">
      <Image src="/img/logo2.png" alt="Grand Silver Ray Logo" width={100} height={100} />
      <p className="text-xs text-muted-foreground mt-2 text-center md:text-right">Our Hospitality Partner for Luxury Gem Tours.</p>
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
             <h3 className="font-headline text-lg tracking-widest text-primary mb-4">TOUR PACKAGES</h3>
             <div className="flex flex-col space-y-2">
                {tourLinks.map((link) => (
                    <Link key={link.label} href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                        {link.label}
                    </Link>
                ))}
                <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">About</Link>
                <Link href="/articles" className="text-muted-foreground hover:text-primary transition-colors">Articles</Link>
             </div>
          </div>
          
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-headline text-lg tracking-widest text-primary mb-4">CONTACT US</h3>
            <div className="space-y-2 text-sm text-muted-foreground font-body">
                <p>Grand Silver Ray, Colombo - Batticaloa Hwy, Ratnapura, Sri Lanka.</p>
                <p>Email: info@sapphiretrails.com</p>
                <p>Primary: 071 235 7700</p>
                <p>Secondary: 071 638 1000</p>
                <a href="https://maps.app.goo.gl/h562367TWEDda77J8" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-primary transition-colors">
                    <MapPin className="h-4 w-4" />
                    Find us on Google Maps
                </a>
            </div>
          </div>
          
          <div className="flex flex-col items-center md:items-end gap-4">
             <GrandSilverRayLogo />
             <div className="flex items-center gap-4 mt-2">
               <Link href={socials.facebookUrl} className="text-muted-foreground hover:text-primary transition-colors" aria-label="Sapphire Trails Gem Mine Tours Facebook Page">
                 <Facebook className="h-5 w-5" />
               </Link>
               <Link href={socials.instagramUrl} className="text-muted-foreground hover:text-primary transition-colors" aria-label="Sapphire Trails Gem Mine Tours Instagram Page">
                 <Instagram className="h-5 w-5" />
               </Link>
               <Link href={socials.youtubeUrl} className="text-muted-foreground hover:text-primary transition-colors" aria-label="Sapphire Trails Gem Mine Tours YouTube Channel">
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
