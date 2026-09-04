'use client';

import Image from 'next/image';

export function PreLoader() {
  return (
    <div className="relative flex flex-col items-center justify-center p-6 text-center select-none">
      {/* Animated Ring Container */}
      <div className="relative flex items-center justify-center w-28 h-28 sm:w-32 sm:h-32">
        {/* Soft Ambient Glow Behind Logo */}
        <div className="absolute inset-0 rounded-full bg-primary/10 blur-xl animate-pulse" />
        
        {/* Outer Expanding Pulse Ring */}
        <div className="absolute inset-0 rounded-full border border-primary/25 animate-ping opacity-40" />
        
        {/* Rotating Luxury Golden Accent Ring */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary/80 border-r-primary/40 animate-spin" style={{ animationDuration: '2.5s' }} />
        
        {/* Inner Subtle Border Ring */}
        <div className="absolute inset-2 rounded-full border border-border/60 bg-background/50 backdrop-blur-sm shadow-inner flex items-center justify-center">
          {/* Official Sapphire Trails Logo */}
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 animate-gem-pulse flex items-center justify-center">
            <Image
              src="/img/logo4.png"
              alt="Sapphire Trails Logo"
              width={70}
              height={70}
              priority
              className="object-contain drop-shadow-[0_2px_10px_rgba(199,153,84,0.35)]"
            />
          </div>
        </div>
      </div>

      {/* Brand Typography */}
      <div className="mt-5 space-y-1">
        <h3 className="font-serif text-sm sm:text-base font-bold tracking-[0.25em] text-primary uppercase">
          SAPPHIRE TRAILS
        </h3>
        <p className="text-[10px] sm:text-[11px] uppercase tracking-widest text-muted-foreground font-sans">
          Luxury Gem Expeditions
        </p>
      </div>

      {/* Subtle Luxury Loading Progress Indicator */}
      <div className="w-24 h-0.5 bg-border/80 rounded-full mt-3 overflow-hidden">
        <div className="w-full h-full bg-gradient-to-r from-transparent via-primary to-transparent animate-top-loading-bar" />
      </div>
    </div>
  );
}

