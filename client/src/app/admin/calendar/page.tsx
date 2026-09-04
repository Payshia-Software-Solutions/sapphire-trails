'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { type Booking } from '@/lib/bookings-data';
import { mapServerPackageToClient as mapServerPackage, type TourPackage } from '@/lib/packages-data';
import { BookingCalendarView } from '@/components/admin/BookingCalendarView';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  CalendarDays, 
  RefreshCw, 
  List, 
  Users, 
  LoaderCircle,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { API_BASE_URL } from '@/lib/utils';
import { authFetch } from '@/lib/api';

const ADMIN_SESSION_KEY = 'adminUser';

const mapServerBookingToClient = (serverBooking: any): Booking => ({
  id: Number(serverBooking.id),
  user_id: serverBooking.user_id,
  name: serverBooking.name,
  email: serverBooking.email,
  phone: serverBooking.phone,
  tourType: Number(serverBooking.tour_package_id),
  tourTitle: serverBooking.tour_title,
  guests: Number(serverBooking.guests),
  date: serverBooking.tour_date,
  end_date: serverBooking.end_date,
  message: serverBooking.message,
  status: serverBooking.status,
  booking_source: serverBooking.booking_source || 'website',
  external_booking_id: serverBooking.external_booking_id,
  reschedule_reason: serverBooking.reschedule_reason,
  original_tour_date: serverBooking.original_tour_date,
  rescheduled_at: serverBooking.rescheduled_at,
  invoice_id: serverBooking.invoice_id ? Number(serverBooking.invoice_id) : null,
  invoice_number: serverBooking.invoice_number,
  invoice_payment_status: serverBooking.invoice_payment_status,
  invoice_total: serverBooking.invoice_total ? parseFloat(serverBooking.invoice_total) : null,
});

export default function BookingCalendarPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tourPackages, setTourPackages] = useState<TourPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const adminUser = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!adminUser) {
      router.push('/auth');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [bookingsRes, packagesRes] = await Promise.all([
        authFetch(`${API_BASE_URL}/bookings`),
        fetch(`${API_BASE_URL}/tours`),
      ]);

      if (bookingsRes.ok) {
        const bData = await bookingsRes.json();
        if (Array.isArray(bData)) {
          setBookings(bData.map(mapServerBookingToClient));
        }
      }

      if (packagesRes.ok) {
        const pData = await packagesRes.json();
        if (Array.isArray(pData)) {
          setTourPackages(pData.map(mapServerPackage));
        }
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load booking schedule from server.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, fetchData]);

  if (!isAuthenticated) return null;

  return (
    <div className="space-y-6 w-full max-w-[1600px] mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <CalendarDays className="h-7 w-7 text-primary" />
            Tour Booking Calendar
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Visual schedule of scheduled gem tours, multi-day itineraries, and OTA calendar bookings.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-10 text-xs gap-1.5 bg-background"
          >
            <Link href="/admin/booking-requests">
              <List className="h-4 w-4" />
              Table View
            </Link>
          </Button>

          <Button
            size="sm"
            asChild
            className="h-10 text-xs gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Link href="/admin/invoices">
              <Plus className="h-4 w-4" />
              Create Invoice
            </Link>
          </Button>
        </div>
      </div>

      {isLoading && bookings.length === 0 ? (
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <div className="flex flex-col items-center gap-3 animate-pulse">
            <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm font-medium">Loading interactive booking calendar...</p>
          </div>
        </div>
      ) : (
        <BookingCalendarView
          bookings={bookings}
          tourPackages={tourPackages}
          onRefresh={fetchData}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
