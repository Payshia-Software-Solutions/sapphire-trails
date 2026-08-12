
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { locationEditSchema } from '@/lib/schemas';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  LoaderCircle, 
  Plus, 
  Trash2, 
  Save,
  Leaf, 
  Mountain, 
  Bird, 
  Home, 
  Clock, 
  CalendarDays, 
  Ticket, 
  Users, 
  AlertTriangle, 
  Gem, 
  Waves, 
  Landmark, 
  Camera, 
  Tent, 
  Thermometer,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mapServerLocationToClient, type Location, type GalleryImage } from '@/lib/locations-data';
import { Skeleton } from '@/components/ui/skeleton';
import { API_BASE_URL } from '@/lib/utils';
import placeholderImages from '@/lib/placeholder-images.json';

const iconOptions = ['Leaf', 'Mountain', 'Bird', 'Home', 'Clock', 'CalendarDays', 'Ticket', 'Users', 'AlertTriangle', 'Gem', 'Waves', 'Landmark', 'Camera', 'Tent', 'Thermometer'];

const IconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Leaf,
  Mountain,
  Bird,
  Home,
  Clock,
  CalendarDays,
  Ticket,
  Users,
  AlertTriangle,
  Gem,
  Waves,
  Landmark,
  Camera,
  Tent,
  Thermometer,
  HelpCircle,
};

interface FormGalleryImage extends GalleryImage {
  id?: number;
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // States for main image file objects and previews
  const [cardImageFile, setCardImageFile] = useState<File | null>(null);
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [introImageFile, setIntroImageFile] = useState<File | null>(null);

