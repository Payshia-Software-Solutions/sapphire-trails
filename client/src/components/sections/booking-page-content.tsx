
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Clock, DollarSign, Gem, Shield, Users, LoaderCircle, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bookingFormSchema } from '@/lib/schemas';
import type { z } from 'zod';
import { format } from "date-fns"
import { mapServerPackageToClient, type TourPackage } from '@/lib/packages-data';
import Image from 'next/image';
import { BookingForm } from '@/components/sections/booking-form';
import { useToast } from "@/hooks/use-toast";
import { trackInitiateBooking, trackBookingSuccess } from '@/lib/analytics';

import { API_BASE_URL } from '@/lib/utils';


function TourDisplayCard({ selectedTour }: { selectedTour?: TourPackage }) {
    if (!selectedTour) return null;

    return (
        <Card className="overflow-hidden relative shadow-lg">
            <Image
                src="https://content-provider.payshia.com/sapphire-trail/images/img4.webp"
                alt={selectedTour.tourPageTitle}
                width={800}
                height={400}
                className="w-full object-cover aspect-[2/1]"
                data-ai-hint="tourists gems"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-between text-white">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold font-headline">{selectedTour.tourPageTitle}</h2>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm mt-2 opacity-90">
                        <div className="flex items-center gap-1.5"><Clock size={16} /> {selectedTour.duration}</div>
                        <div className="flex items-center gap-1.5"><DollarSign size={16} /> {selectedTour.price} {selectedTour.priceSuffix}</div>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="flex flex-col items-center">
                        <div className="p-3 rounded-full bg-white/10 backdrop-blur-sm mb-1"><Gem size={20} /></div>
                        <p className="text-xs font-semibold">Gem Discovery</p>
                    </div>
                     <div className="flex flex-col items-center">
                        <div className="p-3 rounded-full bg-white/10 backdrop-blur-sm mb-1"><Users size={20} /></div>
                        <p className="text-xs font-semibold">Expert Guides</p>
                    </div>
                     <div className="flex flex-col items-center">
                        <div className="p-3 rounded-full bg-white/10 backdrop-blur-sm mb-1"><Shield size={20} /></div>
                        <p className="text-xs font-semibold">Underground Adventure</p>
                    </div>
                </div>
            </div>
        </Card>
    );
}


