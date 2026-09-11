'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Megaphone, 
  Sparkles, 
  Save, 
  Upload, 
  LoaderCircle, 
  CheckCircle2, 
  Globe, 
  ExternalLink, 
  X, 
  Monitor, 
  Smartphone, 
  Sliders, 
  Clock, 
  Layers, 
  Compass, 
  Check, 
  Palette,
  Image as ImageIcon
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

import { 
  fetchSiteContent, 
  saveSiteContent, 
  uploadCmsImage, 
  defaultSiteContent, 
  defaultFeaturedBanner,
  type SiteContentData,
  type FeaturedBannerConfig,
  type BannerTemplate
} from '@/lib/site-content';

export default function AdminPromoBannerPage() {
  const { toast } = useToast();
  const [content, setContent] = useState<SiteContentData>(defaultSiteContent);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const bannerImageFileRef = useRef<HTMLInputElement>(null);

  // Fetch site content on mount
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const data = await fetchSiteContent();
        if (mounted) {
          setContent(data);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to load site content for banner:', err);
        if (mounted) {
          setIsLoading(false);
        }
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  // Safe banner accessor
  const banner: FeaturedBannerConfig = {
    ...defaultFeaturedBanner,
    ...(content.settings?.banner || {}),
  };

  const updateBanner = (patch: Partial<FeaturedBannerConfig>) => {
    setContent((prev) => {
      const currentSettings = prev.settings || {};
      const currentBanner = currentSettings.banner || defaultFeaturedBanner;
      return {
        ...prev,
        settings: {
          ...currentSettings,
          banner: {
            ...currentBanner,
            ...patch,
          },
        },
      };
    });
    setHasUnsavedChanges(true);
  };

  const handleBannerImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      toast({
        title: 'Uploading to CDN...',
        description: 'Transmitting photo to Payshia high-speed asset vault.',
      });

      const res = await uploadCmsImage(file, 'banner');
      if (res.success && res.url) {
        updateBanner({ image: res.url });
        toast({
          title: 'Image Uploaded Successfully',
          description: 'Banner visual updated and linked to CDN.',
        });
      }
    } catch (err: any) {
      toast({
        title: 'Upload Failed',
        description: err.message || 'Could not upload image to server.',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingImage(false);
      if (bannerImageFileRef.current) {
        bannerImageFileRef.current.value = '';
      }
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const res = await saveSiteContent(content);
      if (res.success) {
        setHasUnsavedChanges(false);
        toast({
          title: 'Banner Published Successfully',
          description: 'Your promotional banner configuration is now live on the website.',
        });
      } else {
        throw new Error(res.message || 'Save failed');
      }
    } catch (err: any) {
      toast({
        title: 'Error Saving Banner',
        description: err.message || 'An error occurred while saving banner settings.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const luxuryTemplates: Array<{
    id: BannerTemplate;
    name: string;
    description: string;
    cardBorder: string;
    cardBg: string;
    badgeStyle: string;
    btnStyle: string;
  }> = [
    {
      id: 'luxury_gold',
      name: 'Royal Atelier (Signature Gold)',
      description: 'Cinematic onyx slate, gilded micro-borders, and radiant gold typography.',
      cardBorder: 'border-[#D4AF37]/50',
      cardBg: 'bg-[#0B0F15] text-white',
      badgeStyle: 'bg-[#D4AF37]/15 text-[#DEC49B] border border-[#D4AF37]/40',
      btnStyle: 'bg-[#D4AF37] text-[#0B0F15] hover:bg-[#E5C158]',
    },
    {
      id: 'sapphire_blue',
      name: 'Ceylon Sapphire Vault',
      description: 'Midnight royal blue depth with celestial sapphire glow and sky accent badges.',
      cardBorder: 'border-sky-500/40',
      cardBg: 'bg-gradient-to-br from-[#081426] to-[#02050A] text-white',
      badgeStyle: 'bg-sky-500/20 text-sky-300 border border-sky-400/30',
      btnStyle: 'bg-sky-500 text-white hover:bg-sky-400',
    },
    {
      id: 'minimal_editorial',
      name: 'Haute Editorial (Silk Ivory)',
      description: 'Prestigious Swiss horlogerie finish on silk ivory paper with dark serifs.',
      cardBorder: 'border-[#E2DDD3]',
      cardBg: 'bg-[#FBF9F5] text-[#14181E]',
      badgeStyle: 'bg-neutral-900/10 text-neutral-800 border border-neutral-300',
      btnStyle: 'bg-[#14181E] text-white hover:bg-black',
    },
    {
      id: 'image_spotlight',
      name: 'Expedition Full-Bleed Hero',
      description: 'Full-bleed immersive photography with cinematic bottom narrative.',
      cardBorder: 'border-white/30',
      cardBg: 'bg-[#090D12] text-white',
      badgeStyle: 'bg-primary text-primary-foreground',
      btnStyle: 'bg-primary text-primary-foreground hover:bg-primary/90',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground font-mono tracking-wider">LOADING BANNER STUDIO...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Megaphone className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-serif font-bold text-foreground tracking-tight">
              Featured Announcement & Promo Banner
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Configure the global pop-up announcement modal or sticky header bar across the Sapphire Trails website.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-9 rounded-xl text-xs gap-1.5 border-border/80"
          >
            <Link href="/" target="_blank">
              <Globe className="h-3.5 w-3.5" />
              <span>View Website</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </Link>
          </Button>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="h-9 px-5 rounded-xl text-xs font-semibold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
          >
            {isSaving ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{isSaving ? 'Publishing...' : 'Save Banner Settings'}</span>
          </Button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Form Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">

          {/* 1. Status & Display Mode */}
          <Card className="rounded-2xl border-border/80 shadow-xs">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-primary" />
                    Activation & Display Format
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Turn the banner on or off and choose how visitors experience it.
                  </CardDescription>
                </div>
                <Badge
                  variant={banner.enabled ? 'default' : 'outline'}
                  className={`text-[10px] tracking-wider uppercase font-mono ${
                    banner.enabled 
                      ? 'bg-emerald-600 hover:bg-emerald-600 text-white' 
                      : 'text-muted-foreground border-border'
                  }`}
                >
                  {banner.enabled ? 'Live on Site' : 'Disabled'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              {/* Enable Switch */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/60 bg-muted/30">
                <div className="space-y-0.5">
                  <Label className="text-xs font-bold text-foreground">Enable Featured Announcement</Label>
                  <p className="text-[11px] text-muted-foreground">
                    When active, visitors will see this banner based on the display format below.
                  </p>
                </div>
                <Switch
                  checked={banner.enabled}
                  onCheckedChange={(checked) => updateBanner({ enabled: checked })}
                />
              </div>

              {/* Display Type Picker */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Presentation Style</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => updateBanner({ type: 'modal' })}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      banner.type === 'modal'
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border/70 hover:border-border bg-card'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-foreground">Pop-up Modal Dialog</span>
                      {banner.type === 'modal' && <Check className="h-3.5 w-3.5 text-primary" />}
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug">
                      High-impact quiet luxury floating card with blurred backdrop. Best for special voyages & proposals.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateBanner({ type: 'top_bar' })}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      banner.type === 'top_bar'
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border/70 hover:border-border bg-card'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-foreground">Top Announcement Bar</span>
                      {banner.type === 'top_bar' && <Check className="h-3.5 w-3.5 text-primary" />}
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug">
                      Subtle, sleek notification bar fixed right above the header. Best for announcements & alerts.
                    </p>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Architectural Luxury Template Selector */}
          {banner.type === 'modal' && (
            <Card className="rounded-2xl border-border/80 shadow-xs">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-primary" />
                  <div>
                    <CardTitle className="text-sm font-bold">Curated Architectural Templates</CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      Select from our 4 bespoke luxury designs matching world-class heritage aesthetics.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {luxuryTemplates.map((tpl) => {
                    const isSelected = (banner.template || 'luxury_gold') === tpl.id;
                    return (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => updateBanner({ template: tpl.id })}
                        className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                          isSelected
                            ? 'border-primary bg-primary/5 ring-2 ring-primary/40 shadow-xs'
                            : 'border-border/70 hover:border-border bg-card'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-foreground">{tpl.name}</span>
                            {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-snug">
                            {tpl.description}
                          </p>
                        </div>

                        {/* Visual mini-chip */}
                        <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between">
                          <span className={`text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${tpl.badgeStyle}`}>
                            Sample Badge
                          </span>
                          <span className={`text-[9px] font-semibold px-2.5 py-0.5 rounded-full ${tpl.btnStyle}`}>
                            CTA Button
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 3. Banner Content & Copywriting */}
          <Card className="rounded-2xl border-border/80 shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                Banner Content & Copywriting
              </CardTitle>
              <CardDescription className="text-xs">
                Craft the headline, badge, and storytelling description for visitors.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              
              {/* Eyebrow Badge Text */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Eyebrow Badge Text</Label>
                <Input
                  value={banner.badgeText || ''}
                  onChange={(e) => updateBanner({ badgeText: e.target.value })}
                  placeholder="EXCLUSIVE 2026 / LIMITED PRIVATE VOYAGE"
                  className="h-9 text-xs rounded-xl uppercase tracking-wider"
                />
              </div>

              {/* Main Headline */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Main Luxury Headline</Label>
                <Input
                  value={banner.title || ''}
                  onChange={(e) => updateBanner({ title: e.target.value })}
                  placeholder="The Royal Gem & Heritage Expedition"
                  className="h-9 text-xs rounded-xl font-serif text-sm"
                />
              </div>

              {/* Narrative Subtitle */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Narrative Description / Subtitle</Label>
                <Textarea
                  value={banner.subtitle || ''}
                  onChange={(e) => updateBanner({ subtitle: e.target.value })}
                  placeholder="Embark on an intimate exploration of legendary Ceylon sapphire mines with master lapidarists and luxury retreat stays."
                  rows={3}
                  className="text-xs rounded-xl leading-relaxed resize-none"
                />
              </div>

              {/* Featured Banner Image */}
              <div className="space-y-2 pt-2 border-t border-border/60">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5 text-primary" />
                    Featured Photographic Image
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isUploadingImage}
                    onClick={() => bannerImageFileRef.current?.click()}
                    className="h-7 text-xs text-primary gap-1.5 px-2.5 rounded-lg border-primary/30 hover:bg-primary/5"
                  >
                    {isUploadingImage ? (
                      <LoaderCircle className="h-3 w-3 animate-spin" />
                    ) : (
                      <Upload className="h-3 w-3" />
                    )}
                    <span>{isUploadingImage ? 'Uploading...' : 'Upload Photo to CDN'}</span>
                  </Button>
                  <input
                    ref={bannerImageFileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleBannerImageUpload}
                    className="hidden"
                  />
                </div>
                <Input
                  value={banner.image || ''}
                  onChange={(e) => updateBanner({ image: e.target.value })}
                  placeholder="https://content-provider.payshia.com/sapphire-trail/..."
                  className="h-9 text-xs rounded-xl font-mono text-[11px]"
                />
              </div>

            </CardContent>
          </Card>

          {/* 4. Action Buttons */}
          <Card className="rounded-2xl border-border/80 shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Compass className="h-4 w-4 text-primary" />
                Action Buttons & Destinations
              </CardTitle>
              <CardDescription className="text-xs">
                Direct travelers to your reservation inquiry, custom proposal, or WhatsApp concierge.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              
              {/* Primary Button */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Primary Button Text</Label>
                  <Input
                    value={banner.primaryButtonText || ''}
                    onChange={(e) => updateBanner({ primaryButtonText: e.target.value })}
                    placeholder="Reserve Private Journey"
                    className="h-9 text-xs rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Primary Target Link</Label>
                  <Input
                    value={banner.primaryButtonLink || ''}
                    onChange={(e) => updateBanner({ primaryButtonLink: e.target.value })}
                    placeholder="/custom-proposal-package or /booking"
                    className="h-9 text-xs rounded-xl font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Secondary Button */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border/60">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Secondary Button Text (Optional)</Label>
                  <Input
                    value={banner.secondaryButtonText || ''}
                    onChange={(e) => updateBanner({ secondaryButtonText: e.target.value })}
                    placeholder="WhatsApp Concierge"
                    className="h-9 text-xs rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Secondary Target Link</Label>
                  <Input
                    value={banner.secondaryButtonLink || ''}
                    onChange={(e) => updateBanner({ secondaryButtonLink: e.target.value })}
                    placeholder="https://wa.me/94763756688"
                    className="h-9 text-xs rounded-xl font-mono text-[11px]"
                  />
                </div>
              </div>

            </CardContent>
          </Card>

          {/* 5. Timing & Behavior */}
          <Card className="rounded-2xl border-border/80 shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Timing & Session Behavior
              </CardTitle>
              <CardDescription className="text-xs">
                Fine-tune display delays and visitor dismissal memory.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Display Delay (Seconds)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={60}
                    value={banner.delaySeconds ?? 2}
                    onChange={(e) => updateBanner({ delaySeconds: Number(e.target.value) || 0 })}
                    className="h-9 text-xs rounded-xl"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Number of seconds after page load before the banner reveals.
                  </p>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/20">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-bold">Once Per Session</Label>
                    <p className="text-[10px] text-muted-foreground">
                      Do not re-show once dismissed by visitor.
                    </p>
                  </div>
                  <Switch
                    checked={banner.showOncePerSession ?? true}
                    onCheckedChange={(checked) => updateBanner({ showOncePerSession: checked })}
                  />
                </div>
              </div>

            </CardContent>
          </Card>

        </div>

        {/* Right Column: Sticky Real-time Interactive Studio Preview (5 cols) */}
        <div className="lg:col-span-5 sticky top-6 space-y-4">
          <Card className="rounded-2xl border-border/80 shadow-xs overflow-hidden">
            <CardHeader className="py-3 px-4 bg-muted/40 border-b border-border/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold text-foreground">Interactive Live Preview</span>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" className="text-[9px] uppercase font-mono tracking-wider">
                    {banner.type === 'top_bar' ? 'Top Bar' : banner.template || 'luxury_gold'}
                  </Badge>
                  
                  <div className="flex items-center border border-border/60 rounded-lg p-0.5 bg-background">
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('desktop')}
                      className={`p-1 rounded ${previewDevice === 'desktop' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                      title="Desktop View"
                    >
                      <Monitor className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('mobile')}
                      className={`p-1 rounded ${previewDevice === 'mobile' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                      title="Mobile View"
                    >
                      <Smartphone className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-4 bg-black/50 flex flex-col items-center justify-center min-h-[420px]">
              
              {/* TOP BAR PREVIEW */}
              {banner.type === 'top_bar' && (
                <div className="w-full bg-[#0B0F15] text-white border border-[#D4AF37]/40 rounded-xl p-3 text-xs flex flex-col gap-2 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-2">
                    <span className="px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#DEC49B] border border-[#D4AF37]/30 font-bold text-[9px] tracking-wider uppercase">
                      {banner.badgeText || 'ANNOUNCEMENT'}
                    </span>
                    <X className="h-3.5 w-3.5 text-white/60" />
                  </div>
                  <p className="font-serif font-bold text-sm text-[#DEC49B]">{banner.title || 'Exclusive Gem Voyage'}</p>
                  <p className="text-[11px] text-white/80 line-clamp-2">{banner.subtitle}</p>
                  <div className="pt-1 flex items-center gap-2">
                    <span className="inline-block bg-[#D4AF37] text-[#0B0F15] font-semibold px-3 py-1 rounded-full text-[10px]">
                      {banner.primaryButtonText || 'Explore'}
                    </span>
                    {banner.secondaryButtonText && (
                      <span className="inline-block border border-white/20 text-white/80 px-2.5 py-1 rounded-full text-[10px]">
                        {banner.secondaryButtonText}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* POP-UP MODAL PREVIEW */}
              {banner.type === 'modal' && (() => {
                const tpl = banner.template || 'luxury_gold';
                const isMobile = previewDevice === 'mobile';

                return (
                  <div className={`transition-all duration-300 ${isMobile ? 'max-w-[280px]' : 'w-full max-w-[460px]'}`}>
                    <div className={`rounded-2xl overflow-hidden border shadow-2xl relative ${
                      tpl === 'luxury_gold' ? 'bg-[#0B0F15] text-white border-[#D4AF37]/40' :
                      tpl === 'sapphire_blue' ? 'bg-gradient-to-br from-[#081426] via-[#050C16] to-[#02050A] text-white border-sky-500/40' :
                      tpl === 'minimal_editorial' ? 'bg-[#FBF9F5] text-[#14181E] border-[#E2DDD3]' :
                      'bg-[#090D12] text-white border-white/20'
                    }`}>
                      
                      {/* Top micro-accent strip */}
                      <div className={`h-0.5 w-full ${
                        tpl === 'luxury_gold' ? 'bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent' :
                        tpl === 'sapphire_blue' ? 'bg-gradient-to-r from-transparent via-sky-400 to-transparent' :
                        tpl === 'minimal_editorial' ? 'bg-gradient-to-r from-transparent via-neutral-400 to-transparent' :
                        'bg-gradient-to-r from-transparent via-white/40 to-transparent'
                      }`} />

                      {/* Mock close button */}
                      <div className="absolute top-2.5 right-2.5 z-10">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                          tpl === 'minimal_editorial' ? 'bg-black/5 text-neutral-600' : 'bg-white/10 text-white/70'
                        }`}>
                          ✕
                        </span>
                      </div>

                      {/* Full-bleed style for template 4 */}
                      {tpl === 'image_spotlight' && banner.image && (
                        <div className="relative h-44 w-full overflow-hidden">
                          <img
                            src={banner.image}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#090D12] via-[#090D12]/40 to-transparent" />
                          {banner.badgeText && (
                            <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-primary text-primary-foreground">
                              {banner.badgeText}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Horizontal split card for templates 1, 2, 3 */}
                      {tpl !== 'image_spotlight' && (
                        <div className={`grid items-stretch ${banner.image && !isMobile ? 'grid-cols-12' : 'grid-cols-1'}`}>
                          {banner.image && (
                            <div className={`${isMobile ? 'h-32' : 'col-span-5'} relative min-h-[120px] w-full overflow-hidden bg-black/40`}>
                              <img
                                src={banner.image}
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}

                          <div className={`p-4 space-y-2.5 flex flex-col justify-between ${banner.image && !isMobile ? 'col-span-7' : 'col-span-12'}`}>
                            <div className="space-y-1.5">
                              {banner.badgeText && (
                                <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                  tpl === 'luxury_gold' ? 'bg-[#D4AF37]/15 text-[#DEC49B] border border-[#D4AF37]/30' :
                                  tpl === 'sapphire_blue' ? 'bg-sky-500/20 text-sky-300 border border-sky-400/30' :
                                  'bg-neutral-900/10 text-neutral-800 border border-neutral-300'
                                }`}>
                                  {banner.badgeText}
                                </span>
                              )}

                              <h4 className={`text-sm font-serif font-bold leading-tight ${
                                tpl === 'luxury_gold' ? 'text-[#DEC49B]' :
                                tpl === 'sapphire_blue' ? 'text-sky-100' :
                                'text-[#14181E]'
                              }`}>
                                {banner.title || 'Untitled Banner'}
                              </h4>
                              
                              <p className={`text-[11px] line-clamp-3 leading-relaxed font-light ${
                                tpl === 'minimal_editorial' ? 'text-neutral-600' : 'text-white/70'
                              }`}>
                                {banner.subtitle || 'Add subtitle narrative to preview.'}
                              </p>
                            </div>

                            <div className="pt-1 flex flex-wrap items-center gap-1.5">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-semibold shadow-xs ${
                                tpl === 'luxury_gold' ? 'bg-[#D4AF37] text-[#0B0F15]' :
                                tpl === 'sapphire_blue' ? 'bg-sky-500 text-white' :
                                'bg-[#14181E] text-white'
                              }`}>
                                {banner.primaryButtonText || 'Learn More'}
                              </span>
                              {banner.secondaryButtonText && (
                                <span className={`px-2.5 py-1 rounded-full text-[10px] border ${
                                  tpl === 'minimal_editorial' ? 'border-neutral-300 text-neutral-700' : 'border-white/20 text-white/80'
                                }`}>
                                  {banner.secondaryButtonText}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Content block for template 4 */}
                      {tpl === 'image_spotlight' && (
                        <div className="p-4 space-y-2.5 bg-[#090D12]">
                          <h4 className="text-sm font-serif font-bold leading-tight text-white">
                            {banner.title || 'Untitled Banner'}
                          </h4>
                          <p className="text-[11px] text-white/70 line-clamp-3 leading-relaxed font-light">
                            {banner.subtitle || 'Add subtitle narrative to preview.'}
                          </p>
                          <div className="pt-1 flex flex-wrap items-center gap-2">
                            <span className="px-3.5 py-1 rounded-full text-[10px] font-semibold bg-primary text-primary-foreground shadow-xs">
                              {banner.primaryButtonText || 'Learn More'}
                            </span>
                            {banner.secondaryButtonText && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] border border-white/20 text-white/80">
                                {banner.secondaryButtonText}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                );
              })()}

            </CardContent>
          </Card>

          {/* Publishing Info Card */}
          <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
            <div className="text-xs space-y-1">
              <p className="font-semibold text-foreground">Immediate Effect</p>
              <p className="text-muted-foreground leading-relaxed">
                Changes are written directly to your MySQL <code>site_content</code> table and published instantly to all visitors with automatic cache invalidation.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Floating Bottom Sticky Save Bar */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-background/95 backdrop-blur-md border border-primary/40 shadow-2xl px-5 py-3 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-semibold text-foreground">You have unsaved banner modifications</span>
          </div>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="h-8 px-4 rounded-xl text-xs font-semibold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isSaving ? (
              <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            <span>{isSaving ? 'Saving...' : 'Publish Changes'}</span>
          </Button>
        </div>
      )}

    </div>
  );
}
