
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
import { useRouter } from 'next/navigation';
import { ArrowLeft, LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';

const iconOptions = ['Leaf', 'Mountain', 'Bird', 'Home', 'Clock', 'CalendarDays', 'Ticket', 'Users', 'AlertTriangle', 'Gem', 'Waves', 'Landmark', 'Camera', 'Tent', 'Thermometer'];

const steps = [
  { id: 1, name: 'Basic Information', fields: ['title', 'slug', 'cardDescription', 'cardImage', 'imageHint', 'distance'] as const },
  { id: 2, name: 'Hero & Intro', fields: ['subtitle', 'heroImage', 'heroImageHint', 'introTitle', 'introDescription', 'introImageUrl', 'introImageHint'] as const },
  { id: 3, name: 'Gallery Images', fields: ['galleryImages'] as const },
  { id: 4, name: 'Key Highlights', fields: ['highlights'] as const },
  { id: 5, name: 'Visitor Information', fields: ['visitorInfo'] as const },
  { id: 6, name: 'Map & Nearby', fields: ['mapEmbedUrl', 'nearbyAttractions'] as const },
];

const toKebabCase = (str: string) =>
  str &&
  str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    ?.map(x => x.toLowerCase())
    .join('-') || '';

export default function AddContentPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isClient, setIsClient] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // States for file objects and previews
  const [cardImageFile, setCardImageFile] = useState<File | null>(null);
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [introImageFile, setIntroImageFile] = useState<File | null>(null);
  const [galleryImageFiles, setGalleryImageFiles] = useState<(File | null)[]>(Array(4).fill(null));
  
  const [cardImagePreview, setCardImagePreview] = useState<string | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null);
  const [introImagePreview, setIntroImagePreview] = useState<string | null>(null);
  const [galleryImagePreviews, setGalleryImagePreviews] = useState<(string | null)[]>(Array(4).fill(null));

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
  
  const title = form.watch('title');
  const isSlugManuallyEdited = form.formState.dirtyFields.slug;

  useEffect(() => {
    if (!isSlugManuallyEdited) {
      form.setValue('slug', toKebabCase(title), { shouldValidate: true });
    }
  }, [title, form, isSlugManuallyEdited]);


  const handleMainImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (file: File | null) => void,
    setPreview: (url: string | null) => void,
    fieldName: 'cardImage' | 'heroImage' | 'introImageUrl'
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      setPreview(URL.createObjectURL(file));
      form.setValue(fieldName, file.name, { shouldValidate: true });
    }
  };

  const handleGalleryFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
        const newFiles = [...galleryImageFiles];
        newFiles[index] = file;
        setGalleryImageFiles(newFiles);

        const newPreviews = [...galleryImagePreviews];
        newPreviews[index] = URL.createObjectURL(file);
        setGalleryImagePreviews(newPreviews);
        
        form.setValue(`galleryImages.${index}.src`, file.name, { shouldValidate: true });
    }
  };

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

  const uploadGalleryImage = async (file: File, slug: string, alt: string, hint: string, index: number) => {
    const galleryFormData = new FormData();
    galleryFormData.append('image', file);
    galleryFormData.append('location_slug', slug);
    galleryFormData.append('alt_text', alt);
    galleryFormData.append('hint', hint);
    galleryFormData.append('is_360', '0');
    galleryFormData.append('sort_order', String(index + 1));
    
    try {
        const response = await fetch('http://localhost/sapphire_trails_server/location-gallery/', {
            method: 'POST',
            body: galleryFormData,
            redirect: 'manual', // Prevent fetch from following redirects which strips the body
        });
        if (response.type === 'opaqueredirect' || response.ok || response.status === 201) {
          // An opaqueredirect response means the server successfully processed the request
          // and redirected. We can treat this as a success.
          return;
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to upload gallery image ${index + 1}`);

    } catch (error) {
        console.error(`Gallery upload failed for image ${index+1}:`, error);
        throw error; // Re-throw to be caught by the main submit handler
    }
  };

  async function onSubmit(data: z.infer<typeof locationFormSchema>) {
    if (!data.slug || data.slug.trim().length < 3) {
      toast({ variant: "destructive", title: "Missing Slug", description: "Please provide a unique slug on Step 1." });
      setCurrentStep(1);
      return;
    }
     if (!cardImageFile || !heroImageFile || !introImageFile) {
        toast({ variant: "destructive", title: "Missing Images", description: "Please upload all three main images (Card, Hero, Intro)." });
        setCurrentStep(2);
        return;
    }
    if (galleryImageFiles.some(file => file === null)) {
      toast({ variant: "destructive", title: "Missing Gallery Images", description: "Please upload all four gallery images." });
      setCurrentStep(3);
      return;
    }

    setIsSubmitting(true);
    
    // Step 1: Create main location data
    const locationFormData = new FormData();
    locationFormData.append('card_image', cardImageFile);
    locationFormData.append('hero_image', heroImageFile);
    locationFormData.append('intro_image', introImageFile);
    
    locationFormData.append('slug', data.slug);
    locationFormData.append('title', data.title);
    locationFormData.append('subtitle', data.subtitle);
    locationFormData.append('card_description', data.cardDescription);
    locationFormData.append('card_image_hint', data.imageHint);
    locationFormData.append('distance', data.distance);
    locationFormData.append('hero_image_hint', data.heroImageHint);
    locationFormData.append('intro_title', data.introTitle);
    locationFormData.append('intro_description', data.introDescription);
    locationFormData.append('intro_image_hint', data.introImageHint);
    locationFormData.append('map_embed_url', data.mapEmbedUrl);
    locationFormData.append('category', 'nature');

    locationFormData.append('highlights', JSON.stringify(data.highlights.map((h, index) => ({ ...h, sort_order: index + 1 }))));
    locationFormData.append('visitor_info', JSON.stringify(data.visitorInfo.map((vi, index) => ({ ...vi, sort_order: index + 1 }))));
    locationFormData.append('nearby_attractions', JSON.stringify(data.nearbyAttractions.map((na, index) => ({ ...na, sort_order: index + 1 }))));

    try {
      const locationResponse = await fetch('http://localhost/sapphire_trails_server/locations/', {
        method: 'POST',
        body: locationFormData,
      });

      if (!locationResponse.ok) {
        const errorData = await locationResponse.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to create the location entry.');
      }
      
      // Step 2: Upload gallery images individually
      try {
        const galleryUploadPromises = galleryImageFiles.map((file, index) => {
          if (file) {
            return uploadGalleryImage(file, data.slug, data.galleryImages[index].alt, data.galleryImages[index].hint, index);
          }
          return Promise.resolve();
        });
        await Promise.all(galleryUploadPromises);
      } catch (galleryError) {
        // Even if gallery fails, the main location was created.
        // We'll show an error but still consider the main part a success.
         toast({
            variant: 'destructive',
            title: 'Gallery Upload Failed',
            description: galleryError instanceof Error ? galleryError.message : 'Some gallery images could not be uploaded.',
        });
      }


      toast({
        title: 'Location Added!',
        description: `Location "${data.title}" has been created successfully.`,
      });
      router.push('/admin/manage-content');

    } catch (error) {
      console.error('Failed to create location:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Could not connect to the server. Please try again later.',
      });
    } finally {
        setIsSubmitting(false);
    }
  }

  const progressValue = (currentStep / steps.length) * 100;
  
  if (!isClient) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
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
                  <div className="space-y-4">
                    <FormField
                      control={form.control} name="cardImage"
                      render={() => (
                        <FormItem>
                          <FormLabel>Card Image</FormLabel>
                          <FormControl>
                            <Input type="file" accept="image/*" onChange={(e) => handleMainImageChange(e, setCardImageFile, setCardImagePreview, 'cardImage')} className="text-sm" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {cardImagePreview && (
                      <div>
                        <FormLabel>Preview</FormLabel>
                        <Image src={cardImagePreview} alt="Card image preview" width={200} height={100} className="rounded-md object-cover mt-2 border" />
                      </div>
                    )}
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
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
                     <div className="space-y-4">
                        <FormField control={form.control} name="heroImage" render={() => (<FormItem><FormLabel>Hero Image</FormLabel><FormControl><Input type="file" accept="image/*" onChange={(e) => handleMainImageChange(e, setHeroImageFile, setHeroImagePreview, 'heroImage')} className="text-sm" /></FormControl><FormMessage /></FormItem>)} />
                        {heroImagePreview && (<div><FormLabel>Preview</FormLabel><Image src={heroImagePreview} alt="Hero preview" width={200} height={100} className="rounded-md object-cover mt-2 border" /></div>)}
                    </div>
                    <FormField control={form.control} name="heroImageHint" render={({ field }) => (<FormItem><FormLabel>Hero Image Hint</FormLabel><FormControl><Input placeholder="e.g., rainforest misty mountains" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <Separator/>
                    <FormField control={form.control} name="introTitle" render={({ field }) => (<FormItem><FormLabel>Intro Title</FormLabel><FormControl><Input placeholder="e.g., UNESCO World Heritage Wonder" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="introDescription" render={({ field }) => (<FormItem><FormLabel>Intro Description</FormLabel><FormControl><Textarea placeholder="Full description for the intro section..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                     <div className="space-y-4">
                        <FormField control={form.control} name="introImageUrl" render={() => (<FormItem><FormLabel>Intro Image</FormLabel><FormControl><Input type="file" accept="image/*" onChange={(e) => handleMainImageChange(e, setIntroImageFile, setIntroImagePreview, 'introImageUrl')} className="text-sm" /></FormControl><FormMessage /></FormItem>)} />
                        {introImagePreview && (<div><FormLabel>Preview</FormLabel><Image src={introImagePreview} alt="Intro preview" width={200} height={100} className="rounded-md object-cover mt-2 border" /></div>)}
                    </div>
                    <FormField control={form.control} name="introImageHint" render={({ field }) => (<FormItem><FormLabel>Intro Image Hint</FormLabel><FormControl><Input placeholder="e.g., jungle river rocks" {...field} /></FormControl><FormMessage /></FormItem>)} />
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
                             <FormField
                                control={form.control}
                                name={`galleryImages.${index}.src`}
                                render={() => (
                                <FormItem>
                                    <FormLabel>Upload Image</FormLabel>
                                    <FormControl>
                                    <Input type="file" accept="image/*" onChange={(e) => handleGalleryFileChange(e, index)} className="text-sm" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            {galleryImagePreviews[index] && (
                                <div>
                                <FormLabel>Preview</FormLabel>
                                <Image src={galleryImagePreviews[index]!} alt={`Gallery ${index+1} preview`} width={200} height={100} className="rounded-md object-cover mt-2 border" />
                                </div>
                            )}
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
                    {isSubmitting ? "Saving..." : "Save New Location"}
                  </Button>
                )}
              </div>
            </div>
        </form>
      </Form>
    </div>
  );
}
