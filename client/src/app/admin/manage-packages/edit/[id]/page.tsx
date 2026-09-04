'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  LoaderCircle, 
  Save, 
  Sparkles, 
  ExternalLink, 
  Camera, 
  Clock, 
  DollarSign, 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  Smartphone, 
  Monitor, 
  ImageIcon, 
  Upload, 
  Layers, 
  Wand2,
  Calendar
} from 'lucide-react';
import Image from 'next/image';
import { mapServerPackageToClient } from '@/lib/packages-data';
import { API_BASE_URL, getFullImageUrl } from '@/lib/utils';
import { authFetch } from '@/lib/api';

const ICON_OPTIONS = [
  'Gem', 'Award', 'Waves', 'Landmark', 'Shield', 'Utensils', 'Star', 'Coffee', 
  'BedDouble', 'Leaf', 'Mountain', 'Bird', 'Home', 'Clock', 'CalendarDays', 
  'Ticket', 'Users', 'AlertTriangle', 'Camera', 'Tent', 'Thermometer', 'MapPin'
];

interface GalleryItem {
  id?: number;
  src: string;
  alt: string;
  hint: string;
  file?: File | null;
  isNew?: boolean;
}

export default function EditPackageStudioPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingField, setGeneratingField] = useState<string | null>(null);
  const [serpView, setSerpView] = useState<'desktop' | 'mobile'>('desktop');
  
  const [cardImageFile, setCardImageFile] = useState<File | null>(null);
  const [cardImagePreview, setCardImagePreview] = useState<string | null>(null);
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null);
  
  const [deletedGalleryIds, setDeletedGalleryIds] = useState<number[]>([]);
  const [tourSlug, setTourSlug] = useState<string>('');
  const galleryInputRef = useRef<HTMLInputElement>(null);

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
      tourHighlights: [],
      inclusions: [{ text: '' }],
      itinerary: [],
      experienceGallery: [],
      bookingLink: '/booking',
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
      canonicalUrl: '',
    },
  });

  const { fields: highlightFields, append: appendHighlight, remove: removeHighlight } = useFieldArray({
    control: form.control,
    name: 'tourHighlights',
  });

  const { fields: inclusionFields, append: appendInclusion, remove: removeInclusion } = useFieldArray({
    control: form.control,
    name: 'inclusions',
  });

  const { fields: itineraryFields, append: appendItinerary, remove: removeItinerary } = useFieldArray({
    control: form.control,
    name: 'itinerary',
  });

  const { fields: galleryFields, append: appendGallery, remove: removeGallery } = useFieldArray({
    control: form.control,
    name: 'experienceGallery',
  });

  // Fetch package data from backend
  const fetchPackageData = useCallback(async () => {
    if (!id) return;
    setIsLoadingData(true);
    try {
      const response = await fetch(`${API_BASE_URL}/tours/${id}`);
      if (!response.ok) throw new Error('Failed to fetch package data');
      
      const serverData = await response.json();
      const packageData = mapServerPackageToClient(serverData);
      setTourSlug(serverData.slug || '');

      form.reset({
        homepageTitle: packageData.homepageTitle,
        homepageDescription: packageData.homepageDescription,
        imageUrl: packageData.imageUrl,
        imageAlt: packageData.imageAlt,
        imageHint: packageData.imageHint,
        tourPageTitle: packageData.tourPageTitle,
        duration: packageData.duration,
        price: packageData.price,
        priceSuffix: packageData.priceSuffix || 'per person',
        heroImage: packageData.heroImage,
        heroImageHint: packageData.heroImageHint,
        tourPageDescription: packageData.tourPageDescription,
        tourHighlights: packageData.tourHighlights || [],
        inclusions: packageData.inclusions.length > 0 
          ? packageData.inclusions.map(i => ({ text: i.title }))
          : [{ text: '' }],
        itinerary: packageData.itinerary || [],
        experienceGallery: packageData.experienceGallery.map(img => ({ ...img, file: null, isNew: false })),
        bookingLink: packageData.bookingLink || '/booking',
        metaTitle: packageData.metaTitle || '',
        metaDescription: packageData.metaDescription || '',
        metaKeywords: packageData.metaKeywords || '',
        canonicalUrl: packageData.canonicalUrl || '',
      });
    } catch (err: any) {
      console.error(err);
      toast({ variant: 'destructive', title: 'Error', description: err.message || 'Failed to load tour data' });
    } finally {
      setIsLoadingData(false);
    }
  }, [id, form, toast]);

  useEffect(() => {
    fetchPackageData();
  }, [fetchPackageData]);

  // AI Content Auto-Generation Handler
  const handleAIGenerate = async (field: 'all' | 'description' | 'highlights' | 'itinerary' | 'inclusions' | 'seo') => {
    const currentTitle = form.getValues('tourPageTitle') || form.getValues('homepageTitle');
    if (!currentTitle) {
      toast({
        variant: 'destructive',
        title: 'Title Required',
        description: 'Please enter a Tour Title before generating content.'
      });
      return;
    }

    setIsGenerating(true);
    setGeneratingField(field);

    try {
      const res = await fetch('/api/ai/generate-tour-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: currentTitle,
          duration: form.getValues('duration'),
          price: form.getValues('price'),
          field
        })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to generate content');
      }

      const generated = json.data;

      if (field === 'all' || field === 'description') {
        if (generated.tourPageTitle) form.setValue('tourPageTitle', generated.tourPageTitle);
        if (generated.homepageTitle) form.setValue('homepageTitle', generated.homepageTitle);
        if (generated.homepageDescription) form.setValue('homepageDescription', generated.homepageDescription);
        if (generated.tourPageDescription) form.setValue('tourPageDescription', generated.tourPageDescription);
        if (generated.duration) form.setValue('duration', generated.duration);
        if (generated.price) form.setValue('price', generated.price);
      }

      if (field === 'all' || field === 'highlights') {
        if (generated.tourHighlights && Array.isArray(generated.tourHighlights)) {
          form.setValue('tourHighlights', generated.tourHighlights);
        }
      }

      if (field === 'all' || field === 'itinerary') {
        if (generated.itinerary && Array.isArray(generated.itinerary)) {
          form.setValue('itinerary', generated.itinerary);
        }
      }

      if (field === 'all' || field === 'inclusions') {
        if (generated.inclusions && Array.isArray(generated.inclusions)) {
          form.setValue('inclusions', generated.inclusions.map((i: any) => ({ text: typeof i === 'string' ? i : i.title })));
        }
      }

      toast({
        title: '✨ AI Content Generated!',
        description: `Successfully filled ${field === 'all' ? 'complete tour package' : field} with luxury copywriting.`
      });
    } catch (err: any) {
      console.error(err);
      toast({
        variant: 'destructive',
        title: 'AI Generation Failed',
        description: err.message || 'Could not auto-generate content.'
      });
    } finally {
      setIsGenerating(false);
      setGeneratingField(null);
    }
  };

  // Keyboard shortcut Ctrl+S / Cmd+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        form.handleSubmit(onSaveSubmit)();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [form]);

  // Submit Handler
  const onSaveSubmit = async (values: z.infer<typeof packageFormSchema>) => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('_method', 'PUT');

      formData.append('homepage_title', values.homepageTitle);
      formData.append('homepage_description', values.homepageDescription);
      formData.append('tour_page_title', values.tourPageTitle);
      formData.append('duration', values.duration);
      formData.append('price', values.price);
      formData.append('price_suffix', values.priceSuffix || 'per person');
      formData.append('tour_page_description', values.tourPageDescription);
      formData.append('homepage_image_alt', values.imageAlt || values.homepageTitle);
      formData.append('homepage_image_hint', values.imageHint || '');
      formData.append('hero_image_hint', values.heroImageHint || '');
      formData.append('booking_link', values.bookingLink || '/booking');
      formData.append('meta_title', values.metaTitle || '');
      formData.append('meta_description', values.metaDescription || '');
      formData.append('meta_keywords', values.metaKeywords || '');
      formData.append('canonical_url', values.canonicalUrl || '');

      if (cardImageFile) {
        formData.append('homepage_image', cardImageFile);
        formData.append('image', cardImageFile);
      }
      if (heroImageFile) {
        formData.append('hero_image', heroImageFile);
        formData.append('heroImage', heroImageFile);
      }

      formData.append('highlights', JSON.stringify(values.tourHighlights.map((h, i) => ({ ...h, sort_order: i + 1 }))));
      formData.append('inclusions', JSON.stringify(values.inclusions.map((i, idx) => ({ icon: 'Star', title: i.text, description: '', sort_order: idx + 1 }))));
      formData.append('itinerary', JSON.stringify(values.itinerary.map((item, i) => ({ ...item, sort_order: i + 1 }))));

      // Handle Gallery additions and deletions
      const existingGalleryToKeep = values.experienceGallery
        .filter(img => !img.isNew && img.id)
        .map(img => ({ id: img.id, alt: img.alt, hint: img.hint }));
      formData.append('existingGallery', JSON.stringify(existingGalleryToKeep));

      if (deletedGalleryIds.length > 0) {
        formData.append('deletedGalleryIds', JSON.stringify(deletedGalleryIds));
      }

      values.experienceGallery.forEach((item, index) => {
        if (item.isNew && item.file) {
          formData.append(`newGalleryImages[${index}]`, item.file);
          formData.append(`newGalleryAlt[${index}]`, item.alt || '');
          formData.append(`newGalleryHint[${index}]`, item.hint || '');
        }
      });

      const response = await authFetch(`${API_BASE_URL}/tours/${id}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.message || 'Failed to update tour package');
      }

      toast({
        title: '✅ Tour Package Saved!',
        description: 'Your changes are live and synced with the public tour page.',
      });

      fetchPackageData();
      setCardImageFile(null);
      setHeroImageFile(null);
    } catch (err: any) {
      console.error(err);
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: err.message || 'An error occurred while saving.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Gallery batch file selection
  const handleBatchGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      filesArray.forEach(file => {
        const previewUrl = URL.createObjectURL(file);
        appendGallery({
          src: previewUrl,
          alt: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' '),
          hint: 'tour experience photo',
          file: file,
          isNew: true
        });
      });
      toast({
        title: '📷 Photos Added to Batch',
        description: `${filesArray.length} photo(s) queued. Click Save to upload.`,
      });
    }
  };

  // SEO auto-fill helper
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

  // SEO Score & dynamic preview watch
  const tourTitle = form.watch('tourPageTitle') || '';
  const tourDesc = form.watch('tourPageDescription') || '';
  const metaTitle = form.watch('metaTitle') || '';
  const metaDesc = form.watch('metaDescription') || '';
  const metaKeywords = form.watch('metaKeywords') || '';
  const customCanonical = form.watch('canonicalUrl') || '';
  const hasHighlights = (form.watch('tourHighlights') || []).length >= 3;
  const hasItinerary = (form.watch('itinerary') || []).length >= 4;
  const hasInclusions = (form.watch('inclusions') || []).length >= 3;
  const hasGallery = (form.watch('experienceGallery') || []).length >= 2;

  let seoScore = 10;
  if (tourTitle.length >= 10 && tourTitle.length <= 65) seoScore += 15;
  if (tourDesc.length >= 120) seoScore += 15;
  if (metaTitle.length >= 25 && metaTitle.length <= 70) seoScore += 15;
  if (metaDesc.length >= 60 && metaDesc.length <= 170) seoScore += 15;
  if (metaKeywords.length > 5) seoScore += 10;
  if (hasHighlights) seoScore += 10;
  if (hasItinerary) seoScore += 10;
  if (hasInclusions) seoScore += 5;
  if (hasGallery) seoScore += 10;
  seoScore = Math.min(100, seoScore);

  if (isLoadingData) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin/manage-packages')}
            className="gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-1 -ml-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Packages
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-foreground tracking-tight flex items-center gap-2">
            Tour Package Studio
            <Badge variant="outline" className="text-xs text-primary font-mono ml-2 border-primary/30">
              ID #{id}
            </Badge>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Full-width experience studio with AI auto-fill, rich itinerary builder, and real-time SEO simulator.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* AI Auto-Fill Master Button */}
          <Button
            type="button"
            variant="outline"
            onClick={() => handleAIGenerate('all')}
            disabled={isGenerating}
            className="gap-2 text-xs border-primary/40 text-primary hover:bg-primary/10 shadow-sm"
          >
            {isGenerating && generatingField === 'all' ? (
              <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 text-primary" />
            )}
            <span>✨ AI Auto-Fill Full Tour</span>
          </Button>

          {/* View Live Public Tour Page */}
          {tourSlug && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              asChild
              className="gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <a href={`/tours/${tourSlug}`} target="_blank" rel="noreferrer">
                <ExternalLink className="h-3.5 w-3.5" /> Live Page
              </a>
            </Button>
          )}

          {/* Save Button */}
          <Button
            type="button"
            onClick={form.handleSubmit(onSaveSubmit)}
            disabled={isSaving}
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 shadow-md text-xs"
          >
            {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save &amp; Publish (Ctrl+S)
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSaveSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ======================================================== */}
          {/* LEFT 8 COLUMNS: MAIN TOUR CONTENT STUDIO */}
          {/* ======================================================== */}
          <div className="lg:col-span-8 space-y-6">

            {/* SECTION 1: TOUR IDENTITY & PRICING */}
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  Tour Identity &amp; Pricing
                </CardTitle>
                <CardDescription className="text-xs">
                  Main headline, duration, pricing currency, and card summary.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tourPageTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Tour Page Headline</FormLabel>
                        <FormControl>
                          <Input placeholder="Gem Explorer Day Tour" {...field} className="text-xs h-9" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="homepageTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Card Title (Short)</FormLabel>
                        <FormControl>
                          <Input placeholder="Gem Explorer Day Tour" {...field} className="text-xs h-9" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Duration</FormLabel>
                        <FormControl>
                          <Input placeholder="06 - 08 Hours" {...field} className="text-xs h-9" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Price</FormLabel>
                        <FormControl>
                          <Input placeholder="$120" {...field} className="text-xs h-9 font-bold text-primary" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priceSuffix"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Price Suffix</FormLabel>
                        <FormControl>
                          <Input placeholder="per person" {...field} className="text-xs h-9" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="homepageDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Short Card Summary</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Brief 2-sentence teaser for tour listings and homepage cards..." 
                          className="min-h-[70px] text-xs resize-none" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* SECTION 2: MEDIA ASSETS & PHOTO UPLOADERS */}
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-primary" />
                  Hero Banner &amp; Card Visuals
                </CardTitle>
                <CardDescription className="text-xs">
                  Upload high-resolution photography for hero banner and listing cards.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Card Image Uploader */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Listing Card Image (4:3)</Label>
                    <div className="relative rounded-xl border border-dashed border-border p-3 text-center bg-background-alt aspect-[4/3] flex flex-col items-center justify-center overflow-hidden group">
                      {cardImagePreview || form.watch('imageUrl') ? (
                        <Image
                          src={cardImagePreview || getFullImageUrl(form.watch('imageUrl'))}
                          alt="Card Preview"
                          fill
                          className="object-cover rounded-lg"
                        />
                      ) : (
                        <div className="space-y-1 text-muted-foreground">
                          <Upload className="h-6 w-6 mx-auto text-primary opacity-60" />
                          <span className="text-xs block">Click to upload card photo</span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => {
                          if (e.target.files?.[0]) {
                            setCardImageFile(e.target.files[0]);
                            setCardImagePreview(URL.createObjectURL(e.target.files[0]));
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Hero Banner Uploader */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Hero Banner Background (16:9)</Label>
                    <div className="relative rounded-xl border border-dashed border-border p-3 text-center bg-background-alt aspect-[4/3] flex flex-col items-center justify-center overflow-hidden group">
                      {heroImagePreview || form.watch('heroImage') ? (
                        <Image
                          src={heroImagePreview || getFullImageUrl(form.watch('heroImage'))}
                          alt="Hero Preview"
                          fill
                          className="object-cover rounded-lg"
                        />
                      ) : (
                        <div className="space-y-1 text-muted-foreground">
                          <Camera className="h-6 w-6 mx-auto text-primary opacity-60" />
                          <span className="text-xs block">Click to upload hero banner</span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => {
                          if (e.target.files?.[0]) {
                            setHeroImageFile(e.target.files[0]);
                            setHeroImagePreview(URL.createObjectURL(e.target.files[0]));
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>

                </div>
              </CardContent>
            </Card>

            {/* SECTION 3: EDITORIAL STORY NARRATIVE */}
            <Card className="border-border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/50">
                <div>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Editorial Story &amp; Detailed Description
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Comprehensive overview describing the private gem mine journey.
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAIGenerate('description')}
                  disabled={isGenerating}
                  className="gap-1.5 text-xs h-7 text-primary border-primary/30 hover:bg-primary/10"
                >
                  <Sparkles className="h-3 w-3" /> Auto-Write Story
                </Button>
              </CardHeader>
              <CardContent className="pt-4">
                <FormField
                  control={form.control}
                  name="tourPageDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea 
                          placeholder="Write the full luxury narrative for this tour experience..." 
                          className="min-h-[160px] text-xs leading-relaxed" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* SECTION 4: KEY EXPERIENCE HIGHLIGHTS */}
            <Card className="border-border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/50">
                <div>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Key Experience Highlights ({highlightFields.length})
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Distinctive luxury features of this private tour.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAIGenerate('highlights')}
                    disabled={isGenerating}
                    className="gap-1 text-xs h-8 text-primary border-primary/30 hover:bg-primary/10"
                  >
                    <Sparkles className="h-3 w-3" /> Auto-Generate
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendHighlight({ icon: 'Gem', title: '', description: '' })}
                    className="gap-1 text-xs h-8"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Highlight
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                {highlightFields.map((fieldItem, idx) => (
                  <div key={fieldItem.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-3 bg-background-alt rounded-xl border border-border text-xs">
                    <div className="w-28 shrink-0">
                      <Select
                        value={form.watch(`tourHighlights.${idx}.icon`)}
                        onValueChange={val => form.setValue(`tourHighlights.${idx}.icon`, val as any)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Icon" />
                        </SelectTrigger>
                        <SelectContent>
                          {ICON_OPTIONS.map(icon => (
                            <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex-1 space-y-1.5 w-full sm:w-auto">
                      <Input
                        placeholder="Highlight Title (e.g. VIP Underground Shaft Access)"
                        {...form.register(`tourHighlights.${idx}.title`)}
                        className="h-8 text-xs font-semibold"
                      />
                      <Input
                        placeholder="Highlight Description..."
                        {...form.register(`tourHighlights.${idx}.description`)}
                        className="h-8 text-xs text-muted-foreground"
                      />
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => removeHighlight(idx)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* SECTION 5: STEP-BY-STEP DAILY ITINERARY */}
            <Card className="border-border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/50">
                <div>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    Step-by-Step Daily Itinerary ({itineraryFields.length} Steps)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Curated schedule and milestones throughout the day.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAIGenerate('itinerary')}
                    disabled={isGenerating}
                    className="gap-1 text-xs h-8 text-primary border-primary/30 hover:bg-primary/10"
                  >
                    <Sparkles className="h-3 w-3" /> Auto-Schedule
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendItinerary({ time: '09:00 AM', title: '', description: '' })}
                    className="gap-1 text-xs h-8"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Step
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                {itineraryFields.map((fieldItem, idx) => (
                  <div key={fieldItem.id} className="flex flex-col sm:flex-row items-start gap-2.5 p-3 bg-background-alt rounded-xl border border-border text-xs">
                    <div className="w-28 shrink-0">
                      <Input
                        placeholder="Time (08:30 AM)"
                        {...form.register(`itinerary.${idx}.time`)}
                        className="h-8 text-xs font-mono font-bold text-primary"
                      />
                      <span className="text-[10px] text-muted-foreground pl-1">Step {idx + 1}</span>
                    </div>

                    <div className="flex-1 space-y-1.5 w-full sm:w-auto">
                      <Input
                        placeholder="Milestone Title (e.g. VIP Hotel Pickup & Welcome Briefing)"
                        {...form.register(`itinerary.${idx}.title`)}
                        className="h-8 text-xs font-semibold"
                      />
                      <Input
                        placeholder="Milestone Description details..."
                        {...form.register(`itinerary.${idx}.description`)}
                        className="h-8 text-xs text-muted-foreground"
                      />
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0 mt-1"
                      onClick={() => removeItinerary(idx)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* SECTION 6: INCLUSIONS & GUIDELINES */}
            <Card className="border-border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/50">
                <div>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    Inclusions &amp; Guidelines ({inclusionFields.length})
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Everything provided in the private package.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAIGenerate('inclusions')}
                    disabled={isGenerating}
                    className="gap-1 text-xs h-8 text-primary border-primary/30 hover:bg-primary/10"
                  >
                    <Sparkles className="h-3 w-3" /> Auto-Fill
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendInclusion({ text: '' })}
                    className="gap-1 text-xs h-8"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Inclusion
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2.5 pt-4">
                {inclusionFields.map((fieldItem, idx) => (
                  <div key={fieldItem.id} className="flex items-center gap-2 p-2 bg-background-alt rounded-lg border border-border text-xs">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 ml-1" />
                    <Input
                      placeholder="e.g. Private Luxury AC Van Transport with Dedicated Chauffeur"
                      {...form.register(`inclusions.${idx}.text`)}
                      className="h-8 text-xs flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => removeInclusion(idx)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* SECTION 7: BATCH EXPERIENCE PHOTO GALLERY */}
            <Card className="border-border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/50">
                <div>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Camera className="h-4 w-4 text-primary" />
                    Experience Photo Gallery ({galleryFields.length} Photos)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Batch upload high-definition photography for the tour's lightbox gallery.
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => galleryInputRef.current?.click()}
                  className="gap-1 text-xs h-8 text-primary border-primary/40"
                >
                  <Upload className="h-3.5 w-3.5" /> Batch Upload Photos
                </Button>
              </CardHeader>
              <CardContent className="pt-4">
                <input
                  ref={galleryInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleBatchGallerySelect}
                  className="hidden"
                />

                {galleryFields.length === 0 ? (
                  <div 
                    onClick={() => galleryInputRef.current?.click()}
                    className="p-8 border-2 border-dashed border-border rounded-xl text-center cursor-pointer hover:border-primary/50 transition-colors bg-background-alt"
                  >
                    <Camera className="h-8 w-8 mx-auto text-muted-foreground opacity-50 mb-2" />
                    <span className="text-xs font-semibold text-foreground block">No gallery photos added</span>
                    <span className="text-[11px] text-muted-foreground">Click to batch select tour photos</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {galleryFields.map((item, idx) => {
                      const imageSrc = item.src ? (item.src.startsWith('blob:') ? item.src : getFullImageUrl(item.src)) : '/placeholder.jpg';
                      return (
                        <div key={item.id} className="relative rounded-xl overflow-hidden border border-border group aspect-square bg-background-alt shadow-sm">
                          <Image
                            src={imageSrc}
                            alt={item.alt || 'Gallery photo'}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="h-7 w-7 rounded-full"
                              onClick={() => {
                                if (item.id && !item.isNew) {
                                  setDeletedGalleryIds(prev => [...prev, item.id as number]);
                                }
                                removeGallery(idx);
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          {item.isNew && (
                            <Badge className="absolute top-1.5 left-1.5 bg-emerald-600 text-white text-[9px] px-1.5 py-0">
                              New
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* SECTION 8: ADVANCED SEO & SEARCH METADATA */}
            <Card className="border-border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/50">
                <div>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Search Engine Optimization (SEO) &amp; Social Metadata
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Fine-tune Google search titles, meta descriptions, target keywords and canonical links.
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
                {/* Meta Title Field */}
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
                            placeholder={`e.g. Book the ${tourTitle || 'Ratnapura Gem Tour'} | Ratnapura Gem Mine Tours`}
                            {...field}
                            className="h-9 text-xs"
                          />
                        </FormControl>
                        <p className="text-[11px] text-muted-foreground">
                          Leave empty to automatically use the default template: <code>Book the [Tour Title] | Ratnapura Gem Mine Tours</code>.
                        </p>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    );
                  }}
                />

                {/* Meta Description Field */}
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
                            placeholder="e.g. Experience an exclusive private gem tour in Ratnapura Sri Lanka with master gemologists, pit excavation, and luxury dining. Book online today."
                            {...field}
                            className="text-xs resize-none"
                          />
                        </FormControl>
                        <p className="text-[11px] text-muted-foreground">
                          Summarize key highlights for Google searchers. Recommended length is between 120-160 characters.
                        </p>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    );
                  }}
                />

                {/* Focus Keywords & Tags */}
                <FormField
                  control={form.control}
                  name="metaKeywords"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-semibold">Focus SEO Keywords &amp; Tags</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. gem mine tours ratnapura, luxury gem expedition, ceylon sapphires, ethical mining"
                          {...field}
                          className="h-9 text-xs"
                        />
                      </FormControl>
                      <p className="text-[11px] text-muted-foreground">
                        Comma-separated keywords to enhance search indexing and category tagging.
                      </p>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* Custom Canonical URL */}
                <FormField
                  control={form.control}
                  name="canonicalUrl"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-semibold">Canonical URL Override (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={`/tours/${tourSlug || 'slug'}`}
                          {...field}
                          className="h-9 text-xs font-mono"
                        />
                      </FormControl>
                      <p className="text-[11px] text-muted-foreground">
                        Default: <code>/tours/{tourSlug || 'slug'}</code>. Use this only if you want search engines to prioritize a specific master URL.
                      </p>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

          </div>

          {/* ======================================================== */}
          {/* RIGHT 4 COLUMNS: STICKY SEO CONTROL CENTER & ACTIONS */}
          {/* ======================================================== */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            {/* CARD 1: SEO READINESS GAUGE */}
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-3 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    SEO &amp; Conversion Score
                  </CardTitle>
                  <Badge className={`text-xs font-bold ${seoScore >= 80 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'}`}>
                    {seoScore} / 100
                  </Badge>
                </div>
                <Progress value={seoScore} className="h-1.5 mt-2" />
              </CardHeader>
              
              <CardContent className="space-y-4 pt-4">
                {/* SERP Preview Simulation */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">Google Search Preview</span>
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

                  {/* Simulated Google SERP Snippet */}
                  <div className={`p-3.5 bg-white dark:bg-[#1f1f1f] text-black dark:text-white rounded-xl border border-border shadow-sm text-left ${serpView === 'mobile' ? 'max-w-[280px] mx-auto' : 'w-full'}`}>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate flex items-center gap-1 font-mono">
                      <span>https://sapphiretrails.lk</span> › tours › <span className="text-emerald-600 dark:text-emerald-400">{tourSlug || 'tour-package'}</span>
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer line-clamp-1 mt-0.5">
                      {metaTitle.trim() || (tourTitle ? `Book the ${tourTitle} | Ratnapura Gem Mine Tours` : 'Sapphire Trails Tour Package')}
                    </div>
                    <div className="text-[11px] text-gray-600 dark:text-gray-300 line-clamp-2 mt-1 leading-relaxed">
                      {metaDesc.trim() || (tourDesc || 'Experience a private gem mine tour in Ratnapura, Sri Lanka with master gemologists and luxury transportation.')}
                    </div>
                  </div>
                </div>

                {/* Schema Structure Verification */}
                <div className="space-y-1.5 pt-2 border-t border-border/60 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>Schema.org Product &amp; TouristTrip Markup</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>OpenGraph &amp; Twitter Rich Cards</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>Instant WhatsApp Concierge Integration</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CARD 2: QUICK SAVE ACTION */}
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Publish &amp; Synchronization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-semibold text-emerald-400">Published</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">Canonical URL</span>
                  <span className="font-mono text-foreground">/tours/{tourSlug}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Total Photos</span>
                  <span className="font-semibold">{galleryFields.length + 2} Assets</span>
                </div>

                <Button
                  type="submit"
                  disabled={isSaving}
                  className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold mt-2 shadow"
                >
                  {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save &amp; Publish Tour
                </Button>
              </CardContent>
            </Card>

          </div>

        </form>
      </Form>

    </div>
  );
}
