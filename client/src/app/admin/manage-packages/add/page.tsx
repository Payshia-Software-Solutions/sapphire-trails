
'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { packageFormSchema } from '@/lib/schemas';
import { useToast } from '@/hooks/use-toast';
import { triggerRevalidation } from '@/lib/revalidate';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  LoaderCircle,
  MapPin, 
  Gem, 
  Landmark, 
  Award, 
  Utensils, 
  Star, 
  Package, 
  Coffee, 
  BedDouble, 
  Leaf, 
  Mountain, 
  Bird, 
  Home, 
  Clock, 
  CalendarDays, 
  Ticket, 
  Users, 
  AlertTriangle, 
  Waves, 
  Camera, 
  Tent, 
  Thermometer,
  HelpCircle,
  Wand2,
  Sparkles,
  Monitor,
  Smartphone
} from 'lucide-react';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { cn, API_BASE_URL } from '@/lib/utils';
import { authFetch } from '@/lib/api';
import { Progress } from '@/components/ui/progress';

const iconOptions = ['MapPin', 'Gem', 'Landmark', 'Award', 'Utensils', 'Star', 'Package', 'Coffee', 'BedDouble', 'Leaf', 'Mountain', 'Bird', 'Home', 'Clock', 'CalendarDays', 'Ticket', 'Users', 'AlertTriangle', 'Waves', 'Camera', 'Tent', 'Thermometer'];

const IconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  MapPin,
  Gem,
  Landmark,
  Award,
  Utensils,
  Star,
  Package,
  Coffee,
  BedDouble,
  Leaf,
  Mountain,
  Bird,
  Home,
  Clock,
  CalendarDays,
  Ticket,
  Users,
  AlertTriangle,
  Waves,
  Camera,
  Tent,
  Thermometer,
  HelpCircle,
};

const steps = [
  { id: 1, name: 'Homepage Card', fields: ['homepageTitle', 'homepageDescription', 'imageUrl', 'imageAlt', 'imageHint'] as const },
  { id: 2, name: 'Tour Page Details', fields: ['tourPageTitle', 'duration', 'price', 'priceSuffix', 'tourPageDescription', 'heroImage', 'heroImageHint'] as const },
  { id: 3, name: 'Highlights & Inclusions', fields: ['tourHighlights', 'inclusions'] as const },
  { id: 4, name: 'Itinerary', fields: ['itinerary'] as const },
  { id: 5, name: 'Experience Gallery & Booking', fields: ['experienceGallery', 'bookingLink'] as const },
  { id: 6, name: 'SEO & Search Metadata', fields: ['metaTitle', 'metaDescription', 'metaKeywords', 'canonicalUrl'] as const },
];

