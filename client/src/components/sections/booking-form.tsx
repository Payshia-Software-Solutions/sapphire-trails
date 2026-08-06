

"use client"

import { useFormContext } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

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

export function BookingForm({ tourPackages, selectedTour, onSubmit }: { tourPackages: TourPackage[], selectedTour?: TourPackage, onSubmit: (data: any) => void }) {
  const form = useFormContext<z.infer<typeof bookingFormSchema>>();
  
  return (
    <form id="booking-form-main" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="border-border/80 shadow-md">
            <CardHeader className="p-4 pb-2 sm:p-6 sm:pb-3">
                <CardTitle className="text-lg sm:text-xl">Select Date &amp; Guests</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Choose your preferred date and travelers.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2 sm:p-6 sm:pt-3 space-y-4">
                {!selectedTour && (
                  <FormField
                      control={form.control}
                      name="tourType"
                      render={({ field }) => (
                      <FormItem>
                          <FormLabel className="text-xs sm:text-sm">Tour Package</FormLabel>
                          <Select onValueChange={(val) => field.onChange(parseInt(val))} value={String(field.value)}>
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
                )}

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
                    <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                                <Input placeholder="Your Address" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
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
