
'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { packageFormSchema } from '@/lib/schemas';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, LoaderCircle, Save } from 'lucide-react';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { mapServerPackageToClient } from '@/lib/packages-data';
import { Skeleton } from '@/components/ui/skeleton';

const iconOptions = ['MapPin', 'Gem', 'Landmark', 'Award', 'Utensils', 'Star', 'Package', 'Coffee', 'BedDouble', 'Leaf', 'Mountain', 'Bird', 'Home', 'Clock', 'CalendarDays', 'Ticket', 'Users', 'AlertTriangle', 'Waves', 'Camera', 'Tent', 'Thermometer'];
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const steps = [
  { id: 1, name: 'Homepage Card', fields: ['homepageTitle', 'homepageDescription', 'imageAlt', 'imageHint'] as const },
  { id: 2, name: 'Tour Page Details', fields: ['tourPageTitle', 'duration', 'price', 'priceSuffix', 'tourPageDescription', 'heroImageHint'] as const },
  { id: 3, name: 'Highlights & Inclusions', fields: ['tourHighlights', 'inclusions'] as const },
  { id: 4, name: 'Itinerary, Gallery & Booking', fields: ['itinerary', 'experienceGallery', 'bookingLink'] as const },
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

interface GalleryField {
    id?: number;
    src: string;
    alt: string;
    hint: string;
    file?: File | null;
    isNew?: boolean;
}

export default function EditPackagePage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  const [cardImageFile, setCardImageFile] = useState<File | null>(null);
  const [cardImagePreview, setCardImagePreview] = useState<string | null>(null);
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null);
  
  const [isSavingImage, setIsSavingImage] = useState<number | null>(null);
  const [deletedGalleryIds, setDeletedGalleryIds] = useState<number[]>([]);


  const form = useForm<z.infer<typeof packageFormSchema>>({
    resolver: zodResolver(packageFormSchema),
    mode: 'onBlur',
    defaultValues: {
      imageUrl: '', 
      imageAlt: '',
      imageHint: '',
      homepageTitle: '',
      homepageDescription: '',
      tourPageTitle: '',
      duration: '',
      price: '',
      priceSuffix: 'per person',
      heroImage: '',
      heroImageHint: '',
      tourPageDescription: '',
      tourHighlights: Array.from({ length: 3 }, () => ({ icon: 'Star' as const, title: '', description: '' })),
      inclusions: [{ text: '' }],
      itinerary: Array.from({ length: 5 }, () => ({ time: '', title: '', description: '' })),
      experienceGallery: [],
      bookingLink: '/booking',
    },
  });
  
  const fetchPackageData = async () => {
    if (!id) {
        setIsLoadingData(false);
        toast({ variant: 'destructive', title: 'Error', description: 'No package ID provided.'});
        router.push('/admin/manage-packages');
        return;
    };
    
    setIsLoadingData(true);
    try {
        const response = await fetch(`${API_BASE_URL}/tours/${id}`);
        if (!response.ok) throw new Error('Failed to fetch package data');
        
        const serverData = await response.json();
        const packageData = mapServerPackageToClient(serverData);

        form.reset({
            homepageTitle: packageData.homepageTitle,
            homepageDescription: packageData.homepageDescription,
            imageUrl: packageData.imageUrl,
            imageAlt: packageData.imageAlt,
            imageHint: packageData.imageHint,
            tourPageTitle: packageData.tourPageTitle,
            duration: packageData.duration,
            price: packageData.price,
            priceSuffix: packageData.priceSuffix,
            heroImage: packageData.heroImage,
            heroImageHint: packageData.heroImageHint,
            tourPageDescription: packageData.tourPageDescription,
            tourHighlights: packageData.tourHighlights,
            inclusions: packageData.inclusions.map(i => ({ text: i.title })),
            itinerary: packageData.itinerary,
            experienceGallery: packageData.experienceGallery.map(img => ({ ...img, file: null, isNew: false })),
            bookingLink: packageData.bookingLink,
        });

        setCardImagePreview(packageData.imageUrl);
        setHeroImagePreview(packageData.heroImage);
        setDeletedGalleryIds([]);

    } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load package data.' });
        router.push('/admin/manage-packages');
    } finally {
        setIsLoadingData(false);
    }
  }


  useEffect(() => {
    fetchPackageData();
  }, [id]);

  const { fields: highlightFields } = useFieldArray({
    control: form.control,
    name: "tourHighlights",
  });
  
  const { fields: inclusionFields, append: appendInclusion, remove: removeInclusion } = useFieldArray({
    control: form.control,
    name: "inclusions",
  });

  const { fields: itineraryFields, append: appendItinerary, remove: removeItinerary } = useFieldArray({
    control: form.control,
    name: "itinerary",
  });
  
   const { fields: galleryFields, append: appendGallery, remove: removeGallery, update: updateGallery } = useFieldArray({
    control: form.control,
    name: "experienceGallery",
  });

  const handleCardImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCardImageFile(file);
      setCardImagePreview(URL.createObjectURL(file));
      form.setValue('imageUrl', file.name, { shouldValidate: true });
    }
  };
  
  const handleHeroImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setHeroImageFile(file);
      setHeroImagePreview(URL.createObjectURL(file));
      form.setValue('heroImage', file.name, { shouldValidate: true });
    }
  };

  const handleGalleryFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
        const currentItem = form.getValues(`experienceGallery.${index}`);
        updateGallery(index, {
            ...currentItem,
            src: URL.createObjectURL(file), // Show preview
            file: file, // Store the file object
        });
    }
  };
  
  const handleGallerySave = async (index: number) => {
    setIsSavingImage(index);
    const galleryItem = form.getValues(`experienceGallery.${index}`) as GalleryField;
    const formData = new FormData();

    try {
        if (galleryItem.isNew) { // CREATE new image
            if (!galleryItem.file) throw new Error("No image file selected for new item.");
            formData.append('experience_gallery_images[]', galleryItem.file);
            const galleryMeta = [{ alt_text: galleryItem.alt, hint: galleryItem.hint, sort_order: index + 1 }];
            formData.append('experience_gallery_meta', JSON.stringify(galleryMeta));

            // We need to use the main update endpoint to add a new image to a package
            const response = await fetch(`${API_BASE_URL}/tours/${id}`, {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) throw new Error('Failed to create new gallery image.');
            
            toast({ title: 'Image Added', description: 'New gallery image was saved successfully.'});
            await fetchPackageData(); // Refetch all data to get the new ID and clean state

        } else { // UPDATE existing image
            if (!galleryItem.id) throw new Error("Image ID is missing for update.");
            formData.append('_method', 'PUT');
            formData.append('alt_text', galleryItem.alt);
            formData.append('hint', galleryItem.hint);
            
            if (galleryItem.file) {
                formData.append('experience_image', galleryItem.file);
            }

            const response = await fetch(`${API_BASE_URL}/tours/experience-gallery/${galleryItem.id}`, {
                method: 'POST', // Using POST with _method override
                body: formData,
            });

            if (!response.ok) {
                 const errorData = await response.json().catch(() => ({}));
                 throw new Error(errorData.error || 'Failed to update image.');
            }
             toast({ title: 'Image Updated', description: 'Gallery image was updated successfully.'});
             // No need to refetch, changes are minor
             const currentValues = form.getValues(`experienceGallery`);
             if (galleryItem.file) { // If a new file was uploaded, the src is a blob url, so we refetch to get the permanent URL
                await fetchPackageData();
             } else {
                updateGallery(index, { ...galleryItem, file: null });
             }
        }
    } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Error', description: error instanceof Error ? error.message : "Could not save image."});
    } finally {
        setIsSavingImage(null);
    }
  };
  
  const handleGalleryDelete = async (index: number) => {
    const itemToDelete = galleryFields[index] as GalleryField;
    const imageId = itemToDelete.id;

    if (!imageId) { // It's a new, unsaved image. Just remove from UI.
        removeGallery(index);
        return;
    }
    
    // Send immediate request to backend
    try {
        const response = await fetch(`${API_BASE_URL}/experience-gallery/${imageId}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Server failed to delete the image.');
        }
        toast({ title: 'Image Deleted', description: 'The gallery image was deleted successfully.' });
        // UI update on success
        removeGallery(index);
    } catch(error) {
        console.error("Failed to delete image from server", error);
        toast({ variant: 'destructive', title: 'Delete Failed', description: 'Could not delete the image from server.' });
    }
  };


  const handleNext = async () => {
    const fields = steps[currentStep - 1].fields;
    const isValid = await form.trigger(fields as any, { shouldFocus: true });
    
    if (!isValid) {
        toast({ variant: "destructive", title: "Validation Error", description: "Please fill out all required fields before proceeding." });
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


  async function onSubmit(data: z.infer<typeof packageFormSchema>) {
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('_method', 'PUT');

    // Append main package files if they have been changed
    if (cardImageFile) formData.append('homepage_image', cardImageFile);
    if (heroImageFile) formData.append('hero_image', heroImageFile);

    // Append all other text/JSON data
    formData.append('homepage_title', data.homepageTitle);
    formData.append('homepage_description', data.homepageDescription);
    formData.append('homepage_image_alt', data.imageAlt);
    formData.append('homepage_image_hint', data.imageHint);
    formData.append('tour_page_title', data.tourPageTitle);
    formData.append('duration', data.duration);
    formData.append('price', data.price);
    formData.append('price_suffix', data.priceSuffix);
    formData.append('hero_image_hint', data.heroImageHint);
    formData.append('tour_page_description', data.tourPageDescription);
    formData.append('booking_link', data.bookingLink);
    formData.append('highlights', JSON.stringify(data.tourHighlights.map((h, i) => ({ ...h, sort_order: i + 1 }))));
    formData.append('inclusions', JSON.stringify(data.inclusions.map((inc, i) => ({ icon: 'Star', title: inc.text, description: '', sort_order: i + 1 }))));
    formData.append('itinerary', JSON.stringify(data.itinerary.map((item, i) => ({ ...item, sort_order: i + 1 }))));
    
    formData.append('deleted_experience_gallery_ids', JSON.stringify(deletedGalleryIds));

    // Handle updates for EXISTING gallery images (metadata only)
    const existingGalleryItems = data.experienceGallery.filter(item => !item.isNew && item.id);
    formData.append('experience_gallery', JSON.stringify(existingGalleryItems.map((item: any, index) => ({
        id: item.id,
        image_url: item.src.startsWith('blob:') ? undefined : item.src, // Don't send back blob urls
        alt_text: item.alt,
        hint: item.hint,
        sort_order: index + 1
    }))));

    // Handle NEW gallery image uploads
    const newImageFiles = data.experienceGallery.filter(item => item.isNew && item.file).map(item => item.file);
    const newGalleryMeta = data.experienceGallery.filter(item => item.isNew && item.file).map((item, index) => ({
        alt_text: item.alt,
        hint: item.hint,
        sort_order: existingGalleryItems.length + index + 1
    }));
    
    newImageFiles.forEach((file) => {
      if(file) formData.append(`experience_gallery_images[]`, file);
    });
    formData.append('experience_gallery_meta', JSON.stringify(newGalleryMeta));
    
    try {
      const response = await fetch(`${API_BASE_URL}/tours/${id}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to update package.');
      }
      
      toast({
        title: 'Package Updated!',
        description: `Package "${data.homepageTitle}" has been saved successfully.`,
      });
      router.push('/admin/manage-packages');

    } catch (error) {
      console.error('Failed to update package:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error instanceof Error ? error.message : 'Could not connect to the server.',
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
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-primary">Edit Tour Package</h1>
          <p className="text-muted-foreground break-words">Now editing: <span className="font-semibold">{form.getValues('homepageTitle')}</span></p>
        </div>
      </div>
      
      <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Step {currentStep} of {steps.length}: <span className="text-primary font-semibold">{steps[currentStep-1].name}</span></p>
          <Progress value={progressValue} className="h-2" />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Step 1: Homepage Card */}
            <div className={cn(currentStep === 1 ? 'block' : 'hidden')}>
                <Card>
                    <CardHeader>
                        <CardTitle>Homepage Card</CardTitle>
                        <CardDescription>Content that appears on the homepage and tour listing cards.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField control={form.control} name="homepageTitle" render={({ field }) => (<FormItem><FormLabel>Card Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="homepageDescription" render={({ field }) => (<FormItem><FormLabel>Card Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                        
                        <FormField control={form.control} name="imageUrl" render={() => ( <FormItem><FormLabel>Card Image (Leave blank to keep current)</FormLabel><FormControl><Input type="file" accept="image/*" onChange={handleCardImageFileChange} /></FormControl><FormMessage /></FormItem>)} />
                        {cardImagePreview && <Image src={cardImagePreview} alt="Card preview" width={200} height={100} className="rounded-md object-cover border" />}

                        <div className="grid md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="imageAlt" render={({ field }) => (<FormItem><FormLabel>Image Alt Text</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="imageHint" render={({ field }) => (<FormItem><FormLabel>Image AI Hint</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Step 2: Tour Page Details */}
            <div className={cn(currentStep === 2 ? 'block' : 'hidden')}>
                <Card>
                    <CardHeader>
                        <CardTitle>Tour Detail Page</CardTitle>
                        <CardDescription>Content for the dedicated single page for this tour.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField control={form.control} name="tourPageTitle" render={({ field }) => (<FormItem><FormLabel>Page Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <div className="grid md:grid-cols-3 gap-4">
                            <FormField control={form.control} name="duration" render={({ field }) => (<FormItem><FormLabel>Duration</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="price" render={({ field }) => (<FormItem><FormLabel>Price</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="priceSuffix" render={({ field }) => (<FormItem><FormLabel>Price Suffix</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                        <FormField control={form.control} name="tourPageDescription" render={({ field }) => (<FormItem><FormLabel>Page Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <Separator />
                        
                        <FormField control={form.control} name="heroImage" render={() => ( <FormItem><FormLabel>Page Hero Image (Leave blank to keep current)</FormLabel><FormControl><Input type="file" accept="image/*" onChange={handleHeroImageFileChange} /></FormControl><FormMessage /></FormItem>)} />
                        {heroImagePreview && <Image src={heroImagePreview} alt="Hero preview" width={200} height={100} className="rounded-md object-cover border" />}

                        <FormField control={form.control} name="heroImageHint" render={({ field }) => (<FormItem><FormLabel>Hero Image AI Hint</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </CardContent>
                </Card>
            </div>

            {/* Step 3: Highlights & Inclusions */}
            <div className={cn(currentStep === 3 ? 'block' : 'hidden')}>
                <Card>
                    <CardHeader>
                    <CardTitle>Tour Highlights (3)</CardTitle>
                    <CardDescription>The three main highlights shown on the tour page.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                    {highlightFields.map((item, index) => (
                        <div key={item.id} className="grid md:grid-cols-3 gap-4 p-4 border rounded-md items-end">
                        <FormField control={form.control} name={`tourHighlights.${index}.icon`} render={({ field }) => (
                            <FormItem><FormLabel>Icon</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select icon" /></SelectTrigger></FormControl>
                                    <SelectContent>{iconOptions.map(icon => <SelectItem key={icon} value={icon}>{icon}</SelectItem>)}</SelectContent>
                                </Select><FormMessage />
                            </FormItem> )} />
                        <FormField control={form.control} name={`tourHighlights.${index}.title`} render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="Highlight title" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name={`tourHighlights.${index}.description`} render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Input placeholder="Short description" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                    ))}
                    </CardContent>
                </Card>
                <Card className="mt-8">
                    <CardHeader>
                    <CardTitle>Inclusions</CardTitle>
                    <CardDescription>List everything that is included in this package.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                    {inclusionFields.map((item, index) => (
                        <div key={item.id} className="flex items-end gap-2">
                        <FormField control={form.control} name={`inclusions.${index}.text`} render={({ field }) => (
                            <FormItem className="flex-1">
                            <FormLabel className={cn(index !== 0 && "sr-only")}>Inclusion Item</FormLabel>
                            <FormControl><Input placeholder="e.g., GUIDED MINE TOUR" {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>)} />
                        <Button type="button" variant="destructive" size="icon" onClick={() => removeInclusion(index)} disabled={inclusionFields.length <= 1}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                        </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => appendInclusion({ text: '' })}>
                        <Plus className="mr-2 h-4 w-4" /> Add Inclusion
                    </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Step 4: Itinerary, Gallery & Booking */}
             <div className={cn(currentStep === 4 ? 'block' : 'hidden')}>
                <Card>
                    <CardHeader>
                        <CardTitle>Daily Itinerary</CardTitle>
                        <CardDescription>Add the schedule of activities for the tour.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {itineraryFields.map((item, index) => (
                            <div key={item.id} className="space-y-4 p-4 border rounded-md relative">
                                <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => removeItinerary(index)} disabled={itineraryFields.length <= 1}>
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <FormField control={form.control} name={`itinerary.${index}.time`} render={({ field }) => (<FormItem><FormLabel>Time</FormLabel><FormControl><Input placeholder="e.g., 9:00 a.m" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name={`itinerary.${index}.title`} render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., Meet & Greet" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                                <FormField control={form.control} name={`itinerary.${index}.description`} render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Describe the activity" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={() => appendItinerary({ time: '', title: '', description: '' })}>
                            <Plus className="mr-2 h-4 w-4" /> Add Itinerary Item
                        </Button>
                    </CardContent>
                </Card>

                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>Experience Gallery</CardTitle>
                        <CardDescription>Manage images for the tour detail page gallery. Replace images by uploading new files.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {galleryFields.map((item, index) => {
                           const galleryItem = item as GalleryField;
                           return (
                           <div key={item.id} className="space-y-4 p-4 border rounded-md relative">
                             <div className="flex justify-between items-center">
                                <p className="font-medium">Image {index + 1}</p>
                                <Button type="button" variant="ghost" size="icon" onClick={() => handleGalleryDelete(index)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                             </div>
                             <div className="flex items-center gap-4">
                                <div>
                                    <FormLabel>Preview</FormLabel>
                                    <Image src={item.src} alt={item.alt || `Gallery image ${index + 1}`} width={100} height={100} className="rounded-md object-cover mt-2 border" />
                                </div>
                                <div className="flex-1 space-y-4">
                                     <FormField
                                        control={form.control}
                                        name={`experienceGallery.${index}.src`}
                                        render={() => (
                                            <FormItem>
                                                <FormLabel>{galleryItem.isNew ? "Select Image" : "Replace Image"}</FormLabel>
                                                <FormControl>
                                                    <Input type="file" accept="image/*" onChange={(e) => handleGalleryFileChange(e, index)} className="text-sm" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                             </div>
                             <div className="grid md:grid-cols-2 gap-4">
                                <FormField control={form.control} name={`experienceGallery.${index}.alt`} render={({ field }) => (<FormItem><FormLabel>Alt Text</FormLabel><FormControl><Input placeholder="Alt text for accessibility" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name={`experienceGallery.${index}.hint`} render={({ field }) => (<FormItem><FormLabel>Hint</FormLabel><FormControl><Input placeholder="AI Hint" {...field} /></FormControl><FormMessage /></FormItem>)} />
                             </div>
                             {!galleryItem.isNew && (
                                <div className="flex justify-end">
                                    <Button type="button" size="sm" onClick={() => handleGallerySave(index)} disabled={isSavingImage === index}>
                                        {isSavingImage === index ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                        Save Image Changes
                                    </Button>
                                </div>
                             )}
                        </div>
                        )})}
                         <Button type="button" variant="outline" size="sm" onClick={() => appendGallery({ src: 'https://placehold.co/400x400.png', alt: '', hint: '', file: null, isNew: true })} disabled={galleryFields.length >= 8}>
                            <Plus className="mr-2 h-4 w-4" /> Add Gallery Image
                        </Button>
                    </CardContent>
                </Card>

                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>Final Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <FormField control={form.control} name="bookingLink" render={({ field }) => (<FormItem><FormLabel>Booking Link</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
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
