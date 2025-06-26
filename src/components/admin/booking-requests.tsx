'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { mockBookings, type Booking } from '@/lib/bookings-data';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export function BookingRequests() {
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
        setBookings(JSON.parse(storedBookingsRaw));
      } else {
        // If nothing in localStorage, seed it with mock data
        localStorage.setItem('bookings', JSON.stringify(mockBookings));
        setBookings(mockBookings);
      }
    }
  }, [router]);

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
    return null; // or a loading spinner
  }

  return (
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
                <p className="text-sm text-muted-foreground italic">&quot;{booking.message}&quot;</p>
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
  );
}
