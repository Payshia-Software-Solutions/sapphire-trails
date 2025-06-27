
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { mockBookings, type Booking } from '@/lib/bookings-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

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
  
  const getStatusBadgeVariant = (status: Booking['status']) => {
    switch (status) {
      case 'accepted':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'pending':
      default:
        return 'secondary';
    }
  };


  const bookingStats = useMemo(() => {
    if (!bookings) return { pending: 0, accepted: 0, rejected: 0, total: 0 };
    const pending = bookings.filter((b) => b.status === 'pending').length;
    const accepted = bookings.filter((b) => b.status === 'accepted').length;
    const rejected = bookings.filter((b) => b.status === 'rejected').length;
    const total = bookings.length;
    return { pending, accepted, rejected, total };
  }, [bookings]);

  const recentBookings = useMemo(() => {
    if (!bookings) return [];
    return [...bookings].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  }, [bookings]);


  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
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

      <Card>
        <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>
                    The latest booking requests received.
                </CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
                <Link href="/admin/booking-requests">
                    View All
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </Button>
        </CardHeader>
        <CardContent>
            {recentBookings.length > 0 ? (
                 <div className="grid gap-6">
                   {recentBookings.map((booking) => (
                     <div key={booking.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4 border rounded-lg">
                        <div className="grid gap-1 text-sm">
                          <div className="font-medium">{booking.name}</div>
                          <div className="text-muted-foreground break-all">{booking.email}</div>
                        </div>
                        <div className="flex items-center gap-4 self-end sm:self-center">
                            <div className="text-sm text-muted-foreground whitespace-nowrap">
                              {format(new Date(booking.date), 'PPP')}
                            </div>
                            <Badge variant={getStatusBadgeVariant(booking.status)} className="capitalize shrink-0">
                                {booking.status}
                            </Badge>
                        </div>
                     </div>
                   ))}
                </div>
            ) : (
                <div className="text-center text-muted-foreground py-8">No recent bookings.</div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
