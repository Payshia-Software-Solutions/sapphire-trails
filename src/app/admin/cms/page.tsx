'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { cmsFormSchema } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const CMS_DATA_KEY = 'sapphire-cms-data';

// These defaults are extracted from the current hardcoded content
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

export default function CmsPage() {
  const { toast } = useToast();
  
  const form = useForm<CmsFormValues>({
    resolver: zodResolver(cmsFormSchema),
    defaultValues: defaultValues,
  });

  useEffect(() => {
    try {
      const storedDataRaw = localStorage.getItem(CMS_DATA_KEY);
      if (storedDataRaw) {
        const storedData = JSON.parse(storedDataRaw);
        form.reset(storedData);
      }
    } catch (error) {
      console.error("Failed to load CMS data from localStorage", error);
    }
  }, [form]);

  function onSubmit(data: CmsFormValues) {
    try {
      localStorage.setItem(CMS_DATA_KEY, JSON.stringify(data));
      toast({
        title: 'Content Saved!',
        description: 'Your homepage and footer content has been updated successfully.',
      });
    } catch (error) {
      console.error('Failed to save to localStorage', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'There was a problem saving your content.',
      });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Content Management System</h1>
        <p className="text-muted-foreground">Manage content for the homepage and footer.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          <Card>
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
              <CardDescription>Content for the main hero banner on the homepage.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="hero.headline" render={({ field }) => (<FormItem><FormLabel>Headline</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="hero.subheadline" render={({ field }) => (<FormItem><FormLabel>Sub-headline</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="hero.imageUrl" render={({ field }) => (<FormItem><FormLabel>Background Image URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <div className="grid md:grid-cols-2 gap-4">
                <FormField control={form.control} name="hero.imageAlt" render={({ field }) => (<FormItem><FormLabel>Image Alt Text</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="hero.imageHint" render={({ field }) => (<FormItem><FormLabel>Image AI Hint</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Discover Section</CardTitle>
              <CardDescription>Content for the "Discover the Sapphire Trails" section.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField control={form.control} name="discover.description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} rows={5} /></FormControl><FormMessage /></FormItem>)} />
              <Separator />
              <p className="font-medium">Section Images (3)</p>
              {defaultValues.discover.images.map((_, index) => (
                <div key={index} className="space-y-4 p-4 border rounded-md">
                  <p className="font-medium text-sm text-muted-foreground">Image {index + 1}</p>
                  <FormField control={form.control} name={`discover.images.${index}.src`} render={({ field }) => (<FormItem><FormLabel>URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField control={form.control} name={`discover.images.${index}.alt`} render={({ field }) => (<FormItem><FormLabel>Alt Text</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name={`discover.images.${index}.hint`} render={({ field }) => (<FormItem><FormLabel>Hint</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Footer Social Links</CardTitle>
              <CardDescription>Update the social media links in the website footer.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="footer.facebookUrl" render={({ field }) => (<FormItem><FormLabel>Facebook URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="footer.instagramUrl" render={({ field }) => (<FormItem><FormLabel>Instagram URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="footer.youtubeUrl" render={({ field }) => (<FormItem><FormLabel>YouTube URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            </CardContent>
          </Card>

          <div className="mt-8 pt-5 flex justify-end">
            <Button type="submit" size="lg">Save All Changes</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
