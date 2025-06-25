'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { mockBookings, type Booking } from '@/lib/bookings-data';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function BookingRequestsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const authStatus = sessionStorage.getItem('isAdminAuthenticated');
    if (authStatus !== 'true') {
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
        setBookings(mockBookings);
        localStorage.setItem('bookings', JSON.stringify(mockBookings));
      }
    }
  }, [router]);

  const bookingStats = useMemo(() => {
    if (!bookings) return { pending: 0, accepted: 0, rejected: 0, total: 0 };
    const pending = bookings.filter((b) => b.status === 'pending').length;
    const accepted = bookings.filter((b) => b.status === 'accepted').length;
    const rejected = bookings.filter((b) => b.status === 'rejected').length;
    const total = bookings.length;
    return { pending, accepted, rejected, total };
  }, [bookings]);

  const handleStatusChange = (id: string, status: 'accepted' | 'rejected') => {
    const updatedBookings = bookings.map((booking) =>
      booking.id === id ? { ...booking, status } : booking
    );
    setBookings(updatedBookings);
    localStorage.setItem('bookings', JSON.stringify(updatedBookings));
  };
  
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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6 h-full">
        <div className='flex flex-col gap-2'>
            <h1 className="text-3xl font-bold tracking-tight text-primary">Booking Requests</h1>
            <p className="text-muted-foreground">Manage all incoming tour booking requests from this panel.</p>
        </div>
        
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
          {bookings.map((booking) => (
            <Card key={booking.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{booking.name}</CardTitle>
                  <Badge variant={getStatusBadgeVariant(booking.status)} className="capitalize">
                    {booking.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{booking.email}</p>
                {booking.phone && <p className="text-sm text-muted-foreground">{booking.phone}</p>}
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                <div>
                  <h4 className="font-semibold text-sm">Tour Details</h4>
                  <p className="text-sm text-muted-foreground">
                    Package: {booking.tourType === 'gem-explorer-day-tour' ? 'Gem Explorer Day Tour' : 'Sapphire Trails Deluxe'}
                  </p>
                  <p className="text-sm text-muted-foreground">Guests: {booking.guests}</p>
                  <p className="text-sm text-muted-foreground">
                    Date: {format(new Date(booking.date), 'PPP')}
                  </p>
                </div>
                {booking.message && (
                  <div>
                    <h4 className="font-semibold text-sm">Message</h4>
                    <p className="text-sm text-muted-foreground italic">"{booking.message}"</p>
                  </div>
                )}
              </CardContent>
              {booking.status === 'pending' && (
                <CardFooter className="flex gap-4">
                  <Button onClick={() => handleStatusChange(booking.id, 'accepted')} className="w-full">Accept</Button>
                  <Button onClick={() => handleStatusChange(booking.id, 'rejected')} variant="destructive" className="w-full">Reject</Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
    </div>
  );
}