  const [cardImagePreview, setCardImagePreview] = useState<string | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null);
  const [introImagePreview, setIntroImagePreview] = useState<string | null>(null);
  
  const [isSavingImage, setIsSavingImage] = useState<number | null>(null);

  const form = useForm<z.infer<typeof locationEditSchema>>({
    resolver: zodResolver(locationEditSchema),
    mode: 'onBlur',
    defaultValues: {
      title: '',
      slug: '',
      category: 'nature',
      cardDescription: '',
      cardImage: '',
      cardImageHint: '',
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

   const { fields: galleryFields, append: appendGallery, remove: removeGallery, update: updateGallery, replace } = useFieldArray({
    control: form.control,
    name: "galleryImages",
  });

  const { fields: highlightFields, append: appendHighlight, remove: removeHighlight } = useFieldArray({
    control: form.control,
    name: "highlights",
  });

  const { fields: visitorInfoFields, append: appendVisitorInfo, remove: removeVisitorInfo } = useFieldArray({
    control: form.control,
    name: "visitorInfo",
  });

  const { fields: nearbyAttractionFields, append: appendNearbyAttraction, remove: removeNearbyAttraction } = useFieldArray({
    control: form.control,
    name: "nearbyAttractions",
  });
  
  const fetchLocationData = useCallback(async () => {
    if (!slug) {
        setIsLoadingData(false);
        toast({ variant: 'destructive', title: 'Error', description: 'No location slug provided.'});
        router.push('/admin/manage-content');
        return;
    };
    
    setIsLoadingData(true);
    try {
        const response = await fetch(`${API_BASE_URL}/locations/${slug}/`);
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
  }, [slug, toast, router, form]);

  useEffect(() => {
    fetchLocationData();
  }, [fetchLocationData]);

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
        src: URL.createObjectURL(file),
        file: file,
      });
    }
  };

  const handleGallerySave = async (index: number) => {
    setIsSavingImage(index);
    const galleryItem = form.getValues(`galleryImages.${index}`) as FormGalleryImage;
    const formData = new FormData();

    try {
        if (galleryItem.isNew) { // This is a new image to create
            if (!galleryItem.file) throw new Error("No image file selected.");

            formData.append('location_slug', slug);
            formData.append('image', galleryItem.file);
            formData.append('alt_text', galleryItem.alt);
            formData.append('hint', galleryItem.hint);
            formData.append('is_360', '0');
            formData.append('sort_order', String(index + 1));

            const response = await fetch(`${API_BASE_URL}/location-gallery/`, {
                method: 'POST',
                body: formData
            });
            if (!response.ok) throw new Error('Failed to create new image.');
            
            toast({ title: 'Image Added', description: 'New gallery image was saved successfully.'});
            await fetchLocationData(); // Refetch all data to get the new ID and clean state

        } else { // This is an existing image to update
            formData.append('_method', 'PUT');
            formData.append('alt_text', galleryItem.alt);
            formData.append('hint', galleryItem.hint);
            formData.append('sort_order', String(index + 1));
            
            if (galleryItem.file) formData.append('image', galleryItem.file);

            const response = await fetch(`${API_BASE_URL}/location-gallery/${galleryItem.id}`, {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) throw new Error('Failed to update image.');
             toast({ title: 'Image Updated', description: 'Gallery image was updated successfully.'});
        }
    } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Error', description: error instanceof Error ? error.message : "Could not save image."});
    } finally {
        setIsSavingImage(null);
    }
  };

  const handleGalleryDelete = async (imageId: number, index: number) => {
    if (!imageId) {
        removeGallery(index);
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/location-gallery/${imageId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || 'Failed to delete image from server.');
        }
        
        toast({ title: 'Image Deleted', description: 'The gallery image was deleted successfully.' });
        removeGallery(index);

    } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not delete the image from the server.' });
    }
  };

  async function onSubmit(data: z.infer<typeof locationEditSchema>) {
    setIsSubmitting(true);
    
    try {
        const formData = new FormData();
        formData.append('_method', 'PUT');

        formData.append('title', data.title);
        formData.append('subtitle', data.subtitle || '');
        formData.append('category', data.category);
        formData.append('card_description', data.cardDescription);
        formData.append('distance', data.distance || '');
        formData.append('intro_title', data.introTitle || '');
        formData.append('intro_description', data.introDescription || '');
        formData.append('map_embed_url', data.mapEmbedUrl || '');
        formData.append('card_image_hint', data.cardImageHint || '');
        formData.append('hero_image_hint', data.heroImageHint || '');
        formData.append('intro_image_hint', data.introImageHint || '');

        if (cardImageFile) formData.append('card_image', cardImageFile);
        if (heroImageFile) formData.append('hero_image', heroImageFile);
        if (introImageFile) formData.append('intro_image', introImageFile);

        const highlightsData = (data.highlights || []).map((h, index) => ({
            icon: h.icon,
            title: h.title,
            description: h.description,
            sort_order: index + 1
        }));
        formData.append('highlights', JSON.stringify(highlightsData));

        const visitorInfoData = (data.visitorInfo || []).map((vi, index) => ({
            icon: vi.icon,
            title: vi.title,
            line1: vi.line1,
            line2: vi.line2,
            sort_order: index + 1
        }));
        formData.append('visitor_info', JSON.stringify(visitorInfoData));

        const nearbyAttractionsData = (data.nearbyAttractions || []).map((na, index) => ({
            icon: na.icon,
            name: na.name,
            distance: na.distance,
            sort_order: index + 1
        }));
        formData.append('nearby_attractions', JSON.stringify(nearbyAttractionsData));
        
        const url = `${API_BASE_URL}/locations/${slug}`;
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData?.error || errorData?.message || `HTTP ${response.status}: Failed to update location.`);
        }
        
        toast({
            title: 'Success!',
            description: `Location "${data.title}" has been updated.`,
        });
        
        setTimeout(() => {
            router.push('/admin/manage-content');
        }, 1000);

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

  const handleFormError = (errors: any) => {
    console.log('Form validation errors:', errors);
    toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please check the form for errors and try again.',
    });
  };

  if (isLoadingData) {
    return <LoadingFormSkeleton />;
  }

  return (
    <div className="flex flex-col gap-6">
        <div className="flex items-start gap-4">
         <Button variant="outline" size="icon" className="shrink-0 mt-0.5" onClick={() => router.push('/admin/manage-content')}>
             <ArrowLeft className="h-4 w-4" />
         </Button>
         <div className="flex flex-col gap-1">
             <h1 className="text-3xl font-bold tracking-tight text-primary">Edit Location</h1>
             <p className="text-muted-foreground text-sm break-words">Now editing: <span className="font-semibold text-foreground">{form.getValues('title')}</span></p>
         </div>
       </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, handleFormError)} className="space-y-6">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full max-w-3xl mb-6 bg-background-alt border border-border/50 p-1 rounded-xl">
              <TabsTrigger value="general" className="rounded-lg data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm text-sm py-2">General Info</TabsTrigger>
              <TabsTrigger value="highlights" className="rounded-lg data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm text-sm py-2">Highlights & Info</TabsTrigger>
              <TabsTrigger value="gallery" className="rounded-lg data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm text-sm py-2">Gallery Images</TabsTrigger>
              <TabsTrigger value="map" className="rounded-lg data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm text-sm py-2">Map & Nearby</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6 outline-none">
              <Card className="border-border/80 shadow-md">
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>This information appears on the location listing card.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="slug" render={({ field }) => (<FormItem><FormLabel>Slug (Cannot be changed)</FormLabel><FormControl><Input {...field} disabled /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                     <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                             <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="nature">Nature & Wildlife</SelectItem>
                                <SelectItem value="agriculture">Agricultural & Energy</SelectItem>
                                <SelectItem value="cultural">Cultural & Religious</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    <FormField control={form.control} name="cardDescription" render={({ field }) => (<FormItem><FormLabel>Card Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <div className="space-y-4">
                      <FormItem>
                        <FormLabel>Card Image (Leave blank to keep current)</FormLabel>
                        <FormControl><Input type="file" accept="image/*" onChange={(e) => handleMainImageChange(e, setCardImageFile, setCardImagePreview)} className="text-sm" /></FormControl>
                      </FormItem>
                      {cardImagePreview && <Image src={cardImagePreview} alt="Card preview" width={200} height={100} className="rounded-md object-cover border" />}
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="cardImageHint" render={({ field }) => (<FormItem><FormLabel>Card Image Hint</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="distance" render={({ field }) => (<FormItem><FormLabel>Distance</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                  </CardContent>
              </Card>

              <Card className="border-border/80 shadow-md">
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
            </TabsContent>

            <TabsContent value="highlights" className="space-y-6 outline-none">
              <Card className="border-border/80 shadow-md">
                  <CardHeader className="pb-3"><CardTitle className="text-xl">Key Highlights</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                        {highlightFields.map((item, index) => (
                            <div key={item.id} className="space-y-3 p-4 border border-border/60 rounded-xl relative bg-card shadow-sm">
                                <div className="flex justify-between items-center border-b pb-2 mb-2 border-border/30">
                                   <p className="font-semibold text-xs tracking-wider uppercase text-primary">Highlight {index + 1}</p>
                                   <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-full" onClick={() => removeHighlight(index)}>
                                       <Trash2 className="h-3.5 w-3.5" />
                                   </Button>
                                </div>
                                <div className="grid grid-cols-[120px_1fr] gap-3">
                                  <FormField
                                      control={form.control}
                                      name={`highlights.${index}.icon`}
                                      render={({ field }) => (
                                      <FormItem>
                                          <FormLabel className="text-xs">Icon</FormLabel>
                                          <Select onValueChange={field.onChange} value={field.value}>
                                          <FormControl>
                                              <SelectTrigger className="h-9">
                                                  <SelectValue placeholder="Icon" />
                                              </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                              {iconOptions.map(iconName => {
                                                  const Icon = IconMap[iconName] || HelpCircle;
                                                  return (
                                                      <SelectItem key={iconName} value={iconName}>
                                                          <div className="flex items-center gap-2">
                                                              <Icon className="h-4 w-4 text-primary shrink-0" />
                                                              <span>{iconName}</span>
                                                          </div>
                                                      </SelectItem>
                                                  );
                                              })}
                                          </SelectContent>
                                          </Select>
                                          <FormMessage />
                                      </FormItem>
                                      )}
                                  />
                                  <FormField control={form.control} name={`highlights.${index}.title`} render={({ field }) => (<FormItem><FormLabel className="text-xs">Title</FormLabel><FormControl><Input placeholder="Highlight title" className="h-9" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                                 <FormField control={form.control} name={`highlights.${index}.description`} render={({ field }) => (<FormItem><FormLabel className="text-xs">Description</FormLabel><FormControl><Textarea placeholder="Highlight description" className="min-h-[50px] text-xs py-1" rows={2} {...field} /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                        ))}
                      </div>
                      <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => appendHighlight({ icon: 'Leaf', title: '', description: '' })}>
                          <Plus className="mr-2 h-4 w-4" /> Add Highlight
                      </Button>
                  </CardContent>
              </Card>

              <Card className="border-border/80 shadow-md">
                  <CardHeader className="pb-3"><CardTitle className="text-xl">Visitor Information</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                        {visitorInfoFields.map((item, index) => (
                            <div key={item.id} className="space-y-3 p-4 border border-border/60 rounded-xl relative bg-card shadow-sm">
                                <div className="flex justify-between items-center border-b pb-2 mb-2 border-border/30">
                                   <p className="font-semibold text-xs tracking-wider uppercase text-primary">Info Item {index + 1}</p>
                                   <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-full" onClick={() => removeVisitorInfo(index)}>
                                       <Trash2 className="h-3.5 w-3.5" />
                                   </Button>
                                </div>
                                <div className="grid grid-cols-[120px_1fr] gap-3">
                                  <FormField
                                      control={form.control}
                                      name={`visitorInfo.${index}.icon`}
                                      render={({ field }) => (
                                      <FormItem>
                                          <FormLabel className="text-xs">Icon</FormLabel>
                                          <Select onValueChange={field.onChange} value={field.value}>
                                          <FormControl>
                                              <SelectTrigger className="h-9">
                                                  <SelectValue placeholder="Icon" />
                                              </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                              {iconOptions.map(iconName => {
                                                  const Icon = IconMap[iconName] || HelpCircle;
                                                  return (
                                                      <SelectItem key={iconName} value={iconName}>
                                                          <div className="flex items-center gap-2">
                                                              <Icon className="h-4 w-4 text-primary shrink-0" />
                                                              <span>{iconName}</span>
                                                          </div>
                                                      </SelectItem>
                                                  );
                                              })}
                                          </SelectContent>
                                          </Select>
                                          <FormMessage />
                                      </FormItem>
                                      )}
                                  />
                                  <FormField control={form.control} name={`visitorInfo.${index}.title`} render={({ field }) => (<FormItem><FormLabel className="text-xs">Title</FormLabel><FormControl><Input placeholder="Info title" className="h-9" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                 <FormField control={form.control} name={`visitorInfo.${index}.line1`} render={({ field }) => (<FormItem><FormLabel className="text-xs">Line 1</FormLabel><FormControl><Input placeholder="e.g., 6:00 AM - 6:00 PM" className="h-9 text-xs" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                 <FormField control={form.control} name={`visitorInfo.${index}.line2`} render={({ field }) => (<FormItem><FormLabel className="text-xs">Line 2</FormLabel><FormControl><Input placeholder="e.g., Daily" className="h-9 text-xs" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                            </div>
                        ))}
                      </div>
                      <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => appendVisitorInfo({ icon: 'Clock', title: '', line1: '', line2: '' })}>
                          <Plus className="mr-2 h-4 w-4" /> Add Info Item
                      </Button>
                  </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="gallery" className="space-y-6 outline-none">
              <Card className="border-border/80 shadow-md">
                  <CardHeader>
                      <CardTitle>Gallery Images</CardTitle>
                      <CardDescription>Manage gallery images. Changes here are saved individually.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                      {galleryFields.map((item, index) => {
                          const formItem = item as FormGalleryImage;
                          return (
                          <div key={item.id || `new-${index}`} className="space-y-4 p-4 border rounded-md relative">
                               <div className="flex justify-between items-center">
                                  <p className="font-medium text-muted-foreground">Image {index + 1}</p>
                                   <Button type="button" variant="ghost" size="icon" onClick={() => handleGalleryDelete(formItem.id!, index)}>
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                   </Button>
                               </div>
                               <div className="flex items-start gap-4">
                                 <Image src={formItem.src} alt="gallery preview" width={100} height={100} className="rounded-md border object-cover"/>
                                 <div className="flex-1 space-y-2">
                                    <FormItem>
                                      <FormLabel>{formItem.isNew ? "Select Image" : "Replace Image"}</FormLabel>
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
                               <div className="flex justify-end">
                                  <Button type="button" size="sm" onClick={() => handleGallerySave(index)} disabled={isSavingImage === index}>
                                      {isSavingImage === index ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                      {formItem.isNew ? "Save New Image" : "Save Changes"}
                                  </Button>
                               </div>
                          </div>
                      )})}
                      <Button type="button" variant="outline" size="sm" onClick={() => appendGallery({ id: undefined, src: placeholderImages['gallery-600x400'].src, alt: '', hint: '', file: undefined, isNew: true })}>
                          <Plus className="mr-2 h-4 w-4" /> Add Image
                      </Button>
                  </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="map" className="space-y-6 outline-none">
              <Card className="border-border/80 shadow-md">
                  <CardHeader><CardTitle>Map & Nearby</CardTitle></CardHeader>
                  <CardContent className="space-y-6">
                      <FormField control={form.control} name="mapEmbedUrl" render={({ field }) => (<FormItem><FormLabel>Google Maps Embed URL</FormLabel><FormControl><Input placeholder="https://www.google.com/maps/embed?pb=..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <Separator/>
                      <p className="font-medium text-sm text-muted-foreground">Nearby Attractions</p>
                      {nearbyAttractionFields.map((item, index) => (
                          <div key={item.id} className="space-y-4 p-4 border rounded-md relative">
                               <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => removeNearbyAttraction(index)}>
                                  <Trash2 className="h-3 w-3" />
                              </Button>
                              <div className="grid md:grid-cols-3 gap-4">
                                  <FormField
                                      control={form.control}
                                      name={`nearbyAttractions.${index}.icon`}
                                      render={({ field }) => (
                                      <FormItem>
                                          <FormLabel>Icon</FormLabel>
                                          <Select onValueChange={field.onChange} value={field.value}>
                                          <FormControl>
                                              <SelectTrigger className="h-9">
                                                  <SelectValue placeholder="Select icon" />
                                              </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                              {iconOptions.map(iconName => {
                                                  const Icon = IconMap[iconName] || HelpCircle;
                                                  return (
                                                      <SelectItem key={iconName} value={iconName}>
                                                          <div className="flex items-center gap-2">
                                                              <Icon className="h-4 w-4 text-primary shrink-0" />
                                                              <span>{iconName}</span>
                                                          </div>
                                                      </SelectItem>
                                                  );
                                              })}
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
                      <Button type="button" variant="outline" size="sm" onClick={() => appendNearbyAttraction({ icon: 'Gem', name: '', distance: '' })}>
                          <Plus className="mr-2 h-4 w-4" /> Add Attraction
                      </Button>
                  </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end pt-4 border-t border-border/50">
              <Button type="submit" size="lg" disabled={isSubmitting} className="rounded-full px-8 font-serif uppercase tracking-widest text-xs h-11">
                  {isSubmitting ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Changes
              </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
