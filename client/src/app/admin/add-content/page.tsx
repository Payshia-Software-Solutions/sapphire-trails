'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
  Wand2,
  TreePine,
  Wheat,
  Landmark,
  Eye,
  AlertTriangle
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

const toSlug = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

export default function ProfessionalAddLocationPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'visual' | 'json'>('visual');
  const [serpView, setSerpView] = useState<'desktop' | 'mobile'>('desktop');
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
  const [existingSlugs, setExistingSlugs] = useState<string[]>([]);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Initial Location State
  const [location, setLocation] = useState<LocationState>({
    title: '',
    slug: '',
    subtitle: '',
    category: 'nature',
    card_description: '',
    card_image_url: '',
    card_image_hint: '',
    distance: '20 km from Ratnapura City Center',
    hero_image_url: '',
    hero_image_hint: '',
    intro_title: '',
    intro_description: '',
    intro_image_url: '',
    intro_image_hint: '',
    map_embed_url: '',
    highlights: [
      { icon: 'Gem', title: 'Geological Rarity', description: 'Renowned alluvial sapphire gravel and rare mineral formations.' },
      { icon: 'Mountain', title: 'Scenic Wilderness', description: 'Pristine rainforest canopy and panoramic mist-covered hill ranges.' }
    ],
    visitor_info: [
      { icon: 'Clock', title: 'Best Time to Visit', line1: 'Early Morning (7:00 AM - 11:00 AM)', line2: 'Clear atmospheric views & pleasant climate' },
      { icon: 'Ticket', title: 'Entry & Access', line1: 'Open Daily to Travelers', line2: 'Standard guided permit applicable' }
    ],
    nearby_attractions: [],
    gallery_images: [],
    meta_title: '',
    meta_description: '',
    meta_keywords: 'Ratnapura, Sri Lanka, Gem Exploration, Ceylon Sapphires, Attraction',
  });

  // Fetch Existing Destinations for validation and linking
  useEffect(() => {
    async function loadExisting() {
      try {
        const res = await fetch(`${API_BASE_URL}/locations`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setAvailableLocations(data.map((l: any) => ({ slug: l.slug, title: l.title })));
            setExistingSlugs(data.map((l: any) => l.slug.toLowerCase()));
          }
        }
      } catch (e) {
        console.error('Could not fetch destinations list', e);
      }
    }
    loadExisting();
  }, []);

  // Auto-generate slug when title changes (if user hasn't explicitly customized slug)
  const [isSlugTouched, setIsSlugTouched] = useState(false);
  const handleTitleChange = (newTitle: string) => {
    const autoSlug = toSlug(newTitle);
    setLocation(prev => ({
      ...prev,
      title: newTitle,
      slug: isSlugTouched ? prev.slug : autoSlug,
      meta_title: prev.meta_title ? prev.meta_title : `${newTitle} | Ratnapura Gem Tour Attraction`,
    }));
  };

  const isDuplicateSlug = Boolean(location.slug && existingSlugs.includes(location.slug.toLowerCase()));

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

  // AI Content Generator Engine
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
        toast({ title: '✨ Highlights Generated', description: 'Populated curated feature highlights.' });
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
        toast({ title: '✨ SEO Meta Optimized', description: 'Generated title, description & keywords.' });
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
    formData.append('location_slug', location.slug || 'new-location');
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
        description: `${type.toUpperCase()} image attached.`,
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
        description: `Successfully uploaded ${successCount} photos.`,
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

  // Save / Publish New Location
  const handleSaveLocation = async () => {
    if (!location.title.trim()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Destination title is required.',
      });
      return;
    }

    if (!location.slug.trim()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'URL slug is required.',
      });
      return;
    }

    if (isDuplicateSlug) {
      toast({
        variant: 'destructive',
        title: 'Duplicate Slug Error',
        description: `The URL slug "${location.slug}" is already in use by another destination. Please choose a unique slug.`,
      });
      return;
    }

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
      const res = await authFetch(`${API_BASE_URL}/locations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create new location');
      }

      toast({
        title: '🎉 Destination Published Successfully!',
        description: `"${payload.title}" is now live on Sapphire Trails.`,
      });
      router.push('/admin/manage-content');
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: err instanceof Error ? err.message : 'Could not publish location.',
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

  return (
    <div className="w-full px-2 sm:px-4 lg:px-6 py-4 space-y-6 pb-24">
      
      {/* TOP EXECUTIVE HEADER BAR */}
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
                {location.title || 'Create New Destination'}
              </h1>
              {location.slug && (
                <Badge variant="outline" className="font-mono text-xs bg-background-alt text-primary border-primary/30">
                  /{location.slug}
                </Badge>
              )}
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                New Draft
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
            onClick={handleSaveLocation}
            disabled={isSaving || isDuplicateSlug}
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 shadow-lg shadow-primary/20 text-xs h-10"
          >
            {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Publish Destination <span className="hidden sm:inline text-[11px] opacity-75 font-normal">(Ctrl+S)</span>
          </Button>
        </div>
      </div>

      {/* 12-COLUMN STUDIO WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: MAIN CONTENT & MEDIA (8 COLS) */}
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
                    Primary destination name, URL slug, category classification, and explore card summary.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5 md:col-span-2">
                      <Label htmlFor="title" className="text-xs font-semibold">Destination Title *</Label>
                      <Input
                        id="title"
                        value={location.title}
                        onChange={e => handleTitleChange(e.target.value)}
                        placeholder="e.g. Bopath Ella Falls"
                        className="font-medium h-10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="category" className="text-xs font-semibold">Classification Category</Label>
                      <Select
                        value={location.category}
                        onValueChange={val => setLocation({ ...location, category: val })}
                      >
                        <SelectTrigger id="category" className="h-10">
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

                  {/* Slug Input with real-time duplicate validation */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="slug" className="text-xs font-semibold">URL Slug (Auto-generated) *</Label>
                      {isDuplicateSlug && (
                        <span className="text-[11px] text-destructive font-semibold flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> Slug already exists!
                        </span>
                      )}
                    </div>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-xs text-muted-foreground font-mono">/explore-ratnapura/</span>
                      <Input
                        id="slug"
                        value={location.slug}
                        onChange={e => {
                          setIsSlugTouched(true);
                          setLocation({ ...location, slug: toSlug(e.target.value) });
                        }}
                        placeholder="bopath-ella-falls"
                        className={`pl-36 font-mono text-xs h-10 ${isDuplicateSlug ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                      />
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
                          className="h-10"
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
                            <Sparkles className="h-3 w-3" /> AI Summary
                          </Button>
                        </div>
                        <Textarea
                          id="card_description"
                          rows={3}
                          value={location.card_description}
                          onChange={e => setLocation({ ...location, card_description: e.target.value })}
                          placeholder="A picturesque bo-leaf shaped cascade offering refreshing waters and scenic rainforest views..."
                          className="text-xs leading-relaxed"
                        />
                      </div>
                    </div>

                    {/* Listing Card Image Upload */}
                    <div className="md:col-span-4 space-y-2">
                      <Label className="text-xs font-semibold">Homepage Card Thumbnail</Label>
                      <div className="relative group border-2 border-dashed border-border hover:border-primary/60 rounded-xl overflow-hidden bg-background-alt aspect-[4/3] flex flex-col items-center justify-center text-center">
                        {location.card_image_url ? (
                          <>
                            <img 
                              src={getFullImageUrl(location.card_image_url)} 
                              alt="Card Preview"
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
                                  onChange={e => e.target.files?.[0] && handleSingleImageUpload(e.target.files[0], 'card')} 
                                />
                              </label>
                            </div>
                          </>
                        ) : (
                          <label className="cursor-pointer flex flex-col items-center justify-center p-4 text-muted-foreground hover:text-primary">
                            <Upload className="h-5 w-5 text-primary mb-1" />
                            <span className="text-xs font-semibold">Upload Card Photo</span>
                            <span className="text-[10px] text-muted-foreground">800x600 recommended</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={e => e.target.files?.[0] && handleSingleImageUpload(e.target.files[0], 'card')} 
                            />
                          </label>
                        )}
                        {uploadingCard && (
                          <div className="absolute inset-0 bg-black/80 flex items-center justify-center gap-2 text-white z-10">
                            <LoaderCircle className="h-5 w-5 animate-spin text-primary" />
                          </div>
                        )}
                      </div>
                      <Input
                        placeholder="Card Image URL"
                        value={location.card_image_url}
                        onChange={e => setLocation({ ...location, card_image_url: e.target.value })}
                        className="h-7 text-[11px] font-mono"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* SECTION 2: HERO & EDITORIAL STORYTELLING */}
              <Card className="border-border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" />
                    Hero Presentation &amp; Narrative Story
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Full-width hero cover photo, evocative subtitle tagline, and immersive editorial storytelling.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Hero Cover Upload Slot */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold">Hero Banner Cover Visual (1920x800)</Label>
                    </div>
                    <div className="relative group border-2 border-dashed border-border hover:border-primary/60 rounded-xl overflow-hidden bg-background-alt h-44 flex flex-col items-center justify-center text-center">
                      {location.hero_image_url ? (
                        <>
                          <img 
                            src={getFullImageUrl(location.hero_image_url)} 
                            alt="Hero Cover"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <label className="cursor-pointer bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-md font-medium shadow flex items-center gap-1.5">
                              <Upload className="h-3.5 w-3.5" /> Replace Hero Banner
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
                        <label className="cursor-pointer flex flex-col items-center justify-center p-4 text-muted-foreground hover:text-primary">
                          <Upload className="h-6 w-6 text-primary mb-1" />
                          <span className="text-xs font-semibold">Upload Full Hero Cover Image</span>
                          <span className="text-[10px] text-muted-foreground">High-resolution landscape banner</span>
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
                          <LoaderCircle className="h-5 w-5 animate-spin text-primary" />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="subtitle" className="text-xs">Subtitle Tagline</Label>
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
                          className="h-9 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="hero_image_url" className="text-xs">Hero Image URL</Label>
                        <Input
                          id="hero_image_url"
                          value={location.hero_image_url}
                          onChange={e => setLocation({ ...location, hero_image_url: e.target.value })}
                          placeholder="/location-images/..."
                          className="font-mono text-xs h-9"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Intro Narrative */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start pt-2 border-t border-border/70">
                    <div className="md:col-span-8 space-y-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="intro_title" className="text-xs font-semibold">Intro Headline</Label>
                        <Input
                          id="intro_title"
                          value={location.intro_title}
                          onChange={e => setLocation({ ...location, intro_title: e.target.value })}
                          placeholder="e.g. A Natural Masterpiece of Cascading Waters"
                          className="h-9 text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="intro_description" className="text-xs font-semibold">Editorial Storytelling Narrative</Label>
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
                          className="text-xs leading-relaxed"
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
                      Upload multiple high-res destination photos, 360° panoramas, and SEO image alt tags.
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

                  {location.gallery_images.length > 0 && (
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
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <button
                              type="button"
                              onClick={() => removeGalleryImage(idx)}
                              className="absolute top-2 right-2 h-7 w-7 rounded-full bg-destructive/90 text-white flex items-center justify-center hover:bg-destructive shadow opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Delete photo"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                            {Boolean(img.is_360) && (
                              <Badge className="absolute bottom-2 left-2 bg-primary/90 text-primary-foreground text-[10px]">
                                360° Panorama
                              </Badge>
                            )}
                          </div>

                          <div className="p-2.5 space-y-2 text-xs">
                            <Input
                              placeholder="SEO Alt Tag"
                              value={img.alt_text}
                              onChange={e => {
                                const val = e.target.value;
                                setLocation(prev => ({
                                  ...prev,
                                  gallery_images: prev.gallery_images.map((item, i) => i === idx ? { ...item, alt_text: val } : item)
                                }));
                              }}
                              className="h-7 text-[11px]"
                            />
                            <div className="flex items-center justify-between pt-1">
                              <span className="text-[11px] text-muted-foreground">360° Viewer:</span>
                              <Switch
                                checked={Boolean(img.is_360)}
                                onCheckedChange={checked => {
                                  setLocation(prev => ({
                                    ...prev,
                                    gallery_images: prev.gallery_images.map((item, i) => i === idx ? { ...item, is_360: checked } : item)
                                  }));
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

              {/* SECTION 4: KEY HIGHLIGHTS STUDIO */}
              <Card className="border-border shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <div>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Key Destination Highlights
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Curated distinctive attributes, historical facets, and biodiversity.
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAiGenerate('highlights')}
                      disabled={isGenerating}
                      className="h-8 text-xs text-primary gap-1 px-2.5 hover:bg-primary/10"
                    >
                      <Sparkles className="h-3.5 w-3.5" /> AI Generate
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addHighlight}
                      className="gap-1 text-xs h-8 border-primary/40 text-primary"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Item
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {location.highlights.map((hl, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-background-alt border border-border/80 flex items-start gap-3 group">
                      <div className="w-28 space-y-1 shrink-0">
                        <Label className="text-[10px] text-muted-foreground uppercase font-bold">Icon</Label>
                        <Select
                          value={hl.icon || 'Gem'}
                          onValueChange={val => {
                            setLocation(prev => ({
                              ...prev,
                              highlights: prev.highlights.map((item, i) => i === idx ? { ...item, icon: val } : item)
                            }));
                          }}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ICON_OPTIONS.map(icon => (
                              <SelectItem key={icon} value={icon} className="text-xs">{icon}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex-1 space-y-2">
                        <Input
                          placeholder="Highlight Title (e.g. Alluvial Gem Deposits)"
                          value={hl.title}
                          onChange={e => {
                            const val = e.target.value;
                            setLocation(prev => ({
                              ...prev,
                              highlights: prev.highlights.map((item, i) => i === idx ? { ...item, title: val } : item)
                            }));
                          }}
                          className="h-8 text-xs font-semibold"
                        />
                        <Textarea
                          placeholder="Description of the feature..."
                          rows={2}
                          value={hl.description}
                          onChange={e => {
                            const val = e.target.value;
                            setLocation(prev => ({
                              ...prev,
                              highlights: prev.highlights.map((item, i) => i === idx ? { ...item, description: val } : item)
                            }));
                          }}
                          className="text-xs"
                        />
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeHighlight(idx)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 mt-5"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* SECTION 5: VISITOR INFORMATION STUDIO */}
              <Card className="border-border shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <div>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Compass className="h-4 w-4 text-primary" />
                      Visitor Travel Guide &amp; Essentials
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Essential practical travel logistics: opening times, fees, altitude, attire, safety.
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAiGenerate('visitor_info')}
                      disabled={isGenerating}
                      className="h-8 text-xs text-primary gap-1 px-2.5 hover:bg-primary/10"
                    >
                      <Sparkles className="h-3.5 w-3.5" /> AI Generate
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addVisitorInfo}
                      className="gap-1 text-xs h-8 border-primary/40 text-primary"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Info Row
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {location.visitor_info.map((info, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-background-alt border border-border/80 flex items-start gap-3">
                      <div className="w-28 space-y-1 shrink-0">
                        <Label className="text-[10px] text-muted-foreground uppercase font-bold">Icon</Label>
                        <Select
                          value={info.icon || 'Clock'}
                          onValueChange={val => {
                            setLocation(prev => ({
                              ...prev,
                              visitor_info: prev.visitor_info.map((item, i) => i === idx ? { ...item, icon: val } : item)
                            }));
                          }}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ICON_OPTIONS.map(icon => (
                              <SelectItem key={icon} value={icon} className="text-xs">{icon}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex-1 space-y-2">
                        <Input
                          placeholder="Header (e.g. Opening Hours)"
                          value={info.title}
                          onChange={e => {
                            const val = e.target.value;
                            setLocation(prev => ({
                              ...prev,
                              visitor_info: prev.visitor_info.map((item, i) => i === idx ? { ...item, title: val } : item)
                            }));
                          }}
                          className="h-8 text-xs font-semibold"
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <Input
                            placeholder="Primary line (e.g. 06:00 AM - 06:00 PM)"
                            value={info.line1}
                            onChange={e => {
                              const val = e.target.value;
                              setLocation(prev => ({
                                ...prev,
                                visitor_info: prev.visitor_info.map((item, i) => i === idx ? { ...item, line1: val } : item)
                              }));
                            }}
                            className="h-8 text-xs"
                          />
                          <Input
                            placeholder="Secondary note (e.g. Open daily)"
                            value={info.line2}
                            onChange={e => {
                              const val = e.target.value;
                              setLocation(prev => ({
                                ...prev,
                                visitor_info: prev.visitor_info.map((item, i) => i === idx ? { ...item, line2: val } : item)
                              }));
                            }}
                            className="h-8 text-xs text-muted-foreground"
                          />
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeVisitorInfo(idx)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 mt-5"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* SECTION 6: INTERACTIVE MAP & NEARBY EXCURSIONS */}
              <Card className="border-border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Interactive Map &amp; Nearby Excursions
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Pin accurate Google Maps GPS coordinates and connect neighboring Ratnapura attractions.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="map_embed_url" className="text-xs">Google Maps Embed URL</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsMapPickerOpen(true)}
                        className="gap-1.5 text-xs h-7 border-primary/40 text-primary hover:bg-primary/10"
                      >
                        <MapPin className="h-3 w-3" /> Interactive Map Picker
                      </Button>
                    </div>
                    <Input
                      id="map_embed_url"
                      value={location.map_embed_url}
                      onChange={e => setLocation({ ...location, map_embed_url: e.target.value })}
                      placeholder="https://www.google.com/maps/embed?pb=..."
                      className="font-mono text-xs h-9"
                    />
                  </div>

                  {/* Nearby Attractions */}
                  <div className="space-y-2.5 pt-2 border-t border-border/70">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold">Nearby Interlinked Attractions</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={addNearby}
                        className="h-7 text-xs text-primary gap-1 px-2"
                      >
                        <Plus className="h-3 w-3" /> Add Neighboring Spot
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {location.nearby_attractions.map((nb, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-2.5 rounded-lg bg-background-alt border border-border/70">
                          <MapPin className="h-4 w-4 text-primary shrink-0" />
                          <Input
                            placeholder="Destination Name"
                            value={nb.name}
                            onChange={e => {
                              const val = e.target.value;
                              setLocation(prev => ({
                                ...prev,
                                nearby_attractions: prev.nearby_attractions.map((item, i) => i === idx ? { ...item, name: val } : item)
                              }));
                            }}
                            className="h-8 text-xs flex-1"
                          />
                          <Input
                            placeholder="Distance (e.g. 8 km / 15 mins)"
                            value={nb.distance}
                            onChange={e => {
                              const val = e.target.value;
                              setLocation(prev => ({
                                ...prev,
                                nearby_attractions: prev.nearby_attractions.map((item, i) => i === idx ? { ...item, distance: val } : item)
                              }));
                            }}
                            className="h-8 text-xs w-48"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeNearby(idx)}
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* SECTION 7: SEARCH ENGINE OPTIMIZATION (SEO) */}
              <Card className="border-border shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <Globe className="h-4 w-4 text-primary" />
                        Search Engine Optimization (SEO)
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Configure Google indexation tags, meta title, and keywords.
                      </CardDescription>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAiGenerate('seo')}
                      disabled={isGenerating}
                      className="h-7 text-xs text-primary gap-1 px-2"
                    >
                      <Sparkles className="h-3 w-3" /> Auto-Optimize SEO
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="meta_title" className="text-xs font-semibold">Meta Page Title</Label>
                      <span className={`text-[10px] ${(location.meta_title || '').length > 60 ? 'text-amber-400' : 'text-muted-foreground'}`}>
                        {(location.meta_title || '').length}/60 chars
                      </span>
                    </div>
                    <Input
                      id="meta_title"
                      value={location.meta_title}
                      onChange={e => setLocation({ ...location, meta_title: e.target.value })}
                      placeholder="Bopath Ella Falls | Ratnapura Gem Tour Attraction"
                      className="text-xs h-9"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="meta_description" className="text-xs font-semibold">Meta Description</Label>
                      <span className={`text-[10px] ${(location.meta_description || '').length > 160 ? 'text-amber-400' : 'text-muted-foreground'}`}>
                        {(location.meta_description || '').length}/160 chars
                      </span>
                    </div>
                    <Textarea
                      id="meta_description"
                      rows={2}
                      value={location.meta_description}
                      onChange={e => setLocation({ ...location, meta_description: e.target.value })}
                      placeholder="Discover Bopath Ella Falls in Ratnapura Sri Lanka. Explore cascading waters, gem history, visitor tips and guided luxury expeditions..."
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="meta_keywords" className="text-xs">Keywords (Comma Separated)</Label>
                    <Input
                      id="meta_keywords"
                      value={location.meta_keywords}
                      onChange={e => setLocation({ ...location, meta_keywords: e.target.value })}
                      placeholder="Ratnapura, Sri Lanka, Bopath Ella, Ceylon Sapphires, Gem Tour"
                      className="text-xs h-9"
                    />
                  </div>
                </CardContent>
              </Card>

            </TabsContent>

            {/* TAB 2: RAW JSON CODE INSPECTOR */}
            <TabsContent value="json" className="space-y-4 mt-0">
              <Card className="border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-mono flex items-center gap-2">
                        <Code className="h-4 w-4 text-primary" />
                        Location Schema Inspector
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Direct 2-way JSON binding. Edits made here immediately sync with Visual Studio.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {jsonError && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>{jsonError}</span>
                    </div>
                  )}
                  <Textarea
                    value={jsonString}
                    onChange={e => {
                      setJsonString(e.target.value);
                      try {
                        const parsed = JSON.parse(e.target.value);
                        setLocation(parsed);
                        setJsonError(null);
                      } catch (err) {
                        setJsonError((err as Error).message);
                      }
                    }}
                    rows={28}
                    className="font-mono text-xs leading-relaxed bg-black/80 text-emerald-400 p-4 border-border rounded-xl"
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

        </div>

        {/* RIGHT COLUMN: REAL-TIME LIVE PREVIEW SIDEBAR (4 COLS) */}
        <div className="lg:col-span-4 space-y-6 sticky top-6">
          
          {/* 1. SEO & COMPLETION SCORE METER */}
          <Card className="border-border shadow-sm overflow-hidden bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Destination Studio Score
                </CardTitle>
                <span className={`text-sm font-extrabold ${seoScore >= 80 ? 'text-emerald-400' : seoScore >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                  {seoScore}%
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <Progress value={seoScore} className="h-2 bg-background-alt" />
              <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className={`h-3 w-3 ${location.title ? 'text-emerald-400' : 'text-muted-foreground/40'}`} />
                  <span>Title &amp; Slug</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className={`h-3 w-3 ${location.card_image_url ? 'text-emerald-400' : 'text-muted-foreground/40'}`} />
                  <span>Media Visuals</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className={`h-3 w-3 ${location.highlights.length > 0 ? 'text-emerald-400' : 'text-muted-foreground/40'}`} />
                  <span>Highlights ({location.highlights.length})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className={`h-3 w-3 ${(location.meta_title || '').length > 20 ? 'text-emerald-400' : 'text-muted-foreground/40'}`} />
                  <span>SEO Ready</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. REAL-TIME LIVE DESTINATION CARD PREVIEW */}
          <Card className="border-border shadow-md overflow-hidden bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5 text-primary" />
                Live Explore Card Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-lg group">
                <div className="relative h-44 w-full overflow-hidden bg-black/40">
                  <img
                    src={getFullImageUrl(location.card_image_url || location.hero_image_url)}
                    alt={location.title || 'Location'}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Category Badge */}
                  <Badge className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-md text-white border-white/20 text-[10px] capitalize">
                    {location.category === 'nature' && <TreePine className="h-3 w-3 mr-1 text-emerald-400 inline" />}
                    {location.category === 'agriculture' && <Wheat className="h-3 w-3 mr-1 text-amber-400 inline" />}
                    {location.category === 'cultural' && <Landmark className="h-3 w-3 mr-1 text-blue-400 inline" />}
                    {location.category}
                  </Badge>

                  {/* Distance */}
                  {location.distance && (
                    <span className="absolute bottom-2.5 left-2.5 text-[11px] font-medium text-white/90 flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-primary" />
                      {location.distance}
                    </span>
                  )}
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="font-headline font-bold text-base text-foreground group-hover:text-primary transition-colors">
                    {location.title || 'Your Destination Title'}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {location.card_description || 'Summary teaser description for the explore listing card...'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. GOOGLE SERP SEARCH SNIPPET SIMULATOR */}
          <Card className="border-border shadow-sm overflow-hidden bg-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-primary" />
                  Google SERP Simulator
                </CardTitle>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setSerpView('desktop')}
                    className={`p-1 rounded ${serpView === 'desktop' ? 'bg-primary/20 text-primary' : 'text-muted-foreground'}`}
                    title="Desktop Preview"
                  >
                    <Monitor className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSerpView('mobile')}
                    className={`p-1 rounded ${serpView === 'mobile' ? 'bg-primary/20 text-primary' : 'text-muted-foreground'}`}
                    title="Mobile Preview"
                  >
                    <Smartphone className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3">
              <div className="p-3.5 rounded-xl bg-background border border-border/70 space-y-1 text-left">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground truncate">
                  <Globe className="h-3 w-3 text-emerald-500 shrink-0" />
                  <span>https://sapphiretrails.com › explore-ratnapura › {location.slug || 'destination'}</span>
                </div>
                <h4 className="text-xs font-semibold text-blue-500 dark:text-blue-400 hover:underline cursor-pointer truncate">
                  {location.meta_title || `${location.title || 'Destination'} | Ratnapura Gem Tour Attraction`}
                </h4>
                <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                  {location.meta_description || location.card_description || 'Experience the authentic treasures of Ratnapura with bespoke guided mining itineraries and cultural landmarks...'}
                </p>
              </div>
            </CardContent>
          </Card>

        </div>

      </div>

      {/* Interactive Map Picker Dialog */}
      <InteractiveMapPickerDialog
        isOpen={isMapPickerOpen}
        onClose={() => setIsMapPickerOpen(false)}
        initialLocationName={location.title || 'Ratnapura, Sri Lanka'}
        onSelectEmbedUrl={(url) => {
          setLocation(prev => ({ ...prev, map_embed_url: url }));
          toast({
            title: 'Map Attached!',
            description: 'Google Maps embed link updated.',
          });
        }}
      />

    </div>
  );
}
