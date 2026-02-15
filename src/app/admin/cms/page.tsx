
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { cmsFormSchema } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { LoaderCircle } from 'lucide-react';
import { getFullImageUrl } from '@/lib/utils';

const CMS_DATA_KEY = 'sapphire-cms-data';
const API_BASE_URL = 'https://server-sapphiretrails.payshia.com';

const defaultContent = {
  description: "Get more than just a glimpse of this captivating world with our unique Gem Mine Tours. In the heart of Ratnapura, Sri Lanka—the legendary 'City of Gems'—this authentic gemstone tour takes you into actual mining pits. Discover the ancient tradition behind world-famous Ceylon Sapphires, guided by experts. It's a rich experience far beyond the usual tourist trail.",
  images: [
    { 
      src: 'https://content-provider.payshia.com/sapphire-trail/images/tour-1-optimized.webp', 
      alt: 'A tourist gets fitted with a safety harness before a gem tour.', 
      hint: 'gem tour safety',
      hoverDescription: "Prepare for an authentic Gem Mine Tour. Safety and adventure go hand-in-hand as you get ready to descend into a real mine."
    },
    { 
      src: 'https://content-provider.payshia.com/sapphire-trail/images/tour-2-optimized.webp', 
      alt: 'A happy tourist smiles while holding his helmet straps during a gem mine tour.', 
      hint: 'happy tourist gem tour',
      hoverDescription: "The thrill of discovery on our Gem Tour. This hands-on experience is what makes our gem tours unforgettable."
    },
    { 
      src: 'https://content-provider.payshia.com/sapphire-trail/images/tour-3-optimized.webp', 
      alt: 'A miner works inside a dimly lit, traditional gem mine.', 
      hint: 'traditional gem mine',
      hoverDescription: "Deep inside a traditional mine. This is the heart of our Gem Mine Tour, showcasing the authentic mining process."
    },
    { 
      src: 'https://content-provider.payshia.com/sapphire-trail/images/tour-4-optimized.webp', 
      alt: 'A couple examines a glowing gemstone with a light tool.', 
      hint: 'examining gemstone',
      hoverDescription: "Inspecting a freshly found sapphire. Every Gem Tour concludes with a close-up look at these precious stones."
    },
    { 
      src: 'https://content-provider.payshia.com/sapphire-trail/images/tour-5-optimized.webp', 
      alt: 'A person holds a piece of paper with several rough gemstones on it.', 
      hint: 'rough gemstones hand',
      hoverDescription: "The rewards of a successful Gem Mine Tour. Hold raw, uncut sapphires straight from the earth."
    },
    { 
      src: 'https://content-provider.payshia.com/sapphire-trail/images/tour-6-optimized.webp', 
      alt: 'A tourist gives a thumbs-up while wearing a hard hat.', 
      hint: 'tourist thumbs up',
      hoverDescription: "An unforgettable adventure. Our guests love the unique access provided by our expert-led Gem Tour."
    },
    { 
      src: 'https://content-provider.payshia.com/sapphire-trail/images/tour-7-optimized.webp', 
      alt: 'A person sharpens a tool on a traditional gem cutting wheel.', 
      hint: 'gem cutting wheel',
      hoverDescription: "The art of transformation. Witness traditional gem cutting, a key part of the complete Gem Mine Tour experience."
    },
    { 
      src: 'https://content-provider.payshia.com/sapphire-trail/images/tour-8-optimized.webp', 
      alt: 'A gemologist sorts and grades small gemstones at a well-lit desk.', 
      hint: 'gemologist sorting gems',
      hoverDescription: "From rough stone to finished jewel. Our gemologists explain the sorting process, an essential part of every Gem Tour."
    },
  ]
};

const defaultValues = {
  hero: {
    headline: "Sri Lanka Gem Mine Tour - An Exclusive Luxury Experience",
    subheadline: "Discover the world's finest sapphires with a professional gem mine tour.",
  },
  discover: defaultContent,
  footer: {
    facebookUrl: 'https://facebook.com',
    instagramUrl: 'https://instagram.com',
    youtubeUrl: 'https://youtube.com',
  },
  general: {
    whatsappNumber: '94712357700',
  }
};

