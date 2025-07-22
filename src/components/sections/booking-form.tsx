

"use client"

import { useState }from "react"
import { useFormContext } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { CalendarIcon, Check, Gem, Mail, X } from "lucide-react"
import { useRouter } from "next/navigation"

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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { type TourPackage } from "@/lib/packages-data"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface ConfirmationDetails {
    tourName: string;
    date: Date;
    guests: number;
    totalPrice: number;
}

function BookingConfirmation({ details, onClose }: { details: ConfirmationDetails, onClose: () => void }) {
    const router = useRouter();

    const handleViewBooking = () => {
        router.push('/profile');
    };
    
    const handleExploreTours = () => {
        router.push('/tours');
    };
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-in fade-in-0">
            <div className="relative w-full max-w-2xl bg-background rounded-2xl p-8 md:p-12 text-center text-white/90 shadow-2xl shadow-primary/20">
                <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-muted-foreground hover:text-white" onClick={onClose}>
                    <X className="h-6 w-6" />
                </Button>
                
                <div className="flex flex-col items-center">
                    <div className="h-20 w-20 flex items-center justify-center rounded-full bg-primary mb-4">
                        <Check className="h-12 w-12 text-primary-foreground" />
                    </div>
                    <div className="flex gap-2 text-primary mb-4">
                        <Gem className="h-5 w-5 fill-primary" />
                        <Gem className="h-5 w-5 fill-primary" />
                        <Gem className="h-5 w-5 fill-primary" />
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
                         <span className="font-semibold text-white">{details.guests} Adults</span>
                     </div>
                      <div className="flex justify-between items-center text-sm">
                         <span className="text-muted-foreground">Total Paid</span>
                         <span className="font-semibold text-primary">${details.totalPrice.toFixed(2)}</span>
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

export function BookingForm({ tourPackages, selectedTour }: { tourPackages: TourPackage[], selectedTour?: TourPackage }) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [confirmationDetails, setConfirmationDetails] = useState<ConfirmationDetails | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const form = useFormContext<z.infer<typeof bookingFormSchema>>();

  async function onSubmit(data: z.infer<typeof bookingFormSchema>) {
     if (!selectedTour) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "You must have a tour selected.",
        });
        return;
    }
    
    const pricePerPerson = parseFloat(selectedTour.price.replace(/[^0-9.-]+/g,""));
    const totalPrice = !isNaN(pricePerPerson) ? pricePerPerson * data.guests : 0;

    const payload = {
        user_id: user ? user.id : null,
        tour_package_id: data.tourType,
        name: data.name,
        email: data.email,
        phone: data.phone,
        guests: Number(data.guests),
        tour_date: format(data.date, 'yyyy-MM-dd'),
        message: data.message,
        type: user ? user.type : 'client',
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/bookings`, {
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
        
        setConfirmationDetails({
            tourName: selectedTour.tourPageTitle,
            date: data.date,
            guests: data.guests,
            totalPrice: totalPrice,
        });

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

  const handleCloseConfirmation = () => {
    setIsSubmitted(false);
    setConfirmationDetails(null);
  };
  
  if (isSubmitted && confirmationDetails) {
    return <BookingConfirmation details={confirmationDetails} onClose={handleCloseConfirmation} />
  }
  
  return (
    <form id="booking-form-main" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
            <CardHeader>
                <CardTitle>Select Tour &amp; Date</CardTitle>
                <CardDescription>Choose your adventure and preferred date.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="tourType"
                    render={({ field }) => (
                    <FormItem className="md:col-span-2">
                        <FormLabel>Tour Package</FormLabel>
                        <Select onValueChange={(val) => field.onChange(parseInt(val))} value={String(field.value)} disabled={!!selectedTour}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a tour package..." />
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
