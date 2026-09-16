'use client';

import { useState, useEffect } from 'react';
import { Compass, Sparkles, Clock, Star, Calendar, MessageCircle, Shield } from 'lucide-react';

interface TourDetailNavProps {
  tourTitle?: string;
  bookingLink?: string;
  price?: string;
}

export function TourDetailNav({ tourTitle, bookingLink = '#book-tour', price }: TourDetailNavProps) {
  const [activeSection, setActiveSection] = useState('overview');
  const [headerHeight, setHeaderHeight] = useState(80);

  useEffect(() => {
    const updateHeaderHeight = () => {
      const headerEl = document.querySelector('header');
      if (headerEl) {
        setHeaderHeight(headerEl.offsetHeight);
      }
    };

    updateHeaderHeight();

    const handleScroll = () => {
      updateHeaderHeight();

      const sections = ['overview', 'highlights', 'itinerary', 'inclusions', 'gallery', 'book-tour'];
      const scrollPos = window.scrollY + headerHeight + 120;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateHeaderHeight);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateHeaderHeight);
    };
  }, [headerHeight]);

  return (
    <div 
      style={{ top: `${headerHeight}px` }}
      className="sticky z-40 w-full bg-background/98 backdrop-blur-md border-b border-border/90 shadow-md transition-[top] duration-150 ease-out"
    >
      <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 font-sans">
        <div className="flex items-center justify-between gap-2 sm:gap-4 py-2 sm:py-2.5 overflow-x-auto no-scrollbar touch-pan-x">
          
          {/* Section Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2 text-[11px] sm:text-xs font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap">
            <a 
              href="#overview" 
              className={`px-3 py-1 sm:py-1.5 rounded-full transition-all ${activeSection === 'overview' ? 'text-[#0B1E38] dark:text-blue-200 font-bold bg-[#0B1E38]/10 dark:bg-white/10' : 'hover:text-foreground'}`}
            >
              Overview
            </a>
            <a 
              href="#highlights" 
              className={`px-3 py-1 sm:py-1.5 rounded-full transition-all ${activeSection === 'highlights' ? 'text-[#0B1E38] dark:text-blue-200 font-bold bg-[#0B1E38]/10 dark:bg-white/10' : 'hover:text-foreground'}`}
            >
              Highlights
            </a>
            <a 
              href="#itinerary" 
              className={`px-3 py-1 sm:py-1.5 rounded-full transition-all ${activeSection === 'itinerary' ? 'text-[#0B1E38] dark:text-blue-200 font-bold bg-[#0B1E38]/10 dark:bg-white/10' : 'hover:text-foreground'}`}
            >
              Itinerary
            </a>
            <a 
              href="#inclusions" 
              className={`px-3 py-1 sm:py-1.5 rounded-full transition-all ${activeSection === 'inclusions' ? 'text-[#0B1E38] dark:text-blue-200 font-bold bg-[#0B1E38]/10 dark:bg-white/10' : 'hover:text-foreground'}`}
            >
              Inclusions
            </a>
            <a 
              href="#gallery" 
              className={`px-3 py-1 sm:py-1.5 rounded-full transition-all ${activeSection === 'gallery' ? 'text-[#0B1E38] dark:text-blue-200 font-bold bg-[#0B1E38]/10 dark:bg-white/10' : 'hover:text-foreground'}`}
            >
              Gallery
            </a>
          </nav>

          {/* Quick Book CTA in Sticky Bar */}
          <div className="flex items-center gap-3 shrink-0">
            {price && (
              <span className="hidden lg:inline-block text-xs font-sans text-muted-foreground">
                From <strong className="text-foreground font-bold text-sm font-sans">{price}</strong>
              </span>
            )}
            <a 
              href={bookingLink} 
              className="inline-flex items-center gap-1.5 bg-[#0B1E38] hover:bg-[#071527] text-white font-medium px-4 py-1.5 rounded-full text-xs shadow-sm transition-all border border-[#0B1E38]"
            >
              <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span>Book</span>
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
