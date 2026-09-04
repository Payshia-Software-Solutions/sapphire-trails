import { CheckCircle2, Info, ShieldCheck, Sparkles, Shirt, Camera, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TourDetailInclusionsProps {
  inclusions: string[];
}

const PRACTICAL_TIPS = [
  {
    icon: Shirt,
    title: "Recommended Attire",
    desc: "Lightweight, breathable cotton clothing and closed-toe walking shoes suitable for mining sites."
  },
  {
    icon: Camera,
    title: "Photography & Video",
    desc: "Personal photography is welcomed across all mine sites and lapidary workshops."
  },
  {
    icon: ShieldCheck,
    title: "Safety & Equipment",
    desc: "All required underground safety helmets, boots, and illumination gear are provided."
  },
  {
    icon: Info,
    title: "Purchasing Gemstones",
    desc: "Your senior gemologist guide provides independent testing assistance at the local gem market."
  }
];

export function TourDetailInclusions({ inclusions }: TourDetailInclusionsProps) {
  return (
    <div id="inclusions" className="flex flex-col space-y-6 scroll-mt-28">
      
      {/* Column Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-primary mb-2">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Complete Clarity</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground tracking-tight">
          Inclusions &amp; Guidelines
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Everything included in your private tour, with no hidden fees.
        </p>
      </div>

      {/* Inclusions List */}
      <div className="p-6 rounded-2xl bg-background border border-border/80 space-y-4 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          What&apos;s Included In Your Private Tour
        </h3>

        <div className="space-y-3">
          {inclusions.map((item, index) => (
            <div key={index} className="flex items-start gap-3 text-xs sm:text-sm text-foreground/90">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="leading-snug">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* What to Bring / Practical Guidelines */}
      <div className="p-6 rounded-2xl bg-background border border-border/80 space-y-4 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
          <Info className="h-4 w-4 text-primary" />
          What to Bring &amp; Practical Tips
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {PRACTICAL_TIPS.map((tip, idx) => {
            const Icon = tip.icon;
            return (
              <div key={idx} className="p-3.5 rounded-xl bg-background-alt border border-border/60 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                  <span>{tip.title}</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {tip.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
