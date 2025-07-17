

"use client"

import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { CalendarIcon, Clock, Users, DollarSign } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { type TourPackage } from "@/lib/packages-data"

export function BookingForm({ tourPackages, selectedTour }: { tourPackages: TourPackage[], selectedTour?: TourPackage }) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const form = useFormContext<z.infer<typeof bookingFormSchema>>();

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

  if (isSubmitted) {
    return (
        <div className="text-center rounded-lg border bg-card text-card-foreground shadow-sm p-12 h-full flex flex-col justify-center items-center">
        <h3 className="text-2xl font-bold text-primary">Thank You!</h3>
        <p className="text-muted-foreground mt-4">Your booking request has been sent successfully. We will contact you shortly.</p>
        </div>
    )
  }
  
  return (
    <form id="booking-form-main" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl text-primary">{selectedTour?.tourPageTitle || 'Select a Tour'}</CardTitle>
                 {selectedTour && (
                    <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                        <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {selectedTour.duration}</span>
                        <span className="flex items-center gap-1.5"><DollarSign className="h-4 w-4" /> {selectedTour.price} per person</span>
                    </div>
                 )}
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Select Date</FormLabel>
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
                 <FormItem>
                    <FormLabel>Select Time</FormLabel>
                    <Select defaultValue="08:00">
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="08:00">8:00 AM</SelectItem>
                        </SelectContent>
                    </Select>
                </FormItem>
                <FormField
                    control={form.control}
                    name="guests"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Participants</FormLabel>
                        <Select onValueChange={(val) => field.onChange(parseInt(val))} value={String(field.value)}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {[...Array(10)].map((_, i) => (
                                <SelectItem key={i+1} value={String(i+1)}>{i+1} Person</SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Traveler Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                            <Input placeholder="your.email@example.com" {...field} disabled={!!user} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                                <Input placeholder="Your Phone Number" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <FormItem>
                        <FormLabel>Country</FormLabel>
                        <Select>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Country"/>
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="lk">Sri Lanka</SelectItem>
                                <SelectItem value="us">United States</SelectItem>
                                <SelectItem value="gb">United Kingdom</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormItem>
                 </div>
                 <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Special Requests (Optional)</FormLabel>
                        <FormControl>
                        <Textarea
                            placeholder="Dietary requirements, accessibility needs, etc."
                            className="min-h-[120px]"
                            {...field}
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </CardContent>
        </Card>
    </form>
  )
}
