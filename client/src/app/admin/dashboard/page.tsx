'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { type Booking } from '@/lib/bookings-data';
import { type Invoice, mapServerInvoiceToClient, formatCurrency } from '@/lib/invoices-data';
import { mapServerPackageToClient as mapServerPackage, type TourPackage } from '@/lib/packages-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  LoaderCircle, 
  DollarSign, 
  Compass, 
  MessageSquare, 
  Calendar, 
  CalendarDays,
  TrendingUp, 
  ArrowUpRight, 
  Plus, 
  RefreshCw, 
  Receipt, 
  Mail, 
  Layers, 
  Sparkles, 
  AlertCircle,
  FileText,
  ShieldCheck,
  Globe,
  Settings,
  ChevronRight,
  UserCheck
} from 'lucide-react';

import { subDays, format, parseISO, isAfter, differenceInDays } from 'date-fns';
import placeholderImages from '@/lib/placeholder-images.json';

import { BookingVolumeChart } from '@/components/admin/charts/booking-volume-chart';
import { BookingStatusChart } from '@/components/admin/charts/booking-status-chart';
import { TourPopularityChart } from '@/components/admin/charts/tour-popularity-chart';
import { RevenueStatusChart } from '@/components/admin/charts/revenue-status-chart';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/utils';
import { authFetch } from '@/lib/api';

const ADMIN_SESSION_KEY = 'adminUser';

interface ContactSubmission {
  id: number;
  name: string;
  email: string;
  phone?: string;
  tour_interest?: string;
  subject?: string;
  message: string;
  status?: 'unread' | 'read' | 'replied' | 'resolved' | 'pending';
  created_at: string;
}


