'use client';

import Link from 'next/link';
import { Facebook, Instagram, Youtube, MapPin } from 'lucide-react';
import Image from 'next/image';
import { useSiteContent } from '@/lib/site-content';

const defaultTourLinks = [
  { href: '/custom-proposal-package', label: 'Custom Proposal & Ring Package' },
  { href: '/tours', label: 'Gem Mine Tours' },
  { href: '/explore-ratnapura', label: 'Gem City Attractions' },
  { href: '/tours', label: 'Day Gem Mine Tours' },
  { href: '/tours', label: 'Luxury Gem Mining Packages' },
  { href: '/explore-ratnapura', label: 'Ratnapura Gem Market Visits' },
];

export function Footer() {
  const { content } = useSiteContent();
  const footer = content.footer;
  const contact = content.contact;
  const vis = footer?.sectionVisibility || {};

  return (
    <footer className="w-full bg-background-alt border-t border-border">
      <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-center md:text-left">
          
          {/* Column 1: Brand & About Narrative */}
          {vis.brand !== false && (
            <div className="flex flex-col items-center md:items-start">
              <div className="relative w-[100px] h-[60px]">
                <Image 
                  src={footer.brandLogo || '/img/logo4.png'} 
                  alt="Sapphire Trails Logo" 
                  fill 
                  className="object-contain" 
                />
              </div>
              <h3 className="font-serif text-l tracking-[0.2em] text-primary mt-4">
                {footer.brandHeading || 'SAPPHIRE TRAILS'}
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs mt-2 leading-relaxed">
                {footer.aboutText}
              </p>
            </div>
          )}

          {/* Column 2: Tour Packages & Quick Navigation */}
          {vis.packages !== false && (
            <div className="flex flex-col items-center md:items-start">
               <h3 className="font-headline text-lg tracking-widest text-primary mb-4">
                 {footer.packagesHeading || 'TOUR PACKAGES'}
               </h3>
               <div className="flex flex-col space-y-2">
                  {defaultTourLinks.map((link) => (
                      <Link key={link.label} href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                          {link.label}
                      </Link>
                  ))}
                  <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">About</Link>
                  <Link href="/articles" className="text-muted-foreground hover:text-primary transition-colors">Articles</Link>
               </div>
            </div>
          )}
          
          {/* Column 3: Contact Details & Hotlines */}
          {vis.contact !== false && (
            <div className="flex flex-col items-center md:items-start">
              <h3 className="font-headline text-lg tracking-widest text-primary mb-4">
                {footer.contactHeading || 'CONTACT US'}
              </h3>
              <div className="space-y-2 text-sm text-muted-foreground font-body">
                  <p>{contact.physicalAddress}</p>
                  <p>Email: <a href={`mailto:${contact.primaryEmail}`} className="hover:text-primary transition-colors">{contact.primaryEmail}</a></p>
                  <p>Primary: <a href={`tel:${contact.primaryPhone.replace(/\s+/g, '')}`} className="hover:text-primary transition-colors">{contact.primaryPhone}</a></p>
                  {contact.secondaryPhone && (
                    <p>Secondary: <a href={`tel:${contact.secondaryPhone.replace(/\s+/g, '')}`} className="hover:text-primary transition-colors">{contact.secondaryPhone}</a></p>
                  )}
                  <a 
                    href={footer.googleMapsUrl || contact.map?.directionsUrl || 'https://maps.app.goo.gl/h562367TWEDda77J8'} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-2 hover:text-primary transition-colors pt-1"
                  >
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>Find us on Google Maps</span>
                  </a>
              </div>
            </div>
          )}
          
          {/* Column 4: Hospitality Partner & Social Channels */}
          {vis.partner !== false && (
            <div className="flex flex-col items-center md:items-end gap-4">
               <div className="flex flex-col items-center md:items-end">
                 <div className="relative w-[100px] h-[80px]">
                   <Image 
                     src={footer.partnerLogo || '/img/logo2.png'} 
                     alt="Grand Silver Ray Logo" 
                     fill 
                     className="object-contain" 
                   />
                 </div>
                 <p className="text-xs text-muted-foreground mt-2 text-center md:text-right max-w-[200px]">
                   {footer.partnerTagline || 'Our Hospitality Partner for Luxury Gem Tours.'}
                 </p>
               </div>
               <div className="flex items-center gap-4 mt-2">
                 {footer.facebookUrl && (
                   <Link href={footer.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Sapphire Trails Facebook">
                     <Facebook className="h-5 w-5" />
                   </Link>
                 )}
                 {footer.instagramUrl && (
                   <Link href={footer.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Sapphire Trails Instagram">
                     <Instagram className="h-5 w-5" />
                   </Link>
                 )}
                 {footer.youtubeUrl && (
                   <Link href={footer.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Sapphire Trails YouTube">
                     <Youtube className="h-5 w-5" />
                   </Link>
                 )}
               </div>
            </div>
          )}

        </div>

        {/* Bottom Strip: Copyright & Credits */}
        {vis.bottom !== false && (
          <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground gap-2">
            <p>
              {footer.copyrightText || `© ${new Date().getFullYear()} Sapphire Trails. All rights reserved.`}
            </p>
            {footer.poweredByText && (
              <Link 
                href={footer.poweredByUrl || 'https://nebulync.com'} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-primary transition-colors"
              >
                {footer.poweredByText}
              </Link>
            )}
          </div>
        )}
      </div>
      <div className="h-1 bg-primary/80" />
    </footer>
  );
}

