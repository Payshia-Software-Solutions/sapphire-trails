

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

export default function EditBookingPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const id = params.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<z.infer<typeof bookingFormSchema>>({
    resolver: zodResolver(bookingFormSchema),
  });

  // Effect to fetch data from localStorage
  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    try {
      const decodedId = decodeURIComponent(id);
      const storedBookingsRaw = localStorage.getItem('bookings');
      if (storedBookingsRaw) {
        const allBookings = JSON.parse(storedBookingsRaw) as Booking[];
        const foundBooking = allBookings.find(b => b.id === decodedId);
        setBooking(foundBooking || null);
      }
    } catch (error) {
      console.error("Failed to load booking data:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load booking data.' });
    } finally {
      setIsLoading(false);
    }
  }, [id, toast]);

  // Effect to populate the form once booking data is available
  useEffect(() => {
    if (booking) {
      form.reset({
        ...booking,
        date: parseISO(booking.date),
        guests: Number(booking.guests),
      });
    }
  }, [booking, form]);

  const updateBookingInStorage = (updatedBooking: Booking) => {
    try {
      const storedBookingsRaw = localStorage.getItem('bookings');
      const allBookings = storedBookingsRaw ? JSON.parse(storedBookingsRaw) as Booking[] : [];
      const bookingsToStore = allBookings.map(b => b.id === updatedBooking.id ? updatedBooking : b);
      localStorage.setItem('bookings', JSON.stringify(bookingsToStore));
      return true;
    } catch (error) {
      console.error("Failed to save booking:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not save booking changes.' });
      return false;
    }
  }

  const handleUpdate = (data: z.infer<typeof bookingFormSchema>) => {
    if (!booking) return;

    const updatedBooking: Booking = {
      ...booking,
      ...data,
      date: format(data.date, 'yyyy-MM-dd'),
      guests: Number(data.guests),
    };
    
    if (updateBookingInStorage(updatedBooking)) {
      toast({ title: 'Success!', description: 'Booking details have been updated.' });
      router.push('/admin/booking-requests');
    }
  };

  const handleStatusChange = (status: 'accepted' | 'rejected') => {
    if (!booking) return;
    
    const updatedBooking = { ...booking, status };

    if (updateBookingInStorage(updatedBooking)) {
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="gem-explorer-day-tour">Gem Explorer Day Tour</SelectItem>
                                <SelectItem value="sapphire-trails-deluxe">Sapphire Trails Deluxe</SelectItem>
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
