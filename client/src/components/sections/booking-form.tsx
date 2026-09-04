

"use client"

import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import Image from "next/image"
import { CalendarIcon, CheckCircle2, Clock, Gem, Sparkles, Car, Plane, MapPin } from "lucide-react"

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
import { type TourPackage } from "@/lib/packages-data"

export function BookingForm({ 
  tourPackages, 
  selectedTour, 
  bookedDates = [],
  isDirectBooking = false,
  onSubmit 
}: { 
  tourPackages: TourPackage[], 
  selectedTour?: TourPackage, 
  bookedDates?: string[],
  isDirectBooking?: boolean,
  onSubmit: (data: any) => void 
}) {
  const form = useFormContext<z.infer<typeof bookingFormSchema>>();
  const [isSelectorExpanded, setIsSelectorExpanded] = useState(isDirectBooking || !selectedTour);
  
  return (
    <form id="booking-form-main" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        {/* 1. Visual Tour Package Selector Card */}
        {tourPackages.length > 0 && (
          <Card className="border-border/80 shadow-md overflow-hidden">
            <CardHeader className="p-4 pb-2 sm:p-6 sm:pb-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                    <Gem className="h-5 w-5 text-primary shrink-0" />
                    <span>Select Expedition Package</span>
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm mt-0.5">
                    Choose the private gemstone mining tour or bespoke journey you wish to book.
                  </CardDescription>
                </div>
                {selectedTour && !isDirectBooking && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSelectorExpanded(!isSelectorExpanded)}
                    className="text-xs h-8 px-3 rounded-xl border-primary/30 text-primary hover:bg-primary/10 shrink-0"
                  >
                    {isSelectorExpanded ? 'Collapse' : 'Change Tour'}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2 sm:p-6 sm:pt-4">
              <FormField
                control={form.control}
                name="tourType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    {(isDirectBooking || isSelectorExpanded || !selectedTour) ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                        {tourPackages.map((pkg) => {
                          const isSelected = Number(field.value) === pkg.id;
                          const displayImg = pkg.imageUrl || pkg.heroImage || 'https://content-provider.payshia.com/sapphire-trail/images/img35.webp';

                          return (
                            <div
                              key={pkg.id}
                              onClick={() => field.onChange(pkg.id)}
                              className={cn(
                                "group relative rounded-2xl border p-3 cursor-pointer transition-all duration-300 flex flex-col justify-between overflow-hidden bg-card/60 hover:bg-card hover:shadow-lg",
                                isSelected
                                  ? "border-primary ring-2 ring-primary/40 bg-primary/5 shadow-md shadow-primary/10"
                                  : "border-border/80 hover:border-primary/40"
                              )}
                            >
                              {/* Active Selected Badge */}
                              {isSelected && (
                                <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md">
                                  <CheckCircle2 className="h-3 w-3" />
                                  <span>Selected</span>
                                </div>
                              )}

                              <div>
                                {/* Image Thumbnail */}
                                <div className="relative h-28 sm:h-32 w-full rounded-xl overflow-hidden bg-slate-950 mb-2.5">
                                  <Image
                                    src={displayImg}
                                    alt={pkg.homepageTitle || 'Tour Package'}
                                    fill
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                  
                                  {pkg.duration && (
                                    <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-md border border-white/10">
                                      <Clock className="h-3 w-3 text-primary" />
                                      <span>{pkg.duration}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Title */}
                                <h4 className="font-headline font-bold text-xs sm:text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                                  {pkg.homepageTitle || pkg.tourPageTitle}
                                </h4>
                              </div>

                              {/* Price Strip */}
                              <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between text-xs">
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">From</span>
                                <span className="font-bold text-xs sm:text-sm text-primary">
                                  {pkg.price ? `${pkg.price} ${pkg.priceSuffix || '/ person'}` : 'Custom Quote'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      /* Compact Selected Tour Preview when collapsed */
                      <div className="flex items-center justify-between p-3 rounded-xl border border-primary/30 bg-primary/5">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative h-12 w-16 rounded-lg overflow-hidden bg-slate-900 shrink-0">
                            <Image
                              src={selectedTour.imageUrl || selectedTour.heroImage || 'https://content-provider.payshia.com/sapphire-trail/images/img4.webp'}
                              alt={selectedTour.tourPageTitle}
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs sm:text-sm text-foreground truncate">{selectedTour.tourPageTitle}</h4>
                            <p className="text-[11px] text-muted-foreground">{selectedTour.duration} &bull; <span className="text-primary font-semibold">{selectedTour.price}</span></p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsSelectorExpanded(true)}
                          className="text-xs text-primary hover:text-primary hover:bg-primary/10 shrink-0 ml-2"
                        >
                          Change Tour
                        </Button>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* 2. Select Date & Guests Card */}
        <Card className="border-border/80 shadow-md">
            <CardHeader className="p-4 pb-2 sm:p-6 sm:pb-3">
                <CardTitle className="text-lg sm:text-xl">Select Date &amp; Guests</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Choose your preferred date and travelers.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2 sm:p-6 sm:pt-3 space-y-4">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                      <FormItem className="flex flex-col justify-end">
                          <FormLabel className="text-xs sm:text-sm mb-2">Select Date</FormLabel>
                          <Popover>
                          <PopoverTrigger asChild>
                              <FormControl>
                              <Button
                                  variant={"outline"}
                                  className={cn(
                                  "w-full pl-3 text-left font-normal h-10",
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
                              disabled={(date) => {
                                  const today = new Date();
                                  today.setHours(0, 0, 0, 0);
                                  if (date < today) return true;
                                  const dateStr = format(date, "yyyy-MM-dd");
                                  return bookedDates.includes(dateStr);
                              }}
                              initialFocus
                              />
                          </PopoverContent>
                          </Popover>
                          <FormMessage />
                      </FormItem>
                      )}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                        control={form.control}
                        name="adults"
                        render={({ field }) => (
                        <FormItem className="flex flex-col justify-end">
                            <FormLabel className="text-xs sm:text-sm mb-2">Adults</FormLabel>
                            <FormControl>
                              <div className="flex items-center gap-2 border border-input rounded-md px-2 py-1 w-full justify-between h-10">
                                <span className="text-[11px] sm:text-xs text-muted-foreground font-medium">Ages 12+</span>
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-6 w-6 sm:h-7 sm:w-7 rounded-full text-foreground border-border hover:bg-primary/10 shrink-0"
                                    disabled={field.value <= 1}
                                    onClick={() => field.onChange(Math.max(1, field.value - 1))}
                                  >
                                    -
                                  </Button>
                                  <span className="w-4 text-center text-xs sm:text-sm font-semibold text-foreground">{field.value}</span>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-6 w-6 sm:h-7 sm:w-7 rounded-full text-foreground border-border hover:bg-primary/10 shrink-0"
                                    onClick={() => field.onChange(field.value + 1)}
                                  >
                                    +
                                  </Button>
                                </div>
                              </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="children"
                        render={({ field }) => (
                        <FormItem className="flex flex-col justify-end">
                            <FormLabel className="text-xs sm:text-sm mb-2">Children</FormLabel>
                            <FormControl>
                              <div className="flex items-center gap-2 border border-input rounded-md px-2 py-1 w-full justify-between h-10">
                                <span className="text-[11px] sm:text-xs text-muted-foreground font-medium">Ages 2-11</span>
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-6 w-6 sm:h-7 sm:w-7 rounded-full text-foreground border-border hover:bg-primary/10 shrink-0"
                                    disabled={field.value <= 0}
                                    onClick={() => field.onChange(Math.max(0, field.value - 1))}
                                  >
                                    -
                                  </Button>
                                  <span className="w-4 text-center text-xs sm:text-sm font-semibold text-foreground">{field.value}</span>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-6 w-6 sm:h-7 sm:w-7 rounded-full text-foreground border-border hover:bg-primary/10 shrink-0"
                                    onClick={() => field.onChange(field.value + 1)}
                                  >
                                    +
                                  </Button>
                                </div>
                              </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                  </div>
                </div>
            </CardContent>
        </Card>

        <Card className="border-border/80 shadow-md">
            <CardHeader className="p-4 pb-2 sm:p-6 sm:pb-3">
                <CardTitle className="text-lg sm:text-xl">Traveler Information</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2 sm:p-6 sm:pt-3 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                            <Input placeholder="Your Name" {...field} />
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
                            <Input placeholder="your.email@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel className="flex items-center justify-between text-xs sm:text-sm font-medium">
                              <span>Phone Number (WhatsApp) <span className="text-destructive">*</span></span>
                            </FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. +94 77 123 4567" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel className="flex items-center justify-between text-xs sm:text-sm font-medium">
                              <span>Hotel / Pickup Address in Sri Lanka <span className="text-muted-foreground text-xs font-normal">(Optional)</span></span>
                            </FormLabel>
                            <FormControl>
                                <Input placeholder="Hotel name & city, or pickup location" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                 </div>

                 {/* Vehicle & Transportation Arrangement Selector */}
                 <div className="pt-2 border-t border-border/60 space-y-3">
                    <FormField
                        control={form.control}
                        name="transportService"
                        render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-foreground">
                                <Car className="h-4 w-4 text-primary" />
                                <span>Vehicle &amp; Airport Transfer Arrangement</span>
                              </FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                value={field.value || 'none'}
                              >
                                <FormControl>
                                  <SelectTrigger className="bg-background text-xs sm:text-sm">
                                    <SelectValue placeholder="Do you require vehicle / airport transport?" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="none">
                                    🚗 No — I will arrange my own transport
                                  </SelectItem>
                                  <SelectItem value="airport_pickup">
                                    ✈️ Yes — Airport Pickup (CMB Bandaranaike Airport → Ratnapura)
                                  </SelectItem>
                                  <SelectItem value="airport_roundtrip">
                                    🔄 Yes — Round-trip Airport Transfer (CMB Airport ⇄ Ratnapura)
                                  </SelectItem>
                                  <SelectItem value="hotel_transfer">
                                    🏨 Yes — Private Hotel Pickup &amp; Tour Chauffeur (Colombo, Kandy, Galle, etc.)
                                  </SelectItem>
                                  <SelectItem value="custom">
                                    📍 Yes — Custom Transport / Island-wide Tour Chauffeur
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Conditional input if transport is requested */}
                    {form.watch('transportService') && form.watch('transportService') !== 'none' && (
                      <FormField
                          control={form.control}
                          name="transportNotes"
                          render={({ field }) => (
                              <FormItem className="animate-in fade-in-50 duration-200">
                                <FormLabel className="text-xs text-muted-foreground">
                                  Flight Details or Pickup Location Details (Optional)
                                </FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="e.g. Flight UL504 arriving 06:30 AM, or Cinnamon Grand Hotel Colombo" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                          )}
                      />
                    )}
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
                            className="min-h-[100px]"
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
