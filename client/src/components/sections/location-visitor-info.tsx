'use client';

import { Card, CardContent } from "@/components/ui/card";
import { 
  Clock, 
  CalendarDays, 
  Ticket, 
  Users, 
  Compass, 
  MapPin, 
  ShieldCheck, 
  AlertTriangle, 
  Info,
  Sun,
  Camera,
  Layers
} from 'lucide-react';
import type { LucideIcon } from "lucide-react";

interface Info {
  icon: string;
  title: string;
  line1: string;
  line2: string;
}

interface LocationVisitorInfoProps {
  visitorInfo: Info[];
}

const ICON_MAP: Record<string, LucideIcon> = {
  Clock,
  CalendarDays,
  Ticket,
  Users,
  Compass,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  Info,
  Sun,
  Camera,
  Layers
};

export function LocationVisitorInfo({ visitorInfo }: LocationVisitorInfoProps) {
  if (!visitorInfo || visitorInfo.length === 0) {
    return null;
  }

  return (
    <section id="visitor-info" className="w-full py-16 sm:py-24 bg-background border-b border-border/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-primary mb-2">
            <Info className="h-3.5 w-3.5" />
            <span>Essential Travel Details</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-serif text-foreground tracking-tight">
            Practical Visitor Information
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Key guidance to help you prepare for a comfortable and unforgettable visit.
          </p>
        </div>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {visitorInfo.map((info, index) => {
            const Icon = ICON_MAP[info.icon] || Info;
            return (
              <Card 
                key={index} 
                className="bg-background-alt border-border/80 hover:border-primary/50 transition-all duration-300 rounded-2xl p-6 flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-mono uppercase text-muted-foreground">Guide #{index + 1}</span>
                  </div>

                  <h3 className="text-base font-bold font-serif text-foreground mb-3">
                    {info.title}
                  </h3>

                  <div className="space-y-1 text-xs sm:text-sm">
                    {info.line1 && (
                      <p className="font-semibold text-foreground">
                        {info.line1}
                      </p>
                    )}
                    {info.line2 && (
                      <p className="text-muted-foreground text-xs leading-relaxed">
                        {info.line2}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-3 mt-4 border-t border-border/50 flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Verified Advice</span>
                </div>
              </Card>
            );
          })}
        </div>

      </div>
    </section>
  );
}