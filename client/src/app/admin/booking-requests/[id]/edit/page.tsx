'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';

import { type Booking } from '@/lib/bookings-data';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ArrowLeft, 
  LoaderCircle, 
  User, 
  Mail, 
  Phone, 
  Home, 
  Ticket, 
  Calendar, 
  Users as GuestsIcon, 
  MessageSquare, 
  Save, 
  Globe, 
  Receipt, 
  Sparkles, 
  DollarSign, 
  ExternalLink,
  History,
  Tag,
  StickyNote
} from 'lucide-react';
import { mapServerPackageToClient, type TourPackage } from '@/lib/packages-data';
import { API_BASE_URL } from '@/lib/utils';
import { authFetch } from '@/lib/api';

export default function EditBookingPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const id = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tourPackages, setTourPackages] = useState<TourPackage[]>([]);

  // Booking Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [tourPackageId, setTourPackageId] = useState<number>(0);
  const [adults, setAdults] = useState<number>(1);
  const [children, setChildren] = useState<number>(0);
  const [tourDate, setTourDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<Booking['status']>('pending');
  const [bookingSource, setBookingSource] = useState('website');
  const [externalBookingId, setExternalBookingId] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [originalTourDate, setOriginalTourDate] = useState('');
  const [message, setMessage] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [invoiceId, setInvoiceId] = useState<number | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState<string | null>(null);
  const [sendConfirmationEmail, setSendConfirmationEmail] = useState(false);

  // Initial tour date for reschedule tracking
  const [initialTourDate, setInitialTourDate] = useState('');

  // Fetch Tour Packages
  useEffect(() => {
    async function fetchTourPackages() {
      try {
        const response = await fetch(`${API_BASE_URL}/tours`);
        if (response.ok) {
          const serverData = await response.json();
          if (Array.isArray(serverData)) {
            setTourPackages(serverData.map(mapServerPackageToClient));
          }
        }
      } catch (e) {
        console.error("Could not fetch tour packages", e);
      }
    }
    fetchTourPackages();
  }, []);

  // Fetch Booking Details
  useEffect(() => {
    if (!id) return;

    async function fetchBooking() {
      setIsLoading(true);
      try {
        const response = await authFetch(`${API_BASE_URL}/bookings/${id}`);
        if (!response.ok) throw new Error('Booking not found');

        const serverBooking = await response.json();
        const b = serverBooking.booking || serverBooking;

        setName(b.name || '');
        setEmail(b.email || '');
        setPhone(b.phone || '');
        setAddress(b.address || '');
        setTourPackageId(Number(b.tour_package_id) || 0);
        setAdults(Number(b.adults) || 1);
        setChildren(Number(b.children) || 0);
        setTourDate(b.tour_date || '');
        setInitialTourDate(b.tour_date || '');
        setEndDate(b.end_date || '');
        setStatus(b.status || 'pending');
        setBookingSource(b.booking_source || 'website');
        setExternalBookingId(b.external_booking_id || '');
        setRescheduleReason(b.reschedule_reason || '');
        setOriginalTourDate(b.original_tour_date || '');
        setMessage(b.message || '');
        setAdminNotes(b.admin_notes || '');
        setUserId(b.user_id ? Number(b.user_id) : null);
        setInvoiceId(b.invoice_id ? Number(b.invoice_id) : null);
        setInvoiceNumber(b.invoice_number || null);
      } catch (error) {
        console.error("Failed to load booking data:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to load booking data.' });
      } finally {
        setIsLoading(false);
      }
    }

    fetchBooking();
  }, [id, toast]);

  // Selected tour package pricing calculation
  const selectedTour = useMemo(() => {
    return tourPackages.find(p => p.id === tourPackageId);
  }, [tourPackages, tourPackageId]);

  const totalGuests = (adults || 0) + (children || 0);

  const estimatedTotal = useMemo(() => {
    if (!selectedTour || !selectedTour.price) return 0;
    const priceValue = parseFloat(selectedTour.price.replace(/[^0-9.]/g, ''));
    if (isNaN(priceValue)) return 0;
    return priceValue * totalGuests;
  }, [selectedTour, totalGuests]);

  const isDateChanged = tourDate && initialTourDate && tourDate !== initialTourDate;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !tourPackageId || !tourDate) {
      toast({
        variant: 'destructive',
        title: 'Required Fields Missing',
        description: 'Please fill in all required booking information.',
      });
      return;
    }

    setIsSubmitting(true);

    const payload = {
      name,
      email,
      phone,
      address,
      tour_package_id: tourPackageId,
      adults: Number(adults),
      children: Number(children),
      guests: totalGuests,
      tour_date: tourDate,
      end_date: endDate || null,
      status: isDateChanged && status === 'pending' ? 'rescheduled' : status,
      booking_source: bookingSource,
      external_booking_id: externalBookingId || null,
      message,
      admin_notes: adminNotes.trim() || null,
      user_id: userId,
    };

    try {
      const response = await authFetch(`${API_BASE_URL}/bookings/${id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to update booking.');
      }

      // If dates were changed and reason provided, also update reschedule audit
      if (isDateChanged) {
        try {
          await authFetch(`${API_BASE_URL}/bookings/${id}/reschedule/`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              new_date: tourDate,
              new_end_date: endDate || null,
              reason: rescheduleReason || 'Updated via Admin Booking Studio',
              send_email: sendConfirmationEmail,
            }),
          });
        } catch (e) {
          console.warn("Could not sync reschedule trigger:", e);
        }
      }

      toast({ 
        title: '✨ Booking Updated Successfully', 
        description: `Changes for #${id} (${name}) have been saved.` 
      });

      router.push(`/admin/booking-requests/${id}/view`);
    } catch (error) {
      console.error("Failed to save booking:", error);
      const errorMessage = error instanceof Error ? error.message : "Could not save booking changes.";
      toast({ variant: 'destructive', title: 'Error', description: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeStyle = (currentStatus: Booking['status']) => {
    switch (currentStatus) {
      case 'accepted':
      case 'confirmed':
        return 'bg-emerald-600/15 text-emerald-400 border-emerald-500/30';
      case 'rescheduled':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'completed':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'rejected':
      case 'cancelled':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'pending':
      default:
        return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-32 gap-3">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground tracking-widest uppercase font-mono">Loading Booking Studio...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()} className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary font-serif">
                Edit Booking Request
              </h1>
              <Badge className={`text-xs font-semibold uppercase border ${getStatusBadgeStyle(status)}`}>
                {status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              Reference: #ST-BK-{id} &bull; Guest: <strong className="text-foreground">{name}</strong>
            </p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex items-center gap-2">
          {invoiceNumber ? (
            <Button asChild variant="outline" size="sm" className="text-xs border-primary/40 text-primary hover:bg-primary/10">
              <Link href={`/invoices/${invoiceNumber}`} target="_blank">
                <Receipt className="h-3.5 w-3.5 mr-1.5" />
                View Invoice ({invoiceNumber})
              </Link>
            </Button>
          ) : (
            <Button asChild variant="outline" size="sm" className="text-xs border-primary/40 text-primary hover:bg-primary/10">
              <Link href={`/admin/invoices/create?booking_id=${id}`}>
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                Generate Invoice
              </Link>
            </Button>
          )}

          <Button asChild variant="ghost" size="sm" className="text-xs">
            <Link href={`/admin/booking-requests/${id}/view`}>
              View Booking Summary
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Studio Form Layout */}
      <form onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Core Booking Data */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card 1: Traveler Details */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                1. Traveler Information
              </CardTitle>
              <CardDescription className="text-xs">
                Primary contact details and address for permits and insurance.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Full Name *</Label>
                <Input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Johnathan Smith"
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Email Address *</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. traveler@example.com"
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Phone / WhatsApp Number</Label>
                <Input
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+94 71 234 5678"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Country / Address</Label>
                <Input
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="e.g. London, United Kingdom"
                  className="h-9 text-xs"
                />
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Tour Package & Party Size */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Ticket className="h-4 w-4 text-primary" />
                2. Tour Expedition &amp; Guests
              </CardTitle>
              <CardDescription className="text-xs">
                Selected tour experience and headcount.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Tour Package *</Label>
                <Select value={String(tourPackageId)} onValueChange={val => setTourPackageId(Number(val))}>
                  <SelectTrigger className="h-10 text-xs">
                    <SelectValue placeholder="Select a tour package" />
                  </SelectTrigger>
                  <SelectContent>
                    {tourPackages.map(pkg => (
                      <SelectItem key={pkg.id} value={String(pkg.id)}>
                        {pkg.homepageTitle} {pkg.price ? `(${pkg.price})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-1">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Adult Travelers *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={adults}
                    onChange={e => setAdults(Math.max(1, parseInt(e.target.value) || 1))}
                    className="h-9 text-xs"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Children (Under 12)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={children}
                    onChange={e => setChildren(Math.max(0, parseInt(e.target.value) || 0))}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <Label className="text-xs font-semibold text-muted-foreground">Total Party Count</Label>
                  <div className="h-9 px-3 flex items-center font-bold text-xs bg-background-alt border border-border rounded-md">
                    <GuestsIcon className="h-3.5 w-3.5 mr-1.5 text-primary" />
                    {totalGuests} Guest(s)
                  </div>
                </div>
              </div>

              {/* Estimated Tour Value Preview */}
              {selectedTour && (
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Package Unit Rate:</span>
                    <span className="font-semibold text-foreground">{selectedTour.price || 'Custom Quote'}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground block text-[11px]">Estimated Tour Value:</span>
                    <span className="font-bold text-primary text-sm font-serif">
                      {estimatedTotal > 0 ? `$${estimatedTotal.toFixed(2)} USD` : 'Custom Quote'}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 3: Expedition Dates & Rescheduling */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                3. Expedition Schedule &amp; Dates
              </CardTitle>
              <CardDescription className="text-xs">
                Scheduled tour departure and date shift management.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Tour Start Date *</Label>
                  <Input
                    type="date"
                    value={tourDate}
                    onChange={e => setTourDate(e.target.value)}
                    required
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Tour End Date (Multi-Day Tours)</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    min={tourDate || undefined}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              {/* Date Changed Banner & Audit Reason Box */}
              {isDateChanged && (
                <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-3">
                  <div className="flex items-center gap-2 text-amber-500 font-semibold text-xs">
                    <History className="h-4 w-4" />
                    Date Change Detected ({initialTourDate} ➔ {tourDate})
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">Reason for Date Reschedule</Label>
                    <Input
                      placeholder="e.g. Traveler requested weekend reschedule due to flight changes"
                      value={rescheduleReason}
                      onChange={e => setRescheduleReason(e.target.value)}
                      className="h-8 text-xs bg-background"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="notifyTraveler"
                      checked={sendConfirmationEmail}
                      onCheckedChange={c => setSendConfirmationEmail(Boolean(c))}
                    />
                    <Label htmlFor="notifyTraveler" className="text-xs text-muted-foreground cursor-pointer">
                      Send automated reschedule confirmation email with calendar updates to traveler
                    </Label>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 4: Special Notes & Message */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                4. Traveler Special Requests &amp; Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <Textarea
                rows={3}
                placeholder="Dietary requests, hotel pickup location, private gemologist requirements..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="text-xs resize-none"
              />
            </CardContent>
          </Card>

          {/* Card 5: Internal Admin & Concierge Notes */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <StickyNote className="h-4 w-4 text-primary" />
                5. Internal Admin &amp; Staff Notes (Private)
              </CardTitle>
              <CardDescription className="text-xs">
                Private notes for internal operations, driver assignments, or balance collections. Not visible to traveler.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <Textarea
                rows={3}
                placeholder="e.g. VIP pickup arranged at 07:00 AM from Cinnamon Grand. Cash balance to collect: $120."
                value={adminNotes}
                onChange={e => setAdminNotes(e.target.value)}
                className="text-xs leading-relaxed"
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar: Status, Source & Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Status & Lifecycle Management Card */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                Booking Status
              </CardTitle>
              <CardDescription className="text-xs">
                Control the active state of this reservation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Current State *</Label>
                <Select value={status} onValueChange={(val: Booking['status']) => setStatus(val)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending Review</SelectItem>
                    <SelectItem value="confirmed">Confirmed &amp; Accepted</SelectItem>
                    <SelectItem value="rescheduled">Rescheduled</SelectItem>
                    <SelectItem value="completed">Tour Completed</SelectItem>
                    <SelectItem value="rejected">Rejected / Declined</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Booking Source</Label>
                <Select value={bookingSource} onValueChange={setBookingSource}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">Website Booking Engine</SelectItem>
                    <SelectItem value="airbnb">Airbnb Experiences</SelectItem>
                    <SelectItem value="booking_com">Booking.com</SelectItem>
                    <SelectItem value="agoda">Agoda</SelectItem>
                    <SelectItem value="viator">Viator / TripAdvisor</SelectItem>
                    <SelectItem value="phone_direct">Direct VIP Phone / Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">External Reservation Ref #</Label>
                <Input
                  placeholder="e.g. HM-AIRBNB-9021"
                  value={externalBookingId}
                  onChange={e => setExternalBookingId(e.target.value)}
                  className="h-9 text-xs font-mono"
                />
              </div>
            </CardContent>
          </Card>

          {/* Linked Official Invoice Status */}
          <Card className="border-primary/40 bg-card shadow-sm">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Receipt className="h-4 w-4 text-primary" />
                Linked Billing Invoice
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4 text-xs">
              {invoiceNumber ? (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Invoice Ref:</span>
                    <span className="font-mono font-bold text-foreground">{invoiceNumber}</span>
                  </div>
                  <Button asChild size="sm" className="w-full text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                    <Link href={`/invoices/${invoiceNumber}`} target="_blank">
                      View Printable Statement &rarr;
                    </Link>
                  </Button>
                </>
              ) : (
                <div className="space-y-2 text-center py-2">
                  <p className="text-muted-foreground">
                    No official invoice issued yet for this reservation.
                  </p>
                  <Button asChild size="sm" className="w-full text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                    <Link href={`/admin/invoices/create?booking_id=${id}`}>
                      <Sparkles className="h-3.5 w-3.5 mr-1" />
                      Create Invoice Now
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submission Card */}
          <Card className="border-border shadow-sm">
            <CardContent className="p-4 space-y-3">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-10 shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save All Changes
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/admin/booking-requests/${id}/view`)}
                className="w-full text-xs h-9"
              >
                Cancel &amp; Return
              </Button>
            </CardContent>
          </Card>

        </div>
      </form>
    </div>
  );
}
