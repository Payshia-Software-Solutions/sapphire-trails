

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, parseISO } from 'date-fns';

import { type Booking } from '@/lib/bookings-data';
import { bookingFormSchema } from '@/lib/schemas';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mapServerPackageToClient, type TourPackage } from '@/lib/packages-data';

export default function EditBookingPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const id = params.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tourPackages, setTourPackages] = useState<TourPackage[]>([]);

  useEffect(() => {
    async function fetchTourPackages() {
        try {
            const response = await fetch('http://localhost/sapphire_trails_server/tours');
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

  const form = useForm<z.infer<typeof bookingFormSchema>>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      guests: 1,
      message: '',
    },
  });

  // Effect to fetch data from the server
  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    
    async function fetchBooking() {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost/sapphire_trails_server/bookings/${id}`);
        if (!response.ok) {
          throw new Error('Booking not found');
        }
        const serverBooking = await response.json();
        const bookingData = serverBooking.booking || serverBooking;

        const clientBooking: Booking = {
          id: Number(bookingData.id),
          user_id: bookingData.user_id,
          name: bookingData.name,
          email: bookingData.email,
          phone: bookingData.phone,
          tourType: Number(bookingData.tour_package_id),
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

  // Effect to populate the form once booking data is available
  useEffect(() => {
    if (booking) {
      form.reset({
        ...booking,
        date: parseISO(booking.date),
        guests: Number(booking.guests),
        tourType: Number(booking.tourType),
        phone: booking.phone || '',
        message: booking.message || '',
      });
    }
  }, [booking, form]);

  const updateBookingOnServer = async (bookingToUpdate: Booking) => {
    try {
        const payload = {
            name: bookingToUpdate.name,
            email: bookingToUpdate.email,
            phone: bookingToUpdate.phone,
            tour_package_id: bookingToUpdate.tourType,
            guests: Number(bookingToUpdate.guests),
            tour_date: bookingToUpdate.date, // Already in 'yyyy-MM-dd' format
            status: bookingToUpdate.status,
            message: bookingToUpdate.message,
            user_id: bookingToUpdate.user_id,
        };
        
        const response = await fetch(`http://localhost/sapphire_trails_server/bookings/${bookingToUpdate.id}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || 'Failed to update booking. Ensure the backend update method is implemented.');
        }
        return true;
    } catch (error) {
        console.error("Failed to save booking:", error);
        const errorMessage = error instanceof Error ? error.message : "Could not save booking changes.";
        toast({ variant: 'destructive', title: 'Error', description: errorMessage });
        return false;
    }
  };

  const updateStatusOnServer = async (bookingId: number, status: 'accepted' | 'rejected') => {
    try {
      const response = await fetch(`http://localhost/sapphire_trails_server/bookings/${bookingId}/status/`, {
        method: 'PUT', // Changed from PATCH to PUT
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to update booking status.');
      }
      return true;
    } catch (error) {
      console.error("Failed to update status:", error);
      const errorMessage = error instanceof Error ? error.message : "Could not update booking status.";
      toast({ variant: 'destructive', title: 'Error', description: errorMessage });
      return false;
    }
  };

  const handleUpdate = async (data: z.infer<typeof bookingFormSchema>) => {
    if (!booking) return;

    const updatedBooking: Booking = {
      ...booking,
      ...data,
      date: format(data.date, 'yyyy-MM-dd'),
      guests: Number(data.guests),
    };
    
    const success = await updateBookingOnServer(updatedBooking);
    if (success) {
      toast({ title: 'Success!', description: 'Booking details have been updated.' });
      router.push('/admin/booking-requests');
    }
  };

  const handleStatusChange = async (status: 'accepted' | 'rejected') => {
    if (!booking) return;
    
    const success = await updateStatusOnServer(booking.id, status);
    if (success) {
      toast({ title: `Booking ${status}`, description: `The booking has been marked as ${status}.` });
      router.push('/admin/booking-requests');
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><p>Loading booking details...</p></div>;
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
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">Edit Booking</h1>
            <p className="text-muted-foreground">Modify details for the request from {booking.name}.</p>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-6">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleUpdate)} className="grid gap-6">
                    <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Phone Number (Optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="tourType" render={({ field }) => (
                        <FormItem><FormLabel>Tour Package</FormLabel>
                        <Select onValueChange={field.onChange} value={String(field.value)}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                                {tourPackages.map(pkg => (
                                    <SelectItem key={pkg.id} value={String(pkg.id)}>{pkg.homepageTitle}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="guests" render={({ field }) => ( <FormItem><FormLabel>Number of Guests</FormLabel><FormControl><Input type="number" min="1" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                    <FormField control={form.control} name="date" render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Preferred Tour Date</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="message" render={({ field }) => ( <FormItem><FormLabel>Additional Message (Optional)</FormLabel><FormControl><Textarea className="min-h-[120px]" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    
                    <div className="grid grid-cols-2 gap-2 pt-4 mt-4 border-t border-border sm:flex sm:justify-end">
                        <Button type="button" onClick={() => handleStatusChange('accepted')}>
                            Accept Booking
                        </Button>
                        <Button type="button" variant="destructive" onClick={() => handleStatusChange('rejected')}>
                            Reject Booking
                        </Button>
                        <Button type="submit" className="col-span-2">
                            Save Changes
                        </Button>
                    </div>
                </form>
            </Form>
        </CardContent>
      </Card>
    </div>
  );
}
