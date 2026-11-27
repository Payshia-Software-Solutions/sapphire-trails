'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { ScrollAnimate } from '@/components/shared/scroll-animate';
import { Button } from '@/components/ui/button';
import {
  Award,
  ArrowRight,
  Building2,
  Compass,
  Gem,
  Globe2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

const PARTNER_CATEGORIES = [
  {
    icon: Building2,
    title: 'Boutique Hotels & Villas',
    description: 'Curate private licensed Ratnapura expeditions for your in-house guests.',
  },
  {
    icon: Globe2,
    title: 'Luxury Travel Advisors',
    description: 'Integrate authentic Ceylon gemological journeys into bespoke itineraries.',
  },
  {
    icon: Compass,
    title: 'Guides & Private Chauffeurs',
    description: 'Partner with Sri Lanka’s premier VIP mine operator with transparent tracking.',
  },
  {
    icon: Gem,
    title: 'Past Expedition Members',
    description: 'Extend private guest privileges to fellow collectors and travel companions.',
  },
];

const ENROLLMENT_STEPS = [
  {
    step: '01',
    title: 'Apply via Your Member Portal',
    detail: 'Sign in or create an account and submit your partner category request in under a minute.',
  },
  {
    step: '02',
    title: 'Concierge Verification & Code Activation',
    detail: 'Once approved by our Ratnapura desk, your personal short referral code and link unlock.',
  },
  {
    step: '03',
    title: 'Share & Track Settlements Live',
    detail: 'Referred guests receive an automatic checkout privilege while you track commissions live.',
  },
];

export function ReferralPartnerSection() {
  const { user } = useAuth();
  const targetHref = user
    ? '/profile?tab=referrals'
    : `/auth?redirect=${encodeURIComponent('/profile?tab=referrals')}`;

  return (
    <section
      id="partner-program"
      className="w-full bg-background py-16 md:py-24 relative overflow-hidden border-t border-border/50"
    >
      <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <ScrollAnimate>
          <div className="rounded-3xl overflow-hidden border border-border/80 bg-card shadow-lg grid grid-cols-1 lg:grid-cols-12">
            {/* Left: Editorial Overview & Partner Categories */}
            <div className="lg:col-span-7 p-7 sm:p-10 lg:p-14 flex flex-col justify-between gap-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/25 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                  <Award className="h-3.5 w-3.5 shrink-0" />
                  <span>Global Partner &amp; Referral Program</span>
                </div>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-headline font-bold tracking-tight text-foreground leading-tight">
                  Introduce Guests to Ceylon’s Gem Capital. Earn as an Authorized Partner.
                </h2>

                <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl">
                  Designed for discerning hospitality hosts, international travel advisors, licensed chauffeurs, and returning Sapphire Trails travelers. Approved partners receive a personalized invitation link that unlocks an exclusive privilege for referred guests and tracks verified settlements per booking.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PARTNER_CATEGORIES.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="p-4 rounded-2xl border border-border/70 bg-background-alt/50 hover:border-primary/40 transition-colors flex items-start gap-3.5"
                    >
                      <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="space-y-1 min-w-0">
                        <h3 className="text-xs sm:text-sm font-semibold text-foreground">{item.title}</h3>
                        <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Midnight Sapphire Enrollment Showcase */}
            <div className="lg:col-span-5 bg-[#08111e] text-white p-7 sm:p-10 lg:p-12 flex flex-col justify-between gap-8 relative overflow-hidden border-t lg:border-t-0 lg:border-l border-white/10">
              <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/15 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between gap-2 pb-4 border-b border-white/10">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300 block">
                      Partner Onboarding
                    </span>
                    <h3 className="text-lg sm:text-xl font-headline font-bold text-white mt-0.5">
                      How Partnership Works
                    </h3>
                  </div>
                  <div className="h-9 w-9 rounded-xl bg-primary/20 border border-primary/35 flex items-center justify-center text-amber-300 shrink-0">
                    <Sparkles className="h-4 w-4" />
                  </div>
                </div>

                <div className="space-y-5">
                  {ENROLLMENT_STEPS.map((step) => (
                    <div key={step.step} className="flex items-start gap-3.5">
                      <span className="h-8 w-8 rounded-xl bg-white/10 border border-amber-400/30 text-amber-300 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                        {step.step}
                      </span>
                      <div className="space-y-1">
                        <p className="text-xs sm:text-sm font-semibold text-white">{step.title}</p>
                        <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed">{step.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative z-10 space-y-4 pt-4 border-t border-white/10">
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <Button
                    asChild
                    size="lg"
                    className="flex-1 rounded-xl h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs sm:text-sm shadow-sm"
                  >
                    <Link href={targetHref}>
                      <span>{user ? 'Open Agent Program' : 'Apply as a Partner'}</span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="rounded-xl h-11 border-white/15 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white text-xs sm:text-sm"
                  >
                    <Link href="/contact">Concierge Inquiry</Link>
                  </Button>
                </div>

                <p className="text-[11px] text-slate-400 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>30-day attribution window &bull; Commercial terms unlock upon admin approval.</span>
                </p>
              </div>
            </div>
          </div>
        </ScrollAnimate>
      </div>
    </section>
  );
}
