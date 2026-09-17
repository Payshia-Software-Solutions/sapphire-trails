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
      className="sticky z-40 w-full bg-background/98 backdrop-blur-md border-b border-border/80 shadow-sm transition-[top] duration-150 ease-out"
    >
      <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 py-2.5 overflow-x-auto no-scrollbar">
          
          {/* Section Navigation Links */}
          <nav className="flex items-center gap-1.5 sm:gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap">
            <a 
              href="#overview" 
              className={`px-3.5 py-1.5 rounded-full transition-all ${activeSection === 'overview' ? 'bg-[#0B1E38] text-white dark:bg-blue-600 font-semibold' : 'hover:text-foreground'}`}
            >
              Overview
            </a>
            <a 
              href="#highlights" 
              className={`px-3.5 py-1.5 rounded-full transition-all ${activeSection === 'highlights' ? 'bg-[#0B1E38] text-white dark:bg-blue-600 font-semibold' : 'hover:text-foreground'}`}
            >
              Highlights &amp; Guide
            </a>
            <a 
              href="#gallery" 
              className={`px-3.5 py-1.5 rounded-full transition-all ${activeSection === 'gallery' ? 'bg-[#0B1E38] text-white dark:bg-blue-600 font-semibold' : 'hover:text-foreground'}`}
            >
              Photo Gallery
            </a>
            <a 
              href="#map-location" 
              className={`px-3.5 py-1.5 rounded-full transition-all ${activeSection === 'map-location' ? 'bg-[#0B1E38] text-white dark:bg-blue-600 font-semibold' : 'hover:text-foreground'}`}
            >
              Map &amp; Nearby
            </a>
          </nav>

          {/* Quick Book CTA in Sticky Bar */}
          <div className="shrink-0">
            <a 
              href="#book-experience" 
              className="inline-flex items-center gap-1.5 bg-[#0B1E38] hover:bg-[#071527] text-white font-medium px-4 py-1.5 rounded-full text-xs shadow-sm transition-all"
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
