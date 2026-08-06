'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';

import { type Booking } from '@/lib/bookings-data';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, LoaderCircle, User, Mail, Phone, Home, Ticket, Calendar, Users as GuestsIcon, MessageSquare, Check, X } from 'lucide-react';
import { mapServerPackageToClient as mapServerPackage, type TourPackage } from '@/lib/packages-data';

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


export default function ViewBookingPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const id = params.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [tourPackages, setTourPackages] = useState<TourPackage[]>([]);

   useEffect(() => {
    async function fetchTourPackages() {
      try {
        const response = await fetch(`${API_BASE_URL}/tours`);
        if (response.ok) {
            const serverData = await response.json();
            if(Array.isArray(serverData)) {
                setTourPackages(serverData.map(mapServerPackage));
            }
        }
      } catch (e) { console.error("Could not fetch tour packages", e); }
    }
    fetchTourPackages();
  }, []);

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

  const handleStatusChange = async (status: 'accepted' | 'rejected') => {
    if (!booking) return;

    setIsUpdatingStatus(true);
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${booking.id}/status/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to update booking status.');
      }
      toast({ title: `Booking ${status}`, description: `The booking has been marked as ${status}.` });
      setBooking(prev => prev ? { ...prev, status } : null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Could not update booking status.";
      toast({ variant: 'destructive', title: 'Error', description: errorMessage });
    } finally {
        setIsUpdatingStatus(false);
    }
  };
  
  const getStatusBadgeVariant = (status: Booking['status']) => {
    switch (status) {
      case 'accepted': return 'default';
      case 'rejected': return 'destructive';
      case 'pending':
      default: return 'secondary';
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><LoaderCircle className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  if (!booking) {
    return (
        <div className="flex flex-col items-center justify-center h-full gap-4">
            <p className="text-xl">Booking not found.</p>
            <Button onClick={() => router.push('/admin/booking-requests')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Requests
            </Button>
        </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push('/admin/booking-requests')}>
              <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
              <h1 className="text-3xl font-bold tracking-tight text-primary">Booking Details</h1>
              <p className="text-muted-foreground">Request ID: {booking.id}</p>
          </div>
        </div>
        <Button asChild>
            <Link href={`/admin/booking-requests/${booking.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
            </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Traveler Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoRow icon={User} label="Full Name" value={booking.name} />
                    <InfoRow icon={Mail} label="Email" value={booking.email} />
                    <InfoRow icon={Phone} label="Phone Number" value={booking.phone} />
                    <InfoRow icon={Home} label="Address" value={booking.address} />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Tour Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoRow icon={Ticket} label="Tour Package" value={booking.tourTitle} />
                    <InfoRow icon={Calendar} label="Tour Date" value={format(parseISO(booking.date), 'PPP')} />
                    <InfoRow icon={GuestsIcon} label="Total Guests" value={`${booking.guests} (${booking.adults} Adults, ${booking.children} Children)`} />
                </CardContent>
            </Card>
             {booking.message && (
                <Card>
                    <CardHeader><CardTitle>Additional Message</CardTitle></CardHeader>
                    <CardContent className="flex items-start gap-4">
                        <MessageSquare className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                        <p className="text-muted-foreground italic">&quot;{booking.message}&quot;</p>
                    </CardContent>
                </Card>
             )}
        </div>
        
        <div className="lg:col-span-1">
             <Card className="sticky top-20">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Status</CardTitle>
                     <Badge variant={getStatusBadgeVariant(booking.status)} className="capitalize text-base">{booking.status}</Badge>
                </CardHeader>
                 <CardDescription className="px-6 pb-4">
                    Manage the state of this booking request.
                 </CardDescription>
                <CardFooter className="flex flex-col gap-2">
                    <Button onClick={() => handleStatusChange('accepted')} className="w-full" disabled={isUpdatingStatus || booking.status === 'accepted'}>
                        {isUpdatingStatus ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin"/> : <Check className="mr-2 h-4 w-4" />}
                        Accept Booking
                    </Button>
                    <Button onClick={() => handleStatusChange('rejected')} variant="destructive" className="w-full" disabled={isUpdatingStatus || booking.status === 'rejected'}>
                       {isUpdatingStatus ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin"/> : <X className="mr-2 h-4 w-4" />}
                       Reject Booking
                    </Button>
                </CardFooter>
             </Card>
        </div>

      </div>

    </div>
  );
}
