
'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { ArrowLeft, LoaderCircle, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';
import { mapServerLocationToClient, type Location, type GalleryImage } from '@/lib/locations-data';
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

// Extend the GalleryImage type for the form to handle new file uploads
interface FormGalleryImage extends GalleryImage {
  file?: File;
  isNew?: boolean;
}

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

  // States for main image file objects and previews
  const [cardImageFile, setCardImageFile] = useState<File | null>(null);
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [introImageFile, setIntroImageFile] = useState<File | null>(null);

  const [cardImagePreview, setCardImagePreview] = useState<string | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null);
  const [introImagePreview, setIntroImagePreview] = useState<string | null>(null);

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
      galleryImages: [],
      highlights: [],
      visitorInfo: [],
      mapEmbedUrl: '',
      nearbyAttractions: [],
    },
  });

   const { fields: galleryFields, append: appendGallery, remove: removeGallery, update: updateGallery } = useFieldArray({
    control: form.control,
    name: "galleryImages",
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
            
            form.reset({
                ...locationData,
                introTitle: locationData.intro.title,
                introDescription: locationData.intro.description,
                introImageUrl: locationData.intro.imageUrl,
                introImageHint: locationData.intro.imageHint,
                mapEmbedUrl: locationData.map.embedUrl,
                nearbyAttractions: locationData.map.nearbyAttractions,
            });

            setCardImagePreview(locationData.cardImage);
            setHeroImagePreview(locationData.heroImage);
            setIntroImagePreview(locationData.intro.imageUrl);

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

   const handleMainImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (file: File | null) => void,
    setPreview: (url: string | null) => void,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const currentItem = form.getValues(`galleryImages.${index}`);
      updateGallery(index, {
        ...currentItem,
        src: URL.createObjectURL(file), // Show a preview of the new image
        file: file, // Store the file object to be uploaded
      });
    }
  };


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
    
    const formData = new FormData();
    formData.append('_method', 'PUT');

    // Append main images if they've been changed by the user
    if (cardImageFile) formData.append('card_image', cardImageFile);
    if (heroImageFile) formData.append('hero_image', heroImageFile);
    if (introImageFile) formData.append('intro_image', introImageFile);

    // Append all text/JSON fields
    formData.append('title', data.title);
    formData.append('subtitle', data.subtitle);
    formData.append('card_description', data.cardDescription);
    formData.append('card_image_hint', data.imageHint);
    formData.append('distance', data.distance);
    formData.append('hero_image_hint', data.heroImageHint);
    formData.append('intro_title', data.introTitle);
    formData.append('intro_description', data.introDescription);
    formData.append('intro_image_hint', data.introImageHint);
    formData.append('map_embed_url', data.mapEmbedUrl);
    formData.append('category', 'nature'); // Assuming static category for now

    formData.append('highlights', JSON.stringify(data.highlights.map((h, index) => ({ ...h, sort_order: index + 1 }))));
    formData.append('visitor_info', JSON.stringify(data.visitorInfo.map((vi, index) => ({ ...vi, sort_order: index + 1 }))));
    formData.append('nearby_attractions', JSON.stringify(data.nearbyAttractions.map((na, index) => ({ ...na, sort_order: index + 1 }))));
    
    const galleryMeta = data.galleryImages.map((img: FormGalleryImage, index) => {
        if (img.file) { // This is a new file
            // We will upload the file and server will generate the new URL.
            // Sending meta is useful if the server handles it.
            return {
                alt_text: img.alt,
                hint: img.hint,
                sort_order: index + 1,
                is_360: img.is360 ? 1: 0,
            };
        } else { // This is an existing image
            return {
                image_url: img.src, // Send back the original URL
                alt_text: img.alt,
                hint: img.hint,
                sort_order: index + 1,
                is_360: img.is360 ? 1: 0,
            };
        }
    });

    formData.append('gallery_images', JSON.stringify(galleryMeta));
    
    // Append new gallery image files for upload
    data.galleryImages.forEach((img: FormGalleryImage) => {
        if (img.file) {
            formData.append('gallery_files[]', img.file);
        }
    });


    try {
        const response = await fetch(`${API_BASE_URL}/locations/${slug}`, {
            method: 'POST', // Using POST to send multipart/form-data with _method override
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.error || 'Failed to update location.');
        }

        toast({
            title: 'Success!',
            description: `Location "${data.title}" has been updated.`,
        });
        router.push('/admin/manage-content');

    } catch (error) {
      console.error('Update failed:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
    } finally {
      setIsSubmitting(false);
    }
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
                  <div className="space-y-4">
                    <FormItem>
                      <FormLabel>Card Image (Leave blank to keep current)</FormLabel>
                      <FormControl><Input type="file" accept="image/*" onChange={(e) => handleMainImageChange(e, setCardImageFile, setCardImagePreview)} className="text-sm" /></FormControl>
                    </FormItem>
                    {cardImagePreview && <Image src={cardImagePreview} alt="Card preview" width={200} height={100} className="rounded-md object-cover border" />}
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="imageHint" render={({ field }) => (<FormItem><FormLabel>Card Image Hint</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="distance" render={({ field }) => (<FormItem><FormLabel>Distance</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
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
                    <FormField control={form.control} name="subtitle" render={({ field }) => (<FormItem><FormLabel>Hero Subtitle</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormItem>
                      <FormLabel>Hero Image (Leave blank to keep current)</FormLabel>
                      <FormControl><Input type="file" accept="image/*" onChange={(e) => handleMainImageChange(e, setHeroImageFile, setHeroImagePreview)} className="text-sm" /></FormControl>
                    </FormItem>
                    {heroImagePreview && <Image src={heroImagePreview} alt="Hero preview" width={200} height={100} className="rounded-md object-cover border" />}
                    <FormField control={form.control} name="heroImageHint" render={({ field }) => (<FormItem><FormLabel>Hero Image Hint</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <Separator/>
                    <FormField control={form.control} name="introTitle" render={({ field }) => (<FormItem><FormLabel>Intro Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="introDescription" render={({ field }) => (<FormItem><FormLabel>Intro Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormItem>
                      <FormLabel>Intro Image (Leave blank to keep current)</FormLabel>
                      <FormControl><Input type="file" accept="image/*" onChange={(e) => handleMainImageChange(e, setIntroImageFile, setIntroImagePreview)} className="text-sm" /></FormControl>
                    </FormItem>
                    {introImagePreview && <Image src={introImagePreview} alt="Intro preview" width={200} height={100} className="rounded-md object-cover border" />}
                    <FormField control={form.control} name="introImageHint" render={({ field }) => (<FormItem><FormLabel>Intro Image Hint</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                </CardContent>
              </Card>
            </div>

            <div className={cn(currentStep === 3 ? 'block' : 'hidden')}>
              <Card>
                <CardHeader>
                    <CardTitle>Gallery Images</CardTitle>
                    <CardDescription>Add, remove, or replace gallery images.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {galleryFields.map((item, index) => (
                        <div key={item.id} className="space-y-4 p-4 border rounded-md relative">
                             <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => removeGallery(index)}>
                                <Trash2 className="h-4 w-4" />
                             </Button>
                             <p className="font-medium">Image {index + 1}</p>
                             <div className="flex items-start gap-4">
                               <Image src={item.src} alt="gallery preview" width={100} height={100} className="rounded-md border object-cover"/>
                               <div className="flex-1 space-y-2">
                                  <FormItem>
                                    <FormLabel>Replace Image</FormLabel>
                                    <FormControl>
                                      <Input type="file" accept="image/*" onChange={(e) => handleGalleryFileChange(e, index)} className="text-sm" />
                                    </FormControl>
                                  </FormItem>
                               </div>
                             </div>
                             <div className="grid md:grid-cols-2 gap-4">
                                <FormField control={form.control} name={`galleryImages.${index}.alt`} render={({ field }) => (<FormItem><FormLabel>Alt Text</FormLabel><FormControl><Input placeholder="Alt text for accessibility" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name={`galleryImages.${index}.hint`} render={({ field }) => (<FormItem><FormLabel>Hint</FormLabel><FormControl><Input placeholder="AI Hint" {...field} /></FormControl><FormMessage /></FormItem>)} />
                             </div>
                        </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => appendGallery({ src: 'https://placehold.co/600x400.png', alt: '', hint: '', file: new File([], 'placeholder.png'), isNew: true })}>
                        <Plus className="mr-2 h-4 w-4" /> Add Image
                    </Button>
                </CardContent>
              </Card>
            </div>
            
            <div className={cn(currentStep === 4 ? 'block' : 'hidden')}>
              <Card>
                <CardHeader><CardTitle>Key Highlights</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    {form.getValues('highlights').map((_, index) => (
                        <div key={index} className="space-y-4 p-4 border rounded-md relative">
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
                <CardHeader><CardTitle>Visitor Information</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    {form.getValues('visitorInfo').map((_, index) => (
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
                <CardHeader><CardTitle>Map & Nearby</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    <FormField control={form.control} name="mapEmbedUrl" render={({ field }) => (<FormItem><FormLabel>Google Maps Embed URL</FormLabel><FormControl><Input placeholder="https://www.google.com/maps/embed?pb=..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <Separator/>
                    <p className="font-medium">Nearby Attractions</p>
                    {form.getValues('nearbyAttractions').map((_, index) => (
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

    