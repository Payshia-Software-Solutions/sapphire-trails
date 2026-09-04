'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Calendar,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  ExternalLink,
  Plus,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/utils';
import { authFetch } from '@/lib/api';
import { type TourPackage } from '@/lib/packages-data';
import { type PackageICalFeed } from '@/lib/bookings-data';

interface ICalSyncDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tourPackages: TourPackage[];
  onSyncComplete?: () => void;
}

export function ICalSyncDialog({
  isOpen,
  onClose,
  tourPackages,
  onSyncComplete,
}: ICalSyncDialogProps) {
  const { toast } = useToast();
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [feeds, setFeeds] = useState<PackageICalFeed[]>([]);
  const [isLoadingFeeds, setIsLoadingFeeds] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // New Feed Form
  const [newPlatform, setNewPlatform] = useState<string>('airbnb');
  const [newFeedName, setNewFeedName] = useState<string>('');
  const [newFeedUrl, setNewFeedUrl] = useState<string>('');
  const [isAddingFeed, setIsAddingFeed] = useState(false);

  // Initialize selected package
  useEffect(() => {
    if (tourPackages.length > 0 && !selectedPackageId) {
      setSelectedPackageId(String(tourPackages[0].id));
    }
  }, [tourPackages, selectedPackageId]);

  // Fetch feeds when package changes
  useEffect(() => {
    if (selectedPackageId && isOpen) {
      fetchFeeds(selectedPackageId);
    }
  }, [selectedPackageId, isOpen]);

  const fetchFeeds = async (packageId: string) => {
    setIsLoadingFeeds(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/ical/feeds/${packageId}`);
      if (res.ok) {
        const data = await res.json();
        setFeeds(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error loading iCal feeds', err);
    } finally {
      setIsLoadingFeeds(false);
    }
  };

  const exportUrl = selectedPackageId
    ? `${API_BASE_URL}/ical/export/${selectedPackageId}`
    : '';

  const handleCopyExportUrl = () => {
    if (!exportUrl) return;
    navigator.clipboard.writeText(exportUrl);
    setIsCopied(true);
    toast({
      title: 'Link Copied!',
      description: 'iCal Export URL has been copied to your clipboard.',
    });
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleAddFeed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackageId || !newFeedUrl.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid iCal feed URL.',
        variant: 'destructive',
      });
      return;
    }

    setIsAddingFeed(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/ical/feeds`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tour_package_id: Number(selectedPackageId),
          platform: newPlatform,
          feed_name: newFeedName.trim() || `${newPlatform.toUpperCase()} Feed`,
          feed_url: newFeedUrl.trim(),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to add feed');
      }

      toast({
        title: 'Feed Added Successfully',
        description: 'Now you can sync bookings from this platform.',
      });

      setNewFeedUrl('');
      setNewFeedName('');
      fetchFeeds(selectedPackageId);
    } catch (err: any) {
      toast({
        title: 'Error Adding Feed',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsAddingFeed(false);
    }
  };

  const handleDeleteFeed = async (feedId: number) => {
    if (!confirm('Are you sure you want to remove this calendar feed?')) return;

    try {
      const res = await authFetch(`${API_BASE_URL}/ical/feeds/${feedId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast({ title: 'Feed Deleted' });
        setFeeds(feeds.filter((f) => f.id !== feedId));
      }
    } catch (err) {
      toast({
        title: 'Delete Failed',
        description: 'Unable to delete feed.',
        variant: 'destructive',
      });
    }
  };

  const handleSyncFeed = async (feedId: number) => {
    setIsSyncing(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/ical/sync/feed/${feedId}`, {
        method: 'POST',
      });
      const data = await res.json();

      if (res.ok) {
        toast({
          title: 'Sync Completed',
          description: `Created: ${data.stats?.created ?? 0}, Updated: ${data.stats?.updated ?? 0}`,
        });
        fetchFeeds(selectedPackageId);
        if (onSyncComplete) onSyncComplete();
      } else {
        throw new Error(data.error || 'Sync failed');
      }
    } catch (err: any) {
      toast({
        title: 'Sync Failed',
        description: err.message,
        variant: 'destructive',
      });
      fetchFeeds(selectedPackageId);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncAllForPackage = async () => {
    setIsSyncing(true);
    try {
      const endpoint = selectedPackageId
        ? `${API_BASE_URL}/ical/sync/${selectedPackageId}`
        : `${API_BASE_URL}/ical/sync`;
      const res = await authFetch(endpoint, {
        method: 'POST',
      });
      const data = await res.json();

      if (res.ok) {
        toast({
          title: 'All Feeds Synced!',
          description: `New Bookings: ${data.stats?.created ?? 0}, Updated: ${data.stats?.updated ?? 0}`,
        });
        fetchFeeds(selectedPackageId);
        if (onSyncComplete) onSyncComplete();
      } else {
        throw new Error(data.error || 'Sync failed');
      }
    } catch (err: any) {
      toast({
        title: 'Sync Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const getPlatformBadge = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'airbnb':
        return <Badge className="bg-rose-500 hover:bg-rose-600 text-white">Airbnb</Badge>;
      case 'booking_com':
      case 'booking':
        return <Badge className="bg-blue-600 hover:bg-blue-700 text-white">Booking.com</Badge>;
      case 'agoda':
        return <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white">Agoda</Badge>;
      case 'tripadvisor':
      case 'viator':
        return <Badge className="bg-[#00AA6C] hover:bg-[#008f5a] text-white">TripAdvisor</Badge>;
      default:
        return <Badge variant="secondary">{platform}</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            <DialogTitle className="text-xl">
              iCal Calendar Sync (Airbnb, Booking.com, Agoda)
            </DialogTitle>
          </div>
          <DialogDescription>
            Synchronize bookings and availability between Sapphire Trails and external travel platforms using 2-way iCal.
          </DialogDescription>
        </DialogHeader>

        {/* Package Selector */}
        <div className="my-3 space-y-2">
          <Label className="text-sm font-semibold">Select Tour Package / Listing</Label>
          <Select
            value={selectedPackageId}
            onValueChange={(val) => setSelectedPackageId(val)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a tour package" />
            </SelectTrigger>
            <SelectContent>
              {tourPackages.map((pkg) => (
                <SelectItem key={pkg.id} value={String(pkg.id)}>
                  {pkg.homepageTitle || `Package #${pkg.id}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="import" className="w-full mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="import">Import from OTAs (Airbnb/Booking/Agoda)</TabsTrigger>
            <TabsTrigger value="export">Export to OTAs (Prevent Double Booking)</TabsTrigger>
          </TabsList>

          {/* TAB 1: IMPORT OTA FEEDS */}
          <TabsContent value="import" className="space-y-4 pt-3">
            {/* Add Feed Form */}
            <div className="border rounded-lg p-4 bg-muted/30">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add External OTA Calendar Link
              </h4>
              <form onSubmit={handleAddFeed} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs">Platform</Label>
                    <Select
                      value={newPlatform}
                      onValueChange={(val) => setNewPlatform(val)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="airbnb">Airbnb</SelectItem>
                        <SelectItem value="booking_com">Booking.com</SelectItem>
                        <SelectItem value="agoda">Agoda</SelectItem>
                        <SelectItem value="tripadvisor">TripAdvisor / Viator</SelectItem>
                        <SelectItem value="other">Other OTA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-xs">Feed Label / Name (Optional)</Label>
                    <Input
                      placeholder="e.g. Airbnb Villa Listing"
                      value={newFeedName}
                      onChange={(e) => setNewFeedName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">iCal Export URL from OTA (.ics link)</Label>
                  <Input
                    placeholder="https://www.airbnb.com/calendar/ical/123456.ics?s=..."
                    value={newFeedUrl}
                    onChange={(e) => setNewFeedUrl(e.target.value)}
                    required
                    className="mt-1 font-mono text-xs"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Paste the export link provided in your Airbnb, Booking.com, or Agoda host calendar settings.
                  </p>
                </div>

                <div className="flex justify-end pt-1">
                  <Button type="submit" size="sm" disabled={isAddingFeed}>
                    {isAddingFeed ? 'Adding...' : 'Connect Calendar Feed'}
                  </Button>
                </div>
              </form>
            </div>

            {/* Configured Feeds List */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold">Configured External Feeds</h4>
                {feeds.length > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSyncAllForPackage}
                    disabled={isSyncing}
                    className="flex items-center gap-1.5 text-xs"
                  >
                    <RefreshCw
                      className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`}
                    />
                    Sync All Now
                  </Button>
                )}
              </div>

              {isLoadingFeeds ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Loading calendar feeds...
                </div>
              ) : feeds.length === 0 ? (
                <div className="border border-dashed rounded-lg p-6 text-center text-sm text-muted-foreground">
                  No external calendar feeds connected for this package yet.
                  <br />
                  Add your Airbnb or Booking.com iCal link above to start auto-importing reservations.
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Platform</TableHead>
                        <TableHead>Label</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Synced</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {feeds.map((feed) => (
                        <TableRow key={feed.id}>
                          <TableCell>{getPlatformBadge(feed.platform)}</TableCell>
                          <TableCell className="font-medium text-xs">
                            {feed.feed_name || 'Unnamed Feed'}
                          </TableCell>
                          <TableCell>
                            {feed.sync_status === 'success' ? (
                              <Badge variant="outline" className="text-emerald-600 border-emerald-300 flex items-center gap-1 w-fit text-[11px]">
                                <CheckCircle2 className="h-3 w-3" /> Synced
                              </Badge>
                            ) : feed.sync_status === 'error' ? (
                              <Badge variant="destructive" className="flex items-center gap-1 w-fit text-[11px]" title={feed.last_error_message}>
                                <AlertCircle className="h-3 w-3" /> Error
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-[11px]">Pending</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {feed.last_synced_at
                              ? new Date(feed.last_synced_at).toLocaleString()
                              : 'Never'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end items-center gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                title="Sync this feed"
                                disabled={isSyncing}
                                onClick={() => handleSyncFeed(feed.id)}
                              >
                                <RefreshCw className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                title="Delete feed"
                                onClick={() => handleDeleteFeed(feed.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* TAB 2: EXPORT TO OTAS */}
          <TabsContent value="export" className="space-y-4 pt-3">
            <div className="border rounded-lg p-4 bg-muted/20 space-y-3">
              <div>
                <Label className="text-sm font-semibold">
                  Sapphire Trails iCal Export Feed URL
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Copy this URL and paste it into the <strong>Import Calendar / Sync Calendar</strong> section on Airbnb, Booking.com, and Agoda. When someone books on Sapphire Trails, those dates will automatically block on your OTAs.
                </p>
              </div>

              <div className="flex gap-2">
                <Input
                  readOnly
                  value={exportUrl}
                  className="font-mono text-xs bg-background"
                />
                <Button
                  onClick={handleCopyExportUrl}
                  variant="outline"
                  className="flex items-center gap-1 shrink-0"
                >
                  {isCopied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-600" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" /> Copy Link
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Quick Setup Instructions */}
            <div className="border rounded-lg p-4 space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-1.5">
                <HelpCircle className="h-4 w-4 text-primary" /> How to connect to OTA platforms:
              </h4>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="p-2.5 rounded bg-muted/40">
                  <strong className="text-foreground">Airbnb:</strong> Go to Listing &gt; Pricing & availability &gt; Calendar sync &gt; <em>Import Calendar</em>, and paste the Export URL above. Then copy Airbnb's <em>Export Calendar</em> link and paste into our Import tab.
                </div>
                <div className="p-2.5 rounded bg-muted/40">
                  <strong className="text-foreground">Booking.com:</strong> Go to Extranet &gt; Rates & Availability &gt; Sync calendars &gt; <em>Add calendar connection</em>, paste the Sapphire Trails URL, and save.
                </div>
                <div className="p-2.5 rounded bg-muted/40">
                  <strong className="text-foreground">Agoda YCS:</strong> Go to YCS &gt; Calendar &gt; Calendar Sync &gt; <em>Import calendar</em>, and enter the Sapphire Trails URL.
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
