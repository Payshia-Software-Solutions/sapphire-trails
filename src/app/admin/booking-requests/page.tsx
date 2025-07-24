
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { type Booking } from '@/lib/bookings-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, CheckCircle, XCircle, RefreshCw, Search, ListFilter } from 'lucide-react';
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


const ADMIN_SESSION_KEY = 'adminUser';
const ITEMS_PER_PAGE = 5;
const API_BASE_URL = 'https://server-sapphiretrails.payshia.com';

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
  message: serverBooking.message,
  status: serverBooking.status,
});

export default function BookingRequestsPage() {
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
      router.push('/admin/login');
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
          setBookings(data.map(mapServerBookingToClient).sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()));
        }
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not load bookings from the server.'
        });
      }
    }
    if (isAuthenticated) {
      fetchBookings();
    }
  }, [isAuthenticated, toast]);

  const bookingStats = useMemo(() => {
    if (!bookings) return { pending: 0, accepted: 0, rejected: 0, total: 0 };
    const pending = bookings.filter((b) => b.status === 'pending').length;
    const accepted = bookings.filter((b) => b.status === 'accepted').length;
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
          String(booking.id).includes(searchTerm);
        const statusMatch = statusFilter === 'all' || booking.status === statusFilter;
        const tourTypeMatch = tourTypeFilter === 'all' || String(booking.tourType) === tourTypeFilter;
        return searchMatch && statusMatch && tourTypeMatch;
      });
  }, [bookings, searchTerm, statusFilter, tourTypeFilter]);

  const { paginatedBookings, totalPages } = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginated = filteredBookings.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    const total = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
    return { paginatedBookings: paginated, totalPages: total > 0 ? total : 1 };
  }, [filteredBookings, currentPage]);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, tourTypeFilter]);
  
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
    <div className="flex flex-col gap-6">
        <div className='flex flex-col gap-2'>
            <h1 className="text-3xl font-bold tracking-tight text-primary">Booking Requests</h1>
            <p className="text-muted-foreground">Manage all incoming tour booking requests from this panel.</p>
        </div>
        
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
                  Showing {paginatedBookings.length} of {filteredBookings.length} records.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <div className="p-4 space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search by name, email, or ID..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        <Button variant="outline"><RefreshCw className="mr-2 h-4 w-4" /> Refresh</Button>
                    </div>
                     <div className="grid sm:grid-cols-2 gap-4">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger><SelectValue placeholder="Filter by status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="accepted">Accepted</SelectItem>
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
                     </div>
                </div>
                
                {/* Mobile Card View */}
                <div className="md:hidden p-4 space-y-4">
                    {paginatedBookings.map((booking) => (
                        <Card key={booking.id} className="bg-background-alt/50">
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-lg">{booking.id}</p>
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
                                    <span className="font-bold">{format(parseISO(booking.date), 'MMM dd, yyyy')}</span>
                                </div>
                                <Button className="w-full mt-4" asChild>
                                  <Link href={`/admin/booking-requests/${booking.id}`}>Manage</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>


                {/* Desktop Table View */}
                <div className="hidden md:block">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Tour Package</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Guests</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                        {paginatedBookings.map((booking) => (
                            <TableRow key={booking.id}>
                                <TableCell>
                                    <div className="font-medium break-words">{booking.name}</div>
                                    <div className="text-sm text-muted-foreground hidden lg:block break-all">{booking.email}</div>
                                </TableCell>
                                <TableCell className="break-all">
                                    {getTourPackage(booking.tourType)?.homepageTitle || `Tour ID: ${booking.tourType}`}
                                </TableCell>
                                <TableCell>{format(parseISO(booking.date), 'PPP')}</TableCell>
                                <TableCell>{booking.guests}</TableCell>
                                <TableCell>
                                    <Badge variant={getStatusBadgeVariant(booking.status)} className="capitalize">
                                    {booking.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="outline" size="sm" asChild>
                                      <Link href={`/admin/booking-requests/${booking.id}`}>View/Manage</Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </div>
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

    </div>
  );
}
