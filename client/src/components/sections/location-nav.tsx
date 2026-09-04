'use client';

import { useState, useEffect } from 'react';
import { Compass, Sparkles, MapPin, Camera, BookOpen, Layers } from 'lucide-react';

interface LocationNavProps {
  locationTitle?: string;
}

export function LocationNav({ locationTitle }: LocationNavProps) {
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

      const sections = ['overview', 'highlights', 'gallery', 'map-location', 'book-experience'];
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 py-3 overflow-x-auto no-scrollbar">
          
          {/* Section Navigation Links */}
          <nav className="flex items-center gap-2 sm:gap-6 text-xs font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap">
            <a 
              href="#overview" 
              className={`px-3 py-1.5 rounded-md transition-all ${activeSection === 'overview' ? 'text-primary font-bold bg-primary/10' : 'hover:text-foreground'}`}
            >
              Overview
            </a>
            <a 
              href="#highlights" 
              className={`px-3 py-1.5 rounded-md transition-all ${activeSection === 'highlights' ? 'text-primary font-bold bg-primary/10' : 'hover:text-foreground'}`}
            >
              Highlights &amp; Guide
            </a>
            <a 
              href="#gallery" 
              className={`px-3 py-1.5 rounded-md transition-all ${activeSection === 'gallery' ? 'text-primary font-bold bg-primary/10' : 'hover:text-foreground'}`}
            >
              Photo Gallery
            </a>
            <a 
              href="#map-location" 
              className={`px-3 py-1.5 rounded-md transition-all ${activeSection === 'map-location' ? 'text-primary font-bold bg-primary/10' : 'hover:text-foreground'}`}
            >
              Map &amp; Nearby
            </a>
          </nav>

          {/* Quick Book CTA in Sticky Bar */}
          <div className="shrink-0">
            <a 
              href="#book-experience" 
              className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 py-1.5 rounded-full text-xs shadow-sm transition-all"
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Book Tour</span>
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
