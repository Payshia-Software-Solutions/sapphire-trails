
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { type Booking } from '@/lib/bookings-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, CheckCircle, XCircle, RefreshCw, Search, ListFilter, LoaderCircle, Calendar, Check, X, Eye, CalendarDays, Receipt, StickyNote, CalendarCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';


import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { mapServerPackageToClient as mapServerPackage, type TourPackage } from '@/lib/packages-data';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ICalSyncDialog } from '@/components/admin/ICalSyncDialog';
import { RescheduleBookingDialog } from '@/components/admin/RescheduleBookingDialog';
import { BookingCalendarView } from '@/components/admin/BookingCalendarView';

const ADMIN_SESSION_KEY = 'adminUser';
import { API_BASE_URL } from '@/lib/utils';
import { authFetch } from '@/lib/api';

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

const ITEMS_PER_PAGE = 10;

export default function BookingRequestsPage() {
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const router = useRouter();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tourPackages, setTourPackages] = useState<TourPackage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tourTypeFilter, setTourTypeFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [isICalDialogOpen, setIsICalDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingBookingId, setUpdatingBookingId] = useState<number | null>(null);
  const [selectedRescheduleBooking, setSelectedRescheduleBooking] = useState<Booking | null>(null);

  const handleQuickStatusChange = async (id: number, newStatus: 'confirmed' | 'rejected') => {
    setUpdatingBookingId(id);
    try {
      const res = await authFetch(`${API_BASE_URL}/bookings/${id}/status/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error('Failed to update status');
      }

      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
      toast({
        title: `Booking ${newStatus === 'confirmed' ? 'Confirmed' : 'Rejected'}`,
        description: `Booking #${id} status changed to ${newStatus}.`,
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not update booking status.',
      });
    } finally {
      setUpdatingBookingId(null);
    }
  };

  useEffect(() => {
    async function fetchTourPackages() {
      try {
        const response = await fetch(`${API_BASE_URL}/tours`);
        if (response.ok) {
            const serverData = await response.json();
            if(Array.isArray(serverData)) {
                setTourPackages(serverData.map(mapServerPackage));
            }
        }
      } catch (e) { console.error("Could not fetch tour packages", e); }
    }
    fetchTourPackages();
  }, []);

  useEffect(() => {
    const adminUser = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!adminUser) {
      router.push('/auth');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);
  
  async function fetchBookings() {
    setIsLoading(true);
    try {
      const response = await authFetch(`${API_BASE_URL}/bookings`);
      if (!response.ok) {
        throw new Error('Failed to fetch bookings.');
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setBookings(data.map(mapServerBookingToClient).sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()));
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not load bookings from the server.'
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();

      // Silent automatic background sync on visit
      authFetch(`${API_BASE_URL}/ical/sync`, { method: 'POST' })
        .then(res => res.json())
        .then(data => {
          if (data.stats && (data.stats.created > 0 || data.stats.updated > 0)) {
            // Re-fetch bookings if new OTA reservations were synced
            fetchBookings();
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const bookingStats = useMemo(() => {
    if (!bookings) return { pending: 0, accepted: 0, rejected: 0, total: 0 };
    const pending = bookings.filter((b) => b.status === 'pending').length;
    const accepted = bookings.filter((b) => b.status === 'accepted' || b.status === 'confirmed').length;
    const rejected = bookings.filter((b) => b.status === 'rejected').length;
    const total = bookings.length;
    return { pending, accepted, rejected, total };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    return bookings
      .filter(booking => {
        const searchMatch = searchTerm === '' ||
          booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          String(booking.id).includes(searchTerm) ||
          (booking.external_booking_id && booking.external_booking_id.toLowerCase().includes(searchTerm.toLowerCase()));
        const statusMatch = statusFilter === 'all' || booking.status === statusFilter;
        const tourTypeMatch = tourTypeFilter === 'all' || String(booking.tourType) === tourTypeFilter;
        const sourceMatch = sourceFilter === 'all' || (booking.booking_source || 'website') === sourceFilter;
        return searchMatch && statusMatch && tourTypeMatch && sourceMatch;
      });
  }, [bookings, searchTerm, statusFilter, tourTypeFilter, sourceFilter]);

  const { paginatedBookings, totalPages } = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginated = filteredBookings.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    const total = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
    return { paginatedBookings: paginated, totalPages: total > 0 ? total : 1 };
  }, [filteredBookings, currentPage]);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, tourTypeFilter, sourceFilter]);
  
  const getStatusBadgeVariant = (status: Booking['status']) => {
    switch (status) {
      case 'accepted':
      case 'confirmed':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'pending':
      default:
        return 'secondary';
    }
  };

  const getSourceBadge = (source?: string) => {
    switch ((source || 'website').toLowerCase()) {
      case 'airbnb':
        return <Badge className="bg-rose-500 hover:bg-rose-600 text-white text-[11px]">Airbnb</Badge>;
      case 'booking_com':
      case 'booking':
        return <Badge className="bg-blue-600 hover:bg-blue-700 text-white text-[11px]">Booking.com</Badge>;
      case 'agoda':
        return <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px]">Agoda</Badge>;
      case 'tripadvisor':
      case 'viator':
        return <Badge className="bg-[#00AA6C] hover:bg-[#008f5a] text-white text-[11px]">TripAdvisor</Badge>;
      case 'website':
      default:
        return <Badge variant="outline" className="text-slate-600 border-slate-300 text-[11px]">Website</Badge>;
    }
  };
  
  const getTourPackage = (tourId: number) => {
    return tourPackages.find(p => p.id === tourId);
  };
  
  const getBookingAmount = (booking: Booking): string => {
    const tour = getTourPackage(booking.tourType);
    if (!tour || !tour.price) return "N/A";
    const priceValue = parseFloat(tour.price.replace(/[^0-9.]/g, ''));
    if (isNaN(priceValue)) return "N/A";
    const total = priceValue * booking.guests;
    return `$${total.toFixed(2)}`;
  };


  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1600px] mx-auto pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
                    <CalendarCheck className="h-7 w-7 text-primary" />
                    Booking Requests &amp; Schedule
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                    Manage all incoming website and OTA calendar bookings from this panel.
                </p>
            </div>
            <div className="flex items-center gap-2.5">
              {/* View Switcher */}
              <div className="flex items-center bg-muted/60 p-1 rounded-xl border">
                <Button
                  variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className="h-8 px-3 text-xs font-semibold rounded-lg gap-1.5"
                >
                  <Search className="h-3.5 w-3.5" />
                  Table View
                </Button>
                <Button
                  variant={viewMode === 'calendar' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('calendar')}
                  className="h-8 px-3 text-xs font-semibold rounded-lg gap-1.5"
                >
                  <CalendarDays className="h-3.5 w-3.5 text-primary" />
                  Calendar View
                </Button>
              </div>

              <Button
                onClick={() => setIsICalDialogOpen(true)}
                variant="outline"
                className="flex items-center gap-2 text-xs h-10 border-primary/30 text-primary hover:bg-primary/10"
              >
                <Calendar className="h-4 w-4" />
                OTA Sync
              </Button>
            </div>
        </div>

        {viewMode === 'calendar' ? (
          <BookingCalendarView
            bookings={bookings}
            tourPackages={tourPackages}
            onRefresh={fetchBookings}
            isLoading={isLoading}
          />
        ) : (
        <>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{bookingStats.total}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{bookingStats.pending}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Accepted</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{bookingStats.accepted}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                    <XCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{bookingStats.rejected}</div>
                </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader className="border-b">
                <CardTitle>All Requests</CardTitle>
                <CardDescription>
                  Showing {isLoading ? 0 : paginatedBookings.length} of {isLoading ? 0 : filteredBookings.length} records.
                </CardDescription>
            </CardHeader>

            <CardContent className="p-0">
                <div className="p-4 space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search by name, email, or ID..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        <Button variant="outline" onClick={fetchBookings} disabled={isLoading}><RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} /> Refresh</Button>
                    </div>
                     <div className="grid sm:grid-cols-3 gap-4">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger><SelectValue placeholder="Filter by status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="accepted">Accepted / Confirmed</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={tourTypeFilter} onValueChange={setTourTypeFilter}>
                             <SelectTrigger><SelectValue placeholder="Filter by tour" /></SelectTrigger>
                             <SelectContent>
                                <SelectItem value="all">All Tours</SelectItem>
                                {tourPackages.map(pkg => (
                                    <SelectItem key={pkg.id} value={String(pkg.id)}>{pkg.homepageTitle}</SelectItem>
                                ))}
                             </SelectContent>
                        </Select>
                        <Select value={sourceFilter} onValueChange={setSourceFilter}>
                            <SelectTrigger><SelectValue placeholder="Filter by source" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Sources</SelectItem>
                                <SelectItem value="website">Website (Direct)</SelectItem>
                                <SelectItem value="airbnb">Airbnb</SelectItem>
                                <SelectItem value="booking_com">Booking.com</SelectItem>
                                <SelectItem value="agoda">Agoda</SelectItem>
                                <SelectItem value="tripadvisor">TripAdvisor / Viator</SelectItem>
                            </SelectContent>
                        </Select>
                     </div>
                </div>
                
                {isLoading ? (
                  <div className="text-center text-muted-foreground py-16 flex flex-col items-center gap-4">
                      <LoaderCircle className="h-12 w-12 text-muted-foreground/50 animate-spin" />
                      <p>Fetching booking requests...</p>
                  </div>
                ) : (
                <>
                  {/* Mobile Card View */}
                  <div className="md:hidden p-4 space-y-4">
                      {paginatedBookings.map((booking) => (
                          <Card key={booking.id} className="bg-background-alt/50">
                              <CardContent className="p-4">
                                  <div className="flex justify-between items-start">
                                      <div>
                                          <div className="flex items-center gap-2">
                                            <p className="font-bold text-lg">{booking.name}</p>
                                            {getSourceBadge(booking.booking_source)}
                                          </div>
                                          <p className="text-sm text-muted-foreground">ID: {booking.id}</p>
                                          <p className="text-sm text-muted-foreground">{getTourPackage(booking.tourType)?.homepageTitle || 'Unknown Tour'}</p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                          <Badge variant={getStatusBadgeVariant(booking.status)} className="capitalize">{booking.status}</Badge>
                                          <Checkbox />
                                      </div>
                                  </div>
                                  <div className="border-t my-4"></div>
                                  <div className="flex justify-between items-center text-sm">
                                      <span className="text-muted-foreground">Amount</span>
                                      <span className="font-bold">{getBookingAmount(booking)}</span>
                                  </div>
                                  <div className="flex justify-between items-center text-sm mt-2">
                                      <span className="text-muted-foreground">Tour Date</span>
                                      <span className="font-bold">
                                        {format(parseISO(booking.date), 'MMM dd, yyyy')}
                                        {booking.end_date && booking.end_date !== booking.date && (
                                          <span> - {format(parseISO(booking.end_date), 'MMM dd, yyyy')}</span>
                                        )}
                                      </span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-4">
                                      <Button className="flex-1" size="sm" asChild>
                                        <Link href={`/admin/booking-requests/${booking.id}/view`}>
                                          <Eye className="mr-1 h-3.5 w-3.5" />
                                          View
                                        </Link>
                                      </Button>
                                      {booking.status === 'pending' && (
                                        <>
                                          <Button
                                            size="sm"
                                            variant="default"
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                            disabled={updatingBookingId === booking.id}
                                            onClick={() => handleQuickStatusChange(booking.id, 'confirmed')}
                                          >
                                            {updatingBookingId === booking.id ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="destructive"
                                            disabled={updatingBookingId === booking.id}
                                            onClick={() => handleQuickStatusChange(booking.id, 'rejected')}
                                          >
                                            {updatingBookingId === booking.id ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                                          </Button>
                                        </>
                                      )}
                                  </div>
                              </CardContent>
                          </Card>
                      ))}
                  </div>


                  {/* Desktop Table View */}
                  <div className="hidden md:block">
                      <Table>
                          <TableHeader>
                              <TableRow>
                                  <TableHead>Source</TableHead>
                                  <TableHead>Name / Guest</TableHead>
                                  <TableHead>Tour Package</TableHead>
                                  <TableHead>Date / Range</TableHead>
                                  <TableHead>Guests</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                          {paginatedBookings.map((booking) => (
                              <TableRow key={booking.id}>
                                  <TableCell>
                                      {getSourceBadge(booking.booking_source)}
                                  </TableCell>
                                  <TableCell>
                                      <div className="flex items-center gap-1.5 font-medium break-words">
                                        <span>{booking.name}</span>
                                        {booking.admin_notes && (
                                          <span title={`Internal note: ${booking.admin_notes}`} className="cursor-help">
                                            <StickyNote className="h-3.5 w-3.5 text-primary inline-block flex-shrink-0" />
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-sm text-muted-foreground hidden lg:block break-all">{booking.email}</div>
                                  </TableCell>
                                  <TableCell className="break-all">
                                      {getTourPackage(booking.tourType)?.homepageTitle || `Tour ID: ${booking.tourType}`}
                                  </TableCell>
                                  <TableCell>
                                      <div>{format(parseISO(booking.date), 'MMM dd, yyyy')}</div>
                                      {booking.end_date && booking.end_date !== booking.date && (
                                          <div className="text-xs text-muted-foreground">to {format(parseISO(booking.end_date), 'MMM dd, yyyy')}</div>
                                      )}
                                  </TableCell>
                                  <TableCell>{booking.guests}</TableCell>
                                  <TableCell>
                                      {booking.status === 'rescheduled' ? (
                                        <Badge className="bg-amber-500/15 text-amber-500 border border-amber-500/30 text-xs">
                                          Rescheduled
                                        </Badge>
                                      ) : (
                                        <Badge variant={getStatusBadgeVariant(booking.status)} className="capitalize">
                                          {booking.status}
                                        </Badge>
                                      )}
                                      {booking.invoice_number && (
                                        <a 
                                          href={`/invoices/${booking.invoice_number}`} 
                                          target="_blank" 
                                          rel="noreferrer"
                                          className="text-[10px] font-mono text-primary/90 hover:underline flex items-center gap-1 mt-1"
                                          title={`Invoice ${booking.invoice_number} - ${booking.invoice_payment_status || 'unpaid'}`}
                                        >
                                          <Receipt className="h-2.5 w-2.5" />
                                          {booking.invoice_number}
                                        </a>
                                      )}
                                  </TableCell>
                                  <TableCell className="text-right">
                                      <div className="flex items-center justify-end gap-1.5">
                                          {booking.status === 'pending' && (
                                            <>
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 px-2 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-400"
                                                disabled={updatingBookingId === booking.id}
                                                onClick={() => handleQuickStatusChange(booking.id, 'confirmed')}
                                                title="Accept Booking"
                                              >
                                                {updatingBookingId === booking.id ? (
                                                  <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                                                ) : (
                                                  <>
                                                    <Check className="h-3.5 w-3.5 mr-1" />
                                                    Accept
                                                  </>
                                                )}
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 px-2 text-rose-500 border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-400"
                                                disabled={updatingBookingId === booking.id}
                                                onClick={() => handleQuickStatusChange(booking.id, 'rejected')}
                                                title="Reject Booking"
                                              >
                                                {updatingBookingId === booking.id ? (
                                                  <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                                                ) : (
                                                  <>
                                                    <X className="h-3.5 w-3.5 mr-1" />
                                                    Reject
                                                  </>
                                                )}
                                              </Button>
                                            </>
                                          )}
                                          <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="h-8 px-2 text-amber-500 hover:text-amber-400 hover:bg-amber-500/10"
                                            onClick={() => setSelectedRescheduleBooking(booking)}
                                            title="Reschedule Dates"
                                          >
                                            <CalendarDays className="h-3.5 w-3.5 mr-1" />
                                            Reschedule
                                          </Button>
                                          <Button variant="ghost" size="sm" className="h-8 px-2" asChild>
                                            <Link href={`/admin/booking-requests/${booking.id}/view`}>
                                              <Eye className="h-3.5 w-3.5 mr-1" />
                                              View
                                            </Link>
                                          </Button>
                                      </div>
                                  </TableCell>
                              </TableRow>
                          ))}
                          </TableBody>
                      </Table>
                  </div>
                </>
                )}
            </CardContent>
             <CardFooter className="flex items-center justify-between border-t px-4 py-4">
                <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages || 1}
                </div>
                <div className="flex items-center gap-2">
                    <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    >
                    Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage >= totalPages}
                    >
                      Next
                    </Button>
                </div>
            </CardFooter>
        </Card>
        </>
        )}


        {/* iCal Synchronization Dialog */}
        <ICalSyncDialog

          isOpen={isICalDialogOpen}
          onClose={() => setIsICalDialogOpen(false)}
          tourPackages={tourPackages}
          onSyncComplete={fetchBookings}
        />

        {/* Reschedule Booking Dialog */}
        <RescheduleBookingDialog
          isOpen={Boolean(selectedRescheduleBooking)}
          onClose={() => setSelectedRescheduleBooking(null)}
          booking={selectedRescheduleBooking}
          onRescheduleSuccess={() => {
            setSelectedRescheduleBooking(null);
            fetchBookings();
          }}
        />

    </div>
  );
}
