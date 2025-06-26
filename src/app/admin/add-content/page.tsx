

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { locationFormSchema } from '@/lib/schemas';
import type { Location } from '@/lib/locations-data';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

const iconOptions = ['Leaf', 'Mountain', 'Bird', 'Home', 'Clock', 'CalendarDays', 'Ticket', 'Users', 'AlertTriangle', 'Gem', 'Waves', 'Landmark', 'Camera', 'Tent', 'Thermometer'];

const steps = [
  { id: 1, name: 'Basic Information', fields: ['title', 'slug', 'cardDescription', 'cardImage', 'imageHint', 'distance'] as const },
  { id: 2, name: 'Hero & Intro', fields: ['subtitle', 'heroImage', 'heroImageHint', 'introTitle', 'introDescription', 'introImageUrl', 'introImageHint'] as const },
  { id: 3, name: 'Gallery Images', fields: ['galleryImages'] as const },
  { id: 4, name: 'Key Highlights', fields: ['highlights'] as const },
  { id: 5, name: 'Visitor Information', fields: ['visitorInfo'] as const },
  { id: 6, name: 'Map & Nearby', fields: ['mapEmbedUrl', 'nearbyAttractions'] as const },
];

export default function AddContentPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const form = useForm<z.infer<typeof locationFormSchema>>({
    resolver: zodResolver(locationFormSchema),
    mode: 'onBlur',
    defaultValues: {
      title: '',
      slug: '',
      cardDescription: '',
      cardImage: '',
      imageHint: '',
      distance: '',
      subtitle: '',
      heroImage: '',
      heroImageHint: '',
      introTitle: '',
      introDescription: '',
      introImageUrl: '',
      introImageHint: '',
      galleryImages: Array.from({ length: 4 }, () => ({ src: '', alt: '', hint: '' })),
      highlights: Array.from({ length: 4 }, () => ({ icon: 'Leaf' as const, title: '', description: '' })),
      visitorInfo: Array.from({ length: 4 }, () => ({ icon: 'Clock' as const, title: '', line1: '', line2: '' })),
      mapEmbedUrl: '',
      nearbyAttractions: Array.from({ length: 3 }, () => ({ icon: 'Gem' as const, name: '', distance: '' })),
    },
  });

  const handleNext = async () => {
    const fields = steps[currentStep - 1].fields;
    const isValid = await form.trigger(fields, { shouldFocus: true });
    
    if (!isValid) {
        toast({
            variant: "destructive",
            title: "Validation Error",
            description: "Please fill out all required fields before proceeding.",
        });
        return;
    }

    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  function onSubmit(data: z.infer<typeof locationFormSchema>) {
    const newLocation: Location = {
      title: data.title,
      slug: data.slug,
      cardDescription: data.cardDescription,
      cardImage: data.cardImage,
      imageHint: data.imageHint,
      distance: data.distance,
      subtitle: data.subtitle,
      heroImage: data.heroImage,
      heroImageHint: data.heroImageHint,
      intro: {
        title: data.introTitle,
        description: data.introDescription,
        imageUrl: data.introImageUrl,
        imageHint: data.introImageHint,
      },
      galleryImages: data.galleryImages,
      highlights: data.highlights,
      visitorInfo: data.visitorInfo,
      map: {
        embedUrl: data.mapEmbedUrl,
        nearbyAttractions: data.nearbyAttractions,
      },
      category: 'nature',
    };

    try {
      const storedLocationsRaw = localStorage.getItem('customLocations');
      const storedLocations = storedLocationsRaw ? JSON.parse(storedLocationsRaw) : [];
      const updatedLocations = [...storedLocations, newLocation];
      localStorage.setItem('customLocations', JSON.stringify(updatedLocations));
      toast({
        title: 'Content Added!',
        description: `Location "${data.title}" has been saved successfully.`,
      });
      router.push('/admin/manage-content');
    } catch (error) {
      console.error('Failed to save to localStorage', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'There was a problem saving the new content.',
      });
    }
  }

  const progressValue = (currentStep / steps.length) * 100;
  
  if (!isClient) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6 h-full">
       <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push('/admin/manage-content')}>
            <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-primary">Add New Location</h1>
            <p className="text-muted-foreground">Follow the steps to add a new location.</p>
        </div>
      </div>
      
      <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Step {currentStep} of {steps.length}: <span className="text-primary font-semibold">{steps[currentStep-1].name}</span></p>
          <Progress value={progressValue} className="h-2" />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className={cn(currentStep === 1 ? 'block' : 'hidden')}>
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>This information appears on the location listing card.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., Sinharaja Rainforest" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="slug" render={({ field }) => (<FormItem><FormLabel>Slug</FormLabel><FormControl><Input placeholder="e.g., sinharaja-rainforest" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                  <FormField control={form.control} name="cardDescription" render={({ field }) => (<FormItem><FormLabel>Card Description</FormLabel><FormControl><Textarea placeholder="A short description for the card..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="cardImage" render={({ field }) => (<FormItem><FormLabel>Card Image URL</FormLabel><FormControl><Input placeholder="https://example.com/image.jpg" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="imageHint" render={({ field }) => (<FormItem><FormLabel>Card Image Hint</FormLabel><FormControl><Input placeholder="e.g., rainforest canopy" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="distance" render={({ field }) => (<FormItem><FormLabel>Distance</FormLabel><FormControl><Input placeholder="e.g., 12 km away" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className={cn(currentStep === 2 ? 'block' : 'hidden')}>
              <Card>
                <CardHeader>
                    <CardTitle>Hero & Intro Section</CardTitle>
                    <CardDescription>Content for the top of the location detail page.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField control={form.control} name="subtitle" render={({ field }) => (<FormItem><FormLabel>Hero Subtitle</FormLabel><FormControl><Input placeholder="e.g., Nature's Unspoiled Wonder" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <div className="grid md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="heroImage" render={({ field }) => (<FormItem><FormLabel>Hero Image URL</FormLabel><FormControl><Input placeholder="https://example.com/hero-image.jpg" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="heroImageHint" render={({ field }) => (<FormItem><FormLabel>Hero Image Hint</FormLabel><FormControl><Input placeholder="e.g., rainforest misty mountains" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                    <Separator/>
                    <FormField control={form.control} name="introTitle" render={({ field }) => (<FormItem><FormLabel>Intro Title</FormLabel><FormControl><Input placeholder="e.g., UNESCO World Heritage Wonder" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="introDescription" render={({ field }) => (<FormItem><FormLabel>Intro Description</FormLabel><FormControl><Textarea placeholder="Full description for the intro section..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                     <div className="grid md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="introImageUrl" render={({ field }) => (<FormItem><FormLabel>Intro Image URL</FormLabel><FormControl><Input placeholder="https://example.com/intro-image.jpg" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="introImageHint" render={({ field }) => (<FormItem><FormLabel>Intro Image Hint</FormLabel><FormControl><Input placeholder="e.g., jungle river rocks" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                </CardContent>
              </Card>
            </div>

            <div className={cn(currentStep === 3 ? 'block' : 'hidden')}>
              <Card>
                <CardHeader><CardTitle>Gallery Images (4)</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    {[...Array(4)].map((_, index) => (
                        <div key={index} className="space-y-4 p-4 border rounded-md">
                             <p className="font-medium">Image {index + 1}</p>
                             <FormField control={form.control} name={`galleryImages.${index}.src`} render={({ field }) => (<FormItem><FormLabel>URL</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                             <div className="grid md:grid-cols-2 gap-4">
                                <FormField control={form.control} name={`galleryImages.${index}.alt`} render={({ field }) => (<FormItem><FormLabel>Alt Text</FormLabel><FormControl><Input placeholder="Alt text for accessibility" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name={`galleryImages.${index}.hint`} render={({ field }) => (<FormItem><FormLabel>Hint</FormLabel><FormControl><Input placeholder="AI Hint" {...field} /></FormControl><FormMessage /></FormItem>)} />
                             </div>
                        </div>
                    ))}
                </CardContent>
              </Card>
            </div>
            
            <div className={cn(currentStep === 4 ? 'block' : 'hidden')}>
              <Card>
                <CardHeader><CardTitle>Key Highlights (4)</CardTitle></CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                    {[...Array(4)].map((_, index) => (
                        <div key={index} className="space-y-4 p-4 border rounded-md">
                             <p className="font-medium">Highlight {index + 1}</p>
                            <FormField
                                control={form.control}
                                name={`highlights.${index}.icon`}
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Icon</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select an icon" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {iconOptions.map(icon => <SelectItem key={icon} value={icon}>{icon}</SelectItem>)}
                                    </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                             <FormField control={form.control} name={`highlights.${index}.title`} render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="Highlight title" {...field} /></FormControl><FormMessage /></FormItem>)} />
                             <FormField control={form.control} name={`highlights.${index}.description`} render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Highlight description" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                    ))}
                </CardContent>
              </Card>
            </div>

            <div className={cn(currentStep === 5 ? 'block' : 'hidden')}>
               <Card>
                <CardHeader><CardTitle>Visitor Information (4)</CardTitle></CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                    {[...Array(4)].map((_, index) => (
                        <div key={index} className="space-y-4 p-4 border rounded-md">
                             <p className="font-medium">Info Item {index + 1}</p>
                            <FormField
                                control={form.control}
                                name={`visitorInfo.${index}.icon`}
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Icon</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select an icon" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {iconOptions.map(icon => <SelectItem key={icon} value={icon}>{icon}</SelectItem>)}
                                    </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                             <FormField control={form.control} name={`visitorInfo.${index}.title`} render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="Info title" {...field} /></FormControl><FormMessage /></FormItem>)} />
                             <FormField control={form.control} name={`visitorInfo.${index}.line1`} render={({ field }) => (<FormItem><FormLabel>Line 1</FormLabel><FormControl><Input placeholder="e.g., 6:00 AM - 6:00 PM" {...field} /></FormControl><FormMessage /></FormItem>)} />
                             <FormField control={form.control} name={`visitorInfo.${index}.line2`} render={({ field }) => (<FormItem><FormLabel>Line 2</FormLabel><FormControl><Input placeholder="e.g., Daily" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                    ))}
                </CardContent>
              </Card>
            </div>
            
            <div className={cn(currentStep === 6 ? 'block' : 'hidden')}>
              <Card>
                <CardHeader><CardTitle>Map & Nearby (3)</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    <FormField control={form.control} name="mapEmbedUrl" render={({ field }) => (<FormItem><FormLabel>Google Maps Embed URL</FormLabel><FormControl><Input placeholder="https://www.google.com/maps/embed?pb=..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <Separator/>
                    <p className="font-medium">Nearby Attractions</p>
                    {[...Array(3)].map((_, index) => (
                        <div key={index} className="space-y-4 p-4 border rounded-md">
                            <div className="grid md:grid-cols-3 gap-4">
                                <FormField
                                    control={form.control}
                                    name={`nearbyAttractions.${index}.icon`}
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Icon</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select an icon" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {iconOptions.map(icon => <SelectItem key={icon} value={icon}>{icon}</SelectItem>)}
                                        </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField control={form.control} name={`nearbyAttractions.${index}.name`} render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="e.g., Adam's Peak" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name={`nearbyAttractions.${index}.distance`} render={({ field }) => (<FormItem><FormLabel>Distance</FormLabel><FormControl><Input placeholder="e.g., 45 km away" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                        </div>
                    ))}
                </CardContent>
              </Card>
            </div>
          
            <div className="mt-8 pt-5 flex justify-between">
              <div>
                <Button type="button" onClick={handlePrev} variant="outline" className={cn(currentStep === 1 && "hidden")}>
                  Go Back
                </Button>
              </div>
              <div>
                {currentStep < steps.length && (
                  <Button type="button" onClick={handleNext}>
                    Next Step
                  </Button>
                )}
                {currentStep === steps.length && (
                  <Button type="submit" size="lg">
                    Save New Location
                  </Button>
                )}
              </div>
            </div>
        </form>
      </Form>
    </div>
  );
}
