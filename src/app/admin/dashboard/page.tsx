
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { type Booking } from '@/lib/bookings-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Clock, CheckCircle, XCircle } from 'lucide-react';
import { subDays, format, parseISO } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { mapServerPackageToClient as mapServerPackage, type TourPackage } from '@/lib/packages-data';

import { BookingVolumeChart } from '@/components/admin/charts/booking-volume-chart';
import { BookingStatusChart } from '@/components/admin/charts/booking-status-chart';
import { TourPopularityChart } from '@/components/admin/charts/tour-popularity-chart';
import { useToast } from '@/hooks/use-toast';

const ADMIN_SESSION_KEY = 'adminUser';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const mapServerBookingToClient = (serverBooking: any): Booking => ({
  id: Number(serverBooking.id),
  name: serverBooking.name,
  email: serverBooking.email,
  phone: serverBooking.phone,
  tourType: Number(serverBooking.tour_package_id),
  guests: serverBooking.guests,
  date: serverBooking.tour_date,
  message: serverBooking.message,
  status: serverBooking.status,
});

export default function DashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tourPackages, setTourPackages] = useState<TourPackage[]>([]);
  const router = useRouter();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const adminUser = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (!adminUser) {
      router.push('/auth');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);
  
  useEffect(() => {
    async function fetchBookings() {
      try {
        const response = await fetch(`${API_BASE_URL}/bookings`);
        if (!response.ok) {
          throw new Error('Failed to fetch bookings.');
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setBookings(data.map(mapServerBookingToClient));
        }
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not load dashboard data from the server.'
        });
      }
    }
    
    async function fetchTourPackages() {
        try {
            const response = await fetch(`${API_BASE_URL}/tours`);
            if (response.ok) {
                const serverData = await response.json();
                if(Array.isArray(serverData)) {
                    setTourPackages(serverData.map(mapServerPackage));
                }
            }
        } catch(e) { console.error("Could not fetch tour packages", e); }
    }

    if (isAuthenticated) {
      fetchBookings();
      fetchTourPackages();
    }
  }, [isAuthenticated, toast]);

  const { bookingStats, volumeData, statusData, tourData, recentBookings } = useMemo(() => {
    if (!bookings || bookings.length === 0) {
        return { bookingStats: { pending: 0, accepted: 0, rejected: 0, total: 0 }, volumeData: [], statusData: [], tourData: [], recentBookings: [] };
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
        const count = bookings.filter(b => b.date === dayString).length;
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
      const tour = tourPackages.find(p => p.id === booking.tourType);
      const tourName = tour ? tour.homepageTitle : `Unknown Tour (ID: ${booking.tourType})`;
      acc[tourName] = (acc[tourName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const tourData = Object.entries(tourCounts).map(([name, count]) => ({
      name,
      bookings: count,
    }));

    // 5. Recent Bookings
    const recentBookings = bookings
      .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())
      .slice(0, 5);


    return { bookingStats, volumeData, statusData, tourData, recentBookings };
  }, [bookings, tourPackages]);


  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight text-primary">Dashboard</h1>
      
      <div className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                <CardContent>
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
        
        <div className="grid gap-6 md:grid-cols-2">
             <Card>
                <CardHeader>
                    <CardTitle>Tour Popularity</CardTitle>
                    <CardDescription>All-time booking counts per tour package.</CardDescription>
                </CardHeader>
                <CardContent className="h-[250px]">
                    <TourPopularityChart data={tourData} />
                </CardContent>
            </Card>
            <Card>
                 <CardHeader>
                    <CardTitle>Recent Bookings</CardTitle>
                    <CardDescription>The five most recent booking requests.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     {recentBookings.map((booking) => (
                        <div key={booking.id} className="flex items-center gap-4">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={`https://placehold.co/100x100.png`} alt="Avatar" data-ai-hint="person portrait" />
                                <AvatarFallback>{booking.name.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="grid gap-1">
                                <p className="text-sm font-medium leading-none break-all">{booking.name}</p>
                                <p className="text-sm text-muted-foreground break-all">{booking.email}</p>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
