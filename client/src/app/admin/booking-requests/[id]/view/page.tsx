'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';

import { type Booking } from '@/lib/bookings-data';
import { type Invoice, mapServerInvoiceToClient, formatCurrency } from '@/lib/invoices-data';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Edit, 
  LoaderCircle, 
  User, 
  Mail, 
  Phone, 
  Home, 
  Ticket, 
  Calendar, 
  Users as GuestsIcon, 
  MessageSquare, 
  Check, 
  X, 
  Globe, 
  Receipt, 
  ExternalLink, 
  Send, 
  CalendarDays, 
  History,
  Sparkles,
  StickyNote,
  Save
} from 'lucide-react';
import { mapServerPackageToClient as mapServerPackage, type TourPackage } from '@/lib/packages-data';
import { RescheduleBookingDialog } from '@/components/admin/RescheduleBookingDialog';
import { API_BASE_URL } from '@/lib/utils';
import { authFetch } from '@/lib/api';

const InfoRow = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | number | undefined | null }) => (
    <div className="flex items-start">
        <Icon className="h-5 w-5 text-muted-foreground mr-4 mt-1 flex-shrink-0" />
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-medium text-foreground">{value || 'N/A'}</p>
        </div>
    </div>
);

export default function ViewBookingPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const id = params.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [tourPackages, setTourPackages] = useState<TourPackage[]>([]);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);

  useEffect(() => {
    async function fetchTourPackages() {
      try {
        const response = await fetch(`${API_BASE_URL}/tours`);
        if (response.ok) {
            const serverData = await response.json();
            if (Array.isArray(serverData)) {
                setTourPackages(serverData.map(mapServerPackage));
            }
        }
      } catch (e) { console.error("Could not fetch tour packages", e); }
    }
    fetchTourPackages();
  }, []);

  async function fetchBookingAndInvoice() {
    if (!id) return;
    setIsLoading(true);
    try {
      // 1. Fetch Booking
      const response = await authFetch(`${API_BASE_URL}/bookings/${id}`);
      if (!response.ok) throw new Error('Booking not found');
      
      const serverBooking = await response.json();
      const bookingData = serverBooking.booking || serverBooking;

      const clientBooking: Booking = {
        id: Number(bookingData.id),
        user_id: bookingData.user_id,
        name: bookingData.name,
        email: bookingData.email,
        phone: bookingData.phone,
        address: bookingData.address,
        tourType: Number(bookingData.tour_package_id),
        tourTitle: bookingData.tour_title,
        adults: Number(bookingData.adults),
        children: Number(bookingData.children),
        guests: Number(bookingData.guests),
        date: bookingData.tour_date,
        end_date: bookingData.end_date,
        message: bookingData.message,
        status: bookingData.status,
        booking_source: bookingData.booking_source || 'website',
        external_booking_id: bookingData.external_booking_id,
        reschedule_reason: bookingData.reschedule_reason,
        original_tour_date: bookingData.original_tour_date,
        rescheduled_at: bookingData.rescheduled_at,
        invoice_id: bookingData.invoice_id ? Number(bookingData.invoice_id) : null,
        invoice_number: bookingData.invoice_number,
        invoice_payment_status: bookingData.invoice_payment_status,
        invoice_total: bookingData.invoice_total ? parseFloat(bookingData.invoice_total) : null,
        admin_notes: bookingData.admin_notes || null,
      };
      setBooking(clientBooking);
      setAdminNotes(bookingData.admin_notes || '');

      // 2. Fetch Linked Invoice if exists
      try {
        const invRes = await authFetch(`${API_BASE_URL}/invoices/by-booking/${id}`);
        if (invRes.ok) {
          const invData = await invRes.json();
          setInvoice(mapServerInvoiceToClient(invData));
        } else {
          setInvoice(null);
        }
      } catch {
        setInvoice(null);
      }
    } catch (error) {
      console.error("Failed to load booking data:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load booking data.' });
      setBooking(null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchBookingAndInvoice();
  }, [id]);

  const handleStatusChange = async (status: 'accepted' | 'rejected') => {
    if (!booking) return;

    setIsUpdatingStatus(true);
    try {
      const response = await authFetch(`${API_BASE_URL}/bookings/${booking.id}/status/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to update booking status.');
      }
      toast({ title: `Booking ${status}`, description: `The booking has been marked as ${status}.` });
      setBooking(prev => prev ? { ...prev, status } : null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Could not update booking status.";
      toast({ variant: 'destructive', title: 'Error', description: errorMessage });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSendInvoiceEmail = async () => {
    if (!invoice) return;
    setIsSendingEmail(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/invoices/${invoice.id}/send-email/`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to send invoice email.');
      toast({
        title: '✉️ Invoice Dispatched',
        description: `Official invoice email sent to ${invoice.customer_email}.`,
      });
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: e instanceof Error ? e.message : 'Could not send invoice email.',
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleSaveAdminNotes = async () => {
    if (!booking) return;
    setIsSavingNotes(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/bookings/${booking.id}/notes/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_notes: adminNotes.trim() }),
      });

      if (!res.ok) throw new Error('Failed to save internal notes.');

      setBooking(prev => prev ? { ...prev, admin_notes: adminNotes.trim() } : null);
      toast({
        title: '📝 Internal Notes Saved',
        description: `Concierge notes updated for booking #${booking.id}.`,
      });
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Error Saving Notes',
        description: e instanceof Error ? e.message : 'Could not save internal notes.',
      });
    } finally {
      setIsSavingNotes(false);
    }
  };
  
  const getStatusBadgeVariant = (status: Booking['status']) => {
    switch (status) {
      case 'accepted': 
      case 'confirmed':
        return 'default';
      case 'rescheduled':
        return 'secondary';
      case 'rejected': 
        return 'destructive';
      case 'pending':
      default: 
        return 'secondary';
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full py-32"><LoaderCircle className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  if (!booking) {
    return (
        <div className="flex flex-col items-center justify-center h-full py-32 gap-4">
            <p className="text-xl">Booking not found.</p>
            <Button onClick={() => router.push('/admin/booking-requests')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Requests
            </Button>
        </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push('/admin/booking-requests')}>
              <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary font-serif">Booking Details</h1>
                <Badge variant={getStatusBadgeVariant(booking.status)} className="capitalize">
                  {booking.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">Reference: #ST-BK-{booking.id}</p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsRescheduleOpen(true)}
            className="gap-1.5 text-xs text-amber-500 border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-400"
          >
            <CalendarDays className="h-4 w-4" />
            Reschedule Dates
          </Button>

          <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
            <Link href={`/admin/booking-requests/${booking.id}/edit`}>
              <Edit className="h-4 w-4" />
              Edit Booking
            </Link>
          </Button>
        </div>
      </div>

      {/* Reschedule Notification Banner (if booking was rescheduled) */}
      {(booking.status === 'rescheduled' || booking.original_tour_date) && (
        <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 text-foreground space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-amber-500 text-sm">
              <History className="h-4 w-4" />
              Tour Reschedule Record
            </div>
            {booking.rescheduled_at && (
              <span className="text-[11px] text-muted-foreground font-mono">
                Updated: {format(parseISO(booking.rescheduled_at), 'PPP p')}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Original Date: <span className="line-through text-rose-400 font-medium">{booking.original_tour_date ? format(parseISO(booking.original_tour_date), 'PPP') : 'N/A'}</span> ➔ <strong className="text-emerald-400">Current Confirmed: {format(parseISO(booking.date), 'PPP')}</strong>
          </p>
          {booking.reschedule_reason && (
            <p className="text-xs text-foreground italic pt-1">
              &quot;{booking.reschedule_reason}&quot;
            </p>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Left Column: Traveler & Tour info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-base font-semibold">Traveler Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <InfoRow icon={User} label="Full Name" value={booking.name} />
              <InfoRow icon={Mail} label="Email Address" value={booking.email} />
              <InfoRow icon={Phone} label="Phone Number" value={booking.phone} />
              <InfoRow icon={Home} label="Address / Country" value={booking.address} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-base font-semibold">Tour Package &amp; Schedule Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <InfoRow icon={Ticket} label="Tour Package" value={booking.tourTitle} />
              <InfoRow 
                icon={Calendar} 
                label="Scheduled Tour Date" 
                value={
                  booking.end_date && booking.end_date !== booking.date
                    ? `${format(parseISO(booking.date), 'PPP')} to ${format(parseISO(booking.end_date), 'PPP')}`
                    : format(parseISO(booking.date), 'PPP')
                } 
              />
              <InfoRow icon={GuestsIcon} label="Total Travelers" value={`${booking.guests} Person(s) (${booking.adults || 1} Adults, ${booking.children || 0} Children)`} />
              <InfoRow icon={Globe} label="Booking Source" value={booking.booking_source ? booking.booking_source.toUpperCase() : 'WEBSITE'} />
              {booking.external_booking_id && (
                <InfoRow icon={Ticket} label="External Reservation ID" value={booking.external_booking_id} />
              )}
            </CardContent>
          </Card>

          {booking.message && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Traveler's Special Requests</CardTitle></CardHeader>
              <CardContent className="flex items-start gap-4">
                <MessageSquare className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                <p className="text-muted-foreground italic text-sm">&quot;{booking.message}&quot;</p>
              </CardContent>
            </Card>
          )}

          {/* Internal Admin & Concierge Notes */}
          <Card className="border-border">
            <CardHeader className="pb-3 border-b border-border/50 flex flex-row items-center justify-between">
              <div className="space-y-0.5">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <StickyNote className="h-4 w-4 text-primary" />
                  Internal Admin &amp; Staff Notes
                </CardTitle>
                <CardDescription className="text-xs">
                  Private operational notes, VIP arrangements, guide assignments, or special instructions (Not visible to traveler).
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <Textarea
                placeholder="e.g. VIP pickup arranged from Cinnamon Grand at 07:00 AM. Sinhala/German guide assigned. Cash balance to collect: $100."
                value={adminNotes}
                onChange={e => setAdminNotes(e.target.value)}
                rows={4}
                className="text-xs leading-relaxed font-sans"
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={handleSaveAdminNotes}
                  disabled={isSavingNotes}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-8"
                >
                  {isSavingNotes ? (
                    <>
                      <LoaderCircle className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Saving Notes...
                    </>
                  ) : (
                    <>
                      <Save className="mr-1.5 h-3.5 w-3.5" />
                      Save Internal Notes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right Sidebar: Status & Official Invoice Card */}
        <div className="lg:col-span-1 space-y-6">
          {/* Status Actions Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/50">
              <CardTitle className="text-base font-semibold">Booking State</CardTitle>
              <Badge variant={getStatusBadgeVariant(booking.status)} className="capitalize">{booking.status}</Badge>
            </CardHeader>
            <CardContent className="pt-4 text-xs text-muted-foreground">
              Manage the acceptance and scheduling lifecycle for this reservation.
            </CardContent>
            <CardFooter className="flex flex-col gap-2 pt-0">
              <Button onClick={() => handleStatusChange('accepted')} className="w-full text-xs" disabled={isUpdatingStatus || booking.status === 'accepted'}>
                {isUpdatingStatus ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin"/> : <Check className="mr-2 h-4 w-4" />}
                Confirm / Accept Booking
              </Button>
              <Button 
                onClick={() => setIsRescheduleOpen(true)} 
                variant="outline" 
                className="w-full text-xs text-amber-500 border-amber-500/30 hover:bg-amber-500/10"
              >
                <CalendarDays className="mr-2 h-4 w-4" />
                Reschedule Tour Dates
              </Button>
              <Button onClick={() => handleStatusChange('rejected')} variant="destructive" className="w-full text-xs" disabled={isUpdatingStatus || booking.status === 'rejected'}>
                {isUpdatingStatus ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin"/> : <X className="mr-2 h-4 w-4" />}
                Reject Booking
              </Button>
            </CardFooter>
          </Card>

          {/* Official Invoice Card */}
          <Card className="border-primary/40 shadow-sm bg-card">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Receipt className="h-4 w-4 text-primary" />
                Official Billing Invoice
              </CardTitle>
              <CardDescription className="text-xs">
                {invoice ? 'Formal tax invoice linked to this booking.' : 'No invoice generated yet.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs">
              {invoice ? (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Invoice Number:</span>
                    <span className="font-mono font-bold text-foreground">{invoice.invoice_number}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Payment Status:</span>
                    <Badge className={
                      invoice.payment_status === 'paid' 
                        ? 'bg-emerald-600 text-white' 
                        : invoice.payment_status === 'partially_paid' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-amber-600 text-white'
                    }>
                      {invoice.payment_status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Invoiced:</span>
                    <span className="font-bold text-primary text-sm">{formatCurrency(invoice.total_amount, invoice.currency)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Balance Due:</span>
                    <span className="font-semibold text-foreground">{formatCurrency(invoice.balance_due, invoice.currency)}</span>
                  </div>

                  <div className="pt-2 border-t border-border/50 flex flex-col gap-2">
                    <Button asChild size="sm" className="w-full text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                      <a href={`/invoices/${invoice.invoice_number}`} target="_blank" rel="noreferrer">
                        <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                        View / Print Digital Invoice
                      </a>
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button asChild variant="outline" size="sm" className="text-xs">
                        <Link href={`/admin/invoices/edit/${invoice.id}`}>
                          <Edit className="h-3.5 w-3.5 mr-1" />
                          Edit
                        </Link>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleSendInvoiceEmail}
                        disabled={isSendingEmail}
                        className="text-xs text-primary border-primary/30 hover:bg-primary/10"
                      >
                        {isSendingEmail ? <LoaderCircle className="h-3.5 w-3.5 animate-spin mr-1" /> : <Send className="h-3.5 w-3.5 mr-1" />}
                        Email Client
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-3 space-y-3">
                  <p className="text-muted-foreground">
                    Create an itemized luxury invoice with custom line items, currency, and discounts.
                  </p>
                  <Button asChild size="sm" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs">
                    <Link href={`/admin/invoices/create?booking_id=${booking.id}`}>
                      <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                      Generate Official Invoice
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reschedule Modal Dialog */}
      <RescheduleBookingDialog
        isOpen={isRescheduleOpen}
        onClose={() => setIsRescheduleOpen(false)}
        booking={booking}
        onRescheduleSuccess={() => fetchBookingAndInvoice()}
      />
    </div>
  );
}
