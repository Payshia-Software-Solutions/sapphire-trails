
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, HelpCircle, Clock, DollarSign, Gem, Shield, Users, LoaderCircle, X, Mail } from 'lucide-react';
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

import { API_BASE_URL } from '@/lib/utils';

interface ConfirmationDetails {
    tourName: string;
    date: Date;
    guests: number;
    totalPrice: number;
    bookingId: number;
}

function BookingConfirmation({ details, onClose }: { details: ConfirmationDetails, onClose: () => void }) {
    const router = useRouter();

    const handleViewBooking = () => {
        router.push(`/booking/${details.bookingId}/view`);
    };
    
    const handleExploreTours = () => {
        router.push('/tours');
    };
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-in fade-in-0">
            <div className="relative w-full max-w-lg bg-background-alt rounded-2xl p-8 md:p-12 text-center text-white/90 shadow-2xl shadow-primary/20 border border-border">
                <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-muted-foreground hover:text-white" onClick={onClose}>
                    <X className="h-6 w-6" />
                </Button>
                
                <div className="flex flex-col items-center">
                   <div style={{
                      display: 'inline-block',
                      backgroundColor: 'hsl(39, 58%, 74%)',
                      height: '60px',
                      width: '60px',
                      borderRadius: '50%',
                      marginBottom: '15px'
                    }}>
                        <Image 
                            src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMxYzFjMWUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWxpbmUgcG9pbnRzPSIyMCA2IDkgMTcgNCAxMiI+PC9wb2x5bGluZT48L3N2Zz4=" 
                            alt="Checkmark" 
                            width={36} height={36} 
                            style={{ margin: '12px' }}
                        />
                    </div>
                     <div style={{ marginBottom: '20px' }}>
                        <Image src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJoc2woMzksIDU4JSwgNDAlKSIgc3Ryb2tlPSJoc2woMzksIDU4JSwgNDAlKSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0yLjcgMTAuM2EyLjQgMi40IDAgMCAwIDAgMy40bDcuNSA3LjVjLjkuOSAyLjUuOSAzLjQgMGw3LjUtNy41YTIuNCAyLjQgMCAwIDAgMC0zLjRsLTcuNS03LjVhMi40IDIuNCAwIDAgMC0zLjQgMFoiLz48L3N2Zz4=" alt="Diamond" width={16} height={16} style={{ display: 'inline-block', margin: '0 4px' }}/>
                        <Image src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJoc2woMzksIDU4JSwgNDAlKSIgc3Ryb2tlPSJoc2woMzksIDU4JSwgNDAlKSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0yLjcgMTAuM2EyLjQgMi40IDAgMCAwIDAgMy40bDcuNSA3LjVjLjkuOSAyLjUuOSAzLjQgMGw3LjUtNy41YTIuNCAyLjQgMCAwIDAgMC0zLjRsLTcuNS03LjVhMi40IDIuNCAwIDAgMC0zLjQgMFoiLz48L3N2Zz4=" alt="Diamond" width={16} height={16} style={{ display: 'inline-block', margin: '0 4px' }}/>
                        <Image src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJoc2woMzksIDU4JSwgNDAlKSIgc3Ryb2tlPSJoc2woMzksIDU4JSwgNDAlKSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0yLjcgMTAuM2EyLjQgMi40IDAgMCAwIDAgMy40bDcuNSA3LjVjLjkuOSAyLjUuOSAzLjQgMGw3LjUtNy41YTIuNCAyLjQgMCAwIDAgMC0zLjRsLTcuNS03LjVhMi40IDIuNCAwIDAgMC0zLjQgMFoiLz48L3N2Zz4=" alt="Diamond" width={16} height={16} style={{ display: 'inline-block', margin: '0 4px' }}/>
                    </div>
                    <h2 className="text-4xl font-headline font-bold text-white mb-2">Your Booking is Confirmed!</h2>
                    <p className="text-muted-foreground max-w-md">
                        Thank you for booking the {details.tourName}. A confirmation email has been sent to you.
                    </p>
                </div>

                <div className="my-8 text-left bg-card/50 border border-border rounded-lg p-6 space-y-4">
                     <h3 className="text-xl font-headline font-semibold text-primary mb-4">Booking Summary</h3>
                     <div className="flex justify-between items-center text-sm border-b border-border pb-3">
                         <span className="text-muted-foreground">Tour Name</span>
                         <span className="font-semibold text-white">{details.tourName}</span>
                     </div>
                     <div className="flex justify-between items-center text-sm border-b border-border pb-3">
                         <span className="text-muted-foreground">Date & Time</span>
                         <span className="font-semibold text-white">{format(details.date, "MMMM dd, yyyy")} • 9:00 AM</span>
                     </div>
                      <div className="flex justify-between items-center text-sm border-b border-border pb-3">
                         <span className="text-muted-foreground">Guests</span>
                         <span className="font-semibold text-white">{details.guests} Person(s)</span>
                     </div>
                      <div className="flex justify-between items-center text-sm">
                         <span className="text-muted-foreground">Total Paid</span>
                         <span className="font-semibold text-primary text-lg">${details.totalPrice.toFixed(2)}</span>
                     </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6">
                    <Mail className="h-4 w-4 text-primary" />
                    <span>Check your inbox for full details</span>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                    <Button size="lg" className="w-full" onClick={handleViewBooking}>View My Booking</Button>
                    <Button size="lg" variant="outline" className="w-full" onClick={handleExploreTours}>Explore More Tours</Button>
                </div>
            </div>
        </div>
    );
}

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

  return (
    <Card className="sticky top-24 shadow-lg overflow-hidden border-border/80">
      {selectedTour && (
        <div className="relative w-full aspect-[16/10] overflow-hidden border-b border-border">
          <Image
            src={selectedTour.heroImage}
            alt={selectedTour.tourPageTitle}
            fill
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
          <Link href="#" className="inline-flex items-center gap-1 hover:text-primary">
            <HelpCircle className="h-3.5 w-3.5" />
            Need help? View FAQ
          </Link>
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
  const tourTypeParam = searchParams.get('tourType');

  const [tourPackages, setTourPackages] = useState<TourPackage[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [confirmationDetails, setConfirmationDetails] = useState<ConfirmationDetails | null>(null);

  useEffect(() => {
    async function fetchTourPackages() {
        try {
            const response = await fetch(`${API_BASE_URL}/tours`);
            if (response.ok) {
                const serverData = await response.json();
                if(Array.isArray(serverData)) {
                    setTourPackages(serverData.map(mapServerPackageToClient));
                }
            }
        } catch(e) { console.error("Could not fetch tour packages", e); }
    }
    fetchTourPackages();
  }, []);

  const methods = useForm<z.infer<typeof bookingFormSchema>>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: "",
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

  const selectedTour = tourSlug 
    ? tourPackages.find(p => p.slug === tourSlug)
    : tourPackages.find(p => p.id === Number(watchedTourType));

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

   const payload = {
       user_id: user ? user.id : null,
       tour_package_id: data.tourType,
       tour_name: selectedTour.homepageTitle,
       name: data.name,
       email: data.email,
       phone: data.phone,
       address: data.address,
       adults: data.adults,
       children: data.children,
       guests: totalGuestsOnSubmit,
       tour_date: format(data.date, 'yyyy-MM-dd'),
       message: data.message,
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
       
       setConfirmationDetails({
           tourName: selectedTour.tourPageTitle,
           date: data.date,
           guests: totalGuestsOnSubmit,
           totalPrice: totalPriceOnSubmit,
           bookingId: savedBooking.id
       });

       setIsSubmitted(true);
       methods.reset();
   } catch (error) {
       console.error("Booking submission failed:", error);
       toast({
           variant: "destructive",
           title: "Submission Failed",
           description: error instanceof Error ? error.message : "Could not connect to the server.",
       });
   }
  }

  const handleCloseConfirmation = () => {
    setIsSubmitted(false);
    setConfirmationDetails(null);
  };

  if (isSubmitted && confirmationDetails) {
    return <BookingConfirmation details={confirmationDetails} onClose={handleCloseConfirmation} />
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
                <TourDisplayCard selectedTour={selectedTour} />
              )}
              <BookingForm tourPackages={tourPackages} selectedTour={selectedTour} onSubmit={onSubmit} />
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
