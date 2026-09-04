'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  Code, 
  LayoutTemplate, 
  Copy, 
  Check, 
  Sparkles, 
  LoaderCircle, 
  Globe, 
  ImageIcon, 
  Upload, 
  MapPin, 
  ExternalLink, 
  Camera, 
  Layers, 
  Compass, 
  CheckCircle2, 
  Smartphone, 
  Monitor,
  Wand2
} from 'lucide-react';
import { API_BASE_URL, getFullImageUrl } from '@/lib/utils';
import { authFetch } from '@/lib/api';
import { InteractiveMapPickerDialog } from '@/components/admin/interactive-map-picker-dialog';

const ICON_OPTIONS = [
  'Leaf', 'Mountain', 'Bird', 'Home', 'Clock', 'CalendarDays', 
  'Ticket', 'Users', 'AlertTriangle', 'Gem', 'Waves', 'Landmark', 
  'Camera', 'Tent', 'Thermometer', 'MapPin'
];

interface GalleryItem {
  id?: number;
  image_url: string;
  alt_text: string;
  hint: string;
  is_360?: boolean | number;
}

interface LocationState {
  title: string;
  slug: string;
  subtitle: string;
  category: 'nature' | 'agriculture' | 'cultural' | string;
  card_description: string;
  card_image_url: string;
  card_image_hint: string;
  distance: string;
  hero_image_url: string;
  hero_image_hint: string;
  intro_title: string;
  intro_description: string;
  intro_image_url: string;
  intro_image_hint: string;
  map_embed_url: string;
  highlights: Array<{ icon: string; title: string; description: string; sort_order?: number }>;
  visitor_info: Array<{ icon: string; title: string; line1: string; line2: string; sort_order?: number }>;
  nearby_attractions: Array<{ icon: string; name: string; distance: string; sort_order?: number }>;
  gallery_images: GalleryItem[];
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1546708973-b339540b5162?w=800&auto=format&fit=crop&q=80';

export default function ProfessionalLocationEditorPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'visual' | 'json'>('visual');
  const [serpView, setSerpView] = useState<'desktop' | 'mobile'>('desktop');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingField, setGeneratingField] = useState<string | null>(null);

  const [copiedJson, setCopiedJson] = useState(false);
  const [jsonString, setJsonString] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Uploading states
  const [uploadingCard, setUploadingCard] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingIntro, setUploadingIntro] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);

  const [availableLocations, setAvailableLocations] = useState<Array<{ slug: string; title: string }>>([]);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Location Data State
  const [location, setLocation] = useState<LocationState>({
    title: '',
    slug: slug || '',
    subtitle: '',
    category: 'nature',
    card_description: '',
    card_image_url: '',
    card_image_hint: '',
    distance: '',
    hero_image_url: '',
    hero_image_hint: '',
    intro_title: '',
    intro_description: '',
    intro_image_url: '',
    intro_image_hint: '',
    map_embed_url: '',
    highlights: [],
    visitor_info: [],
    nearby_attractions: [],
    gallery_images: [],
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
  });

  // Fetch Location from Backend
  const fetchLocationData = useCallback(async () => {
    if (!slug) return;
    setIsLoading(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/locations/${slug}`);
      if (!res.ok) throw new Error('Location not found');
      const data = await res.json();

      const normalized: LocationState = {
        title: data.title || '',
        slug: data.slug || slug,
        subtitle: data.subtitle || '',
        category: data.category || 'nature',
        card_description: data.card_description || '',
        card_image_url: data.card_image_url || '',
        card_image_hint: data.card_image_hint || '',
        distance: data.distance || '',
        hero_image_url: data.hero_image_url || '',
        hero_image_hint: data.hero_image_hint || '',
        intro_title: data.intro_title || '',
        intro_description: data.intro_description || '',
        intro_image_url: data.intro_image_url || '',
        intro_image_hint: data.intro_image_hint || '',
        map_embed_url: data.map_embed_url || '',
        highlights: Array.isArray(data.highlights) ? data.highlights : [],
        visitor_info: Array.isArray(data.visitor_info) ? data.visitor_info : [],
        nearby_attractions: Array.isArray(data.nearby_attractions) ? data.nearby_attractions : [],
        gallery_images: Array.isArray(data.gallery_images) 
          ? data.gallery_images.map((g: any) => ({
              id: g.id,
              image_url: g.image_url || g.src || '',
              alt_text: g.alt_text || g.alt || '',
              hint: g.hint || '',
              is_360: Boolean(g.is_360)
            }))
          : [],
        meta_title: data.meta_title || `${data.title || ''} | Ratnapura Gem Tour Attraction`,
        meta_description: data.meta_description || data.card_description || '',
        meta_keywords: data.meta_keywords || 'Ratnapura, Sri Lanka, Ceylon Sapphires, Gem Tour',
      };

      setLocation(normalized);
      setJsonString(JSON.stringify(normalized, null, 2));

      // Fetch all locations to link nearby excursions
      try {
        const allRes = await fetch(`${API_BASE_URL}/locations`);
        if (allRes.ok) {
          const allData = await allRes.json();
          if (Array.isArray(allData)) {
            setAvailableLocations(allData.map((l: any) => ({ slug: l.slug, title: l.title })));
          }
        }
      } catch (e) {
        console.error('Could not fetch destinations list', e);
      }
    } catch (err) {
      console.error(err);
      toast({
        variant: 'destructive',
        title: 'Loading Failed',
        description: 'Could not fetch location data from server.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [slug, toast]);

  useEffect(() => {
    fetchLocationData();
  }, [fetchLocationData]);

  // Keyboard shortcut Ctrl+S or Cmd+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveLocation();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Calculate Real-Time SEO Score
  const calculateSeoScore = () => {
    let score = 0;
    const titleLen = (location.meta_title || '').length;
    const descLen = (location.meta_description || '').length;
    const hasKeywords = (location.meta_keywords || '').trim().length > 0;
    const hasCardImg = Boolean(location.card_image_url);
    const hasGallery = location.gallery_images.length > 0;
    const allGalleryHaveAlt = hasGallery && location.gallery_images.every(g => g.alt_text && g.alt_text.trim().length > 0);

    if (titleLen >= 30 && titleLen <= 65) score += 25;
    else if (titleLen > 0) score += 15;

    if (descLen >= 80 && descLen <= 165) score += 25;
    else if (descLen > 0) score += 15;

    if (hasKeywords) score += 20;
    if (hasCardImg) score += 15;
    if (allGalleryHaveAlt || (!hasGallery && hasCardImg)) score += 15;

    return Math.min(score, 100);
  };

  const seoScore = calculateSeoScore();

  // ========================================================
  // AI CONTENT GENERATION ENGINE
  // ========================================================
  const handleAiGenerate = async (field: 'all' | 'subtitle' | 'card_description' | 'intro' | 'highlights' | 'visitor_info' | 'seo') => {
    if (!location.title.trim()) {
      toast({
        variant: 'destructive',
        title: 'Title Required',
        description: 'Please provide a destination title so AI can generate relevant luxury content.',
      });
      return;
    }

    setIsGenerating(true);
    setGeneratingField(field);

    try {
      const res = await fetch('/api/ai/generate-location-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: location.title,
          category: location.category,
          field,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Generation failed');
      }

      const generated = await res.json();

      if (field === 'all') {
        setLocation(prev => ({
          ...prev,
          subtitle: generated.subtitle || prev.subtitle,
          card_description: generated.card_description || prev.card_description,
          intro_title: generated.intro_title || prev.intro_title,
          intro_description: generated.intro_description || prev.intro_description,
          distance: generated.distance || prev.distance,
          highlights: generated.highlights || prev.highlights,
          visitor_info: generated.visitor_info || prev.visitor_info,
          meta_title: generated.meta_title || prev.meta_title,
          meta_description: generated.meta_description || prev.meta_description,
          meta_keywords: generated.meta_keywords || prev.meta_keywords,
        }));
        toast({
          title: '✨ AI Content Generated!',
          description: `Complete luxury narrative and SEO data generated for "${location.title}".`,
        });
      } else if (field === 'subtitle') {
        setLocation(prev => ({ ...prev, subtitle: generated.subtitle }));
        toast({ title: '✨ Subtitle Suggested', description: 'Updated subtitle tagline.' });
      } else if (field === 'card_description') {
        setLocation(prev => ({ ...prev, card_description: generated.card_description }));
        toast({ title: '✨ Summary Generated', description: 'Updated card teaser description.' });
      } else if (field === 'intro') {
        setLocation(prev => ({
          ...prev,
          intro_title: generated.intro_title || prev.intro_title,
          intro_description: generated.intro_description || prev.intro_description,
        }));
        toast({ title: '✨ Story Narrative Generated', description: 'Updated intro headline and storytelling body.' });
      } else if (field === 'highlights') {
        setLocation(prev => ({ ...prev, highlights: generated.highlights }));
        toast({ title: '✨ Highlights Generated', description: 'Populated 4 curated feature highlights.' });
      } else if (field === 'visitor_info') {
        setLocation(prev => ({ ...prev, visitor_info: generated.visitor_info }));
        toast({ title: '✨ Visitor Guide Generated', description: 'Populated travel timing, season & advice.' });
      } else if (field === 'seo') {
        setLocation(prev => ({
          ...prev,
          meta_title: generated.meta_title || prev.meta_title,
          meta_description: generated.meta_description || prev.meta_description,
          meta_keywords: generated.meta_keywords || prev.meta_keywords,
        }));
        toast({ title: '✨ SEO Meta Optimized', description: 'Generated 60-char title, meta description & keywords.' });
      }
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'AI Generation Failed',
        description: err instanceof Error ? err.message : 'Could not generate content.',
      });
    } finally {
      setIsGenerating(false);
      setGeneratingField(null);
    }
  };

  // Generic File Upload Helper
  const uploadImageFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('location_slug', slug);
    formData.append('alt_text', location.title || 'Location Image');
    formData.append('hint', file.name);

    const res = await authFetch(`${API_BASE_URL}/location-gallery/`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to upload image');
    }

    const data = await res.json();
    return data.image_url;
  };

  // Single Slot Upload (Card, Hero, Intro)
  const handleSingleImageUpload = async (file: File, type: 'card' | 'hero' | 'intro') => {
    if (!file) return;
    if (type === 'card') setUploadingCard(true);
    if (type === 'hero') setUploadingHero(true);
    if (type === 'intro') setUploadingIntro(true);

    try {
      const uploadedUrl = await uploadImageFile(file);
      if (type === 'card') setLocation(prev => ({ ...prev, card_image_url: uploadedUrl }));
      if (type === 'hero') setLocation(prev => ({ ...prev, hero_image_url: uploadedUrl }));
      if (type === 'intro') setLocation(prev => ({ ...prev, intro_image_url: uploadedUrl }));

      toast({
        title: 'Image Uploaded!',
        description: `${type.toUpperCase()} image attached. Click "Save Location" to apply.`,
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: err instanceof Error ? err.message : 'Could not upload image.',
      });
    } finally {
      if (type === 'card') setUploadingCard(false);
      if (type === 'hero') setUploadingHero(false);
      if (type === 'intro') setUploadingIntro(false);
    }
  };

  // Multi-File Gallery Upload
  const handleGalleryFilesUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsUploadingGallery(true);
    const fileArray = Array.from(files);
    let successCount = 0;

    for (const file of fileArray) {
      try {
        const uploadedUrl = await uploadImageFile(file);
        setLocation(prev => ({
          ...prev,
          gallery_images: [
            ...prev.gallery_images,
            {
              image_url: uploadedUrl,
              alt_text: `${prev.title} - ${file.name.replace(/\.[^/.]+$/, '')}`,
              hint: file.name,
              is_360: false
            }
          ]
        }));
        successCount++;
      } catch (err) {
        console.error(`Failed to upload ${file.name}:`, err);
      }
    }

    setIsUploadingGallery(false);
    if (successCount > 0) {
      toast({
        title: 'Gallery Photos Added!',
        description: `Successfully uploaded ${successCount} photos. Remember to save changes.`,
      });
    }
  };

  // Switch Tabs
  const handleTabChange = (val: string) => {
    if (val === 'json') {
      setJsonString(JSON.stringify(location, null, 2));
      setJsonError(null);
      setActiveTab('json');
    } else {
      try {
        const parsed = JSON.parse(jsonString);
        setLocation(parsed);
        setJsonError(null);
        setActiveTab('visual');
      } catch (err) {
        setJsonError((err as Error).message);
        toast({
          variant: 'destructive',
          title: 'Invalid JSON Syntax',
          description: 'Please fix JSON errors before returning to Visual Mode.',
        });
      }
    }
  };

  const handlePrettifyJson = () => {
    try {
      const parsed = JSON.parse(jsonString);
      setJsonString(JSON.stringify(parsed, null, 2));
      setJsonError(null);
      toast({ title: 'Prettified', description: 'JSON structure cleanly formatted.' });
    } catch (err) {
      setJsonError((err as Error).message);
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonString);
    setCopiedJson(true);
    toast({ title: 'Copied!', description: 'Location JSON copied to clipboard.' });
    setTimeout(() => setCopiedJson(false), 2000);
  };

  // Unified Atomic Save
  const handleSaveLocation = async () => {
    setIsSaving(true);
    let payload = location;

    if (activeTab === 'json') {
      try {
        payload = JSON.parse(jsonString);
        setLocation(payload);
      } catch (err) {
        toast({
          variant: 'destructive',
          title: 'Invalid JSON',
          description: 'Cannot save invalid JSON. Please check syntax.',
        });
        setIsSaving(false);
        return;
      }
    }

    try {
      const res = await authFetch(`${API_BASE_URL}/locations/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update location');
      }

      toast({
        title: 'Location Saved Successfully!',
        description: `"${payload.title}" has been updated with all media, SEO, and content.`,
      });
      fetchLocationData();
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: err instanceof Error ? err.message : 'Could not save location.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Dynamic Array Handlers
  const addHighlight = () => {
    setLocation(prev => ({
      ...prev,
      highlights: [...prev.highlights, { icon: 'Gem', title: '', description: '' }]
    }));
  };
  const removeHighlight = (idx: number) => {
    setLocation(prev => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== idx)
    }));
  };

  const addVisitorInfo = () => {
    setLocation(prev => ({
      ...prev,
      visitor_info: [...prev.visitor_info, { icon: 'Clock', title: 'Timing', line1: '', line2: '' }]
    }));
  };
  const removeVisitorInfo = (idx: number) => {
    setLocation(prev => ({
      ...prev,
      visitor_info: prev.visitor_info.filter((_, i) => i !== idx)
    }));
  };

  const addNearby = () => {
    setLocation(prev => ({
      ...prev,
      nearby_attractions: [...prev.nearby_attractions, { icon: 'MapPin', name: '', distance: '' }]
    }));
  };
  const removeNearby = (idx: number) => {
    setLocation(prev => ({
      ...prev,
      nearby_attractions: prev.nearby_attractions.filter((_, i) => i !== idx)
    }));
  };

  const removeGalleryImage = (idx: number) => {
    setLocation(prev => ({
      ...prev,
      gallery_images: prev.gallery_images.filter((_, i) => i !== idx)
    }));
  };

  if (isLoading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center gap-3 text-muted-foreground w-full">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-medium">Loading destination studio &amp; media...</p>
      </div>
    );
  }

  return (
    <div className="w-full px-2 sm:px-4 lg:px-6 py-4 space-y-6">
      
      {/* ======================================================== */}
      {/* TOP EXECUTIVE HEADER BAR WITH AI GENERATE ACTION */}
      {/* ======================================================== */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-border/80">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => router.push('/admin/manage-content')}
            className="rounded-lg h-10 w-10 border-border shrink-0 hover:bg-primary/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {location.title || 'Edit Destination'}
              </h1>
              <Badge variant="outline" className="font-mono text-xs bg-background-alt text-primary border-primary/30">
                /{slug}
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                Live &amp; Indexed
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Full-width Destination Studio • AI Content Generator • Real-time SEO Optimizer
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
          
          {/* AI Full Generator Button */}
          <Button
            variant="outline"
            onClick={() => handleAiGenerate('all')}
            disabled={isGenerating}
            className="gap-2 border-primary/40 text-primary hover:bg-primary/10 bg-primary/5 font-semibold text-xs h-10 shadow-sm"
          >
            {isGenerating && generatingField === 'all' ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin text-primary" />
                Generating Full Content...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 text-primary" />
                AI Smart-Fill All
              </>
            )}
          </Button>

          <Button
            variant="outline"
            asChild
            className="gap-2 border-border hover:border-primary/50 text-foreground text-xs h-10"
          >
            <a href={`/explore-ratnapura/${slug}`} target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4 text-primary" />
              Live Preview
            </a>
          </Button>

          <Button
            onClick={handleSaveLocation}
            disabled={isSaving}
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-5 shadow-lg shadow-primary/20 text-xs h-10"
          >
            {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Location <span className="hidden sm:inline text-[11px] opacity-75 font-normal">(Ctrl+S)</span>
          </Button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 12-COLUMN STUDIO WORKSPACE */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ======================================================== */}
        {/* LEFT COLUMN: MAIN CONTENT & MEDIA (8 COLS) */}
        {/* ======================================================== */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Mode Switcher */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <div className="flex items-center justify-between gap-4 mb-4">
              <TabsList className="grid grid-cols-2 w-72 bg-background-alt border border-border">
                <TabsTrigger value="visual" className="gap-2 text-xs">
                  <LayoutTemplate className="h-4 w-4" />
                  Visual Studio
                </TabsTrigger>
                <TabsTrigger value="json" className="gap-2 text-xs">
                  <Code className="h-4 w-4" />
                  Raw JSON
                </TabsTrigger>
              </TabsList>

              {activeTab === 'json' && (
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={handlePrettifyJson} className="gap-1 text-xs h-8">
                    <Sparkles className="h-3.5 w-3.5" /> Prettify
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={handleCopyJson} className="gap-1 text-xs h-8">
                    {copiedJson ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedJson ? 'Copied' : 'Copy JSON'}
                  </Button>
                </div>
              )}
            </div>

            {/* TAB 1: VISUAL STUDIO */}
            <TabsContent value="visual" className="space-y-6 mt-0">
              
              {/* SECTION 1: BASIC INFORMATION & CARD MEDIA */}
              <Card className="border-border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Destination Details &amp; Listing Card
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Primary destination name, category classification, and explore card summary.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5 md:col-span-2">
                      <Label htmlFor="title" className="text-xs">Destination Title</Label>
                      <Input
                        id="title"
                        value={location.title}
                        onChange={e => setLocation({ ...location, title: e.target.value })}
                        placeholder="e.g. Bopath Ella Falls"
                        className="font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="category" className="text-xs">Classification Category</Label>
                      <Select
                        value={location.category}
                        onValueChange={val => setLocation({ ...location, category: val })}
                      >
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nature">🌿 Nature &amp; Wildlife</SelectItem>
                          <SelectItem value="agriculture">💎 Gem Mining &amp; Agriculture</SelectItem>
                          <SelectItem value="cultural">🏛️ Cultural &amp; Heritage</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                    <div className="md:col-span-8 space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="distance" className="text-xs">Distance / Accessibility Badge</Label>
                        <Input
                          id="distance"
                          value={location.distance}
                          onChange={e => setLocation({ ...location, distance: e.target.value })}
                          placeholder="e.g. 20 km from Ratnapura City Center"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="card_description" className="text-xs">Listing Card Summary Description</Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAiGenerate('card_description')}
                            disabled={isGenerating}
                            className="h-6 text-[11px] text-primary gap-1 px-2 hover:bg-primary/10"
                          >
                            <Sparkles className="h-3 w-3" /> AI Generate Summary
                          </Button>
                        </div>
                        <Textarea
                          id="card_description"
                          rows={4}
                          value={location.card_description}
                          onChange={e => setLocation({ ...location, card_description: e.target.value })}
                          placeholder="A concise, captivating teaser for explore cards and mobile listing grids..."
                          className="text-sm leading-relaxed"
                        />
                      </div>
                    </div>

                    {/* Interactive Card Image Dropzone */}
                    <div className="md:col-span-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold">Card Thumbnail</Label>
                        <span className="text-[10px] text-muted-foreground">Ratio 4:3</span>
                      </div>
                      <div className="relative group border-2 border-dashed border-border hover:border-primary/60 rounded-xl overflow-hidden bg-background-alt aspect-[4/3] flex flex-col items-center justify-center text-center transition-all">
                        {location.card_image_url ? (
                          <>
                            <img 
                              src={getFullImageUrl(location.card_image_url)} 
                              alt={location.title}
                              onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }}
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                              <label className="cursor-pointer bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-md font-medium shadow flex items-center gap-1.5 hover:bg-primary/90">
                                <Upload className="h-3.5 w-3.5" /> Replace Photo
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  className="hidden" 
                                  onChange={e => e.target.files?.[0] && handleSingleImageUpload(e.target.files[0], 'card')} 
                                />
                              </label>
                            </div>
                          </>
                        ) : (
                          <label className="cursor-pointer flex flex-col items-center justify-center gap-1.5 p-4 w-full h-full text-muted-foreground hover:text-primary">
                            <Upload className="h-6 w-6 text-primary mb-0.5" />
                            <span className="text-xs font-semibold">Upload Photo</span>
                            <span className="text-[10px] text-muted-foreground">Click or Drag &amp; Drop</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={e => e.target.files?.[0] && handleSingleImageUpload(e.target.files[0], 'card')} 
                            />
                          </label>
                        )}

                        {uploadingCard && (
                          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-2 text-white z-10">
                            <LoaderCircle className="h-6 w-6 animate-spin text-primary" />
                            <span className="text-xs font-medium">Uploading...</span>
                          </div>
                        )}
                      </div>
                      <Input
                        placeholder="Image URL path"
                        value={location.card_image_url}
                        onChange={e => setLocation({ ...location, card_image_url: e.target.value })}
                        className="h-7 text-[11px] font-mono"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* SECTION 2: HERO BANNER & INTRO NARRATIVE */}
              <Card className="border-border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-primary" />
                    Hero Banner &amp; Narrative Introduction
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Full-width panoramic destination cover photo and immersive editorial storytelling.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Hero Banner Box */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold">Panoramic Hero Banner (16:9)</Label>
                      <span className="text-[10px] text-muted-foreground">Full Width Cover</span>
                    </div>
                    <div className="relative group border-2 border-dashed border-border hover:border-primary/60 rounded-xl overflow-hidden bg-background-alt aspect-[16/7] flex flex-col items-center justify-center text-center">
                      {location.hero_image_url ? (
                        <>
                          <img 
                            src={getFullImageUrl(location.hero_image_url)} 
                            alt="Hero Cover"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <label className="cursor-pointer bg-primary text-primary-foreground text-xs px-3.5 py-2 rounded-md font-medium shadow flex items-center gap-2 hover:bg-primary/90">
                              <Upload className="h-4 w-4" /> Replace Hero Banner
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={e => e.target.files?.[0] && handleSingleImageUpload(e.target.files[0], 'hero')} 
                              />
                            </label>
                          </div>
                        </>
                      ) : (
                        <label className="cursor-pointer flex flex-col items-center justify-center p-6 text-muted-foreground hover:text-primary">
                          <Upload className="h-7 w-7 text-primary mb-1" />
                          <span className="text-xs font-semibold">Upload 16:9 Hero Banner</span>
                          <span className="text-[10px] text-muted-foreground">Recommended 1920x800 resolution</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={e => e.target.files?.[0] && handleSingleImageUpload(e.target.files[0], 'hero')} 
                          />
                        </label>
                      )}
                      {uploadingHero && (
                        <div className="absolute inset-0 bg-black/80 flex items-center justify-center gap-2 text-white z-10">
                          <LoaderCircle className="h-6 w-6 animate-spin text-primary" />
                          <span className="text-xs">Uploading Hero Cover...</span>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="subtitle" className="text-xs">Banner Subtitle / Tagline</Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAiGenerate('subtitle')}
                            disabled={isGenerating}
                            className="h-5 text-[10px] text-primary gap-1 px-1.5 hover:bg-primary/10"
                          >
                            <Sparkles className="h-2.5 w-2.5" /> Suggest
                          </Button>
                        </div>
                        <Input
                          id="subtitle"
                          value={location.subtitle}
                          onChange={e => setLocation({ ...location, subtitle: e.target.value })}
                          placeholder="e.g. A UNESCO World Heritage Tropical Gem"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="hero_image_url" className="text-xs">Hero Image URL</Label>
                        <Input
                          id="hero_image_url"
                          value={location.hero_image_url}
                          onChange={e => setLocation({ ...location, hero_image_url: e.target.value })}
                          placeholder="/location-images/..."
                          className="font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Intro Narrative */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start pt-2 border-t border-border/70">
                    <div className="md:col-span-8 space-y-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="intro_title" className="text-xs">Intro Headline</Label>
                        <Input
                          id="intro_title"
                          value={location.intro_title}
                          onChange={e => setLocation({ ...location, intro_title: e.target.value })}
                          placeholder="e.g. A Natural Masterpiece of Cascading Waters"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="intro_description" className="text-xs">Editorial Storytelling Narrative</Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAiGenerate('intro')}
                            disabled={isGenerating}
                            className="h-6 text-[11px] text-primary gap-1 px-2 hover:bg-primary/10"
                          >
                            <Sparkles className="h-3 w-3" /> AI Generate Story
                          </Button>
                        </div>
                        <Textarea
                          id="intro_description"
                          rows={6}
                          value={location.intro_description}
                          onChange={e => setLocation({ ...location, intro_description: e.target.value })}
                          placeholder="Comprehensive destination narrative, folklore, gem history, and visitor allure..."
                          className="text-sm leading-relaxed"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-4 space-y-2">
                      <Label className="text-xs font-semibold">Intro Feature Visual</Label>
                      <div className="relative group border-2 border-dashed border-border hover:border-primary/60 rounded-xl overflow-hidden bg-background-alt aspect-[4/3] flex flex-col items-center justify-center text-center">
                        {location.intro_image_url ? (
                          <>
                            <img 
                              src={getFullImageUrl(location.intro_image_url)} 
                              alt="Intro Visual"
                              onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }}
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <label className="cursor-pointer bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-md font-medium shadow flex items-center gap-1.5">
                                <Upload className="h-3.5 w-3.5" /> Replace Photo
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  className="hidden" 
                                  onChange={e => e.target.files?.[0] && handleSingleImageUpload(e.target.files[0], 'intro')} 
                                />
                              </label>
                            </div>
                          </>
                        ) : (
                          <label className="cursor-pointer flex flex-col items-center justify-center p-4 text-muted-foreground hover:text-primary">
                            <Upload className="h-5 w-5 text-primary mb-1" />
                            <span className="text-xs font-semibold">Upload Side Visual</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={e => e.target.files?.[0] && handleSingleImageUpload(e.target.files[0], 'intro')} 
                            />
                          </label>
                        )}
                        {uploadingIntro && (
                          <div className="absolute inset-0 bg-black/80 flex items-center justify-center gap-2 text-white z-10">
                            <LoaderCircle className="h-5 w-5 animate-spin text-primary" />
                          </div>
                        )}
                      </div>
                      <Input
                        placeholder="Intro Image URL"
                        value={location.intro_image_url}
                        onChange={e => setLocation({ ...location, intro_image_url: e.target.value })}
                        className="h-7 text-[11px] font-mono"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* SECTION 3: MULTI-IMAGE EXPERIENCE GALLERY */}
              <Card className="border-border shadow-sm">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <Camera className="h-4 w-4 text-primary" />
                        Experience Photo Gallery
                      </CardTitle>
                      <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                        {location.gallery_images.length} Photos
                      </Badge>
                    </div>
                    <CardDescription className="text-xs">
                      Drag &amp; drop multiple high-res destination photos, 360° panoramas, and SEO image alt tags.
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => galleryInputRef.current?.click()}
                      disabled={isUploadingGallery}
                      className="gap-2 border-primary/40 text-primary hover:bg-primary/10"
                    >
                      {isUploadingGallery ? (
                        <>
                          <LoaderCircle className="h-4 w-4 animate-spin" />
                          Uploading Batch...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          Upload Multi-Photos
                        </>
                      )}
                    </Button>
                    <input
                      type="file"
                      ref={galleryInputRef}
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={e => e.target.files && handleGalleryFilesUpload(e.target.files)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Multi-File Drag & Drop Zone */}
                  <div 
                    onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        handleGalleryFilesUpload(e.dataTransfer.files);
                      }
                    }}
                    onClick={() => galleryInputRef.current?.click()}
                    className="border-2 border-dashed border-border hover:border-primary/60 rounded-xl p-6 text-center bg-background-alt/40 transition-colors flex flex-col items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="h-7 w-7 text-primary mb-1" />
                    <p className="text-xs sm:text-sm font-medium">
                      Drag &amp; drop photos here, or <span className="text-primary underline font-semibold">browse files</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Batch upload supported (JPG, PNG, WEBP). Photos attach instantly.
                    </p>
                  </div>

                  {/* Photo Cards Grid */}
                  {location.gallery_images.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground text-xs">
                      No gallery photos attached yet. Upload images above to showcase this destination.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-1">
                      {location.gallery_images.map((img, idx) => (
                        <div 
                          key={idx} 
                          className="group relative bg-background-alt rounded-xl border border-border overflow-hidden flex flex-col shadow-sm"
                        >
                          <div className="relative aspect-[4/3] bg-black/40 overflow-hidden">
                            <img
                              src={getFullImageUrl(img.image_url)}
                              alt={img.alt_text || 'Gallery Photo'}
                              onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {Boolean(img.is_360) && (
                              <Badge className="absolute top-2 left-2 bg-purple-600 text-white text-[10px] gap-1 shadow">
                                <Compass className="h-3 w-3" /> 360° Panorama
                              </Badge>
                            )}
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-7 w-7 opacity-80 hover:opacity-100 shadow"
                              onClick={() => removeGalleryImage(idx)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>

                          <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                            <div className="space-y-1.5">
                              <Input
                                placeholder="SEO Alt Text / Caption"
                                value={img.alt_text}
                                onChange={e => {
                                  const updated = [...location.gallery_images];
                                  updated[idx].alt_text = e.target.value;
                                  setLocation({ ...location, gallery_images: updated });
                                }}
                                className="h-8 text-xs font-medium"
                              />
                              <Input
                                placeholder="Photo URL path"
                                value={img.image_url}
                                onChange={e => {
                                  const updated = [...location.gallery_images];
                                  updated[idx].image_url = e.target.value;
                                  setLocation({ ...location, gallery_images: updated });
                                }}
                                className="h-7 text-[10px] font-mono text-muted-foreground"
                              />
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                              <Label htmlFor={`is-360-${idx}`} className="text-[11px] text-muted-foreground cursor-pointer">
                                360° View
                              </Label>
                              <Switch
                                id={`is-360-${idx}`}
                                checked={Boolean(img.is_360)}
                                onCheckedChange={checked => {
                                  const updated = [...location.gallery_images];
                                  updated[idx].is_360 = checked;
                                  setLocation({ ...location, gallery_images: updated });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* SECTION 4: HIGHLIGHTS & VISITOR PRACTICAL INFO WITH AI BUTTONS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Key Highlights */}
                <Card className="border-border shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <div>
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Highlights ({location.highlights.length})
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAiGenerate('highlights')}
                        disabled={isGenerating}
                        className="h-8 text-[11px] text-primary gap-1 px-2 hover:bg-primary/10"
                      >
                        <Sparkles className="h-3 w-3" /> AI Suggest
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={addHighlight} className="gap-1 text-xs h-8">
                        <Plus className="h-3.5 w-3.5" /> Add
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {location.highlights.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-2.5 bg-background-alt rounded-lg border border-border text-xs">
                        <div className="w-24 shrink-0">
                          <Select
                            value={item.icon}
                            onValueChange={val => {
                              const updated = [...location.highlights];
                              updated[idx].icon = val;
                              setLocation({ ...location, highlights: updated });
                            }}
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
                        <div className="flex-1 space-y-1">
                          <Input
                            placeholder="Title (e.g. Endemic Birds)"
                            value={item.title}
                            onChange={e => {
                              const updated = [...location.highlights];
                              updated[idx].title = e.target.value;
                              setLocation({ ...location, highlights: updated });
                            }}
                            className="h-8 text-xs font-medium"
                          />
                          <Input
                            placeholder="Description..."
                            value={item.description}
                            onChange={e => {
                              const updated = [...location.highlights];
                              updated[idx].description = e.target.value;
                              setLocation({ ...location, highlights: updated });
                            }}
                            className="h-7 text-[11px] text-muted-foreground"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                          onClick={() => removeHighlight(idx)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Visitor Info */}
                <Card className="border-border shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <div>
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <Layers className="h-4 w-4 text-primary" />
                        Visitor Info ({location.visitor_info.length})
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAiGenerate('visitor_info')}
                        disabled={isGenerating}
                        className="h-8 text-[11px] text-primary gap-1 px-2 hover:bg-primary/10"
                      >
                        <Sparkles className="h-3 w-3" /> AI Suggest
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={addVisitorInfo} className="gap-1 text-xs h-8">
                        <Plus className="h-3.5 w-3.5" /> Add
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {location.visitor_info.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-2.5 bg-background-alt rounded-lg border border-border text-xs">
                        <div className="w-24 shrink-0">
                          <Select
                            value={item.icon}
                            onValueChange={val => {
                              const updated = [...location.visitor_info];
                              updated[idx].icon = val;
                              setLocation({ ...location, visitor_info: updated });
                            }}
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
                        <div className="flex-1 space-y-1">
                          <Input
                            placeholder="Title (e.g. Best Season)"
                            value={item.title}
                            onChange={e => {
                              const updated = [...location.visitor_info];
                              updated[idx].title = e.target.value;
                              setLocation({ ...location, visitor_info: updated });
                            }}
                            className="h-8 text-xs font-medium"
                          />
                          <div className="grid grid-cols-2 gap-1">
                            <Input
                              placeholder="Line 1"
                              value={item.line1}
                              onChange={e => {
                                const updated = [...location.visitor_info];
                                updated[idx].line1 = e.target.value;
                                setLocation({ ...location, visitor_info: updated });
                              }}
                              className="h-7 text-[11px]"
                            />
                            <Input
                              placeholder="Line 2"
                              value={item.line2}
                              onChange={e => {
                                const updated = [...location.visitor_info];
                                updated[idx].line2 = e.target.value;
                                setLocation({ ...location, visitor_info: updated });
                              }}
                              className="h-7 text-[11px]"
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                          onClick={() => removeVisitorInfo(idx)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* SECTION 5: MAP & NEARBY WITH EXACT GPS PINPOINT */}
              <Card className="border-border shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      Exact Map Location &amp; Nearby Excursions
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Set exact GPS pin coordinates or auto-locate with 1 click.
                    </CardDescription>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addNearby} className="gap-1 text-xs h-8">
                    <Plus className="h-3.5 w-3.5" /> Add Excursion
                  </Button>
                </CardHeader>
                <CardContent className="space-y-5">
                  
                  {/* Exact GPS Pinpoint Tool */}
                  <div className="p-4 bg-background-alt/60 rounded-xl border border-border space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                        <Compass className="h-3.5 w-3.5 text-primary" />
                        Exact Destination GPS Coordinates / Map Pin
                      </Label>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setIsMapPickerOpen(true)}
                          className="h-7 text-xs bg-primary/10 text-primary border-primary/40 hover:bg-primary hover:text-primary-foreground gap-1.5 font-semibold shadow-sm"
                        >
                          <MapPin className="h-3.5 w-3.5" />
                          Open Visual Map Picker (Click to Pin)
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            const query = location.title.trim() ? `${location.title}, Sri Lanka` : 'Ratnapura, Sri Lanka';
                            try {
                              const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
                              const data = await res.json();
                              if (data && data.length > 0) {
                                const lat = parseFloat(data[0].lat).toFixed(6);
                                const lon = parseFloat(data[0].lon).toFixed(6);
                                const generatedUrl = `https://maps.google.com/maps?q=${lat},${lon}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
                                setLocation(prev => ({ ...prev, map_embed_url: generatedUrl }));
                                toast({
                                  title: '📍 Exact GPS Located!',
                                  description: `Found coordinates: ${lat}, ${lon} (${data[0].display_name.split(',')[0]})`,
                                });
                              } else {
                                const fallbackUrl = `https://maps.google.com/maps?q=${encodeURIComponent(location.title + ', Ratnapura, Sri Lanka')}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
                                setLocation(prev => ({ ...prev, map_embed_url: fallbackUrl }));
                                toast({ title: '📍 Pin Set by Name', description: `Generated map pin for "${location.title}".` });
                              }
                            } catch (e) {
                              const fallbackUrl = `https://maps.google.com/maps?q=${encodeURIComponent(location.title + ', Ratnapura, Sri Lanka')}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
                              setLocation(prev => ({ ...prev, map_embed_url: fallbackUrl }));
                              toast({ title: '📍 Pin Set by Name', description: `Generated map pin for "${location.title}".` });
                            }
                          }}
                          className="h-7 text-xs text-muted-foreground hover:text-primary gap-1"
                        >
                          <Sparkles className="h-3 w-3" />
                          Auto-Locate
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                      <div className="md:col-span-8 space-y-1.5">
                        <Input
                          id="map_embed_url"
                          placeholder="Paste Google Maps URL, or type coordinates (e.g. 6.8291, 80.6033)"
                          value={location.map_embed_url}
                          onChange={e => {
                            let val = e.target.value;
                            const coordMatch = val.match(/^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/);
                            if (coordMatch) {
                              val = `https://maps.google.com/maps?q=${coordMatch[1]},${coordMatch[3]}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
                            }
                            setLocation({ ...location, map_embed_url: val });
                          }}
                          className="h-8 text-xs font-mono"
                        />
                        <span className="text-[10px] text-muted-foreground block">
                          Tip: Click <strong>&quot;Open Visual Map Picker&quot;</strong> above to search, click, or drag the pin anywhere on a full map!
                        </span>
                      </div>

                      {/* Live Mini Map Pin Preview with Click-to-Open */}
                      <div 
                        onClick={() => setIsMapPickerOpen(true)}
                        className="md:col-span-4 h-24 rounded-lg overflow-hidden border border-border hover:border-primary/60 bg-black/40 relative cursor-pointer group shadow-sm"
                        title="Click to open interactive map picker"
                      >
                        {location.map_embed_url ? (
                          <iframe
                            src={location.map_embed_url}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            loading="lazy"
                            className="w-full h-full pointer-events-none"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-[10px] text-muted-foreground">
                            <MapPin className="h-4 w-4 text-primary mb-1" />
                            <span>Click to Set Pin</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[11px] text-white font-medium gap-1 backdrop-blur-xs">
                          <MapPin className="h-3.5 w-3.5 text-primary" /> Click to Pick Pin
                        </div>
                        <Badge className="absolute bottom-1 right-1 bg-black/80 text-primary border-primary/30 text-[9px] px-1.5 py-0.5">
                          Live Pin
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-foreground">Connected Nearby Attractions</Label>
                  </div>

                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {location.nearby_attractions.map((place, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-2.5 bg-background-alt rounded-lg border border-border text-xs">
                        <div className="w-24 shrink-0">
                          <Select
                            value={place.icon || 'MapPin'}
                            onValueChange={val => {
                              const updated = [...location.nearby_attractions];
                              updated[idx].icon = val;
                              setLocation({ ...location, nearby_attractions: updated });
                            }}
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

                        {/* Destination Picker / Name */}
                        <div className="flex-1 flex items-center gap-1.5 w-full sm:w-auto">
                          <Input
                            placeholder="Destination Name (e.g. Sinharaja Rainforest)"
                            value={place.name}
                            onChange={e => {
                              const updated = [...location.nearby_attractions];
                              updated[idx].name = e.target.value;
                              setLocation({ ...location, nearby_attractions: updated });
                            }}
                            className="h-8 text-xs font-medium flex-1"
                          />
                          {availableLocations.length > 0 && (
                            <Select
                              onValueChange={val => {
                                const selected = availableLocations.find(l => l.slug === val);
                                if (selected) {
                                  const updated = [...location.nearby_attractions];
                                  updated[idx].name = selected.title;
                                  setLocation({ ...location, nearby_attractions: updated });
                                }
                              }}
                            >
                              <SelectTrigger className="h-8 w-28 text-[11px] shrink-0 text-muted-foreground">
                                <span>Quick Pick</span>
                              </SelectTrigger>
                              <SelectContent>
                                {availableLocations
                                  .filter(l => l.slug !== slug)
                                  .map(loc => (
                                    <SelectItem key={loc.slug} value={loc.slug} className="text-xs">
                                      {loc.title}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>

                        {/* Distance Field */}
                        <div className="w-full sm:w-32 shrink-0">
                          <Input
                            placeholder="Distance (15 km)"
                            value={place.distance}
                            onChange={e => {
                              const updated = [...location.nearby_attractions];
                              updated[idx].distance = e.target.value;
                              setLocation({ ...location, nearby_attractions: updated });
                            }}
                            className="h-8 text-xs"
                          />
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                          onClick={() => removeNearby(idx)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

            </TabsContent>

            {/* TAB 2: RAW JSON STUDIO */}
            <TabsContent value="json" className="space-y-4 mt-0">
              <Card className="border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Code className="h-4 w-4 text-primary" />
                    Structured Destination JSON
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Inspect, copy, or batch-update the complete JSON document directly.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {jsonError && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded text-rose-400 text-xs font-mono">
                      Syntax Error: {jsonError}
                    </div>
                  )}
                  <Textarea
                    rows={26}
                    value={jsonString}
                    onChange={e => {
                      setJsonString(e.target.value);
                      try {
                        JSON.parse(e.target.value);
                        setJsonError(null);
                      } catch (err) {
                        setJsonError((err as Error).message);
                      }
                    }}
                    className="font-mono text-xs bg-black/80 text-emerald-400 border-border leading-relaxed"
                    spellCheck={false}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: STICKY SEO CONTROL CENTER WITH AI (4 COLS) */}
        {/* ======================================================== */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
          
          {/* CARD 1: REAL-TIME SEO OPTIMIZER */}
          <Card className="border-primary/40 shadow-md bg-card">
            <CardHeader className="pb-3 border-b border-border/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base font-bold text-foreground">SEO Optimizer</CardTitle>
                </div>
                <Badge className={`text-xs font-bold ${seoScore >= 80 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-amber-500/20 text-amber-400 border-amber-500/40'}`}>
                  {seoScore}% Score
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Live Google Search indexing health &amp; rich snippet optimization.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5 pt-4">
              
              {/* Progress Gauge */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-muted-foreground">Search Engine Readiness</span>
                  <span className="text-primary font-bold">{seoScore} / 100</span>
                </div>
                <Progress value={seoScore} className="h-2 bg-background-alt" />
              </div>

              {/* SERP Preview with Device Toggle */}
              <div className="p-3 bg-background-alt rounded-xl border border-border space-y-2">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Google SERP Preview
                  </span>
                  <div className="flex items-center gap-1 bg-background p-0.5 rounded border border-border">
                    <button
                      type="button"
                      onClick={() => setSerpView('desktop')}
                      className={`p-1 rounded text-xs ${serpView === 'desktop' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                      title="Desktop View"
                    >
                      <Monitor className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSerpView('mobile')}
                      className={`p-1 rounded text-xs ${serpView === 'mobile' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                      title="Mobile View"
                    >
                      <Smartphone className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] text-emerald-400 truncate flex items-center gap-1 font-mono">
                    <span>https://sapphiretrails.lk › explore › {slug}</span>
                  </div>
                  <div className="text-sm font-semibold text-blue-400 hover:underline cursor-pointer line-clamp-1">
                    {location.meta_title || location.title || 'Location Title'}
                  </div>
                  <div className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {location.meta_description || location.card_description || 'Add compelling meta description to increase organic click-through rates.'}
                  </div>
                </div>
              </div>

              {/* SEO Inputs with AI Button */}
              <div className="space-y-3 pt-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-foreground">Meta Tags Configuration</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAiGenerate('seo')}
                    disabled={isGenerating}
                    className="h-6 text-[11px] text-primary gap-1 px-2 hover:bg-primary/10"
                  >
                    <Sparkles className="h-3 w-3" /> Auto-Optimize SEO
                  </Button>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <Label htmlFor="seo-meta-title">Meta Title</Label>
                    <span className={`text-[10px] ${(location.meta_title || '').length > 60 ? 'text-amber-400 font-bold' : 'text-muted-foreground'}`}>
                      {(location.meta_title || '').length} / 60
                    </span>
                  </div>
                  <Input
                    id="seo-meta-title"
                    value={location.meta_title}
                    onChange={e => setLocation({ ...location, meta_title: e.target.value })}
                    placeholder="SEO Title for Google"
                    className="h-8 text-xs font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="seo-keywords" className="text-xs">Target Focus Keywords</Label>
                  <Input
                    id="seo-keywords"
                    value={location.meta_keywords}
                    onChange={e => setLocation({ ...location, meta_keywords: e.target.value })}
                    placeholder="e.g. Bopath Ella, Ratnapura waterfall tour"
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <Label htmlFor="seo-meta-desc">Meta Description</Label>
                    <span className={`text-[10px] ${(location.meta_description || '').length > 160 ? 'text-amber-400 font-bold' : 'text-muted-foreground'}`}>
                      {(location.meta_description || '').length} / 160
                    </span>
                  </div>
                  <Textarea
                    id="seo-meta-desc"
                    rows={3}
                    value={location.meta_description}
                    onChange={e => setLocation({ ...location, meta_description: e.target.value })}
                    placeholder="Actionable meta description with keywords..."
                    className="text-xs leading-relaxed"
                  />
                </div>
              </div>

              {/* SEO Checklist */}
              <div className="space-y-1.5 pt-2 border-t border-border/60 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Schema.org TouristAttraction JSON-LD</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>OpenGraph &amp; Twitter Cards Ready</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>BreadcrumbList Search Markup</span>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* CARD 2: QUICK PUBLISH ACTION */}
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
                <span className="font-mono text-foreground">/explore/{slug}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Total Photos</span>
                <span className="font-semibold">{location.gallery_images.length + (location.card_image_url ? 1 : 0)} Assets</span>
              </div>

              <Button
                onClick={handleSaveLocation}
                disabled={isSaving}
                className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold mt-2 shadow"
              >
                {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save &amp; Update Live Page
              </Button>
            </CardContent>
          </Card>

        </div>

      </div>

      {/* Visual Map Pin Picker Modal */}
      <InteractiveMapPickerDialog
        open={isMapPickerOpen}
        onOpenChange={setIsMapPickerOpen}
        locationTitle={location.title}
        onSelectCoordinates={(lat, lng, placeName) => {
          const generatedUrl = `https://maps.google.com/maps?q=${lat},${lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
          setLocation(prev => ({ ...prev, map_embed_url: generatedUrl }));
          toast({
            title: '📍 Map Pin Selected!',
            description: `Exact point set to ${lat}, ${lng}${placeName ? ` (${placeName})` : ''}.`,
          });
        }}
      />

    </div>
  );
}
