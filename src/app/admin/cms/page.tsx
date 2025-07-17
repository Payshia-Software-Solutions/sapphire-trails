
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

const CMS_DATA_KEY = 'sapphire-cms-data';

const defaultValues = {
  hero: {
    headline: "Sri Lanka's Only Luxury Gem Experience",
    subheadline: "Experience luxury, culture, and adventure",
    imageUrl: "https://content-provider.payshia.com/sapphire-trail/images/img35.webp",
    imageAlt: "A dark and moody image of the inside of a gem mine, with rock walls and dim lighting.",
    imageHint: "gem mine cave",
  },
  discover: {
    description: "Embark on an exclusive journey through the heart of Sri Lanka's gem country. The Sapphire Trails offers an immersive experience into Ratnapura's rich heritage, from dazzling gem mines and lush tea estates to exquisite dining and vibrant local culture. Let us guide you on a luxurious adventure that unveils the true treasures of the island.",
    images: [
      { src: 'https://content-provider.payshia.com/sapphire-trail/images/img2.webp', alt: 'A person sifting through gravel and dirt in a woven basket, searching for gems.', hint: 'gem mining' },
      { src: 'https://content-provider.payshia.com/sapphire-trail/images/img36.webp', alt: 'People swimming and enjoying the cool water at the base of a waterfall.', hint: 'waterfall swimming' },
      { src: 'https://content-provider.payshia.com/sapphire-trail/images/img37.webp', alt: 'A vibrant collection of polished gemstones displayed in black trays.', hint: 'gemstones collection' },
    ],
  },
  footer: {
    facebookUrl: 'https://facebook.com',
    instagramUrl: 'https://instagram.com',
    youtubeUrl: 'https://youtube.com',
  },
};

type CmsFormValues = z.infer<typeof cmsFormSchema>;

const IMAGE_BASE_URL = 'https://content-provider.payshia.com/sapphire-trail';

