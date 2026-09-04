
"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
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
import { contactFormSchema } from "@/lib/schemas"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { LoaderCircle, MapPin, Mail, Phone, Clock, MessageSquare } from "lucide-react"


import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useSiteContent } from "@/lib/site-content"
import { trackLeadSubmission } from "@/lib/analytics"

export function ContactSection() {
  const { content } = useSiteContent();
  const contact = content.contact;
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMapActive, setIsMapActive] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      tourInterest: "Day Tour",
      message: "",
    },
  })

  async function onSubmit(data: z.infer<typeof contactFormSchema>) {
    setIsLoading(true);
    try {
        const response = await fetch(`/api/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('Failed to send message. Please try again later.');
        }

        setIsSubmitted(true);
        form.reset();
        trackLeadSubmission('contact_page_form');
        toast({
            title: 'Message Sent!',
            description: 'Thank you for reaching out. We will get back to you shortly.',
        });
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: error.message || 'Something went wrong. Please try again.',
        });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <section id="contact" className="w-full py-12 md:py-24 bg-background-alt">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
            <div className="space-y-8">
                <div>
                    <h2 className="text-3xl font-headline font-bold text-primary">Contact Sapphire Trails – Book Your Gem Mine Tour</h2>
                    <p className="mt-2 text-muted-foreground">Ready to explore the City of Gems? Contact our team in Ratnapura to plan your exclusive gem mine tour or inquire about our luxury tour packages. We are located at the Grand Silver Ray, conveniently accessible from the Colombo-Batticaloa Highway.</p>
                </div>
                <div className="space-y-4 text-muted-foreground">
                    <div className="flex items-start gap-4">
                        <MapPin className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-foreground">Our Location</p>
                            <p>{contact.physicalAddress}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <Mail className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-foreground">Email</p>
                            <a href={`mailto:${contact.primaryEmail}`} className="hover:text-primary transition-colors">{contact.primaryEmail}</a>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <Phone className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-foreground">Phone</p>
                            <a href={`tel:${contact.primaryPhone.replace(/\s+/g, '')}`} className="hover:text-primary transition-colors">Primary: {contact.primaryPhone}</a>
                            {contact.secondaryPhone && (
                              <>
                                <br/>
                                <a href={`tel:${contact.secondaryPhone.replace(/\s+/g, '')}`} className="hover:text-primary transition-colors">Secondary: {contact.secondaryPhone}</a>
                              </>
                            )}
                        </div>
                    </div>
                </div>
                {/* Operating Hours & Concierge Assistance Card */}
                <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="font-bold text-sm text-foreground">Expedition Hours &amp; Lounge</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      ● Open Daily
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex justify-between py-1 border-b border-border/40">
                      <span>Monday – Saturday</span>
                      <span className="font-semibold text-foreground font-mono">{contact.openingHoursWeekdays}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/40">
                      <span>Sunday &amp; Poya Days</span>
                      <span className="font-semibold text-foreground font-mono">{contact.openingHoursWeekends}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Expedition Departures</span>
                      <span className="font-semibold text-primary">Private / On-Demand</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      asChild
                      className="w-full h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold gap-2 shadow-sm"
                    >
                      <a
                        href={`https://wa.me/${contact.whatsappNumber.replace(/[^0-9]/g, '')}?text=Hello%20Sapphire%20Trails%2C%20I%20would%20like%20to%20inquire%20about%20a%20private%20gem%20tour.`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>Chat Directly on WhatsApp (24/7)</span>
                      </a>
                    </Button>
                  </div>
                </div>
            </div>

            <div>
                 {isSubmitted ? (
                    <div className="flex flex-col items-center justify-center text-center rounded-lg border bg-card text-card-foreground shadow-sm p-12 h-full">
                        <h3 className="text-2xl font-bold text-primary">Thank You!</h3>
                        <p className="text-muted-foreground mt-4">Your message has been sent successfully. We will contact you shortly.</p>
                        <Button onClick={() => setIsSubmitted(false)} variant="link" className="mt-4">Send another message</Button>
                    </div>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>Send Us a Message</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
                                <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Name</FormLabel>
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
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="your.email@example.com" {...field} />
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
                                    <FormLabel>Phone (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Your phone number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                                 <FormField
                                  control={form.control}
                                  name="tourInterest"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Tour Interest</FormLabel>
                                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select a tour or topic" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="Day Tour">Day Tour</SelectItem>
                                          <SelectItem value="Luxury Package">Luxury Package</SelectItem>
                                          <SelectItem value="Gem Buying Advice">Gem Buying Advice</SelectItem>
                                          <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                control={form.control}
                                name="message"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Message</FormLabel>
                                    <FormControl>
                                        <Textarea
                                        placeholder="Tell us how we can help"
                                        className="min-h-[120px]"
                                        {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
                                    {isLoading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                    Send Message
                                </Button>
                            </form>
                            </Form>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
      </div>
    </section>
  );
}
