'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { TrustSection } from '@/components/sections/TrustSection';
import { format, parseISO } from 'date-fns';
import { type Booking } from '@/lib/bookings-data';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  LoaderCircle, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Users, 
  Clock, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  Printer, 
  Compass, 
  ShieldCheck, 
  MessageCircle, 
  FileText,
  Gem,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/utils';

const IMAGE_BASE_URL = 'https://content-provider.payshia.com/sapphire-trail';
const getFullImageUrl = (path?: string | null) => {
  if (!path) return 'https://content-provider.payshia.com/sapphire-trail/images/img4.webp';
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  const cleanBase = IMAGE_BASE_URL.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
};

interface ExtendedBooking extends Booking {
  tour_image_url?: string;
  tour_hero_image?: string;
  tour_duration?: string;
  tour_price?: number;
}

export default function PublicBookingViewPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const id = params.id as string;

  const [booking, setBooking] = useState<ExtendedBooking | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    async function fetchBooking() {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/bookings/${id}`);
        if (!response.ok) throw new Error('Booking not found');

        const serverBooking = await response.json();
        const b = serverBooking.booking || serverBooking;
        const rawImg = b.tour_hero_image || b.tour_image_url;
        const resolvedImage = getFullImageUrl(rawImg);

        const clientBooking: ExtendedBooking = {
          id: Number(b.id),
          user_id: b.user_id,
          name: b.name || 'Valued Explorer',
          email: b.email,
          phone: b.phone,
          address: b.address,
          tourType: Number(b.tour_package_id),
          tourTitle: b.tour_title || 'Sapphire Trails Expedition',
          tourImage: resolvedImage,
          tour_hero_image: resolvedImage,
          tour_image_url: resolvedImage,
          tour_duration: b.tour_duration || 'Full Day Expedition',
          tour_price: b.tour_price ? Number(b.tour_price) : 150,
          tourSlug: b.tour_slug,
          adults: Number(b.adults || b.guests || 1),
          children: Number(b.children || 0),
          guests: Number(b.guests || 1),
          date: b.tour_date || b.date,
          message: b.message,
          status: b.status || 'pending',
          invoice_total: b.invoice_total ? Number(b.invoice_total) : null,
        };
        setBooking(clientBooking);
      } catch (error) {
        console.error('Failed to load booking data:', error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to load booking data.' });
        setBooking(null);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBooking();
  }, [id, toast]);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'accepted':
      case 'confirmed':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 px-3 py-1 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Confirmed
          </Badge>
        );
      case 'rejected':
      case 'cancelled':
        return (
          <Badge className="bg-red-500/10 text-red-400 border-red-500/30 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
            Cancelled
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
            Completed
          </Badge>
        );
      case 'pending':
      default:
        return (
          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 px-3 py-1 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            Pending Verification
          </Badge>
        );
    }
  };

  const totalEstimate = booking
    ? booking.invoice_total && booking.invoice_total > 0
      ? booking.invoice_total
      : (booking.tour_price || 150) * booking.guests
    : 0;

  return (
    <div className="flex min-h-screen flex-col bg-[#06090e] text-slate-100 selection:bg-amber-500/30 selection:text-amber-200">
      <div className="print:hidden">
        <Header />
      </div>

      <main className="flex-1 py-8 md:py-16 px-4 md:px-6 relative overflow-hidden">
        {/* Background ambient luxury glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="container mx-auto max-w-4xl">
          {/* Top Bar Actions (Hidden on Print) */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 print:hidden">
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-amber-400 transition-colors group"
            >
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to Sapphire Trails Home
            </button>

            {booking && (
              <div className="flex items-center gap-3">
                <Button
                  onClick={handlePrint}
                  variant="outline"
                  size="sm"
                  className="bg-slate-900/80 border-slate-800 hover:border-amber-500/40 text-slate-200 hover:text-amber-400 hover:bg-slate-800 transition-all shadow-sm"
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print Official Voucher
                </Button>
                <Link href="/profile">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-semibold shadow-lg shadow-amber-500/20"
                  >
                    Client Portal
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
              <LoaderCircle className="animate-spin h-10 w-10 text-amber-400" />
              <p className="text-slate-400 text-sm tracking-wide">Retrieving expedition reservation credentials...</p>
            </div>
          ) : !booking ? (
            <div className="bg-[#0b1019] border border-slate-800 rounded-3xl p-8 md:p-12 text-center max-w-lg mx-auto shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-500">
                <Compass className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-white mb-2">Reservation Record Not Found</h2>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                We could not locate this booking voucher. It may have been archived or the reference number is invalid.
              </p>
              <Button
                onClick={() => router.push('/')}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-semibold"
              >
                Return to Homepage
              </Button>
            </div>
          ) : (
            /* Main Expedition Voucher Passport */
            <div className="bg-[#0b1019] border border-amber-500/20 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden relative backdrop-blur-sm print:border-black print:bg-white print:text-black print:shadow-none">
              
              {/* Gold Crest Header Ribbon */}
              <div className="bg-gradient-to-r from-slate-900 via-[#131c2c] to-slate-900 border-b border-amber-500/20 px-6 py-4 flex flex-wrap items-center justify-between gap-4 print:bg-slate-100 print:border-b-2 print:border-black">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center shadow-inner">
                    <Gem className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-[0.25em] text-amber-400/80 font-bold block">
                      Official Expedition Voucher
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Ref ID: <strong className="text-white font-semibold">#ST-BK-{booking.id}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(booking.status)}
                </div>
              </div>

              {/* Tour Cover Hero Banner */}
              <div className="relative h-64 md:h-72 w-full overflow-hidden bg-slate-950">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={booking.tourImage || 'https://content-provider.payshia.com/sapphire-trail/images/img4.webp'}
                  alt={booking.tourTitle || 'Expedition'}
                  className="w-full h-full object-cover object-center transform scale-105 filter brightness-[0.75] contrast-[1.05]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b1019] via-[#0b1019]/40 to-transparent" />

                <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-amber-500/30 text-amber-300 text-xs font-medium mb-2.5">
                      <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                      Curated Ceylon Expedition
                    </div>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-white tracking-wide text-shadow-sm">
                      {booking.tourTitle}
                    </h1>
                    <p className="flex items-center text-xs md:text-sm text-slate-300 mt-1.5 gap-2">
                      <MapPin className="h-4 w-4 text-amber-400 shrink-0" />
                      <span>Ratnapura & Sabaragamuwa Gem Valley, Sri Lanka</span>
                    </p>
                  </div>

                  <div className="hidden md:flex flex-col items-end">
                    <span className="text-xs uppercase tracking-wider text-slate-400">Expedition Timing</span>
                    <span className="text-sm font-semibold text-amber-300 flex items-center gap-1.5 mt-0.5">
                      <Clock className="h-4 w-4" />
                      {booking.tour_duration}
                    </span>
                  </div>
                </div>
              </div>

              {/* Main Voucher Body Content */}
              <div className="p-6 md:p-8 space-y-8">
                
                {/* 2-Column Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Left Column: Expedition Logistics */}
                  <div className="bg-[#0f1726]/80 border border-slate-800/80 rounded-2xl p-5 space-y-4 relative group hover:border-amber-500/20 transition-all">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400 flex items-center gap-2">
                        <Compass className="h-4 w-4 text-amber-400" />
                        Expedition Itinerary
                      </h3>
                      <span className="text-[11px] text-slate-400 font-mono">01 / LOGISTICS</span>
                    </div>

                    <div className="space-y-3.5 pt-1 text-sm">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-slate-400 flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-slate-500 shrink-0" />
                          Tour Date
                        </span>
                        <span className="font-semibold text-white text-right">
                          {booking.date ? format(parseISO(booking.date), 'EEEE, MMMM do, yyyy') : 'Pending Confirmation'}
                        </span>
                      </div>

                      <div className="flex items-start justify-between gap-2">
                        <span className="text-slate-400 flex items-center gap-2">
                          <Clock className="h-4 w-4 text-slate-500 shrink-0" />
                          Morning Departure
                        </span>
                        <span className="font-semibold text-amber-300 text-right">
                          07:30 AM (Concierge will confirm)
                        </span>
                      </div>

                      <div className="flex items-start justify-between gap-2">
                        <span className="text-slate-400 flex items-center gap-2">
                          <Users className="h-4 w-4 text-slate-500 shrink-0" />
                          Party Size
                        </span>
                        <span className="font-medium text-white text-right">
                          {booking.guests} {booking.guests === 1 ? 'Explorer' : 'Explorers'}
                          <span className="text-xs text-slate-400 block font-normal">
                            ({booking.adults} Adults{booking.children ? `, ${booking.children} Children` : ''})
                          </span>
                        </span>
                      </div>

                      <div className="flex items-start justify-between gap-2 pt-2 border-t border-slate-800/60">
                        <span className="text-slate-400 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-slate-500 shrink-0" />
                          Estimated Total
                        </span>
                        <span className="text-base font-bold text-emerald-400 text-right">
                          ${totalEstimate.toLocaleString()} <span className="text-xs font-normal text-slate-400">USD</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Lead Explorer Profile */}
                  <div className="bg-[#0f1726]/80 border border-slate-800/80 rounded-2xl p-5 space-y-4 relative group hover:border-amber-500/20 transition-all">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400 flex items-center gap-2">
                        <User className="h-4 w-4 text-amber-400" />
                        Lead Explorer Profile
                      </h3>
                      <span className="text-[11px] text-slate-400 font-mono">02 / GUEST</span>
                    </div>

                    <div className="space-y-3.5 pt-1 text-sm">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-slate-400 flex items-center gap-2">
                          <User className="h-4 w-4 text-slate-500 shrink-0" />
                          Full Name
                        </span>
                        <span className="font-semibold text-white text-right">{booking.name}</span>
                      </div>

                      <div className="flex items-start justify-between gap-2">
                        <span className="text-slate-400 flex items-center gap-2">
                          <Mail className="h-4 w-4 text-slate-500 shrink-0" />
                          Email Address
                        </span>
                        <span className="font-mono text-xs text-slate-200 text-right break-all">{booking.email}</span>
                      </div>

                      <div className="flex items-start justify-between gap-2">
                        <span className="text-slate-400 flex items-center gap-2">
                          <Phone className="h-4 w-4 text-slate-500 shrink-0" />
                          Phone Number
                        </span>
                        <span className="font-mono text-xs text-slate-200 text-right">
                          {booking.phone || 'Provided via Concierge'}
                        </span>
                      </div>

                      <div className="flex items-start justify-between gap-2 pt-2 border-t border-slate-800/60">
                        <span className="text-slate-400 flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-slate-500 shrink-0" />
                          Pickup Location
                        </span>
                        <span className="text-xs text-slate-300 text-right">
                          {booking.address || 'Ratnapura Hotel / Designated Meeting Point'}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Special Request Box if exists */}
                {booking.message && (
                  <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-sm">
                    <p className="text-xs uppercase tracking-wider text-amber-400/90 font-bold mb-1 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                      Special Expedition Preferences
                    </p>
                    <p className="text-slate-300 italic whitespace-pre-line">“{booking.message}”</p>
                  </div>
                )}

                {/* 3-Step "What Happens Next?" Guide */}
                <div className="border-t border-slate-800/80 pt-6">
                  <h4 className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold mb-4 text-center">
                    Expedition Preparation Protocol
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-center space-y-1.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto text-xs font-bold">
                        1
                      </div>
                      <p className="text-xs font-semibold text-white">Booking Recorded</p>
                      <p className="text-[11px] text-slate-400 leading-normal">
                        Your expedition request has been logged in our reservation system.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-center space-y-1.5">
                      <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto text-xs font-bold">
                        2
                      </div>
                      <p className="text-xs font-semibold text-white">Concierge Briefing</p>
                      <p className="text-[11px] text-slate-400 leading-normal">
                        Our tour coordinator will reach out via WhatsApp/Email to confirm timing.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-center space-y-1.5">
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto text-xs font-bold">
                        3
                      </div>
                      <p className="text-xs font-semibold text-white">Gem Mine Departure</p>
                      <p className="text-[11px] text-slate-400 leading-normal">
                        Present this digital voucher or printed pass upon pickup.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 24/7 WhatsApp VIP Concierge Action Callout */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0d1e1c] via-[#0f2824] to-[#0d1e1c] border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
                  <div className="flex items-center gap-3.5 text-center sm:text-left">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                      <MessageCircle className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Need immediate assistance or customization?</h4>
                      <p className="text-xs text-slate-300">
                        Connect directly with our Ratnapura expedition guide on WhatsApp 24/7.
                      </p>
                    </div>
                  </div>

                  <a
                    href={`https://wa.me/94712357700?text=Hi%20Sapphire%20Trails,%20I'm%20inquiring%20about%20my%20Booking%20%23ST-BK-${booking.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 w-full sm:w-auto"
                  >
                    <Button
                      size="sm"
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Chat with Concierge
                    </Button>
                  </a>
                </div>

              </div>

              {/* Bottom Voucher Guarantee Footer */}
              <div className="bg-slate-900/90 border-t border-slate-800/80 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>Verified Sapphire Trails Expedition • License Approved Ceylon Tourism</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-[11px] text-slate-500">Document Issued: {new Date().toLocaleDateString()}</span>
                </div>
              </div>

            </div>
          )}

          {/* Quick Nav Footer Links (Hidden on Print) */}
          {booking && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 print:hidden">
              <Link href="/profile" className="hover:text-amber-400 transition-colors flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                Go to My Client Profile Portal
              </Link>
              <span>•</span>
              <Link href="/tours" className="hover:text-amber-400 transition-colors flex items-center gap-1">
                <Compass className="h-3.5 w-3.5" />
                Explore Other Gem Trails
              </Link>
              <span>•</span>
              <button onClick={handlePrint} className="hover:text-amber-400 transition-colors flex items-center gap-1">
                <Printer className="h-3.5 w-3.5" />
                Print / Save PDF
              </button>
            </div>
          )}

        </div>
      </main>

      <div className="print:hidden">
        <TrustSection />
        <Footer />
      </div>
    </div>
  );
}

