'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { TrustSection } from '@/components/sections/TrustSection';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Calendar, 
  Users, 
  CreditCard, 
  Mail, 
  Phone, 
  Compass, 
  Gem, 
  ShieldCheck, 
  Clock, 
  MessageCircle, 
  User, 
  ArrowRight,
  LoaderCircle,
  FileText
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { API_BASE_URL } from '@/lib/utils';
import { trackBookingSuccess } from '@/lib/analytics';
import { type Booking } from '@/lib/bookings-data';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');

  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    async function fetchBookingData() {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/bookings/${id}`);
        if (res.ok) {
          const json = await res.json();
          const b = json.booking || json;
          const mappedBooking: Booking = {
            id: Number(b.id),
            user_id: b.user_id,
            name: b.name,
            email: b.email,
            phone: b.phone,
            address: b.address,
            tourType: Number(b.tour_package_id),
            tourTitle: b.tour_title || `Tour Package #${b.tour_package_id}`,
            tourImage: b.tour_image_url || undefined,
            tourSlug: b.tour_slug || undefined,
            adults: Number(b.adults || 1),
            children: Number(b.children || 0),
            guests: Number(b.guests || 1),
            date: b.tour_date,
            end_date: b.end_date,
            message: b.message,
            status: b.status || 'pending',
            invoice_number: b.invoice_number,
            invoice_payment_status: b.invoice_payment_status,
            invoice_total: b.invoice_total,
          };
          setBooking(mappedBooking);

          // Trigger Meta Pixel & GA4 purchase tracking on confirmation page (only once per session)
          if (!trackedRef.current) {
            trackedRef.current = true;
            const priceVal = b.invoice_total ? Number(b.invoice_total) : (mappedBooking.guests * 120);
            trackBookingSuccess({
              bookingId: mappedBooking.id,
              tourName: mappedBooking.tourTitle || 'Gem Tour Expedition',
              tourId: mappedBooking.tourType,
              totalValue: priceVal,
              guests: mappedBooking.guests,
              currency: 'USD',
            });
          }
        }
      } catch (err) {
        console.error('Failed to load confirmation details:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchBookingData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <LoaderCircle className="h-10 w-10 text-primary animate-spin" />
        <p className="text-sm font-medium">Generating your official expedition confirmation...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-16">
      
      {/* Top Luxury Success Banner */}
      <div className="text-center space-y-4 mb-8 sm:mb-10">
        
        {/* Animated Checkmark Emblem */}
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-primary/20 border-2 border-primary ring-8 ring-primary/10 text-primary shadow-xl animate-in zoom-in-95 duration-500">
          <CheckCircle2 className="h-10 w-10 text-primary" />
        </div>

        {/* Diamond accents */}
        <div className="flex items-center justify-center gap-1.5 opacity-80">
          <Gem className="h-3.5 w-3.5 text-primary" />
          <Gem className="h-4 w-4 text-primary" />
          <Gem className="h-3.5 w-3.5 text-primary" />
        </div>

        <div className="space-y-2">
          <Badge variant="outline" className="border-primary/40 text-primary font-mono text-[11px] px-3 py-0.5">
            CONVERSION VERIFIED &bull; RESERVATION #{booking?.id || id || 'CONFIRMED'}
          </Badge>
          <h1 className="text-2xl sm:text-4xl font-headline font-bold text-foreground tracking-tight">
            Booking Request Received!
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
            Thank you{booking?.name ? `, ${booking.name}` : ''}. We have received your expedition reservation request. Our luxury concierge team is coordinating logistics and will confirm availability shortly.
          </p>
        </div>
      </div>

      {/* Main Reservation Summary Card */}
      <Card className="border-border/80 shadow-xl overflow-hidden rounded-2xl bg-card">
        <div className="bg-primary/10 border-b border-primary/20 px-5 py-3 flex items-center justify-between">
          <span className="text-xs font-semibold text-primary font-serif flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4" /> Official Reservation Summary
          </span>
          <span className="text-[10px] font-mono text-muted-foreground uppercase">
            Status: <span className="text-amber-500 font-bold">Pending Review</span>
          </span>
        </div>

        <CardContent className="p-5 sm:p-7 space-y-5">
          
          {/* Tour Title & Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-border/60">
            <div className="flex items-center gap-3">
              {booking?.tourImage && (
                <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-border/80 shrink-0 bg-slate-900 shadow-sm">
                  <Image
                    src={booking.tourImage}
                    alt={booking.tourTitle || 'Tour Package'}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
              )}
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Expedition Package</span>
                <p className="font-headline font-bold text-base sm:text-lg text-foreground mt-0.5 leading-snug line-clamp-2">
                  {booking?.tourTitle || 'Gem Mine Tour in Ratnapura'}
                </p>
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Preferred Tour Date</span>
              <p className="font-semibold text-sm sm:text-base text-foreground mt-0.5 flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-primary" />
                {booking?.date ? format(parseISO(booking.date), 'MMMM dd, yyyy') : 'Date to be confirmed'}
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-4 border-b border-border/60 text-xs">
            <div>
              <span className="text-[10px] text-muted-foreground block">Guests / Travelers</span>
              <p className="font-semibold text-foreground mt-0.5 flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-primary" />
                {booking?.guests || 1} Person{booking?.guests !== 1 ? 's' : ''}
              </p>
            </div>

            <div>
              <span className="text-[10px] text-muted-foreground block">Estimated Total</span>
              <p className="font-mono font-bold text-sm text-primary mt-0.5">
                {booking?.invoice_total ? `USD ${booking.invoice_total}` : (booking?.guests ? `USD ${(booking.guests * 120).toLocaleString()}` : '$120+')}
              </p>
              <span className="text-[9px] text-muted-foreground">(Pay on Arrival / Invoice)</span>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <span className="text-[10px] text-muted-foreground block">Lead Contact</span>
              <p className="font-semibold text-foreground mt-0.5 truncate">{booking?.name || 'Valued Guest'}</p>
              <p className="text-[11px] text-muted-foreground truncate">{booking?.email}</p>
              {booking?.phone && <p className="text-[11px] font-mono text-muted-foreground">{booking?.phone}</p>}
            </div>
          </div>

          {/* Special Requests */}
          {booking?.message && (
            <div className="p-3 rounded-xl bg-muted/40 border text-xs text-muted-foreground space-y-1">
              <span className="font-semibold text-foreground text-[11px] block">Special Requests &amp; Notes:</span>
              <p className="italic text-[11px]">&quot;{booking.message}&quot;</p>
            </div>
          )}

          {/* What Happens Next - Concierge Steps */}
          <div className="pt-2">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-primary" /> What Happens Next?
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-muted/30 border border-border/70 space-y-1">
                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center">1</span>
                <p className="font-semibold text-foreground text-[11px]">Concierge Review</p>
                <p className="text-[10px] text-muted-foreground">Our master gemologist verifies pit access and safety gear.</p>
              </div>

              <div className="p-3 rounded-xl bg-muted/30 border border-border/70 space-y-1">
                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center">2</span>
                <p className="font-semibold text-foreground text-[11px]">WhatsApp / Email</p>
                <p className="text-[10px] text-muted-foreground">You receive your verified voucher and pickup time details.</p>
              </div>

              <div className="p-3 rounded-xl bg-muted/30 border border-border/70 space-y-1">
                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center">3</span>
                <p className="font-semibold text-foreground text-[11px]">Expedition Day</p>
                <p className="text-[10px] text-muted-foreground">Private transport arrives at your hotel for the tour.</p>
              </div>
            </div>
          </div>

          {/* Direct WhatsApp Concierge Help Strip */}
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
                <MessageCircle className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Need immediate assistance or customized transport?</p>
                <p className="text-[11px] text-muted-foreground">Our luxury concierge team is live on WhatsApp 24/7.</p>
              </div>
            </div>
            <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs h-8 px-3.5 shrink-0 shadow-xs">
              <a href="https://wa.me/94712357700" target="_blank" rel="noopener noreferrer">
                Chat on WhatsApp
              </a>
            </Button>
          </div>

        </CardContent>

        {/* Action Buttons Footer */}
        <div className="p-4 sm:p-6 bg-muted/20 border-t border-border/70 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl text-xs h-10 px-5 shadow-md">
            <Link href="/profile">
              <User className="mr-1.5 h-3.5 w-3.5" /> View in My Profile Portal
            </Link>
          </Button>

          <Button asChild variant="outline" className="border-border hover:border-primary/40 rounded-xl text-xs h-10 px-4">
            <Link href="/tours">
              <Compass className="mr-1.5 h-3.5 w-3.5" /> Explore Other Tours
            </Link>
          </Button>
        </div>
      </Card>

    </div>
  );
}

export default function BookingConfirmationPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 bg-background-alt">
        <Suspense fallback={
          <div className="py-24 flex items-center justify-center">
            <LoaderCircle className="h-8 w-8 text-primary animate-spin" />
          </div>
        }>
          <ConfirmationContent />
        </Suspense>
      </main>
      <TrustSection />
      <Footer />
    </div>
  );
}
