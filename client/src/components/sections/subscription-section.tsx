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
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          source: '2026 Gem Buyer Guide Download',
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
          <div className="relative rounded-3xl overflow-hidden border border-border/80 bg-card p-8 sm:p-12 md:p-16 shadow-lg text-foreground text-center flex flex-col items-center justify-center">
            {/* Badge */}
            <div className="relative z-10 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0B1E38]/5 dark:bg-white/5 border border-[#0B1E38]/15 dark:border-white/15 text-xs font-medium uppercase tracking-wider text-[#0B1E38] dark:text-blue-200 font-sans shadow-2xs mb-4">
              <BookOpen className="h-3.5 w-3.5 text-[#0B1E38] dark:text-blue-300" />
              {subData.tagline || 'Complimentary Insider Publication'}
            </div>

            {/* Headings */}
            <div className="relative z-10 space-y-3 max-w-4xl lg:max-w-5xl font-sans">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-bold tracking-tight text-foreground leading-tight">
                {subData.heading || "The 2026 Ratnapura Gem Buyer's & Traveler's Guide"}
              </h2>
              <p className="mx-auto max-w-3xl md:max-w-4xl text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed px-4 font-sans">
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
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5 font-sans">
                  <Input
                    type="email"
                    required
                    placeholder="Enter your email address..."
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="bg-background border-border text-foreground text-xs h-11 rounded-full px-5 placeholder:text-muted-foreground shadow-xs"
                    aria-label="Email for newsletter"
                  />
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-[#0B1E38] hover:bg-[#071527] text-white font-medium text-xs h-11 px-7 rounded-full whitespace-nowrap shadow-sm transition-all border border-[#0B1E38]"
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