// Helper to construct full URL from a relative path
const getFullImageUrl = (path: string | null | undefined) => {
    if (!path || path.startsWith('http') || path.startsWith('data:')) {
        return path || '';
    }
    const cleanBase = IMAGE_BASE_URL.replace(/\/$/, "");
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${cleanBase}${cleanPath}`;
};

export default function CmsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [discoverImageFiles, setDiscoverImageFiles] = useState<(File | null)[]>([null, null, null]);
  
  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null);
  const [discoverImagePreviews, setDiscoverImagePreviews] = useState<(string | null)[]>([null, null, null]);

  const form = useForm<CmsFormValues>({
    resolver: zodResolver(cmsFormSchema),
    defaultValues: defaultValues,
  });

  useEffect(() => {
    async function fetchCmsData() {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost/sapphire_trails_server/content/homepage');
            if (response.ok) {
                const data = await response.json();
                const processedData = {
                    ...data,
                    hero: { ...data.hero, imageUrl: getFullImageUrl(data.hero.imageUrl) },
                    discover: { ...data.discover, images: data.discover.images.map((img: any) => ({ ...img, src: getFullImageUrl(img.src) })) },
                }
                form.reset(processedData);
                setHeroImagePreview(processedData.hero.imageUrl);
                setDiscoverImagePreviews(processedData.discover.images.map((img: { src: string }) => img.src));
            } else {
                 setHeroImagePreview(defaultValues.hero.imageUrl);
                 setDiscoverImagePreviews(defaultValues.discover.images.map(img => img.src));
                 toast({ variant: 'destructive', title: 'Could not load data', description: 'Using default content. Please save to create the record.'});
            }
        } catch (error) {
            console.error("Failed to fetch CMS data", error);
            setHeroImagePreview(defaultValues.hero.imageUrl);
            setDiscoverImagePreviews(defaultValues.discover.images.map(img => img.src));
            toast({ variant: 'destructive', title: 'Error', description: 'Could not connect to server.' });
        } finally {
            setIsLoading(false);
        }
    }
    fetchCmsData();
  }, [form, toast]);


  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (file: File | null) => void,
    setPreview: (value: string | null) => void,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };
  
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

    // Append JSON data first
    formData.append('content', JSON.stringify(data));

    // Append files with structured keys
    if (heroImageFile) {
      formData.append('hero.imageUrl', heroImageFile);
    }
    discoverImageFiles.forEach((file, index) => {
      if (file) {
        formData.append(`discover.images.${index}.src`, file);
      }
    });

    try {
        const response = await fetch('http://localhost/sapphire_trails_server/content/homepage', {
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
        
        // Refetch data after saving to get new image URLs
        const newData = await response.json();
        if (newData.data) {
             const processedData = {
                ...newData.data,
                hero: { ...newData.data.hero, imageUrl: getFullImageUrl(newData.data.hero.imageUrl) },
                discover: { ...newData.data.discover, images: newData.data.discover.images.map((img: any) => ({ ...img, src: getFullImageUrl(img.src) })) },
            }
            form.reset(processedData);
            setHeroImagePreview(processedData.hero.imageUrl);
            setDiscoverImagePreviews(processedData.discover.images.map((img: { src: string }) => img.src));
            
            // Save the updated data to localStorage so the homepage updates
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
        <p className="text-muted-foreground">Manage content for the homepage and footer.</p>
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
                      <FormItem>
                        <FormLabel>Background Image</FormLabel>
                        <FormControl><Input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setHeroImageFile, setHeroImagePreview)} className="text-sm" /></FormControl>
                        <FormMessage />
                      </FormItem>
                      {heroImagePreview && (
                        <div className="mt-2">
                          <FormLabel>Preview</FormLabel>
                          <Image src={heroImagePreview} alt="Hero image preview" width={200} height={100} className="rounded-md object-cover mt-2 border" />
                        </div>
                      )}
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="hero.imageAlt" render={({ field }) => (<FormItem><FormLabel>Image Alt Text</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="hero.imageHint" render={({ field }) => (<FormItem><FormLabel>Image AI Hint</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                      </div>
                   </div>
                </AccordionContent>
              </div>
            </AccordionItem>
            
            <AccordionItem value="discover" className="border-none">
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <AccordionTrigger className="p-6 hover:no-underline rounded-lg data-[state=open]:rounded-b-none">
                  <div className="flex-1 text-left">
                    <h3 className="text-xl font-semibold leading-none tracking-tight">Discover Section</h3>
                    <p className="text-sm text-muted-foreground mt-1.5">Content for the &quot;Discover the Sapphire Trails&quot; section.</p>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-6 pt-0">
                  <div className="space-y-6 border-t pt-6">
                    <FormField control={form.control} name="discover.description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} rows={5} /></FormControl><FormMessage /></FormItem>)} />
                    <Separator />
                    <p className="font-medium">Section Images (3)</p>
                    {form.getValues('discover.images').map((_, index) => (
                      <div key={index} className="space-y-4 p-4 border rounded-md">
                        <p className="font-medium text-sm text-muted-foreground">Image {index + 1}</p>
                        <FormItem>
                          <FormLabel>Upload Image</FormLabel>
                          <FormControl><Input type="file" accept="image/*" onChange={(e) => handleDiscoverFileChange(e, index)} className="text-sm" /></FormControl>
                        </FormItem>
                        {discoverImagePreviews[index] && (
                          <div className="mt-2">
                              <FormLabel>Preview</FormLabel>
                              <Image src={discoverImagePreviews[index]!} alt={`Discover image ${index + 1} preview`} width={200} height={100} className="rounded-md object-cover mt-2 border" />
                          </div>
                        )}
                        <div className="grid md:grid-cols-2 gap-4">
                          <FormField control={form.control} name={`discover.images.${index}.alt`} render={({ field }) => (<FormItem><FormLabel>Alt Text</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                          <FormField control={form.control} name={`discover.images.${index}.hint`} render={({ field }) => (<FormItem><FormLabel>Hint</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                      </div>
                    ))}
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
