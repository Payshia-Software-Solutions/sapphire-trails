
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { locationFormSchema } from '@/lib/schemas';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';
import { mapServerLocationToClient, type Location } from '@/lib/locations-data';
import { Skeleton } from '@/components/ui/skeleton';

const iconOptions = ['Leaf', 'Mountain', 'Bird', 'Home', 'Clock', 'CalendarDays', 'Ticket', 'Users', 'AlertTriangle', 'Gem', 'Waves', 'Landmark', 'Camera', 'Tent', 'Thermometer'];
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const steps = [
  { id: 1, name: 'Basic Information', fields: ['title', 'slug', 'cardDescription', 'distance'] as const },
  { id: 2, name: 'Hero & Intro', fields: ['subtitle', 'introTitle', 'introDescription'] as const },
  { id: 3, name: 'Gallery Images', fields: ['galleryImages'] as const },
  { id: 4, name: 'Key Highlights', fields: ['highlights'] as const },
  { id: 5, name: 'Visitor Information', fields: ['visitorInfo'] as const },
  { id: 6, name: 'Map & Nearby', fields: ['mapEmbedUrl', 'nearbyAttractions'] as const },
];

function LoadingFormSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10" />
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-80" />
                </div>
            </div>
            <Skeleton className="h-2 w-full" />
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-72" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        </div>
    )
}

export default function EditContentPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

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
      galleryImages: Array(4).fill({ src: '', alt: '', hint: '' }),
      highlights: Array(4).fill({ icon: 'Leaf', title: '', description: '' }),
      visitorInfo: Array(4).fill({ icon: 'Clock', title: '', line1: '', line2: '' }),
      mapEmbedUrl: '',
      nearbyAttractions: Array(3).fill({ icon: 'Gem', name: '', distance: '' }),
    },
  });
  
  useEffect(() => {
    if (!slug) {
        setIsLoadingData(false);
        toast({ variant: 'destructive', title: 'Error', description: 'No location slug provided.'});
        router.push('/admin/manage-content');
        return;
    };

    async function fetchLocation() {
        try {
            const response = await fetch(`${API_BASE_URL}/locations/${slug}`);
            if (!response.ok) throw new Error('Failed to fetch location data');
            
            const serverData = await response.json();
            const locationData = mapServerLocationToClient(serverData);
            
            // Set form values from fetched data
            form.reset({
                title: locationData.title,
                slug: locationData.slug,
                cardDescription: locationData.cardDescription,
                cardImage: locationData.cardImage,
                imageHint: locationData.imageHint,
                distance: locationData.distance,
                subtitle: locationData.subtitle,
                heroImage: locationData.heroImage,
                heroImageHint: locationData.heroImageHint,
                introTitle: locationData.intro.title,
                introDescription: locationData.intro.description,
                introImageUrl: locationData.intro.imageUrl,
                introImageHint: locationData.intro.imageHint,
                galleryImages: locationData.galleryImages,
                highlights: locationData.highlights,
                visitorInfo: locationData.visitorInfo,
                mapEmbedUrl: locationData.map.embedUrl,
                nearbyAttractions: locationData.map.nearbyAttractions,
            });

        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not load location data.' });
            router.push('/admin/manage-content');
        } finally {
            setIsLoadingData(false);
        }
    }
    fetchLocation();
  }, [slug, form, router, toast]);

  const handleNext = async () => {
    const fields = steps[currentStep - 1].fields;
    const isValid = await form.trigger(fields as any, { shouldFocus: true });
    
    if (!isValid) {
        toast({ variant: "destructive", title: "Validation Error", description: "Please fill out all required fields." });
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

  async function onSubmit(data: z.infer<typeof locationFormSchema>) {
    setIsSubmitting(true);
    toast({
        title: 'Update Not Implemented',
        description: 'Frontend is ready, but the server needs an UPDATE endpoint.',
        variant: 'destructive',
    });
    console.log("Form data to be sent for update:", data);
    // In a real implementation, you would send this data to a PUT/PATCH endpoint
    // e.g., await fetch(`${API_BASE_URL}/locations/${slug}`, { method: 'PUT', body: JSON.stringify(data) });
    setIsSubmitting(false);
  }

  const progressValue = (currentStep / steps.length) * 100;

  if (isLoadingData) {
    return <LoadingFormSkeleton />;
  }

  return (
    <div className="flex flex-col gap-6">
       <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push('/admin/manage-content')}>
            <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-primary">Edit Location</h1>
            <p className="text-muted-foreground break-words">Now editing: <span className="font-semibold">{form.getValues('title')}</span></p>
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
                    <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="slug" render={({ field }) => (<FormItem><FormLabel>Slug (Cannot be changed)</FormLabel><FormControl><Input {...field} disabled /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                  <FormField control={form.control} name="cardDescription" render={({ field }) => (<FormItem><FormLabel>Card Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="distance" render={({ field }) => (<FormItem><FormLabel>Distance</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                </CardContent>
              </Card>
            </div>
            
             <div className={cn(currentStep === 2 ? 'block' : 'hidden')}>
              <Card>
                <CardHeader>
                    <CardTitle>Hero & Intro Section</CardTitle>
                    <CardDescription>Content for the top of the location detail page. Image URLs cannot be changed here.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField control={form.control} name="subtitle" render={({ field }) => (<FormItem><FormLabel>Hero Subtitle</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <Separator/>
                    <FormField control={form.control} name="introTitle" render={({ field }) => (<FormItem><FormLabel>Intro Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="introDescription" render={({ field }) => (<FormItem><FormLabel>Intro Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                </CardContent>
              </Card>
            </div>

            <div className={cn(currentStep === 3 ? 'block' : 'hidden')}>
              <Card>
                <CardHeader>
                    <CardTitle>Gallery Images (4)</CardTitle>
                    <CardDescription>Image URLs cannot be changed here. Update alt text and hints.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {[...Array(4)].map((_, index) => (
                        <div key={index} className="space-y-4 p-4 border rounded-md">
                             <p className="font-medium">Image {index + 1}</p>
                             <Image src={form.getValues(`galleryImages.${index}.src`)} alt="gallery preview" width={100} height={50} className="rounded-md border object-cover"/>
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
                <Button type="button" onClick={handlePrev} variant="outline" className={cn(currentStep === 1 && "hidden")} disabled={isSubmitting}>
                  Go Back
                </Button>
              </div>
              <div>
                {currentStep < steps.length && (
                  <Button type="button" onClick={handleNext} disabled={isSubmitting}>
                    Next Step
                  </Button>
                )}
                {currentStep === steps.length && (
                  <Button type="submit" size="lg" disabled={isSubmitting}>
                    {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                )}
              </div>
            </div>
        </form>
      </Form>
    </div>
  );
}
