

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
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                      control={form.control}
                      name="adults"
                      render={({ field }) => (
                      <FormItem>
                          <FormLabel>Adults</FormLabel>
                          <Select onValueChange={(val) => field.onChange(parseInt(val))} defaultValue={String(field.value)}>
                          <FormControl>
                              <SelectTrigger>
                                  <SelectValue />
                              </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                              {[...Array(10)].map((_, i) => (
                                  <SelectItem key={i+1} value={String(i+1)}>{i+1} Adult(s)</SelectItem>
                              ))}
                          </SelectContent>
                          </Select>
                          <FormMessage />
                      </FormItem>
                      )}
                  />
                  <FormField
                      control={form.control}
                      name="children"
                      render={({ field }) => (
                      <FormItem>
                          <FormLabel>Children</FormLabel>
                          <Select onValueChange={(val) => field.onChange(parseInt(val))} defaultValue={String(field.value)}>
                          <FormControl>
                              <SelectTrigger>
                                  <SelectValue />
                              </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                              {[...Array(6)].map((_, i) => (
                                  <SelectItem key={i} value={String(i)}>{i} Child(ren)</SelectItem>
                              ))}
                          </SelectContent>
                          </Select>
                          <FormMessage />
                      </FormItem>
                      )}
                  />
                </div>
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
