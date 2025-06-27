'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { mockBookings, type Booking } from '@/lib/bookings-data';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function ProfilePage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [userBookings, setUserBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth');
    }
  }, [user, isLoading, router]);
  
  useEffect(() => {
    if (user) {
      const storedBookingsRaw = localStorage.getItem('bookings');
      let allBookings: Booking[] = [];

      if (storedBookingsRaw) {
        try {
          const parsed = JSON.parse(storedBookingsRaw);
           if (Array.isArray(parsed)) {
            allBookings = parsed;
          } else {
            allBookings = mockBookings;
          }
        } catch (e) {
            allBookings = mockBookings;
        }
      } else {
        allBookings = mockBookings;
      }
      
      const currentUserBookings = allBookings.filter(b => b.email === user.email);
      setUserBookings(currentUserBookings);
    }
  }, [user]);


  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading profile...</p>
      </div>
    );
  }
  
  const getStatusBadgeVariant = (status: 'pending' | 'accepted' | 'rejected') => {
    switch (status) {
      case 'accepted': return 'default';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };


  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 bg-background-alt py-12 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-3xl space-y-8">
            <div className="text-center">
              <h1 className="text-4xl font-headline font-bold text-primary">My Profile</h1>
              <p className="text-muted-foreground mt-2">Manage your account details and view your bookings.</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Account Details</CardTitle>
                <CardDescription>Update your personal information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" defaultValue={user.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={user.email} disabled />
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>My Bookings</CardTitle>
                <CardDescription>Here are all the tours you have requested.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {userBookings.length > 0 ? (
                  userBookings.map(booking => (
                    <div key={booking.id} className="p-4 border rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{booking.tourType === 'gem-explorer-day-tour' ? 'Gem Explorer Day Tour' : 'Sapphire Trails Deluxe'}</p>
                        <p className="text-sm text-muted-foreground">Date: {format(new Date(booking.date), 'PPP')} | Guests: {booking.guests}</p>
                      </div>
                      <Badge variant={getStatusBadgeVariant(booking.status)} className="capitalize">{booking.status}</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">You have no bookings yet.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>Change your password.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" />
                </div>
                <Button>Update Password</Button>
              </CardContent>
            </Card>
            
            <Separator />

            <div className="text-center">
              <Button variant="outline" onClick={() => logout()}>Log Out</Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
