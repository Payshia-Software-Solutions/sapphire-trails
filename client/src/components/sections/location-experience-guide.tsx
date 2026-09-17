'use client';

import { 
  Leaf, 
  Mountain, 
  Bird, 
  Home, 
  Clock, 
  CalendarDays, 
  Ticket, 
  Users, 
  AlertTriangle, 
  Gem, 
  Waves, 
  Landmark, 
  Camera, 
  Tent, 
  Thermometer, 
  MapPin, 
  Sparkles, 
  Award, 
  Compass, 
  Info, 
  ShieldCheck 
} from 'lucide-react';
import type { LucideIcon } from "lucide-react";

interface Highlight {
  icon: string;
  title: string;
  description: string;
}

interface VisitorInfoItem {
  icon: string;
  title: string;
  line1: string;
  line2: string;
}

interface LocationExperienceGuideProps {
  highlights?: Highlight[];
  visitorInfo?: VisitorInfoItem[];
}

const ICON_MAP: Record<string, LucideIcon> = {
  Leaf,
  Mountain,
  Bird,
  Home,
  Clock,
  CalendarDays,
  Ticket,
  Users,
  AlertTriangle,
  Gem,
  Waves,
  Landmark,
  Camera,
  Tent,
  Thermometer,
  MapPin,
  Sparkles,
  Award,
  Compass,
  Info,
  ShieldCheck
};

export function LocationExperienceGuide({ highlights = [], visitorInfo = [] }: LocationExperienceGuideProps) {
  const hasHighlights = highlights && highlights.length > 0;
  const hasVisitorInfo = visitorInfo && visitorInfo.length > 0;

  if (!hasHighlights && !hasVisitorInfo) {
    return null;
  }

  return (
    <section id="highlights" className="w-full py-12 sm:py-16 bg-background border-b border-border/60 scroll-mt-28">
      <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* ======================================================== */}
          {/* LEFT: KEY EXPERIENCE HIGHLIGHTS (CLEAN MINIMAL LIST) */}
          {/* ======================================================== */}
          {hasHighlights && (
            <div className={`${hasVisitorInfo ? 'lg:col-span-6' : 'lg:col-span-12'} space-y-4`}>
              <div className="flex items-center gap-2 pb-2.5 border-b border-border/60">
                <Sparkles className="h-4 w-4 text-[#0B1E38] dark:text-blue-400" />
                <h3 className="text-base sm:text-lg font-semibold uppercase tracking-wider text-foreground">
                  Key Experience Highlights
                </h3>
              </div>

              <ul className="divide-y divide-border/40">
                {highlights.map((item, idx) => {
                  const Icon = ICON_MAP[item.icon] || Sparkles;
                  return (
                    <li key={idx} className="py-3.5 flex items-start gap-3.5 group">
                      <div className="h-8 w-8 rounded-xl bg-[#0B1E38]/10 dark:bg-blue-950/40 flex items-center justify-center text-[#0B1E38] dark:text-blue-400 shrink-0 mt-0.5 group-hover:bg-[#0B1E38] group-hover:text-white transition-colors">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="space-y-0.5 flex-1">
                        <h4 className="text-xs sm:text-sm font-semibold tracking-wide text-foreground">
                          {item.title}
                        </h4>
                        {item.description && (
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* ======================================================== */}
          {/* RIGHT: PRACTICAL VISITOR GUIDE (CLEAN MINIMAL LIST) */}
          {/* ======================================================== */}
          {hasVisitorInfo && (
            <div id="visitor-info" className={`${hasHighlights ? 'lg:col-span-6' : 'lg:col-span-12'} space-y-4`}>
              <div className="flex items-center gap-2 pb-2.5 border-b border-border/60">
                <Info className="h-4 w-4 text-[#0B1E38] dark:text-blue-400" />
                <h3 className="text-base sm:text-lg font-semibold uppercase tracking-wider text-foreground">
                  Practical Visitor Guide
                </h3>
              </div>

              <ul className="divide-y divide-border/40">
                {visitorInfo.map((item, idx) => {
                  const Icon = ICON_MAP[item.icon] || Info;
                  return (
                    <li key={idx} className="py-3.5 flex items-start gap-3.5 group">
                      <div className="h-8 w-8 rounded-xl bg-[#0B1E38]/10 dark:bg-blue-950/40 flex items-center justify-center text-[#0B1E38] dark:text-blue-400 shrink-0 mt-0.5 group-hover:bg-[#0B1E38] group-hover:text-white transition-colors">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="space-y-0.5 flex-1">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground block">
                          {item.title}
                        </span>
                        {item.line1 && (
                          <p className="text-xs sm:text-sm font-semibold text-foreground">
                            {item.line1}
                          </p>
                        )}
                        {item.line2 && (
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {item.line2}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

        </div>

      </div>
    </section>
  );
}
