
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, HelpCircle, Clock, DollarSign, Gem, Shield, Users } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bookingFormSchema } from '@/lib/schemas';
import type { z } from 'zod';
import { format } from "date-fns"
import { mapServerPackageToClient, type TourPackage } from '@/lib/packages-data';
import Image from 'next/image';
import { BookingForm } from '@/components/sections/booking-form';

const API_BASE_URL = 'https://server-sapphiretrails.payshia.com';

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
            <div className="absolute inset-0 p-6 flex flex-col justify-between text-white">
                <div>
                    <h2 className="text-3xl font-bold font-headline">{selectedTour.tourPageTitle}</h2>
                    <div className="flex items-center gap-4 text-sm mt-2 opacity-90">
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
  return (
    <Card className="sticky top-24 shadow-lg">
      <CardHeader>
        <CardTitle>Booking Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {selectedTour ? (
          <div>
            <p className="font-semibold text-primary">{selectedTour.tourPageTitle}</p>
            <p className="text-sm text-muted-foreground">{selectedTour.duration}</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Select a tour to see the summary.</p>
        )}

        <div className="space-y-2 border-t pt-4 text-sm">
            <div className="flex justify-between">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-medium">{selectedDate ? format(selectedDate, "PPP") : 'N/A'}</span>
            </div>
             <div className="flex justify-between">
                <span className="text-muted-foreground">Guests:</span>
                <span className="font-medium">{totalGuests} Person(s)</span>
            </div>
        </div>

        {totalPrice !== null && (
          <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taxes & Fees:</span>
                  <span className="font-medium">$0.00</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                  <span className="text-foreground">Total:</span>
                  <span className="text-primary">${totalPrice.toFixed(2)}</span>
              </div>
          </div>
        )}
        
        <Button type="submit" form="booking-form-main" className="w-full" size="lg" disabled={!selectedTour}>
            Complete Booking
        </Button>

        <div className="text-center text-xs text-muted-foreground">
          <Link href="#" className="inline-flex items-center gap-1 hover:text-primary">
            <HelpCircle className="h-3 w-3" />
            Need help? View FAQ
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}


export function BookingPageContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tourTypeParam = searchParams.get('tourType');

  const [tourPackages, setTourPackages] = useState<TourPackage[]>([]);

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

  const selectedTour = tourPackages.find(p => p.id === Number(watchedTourType));
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

  return (
    <div className="flex-1 bg-background-alt py-12 md:py-24">
       <div className="container mx-auto px-4 md:px-6">
        <div className="mb-8">
            <Button variant="link" onClick={() => router.back()} className="text-foreground hover:text-primary p-0 h-auto">
                <ArrowLeft className="mr-2 h-4 w-4"/>
                Back to Tour Page
            </Button>
        </div>
        <FormProvider {...methods}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
               <TourDisplayCard selectedTour={selectedTour} />
              <BookingForm tourPackages={tourPackages} selectedTour={selectedTour} />
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