export default function AddPackagePage() {
  const { toast } = useToast();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isClient, setIsClient] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serpView, setSerpView] = useState<'desktop' | 'mobile'>('desktop');
  
  const [cardImageFile, setCardImageFile] = useState<File | null>(null);
  const [cardImagePreview, setCardImagePreview] = useState<string | null>(null);
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null);
  
  const [galleryImageFiles, setGalleryImageFiles] = useState<(File | null)[]>([]);
  const [galleryImagePreviews, setGalleryImagePreviews] = useState<(string | null)[]>([]);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
      tourHighlights: [{ icon: 'Star' as const, title: '', description: '' }],
      inclusions: [{ text: '' }],
      itinerary: [{ time: '', title: '', description: '' }],
      experienceGallery: [{ src: '', alt: '', hint: '' }],
      bookingLink: '/booking',
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
      canonicalUrl: '',
    },
  });

  const { fields: highlightFields, append: appendHighlight, remove: removeHighlight } = useFieldArray({
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
  
  const { fields: galleryFields, append: appendGallery, remove: removeGallery } = useFieldArray({
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
      const newFiles = [...galleryImageFiles];
      newFiles[index] = file;
      setGalleryImageFiles(newFiles);

      const newPreviews = [...galleryImagePreviews];
      newPreviews[index] = URL.createObjectURL(file);
      setGalleryImagePreviews(newPreviews);
      
      form.setValue(`experienceGallery.${index}.src`, file.name, { shouldValidate: true });
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

  const handleAutoFillSEO = () => {
    const title = form.getValues('tourPageTitle') || form.getValues('homepageTitle') || '';
    const desc = form.getValues('tourPageDescription') || form.getValues('homepageDescription') || '';
    if (!title) {
      toast({
        variant: 'destructive',
        title: 'Tour Title Needed',
        description: 'Please enter a Tour Title before auto-generating SEO metadata.',
      });
      return;
    }
    const generatedTitle = `Book the ${title} | Ratnapura Gem Mine Tours`;
    const cleanDesc = desc.replace(/\s+/g, ' ').trim();
    const generatedDesc = `Experience the exclusive ${title} in Ratnapura Sri Lanka. ${cleanDesc.slice(0, 100)}... Book with Sapphire Trails.`;
    const generatedKeywords = `${title.toLowerCase()}, gem mine tour ratnapura, private gem expedition, sri lanka gem tours, sapphire trails`;

    form.setValue('metaTitle', generatedTitle.slice(0, 70));
    form.setValue('metaDescription', generatedDesc.slice(0, 160));
    form.setValue('metaKeywords', generatedKeywords);
    toast({
      title: '🎯 SEO Metadata Auto-Generated',
      description: 'Optimized Meta Title, Description, and Target Keywords have been filled.',
    });
  };

  async function onSubmit(data: z.infer<typeof packageFormSchema>) {
     if (!cardImageFile) {
      toast({
        variant: 'destructive',
        title: 'Missing Card Image',
        description: 'Please upload a homepage card image to continue.',
      });
      setCurrentStep(1);
      return;
    }
    if (!heroImageFile) {
       toast({
        variant: 'destructive',
        title: 'Missing Hero Image',
        description: 'Please upload a hero image for the tour page.',
      });
      setCurrentStep(2);
      return;
    }
    
    setIsSubmitting(true);

    const formData = new FormData();

    // 1. Append the main files
    formData.append('homepage_image', cardImageFile);
    formData.append('hero_image', heroImageFile);
    
    // 2. Append all other string fields
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
    formData.append('meta_title', data.metaTitle || '');
    formData.append('meta_description', data.metaDescription || '');
    formData.append('meta_keywords', data.metaKeywords || '');
    formData.append('canonical_url', data.canonicalUrl || '');

    // 3. Stringify and append array fields
    formData.append('highlights', JSON.stringify(data.tourHighlights.map((h, i) => ({ ...h, sort_order: i + 1 }))));
    formData.append('inclusions', JSON.stringify(data.inclusions.map((inc, i) => ({ icon: 'Star', title: inc.text, description: '', sort_order: i + 1 }))));
    formData.append('itinerary', JSON.stringify(data.itinerary.map((item, i) => ({ ...item, sort_order: i + 1 }))));

    // 4. Handle Experience Gallery Files and Metadata
    const galleryMeta = data.experienceGallery.map((item, index) => ({
        alt_text: item.alt,
        hint: item.hint,
        sort_order: index + 1
    }));
    formData.append('experience_gallery_meta', JSON.stringify(galleryMeta));

    galleryImageFiles.forEach((file) => {
      if (file) {
        formData.append(`experience_gallery_images[]`, file);
      }
    });

    try {
      // First, create the package without gallery images
      const response = await authFetch(`${API_BASE_URL}/tours/`, {
        method: 'POST',
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData?.error || 'Failed to create tour package.');
      }
      
      toast({
        title: 'Package Added!',
        description: `Package "${data.homepageTitle}" has been saved successfully.`,
      });
      // Purge Next.js static cache on-demand for immediate live update
      triggerRevalidation(['/tours', '/']);
      router.push('/admin/manage-packages');

    } catch (error) {
      console.error('Failed to save package:', error);
      toast({
        variant: 'destructive',
        title: 'Connection Error',
        description: 'Could not connect to the server. Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const onFormError = (errors: any) => {
    const errorKeys = Object.keys(errors);
    if (errorKeys.length === 0) return;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const hasErrorInStep = step.fields.some(f => errorKeys.includes(f));
      if (hasErrorInStep) {
        setCurrentStep(step.id);
        toast({
          variant: "destructive",
          title: `Validation Error in ${step.name}`,
          description: `Please complete the required fields in Step ${step.id} (${step.name}).`,
        });
        return;
      }
    }
  };

  const progressValue = (currentStep / steps.length) * 100;
  
  if (!isClient) {
    return null;
  }
  
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-primary">Add New Tour Package</h1>
          <p className="text-muted-foreground">Follow the steps to create a new tour package.</p>
        </div>
      </div>
      
      <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-muted-foreground">Step {currentStep} of {steps.length}: <span className="text-primary font-semibold">{steps[currentStep-1].name}</span></p>
            <div className="flex items-center gap-1.5">
              {steps.map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setCurrentStep(s.id)}
                  className={cn(
                    "px-2.5 py-1 text-xs rounded-md transition-colors font-medium border",
                    currentStep === s.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background-alt text-muted-foreground border-border hover:bg-accent hover:text-foreground"
                  )}
                >
                  {s.id}. {s.name}
                </button>
              ))}
            </div>
          </div>
          <Progress value={progressValue} className="h-2" />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, onFormError)} className="space-y-8">
            {/* Step 1: Homepage Card */}
            <div className={cn(currentStep === 1 ? 'block' : 'hidden')}>
                <Card>
                    <CardHeader>
                        <CardTitle>Homepage Card</CardTitle>
                        <CardDescription>Content that appears on the homepage and tour listing cards.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField control={form.control} name="homepageTitle" render={({ field }) => (<FormItem><FormLabel>Card Title</FormLabel><FormControl><Input placeholder="e.g., Exclusive Sapphire Mine Tour" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="homepageDescription" render={({ field }) => (<FormItem><FormLabel>Card Description</FormLabel><FormControl><Textarea placeholder="A short description for the homepage card..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                        
                        <FormField control={form.control} name="imageUrl" render={() => ( <FormItem><FormLabel>Card Image</FormLabel><FormControl><Input type="file" accept="image/*" onChange={handleCardImageFileChange} /></FormControl><FormMessage /></FormItem>)} />
                        {cardImagePreview && <Image src={cardImagePreview} alt="Card preview" width={200} height={100} className="rounded-md object-cover border" />}

                        <div className="grid md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="imageAlt" render={({ field }) => (<FormItem><FormLabel>Image Alt Text</FormLabel><FormControl><Input placeholder="Describe the image" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="imageHint" render={({ field }) => (<FormItem><FormLabel>Image AI Hint</FormLabel><FormControl><Input placeholder="e.g., tourists mining" {...field} /></FormControl><FormMessage /></FormItem>)} />
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
                        <FormField control={form.control} name="tourPageTitle" render={({ field }) => (<FormItem><FormLabel>Page Title</FormLabel><FormControl><Input placeholder="e.g., Gem Explorer Day Tour" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <div className="grid md:grid-cols-3 gap-4">
                            <FormField control={form.control} name="duration" render={({ field }) => (<FormItem><FormLabel>Duration</FormLabel><FormControl><Input placeholder="e.g., 8 Hours" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="price" render={({ field }) => (<FormItem><FormLabel>Price</FormLabel><FormControl><Input placeholder="e.g., $135" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="priceSuffix" render={({ field }) => (<FormItem><FormLabel>Price Suffix</FormLabel><FormControl><Input placeholder="e.g., per person" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                        <FormField control={form.control} name="tourPageDescription" render={({ field }) => (<FormItem><FormLabel>Page Description</FormLabel><FormControl><Textarea placeholder="The main description for the tour highlights section..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <Separator />
                        
                        <FormField control={form.control} name="heroImage" render={() => ( <FormItem><FormLabel>Page Hero Image</FormLabel><FormControl><Input type="file" accept="image/*" onChange={handleHeroImageFileChange} /></FormControl><FormMessage /></FormItem>)} />
                        {heroImagePreview && <Image src={heroImagePreview} alt="Hero preview" width={200} height={100} className="rounded-md object-cover border" />}

                        <FormField control={form.control} name="heroImageHint" render={({ field }) => (<FormItem><FormLabel>Hero Image AI Hint</FormLabel><FormControl><Input placeholder="e.g., happy tourists" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </CardContent>
                </Card>
            </div>

            {/* Step 3: Highlights & Inclusions */}
            <div className={cn(currentStep === 3 ? 'block' : 'hidden')}>
                <Card>
                    <CardHeader>
                    <CardTitle>Tour Highlights</CardTitle>
                    <CardDescription>The main highlights shown on the tour page.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {highlightFields.map((item, index) => (
                            <div key={item.id} className="space-y-3 p-4 border border-border/60 rounded-xl relative bg-card shadow-sm text-left">
                                <div className="flex justify-between items-center border-b pb-2 mb-2 border-border/30">
                                   <p className="font-semibold text-xs tracking-wider uppercase text-primary">Highlight {index + 1}</p>
                                   <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-full" onClick={() => removeHighlight(index)}>
                                       <Trash2 className="h-3.5 w-3.5" />
                                   </Button>
                                </div>
                                <div className="grid grid-cols-[120px_1fr] gap-3">
                                  <FormField
                                      control={form.control}
                                      name={`tourHighlights.${index}.icon`}
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
                                  <FormField control={form.control} name={`tourHighlights.${index}.title`} render={({ field }) => (<FormItem><FormLabel className="text-xs">Title</FormLabel><FormControl><Input placeholder="Highlight title" className="h-9" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                                 <FormField control={form.control} name={`tourHighlights.${index}.description`} render={({ field }) => (<FormItem><FormLabel className="text-xs">Description</FormLabel><FormControl><Input placeholder="Short description" className="h-9 text-xs" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                        ))}
                      </div>
                      <Button type="button" variant="outline" size="sm" className="rounded-full mt-2" onClick={() => appendHighlight({ icon: 'Star', title: '', description: '' })}>
                          <Plus className="mr-2 h-4 w-4" /> Add Highlight
                      </Button>
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

            {/* Step 4: Itinerary */}
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
             </div>
             
             {/* Step 5: Gallery & Booking */}
              <div className={cn(currentStep === 5 ? 'block' : 'hidden')}>
                <Card>
                    <CardHeader>
                        <CardTitle>Experience Gallery</CardTitle>
                        <CardDescription>Upload up to 8 images for the tour detail page gallery.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {galleryFields.map((item, index) => (
                           <div key={item.id} className="space-y-4 p-4 border rounded-md relative">
                             <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => { removeGallery(index); const newFiles = [...galleryImageFiles]; newFiles.splice(index, 1); setGalleryImageFiles(newFiles); const newPreviews = [...galleryImagePreviews]; newPreviews.splice(index, 1); setGalleryImagePreviews(newPreviews); }} disabled={galleryFields.length <= 1}>
                               <Trash2 className="h-3 w-3" />
                             </Button>
                             <p className="font-medium">Image {index + 1}</p>
                             <FormField
                                control={form.control}
                                name={`experienceGallery.${index}.src`}
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
                                <FormField control={form.control} name={`experienceGallery.${index}.alt`} render={({ field }) => (<FormItem><FormLabel>Alt Text</FormLabel><FormControl><Input placeholder="Alt text for accessibility" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name={`experienceGallery.${index}.hint`} render={({ field }) => (<FormItem><FormLabel>Hint</FormLabel><FormControl><Input placeholder="AI Hint" {...field} /></FormControl><FormMessage /></FormItem>)} />
                             </div>
                        </div>
                        ))}
                         <Button type="button" variant="outline" size="sm" onClick={() => appendGallery({ src: '', alt: '', hint: '' })} disabled={galleryFields.length >= 8}>
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

             {/* Step 6: SEO & Search Metadata */}
             <div className={cn(currentStep === 6 ? 'block' : 'hidden')}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/50">
                    <div>
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Search Engine Optimization (SEO) &amp; Social Metadata
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Configure how this tour package appears on Google search results, social shares, and SEO rankings.
                      </CardDescription>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAutoFillSEO}
                      className="gap-1 text-xs h-8 text-primary border-primary/40 hover:bg-primary/10"
                    >
                      <Wand2 className="h-3.5 w-3.5" /> Auto-Generate SEO
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    {/* Meta Title */}
                    <FormField
                      control={form.control}
                      name="metaTitle"
                      render={({ field }) => {
                        const currentLen = (field.value || '').length;
                        const isOptimal = currentLen >= 35 && currentLen <= 60;
                        return (
                          <FormItem className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <FormLabel className="text-xs font-semibold">Custom Meta Title</FormLabel>
                              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isOptimal ? 'bg-emerald-500/20 text-emerald-400' : currentLen > 60 ? 'bg-destructive/20 text-destructive' : 'bg-muted text-muted-foreground'}`}>
                                {currentLen} / 60 chars {isOptimal ? '(Optimal)' : currentLen > 60 ? '(Too Long)' : '(Short)'}
                              </span>
                            </div>
                            <FormControl>
                              <Input
                                placeholder={`e.g. Book the ${form.watch('tourPageTitle') || 'Tour'} | Ratnapura Gem Mine Tours`}
                                {...field}
                                className="h-9 text-xs"
                              />
                            </FormControl>
                            <p className="text-[11px] text-muted-foreground">
                              Leave empty to use the default: <code>Book the [Tour Title] | Ratnapura Gem Mine Tours</code>.
                            </p>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        );
                      }}
                    />

                    {/* Meta Description */}
                    <FormField
                      control={form.control}
                      name="metaDescription"
                      render={({ field }) => {
                        const currentLen = (field.value || '').length;
                        const isOptimal = currentLen >= 120 && currentLen <= 160;
                        return (
                          <FormItem className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <FormLabel className="text-xs font-semibold">Custom Meta Description</FormLabel>
                              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isOptimal ? 'bg-emerald-500/20 text-emerald-400' : currentLen > 160 ? 'bg-destructive/20 text-destructive' : 'bg-muted text-muted-foreground'}`}>
                                {currentLen} / 160 chars {isOptimal ? '(Optimal)' : currentLen > 160 ? '(Too Long)' : '(Short)'}
                              </span>
                            </div>
                            <FormControl>
                              <Textarea
                                rows={3}
                                placeholder="e.g. Experience an exclusive private gem tour in Ratnapura Sri Lanka with master gemologists, pit excavation, and luxury dining."
                                {...field}
                                className="text-xs resize-none"
                              />
                            </FormControl>
                            <p className="text-[11px] text-muted-foreground">
                              Recommended length: 120-160 characters.
                            </p>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        );
                      }}
                    />

                    {/* Focus Keywords */}
                    <FormField
                      control={form.control}
                      name="metaKeywords"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-xs font-semibold">Focus SEO Keywords &amp; Tags</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. gem mine tours ratnapura, luxury gem expedition, ceylon sapphires"
                              {...field}
                              className="h-9 text-xs"
                            />
                          </FormControl>
                          <p className="text-[11px] text-muted-foreground">
                            Comma-separated search keywords.
                          </p>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    {/* Canonical URL */}
                    <FormField
                      control={form.control}
                      name="canonicalUrl"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-xs font-semibold">Canonical URL Override (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="/tours/custom-slug"
                              {...field}
                              className="h-9 text-xs font-mono"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    {/* Live SERP Preview */}
                    <div className="pt-3 border-t border-border/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold">Live Google Search Preview</span>
                        <div className="flex items-center rounded-lg border border-border p-0.5 bg-background-alt text-[10px]">
                          <button
                            type="button"
                            onClick={() => setSerpView('desktop')}
                            className={`px-2 py-0.5 rounded flex items-center gap-1 ${serpView === 'desktop' ? 'bg-primary text-primary-foreground font-semibold' : 'text-muted-foreground'}`}
                          >
                            <Monitor className="h-3 w-3" /> Desktop
                          </button>
                          <button
                            type="button"
                            onClick={() => setSerpView('mobile')}
                            className={`px-2 py-0.5 rounded flex items-center gap-1 ${serpView === 'mobile' ? 'bg-primary text-primary-foreground font-semibold' : 'text-muted-foreground'}`}
                          >
                            <Smartphone className="h-3 w-3" /> Mobile
                          </button>
                        </div>
                      </div>

                      <div className={`p-3.5 bg-white dark:bg-[#1f1f1f] text-black dark:text-white rounded-xl border border-border shadow-sm text-left ${serpView === 'mobile' ? 'max-w-[280px] mx-auto' : 'w-full'}`}>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate flex items-center gap-1 font-mono">
                          <span>https://sapphiretrails.lk</span> › tours › <span className="text-emerald-600 dark:text-emerald-400">new-tour-package</span>
                        </div>
                        <div className="text-xs sm:text-sm font-semibold text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer line-clamp-1 mt-0.5">
                          {form.watch('metaTitle')?.trim() || (form.watch('tourPageTitle') ? `Book the ${form.watch('tourPageTitle')} | Ratnapura Gem Mine Tours` : 'Sapphire Trails Tour Package')}
                        </div>
                        <div className="text-[11px] text-gray-600 dark:text-gray-300 line-clamp-2 mt-1 leading-relaxed">
                          {form.watch('metaDescription')?.trim() || (form.watch('tourPageDescription') || 'Experience an unforgettable private gem mine tour in Ratnapura Sri Lanka with master gemologists.')}
                        </div>
                      </div>
                    </div>
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
                    {isSubmitting ? "Saving..." : "Save New Package"}
                  </Button>
                )}
              </div>
            </div>
        </form>
      </Form>
    </div>
  );
}
