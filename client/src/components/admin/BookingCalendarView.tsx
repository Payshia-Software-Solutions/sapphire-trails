'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  format, 
  parseISO, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday, 
  addMonths, 
  subMonths,
  isWithinInterval
} from 'date-fns';
import { type Booking } from '@/lib/bookings-data';
import { type TourPackage } from '@/lib/packages-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Users, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Receipt, 
  RefreshCw, 
  CalendarDays, 
  Check, 
  X, 
  LoaderCircle,
  ExternalLink,
  Filter,
  Sparkles
} from 'lucide-react';
import { ICalSyncDialog } from '@/components/admin/ICalSyncDialog';
import { RescheduleBookingDialog } from '@/components/admin/RescheduleBookingDialog';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/utils';
import { authFetch } from '@/lib/api';

interface BookingCalendarViewProps {
  bookings: Booking[];
  tourPackages: TourPackage[];
  onRefresh: () => void;
  isLoading?: boolean;
}

export function BookingCalendarView({
  bookings,
  tourPackages,
  onRefresh,
  isLoading = false,
}: BookingCalendarViewProps) {
  const { toast } = useToast();
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedRescheduleBooking, setSelectedRescheduleBooking] = useState<Booking | null>(null);
  const [isICalDialogOpen, setIsICalDialogOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tourFilter, setTourFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  // Month navigation
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  // Filter bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchStatus = statusFilter === 'all' || b.status === statusFilter;
      const matchTour = tourFilter === 'all' || String(b.tourType) === tourFilter;
      const matchSource = sourceFilter === 'all' || (b.booking_source || 'website') === sourceFilter;
      return matchStatus && matchTour && matchSource;
    });
  }, [bookings, statusFilter, tourFilter, sourceFilter]);

  // Calendar dates matrix
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentMonth]);

  // Month statistics
  const monthStats = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    const thisMonthBookings = bookings.filter((b) => {
      if (!b.date) return false;
      try {
        const bDate = parseISO(b.date);
        return isWithinInterval(bDate, { start: monthStart, end: monthEnd });
      } catch (e) {
        return false;
      }
    });

    const confirmed = thisMonthBookings.filter((b) => b.status === 'confirmed' || b.status === 'accepted').length;
    const pending = thisMonthBookings.filter((b) => b.status === 'pending').length;
    const totalGuests = thisMonthBookings.reduce((sum, b) => sum + (b.guests || 1), 0);

    return {
      total: thisMonthBookings.length,
      confirmed,
      pending,
      totalGuests,
    };
  }, [bookings, currentMonth]);

  // Get bookings for a specific day
  const getBookingsForDay = (day: Date) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    return filteredBookings.filter((b) => {
      if (b.date === dayStr) return true;
      // Handle multi-day date range if end_date exists
      if (b.end_date && b.end_date !== b.date) {
        try {
          const startDate = parseISO(b.date);
          const endDate = parseISO(b.end_date);
          return isWithinInterval(day, { start: startDate, end: endDate });
        } catch (e) {
          return false;
        }
      }
      return false;
    });
  };

  const handleQuickStatusChange = async (id: number, newStatus: 'confirmed' | 'rejected') => {
    setUpdatingId(id);
    try {
      const res = await authFetch(`${API_BASE_URL}/bookings/${id}/status/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update status');

      toast({
        title: `Booking ${newStatus === 'confirmed' ? 'Confirmed' : 'Rejected'}`,
        description: `Booking #${id} status changed to ${newStatus}.`,
      });

      if (selectedBooking && selectedBooking.id === id) {
        setSelectedBooking({ ...selectedBooking, status: newStatus });
      }
      onRefresh();
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not update booking status.',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const getSourceBadge = (source?: string) => {
    switch ((source || 'website').toLowerCase()) {
      case 'airbnb':
        return <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/20 text-rose-600 border border-rose-500/30">Airbnb</span>;
      case 'booking_com':
      case 'booking':
        return <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-600/20 text-blue-600 border border-blue-600/30">Booking.com</span>;
      case 'agoda':
        return <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-600/20 text-emerald-600 border border-emerald-600/30">Agoda</span>;
      default:
        return <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-bold bg-primary/10 text-primary border border-primary/20">Website</span>;
    }
  };

  return (
    <div className="space-y-6 w-full max-w-[1600px] mx-auto pb-16">
      {/* 1. Month Summary KPI Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-card border p-4 rounded-2xl shadow-xs">
          <p className="text-xs text-muted-foreground font-medium">Tours This Month</p>
          <div className="flex items-baseline justify-between mt-1">
            <p className="text-2xl font-bold text-foreground">{monthStats.total}</p>
            <Badge variant="outline" className="text-[10px] font-semibold">
              {format(currentMonth, 'MMM yyyy')}
            </Badge>
          </div>
        </Card>

        <Card className="bg-card border-emerald-500/30 bg-emerald-500/5 p-4 rounded-2xl shadow-xs">
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Confirmed Bookings
          </p>
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">
            {monthStats.confirmed}
          </p>
        </Card>

        <Card className="bg-card border-amber-500/30 bg-amber-500/5 p-4 rounded-2xl shadow-xs">
          <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Pending Requests
          </p>
          <div className="flex items-baseline justify-between mt-1">
            <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{monthStats.pending}</p>
            {monthStats.pending > 0 && (
              <span className="text-[10px] bg-amber-500/20 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold">
                Action needed
              </span>
            )}
          </div>
        </Card>

        <Card className="bg-card border p-4 rounded-2xl shadow-xs">
          <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-primary" />
            Expected Guests
          </p>
          <p className="text-2xl font-bold text-foreground mt-1">{monthStats.totalGuests}</p>
        </Card>
      </div>

      {/* 2. Month Navigation & Filters Card */}
      <Card className="border bg-card shadow-xs">
        <CardContent className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Month Stepper */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border">
              <Button
                variant="ghost"
                size="icon"
                onClick={prevMonth}
                className="h-8 w-8 rounded-lg hover:bg-background"
                title="Previous Month"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={goToToday}
                className="h-8 px-3 text-xs font-semibold hover:bg-background"
              >
                Today
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={nextMonth}
                className="h-8 w-8 rounded-lg hover:bg-background"
                title="Next Month"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-serif">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-32 text-xs bg-background">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rescheduled">Rescheduled</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={tourFilter} onValueChange={setTourFilter}>
              <SelectTrigger className="h-9 w-36 text-xs bg-background">
                <SelectValue placeholder="All Tours" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tours</SelectItem>
                {tourPackages.map((pkg) => (
                  <SelectItem key={pkg.id} value={String(pkg.id)}>
                    {pkg.homepageTitle}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="h-9 w-32 text-xs bg-background">
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="airbnb">Airbnb</SelectItem>
                <SelectItem value="booking_com">Booking.com</SelectItem>
                <SelectItem value="agoda">Agoda</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsICalDialogOpen(true)}
              className="h-9 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
            >
              <CalendarDays className="h-3.5 w-3.5" />
              OTA Sync
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="h-9 text-xs gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 3. Main Interactive Calendar Grid */}
      <Card className="border bg-card shadow-sm overflow-hidden">
        {/* Day of Week Headers */}
        <div className="grid grid-cols-7 border-b bg-muted/40 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider py-2.5">
          <div className="text-rose-500">Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div className="text-primary">Sat</div>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y border-b text-xs">
          {calendarDays.map((day, idx) => {
            const dayBookings = getBookingsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const today = isToday(day);

            return (
              <div
                key={idx}
                className={`min-h-[110px] sm:min-h-[135px] p-1.5 sm:p-2 transition-colors flex flex-col justify-between ${
                  !isCurrentMonth
                    ? 'bg-muted/15 text-muted-foreground/50'
                    : 'bg-card hover:bg-muted/30'
                } ${today ? 'ring-2 ring-primary/40 ring-inset bg-primary/[0.03]' : ''}`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`font-semibold text-xs h-6 w-6 flex items-center justify-center rounded-full ${
                      today
                        ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                        : isCurrentMonth
                        ? 'text-foreground'
                        : 'text-muted-foreground/60'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>

                  {dayBookings.length > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-muted border text-foreground">
                      {dayBookings.length}
                    </span>
                  )}
                </div>

                {/* Day Bookings List */}
                <div className="space-y-1 overflow-y-auto max-h-[85px] sm:max-h-[95px] pr-0.5">
                  {dayBookings.map((booking) => {
                    const tour = tourPackages.find((p) => p.id === booking.tourType);
                    const tourTitle = tour ? tour.homepageTitle : (booking.tourTitle || `Tour #${booking.tourType}`);

                    const isConfirmed = booking.status === 'confirmed' || booking.status === 'accepted';
                    const isPending = booking.status === 'pending';
                    const isRescheduled = booking.status === 'rescheduled';
                    const isRejected = booking.status === 'rejected' || booking.status === 'cancelled';

                    return (
                      <button
                        key={booking.id}
                        type="button"
                        onClick={() => setSelectedBooking(booking)}
                        className={`w-full text-left p-1 sm:p-1.5 rounded-md border transition-all text-[11px] leading-tight truncate block group shadow-2xs ${
                          isConfirmed
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20'
                            : isPending
                            ? 'bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25 animate-pulse'
                            : isRescheduled
                            ? 'bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300 hover:bg-blue-500/20'
                            : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300 line-through opacity-70 hover:opacity-100'
                        }`}
                        title={`${booking.name} • ${tourTitle} (${booking.status})`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold truncate">{booking.name}</span>
                          <span className="text-[9px] opacity-80 shrink-0">
                            {booking.guests}p
                          </span>
                        </div>
                        <p className="text-[10px] opacity-90 truncate mt-0.5">
                          {tourTitle}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <div className="h-0.5" />
              </div>
            );
          })}
        </div>

        {/* Legend Footer */}
        <CardFooter className="py-3 px-4 bg-muted/20 border-t flex flex-wrap items-center justify-between text-xs text-muted-foreground gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-semibold text-foreground">Legend:</span>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>Confirmed Tour</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500 inline-block animate-pulse" />
              <span>Pending Request</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500 inline-block" />
              <span>Rescheduled</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500 inline-block" />
              <span>Cancelled</span>
            </div>
          </div>

          <p className="text-[11px]">Click on any booking chip to view details &amp; quick actions</p>
        </CardFooter>
      </Card>

      {/* 4. Quick Booking Details Modal */}
      {selectedBooking && (
        <Dialog open={Boolean(selectedBooking)} onOpenChange={(open) => !open && setSelectedBooking(null)}>
          <DialogContent className="max-w-md p-6">
            <DialogHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                  Booking #{selectedBooking.id}
                </DialogTitle>
                <Badge
                  variant="outline"
                  className={`capitalize font-semibold text-xs ${
                    selectedBooking.status === 'confirmed' || selectedBooking.status === 'accepted'
                      ? 'bg-emerald-500/15 text-emerald-600 border-emerald-300'
                      : selectedBooking.status === 'pending'
                      ? 'bg-amber-500/15 text-amber-600 border-amber-300 animate-pulse'
                      : selectedBooking.status === 'rescheduled'
                      ? 'bg-blue-500/15 text-blue-600 border-blue-300'
                      : 'bg-rose-500/15 text-rose-600 border-rose-300'
                  }`}
                >
                  {selectedBooking.status}
                </Badge>
              </div>
              <DialogDescription className="text-xs">
                Reservation details &amp; customer schedule
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3.5 py-3 text-xs">
              <div className="p-3 rounded-xl bg-muted/40 border space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-sm text-foreground">{selectedBooking.name}</span>
                  {getSourceBadge(selectedBooking.booking_source)}
                </div>
                <p className="text-muted-foreground">{selectedBooking.email}</p>
                {selectedBooking.phone && <p className="text-muted-foreground">{selectedBooking.phone}</p>}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 rounded-lg bg-background border">
                  <span className="text-muted-foreground block text-[11px]">Tour Package</span>
                  <span className="font-semibold text-foreground truncate block">
                    {tourPackages.find((p) => p.id === selectedBooking.tourType)?.homepageTitle ||
                      `Tour #${selectedBooking.tourType}`}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-background border">
                  <span className="text-muted-foreground block text-[11px]">Party Size</span>
                  <span className="font-semibold text-foreground">
                    {selectedBooking.guests} Guest{selectedBooking.guests !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-background border col-span-2">
                  <span className="text-muted-foreground block text-[11px]">Tour Date</span>
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <CalendarIcon className="h-3.5 w-3.5 text-primary" />
                    {format(parseISO(selectedBooking.date), 'EEEE, MMMM d, yyyy')}
                    {selectedBooking.end_date && selectedBooking.end_date !== selectedBooking.date && (
                      <span> to {format(parseISO(selectedBooking.end_date), 'MMM d, yyyy')}</span>
                    )}
                  </span>
                </div>
              </div>

              {selectedBooking.message && (
                <div className="p-2.5 rounded-lg bg-muted/30 border">
                  <span className="text-muted-foreground block text-[11px] font-medium">Guest Notes / Requests:</span>
                  <p className="text-foreground italic mt-0.5">&quot;{selectedBooking.message}&quot;</p>
                </div>
              )}
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2 border-t">
              {selectedBooking.status === 'pending' && (
                <>
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 text-xs"
                    disabled={updatingId === selectedBooking.id}
                    onClick={() => handleQuickStatusChange(selectedBooking.id, 'confirmed')}
                  >
                    {updatingId === selectedBooking.id ? (
                      <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
                    Confirm Booking
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="gap-1 text-xs"
                    disabled={updatingId === selectedBooking.id}
                    onClick={() => handleQuickStatusChange(selectedBooking.id, 'rejected')}
                  >
                    {updatingId === selectedBooking.id ? (
                      <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <X className="h-3.5 w-3.5" />
                    )}
                    Reject
                  </Button>
                </>
              )}

              <Button
                variant="outline"
                size="sm"
                className="text-amber-600 hover:text-amber-700 text-xs gap-1"
                onClick={() => {
                  const b = selectedBooking;
                  setSelectedBooking(null);
                  setSelectedRescheduleBooking(b);
                }}
              >
                <CalendarDays className="h-3.5 w-3.5" />
                Reschedule
              </Button>

              <Button asChild variant="outline" size="sm" className="text-xs gap-1">
                <Link href={`/admin/booking-requests/${selectedBooking.id}/view`}>
                  <Eye className="h-3.5 w-3.5" />
                  Full View
                </Link>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* 5. iCal Sync Dialog */}
      <ICalSyncDialog
        isOpen={isICalDialogOpen}
        onClose={() => setIsICalDialogOpen(false)}
        tourPackages={tourPackages}
        onSyncComplete={onRefresh}
      />

      {/* 6. Reschedule Booking Dialog */}
      <RescheduleBookingDialog
        isOpen={Boolean(selectedRescheduleBooking)}
        onClose={() => setSelectedRescheduleBooking(null)}
        booking={selectedRescheduleBooking}
        onRescheduleSuccess={() => {
          setSelectedRescheduleBooking(null);
          onRefresh();
        }}
      />
    </div>
  );
}
