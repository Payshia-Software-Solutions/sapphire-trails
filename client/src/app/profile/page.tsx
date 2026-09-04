'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/auth-context';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Compass,
  Calendar,
  Users,
  Shield,
  ShieldCheck,
  User as UserIcon,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  FileText,
  CreditCard,
  CheckCircle2,
  Clock,
  ExternalLink,
  Sparkles,
  ArrowRight,
  LogOut,
  LoaderCircle,
  Gem,
  MapPin,
  HelpCircle,
  Pencil,
  AlertCircle
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { TrustSection } from '@/components/sections/TrustSection';
import { API_BASE_URL, cn } from '@/lib/utils';
import { authFetch } from '@/lib/api';
import { type Booking } from '@/lib/bookings-data';
import { mapServerPackageToClient, type TourPackage } from '@/lib/packages-data';

export default function ProfilePage() {
  const { user, logout, updateUser, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('bookings');
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [packagesMap, setPackagesMap] = useState<Record<number, TourPackage>>({});
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Profile Edit State
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
  });

  // Password Change State
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Selected Booking Modal State
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Protect route
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    } else if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
      });
    }
  }, [user, authLoading, router]);

  // Fetch Packages and User Bookings
  useEffect(() => {
    async function loadUserData() {
      if (!user) return;
      setIsLoadingData(true);
      try {
        // 1. Fetch Tours (same endpoint used across the entire site)
        const pkgRes = await fetch(`${API_BASE_URL}/tours`).catch(() => null);
        let pkgMap: Record<number, TourPackage> = {};
        if (pkgRes && pkgRes.ok) {
          const rawPkgs = await pkgRes.json();
          if (Array.isArray(rawPkgs)) {
            rawPkgs.forEach((raw: any) => {
              const p = mapServerPackageToClient(raw);
              pkgMap[p.id] = p;
            });
            setPackagesMap(pkgMap);
          }
        }

        // 2. Fetch Bookings with Authentication
        const bookRes = await authFetch(`${API_BASE_URL}/bookings`).catch(() => null);
        if (bookRes && bookRes.ok) {
          const allBookings = await bookRes.json();
          if (Array.isArray(allBookings)) {
            const userEmail = (user.email || '').trim().toLowerCase();
            const userName = (user.name || '').trim().toLowerCase();
            const userId = Number(user.id);

            const myBookings = allBookings
              .filter((b: any) => {
                const bookingEmail = (b.email || '').trim().toLowerCase();
                const bookingUserName = (b.name || b.user_name || '').trim().toLowerCase();
                const bookingUserId = b.user_id ? Number(b.user_id) : null;

                // Match by user_id, email, or name
                const isMatch = (userId && bookingUserId === userId) ||
                                (userEmail && bookingEmail === userEmail) ||
                                (userEmail && (b.user_email || '').trim().toLowerCase() === userEmail) ||
                                (userName && bookingUserName === userName);
                
                return isMatch;
              })
              .map((b: any): Booking => {
                const pkgId = Number(b.tour_package_id);
                const pkg = pkgMap[pkgId];
                const rawImg = b.tour_image_url || pkg?.imageUrl || pkg?.heroImage;
                const tourImg = rawImg ? (rawImg.startsWith('http') ? rawImg : mapServerPackageToClient({ homepage_image_url: rawImg }).imageUrl) : pkg?.imageUrl;

                return {
                  id: Number(b.id),
                  user_id: b.user_id ? Number(b.user_id) : undefined,
                  name: b.name,
                  email: b.email,
                  phone: b.phone,
                  tourType: pkgId,
                  tourTitle: pkg ? (pkg.tourPageTitle || pkg.homepageTitle) : (b.tour_title || `Tour Package #${pkgId}`),
                  tourImage: tourImg || pkg?.imageUrl || pkg?.heroImage,
                  tourSlug: pkg?.slug || b.tour_slug,
                  guests: Number(b.guests || 1),
                  adults: b.adults ? Number(b.adults) : undefined,
                  children: b.children ? Number(b.children) : undefined,
                  date: b.tour_date,
                  end_date: b.end_date,
                  message: b.message,
                  status: b.status || 'pending',
                  invoice_number: b.invoice_number,
                  invoice_payment_status: b.invoice_payment_status,
                  invoice_total: b.invoice_total,
                };
              })
              .sort((a, b) => {
                const dateA = a.date ? new Date(a.date).getTime() : 0;
                const dateB = b.date ? new Date(b.date).getTime() : 0;
                return dateB - dateA; // Newest first
              });

            // If user is admin and myBookings is 0 (or all bookings were submitted during testing), let's ensure bookings are available
            if (user.type === 'admin' && myBookings.length === 0 && allBookings.length > 0) {
              const mappedAll = allBookings.map((b: any): Booking => {
                const pkgId = Number(b.tour_package_id);
                const pkg = pkgMap[pkgId];
                const rawImg = b.tour_image_url || pkg?.imageUrl || pkg?.heroImage;
                const tourImg = rawImg ? (rawImg.startsWith('http') ? rawImg : mapServerPackageToClient({ homepage_image_url: rawImg }).imageUrl) : pkg?.imageUrl;

                return {
                  id: Number(b.id),
                  user_id: b.user_id ? Number(b.user_id) : undefined,
                  name: b.name,
                  email: b.email,
                  phone: b.phone,
                  tourType: pkgId,
                  tourTitle: pkg ? (pkg.tourPageTitle || pkg.homepageTitle) : (b.tour_title || `Tour Package #${pkgId}`),
                  tourImage: tourImg || pkg?.imageUrl || pkg?.heroImage,
                  tourSlug: pkg?.slug || b.tour_slug,
                  guests: Number(b.guests || 1),
                  adults: b.adults ? Number(b.adults) : undefined,
                  children: b.children ? Number(b.children) : undefined,
                  date: b.tour_date,
                  end_date: b.end_date,
                  message: b.message,
                  status: b.status || 'pending',
                  invoice_number: b.invoice_number,
                  invoice_payment_status: b.invoice_payment_status,
                  invoice_total: b.invoice_total,
                };
              }).sort((a, b) => {
                const dateA = a.date ? new Date(a.date).getTime() : 0;
                const dateB = b.date ? new Date(b.date).getTime() : 0;
                return dateB - dateA;
              });
              setUserBookings(mappedAll);
            } else {
              setUserBookings(myBookings);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load profile data:', err);
      } finally {
        setIsLoadingData(false);
      }
    }


    if (user) {
      loadUserData();
    }
  }, [user]);

  // Handle Profile Update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!profileForm.name.trim()) {
      toast({ variant: 'destructive', title: 'Name Required', description: 'Please enter your full name.' });
      return;
    }

    setIsSavingProfile(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileForm.name,
          email: user.email,
          phone: profileForm.phone,
          type: user.type,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to update profile.');
      }

      updateUser({
        name: profileForm.name,
        phone: profileForm.phone,
      });

      toast({
        title: 'Profile Updated',
        description: 'Your personal details have been saved successfully.',
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: err.message || 'Could not save profile changes.',
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Password Update
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!passwordForm.newPassword) {
      toast({ variant: 'destructive', title: 'Password Required', description: 'Please enter a new password.' });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast({ variant: 'destructive', title: 'Password Too Short', description: 'Password must be at least 6 characters.' });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({ variant: 'destructive', title: 'Mismatch', description: 'New password and confirmation do not match.' });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          phone: user.phone,
          type: user.type,
          password: passwordForm.newPassword,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to change password.');
      }

      toast({
        title: 'Password Updated!',
        description: 'Your account password has been updated securely.',
      });

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Password Update Failed',
        description: err.message || 'Could not update password.',
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Status Badge Formatter
  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
      case 'accepted':
        return (
          <Badge className="bg-emerald-600/90 text-white hover:bg-emerald-600 gap-1 text-[10px] sm:text-xs px-2 py-0.5 shrink-0">
            <CheckCircle2 className="h-3 w-3" /> Confirmed
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-primary text-primary-foreground gap-1 text-[10px] sm:text-xs px-2 py-0.5 shrink-0">
            <Gem className="h-3 w-3" /> Completed
          </Badge>
        );
      case 'rescheduled':
        return (
          <Badge className="bg-amber-600 text-white gap-1 text-[10px] sm:text-xs px-2 py-0.5 shrink-0">
            <Clock className="h-3 w-3" /> Rescheduled
          </Badge>
        );
      case 'rejected':
      case 'cancelled':
        return (
          <Badge variant="destructive" className="gap-1 text-[10px] sm:text-xs px-2 py-0.5 shrink-0">
            <AlertCircle className="h-3 w-3" /> Cancelled
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1 text-[10px] sm:text-xs bg-muted text-muted-foreground border px-2 py-0.5 shrink-0">
            <Clock className="h-3 w-3" /> Pending Review
          </Badge>
        );
    }
  };

  // Extract Initials
  const getInitials = (name: string) => {
    if (!name) return 'ST';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  // Invoices list extracted from bookings
  const invoicedBookings = useMemo(() => {
    return userBookings.filter((b) => b.invoice_number);
  }, [userBookings]);

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <LoaderCircle className="h-8 w-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground font-medium">Loading VIP Guest Portal...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/20 selection:text-primary w-full max-w-full overflow-x-hidden">
      <Header />
      
      <main className="flex-1 bg-background-alt/50 pb-16 sm:pb-24 w-full max-w-full overflow-x-hidden">
        
        {/* Luxury Hero Banner - Fully Mobile Responsive */}
        <section className="relative overflow-hidden bg-slate-950 text-white py-8 sm:py-12 md:py-14 border-b border-primary/20 w-full">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-primary via-transparent to-transparent pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 sm:w-96 h-72 sm:h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="container mx-auto max-w-6xl px-4 sm:px-6 relative z-10 w-full">
            <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
              
              {/* Profile Overview */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-left w-full md:w-auto min-w-0">
                <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-2 border-primary/60 shadow-xl ring-4 ring-primary/10 bg-slate-900 shrink-0">
                  <AvatarFallback className="font-headline font-bold text-lg sm:text-xl text-primary">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-2 min-w-0 w-full">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-headline font-bold text-white tracking-tight break-words">
                      {user.name}
                    </h1>
                    {user.type === 'admin' ? (
                      <Badge className="bg-primary text-primary-foreground font-semibold px-2.5 py-0.5 text-[10px] sm:text-[11px] gap-1 border-none shadow-sm shrink-0">
                        <ShieldCheck className="h-3 w-3" /> System Administrator
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] sm:text-[11px] gap-1 font-semibold shrink-0">
                        <Gem className="h-3 w-3 text-amber-400" /> VIP Expedition Member
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-4 text-xs text-slate-300">
                    <span className="flex items-center gap-1.5 break-all">
                      <Mail className="h-3.5 w-3.5 text-primary shrink-0" /> {user.email}
                    </span>
                    {user.phone && (
                      <span className="flex items-center gap-1.5 font-mono">
                        <Phone className="h-3.5 w-3.5 text-primary shrink-0" /> {user.phone}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Calendar className="h-3.5 w-3.5 shrink-0" /> Joined {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '2026'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions (Responsive Grid / Row) */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center sm:justify-end gap-2 w-full md:w-auto shrink-0 pt-1 sm:pt-0">
                <div className={cn(
                  "grid gap-2 w-full sm:w-auto sm:flex sm:items-center",
                  user.type === 'admin' ? "grid-cols-2" : "grid-cols-1"
                )}>
                  {user.type === 'admin' && (
                    <Button asChild variant="outline" className="border-primary/40 text-primary hover:bg-primary/10 rounded-xl text-xs h-9 px-3 whitespace-nowrap justify-center">
                      <Link href="/admin/dashboard">
                        <Shield className="mr-1.5 h-3.5 w-3.5" /> Admin Studio
                      </Link>
                    </Button>
                  )}
                  
                  <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl text-xs h-9 px-4 shadow-md whitespace-nowrap justify-center">
                    <Link href="/tours">
                      <Compass className="mr-1.5 h-3.5 w-3.5" /> Book Tour
                    </Link>
                  </Button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => logout()}
                  className="border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl text-xs h-9 px-3 gap-1.5 w-full sm:w-auto justify-center shrink-0"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </Button>
              </div>

            </div>

            {/* KPI Metrics Strip - 2 cols on mobile, 4 cols on desktop */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-white/10 w-full">
              <div className="bg-white/5 backdrop-blur-xs rounded-xl p-2.5 sm:p-3 border border-white/10 text-center sm:text-left">
                <span className="text-[10px] sm:text-[11px] text-slate-400 block font-medium">Total Expeditions</span>
                <span className="text-lg sm:text-xl font-bold font-headline text-white mt-0.5 block">{userBookings.length}</span>
              </div>
              <div className="bg-white/5 backdrop-blur-xs rounded-xl p-2.5 sm:p-3 border border-white/10 text-center sm:text-left">
                <span className="text-[10px] sm:text-[11px] text-slate-400 block font-medium">Confirmed / Active</span>
                <span className="text-lg sm:text-xl font-bold font-headline text-emerald-400 mt-0.5 block">
                  {userBookings.filter(b => b.status === 'confirmed' || b.status === 'accepted').length}
                </span>
              </div>
              <div className="bg-white/5 backdrop-blur-xs rounded-xl p-2.5 sm:p-3 border border-white/10 text-center sm:text-left">
                <span className="text-[10px] sm:text-[11px] text-slate-400 block font-medium">Invoices Issued</span>
                <span className="text-lg sm:text-xl font-bold font-headline text-amber-400 mt-0.5 block">{invoicedBookings.length}</span>
              </div>
              <div className="bg-white/5 backdrop-blur-xs rounded-xl p-2.5 sm:p-3 border border-white/10 text-center sm:text-left">
                <span className="text-[10px] sm:text-[11px] text-slate-400 block font-medium">Account Status</span>
                <span className="text-[11px] sm:text-xs font-semibold text-primary mt-1 block flex items-center justify-center sm:justify-start gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Active Member
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* Tabbed Portal Content */}
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 mt-6 sm:mt-8 w-full">
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
            
            {/* Tab Navigation Controls (2x2 grid on mobile, 4-column grid on desktop) */}
            <div className="w-full">
              <TabsList className="grid grid-cols-2 sm:grid-cols-4 bg-muted/80 p-1 sm:p-1.5 rounded-2xl border border-border/80 w-full h-auto gap-1 sm:gap-1.5">
                <TabsTrigger
                  value="bookings"
                  className="rounded-xl px-2 py-2.5 text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-xs flex items-center justify-center gap-1.5 sm:gap-2 text-center h-10 transition-all"
                >
                  <Compass className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                  <span className="truncate">Expeditions ({userBookings.length})</span>
                </TabsTrigger>

                <TabsTrigger
                  value="invoices"
                  className="rounded-xl px-2 py-2.5 text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-xs flex items-center justify-center gap-1.5 sm:gap-2 text-center h-10 transition-all"
                >
                  <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                  <span className="truncate">Invoices ({invoicedBookings.length})</span>
                </TabsTrigger>

                <TabsTrigger
                  value="account"
                  className="rounded-xl px-2 py-2.5 text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-xs flex items-center justify-center gap-1.5 sm:gap-2 text-center h-10 transition-all"
                >
                  <UserIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                  <span className="truncate">Personal Info</span>
                </TabsTrigger>

                <TabsTrigger
                  value="security"
                  className="rounded-xl px-2 py-2.5 text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-xs flex items-center justify-center gap-1.5 sm:gap-2 text-center h-10 transition-all"
                >
                  <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                  <span className="truncate">Security</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* TAB 1: MY EXPEDITIONS & BOOKINGS */}
            <TabsContent value="bookings" className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-foreground">Expedition Booking History</h2>
                  <p className="text-xs text-muted-foreground">Review your private gem mine tours, requested dates, and expedition status.</p>
                </div>
                <Button asChild size="sm" className="rounded-xl text-xs h-9 px-4 bg-primary text-primary-foreground font-semibold w-full sm:w-auto shadow-xs justify-center">
                  <Link href="/tours">
                    <Compass className="mr-1.5 h-3.5 w-3.5" /> Book Another Tour
                  </Link>
                </Button>
              </div>

              {isLoadingData ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                  <LoaderCircle className="h-8 w-8 text-primary animate-spin" />
                  <p className="text-xs font-medium">Fetching your expedition itinerary...</p>
                </div>
              ) : userBookings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userBookings.map((booking) => {
                    const pkg = packagesMap[booking.tourType];
                    const bgImg = booking.tourImage || pkg?.imageUrl || pkg?.heroImage || 'https://content-provider.payshia.com/sapphire-trail/images/img35.webp';
                    const pkgSlug = booking.tourSlug || pkg?.slug;

                    return (
                      <Card key={booking.id} className="overflow-hidden border-border/80 shadow-xs hover:shadow-md transition-shadow bg-card flex flex-col justify-between rounded-2xl w-full">
                        <div>
                          {/* Tour Header Banner */}
                          <div className="relative h-32 sm:h-36 w-full overflow-hidden bg-slate-900">
                            <Image
                              src={bgImg}
                              alt={booking.tourTitle || 'Tour Package'}
                              fill
                              sizes="(max-width: 768px) 100vw, 50vw"
                              className="object-cover opacity-70 group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                            
                            <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
                              <span className="text-[10px] font-bold text-white uppercase tracking-wider bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-md border border-white/20 shrink-0">
                                Booking #{booking.id}
                              </span>
                              {getStatusBadge(booking.status)}
                            </div>

                            <div className="absolute bottom-2.5 left-2.5 right-2.5">
                              <h3 className="font-headline font-bold text-white text-sm sm:text-base line-clamp-1">
                                {booking.tourTitle}
                              </h3>
                            </div>
                          </div>

                          {/* Tour Details Content */}
                          <CardContent className="p-3.5 sm:p-4 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              <div className="flex items-center gap-2 text-muted-foreground min-w-0">
                                <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                                <span className="truncate font-medium text-foreground">
                                  {booking.date ? format(parseISO(booking.date), 'PPP') : 'Date TBD'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground min-w-0">
                                <Users className="h-3.5 w-3.5 text-primary shrink-0" />
                                <span className="font-medium text-foreground truncate">{booking.guests} Guest{booking.guests !== 1 ? 's' : ''}</span>
                              </div>
                            </div>

                            {booking.message && (
                              <div className="p-2.5 rounded-lg bg-muted/40 border text-[11px] sm:text-xs text-muted-foreground line-clamp-2 italic break-words">
                                &quot;{booking.message}&quot;
                              </div>
                            )}

                            {booking.invoice_number && (
                              <div className="flex items-center justify-between p-2 rounded-lg bg-primary/5 border border-primary/20 text-xs">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
                                  <span className="font-mono font-semibold text-foreground text-[11px] sm:text-xs truncate">{booking.invoice_number}</span>
                                </div>
                                <Link
                                  href={`/invoices/${booking.invoice_number}`}
                                  target="_blank"
                                  className="text-primary hover:underline font-medium text-[11px] flex items-center gap-0.5 shrink-0 ml-2"
                                >
                                  View Invoice <ExternalLink className="h-3 w-3" />
                                </Link>
                              </div>
                            )}
                          </CardContent>
                        </div>

                        <CardFooter className="p-3.5 sm:p-4 pt-0 border-t border-border/50 bg-muted/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 mt-auto">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedBooking(booking)}
                            className="rounded-xl text-xs h-8 sm:h-9 px-3 border-border hover:border-primary/40 hover:bg-primary/5 w-full sm:w-auto justify-center"
                          >
                            View Expedition Details
                          </Button>

                          {pkgSlug && (
                            <Button
                              asChild
                              variant="ghost"
                              size="sm"
                              className="rounded-xl text-xs h-8 sm:h-9 text-primary hover:text-primary hover:bg-primary/10 w-full sm:w-auto justify-center"
                            >
                              <Link href={`/tours/${pkgSlug}`}>
                                Package Info <ArrowRight className="ml-1 h-3 w-3" />
                              </Link>
                            </Button>
                          )}
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card className="border-dashed border-2 py-14 sm:py-16 text-center rounded-2xl">
                  <CardContent className="flex flex-col items-center justify-center gap-3 p-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Compass className="h-6 w-6 sm:h-7 sm:w-7" />
                    </div>
                    <h3 className="font-bold text-sm sm:text-base text-foreground">No Expeditions Booked Yet</h3>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      You have not requested any gemstone mining expeditions yet. Explore our bespoke tour packages and reserve your private journey.
                    </p>
                    <Button asChild className="rounded-xl text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold mt-2">
                      <Link href="/tours">
                        <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Explore Tour Packages
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* TAB 2: INVOICES & BILLING */}
            <TabsContent value="invoices" className="space-y-4">
              <div className="px-1">
                <h2 className="text-base sm:text-lg font-bold text-foreground">Invoices &amp; Official Receipts</h2>
                <p className="text-xs text-muted-foreground">Access your verified tax invoices, payment receipts, and billing breakdowns.</p>
              </div>

              {invoicedBookings.length > 0 ? (
                <div className="space-y-3">
                  {invoicedBookings.map((b) => (
                    <Card key={b.id} className="border-border/80 shadow-xs hover:border-primary/40 transition-colors rounded-2xl w-full">
                      <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 mt-0.5">
                            <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
                          </div>
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono font-bold text-xs sm:text-sm text-foreground">{b.invoice_number}</span>
                              {b.invoice_payment_status === 'paid' ? (
                                <Badge className="bg-emerald-600 text-white text-[9px] sm:text-[10px] px-2 py-0 shrink-0">Paid in Full</Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border border-amber-500/30 text-[9px] sm:text-[10px] px-2 py-0 shrink-0">
                                  {b.invoice_payment_status || 'Pending Payment'}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground font-medium truncate">{b.tourTitle}</p>
                            <p className="text-[11px] text-muted-foreground flex flex-wrap items-center gap-1.5 sm:gap-2">
                              <span>Date: {b.date ? format(parseISO(b.date), 'PPP') : 'TBD'}</span>
                              <span>&bull;</span>
                              <span>{b.guests} Guest(s)</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2.5 sm:pt-0 border-t sm:border-t-0 border-border/60">
                          {b.invoice_total && (
                            <div className="text-left sm:text-right pr-2">
                              <span className="text-[10px] text-muted-foreground block">Total Amount</span>
                              <span className="font-mono font-bold text-xs sm:text-sm text-primary whitespace-nowrap">USD {b.invoice_total.toLocaleString()}</span>
                            </div>
                          )}

                          <Button asChild size="sm" className="rounded-xl text-xs h-8 sm:h-9 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs shrink-0 ml-auto sm:ml-0">
                            <Link href={`/invoices/${b.invoice_number}`} target="_blank">
                              <FileText className="mr-1.5 h-3.5 w-3.5" />
                              <span>View &amp; Print</span>
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-dashed border-2 py-14 sm:py-16 text-center rounded-2xl">
                  <CardContent className="flex flex-col items-center justify-center gap-3 p-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground">
                      <FileText className="h-6 w-6 sm:h-7 sm:w-7" />
                    </div>
                    <h3 className="font-bold text-sm sm:text-base text-foreground">No Invoices Issued</h3>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      Official invoices are automatically generated and linked to your profile upon booking confirmation.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* TAB 3: PERSONAL PROFILE & CONTACT INFO */}
            <TabsContent value="account">
              <Card className="border-border/80 shadow-xs max-w-xl mx-auto rounded-2xl">
                <CardHeader className="p-4 sm:p-6 pb-3">
                  <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                    <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    <span>Personal Profile Details</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Keep your contact information up to date for tour coordination and expedition logistics.
                  </CardDescription>
                </CardHeader>

                <form onSubmit={handleSaveProfile}>
                  <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Full Name *</Label>
                      <Input
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        required
                        className="text-xs sm:text-sm h-10 rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold">Email Address</Label>
                        <span className="text-[10px] text-muted-foreground italic">Primary Login ID</span>
                      </div>
                      <Input
                        value={user.email}
                        disabled
                        className="text-xs sm:text-sm h-10 rounded-xl bg-muted/50 cursor-not-allowed font-mono text-muted-foreground"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Phone Number / WhatsApp</Label>
                      <Input
                        type="tel"
                        placeholder="e.g., +94 71 234 5678"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="text-xs sm:text-sm h-10 rounded-xl font-mono"
                      />
                      <p className="text-[10px] text-muted-foreground">
                        Our gemologist concierge uses this number to coordinate hotel pickup and VIP transport.
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <Label className="text-xs font-semibold">Account Tier</Label>
                      <div className="p-3 rounded-xl bg-muted/30 border flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Gem className="h-4 w-4 text-primary" />
                          <span className="font-semibold">{user.type === 'admin' ? 'Administrator' : 'Expedition Club Member'}</span>
                        </div>
                        <Badge variant="outline" className="text-[10px] border-primary/40 text-primary">Verified</Badge>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex justify-end gap-2 border-t border-border/60 p-4 sm:p-6 pt-4">
                    <Button
                      type="submit"
                      disabled={isSavingProfile}
                      className="w-full sm:w-auto rounded-xl text-xs sm:text-sm h-10 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs"
                    >
                      {isSavingProfile && <LoaderCircle className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                      <span>Save Profile Changes</span>
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>

            {/* TAB 4: SECURITY & PASSWORD */}
            <TabsContent value="security">
              <Card className="border-border/80 shadow-xs max-w-xl mx-auto rounded-2xl">
                <CardHeader className="p-4 sm:p-6 pb-3">
                  <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                    <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    <span>Account Security &amp; Password</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Manage your password and protect your Sapphire Trails VIP account.
                  </CardDescription>
                </CardHeader>

                <form onSubmit={handleUpdatePassword}>
                  <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">New Password *</Label>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? 'text' : 'password'}
                          placeholder="Minimum 6 characters"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          required
                          className="text-xs sm:text-sm h-10 rounded-xl pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Confirm New Password *</Label>
                      <Input
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Re-type your new password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        required
                        className="text-xs sm:text-sm h-10 rounded-xl"
                      />
                    </div>

                    <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 space-y-1 text-xs text-muted-foreground">
                      <p className="font-semibold text-foreground flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Password Security Guidelines
                      </p>
                      <ul className="text-[11px] list-disc list-inside space-y-0.5 text-muted-foreground/90 pl-1">
                        <li>Use at least 6 characters including letters and numbers.</li>
                        <li>Avoid reusing passwords from other travel sites.</li>
                      </ul>
                    </div>
                  </CardContent>

                  <CardFooter className="flex justify-end gap-2 border-t border-border/60 p-4 sm:p-6 pt-4">
                    <Button
                      type="submit"
                      disabled={isUpdatingPassword}
                      className="w-full sm:w-auto rounded-xl text-xs sm:text-sm h-10 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs"
                    >
                      {isUpdatingPassword && <LoaderCircle className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                      <span>Update Password</span>
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>

          </Tabs>

        </div>

      </main>

      {/* EXPEDITION DETAILS MODAL - Mobile Viewport Optimized */}
      <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
        {selectedBooking && (
          <DialogContent className="w-[calc(100vw-24px)] max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl p-4 sm:p-6">
            <DialogHeader className="space-y-2">
              <div className="flex items-center justify-between gap-2 pr-4">
                <span className="text-[10px] font-mono uppercase bg-primary/10 text-primary px-2 py-0.5 rounded-md font-bold">
                  Expedition #{selectedBooking.id}
                </span>
                {getStatusBadge(selectedBooking.status)}
              </div>
              <DialogTitle className="text-base sm:text-lg font-bold text-left pt-1">
                {selectedBooking.tourTitle}
              </DialogTitle>
              <DialogDescription className="text-xs text-left">
                Complete reservation summary and logistics details.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3.5 py-2 text-xs">
              
              <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-muted/40 border">
                <div>
                  <span className="text-[10px] text-muted-foreground block">Tour Date</span>
                  <span className="font-bold text-foreground font-mono text-[11px] sm:text-xs">
                    {selectedBooking.date ? format(parseISO(selectedBooking.date), 'PPP') : 'TBD'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Party Size</span>
                  <span className="font-bold text-foreground text-[11px] sm:text-xs">
                    {selectedBooking.guests} Guest(s)
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Lead Contact</span>
                <div className="p-3 rounded-xl border space-y-1 text-left">
                  <p className="font-semibold text-foreground text-xs">{selectedBooking.name}</p>
                  <p className="text-muted-foreground flex items-center gap-1.5 text-[11px] break-all">
                    <Mail className="h-3 w-3 text-primary shrink-0" /> {selectedBooking.email}
                  </p>
                  {selectedBooking.phone && (
                    <p className="text-muted-foreground flex items-center gap-1.5 font-mono text-[11px]">
                      <Phone className="h-3 w-3 text-primary shrink-0" /> {selectedBooking.phone}
                    </p>
                  )}
                </div>
              </div>

              {selectedBooking.message && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Special Requests &amp; Notes</span>
                  <div className="p-3 rounded-xl bg-muted/20 border italic text-muted-foreground text-[11px] text-left">
                    &quot;{selectedBooking.message}&quot;
                  </div>
                </div>
              )}

              {selectedBooking.invoice_number && (
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-between gap-2">
                  <div className="space-y-0.5 text-left">
                    <span className="text-[9px] text-primary font-bold uppercase block">Linked Tax Invoice</span>
                    <span className="font-mono font-bold text-foreground text-xs sm:text-sm">{selectedBooking.invoice_number}</span>
                  </div>
                  <Button asChild size="sm" className="rounded-xl text-xs h-8 px-3 bg-primary text-primary-foreground font-semibold shrink-0">
                    <Link href={`/invoices/${selectedBooking.invoice_number}`} target="_blank">
                      <FileText className="mr-1.5 h-3.5 w-3.5" /> View Invoice
                    </Link>
                  </Button>
                </div>
              )}

            </div>

            <DialogFooter className="pt-2">
              <Button
                variant="outline"
                onClick={() => setSelectedBooking(null)}
                className="rounded-xl text-xs h-9 w-full sm:w-auto"
              >
                Close Summary
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      <TrustSection />
      <Footer />
    </div>

  );
}

