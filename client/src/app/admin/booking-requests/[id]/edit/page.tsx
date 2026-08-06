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
import { CalendarIcon, ArrowLeft, LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mapServerPackageToClient, type TourPackage } from '@/lib/packages-data';

import { API_BASE_URL } from '@/lib/utils';

export default function EditBookingPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const id = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tourPackages, setTourPackages] = useState<TourPackage[]>([]);

  const form = useForm<z.infer<typeof bookingFormSchema>>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      adults: 1,
      children: 0,
      message: '',
    },
  });

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

  // Effect to fetch data from the server
  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    
    async function fetchBooking() {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/bookings/${id}`);
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
          address: bookingData.address,
          tourType: Number(bookingData.tour_package_id),
          adults: Number(bookingData.adults),
          children: Number(bookingData.children),
          guests: Number(bookingData.guests),
          date: bookingData.tour_date,
          message: bookingData.message,
          status: bookingData.status,
        };
        
        form.reset({
            ...clientBooking,
            date: parseISO(clientBooking.date),
            tourType: Number(clientBooking.tourType),
            adults: Number(clientBooking.adults),
            children: Number(clientBooking.children),
            phone: clientBooking.phone || '',
            address: clientBooking.address || '',
            message: clientBooking.message || '',
        });

      } catch (error) {
        console.error("Failed to load booking data:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to load booking data.' });
      } finally {
        setIsLoading(false);
      }
    }
    fetchBooking();
  }, [id, toast, form]);


  const handleUpdate = async (data: z.infer<typeof bookingFormSchema>) => {
    setIsSubmitting(true);

    const payload = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        tour_package_id: data.tourType,
        adults: Number(data.adults),
        children: Number(data.children),
        guests: Number(data.adults) + Number(data.children),
        tour_date: format(data.date, 'yyyy-MM-dd'),
        status: form.getValues('status') as any,
        message: data.message,
        user_id: form.getValues('user_id'),
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/bookings/${id}/`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || 'Failed to update booking.');
        }
        toast({ title: 'Success!', description: 'Booking details have been updated.' });
        router.push(`/admin/booking-requests/${id}/view`);
    } catch (error) {
        console.error("Failed to save booking:", error);
        const errorMessage = error instanceof Error ? error.message : "Could not save booking changes.";
        toast({ variant: 'destructive', title: 'Error', description: errorMessage });
    } finally {
        setIsSubmitting(false);
    }
  };


  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><p>Loading booking details...</p></div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">Edit Booking</h1>
            <p className="text-muted-foreground">Modify details for the request from {form.getValues('name')}.</p>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-6">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleUpdate)} className="grid gap-6">
                    <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Phone Number (Optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="address" render={({ field }) => (<FormItem><FormLabel>Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FormField control={form.control} name="tourType" render={({ field }) => (
                            <FormItem><FormLabel>Tour Package</FormLabel>
                            <Select onValueChange={(val) => field.onChange(parseInt(val))} value={String(field.value)}>
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
                        <FormField control={form.control} name="adults" render={({ field }) => ( <FormItem><FormLabel>Adults</FormLabel><FormControl><Input type="number" min="1" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="children" render={({ field }) => ( <FormItem><FormLabel>Children</FormLabel><FormControl><Input type="number" min="0" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
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
                    
                    <div className="flex justify-end pt-4 mt-4 border-t border-border">
                        <Button type="submit" size="lg" disabled={isSubmitting}>
                            {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
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
