
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
import { LoaderCircle, MapPin, Mail, Phone } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"

export function ContactSection() {
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
        toast({
            title: "Message Sent!",
            description: "Thank you for contacting us. We'll get back to you shortly.",
        });

    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error",
            description: error instanceof Error ? error.message : "An unknown error occurred.",
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
                            <p>Grand Silver Ray, Colombo - Batticaloa Hwy, Ratnapura, Sri Lanka.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <Mail className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-foreground">Email</p>
                            <a href="mailto:info@sapphiretrails.com" className="hover:text-primary transition-colors">info@sapphiretrails.com</a>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <Phone className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-foreground">Phone</p>
                            <a href="tel:+94712357700" className="hover:text-primary transition-colors">Primary: 071 235 7700</a>
                            <br/>
                            <a href="tel:+94716381000" className="hover:text-primary transition-colors">Secondary: 071 638 1000</a>
                        </div>
                    </div>
                </div>
                 <div
                    className="relative aspect-video rounded-lg overflow-hidden border border-border"
                    onClick={() => setIsMapActive(true)}
                  >
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3962.918184840201!2d80.48564107549169!3d6.657062193337755!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae3eb9ab0fcd781%3A0xafc2aff7a4bb736f!2sSapphire%20Trails!5e0!3m2!1sen!2sde!4v1771163604693!5m2!1sen!2sde"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen={true}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="w-full absolute inset-0"
                    ></iframe>
                     {!isMapActive && (
                        <div className="absolute inset-0 bg-transparent cursor-pointer"></div>
                    )}
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
