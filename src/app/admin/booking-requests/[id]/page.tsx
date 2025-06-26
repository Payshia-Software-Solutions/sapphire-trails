
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { bookingFormSchema } from '@/lib/schemas';
import type { Booking } from '@/lib/bookings-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function EditBookingPage() {
    const [booking, setBooking] = useState<Booking | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const id = params.id as string;

    const form = useForm<z.infer<typeof bookingFormSchema>>({
        resolver: zodResolver(bookingFormSchema),
    });
    const { reset } = form;

    useEffect(() => {
        if (!id) {
            setIsLoading(false);
            return;
        }

        let foundBooking: Booking | undefined;
        try {
            const storedBookingsRaw = localStorage.getItem('bookings');
            if (storedBookingsRaw) {
                const bookings: Booking[] = JSON.parse(storedBookingsRaw);
                foundBooking = bookings.find(b => b.id === id);
            }
        } catch (error) {
            console.error("Failed to load or parse booking data:", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not load booking data from storage.',
            });
        }
        
        if (foundBooking) {
            setBooking(foundBooking);
        }

        setIsLoading(false);
    }, [id, toast]);

    useEffect(() => {
        if (booking) {
            reset({
                ...booking,
                date: new Date(booking.date),
            });
        }
    }, [booking, reset]);


    const handleStatusChange = (status: 'accepted' | 'rejected') => {
        if (!booking) return;

        const updatedBooking = { ...booking, status };
        
        try {
            const storedBookingsRaw = localStorage.getItem('bookings');
            const bookings: Booking[] = storedBookingsRaw ? JSON.parse(storedBookingsRaw) : [];
            const updatedBookings = bookings.map(b => (b.id === id ? updatedBooking : b));

            localStorage.setItem('bookings', JSON.stringify(updatedBookings));

            toast({
                title: `Booking ${status}!`,
                description: `The booking for ${booking.name} has been ${status}.`,
            });

            router.push('/admin/booking-requests');
        } catch(e) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to update booking status.' });
        }
    };

    function onSubmit(data: z.infer<typeof bookingFormSchema>) {
        if (!booking) return;
        
        const storedBookingsRaw = localStorage.getItem('bookings');
        const bookings: Booking[] = storedBookingsRaw ? JSON.parse(storedBookingsRaw) : [];

        const updatedBookingData: Booking = {
            id: id,
            status: booking.status,
            name: data.name,
            email: data.email,
            phone: data.phone,
            tourType: data.tourType,
            guests: Number(data.guests),
            date: format(data.date, 'yyyy-MM-dd'),
            message: data.message,
        };

        const updatedBookings = bookings.map(b => (b.id === id ? updatedBookingData : b));
        localStorage.setItem('bookings', JSON.stringify(updatedBookings));

        setBooking(updatedBookingData);
        toast({
            title: 'Booking Updated!',
            description: 'The booking details have been saved successfully.',
        });
    }

    if (isLoading) {
        return <div className="text-center p-12">Loading booking details...</div>;
    }

    if (!booking) {
        return <div className="text-center p-12">Booking not found.</div>;
    }

    return (
        <div className="flex flex-col gap-6 h-full">
             <div className="flex items-center gap-4">
                 <Button variant="outline" size="icon" asChild>
                    <Link href="/admin/booking-requests">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back to Booking Requests</span>
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Edit Booking</h1>
                    <p className="text-muted-foreground">Modify details or update the status for {booking.name}.</p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                     <Card>
                        <CardHeader>
                            <CardTitle>Booking Information</CardTitle>
                            <CardDescription>Use this form to edit the client's booking information.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6">
                            <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />

                             <div className="grid md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="tourType" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tour Package</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select a tour" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="gem-explorer-day-tour">Gem Explorer Day Tour</SelectItem>
                                                <SelectItem value="sapphire-trails-deluxe">Sapphire Trails Deluxe</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="guests" render={({ field }) => (<FormItem><FormLabel>Number of Guests</FormLabel><FormControl><Input type="number" min="1" {...field} /></FormControl><FormMessage /></FormItem>)} />
                             </div>
                             
                             <FormField control={form.control} name="date" render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Tour Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>
                                                    {field.value ? (format(field.value, "PPP")) : (<span>Pick a date</span>)}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus/>
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                             )}/>

                             <FormField control={form.control} name="message" render={({ field }) => (<FormItem><FormLabel>Additional Message</FormLabel><FormControl><Textarea className="min-h-[120px]" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </CardContent>
                    </Card>

                    <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-4">
                        <div className="flex flex-col-reverse sm:flex-row gap-4">
                           {booking.status === 'pending' && (
                                <>
                                    <Button type="button" onClick={() => handleStatusChange('accepted')}>Accept Booking</Button>
                                    <Button type="button" onClick={() => handleStatusChange('rejected')} variant="destructive">Reject Booking</Button>
                                </>
                            )}
                        </div>
                        <Button type="submit">Save Changes</Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