const mapServerBookingToClient = (serverBooking: any): Booking => ({
  id: Number(serverBooking.id),
  name: serverBooking.name || 'Guest',
  email: serverBooking.email || '',
  phone: serverBooking.phone,
  tourType: Number(serverBooking.tour_package_id || serverBooking.tourType || 0),
  tourTitle: serverBooking.tour_title,
  guests: Number(serverBooking.guests || 1),
  date: serverBooking.tour_date || serverBooking.date || '',
  message: serverBooking.message,
  status: serverBooking.status || 'pending',
  booking_source: serverBooking.booking_source || 'website',
  invoice_id: serverBooking.invoice_id ? Number(serverBooking.invoice_id) : null,
  invoice_number: serverBooking.invoice_number,
  invoice_payment_status: serverBooking.invoice_payment_status,
  invoice_total: serverBooking.invoice_total ? Number(serverBooking.invoice_total) : null,
});

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminName, setAdminName] = useState<string>('Administrator');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Data states
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tourPackages, setTourPackages] = useState<TourPackage[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);

  // Timeframe filter for charts
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | 'all'>('7d');

  useEffect(() => {
    const adminUser = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!adminUser) {
      router.push('/auth');
    } else {
      try {
        const parsed = JSON.parse(adminUser);
        if (parsed.name) setAdminName(parsed.name);
      } catch (e) {
        // Fallback
      }
      setIsAuthenticated(true);
    }
  }, [router]);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const [bookingsRes, packagesRes, invoicesRes, contactsRes] = await Promise.allSettled([
        authFetch(`${API_BASE_URL}/bookings`),
        authFetch(`${API_BASE_URL}/tours`),
        authFetch(`${API_BASE_URL}/invoices`),
        authFetch(`${API_BASE_URL}/contacts`),
      ]);

      // Process Bookings
      if (bookingsRes.status === 'fulfilled' && bookingsRes.value.ok) {
        const data = await bookingsRes.value.json();
        if (Array.isArray(data)) {
          setBookings(data.map(mapServerBookingToClient));
        }
      }

      // Process Packages
      if (packagesRes.status === 'fulfilled' && packagesRes.value.ok) {
        const data = await packagesRes.value.json();
        if (Array.isArray(data)) {
          setTourPackages(data.map(mapServerPackage));
        }
      }

      // Process Invoices
      if (invoicesRes.status === 'fulfilled' && invoicesRes.value.ok) {
        const data = await invoicesRes.value.json();
        if (Array.isArray(data)) {
          setInvoices(data.map(mapServerInvoiceToClient));
        }
      }

      // Process Contacts
      if (contactsRes.status === 'fulfilled' && contactsRes.value.ok) {
        const data = await contactsRes.value.json();
        if (Array.isArray(data)) {
          setContacts(data);
        }
      }

      if (isRefresh) {
        toast({
          title: 'Dashboard Updated',
          description: 'Latest operational metrics synchronized successfully.',
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast({
        variant: 'destructive',
        title: 'Error Syncing Dashboard',
        description: 'Could not load the latest data from server.',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, fetchData]);

  // Greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Filtered and aggregated analytics
  const analytics = useMemo(() => {
    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter((b) => b.status === 'pending').length;
    const acceptedBookings = bookings.filter((b) => b.status === 'accepted' || b.status === 'confirmed').length;
    const rejectedBookings = bookings.filter((b) => b.status === 'rejected' || b.status === 'cancelled').length;
    const rescheduledBookings = bookings.filter((b) => b.status === 'rescheduled').length;

    // Financial calculations
    const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
    const totalPaid = invoices.reduce((sum, inv) => sum + (inv.amount_paid || 0), 0);
    const totalDue = invoices.reduce((sum, inv) => sum + (inv.balance_due || 0), 0);
    const unpaidInvoicesCount = invoices.filter((inv) => inv.payment_status === 'unpaid').length;
    const paidInvoicesCount = invoices.filter((inv) => inv.payment_status === 'paid').length;
    const partiallyPaidCount = invoices.filter((inv) => inv.payment_status === 'partially_paid').length;
    const refundedCount = invoices.filter((inv) => inv.payment_status === 'refunded' || inv.payment_status === 'cancelled').length;

    const collectionRate = totalInvoiced > 0 ? Math.round((totalPaid / totalInvoiced) * 100) : 0;

    // Timeframe-based Booking Volume Data
    let daysCount = 7;
    if (timeframe === '30d') daysCount = 30;
    if (timeframe === '90d') daysCount = 90;
    if (timeframe === 'all') daysCount = 30;

    const daysArray = Array.from({ length: daysCount }, (_, i) => subDays(new Date(), i)).reverse();
    const volumeData = daysArray.map((day) => {
      const dayString = format(day, 'yyyy-MM-dd');
      const count = bookings.filter((b) => b.date === dayString).length;
      return {
        date: daysCount > 14 ? format(day, 'MMM d') : format(day, 'EEE d'),
        fullDate: format(day, 'MMMM d, yyyy'),
        bookings: count,
      };
    });

    // Booking Status Distribution
    const statusData = [
      { status: 'pending', value: pendingBookings, fill: '#f59e0b' },
      { status: 'confirmed', value: acceptedBookings, fill: '#10b981' },
      { status: 'rescheduled', value: rescheduledBookings, fill: '#3b82f6' },
      { status: 'rejected', value: rejectedBookings, fill: '#ef4444' },
    ];

    // Revenue Status Breakdown
    const revenueStatusData = [
      {
        status: 'paid',
        label: 'Paid',
        amount: invoices.filter((i) => i.payment_status === 'paid').reduce((s, i) => s + (i.amount_paid || 0), 0),
        count: paidInvoicesCount,
        fill: '#10b981',
      },
      {
        status: 'unpaid',
        label: 'Unpaid / Due',
        amount: invoices.filter((i) => i.payment_status === 'unpaid').reduce((s, i) => s + (i.balance_due || 0), 0),
        count: unpaidInvoicesCount,
        fill: '#f59e0b',
      },
      {
        status: 'partially_paid',
        label: 'Partially Paid',
        amount: invoices.filter((i) => i.payment_status === 'partially_paid').reduce((s, i) => s + (i.amount_paid || 0), 0),
        count: partiallyPaidCount,
        fill: '#3b82f6',
      },
      {
        status: 'refunded',
        label: 'Refunded / Cancelled',
        amount: invoices.filter((i) => i.payment_status === 'refunded' || i.payment_status === 'cancelled').reduce((s, i) => s + (i.total_amount || 0), 0),
        count: refundedCount,
        fill: '#ef4444',
      },
    ];

    // Tour Popularity
    const tourCounts = bookings.reduce((acc, booking) => {
      const tour = tourPackages.find((p) => p.id === booking.tourType);
      const tourName = tour ? tour.homepageTitle : (booking.tourTitle || `Tour #${booking.tourType}`);
      acc[tourName] = (acc[tourName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const tourData = Object.entries(tourCounts).map(([name, count]) => ({
      name,
      bookings: count,
    }));

    // Top tour package name
    let topTourName = 'N/A';
    let topTourCount = 0;
    Object.entries(tourCounts).forEach(([name, count]) => {
      if (count > topTourCount) {
        topTourCount = count;
        topTourName = name;
      }
    });

    // Recent Bookings (Last 6)
    const recentBookings = [...bookings]
      .sort((a, b) => {
        const dateA = a.date ? parseISO(a.date).getTime() : 0;
        const dateB = b.date ? parseISO(b.date).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 6);

    // Recent Invoices (Last 5)
    const recentInvoices = [...invoices]
      .sort((a, b) => {
        const dateA = a.created_at ? parseISO(a.created_at).getTime() : 0;
        const dateB = b.created_at ? parseISO(b.created_at).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 5);

    // Customer Inquiries calculations
    const unreadContactsCount = contacts.filter((c) => c.status === 'unread' || !c.status).length;
    const repliedContactsCount = contacts.filter((c) => c.status === 'replied' || c.status === 'resolved').length;
    const readContactsCount = contacts.filter((c) => c.status === 'read').length;

    // Recent Inquiries (Last 5)
    const recentContacts = [...contacts]
      .sort((a, b) => {
        const dateA = a.created_at ? parseISO(a.created_at).getTime() : 0;
        const dateB = b.created_at ? parseISO(b.created_at).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 5);

    return {
      totalBookings,
      pendingBookings,
      acceptedBookings,
      rejectedBookings,
      rescheduledBookings,
      totalInvoiced,
      totalPaid,
      totalDue,
      unpaidInvoicesCount,
      collectionRate,
      volumeData,
      statusData,
      revenueStatusData,
      tourData,
      topTourName,
      topTourCount,
      recentBookings,
      recentInvoices,
      recentContacts,
      totalContacts: contacts.length,
      unreadContactsCount,
      repliedContactsCount,
      readContactsCount,
      totalPackages: tourPackages.length,
    };
  }, [bookings, tourPackages, invoices, contacts, timeframe]);

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[500px] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground animate-pulse">
          <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-medium">Loading executive dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-12 max-w-[1600px] mx-auto w-full">
      {/* 1. Header & Welcome Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {greeting}, <span className="text-primary">{adminName}</span>
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Sync
            </span>
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" />
            {format(new Date(), 'EEEE, MMMM d, yyyy')} • Sapphire Trails Management Command Center
          </p>
        </div>

        {/* Quick Actions & Refresh */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData(true)}
            disabled={isRefreshing}
            className="gap-1.5 bg-background shadow-xs hover:bg-muted"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
          </Button>

          <Button asChild size="sm" variant="outline" className="gap-1.5 bg-background shadow-xs">
            <Link href="/admin/calendar">
              <CalendarDays className="h-3.5 w-3.5 text-primary" />
              <span>Calendar</span>
            </Link>
          </Button>

          <Button asChild size="sm" variant="outline" className="gap-1.5 bg-background shadow-xs">
            <Link href="/admin/invoices">
              <Receipt className="h-3.5 w-3.5 text-emerald-600" />
              <span>Invoices</span>
            </Link>
          </Button>

          <Button asChild size="sm" className="gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
            <Link href="/admin/booking-requests">
              <Users className="h-3.5 w-3.5" />
              <span>Review Bookings</span>
            </Link>
          </Button>
        </div>
      </div>


      {/* 2. Action Required Alert Center (if any items require attention) */}
      {(analytics.pendingBookings > 0 || analytics.unpaidInvoicesCount > 0 || analytics.unreadContactsCount > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {analytics.pendingBookings > 0 && (
            <Link
              href="/admin/booking-requests"
              className="group flex items-center justify-between p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 transition-all shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-amber-900 dark:text-amber-300">
                    {analytics.pendingBookings} Pending Booking{analytics.pendingBookings !== 1 ? 's' : ''}
                  </h4>
                  <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80">Requires approval & scheduling</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-amber-600/70 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}

          {analytics.unpaidInvoicesCount > 0 && (
            <Link
              href="/admin/invoices"
              className="group flex items-center justify-between p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10 transition-all shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-rose-900 dark:text-rose-300">
                    {analytics.unpaidInvoicesCount} Unpaid Invoice{analytics.unpaidInvoicesCount !== 1 ? 's' : ''}
                  </h4>
                  <p className="text-[11px] text-rose-700/80 dark:text-rose-400/80">
                    Total Due: {formatCurrency(analytics.totalDue)}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-rose-600/70 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}

          {analytics.unreadContactsCount > 0 && (
            <Link
              href="/admin/contact-submissions"
              className="group flex items-center justify-between p-3.5 rounded-xl border border-sky-500/30 bg-sky-500/5 hover:bg-sky-500/10 transition-all shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-sky-900 dark:text-sky-300">
                    {analytics.unreadContactsCount} Unread Inquir{analytics.unreadContactsCount !== 1 ? 'ies' : 'y'}
                  </h4>
                  <p className="text-[11px] text-sky-700/80 dark:text-sky-400/80">Awaiting team response</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-sky-600/70 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}
        </div>
      )}

      {/* 3. Executive KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Bookings */}
        <Card className="relative overflow-hidden border bg-card hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 h-24 w-24 bg-primary/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Bookings</span>
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold tracking-tight text-foreground">{analytics.totalBookings}</div>
              <Badge variant="outline" className="font-semibold text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200">
                {analytics.acceptedBookings} Confirmed
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
              <span className="flex items-center gap-1 text-amber-600 font-medium">
                <Clock className="h-3 w-3" />
                {analytics.pendingBookings} Pending
              </span>
              <span>{analytics.rejectedBookings} Cancelled</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 2: Total Revenue */}
        <Card className="relative overflow-hidden border bg-card hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-500/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Invoiced Revenue</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold tracking-tight text-foreground">
                {formatCurrency(analytics.totalInvoiced)}
              </div>
              <Badge variant="outline" className="font-semibold text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200">
                {analytics.collectionRate}% Paid
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
              <span className="text-emerald-600 font-medium">Paid: {formatCurrency(analytics.totalPaid)}</span>
              <span className="text-rose-500 font-medium">Due: {formatCurrency(analytics.totalDue)}</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 3: Tour Packages */}
        <Card className="relative overflow-hidden border bg-card hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 h-24 w-24 bg-amber-500/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Active Packages</span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Compass className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold tracking-tight text-foreground">{analytics.totalPackages}</div>
              <Badge variant="outline" className="font-semibold text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200">
                Active Tours
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
              <span className="truncate max-w-[170px]" title={analytics.topTourName}>
                Top: <strong className="text-foreground">{analytics.topTourName}</strong>
              </span>
              <span className="font-semibold text-primary shrink-0">{analytics.topTourCount} bookings</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 4: Customer Inquiries with Status */}
        <Card className="relative overflow-hidden border bg-card hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 h-24 w-24 bg-sky-500/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Inquiries & Leads</span>
            <div className="h-8 w-8 rounded-lg bg-sky-500/10 text-sky-600 flex items-center justify-center">
              <MessageSquare className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold tracking-tight text-foreground">{analytics.totalContacts}</div>
              {analytics.unreadContactsCount > 0 ? (
                <Badge variant="outline" className="font-semibold text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-300 animate-pulse">
                  {analytics.unreadContactsCount} Unread
                </Badge>
              ) : (
                <Badge variant="outline" className="font-semibold text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300">
                  All Handled
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
              <span className="flex items-center gap-1 text-amber-600 font-medium">
                <Clock className="h-3 w-3" />
                {analytics.unreadContactsCount} Unread
              </span>
              <span className="text-emerald-600 font-medium">{analytics.repliedContactsCount} Replied</span>
            </div>
          </CardContent>
        </Card>
      </div>


      {/* 4. Interactive Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Booking Volume & Activity Trend */}
        <Card className="lg:col-span-2 border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-base font-semibold">Booking Frequency & Trends</CardTitle>
              <CardDescription className="text-xs">
                Real-time booking distribution over selected timeline
              </CardDescription>
            </div>
            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border">
              <Button
                variant={timeframe === '7d' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setTimeframe('7d')}
                className="h-7 px-2.5 text-xs font-medium rounded-md"
              >
                7 Days
              </Button>
              <Button
                variant={timeframe === '30d' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setTimeframe('30d')}
                className="h-7 px-2.5 text-xs font-medium rounded-md"
              >
                30 Days
              </Button>
              <Button
                variant={timeframe === '90d' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setTimeframe('90d')}
                className="h-7 px-2.5 text-xs font-medium rounded-md"
              >
                90 Days
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <BookingVolumeChart data={analytics.volumeData} />
          </CardContent>
        </Card>

        {/* Right 1 Col: Booking Status Breakdown */}
        <Card className="border bg-card shadow-xs flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Booking Pipeline</CardTitle>
            <CardDescription className="text-xs">Status distribution across all bookings</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center">
            <BookingStatusChart data={analytics.statusData} />
          </CardContent>
          <CardFooter className="pt-0 border-t flex items-center justify-between text-xs text-muted-foreground py-2.5 bg-muted/20">
            <span>Actionable status tracking</span>
            <Link href="/admin/booking-requests" className="text-primary font-medium hover:underline flex items-center gap-0.5">
              Manage Bookings <ChevronRight className="h-3 w-3" />
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* 5. Second Row: Revenue Breakdown & Tour Popularity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Status Donut Chart */}
        <Card className="border bg-card shadow-xs flex flex-col justify-between">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Financial Overview</CardTitle>
              <Badge variant="outline" className="text-xs font-medium text-emerald-600 border-emerald-200">
                {analytics.recentInvoices.length} Total Invoices
              </Badge>
            </div>
            <CardDescription className="text-xs">Revenue distribution by invoice payment status</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center">
            <RevenueStatusChart
              data={analytics.revenueStatusData}
              totalRevenue={analytics.totalInvoiced}
            />
          </CardContent>
          <CardFooter className="pt-0 border-t flex items-center justify-between text-xs text-muted-foreground py-2.5 bg-muted/20">
            <span>Invoices & Payments</span>
            <Link href="/admin/invoices" className="text-primary font-medium hover:underline flex items-center gap-0.5">
              Billing Center <ChevronRight className="h-3 w-3" />
            </Link>
          </CardFooter>
        </Card>

        {/* Tour Popularity Bar Ranking */}
        <Card className="lg:col-span-2 border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold">Tour Package Popularity</CardTitle>
              <CardDescription className="text-xs">
                All-time bookings ranking by destination package
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm" className="h-7 text-xs gap-1">
              <Link href="/admin/manage-packages">
                <Compass className="h-3 w-3" />
                All Tours
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-2">
            <TourPopularityChart data={analytics.tourData} />
          </CardContent>
        </Card>
      </div>

      {/* 6. Live Operational Feeds & Activity (3-Pillar Command View) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pillar 1: Recent Bookings Feed */}
        <Card className="border bg-card shadow-xs flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">Recent Bookings</CardTitle>
              <CardDescription className="text-xs">Latest tour reservations</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs text-primary gap-1">
              <Link href="/admin/booking-requests">
                View All <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="px-0 flex-1">
            {analytics.recentBookings.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                No recent bookings recorded.
              </div>
            ) : (
              <div className="divide-y">
                {analytics.recentBookings.slice(0, 5).map((booking) => {
                  const tour = tourPackages.find((p) => p.id === booking.tourType);
                  const tourTitle = tour ? tour.homepageTitle : (booking.tourTitle || `Tour #${booking.tourType}`);

                  return (
                    <div
                      key={booking.id}
                      className="p-3 px-4 hover:bg-muted/40 transition-colors flex items-center justify-between gap-2.5"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar className="h-8 w-8 border shrink-0">
                          <AvatarImage
                            src={placeholderImages['avatar-fallback'].src}
                            alt={booking.name}
                          />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-[10px]">
                            {booking.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-semibold text-xs text-foreground truncate">{booking.name}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{tourTitle}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0 space-y-0.5">
                        {booking.status === 'accepted' || booking.status === 'confirmed' ? (
                          <span className="inline-block px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 rounded border border-emerald-200">
                            Confirmed
                          </span>
                        ) : booking.status === 'pending' ? (
                          <span className="inline-block px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/40 rounded border border-amber-200">
                            Pending
                          </span>
                        ) : booking.status === 'rescheduled' ? (
                          <span className="inline-block px-1.5 py-0.5 text-[10px] font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/40 rounded border border-blue-200">
                            Rescheduled
                          </span>
                        ) : (
                          <span className="inline-block px-1.5 py-0.5 text-[10px] font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/40 rounded border border-rose-200">
                            Cancelled
                          </span>
                        )}
                        <p className="text-[10px] text-muted-foreground">{booking.date || 'No date'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-2 border-t text-xs text-muted-foreground justify-between py-2.5 bg-muted/20">
            <span>{analytics.totalBookings} Total Bookings</span>
            <Link href="/admin/booking-requests" className="text-primary font-medium hover:underline">
              Manage Bookings →
            </Link>
          </CardFooter>
        </Card>

        {/* Pillar 2: Recent Invoices Feed */}
        <Card className="border bg-card shadow-xs flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">Latest Invoices</CardTitle>
              <CardDescription className="text-xs">Financial transactions</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs text-primary gap-1">
              <Link href="/admin/invoices">
                View All <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="px-0 flex-1">
            {analytics.recentInvoices.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                No invoices created yet.
              </div>
            ) : (
              <div className="divide-y">
                {analytics.recentInvoices.slice(0, 5).map((inv) => (
                  <div
                    key={inv.id}
                    className="p-3 px-4 hover:bg-muted/40 transition-colors flex items-center justify-between gap-2.5"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-foreground truncate">
                          {inv.invoice_number}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">{inv.customer_name}</p>
                    </div>

                    <div className="text-right shrink-0 space-y-0.5">
                      <div className="text-xs font-bold text-foreground">
                        {formatCurrency(inv.total_amount, inv.currency)}
                      </div>
                      <div>
                        {inv.payment_status === 'paid' ? (
                          <span className="inline-block px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 rounded border border-emerald-200">
                            Paid
                          </span>
                        ) : inv.payment_status === 'unpaid' ? (
                          <span className="inline-block px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/40 rounded border border-amber-200">
                            Unpaid
                          </span>
                        ) : (
                          <span className="inline-block px-1.5 py-0.5 text-[10px] font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/40 rounded border border-blue-200 capitalize">
                            {inv.payment_status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-2 border-t text-xs text-muted-foreground justify-between py-2.5 bg-muted/20">
            <span>Collected: {formatCurrency(analytics.totalPaid)}</span>
            <Link href="/admin/invoices" className="text-primary font-medium hover:underline">
              Create Invoice +
            </Link>
          </CardFooter>
        </Card>

        {/* Pillar 3: Customer Inquiries & Status Feed */}
        <Card className="border bg-card shadow-xs flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">Customer Inquiries</CardTitle>
              <CardDescription className="text-xs">Incoming messages & status</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs text-primary gap-1">
              <Link href="/admin/contact-submissions">
                View All <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="px-0 flex-1">
            {analytics.recentContacts.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                No inquiries received yet.
              </div>
            ) : (
              <div className="divide-y">
                {analytics.recentContacts.slice(0, 5).map((contact) => {
                  const status = contact.status || 'unread';

                  return (
                    <div
                      key={contact.id}
                      className="p-3 px-4 hover:bg-muted/40 transition-colors flex items-center justify-between gap-2.5"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-xs text-foreground truncate">
                            {contact.name}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate max-w-[180px]">
                          {contact.subject || contact.message}
                        </p>
                      </div>

                      <div className="text-right shrink-0 space-y-0.5">
                        <div>
                          {status === 'unread' ? (
                            <span className="inline-block px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/40 rounded border border-amber-300 animate-pulse">
                              ● Unread
                            </span>
                          ) : status === 'replied' ? (
                            <span className="inline-block px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 rounded border border-emerald-200">
                              ✓ Replied
                            </span>
                          ) : status === 'resolved' ? (
                            <span className="inline-block px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 bg-slate-50 dark:bg-slate-950/40 rounded border border-slate-200">
                              Resolved
                            </span>
                          ) : (
                            <span className="inline-block px-1.5 py-0.5 text-[10px] font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/40 rounded border border-blue-200">
                              Read
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          {contact.created_at ? format(parseISO(contact.created_at), 'MMM d') : ''}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-2 border-t text-xs text-muted-foreground justify-between py-2.5 bg-muted/20">
            <span className="text-amber-600 font-medium">{analytics.unreadContactsCount} Unread</span>
            <Link href="/admin/contact-submissions" className="text-primary font-medium hover:underline">
              Inbox →
            </Link>
          </CardFooter>
        </Card>
      </div>


      {/* 7. Quick System Launchpad / Management Hub */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-foreground">Quick Management Hub</h3>
            <p className="text-xs text-muted-foreground">Instant shortcuts to all Sapphire Trails admin modules</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          <Link
            href="/admin/manage-packages"
            className="group flex flex-col items-center justify-center text-center p-3.5 rounded-xl border bg-card hover:bg-primary/5 hover:border-primary/40 transition-all shadow-xs"
          >
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-600 group-hover:scale-110 transition-transform flex items-center justify-center mb-2">
              <Compass className="h-4 w-4" />
            </div>
            <span className="font-semibold text-xs text-foreground">Tour Packages</span>
            <span className="text-[10px] text-muted-foreground mt-0.5">{analytics.totalPackages} Tours</span>
          </Link>

          <Link
            href="/admin/booking-requests"
            className="group flex flex-col items-center justify-center text-center p-3.5 rounded-xl border bg-card hover:bg-primary/5 hover:border-primary/40 transition-all shadow-xs"
          >
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform flex items-center justify-center mb-2">
              <Users className="h-4 w-4" />
            </div>
            <span className="font-semibold text-xs text-foreground">Bookings</span>
            <span className="text-[10px] text-muted-foreground mt-0.5">{analytics.totalBookings} Total</span>
          </Link>

          <Link
            href="/admin/calendar"
            className="group flex flex-col items-center justify-center text-center p-3.5 rounded-xl border bg-card hover:bg-primary/5 hover:border-primary/40 transition-all shadow-xs"
          >
            <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-600 group-hover:scale-110 transition-transform flex items-center justify-center mb-2">
              <CalendarDays className="h-4 w-4" />
            </div>
            <span className="font-semibold text-xs text-foreground">Schedule</span>
            <span className="text-[10px] text-muted-foreground mt-0.5">Calendar View</span>
          </Link>


          <Link
            href="/admin/invoices"
            className="group flex flex-col items-center justify-center text-center p-4 rounded-xl border bg-card hover:bg-primary/5 hover:border-primary/40 transition-all shadow-xs"
          >
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 group-hover:scale-110 transition-transform flex items-center justify-center mb-2.5">
              <Receipt className="h-5 w-5" />
            </div>
            <span className="font-semibold text-xs text-foreground">Billing & Invoices</span>
            <span className="text-[11px] text-muted-foreground mt-0.5">{analytics.recentInvoices.length} Invoices</span>
          </Link>

          <Link
            href="/admin/contact-submissions"
            className="group flex flex-col items-center justify-center text-center p-4 rounded-xl border bg-card hover:bg-primary/5 hover:border-primary/40 transition-all shadow-xs"
          >
            <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-600 group-hover:scale-110 transition-transform flex items-center justify-center mb-2.5">
              <MessageSquare className="h-5 w-5" />
            </div>
            <span className="font-semibold text-xs text-foreground">Inquiries</span>
            <span className="text-[11px] text-muted-foreground mt-0.5">{analytics.totalContacts} Received</span>
          </Link>

          <Link
            href="/admin/manage-reviews"
            className="group flex flex-col items-center justify-center text-center p-4 rounded-xl border bg-card hover:bg-primary/5 hover:border-primary/40 transition-all shadow-xs"
          >
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-600 group-hover:scale-110 transition-transform flex items-center justify-center mb-2.5">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="font-semibold text-xs text-foreground">Reviews</span>
            <span className="text-[11px] text-muted-foreground mt-0.5">Testimonials</span>
          </Link>

          <Link
            href="/admin/cms"
            className="group flex flex-col items-center justify-center text-center p-4 rounded-xl border bg-card hover:bg-primary/5 hover:border-primary/40 transition-all shadow-xs"
          >
            <div className="h-10 w-10 rounded-xl bg-slate-500/10 text-slate-600 dark:text-slate-300 group-hover:scale-110 transition-transform flex items-center justify-center mb-2.5">
              <Layers className="h-5 w-5" />
            </div>
            <span className="font-semibold text-xs text-foreground">Master CMS</span>
            <span className="text-[11px] text-muted-foreground mt-0.5">All Site Pages</span>

          </Link>
        </div>
      </div>
    </div>
  );
}
