
"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { bookingFormSchema } from "@/lib/schemas"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { mapServerPackageToClient, type TourPackage } from "@/lib/packages-data"
import { Separator } from "../ui/separator"

export function BookingForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const searchParams = useSearchParams();
  const tourTypeParam = searchParams.get('tourType');
  const { user } = useAuth();
  const { toast } = useToast();
  const [tourPackages, setTourPackages] = useState<TourPackage[]>([]);
  const [totalPrice, setTotalPrice] = useState<number | null>(null);

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
      name: "",
      email: "",
      phone: "",
      tourType: tourTypeParam ? Number(tourTypeParam) : undefined,
      guests: 1,
      message: "",
    },
  });

  const watchedTourType = form.watch('tourType');
  const watchedGuests = form.watch('guests');

  useEffect(() => {
    if (watchedTourType && watchedGuests > 0) {
      const selectedPackage = tourPackages.find(p => p.id === Number(watchedTourType));
      if (selectedPackage && selectedPackage.price) {
        const pricePerPerson = parseFloat(selectedPackage.price.replace(/[^0-9.-]+/g,""));
        if (!isNaN(pricePerPerson)) {
          setTotalPrice(pricePerPerson * watchedGuests);
        } else {
          setTotalPrice(null);
        }
      } else {
        setTotalPrice(null);
      }
    } else {
      setTotalPrice(null);
    }
  }, [watchedTourType, watchedGuests, tourPackages]);

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        tourType: tourTypeParam ? Number(tourTypeParam) : form.getValues('tourType'),
        guests: form.getValues('guests') || 1,
        date: form.getValues('date'),
        message: form.getValues('message') || "",
      });
    }
  }, [user, form, tourTypeParam]);

  async function onSubmit(data: z.infer<typeof bookingFormSchema>) {
     if (!user) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "You must be logged in to make a booking.",
        });
        return;
    }

    const payload = {
        user_id: user.id,
        tour_package_id: data.tourType,
        name: data.name,
        email: data.email,
        phone: data.phone,
        guests: Number(data.guests),
        tour_date: format(data.date, 'yyyy-MM-dd'),
        message: data.message,
    };
    
    try {
        const response = await fetch('http://localhost/sapphire_trails_server/bookings', {
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

        setIsSubmitted(true);
        form.reset();
        toast({
          title: "Request Sent!",
          description: "Your booking request has been submitted successfully.",
        });

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
    <section id="booking-form" className="w-full py-12 md:py-24 lg:py-32 bg-background-alt">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-headline font-bold tracking-tighter sm:text-5xl">Confirm Your Details</h2>
          <p className="mt-4 text-muted-foreground md:text-xl/relaxed">
            Fill out the form below to book your tour. We will get back to you shortly to confirm your reservation.
          </p>
        </div>
        <div className="mx-auto mt-12 max-w-xl">
          {isSubmitted ? (
             <div className="text-center rounded-lg border bg-card text-card-foreground shadow-sm p-12">
                <h3 className="text-2xl font-bold text-primary">Thank You!</h3>
                <p className="text-muted-foreground mt-4">Your booking request has been sent successfully. We will contact you shortly.</p>
             </div>
          ) : (
            <Card>
              <CardContent className="p-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your Name" {...field} disabled={!!user} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="your.email@example.com" {...field} disabled={!!user} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Your Phone Number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="tourType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tour Package</FormLabel>
                            <Select onValueChange={field.onChange} value={String(field.value)}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a tour" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {tourPackages.map(pkg => (
                                    <SelectItem key={pkg.id} value={String(pkg.id)}>{pkg.homepageTitle}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="guests"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Number of Guests</FormLabel>
                            <FormControl>
                              <Input type="number" min="1" placeholder="1" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))}/>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                     <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Preferred Tour Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date < new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Message (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Any special requests or questions?"
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {totalPrice !== null && (
                      <div className="space-y-4 pt-4 border-t border-border">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Total Estimated Price:</span>
                          <span className="text-2xl font-bold text-primary">
                            ${totalPrice.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}

                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Submit Booking Request</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}
