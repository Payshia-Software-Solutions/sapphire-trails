'use client';

import { CheckCircle } from 'lucide-react';
import { useSiteContent } from '@/lib/site-content';

const defaultTrustPoints = [
    { text: 'Government Licensed Mines' },
    { text: 'Certified Gemologists' },
    { text: 'Safety Equipment Provided' },
];

export function TrustSection() {
    const { content } = useSiteContent();
    const trustStrip = content.about.trustStrip;

    const points = [
        trustStrip?.badge1 || 'Government Licensed Mines',
        trustStrip?.badge2 || 'Certified Gemologists',
        trustStrip?.badge3 || 'Safety Equipment Provided',
    ];

    return (
        <section className="w-full bg-background py-8 border-t border-border/60">
            <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-8 text-center">
                    {points.map((pt, index) => (
                        <div key={index} className="flex items-center justify-center gap-2">
                            <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                            <span className="text-sm font-medium text-muted-foreground">{pt}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

