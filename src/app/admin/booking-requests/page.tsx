
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { mockBookings, type Booking } from '@/lib/bookings-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
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

export default function BookingRequestsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
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

        <Card>
            <CardHeader>
                <CardTitle>All Requests</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead className="hidden md:table-cell">Tour Package</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="hidden sm:table-cell">Guests</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                    {bookings.map((booking) => (
                        <TableRow key={booking.id}>
                            <TableCell>
                                <div className="font-medium">{booking.name}</div>
                                <div className="text-sm text-muted-foreground hidden md:block">{booking.email}</div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                                {booking.tourType === 'gem-explorer-day-tour' ? 'Gem Explorer Day Tour' : 'Sapphire Trails Deluxe'}
                            </TableCell>
                            <TableCell>{format(new Date(booking.date), 'PPP')}</TableCell>
                            <TableCell className="hidden sm:table-cell">{booking.guests}</TableCell>
                            <TableCell>
                                <Badge variant={getStatusBadgeVariant(booking.status)} className="capitalize">
                                {booking.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="outline" size="sm" onClick={() => setSelectedBooking(booking)}>View</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

        <Dialog open={!!selectedBooking} onOpenChange={(isOpen) => !isOpen && setSelectedBooking(null)}>
            <DialogContent className="sm:max-w-lg">
                {selectedBooking && (
                <>
                    <DialogHeader>
                        <DialogTitle>Booking Details</DialogTitle>
                        <DialogDescription>
                            Request from {selectedBooking.name} on {format(new Date(selectedBooking.date), 'PPP')}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right text-muted-foreground">Status</Label>
                            <div className="col-span-3">
                                <Badge variant={getStatusBadgeVariant(selectedBooking.status)} className="capitalize">
                                    {selectedBooking.status}
                                </Badge>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right text-muted-foreground">Name</Label>
                            <span className="col-span-3 font-medium">{selectedBooking.name}</span>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right text-muted-foreground">Email</Label>
                            <span className="col-span-3">{selectedBooking.email}</span>
                        </div>
                        {selectedBooking.phone && (
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right text-muted-foreground">Phone</Label>
                                <span className="col-span-3">{selectedBooking.phone}</span>
                            </div>
                        )}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right text-muted-foreground">Tour</Label>
                            <span className="col-span-3">{selectedBooking.tourType === 'gem-explorer-day-tour' ? 'Gem Explorer Day Tour' : 'Sapphire Trails Deluxe'}</span>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right text-muted-foreground">Guests</Label>
                            <span className="col-span-3">{selectedBooking.guests}</span>
                        </div>
                        {selectedBooking.message && (
                            <div className="grid grid-cols-4 items-start gap-4">
                                <Label className="text-right text-muted-foreground mt-1">Message</Label>
                                <p className="col-span-3 text-sm italic">&quot;{selectedBooking.message}&quot;</p>
                            </div>
                        )}
                    </div>
                    <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end gap-2">
                        <Button variant="outline" onClick={() => setSelectedBooking(null)}>Close</Button>
                        <Button asChild>
                            <Link href={`/admin/booking-requests/${selectedBooking.id}`}>Edit Booking</Link>
                        </Button>
                    </DialogFooter>
                </>
                )}
            </DialogContent>
        </Dialog>
    </div>
  );
}
