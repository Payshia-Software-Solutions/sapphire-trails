'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { format, parseISO } from 'date-fns';

import { type Booking } from '@/lib/bookings-data';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, LoaderCircle, User, Mail, Phone, Home, Ticket, Calendar, Users as GuestsIcon } from 'lucide-react';
import { TrustSection } from '@/components/sections/TrustSection';

const API_BASE_URL = 'https://server-sapphiretrails.payshia.com';

const InfoRow = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | number | undefined | null }) => (
    <div className="flex items-start">
        <Icon className="h-5 w-5 text-muted-foreground mr-4 mt-1 flex-shrink-0" />
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-medium text-foreground">{value || 'N/A'}</p>
        </div>
    </div>
);

export default function PublicBookingViewPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const id = params.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
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
        const bookingData = serverBooking.booking || serverBooking;

        const clientBooking: Booking = {
          id: Number(bookingData.id),
          user_id: bookingData.user_id,
          name: bookingData.name,
          email: bookingData.email,
          phone: bookingData.phone,
          address: bookingData.address,
          tourType: Number(bookingData.tour_package_id),
          tourTitle: bookingData.tour_title,
          adults: Number(bookingData.adults),
          children: Number(bookingData.children),
          guests: Number(bookingData.guests),
          date: bookingData.tour_date,
          message: bookingData.message,
          status: bookingData.status,
        };
        setBooking(clientBooking);
      } catch (error) {
        console.error("Failed to load booking data:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to load booking data.' });
        setBooking(null);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBooking();
  }, [id, toast]);
  
  const getStatusBadgeVariant = (status: Booking['status']) => {
    switch (status) {
      case 'accepted': return 'default';
      case 'rejected': return 'destructive';
      case 'pending':
      default: return 'secondary';
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 bg-background-alt py-12 md:py-24">
        <div className="container mx-auto max-w-2xl px-4 md:px-6">
          {isLoading ? (
             <div className="flex items-center justify-center h-full"><LoaderCircle className="animate-spin h-8 w-8 text-primary" /></div>
          ) : !booking ? (
            <Card>
                <CardHeader className="text-center">
                    <CardTitle>Booking Not Found</CardTitle>
                    <CardDescription>The requested booking could not be found. Please check the ID and try again.</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <Button onClick={() => router.push('/')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Home
                    </Button>
                </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
                <div className="text-center">
                    <h1 className="text-4xl font-headline font-bold text-primary">Booking Confirmation</h1>
                    <p className="text-muted-foreground mt-2">Thank you, {booking.name}. Your booking request is being processed.</p>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Booking #{booking.id}</CardTitle>
                        <Badge variant={getStatusBadgeVariant(booking.status)} className="capitalize text-base">{booking.status}</Badge>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                           <InfoRow icon={Ticket} label="Tour Package" value={booking.tourTitle} />
                           <InfoRow icon={Calendar} label="Tour Date" value={format(parseISO(booking.date), 'PPP')} />
                           <InfoRow icon={GuestsIcon} label="Total Guests" value={`${booking.guests} (${booking.adults} Adults, ${booking.children} Children)`} />
                           <InfoRow icon={User} label="Booked By" value={booking.name} />
                           <InfoRow icon={Mail} label="Email" value={booking.email} />
                           <InfoRow icon={Phone} label="Phone" value={booking.phone} />
                        </div>
                    </CardContent>
                </Card>

                <div className="text-center">
                    <p className="text-sm text-muted-foreground">If you have any questions, please contact us at info@sapphiretrails.lk</p>
                </div>
            </div>
          )}
        </div>
      </main>
      <TrustSection />
      <Footer />
    </div>
  );
}