function BookingSummary({
  selectedTour,
  selectedDate,
  totalGuests,
  totalPrice
} : {
  selectedTour?: TourPackage;
  selectedDate?: Date;
  totalGuests: number;
  totalPrice: number | null;
}) {
  const { formState: { isSubmitting } } = useFormContext();
  const summaryImg = selectedTour?.heroImage || selectedTour?.imageUrl || 'https://content-provider.payshia.com/sapphire-trail/images/img4.webp';

  return (
    <Card className="sticky top-24 shadow-lg overflow-hidden border-border/80">
      {selectedTour && (
        <div className="relative w-full aspect-[16/10] overflow-hidden border-b border-border bg-slate-900">
          <Image
            src={summaryImg}
            alt={selectedTour.tourPageTitle || 'Tour Package'}
            fill
            sizes="(max-width: 1024px) 100vw, 33vw"
            className="object-cover"
            priority
          />
        </div>
      )}
      <CardHeader className="pt-5">
        <CardTitle className="text-xl">Booking Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {selectedTour ? (
          <div>
            <p className="font-semibold text-primary font-headline text-lg leading-tight mb-1">{selectedTour.tourPageTitle}</p>
            <p className="text-xs text-muted-foreground">{selectedTour.duration}</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Select a tour to see the summary.</p>
        )}

        <div className="space-y-2 border-t border-border/50 pt-4 text-sm">
            <div className="flex justify-between">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-medium text-foreground">{selectedDate ? format(selectedDate, "PPP") : 'N/A'}</span>
            </div>
             <div className="flex justify-between">
                <span className="text-muted-foreground">Guests:</span>
                <span className="font-medium text-foreground">{totalGuests} Person(s)</span>
            </div>
        </div>

        {totalPrice !== null && (
          <div className="space-y-2 border-t border-border/50 pt-4">
              <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium text-foreground">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taxes & Fees:</span>
                  <span className="font-medium text-foreground">$0.00</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                  <span className="text-foreground">Total:</span>
                  <span className="text-primary">${totalPrice.toFixed(2)}</span>
              </div>
          </div>
        )}
        
        <Button type="submit" form="booking-form-main" className="w-full rounded-full font-serif uppercase tracking-widest text-xs h-11" size="lg" disabled={!selectedTour || isSubmitting}>
            {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
            Complete Booking
        </Button>

        <div className="text-center text-xs text-muted-foreground">
          <a
            href="https://wa.me/94712357700"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-emerald-500 transition-colors text-muted-foreground"
          >
            <MessageCircle className="h-4 w-4 text-emerald-500 fill-emerald-500/10" />
            <span>Need help? Chat on WhatsApp</span>
          </a>
        </div>
      </CardContent>
    </Card>
  )
}


export function BookingPageContent({ tourSlug }: { tourSlug?: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const tourSlugParam = tourSlug || searchParams.get('tour') || searchParams.get('slug');
  const tourTypeParam = searchParams.get('tourType');

  const [tourPackages, setTourPackages] = useState<TourPackage[]>([]);

  const methods = useForm<z.infer<typeof bookingFormSchema>>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: "",
      transportService: "none",
      transportNotes: "",
      tourType: tourTypeParam ? Number(tourTypeParam) : undefined,
      adults: 1,
      children: 0,
      message: "",
    },
  });

  const watchedTourType = methods.watch('tourType');
  const watchedAdults = methods.watch('adults');
  const watchedChildren = methods.watch('children');
  const watchedDate = methods.watch('date');
  const [totalPrice, setTotalPrice] = useState<number | null>(null);

  useEffect(() => {
    async function fetchTourPackages() {
        try {
            const response = await fetch(`${API_BASE_URL}/tours`);
            if (response.ok) {
                const serverData = await response.json();
                if(Array.isArray(serverData)) {
                    const mapped = serverData.map(mapServerPackageToClient);
                    setTourPackages(mapped);

                    // Auto-select package if slug or tourType is provided in URL
                    if (tourSlugParam) {
                      const found = mapped.find(p => p.slug === tourSlugParam);
                      if (found) methods.setValue('tourType', found.id);
                    } else if (tourTypeParam) {
                      const found = mapped.find(p => String(p.id) === String(tourTypeParam));
                      if (found) methods.setValue('tourType', found.id);
                    } else if (mapped.length > 0 && !methods.getValues('tourType')) {
                      // Direct /booking: Auto-select 1st package by default!
                      methods.setValue('tourType', mapped[0].id);
                    }
                }
            }
        } catch(e) { console.error("Could not fetch tour packages", e); }
    }
    fetchTourPackages();
  }, [tourSlugParam, tourTypeParam, methods]);

  const selectedTour = watchedTourType
    ? tourPackages.find(p => p.id === Number(watchedTourType))
    : (tourSlugParam ? tourPackages.find(p => p.slug === tourSlugParam) : tourPackages[0]);

  useEffect(() => {
    if (selectedTour && methods.getValues('tourType') !== selectedTour.id) {
      methods.setValue('tourType', selectedTour.id);
    }
  }, [selectedTour, methods]);

  const totalGuests = (Number(watchedAdults) || 0) + (Number(watchedChildren) || 0);

  useEffect(() => {
    if (selectedTour && totalGuests > 0) {
      if (selectedTour.price) {
        const pricePerPerson = parseFloat(selectedTour.price.replace(/[^0-9.-]+/g,""));
        if (!isNaN(pricePerPerson)) {
          setTotalPrice(pricePerPerson * totalGuests);
        } else {
          setTotalPrice(null);
        }
      } else {
        setTotalPrice(null);
      }
    } else {
      setTotalPrice(null);
    }
  }, [selectedTour, totalGuests]);

  useEffect(() => {
     if (user) {
      methods.reset({
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        address: methods.getValues('address') || "",
        tourType: tourTypeParam ? Number(tourTypeParam) : methods.getValues('tourType'),
        adults: methods.getValues('adults') || 1,
        children: methods.getValues('children') || 0,
        date: methods.getValues('date'),
        message: methods.getValues('message') || "",
      });
    } else {
       methods.reset({
        name: "",
        email: "",
        phone: "",
        address: "",
        tourType: tourTypeParam ? Number(tourTypeParam) : methods.getValues('tourType'),
        adults: methods.getValues('adults') || 1,
        children: methods.getValues('children') || 0,
        date: methods.getValues('date'),
        message: methods.getValues('message') || "",
      });
    }
  }, [user, tourTypeParam, methods]);

  async function onSubmit(data: z.infer<typeof bookingFormSchema>) {
    if (!selectedTour) {
       toast({
           variant: "destructive",
           title: "Error",
           description: "You must have a tour selected.",
       });
       return;
   }
   
   const totalGuestsOnSubmit = data.adults + data.children;
   const pricePerPerson = parseFloat(selectedTour.price.replace(/[^0-9.-]+/g,""));
   const totalPriceOnSubmit = !isNaN(pricePerPerson) ? pricePerPerson * totalGuestsOnSubmit : 0;

   // Format vehicle arrangement into clear note
   let fullMessage = (data.message || '').trim();
   if (data.transportService && data.transportService !== 'none') {
     const transportLabels: Record<string, string> = {
       airport_pickup: 'Airport Pickup (CMB Bandaranaike Airport → Ratnapura)',
       airport_roundtrip: 'Round-trip Airport Transfer (CMB Airport ⇄ Ratnapura)',
       hotel_transfer: 'Private Hotel Pickup & Tour Chauffeur',
       custom: 'Custom Island-wide Transport Arrangement',
     };
     const label = transportLabels[data.transportService] || data.transportService;
     const details = data.transportNotes ? ` [Flight / Pickup Details: ${data.transportNotes.trim()}]` : '';
     const transportHeader = `🚗 Vehicle Arrangement: ${label}${details}`;
     fullMessage = fullMessage ? `${transportHeader}\n\n📝 Special Requests: ${fullMessage}` : transportHeader;
   }

   const payload = {
       user_id: user ? user.id : null,
       tour_package_id: data.tourType,
       tour_name: selectedTour.homepageTitle,
       name: data.name,
       email: data.email,
       phone: data.phone,
       address: data.address,
       transport_service: data.transportService,
       transport_notes: data.transportNotes,
       adults: data.adults,
       children: data.children,
       guests: totalGuestsOnSubmit,
       tour_date: format(data.date, 'yyyy-MM-dd'),
       message: fullMessage,
       type: user ? user.type : 'client',
   };
   
   try {
       const response = await fetch('/api/booking', {
           method: 'POST',
           headers: {
               'Content-Type': 'application/json',
               'Accept': 'application/json',
           },
           body: JSON.stringify(payload),
       });

       if (!response.ok) {
           const errorData = await response.json().catch(() => ({ message: "An unknown error occurred."}));
           throw new Error(errorData.message || 'Failed to submit booking request.');
       }
       
       const savedBooking = await response.json();
       
       // Dispatch GA4 Purchase & Meta Pixel Purchase/Schedule Events
       trackBookingSuccess({
           bookingId: savedBooking.id,
           tourName: selectedTour.tourPageTitle,
           tourId: selectedTour.id,
           totalValue: totalPriceOnSubmit,
           guests: totalGuestsOnSubmit,
           currency: 'USD',
       });

       methods.reset();
       router.push(`/booking/confirmation?id=${savedBooking.id}`);
   } catch (error) {
       console.error("Booking submission failed:", error);
       toast({
           variant: "destructive",
           title: "Submission Failed",
           description: error instanceof Error ? error.message : "Could not connect to the server.",
       });
   }
  }

  return (
    <div className="flex-1 bg-background-alt py-12 md:py-20">
       <div className="container mx-auto px-4 md:px-6 max-w-screen-2xl">
        <div className="mb-6">
            <Button variant="link" onClick={() => router.back()} className="text-foreground hover:text-primary p-0 h-auto">
                <ArrowLeft className="mr-2 h-4 w-4"/>
                Back to Tour Page
            </Button>
        </div>
        <FormProvider {...methods}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-6">
              {tourSlug && selectedTour ? (
                <div className="mb-2">
                  <h1 className="text-3xl font-headline font-bold text-foreground">Book Your Tour</h1>
                  <p className="text-muted-foreground mt-1">Reserve your spot for the <span className="font-semibold text-primary">{selectedTour.tourPageTitle}</span></p>
                </div>
              ) : (
                <div className="mb-2">
                  <h1 className="text-2xl sm:text-3xl font-headline font-bold text-foreground">Book Your Private Expedition</h1>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Select your preferred tour package below and customize your journey with Sapphire Trails.
                  </p>
                </div>
              )}
              <BookingForm 
                tourPackages={tourPackages} 
                selectedTour={selectedTour} 
                isDirectBooking={!tourSlug} 
                onSubmit={onSubmit} 
              />
            </div>
            <div>
              <BookingSummary 
                selectedTour={selectedTour}
                selectedDate={watchedDate}
                totalGuests={totalGuests}
                totalPrice={totalPrice}
              />
            </div>
          </div>
        </FormProvider>
       </div>
    </div>
  );
}
