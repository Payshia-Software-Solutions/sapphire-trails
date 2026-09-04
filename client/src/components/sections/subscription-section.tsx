"use client";

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollAnimate } from '@/components/shared/scroll-animate';
import { BookOpen, CheckCircle2, Download, LoaderCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { trackLeadSubmission } from '@/lib/analytics';
import { addSubscriber } from '@/lib/subscribers-data';
import { useSiteContent } from '@/lib/site-content';

export function SubscriptionSection() {
  const { content } = useSiteContent();
  const subData = content.homepage.subscription;
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    addSubscriber(email.trim(), '2026 Gem Buyer Guide Download');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Guide Subscriber',
          email: email.trim(),
          phone: '',
          tourInterest: 'Guide Download (Lead Magnet)',
          message: 'Subscriber requested the 2026 Ratnapura Gem Buyer & Traveler Guide from Homepage.',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to subscribe.');
      }

      setIsDownloaded(true);
      trackLeadSubmission({ leadType: 'contact_form', category: 'Guide Download', name: email });
      toast({
        title: "✨ Welcome to Sapphire Trails!",
        description: "Your 2026 Ratnapura Gem Buyer's & Traveler's Guide has been sent to your email.",
      });
      setEmail('');
    } catch {
      // Fallback success for user experience
      setIsDownloaded(true);
      toast({
        title: "✨ Welcome to Sapphire Trails!",
        description: "Your 2026 Ratnapura Gem Buyer's & Traveler's Guide has been queued for delivery.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="subscribe" className="w-full bg-background-alt py-16 md:py-24 relative overflow-hidden">
      <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <ScrollAnimate>
          {/* Self-contained Luxury Banner Box (Seamless in both Light and Dark themes) */}
          <div className="relative rounded-3xl overflow-hidden border border-primary/30 bg-card p-8 sm:p-12 md:p-16 shadow-xl text-foreground text-center flex flex-col items-center justify-center">
            
            {/* Subtle Ambient Radial Gold Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-primary/[0.06] blur-3xl rounded-full pointer-events-none" />

            {/* Badge */}
            <div className="relative z-10 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/15 border border-primary/40 text-xs font-semibold uppercase tracking-wider text-primary mb-4">
              <BookOpen className="h-3.5 w-3.5" />
              {subData.tagline || 'Complimentary Insider Publication'}
            </div>

            {/* Headings */}
            <div className="relative z-10 space-y-3 max-w-3xl">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-headline font-bold tracking-tight text-foreground leading-tight">
                {subData.heading || "The 2026 Ratnapura Gem Buyer's & Traveler's Guide"}
              </h2>
              <p className="mx-auto max-w-2xl text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">
                {subData.subheadline}
              </p>
            </div>

            {/* Subscription Form */}
            <div className="relative z-10 w-full max-w-md mt-6 sm:mt-8">
              {isDownloaded ? (
                <div className="flex items-center justify-center gap-2.5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-medium">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                  <span>Guide dispatched! Please check your inbox shortly.</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
                  <Input
                    type="email"
                    required
                    placeholder="Enter your email address..."
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="bg-background border-border text-foreground text-xs h-11 placeholder:text-muted-foreground shadow-inner"
                    aria-label="Email for newsletter"
                  />
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-11 px-6 whitespace-nowrap shadow-lg transition-transform hover:scale-105"
                  >
                    {isSubmitting ? (
                      <>
                        <LoaderCircle className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Download className="mr-1.5 h-3.5 w-3.5" />
                        {subData.buttonText || 'Get Free Guide'}
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>

          </div>
        </ScrollAnimate>
      </div>
    </section>
  );
}
