
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { mockBookings, type Booking } from '@/lib/bookings-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Clock, CheckCircle, XCircle } from 'lucide-react';
import { subDays, format, parseISO } from 'date-fns';

import { BookingVolumeChart } from '@/components/admin/charts/booking-volume-chart';
import { BookingStatusChart } from '@/components/admin/charts/booking-status-chart';
import { TourPopularityChart } from '@/components/admin/charts/tour-popularity-chart';

const ADMIN_SESSION_KEY = 'adminUser';

export default function DashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const adminUser = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (!adminUser) {
      router.push('/admin/login');
    } else {
      setIsAuthenticated(true);
      const storedBookingsRaw = localStorage.getItem('bookings');
      if (storedBookingsRaw) {
        try {
            const parsed = JSON.parse(storedBookingsRaw);
            if(Array.isArray(parsed)) {
                setBookings(parsed);
            } else {
                setBookings(mockBookings);
                localStorage.setItem('bookings', JSON.stringify(mockBookings));
            }
        } catch {
            setBookings(mockBookings);
            localStorage.setItem('bookings', JSON.stringify(mockBookings));
        }
      } else {
        localStorage.setItem('bookings', JSON.stringify(mockBookings));
        setBookings(mockBookings);
      }
    }
  }, [router]);
  
  const { bookingStats, volumeData, statusData, tourData } = useMemo(() => {
    if (!bookings || bookings.length === 0) {
        return { bookingStats: { pending: 0, accepted: 0, rejected: 0, total: 0 }, volumeData: [], statusData: [], tourData: [] };
    }

    // 1. Booking Stats
    const pending = bookings.filter((b) => b.status === 'pending').length;
    const accepted = bookings.filter((b) => b.status === 'accepted').length;
    const rejected = bookings.filter((b) => b.status === 'rejected').length;
    const total = bookings.length;
    const bookingStats = { pending, accepted, rejected, total };

    // 2. Booking Volume (Last 7 Days)
    const last7Days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), i)).reverse();
    const volumeData = last7Days.map(day => {
        const dayString = format(day, 'yyyy-MM-dd');
        const count = bookings.filter(b => format(parseISO(b.date), 'yyyy-MM-dd') === dayString).length;
        return {
            date: format(day, 'EEE'),
            bookings: count
        };
    });

    // 3. Booking Status Distribution
    const statusData = [
        { status: 'pending', value: pending, fill: 'var(--color-pending)' },
        { status: 'accepted', value: accepted, fill: 'var(--color-accepted)' },
        { status: 'rejected', value: rejected, fill: 'var(--color-rejected)' },
    ].filter(d => d.value > 0);

    // 4. Tour Popularity
    const tourCounts = bookings.reduce((acc, booking) => {
      const tourName = booking.tourType === 'gem-explorer-day-tour' ? 'Gem Explorer' : 'Sapphire Deluxe';
      acc[tourName] = (acc[tourName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const tourData = Object.entries(tourCounts).map(([name, count]) => ({
      name,
      bookings: count,
    }));

    return { bookingStats, volumeData, statusData, tourData };
  }, [bookings]);


  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight text-primary">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookingStats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted Bookings</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookingStats.accepted}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected Bookings</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookingStats.rejected}</div>
          </CardContent>
        </Card>
      </div>

       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Booking Volume</CardTitle>
                    <CardDescription>Last 7 days</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <BookingVolumeChart data={volumeData} />
                </CardContent>
            </Card>
            <Card>
                 <CardHeader>
                    <CardTitle>Booking Status Distribution</CardTitle>
                    <CardDescription>Current snapshot</CardDescription>
                </CardHeader>
                <CardContent>
                    <BookingStatusChart data={statusData} />
                </CardContent>
            </Card>
        </div>
        
        <div className="grid gap-6 md:grid-cols-1">
             <Card>
                <CardHeader>
                    <CardTitle>Tour Popularity</CardTitle>
                    <CardDescription>All-time booking counts per tour package.</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <TourPopularityChart data={tourData} />
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
