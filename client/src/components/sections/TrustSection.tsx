'use client';

import { Award, Gem, ShieldCheck } from 'lucide-react';
import { useSiteContent } from '@/lib/site-content';

export function TrustSection() {
    const { content } = useSiteContent();
    const trustStrip = (content?.about as any)?.trustStrip;

    const items = [
        {
            icon: Award,
            title: trustStrip?.badge1 || 'Government Licensed Mines',
            subtitle: 'Official Mining Authorizations'
        },
        {
            icon: Gem,
            title: trustStrip?.badge2 || 'Certified Gemologists',
            subtitle: 'Master Gemological Guides'
        },
        {
            icon: ShieldCheck,
            title: trustStrip?.badge3 || 'Safety Equipment Provided',
            subtitle: 'Full Gear & Mining Safety Protocols'
        },
    ];

    return (
        <section className="w-full bg-background-alt/50 border-t border-border/70 py-6 sm:py-8 font-sans">
            <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-6">
                    {items.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <div 
                                key={index} 
                                className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-border/80 bg-card/70 dark:bg-card/40 backdrop-blur-xs shadow-2xs hover:border-[#0B1E38]/30 dark:hover:border-blue-500/30 transition-all"
                            >
                                <div className="h-9 w-9 rounded-xl bg-[#0B1E38]/5 dark:bg-white/10 flex items-center justify-center shrink-0 text-[#0B1E38] dark:text-blue-300">
                                    <Icon className="h-4.5 w-4.5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs sm:text-sm font-semibold text-foreground tracking-tight">
                                        {item.title}
                                    </p>
                                    <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate">
                                        {item.subtitle}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