type CmsFormValues = z.infer<typeof cmsFormSchema>;

export default function CmsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [discoverImageFiles, setDiscoverImageFiles] = useState<(File | null)[]>(Array(8).fill(null));
  const [discoverImagePreviews, setDiscoverImagePreviews] = useState<(string | null)[]>(Array(8).fill(null));

  const form = useForm<CmsFormValues>({
    resolver: zodResolver(cmsFormSchema),
    defaultValues: defaultValues,
  });

  useEffect(() => {
    async function fetchCmsData() {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/content/homepage`);
            if (response.ok) {
                const data = await response.json();
                const fullData = {
                  hero: { ...defaultValues.hero, ...data.hero },
                  discover: { ...defaultContent, ...data.discover, images: data.discover.images?.length === 8 ? data.discover.images : defaultContent.images },
                  footer: { ...defaultValues.footer, ...data.footer },
                  general: { ...defaultValues.general, ...data.general },
                };

                const processedData = {
                    ...fullData,
                    discover: { ...fullData.discover, images: fullData.discover.images.map((img: any) => ({ ...img, src: getFullImageUrl(img.src) })) },
                }
                form.reset(processedData);
                setDiscoverImagePreviews(processedData.discover.images.map((img: { src: string }) => img.src));
            } else {
                 form.reset(defaultValues);
                 setDiscoverImagePreviews(defaultValues.discover.images.map(img => img.src));
                 toast({ variant: 'destructive', title: 'Could not load data', description: 'Using default content. Please save to create the record.'});
            }
        } catch (error) {
            console.error("Failed to fetch CMS data", error);
            form.reset(defaultValues);
            setDiscoverImagePreviews(defaultValues.discover.images.map(img => img.src));
            toast({ variant: 'destructive', title: 'Error', description: 'Could not connect to server.' });
        } finally {
            setIsLoading(false);
        }
    }
    fetchCmsData();
  }, [form, toast]);
  
  const handleDiscoverFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
        const newFiles = [...discoverImageFiles];
        newFiles[index] = file;
        setDiscoverImageFiles(newFiles);

        const newPreviews = [...discoverImagePreviews];
        newPreviews[index] = URL.createObjectURL(file);
        setDiscoverImagePreviews(newPreviews);
    }
  };


  async function onSubmit(data: CmsFormValues) {
    setIsSubmitting(true);
    const formData = new FormData();

    formData.append('content', JSON.stringify(data));

    discoverImageFiles.forEach((file, index) => {
      if (file) {
        formData.append(`discover.images.${index}.src`, file);
      }
    });

    try {
        const response = await fetch(`${API_BASE_URL}/content/homepage`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || 'Failed to save content.');
        }

        toast({
            title: 'Content Saved!',
            description: 'Your homepage and footer content has been updated successfully.',
        });
        
        const serverResponse = await response.json();
        if (serverResponse.data) {
             const serverData = serverResponse.data;
             const processedData = {
                ...serverData,
                discover: { ...serverData.discover, images: serverData.discover.images.map((img: any) => ({ ...img, src: getFullImageUrl(img.src) })) },
            }
            form.reset(processedData);
            setDiscoverImagePreviews(processedData.discover.images.map((img: { src: string }) => img.src));
            setDiscoverImageFiles(Array(8).fill(null));
            
            localStorage.setItem(CMS_DATA_KEY, JSON.stringify(processedData));
        }

    } catch (error) {
        console.error('Failed to save content', error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: error instanceof Error ? error.message : 'Could not save your content.',
        });
    } finally {
        setIsSubmitting(false);
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4">Loading CMS data...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Content Management System</h1>
        <p className="text-muted-foreground">Manage content for the homepage and general site settings.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          <Accordion type="single" collapsible className="w-full space-y-6" defaultValue="hero">
            
            <AccordionItem value="hero" className="border-none">
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <AccordionTrigger className="p-6 hover:no-underline rounded-lg data-[state=open]:rounded-b-none">
                  <div className="flex-1 text-left">
                    <h3 className="text-xl font-semibold leading-none tracking-tight">Hero Section</h3>
                    <p className="text-sm text-muted-foreground mt-1.5">Content for the main hero banner on the homepage.</p>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-6 pt-0">
                   <div className="space-y-4 border-t pt-6">
                      <FormField control={form.control} name="hero.headline" render={({ field }) => (<FormItem><FormLabel>Headline</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="hero.subheadline" render={({ field }) => (<FormItem><FormLabel>Sub-headline</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                   </div>
                </AccordionContent>
              </div>
            </AccordionItem>
            
            <AccordionItem value="discover" className="border-none">
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <AccordionTrigger className="p-6 hover:no-underline rounded-lg data-[state=open]:rounded-b-none">
                  <div className="flex-1 text-left">
                    <h3 className="text-xl font-semibold leading-none tracking-tight">Discover Section</h3>
                    <p className="text-sm text-muted-foreground mt-1.5">Content for the "Discover Our Gem Mine Tours" section.</p>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-6 pt-0">
                  <div className="space-y-6 border-t pt-6">
                    <FormField control={form.control} name="discover.description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} rows={5} /></FormControl><FormMessage /></FormItem>)} />
                    <Separator />
                    <p className="font-medium">Section Images (8)</p>
                    {form.getValues('discover.images').map((_, index) => (
                      <div key={index} className="space-y-4 p-4 border rounded-md">
                        <p className="font-medium text-sm text-muted-foreground">Image {index + 1}</p>
                        <FormItem>
                          <FormLabel>Upload New Image (Optional)</FormLabel>
                          <FormControl><Input type="file" accept="image/*" onChange={(e) => handleDiscoverFileChange(e, index)} className="text-sm" /></FormControl>
                        </FormItem>
                        {discoverImagePreviews[index] && (
                          <div className="mt-2">
                              <FormLabel>Preview</FormLabel>
                              <Image src={discoverImagePreviews[index]!} alt={`Discover image ${index + 1} preview`} width={200} height={100} className="rounded-md object-cover mt-2 border" />
                          </div>
                        )}
                        <FormField control={form.control} name={`discover.images.${index}.alt`} render={({ field }) => (<FormItem><FormLabel>Alt Text</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name={`discover.images.${index}.hint`} render={({ field }) => (<FormItem><FormLabel>Hint</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name={`discover.images.${index}.hoverDescription`} render={({ field }) => (<FormItem><FormLabel>Hover Description (SEO)</FormLabel><FormControl><Textarea {...field} placeholder="Descriptive text for SEO that appears on hover." /></FormControl><FormMessage /></FormItem>)} />
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </div>
            </AccordionItem>

            <AccordionItem value="settings" className="border-none">
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <AccordionTrigger className="p-6 hover:no-underline rounded-lg data-[state=open]:rounded-b-none">
                  <div className="flex-1 text-left">
                    <h3 className="text-xl font-semibold leading-none tracking-tight">General Settings</h3>
                    <p className="text-sm text-muted-foreground mt-1.5">Manage site-wide settings like contact info.</p>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-6 pt-0">
                  <div className="space-y-4 border-t pt-6">
                    <FormField control={form.control} name="general.whatsappNumber" render={({ field }) => (<FormItem><FormLabel>WhatsApp Number</FormLabel><FormControl><Input placeholder="e.g., 94712357700 (include country code)" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                </AccordionContent>
              </div>
            </AccordionItem>
            
            <AccordionItem value="footer" className="border-none">
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <AccordionTrigger className="p-6 hover:no-underline rounded-lg data-[state=open]:rounded-b-none">
                  <div className="flex-1 text-left">
                    <h3 className="text-xl font-semibold leading-none tracking-tight">Footer Social Links</h3>
                    <p className="text-sm text-muted-foreground mt-1.5">Update the social media links in the website footer.</p>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-6 pt-0">
                  <div className="space-y-4 border-t pt-6">
                    <FormField control={form.control} name="footer.facebookUrl" render={({ field }) => (<FormItem><FormLabel>Facebook URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="footer.instagramUrl" render={({ field }) => (<FormItem><FormLabel>Instagram URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="footer.youtubeUrl" render={({ field }) => (<FormItem><FormLabel>YouTube URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                </AccordionContent>
              </div>
            </AccordionItem>
          </Accordion>

          <div className="mt-8 pt-5 flex justify-end">
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Saving..." : "Save All Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
