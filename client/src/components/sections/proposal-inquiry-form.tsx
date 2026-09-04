'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  LoaderCircle, 
  MessageCircle, 
  MapPin, 
  Mail, 
  Phone, 
  Gem, 
  Clock, 
  Truck, 
  ShieldCheck 
} from 'lucide-react';

const proposalInquirySchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().min(6, { message: 'Please provide a valid phone or WhatsApp number.' }),
  country: z.string().optional(),
  targetDate: z.string().optional(),
  gemstone: z.string().min(1, { message: 'Please select a preferred gemstone.' }),
  ringMetal: z.string().min(1, { message: 'Please select a preferred metal.' }),
  ringStyle: z.string().optional(),
  budgetRange: z.string().optional(),
  proposalAssistance: z.string().optional(),
  message: z.string().min(10, { message: 'Please provide some brief details about your dream proposal or requirements.' }),
});

type ProposalInquiryFormValues = z.infer<typeof proposalInquirySchema>;

export function ProposalInquiryForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<ProposalInquiryFormValues>({
    resolver: zodResolver(proposalInquirySchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      country: '',
      targetDate: '',
      gemstone: 'Ceylon Royal Blue Sapphire',
      ringMetal: '18K White Gold',
      ringStyle: 'Solitaire Classic',
      budgetRange: '$2,500 - $5,000 USD',
      proposalAssistance: 'None / Ring & Tour only',
      message: '',
    },
  });

  const onSubmit = async (data: ProposalInquiryFormValues) => {
    setIsLoading(true);
    try {
      const detailedMessage = `
[CUSTOM PROPOSAL & 5-DAY BESPOKE RING INQUIRY]
------------------------------------------------
Client Name: ${data.name}
Email: ${data.email}
Phone/WhatsApp: ${data.phone}
Country: ${data.country || 'Not specified'}
Target Tour / Proposal Date: ${data.targetDate || 'Flexible'}

PREFERENCES:
- Gemstone: ${data.gemstone}
- Ring Metal: ${data.ringMetal}
- Ring Style: ${data.ringStyle || 'Not specified'}
- Budget Range: ${data.budgetRange || 'Not specified'}
- Proposal Assistance: ${data.proposalAssistance || 'None'}

CLIENT NOTES & REQUIREMENTS:
${data.message}
      `.trim();

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          tourInterest: 'Custom Proposal & 5-Day Bespoke Ring Package',
          message: detailedMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message. Please try again later.');
      }

      setIsSubmitted(true);
      form.reset();
      toast({
        title: 'Proposal Inquiry Received!',
        description: "Thank you for contacting us. We'll get back to you shortly.",
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateWhatsAppUrl = () => {
    const text = encodeURIComponent(
      "Hello Sapphire Trails, I am interested in inquiring about the Custom Proposal Package (Gem Tour, Gem Selection, 5-Day Custom Ring Designing & Delivery). Could you please share more details?"
    );
    return `https://wa.me/94712357700?text=${text}`;
  };

  return (
    <section id="inquiry" className="w-full py-12 md:py-24 bg-background-alt">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
          
          {/* Left Column: Details matching contact-section.tsx */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-headline font-bold text-primary">Inquire About Custom Proposal Package</h2>
              <div className="w-24 h-px bg-primary my-4"></div>
              <p className="text-muted-foreground leading-relaxed">
                Every romantic proposal is unique. Share your preferred gemstone, metal type, ring style, and travel dates with us. Our certified gemologists and private jewelry designers will curate a personalized itinerary and custom proposal quote.
              </p>
            </div>

            <div className="space-y-4 text-muted-foreground">
              <div className="flex items-start gap-4">
                <Gem className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">Certified Ceylon Gemstones</p>
                  <p>100% natural, ethically sourced Ratnapura sapphires and gems with government NGJA / GIA certification.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Clock className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">5-Day Fast-Track Crafting</p>
                  <p>Custom 3D CAD modeling, precision casting, stone setting, and laser hallmarking within 5 working days.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Truck className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">Insured Hand Delivery</p>
                  <p>White-glove delivery directly to your luxury hotel or proposal venue across Sri Lanka (or international express shipping).</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Phone className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">Direct Concierge Assistance</p>
                  <a href="tel:+94712357700" className="hover:text-primary transition-colors block">Primary: 071 235 7700</a>
                  <a href="mailto:info@sapphiretrails.lk" className="hover:text-primary transition-colors block">Email: info@sapphiretrails.lk</a>
                </div>
              </div>
            </div>

            {/* WhatsApp Quick CTA */}
            <div className="pt-2">
              <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6">
                <a href={generateWhatsAppUrl()} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Chat on WhatsApp (+94 71 235 7700)
                </a>
              </Button>
            </div>
          </div>

          {/* Right Column: Form Card matching contact-section.tsx */}
          <div>
            {isSubmitted ? (
              <div className="flex flex-col items-center justify-center text-center rounded-lg border bg-card text-card-foreground shadow-sm p-12 h-full">
                <h3 className="text-2xl font-bold text-primary">Thank You!</h3>
                <p className="text-muted-foreground mt-4">
                  Your proposal inquiry has been sent successfully. Our master gemologist and concierge will review your details and contact you shortly.
                </p>
                <Button onClick={() => setIsSubmitted(false)} variant="link" className="mt-4 text-primary">
                  Send another inquiry
                </Button>
              </div>
            ) : (
              <Card className="border border-border">
                <CardHeader>
                  <CardTitle className="text-xl font-headline font-bold text-foreground">
                    Custom Proposal & Ring Inquiry
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name *</FormLabel>
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
                              <FormLabel>Email *</FormLabel>
                              <FormControl>
                                <Input placeholder="your.email@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone / WhatsApp *</FormLabel>
                              <FormControl>
                                <Input placeholder="Your phone number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="targetDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Target Proposal Date</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. November 2026" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="gemstone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Gemstone Preference</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select gemstone" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Ceylon Royal Blue Sapphire">Ceylon Royal Blue Sapphire</SelectItem>
                                  <SelectItem value="Padparadscha Sapphire (Lotus Bloom)">Padparadscha Sapphire</SelectItem>
                                  <SelectItem value="Ceylon Pink Sapphire">Ceylon Pink Sapphire</SelectItem>
                                  <SelectItem value="Ceylon Yellow Sapphire">Ceylon Yellow Sapphire</SelectItem>
                                  <SelectItem value="Ceylon Natural Ruby">Ceylon Natural Ruby</SelectItem>
                                  <SelectItem value="Undecided / Open to Advice">Undecided / Open to Advice</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="ringMetal"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ring Metal</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select metal" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="18K White Gold">18K White Gold</SelectItem>
                                  <SelectItem value="18K Yellow Gold">18K Yellow Gold</SelectItem>
                                  <SelectItem value="18K Rose Gold">18K Rose Gold</SelectItem>
                                  <SelectItem value="Platinum 950">Platinum 950</SelectItem>
                                  <SelectItem value="Undecided">Undecided</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="ringStyle"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ring Style</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select style" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Solitaire Classic">Solitaire Classic</SelectItem>
                                  <SelectItem value="Halo / Accent Halo">Halo / Accent Halo</SelectItem>
                                  <SelectItem value="Three-Stone / Trilogy">Three-Stone / Trilogy</SelectItem>
                                  <SelectItem value="Vintage / Art Deco">Vintage / Art Deco</SelectItem>
                                  <SelectItem value="Custom Design / Need Advice">Custom Design / Need Advice</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="budgetRange"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Estimated Budget (USD)</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select budget range" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Under $2,000 USD">Under $2,000 USD</SelectItem>
                                  <SelectItem value="$2,000 - $4,000 USD">$2,000 - $4,000 USD</SelectItem>
                                  <SelectItem value="$4,000 - $8,000 USD">$4,000 - $8,000 USD</SelectItem>
                                  <SelectItem value="$8,000+ USD">$8,000+ USD</SelectItem>
                                </SelectContent>
                              </Select>
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
                            <FormLabel>Message / Custom Requirements *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe your partner's taste, ring size, proposal timeline, or any special requests..."
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-2" 
                        disabled={isLoading}
                      >
                        {isLoading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Proposal Inquiry
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
