'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  BarChart3, 
  Share2, 
  ShieldCheck, 
  Save, 
  LoaderCircle, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  Sparkles,
  Zap,
  Activity,
  Layers,
  HelpCircle
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/utils';
import { authFetch } from '@/lib/api';
import { trackPageView, trackLeadSubmission, trackBookingSuccess } from '@/lib/analytics';

export default function AdminAnalyticsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState('');
  const [metaPixelId, setMetaPixelId] = useState('');
  const [gtmId, setGtmId] = useState('');
  const [isGaEnabled, setIsGaEnabled] = useState(true);
  const [isPixelEnabled, setIsPixelEnabled] = useState(false);
  const [excludeAdminTraffic, setExcludeAdminTraffic] = useState(true);
  const [enableEcommerceEvents, setEnableEcommerceEvents] = useState(true);

  // Test event state
  const [testingEvent, setTestingEvent] = useState<string | null>(null);

  // Fetch current settings
  useEffect(() => {
    async function fetchSettings() {
      setIsLoading(true);
      try {
        const res = await authFetch(`${API_BASE_URL}/analytics/settings/`);
        if (res.ok) {
          const data = await res.json();
          setGoogleAnalyticsId(data.google_analytics_id || '');
          setMetaPixelId(data.meta_pixel_id || '');
          setGtmId(data.gtm_id || '');
          setIsGaEnabled(Boolean(data.is_ga_enabled));
          setIsPixelEnabled(Boolean(data.is_pixel_enabled));
          setExcludeAdminTraffic(data.exclude_admin_traffic !== undefined ? Boolean(data.exclude_admin_traffic) : true);
          setEnableEcommerceEvents(data.enable_ecommerce_events !== undefined ? Boolean(data.enable_ecommerce_events) : true);
        }
      } catch (e) {
        console.error("Failed to load analytics settings", e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        google_analytics_id: googleAnalyticsId.trim(),
        meta_pixel_id: metaPixelId.trim(),
        gtm_id: gtmId.trim(),
        is_ga_enabled: isGaEnabled,
        is_pixel_enabled: isPixelEnabled,
        exclude_admin_traffic: excludeAdminTraffic,
        enable_ecommerce_events: enableEcommerceEvents,
      };

      const res = await authFetch(`${API_BASE_URL}/analytics/settings/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save settings.');

      toast({
        title: '✨ Analytics Configuration Saved',
        description: 'Google Analytics and Meta Pixel settings have been updated.',
      });
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Error Saving Settings',
        description: e instanceof Error ? e.message : 'Could not save configuration.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFireTestEvent = (eventName: string) => {
    setTestingEvent(eventName);
    try {
      if (eventName === 'PageView') {
        trackPageView(window.location.pathname, 'Test Verification Page');
      } else if (eventName === 'Lead') {
        trackLeadSubmission({ leadType: 'contact_form', category: 'Testing Event' });
      } else if (eventName === 'Purchase') {
        trackBookingSuccess({
          bookingId: 9999,
          tourName: 'Exclusive Gem Mine Tour (Test)',
          totalValue: 300,
          guests: 2,
        });
      }

      toast({
        title: `⚡ Test Event Dispatched: ${eventName}`,
        description: 'Check your Google Tag Assistant or Meta Pixel Helper extension.',
      });
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Event Error',
        description: 'Make sure tracking scripts are enabled.',
      });
    } finally {
      setTimeout(() => setTestingEvent(null), 1000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full py-32">
        <LoaderCircle className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/50">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary font-serif flex items-center gap-2.5">
            <Activity className="h-7 w-7 text-primary" />
            Marketing &amp; Conversion Tracking
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Configure Google Analytics 4 (GA4) and Meta (Facebook) Pixel with full-funnel e-commerce conversion tracking.
          </p>
        </div>

        {/* Live Status Indicators */}
        <div className="flex items-center gap-2 flex-wrap">
          {isGaEnabled && googleAnalyticsId ? (
            <Badge className="bg-emerald-600/15 text-emerald-400 border border-emerald-500/30 text-xs py-1 px-2.5">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
              GA4 Active
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground text-xs py-1 px-2.5">
              GA4 Disabled
            </Badge>
          )}

          {isPixelEnabled && metaPixelId ? (
            <Badge className="bg-blue-600/15 text-blue-400 border border-blue-500/30 text-xs py-1 px-2.5">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
              Meta Pixel Active
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground text-xs py-1 px-2.5">
              Pixel Disabled
            </Badge>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Tracking Integrations (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Google Analytics 4 Card */}
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-4 border-b border-border/50 flex flex-row items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
                    <BarChart3 className="h-5 w-5 text-amber-500" />
                    Google Analytics 4 (GA4)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Track visitor counts, traffic sources, page views, and engagement metrics.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="ga-toggle" className="text-xs cursor-pointer font-medium">
                    {isGaEnabled ? 'Enabled' : 'Disabled'}
                  </Label>
                  <Switch
                    id="ga-toggle"
                    checked={isGaEnabled}
                    onCheckedChange={setIsGaEnabled}
                  />
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">GA4 Measurement ID *</Label>
                  <Input
                    placeholder="e.g. G-TX702Y4CLS"
                    value={googleAnalyticsId}
                    onChange={e => setGoogleAnalyticsId(e.target.value)}
                    className="font-mono text-xs h-9 uppercase"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Found in Google Analytics ➔ Admin ➔ Data Streams ➔ Measurement ID.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 2. Meta (Facebook) Pixel Card */}
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-4 border-b border-border/50 flex flex-row items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
                    <Share2 className="h-5 w-5 text-blue-500" />
                    Meta (Facebook) Pixel
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Track Facebook &amp; Instagram ad conversions, leads, bookings, and retargeting audiences.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="pixel-toggle" className="text-xs cursor-pointer font-medium">
                    {isPixelEnabled ? 'Enabled' : 'Disabled'}
                  </Label>
                  <Switch
                    id="pixel-toggle"
                    checked={isPixelEnabled}
                    onCheckedChange={setIsPixelEnabled}
                  />
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Meta Pixel ID (Dataset ID) *</Label>
                  <Input
                    placeholder="e.g. 123456789012345"
                    value={metaPixelId}
                    onChange={e => setMetaPixelId(e.target.value)}
                    className="font-mono text-xs h-9"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Found in Meta Events Manager ➔ Data Sources ➔ Settings ➔ Dataset / Pixel ID.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 3. Google Tag Manager (Optional) */}
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-4 border-b border-border/50">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
                  <Layers className="h-5 w-5 text-indigo-400" />
                  Google Tag Manager (Optional)
                </CardTitle>
                <CardDescription className="text-xs">
                  If you manage advanced marketing tags via GTM container container.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">GTM Container ID</Label>
                  <Input
                    placeholder="e.g. GTM-XXXXXXX"
                    value={gtmId}
                    onChange={e => setGtmId(e.target.value)}
                    className="font-mono text-xs h-9 uppercase"
                  />
                </div>
              </CardContent>
            </Card>

            {/* 4. Privacy & Filter Controls */}
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  Privacy &amp; Data Accuracy Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="admin-traffic" className="text-xs font-semibold cursor-pointer">
                      Exclude Admin Traffic
                    </Label>
                    <p className="text-[11px] text-muted-foreground">
                      Prevents your own administrative visits (`/admin/*`) from polluting marketing reports and conversion rates.
                    </p>
                  </div>
                  <Switch
                    id="admin-traffic"
                    checked={excludeAdminTraffic}
                    onCheckedChange={setExcludeAdminTraffic}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="ecommerce-events" className="text-xs font-semibold cursor-pointer">
                      Full-Funnel E-commerce Conversion Events
                    </Label>
                    <p className="text-[11px] text-muted-foreground">
                      Dispatches `ViewContent`, `InitiateCheckout`, `Purchase`, `Lead`, and `Contact` events automatically.
                    </p>
                  </div>
                  <Switch
                    id="ecommerce-events"
                    checked={enableEcommerceEvents}
                    onCheckedChange={setEnableEcommerceEvents}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Event Funnel Overview & Verification (1 col) */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Save Card */}
            <Card className="border-border bg-background-alt/40 shadow-sm sticky top-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <Save className="h-4 w-4 text-primary" />
                  Apply Tracking Configuration
                </CardTitle>
                <CardDescription className="text-xs">
                  Save all tracking IDs and activation toggles to your live production system.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-9 shadow-sm"
                >
                  {isSaving ? (
                    <>
                      <LoaderCircle className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Saving Settings...
                    </>
                  ) : (
                    <>
                      <Save className="mr-1.5 h-3.5 w-3.5" />
                      Save Configuration
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Conversion Funnel Checklist */}
            <Card className="border-border">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-primary" />
                  Active Event Funnel
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3 text-xs space-y-2.5">
                <div className="flex items-start gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                  <div>
                    <strong className="text-foreground">PageView:</strong> Fired on all public page views.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                  <div>
                    <strong className="text-foreground">ViewContent:</strong> When viewing tour packages.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                  <div>
                    <strong className="text-foreground">InitiateCheckout:</strong> When clicking "Book Tour".
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                  <div>
                    <strong className="text-foreground">Purchase / Schedule:</strong> When a booking request is submitted.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                  <div>
                    <strong className="text-foreground">Lead:</strong> Inquiries &amp; custom bespoke proposals.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                  <div>
                    <strong className="text-foreground">Contact:</strong> WhatsApp concierge clicks.
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Test Event Diagnostics */}
            <Card className="border-border">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Live Event Testing
                </CardTitle>
                <CardDescription className="text-[11px]">
                  Dispatch test events to test with Meta Pixel Helper or GA Debugger.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-3 space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleFireTestEvent('PageView')}
                  disabled={testingEvent !== null}
                  className="w-full text-xs h-8 justify-start"
                >
                  <Activity className="h-3.5 w-3.5 mr-2 text-primary" />
                  Fire Test PageView
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleFireTestEvent('Lead')}
                  disabled={testingEvent !== null}
                  className="w-full text-xs h-8 justify-start"
                >
                  <HelpCircle className="h-3.5 w-3.5 mr-2 text-primary" />
                  Fire Test Lead
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleFireTestEvent('Purchase')}
                  disabled={testingEvent !== null}
                  className="w-full text-xs h-8 justify-start"
                >
                  <Zap className="h-3.5 w-3.5 mr-2 text-primary" />
                  Fire Test Purchase ($300)
                </Button>
              </CardContent>
            </Card>
          </div>

        </div>
      </form>
    </div>
  );
}
