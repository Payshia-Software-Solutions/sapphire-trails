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
  AlertCircle,
  Award,
  MessageCircle,
  KeyRound,
  ChevronRight
} from 'lucide-react';
import { AgentReferralTab } from '@/components/profile/agent-referral-tab';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { TrustSection } from '@/components/sections/TrustSection';
import { API_BASE_URL, cn } from '@/lib/utils';
import { authFetch } from '@/lib/api';
import { type Booking } from '@/lib/bookings-data';
import { mapServerPackageToClient, type TourPackage } from '@/lib/packages-data';
import { useSiteContent, getWhatsappUrl } from '@/lib/site-content';

export default function ProfilePage() {
  const { user, logout, updateUser, isLoading: authLoading } = useAuth();
  const { content } = useSiteContent();
  const router = useRouter();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('bookings');
  const [bookingFilter, setBookingFilter] = useState<'all' | 'confirmed' | 'pending' | 'cancelled'>('all');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const requestedTab = new URLSearchParams(window.location.search).get('tab');
    if (requestedTab && ['bookings', 'invoices', 'referrals', 'account', 'security'].includes(requestedTab)) {
      setActiveTab(requestedTab);
    }
  }, []);
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

  const confirmedCount = useMemo(() => {
    return userBookings.filter((b) => b.status === 'confirmed' || b.status === 'accepted').length;
  }, [userBookings]);

  const filteredBookings = useMemo(() => {
    if (bookingFilter === 'all') return userBookings;
    if (bookingFilter === 'confirmed') {
      return userBookings.filter((b) => b.status === 'confirmed' || b.status === 'accepted');
    }
    if (bookingFilter === 'pending') {
      return userBookings.filter((b) => b.status === 'pending' || b.status === 'rescheduled' || !b.status);
    }
    return userBookings.filter((b) => b.status === 'rejected' || (b.status as string) === 'cancelled');
  }, [userBookings, bookingFilter]);

  const portalNavItems = useMemo(
    () => [
      {
        id: 'bookings',
        label: 'Expeditions',
        description: 'Itineraries & status',
        icon: Compass,
        count: userBookings.length,
      },
      {
        id: 'invoices',
        label: 'Invoices',
        description: 'Official receipts & tax',
        icon: FileText,
        count: invoicedBookings.length,
      },
      {
        id: 'referrals',
        label: 'Agent Program',
        description: 'Partner links & ledger',
        icon: Award,
        badge: 'Partner',
      },
      {
        id: 'account',
        label: 'Personal Details',
        description: 'Contact & VIP profile',
        icon: UserIcon,
      },
      {
        id: 'security',
        label: 'Security & Access',
        description: 'Password & session',
        icon: Lock,
      },
    ],
    [userBookings.length, invoicedBookings.length]
  );

  const conciergeWhatsappUrl = useMemo(
    () =>
      getWhatsappUrl(
        content,
        `Hello Sapphire Trails Concierge, I am ${user?.name || 'a VIP Guest'} (${user?.email || ''}) reaching out from my member portal.`
      ),
    [content, user?.name, user?.email]
  );

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

      <main className="flex-1 bg-background-alt/60 pb-16 sm:pb-24 w-full max-w-full overflow-x-hidden">
        {/* Luxury Concierge Hero Header */}
        <section className="relative overflow-hidden bg-[#08111e] text-white py-10 sm:py-12 md:py-14 border-b border-primary/25 w-full">
          <Image
            src="/img/hero-misty-mountains.jpg"
            alt="Ratnapura misty highlands"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-20 mix-blend-luminosity pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#08111e]/95 via-[#08111e]/85 to-[#0b192c]/95 pointer-events-none" />
          <div className="absolute -top-24 right-0 w-96 h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none" />

          <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12 relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Identity Block */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left min-w-0 flex-1 w-full">
                <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-2 border-primary/70 shadow-2xl ring-4 ring-primary/15 bg-slate-900 shrink-0">
                  <AvatarFallback className="font-headline font-bold text-xl sm:text-2xl text-primary bg-[#0f1d32]">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-2.5 min-w-0 flex-1 w-full">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-300/90">
                      Private Member Portal
                    </span>
                    <span className="text-slate-600 hidden sm:inline">&bull;</span>
                    {user.type === 'admin' ? (
                      <Badge className="bg-primary text-primary-foreground font-semibold px-2.5 py-0.5 text-[10px] gap-1 border-none shadow-sm">
                        <ShieldCheck className="h-3 w-3" /> System Administrator
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-500/15 text-amber-300 border border-amber-400/30 text-[10px] gap-1 font-semibold px-2.5 py-0.5">
                        <Gem className="h-3 w-3 text-amber-400" /> VIP Expedition Club
                      </Badge>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-headline font-bold text-white tracking-tight break-words">
                    {user.name}
                  </h1>

                  <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-5 text-xs text-slate-300">
                    <span className="inline-flex items-center gap-1.5 min-w-0 max-w-full">
                      <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </span>
                    {user.phone && (
                      <span className="inline-flex items-center gap-1.5 font-mono whitespace-nowrap">
                        <Phone className="h-3.5 w-3.5 text-primary shrink-0" /> {user.phone}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 text-slate-400 whitespace-nowrap">
                      <Calendar className="h-3.5 w-3.5 shrink-0" /> Member since{' '}
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                        : '2026'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Hero Action Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-end gap-2.5 shrink-0">
                {user.type === 'admin' && (
                  <Button
                    asChild
                    variant="outline"
                    className="border-primary/40 bg-primary/10 text-amber-200 hover:bg-primary/20 hover:text-white rounded-xl text-xs h-10 px-4 whitespace-nowrap justify-center"
                  >
                    <Link href="/admin/dashboard">
                      <Shield className="mr-1.5 h-3.5 w-3.5" /> Admin Studio
                    </Link>
                  </Button>
                )}

                <Button
                  asChild
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl text-xs h-10 px-5 shadow-md whitespace-nowrap justify-center"
                >
                  <Link href="/tours">
                    <Compass className="mr-1.5 h-3.5 w-3.5" /> Book Expedition
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => logout()}
                  className="border-white/15 bg-white/5 text-slate-200 hover:text-white hover:bg-white/10 rounded-xl text-xs h-10 px-4 gap-1.5 justify-center"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </Button>
              </div>
            </div>

            {/* Unified Telemetry Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-8 pt-6 border-t border-white/10 w-full">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3.5 border border-white/10">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">
                  Total Expeditions
                </span>
                <span className="text-xl sm:text-2xl font-bold font-headline text-white mt-1 block">
                  {userBookings.length}
                </span>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3.5 border border-white/10">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">
                  Confirmed Journeys
                </span>
                <span className="text-xl sm:text-2xl font-bold font-headline text-emerald-400 mt-1 block">
                  {confirmedCount}
                </span>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3.5 border border-white/10">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">
                  Official Invoices
                </span>
                <span className="text-xl sm:text-2xl font-bold font-headline text-amber-300 mt-1 block">
                  {invoicedBookings.length}
                </span>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3.5 border border-white/10">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">
                  Concierge Access
                </span>
                <span className="text-xs sm:text-sm font-semibold text-white mt-1.5 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Verified Account</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Unified Portal Workspace */}
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12 pt-7 sm:pt-10">
          {/* Mobile & Tablet Horizontal Navigation Pills */}
          <div className="lg:hidden mb-6 -mx-4 px-4 overflow-x-auto pb-1">
            <div className="inline-flex items-center gap-2 min-w-max bg-card border border-border/80 p-1.5 rounded-2xl shadow-sm" role="tablist">
              {portalNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap',
                      isActive
                        ? 'bg-[#08111e] text-white shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                    )}
                  >
                    <Icon className={cn('h-3.5 w-3.5 shrink-0', isActive ? 'text-amber-300' : 'text-primary')} />
                    <span>{item.label}</span>
                    {typeof item.count === 'number' && (
                      <span
                        className={cn(
                          'text-[10px] font-mono px-1.5 py-0.5 rounded-md',
                          isActive ? 'bg-white/15 text-white' : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[270px_1fr] gap-6 lg:gap-8 items-start">
            {/* Desktop Sticky Navigation Rail */}
            <aside className="hidden lg:flex flex-col gap-5 sticky top-24">
              <Card className="border-border/80 rounded-2xl shadow-sm overflow-hidden bg-card">
                <div className="px-4 py-3.5 border-b border-border/60 bg-muted/30">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    Member Workspace
                  </p>
                </div>
                <nav className="p-2 space-y-1" role="tablist" aria-label="Profile Portal Sections">
                  {portalNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => setActiveTab(item.id)}
                        className={cn(
                          'w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left transition-all group',
                          isActive
                            ? 'bg-[#08111e] text-white shadow-sm'
                            : 'text-foreground hover:bg-muted/70'
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={cn(
                              'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                              isActive
                                ? 'bg-primary/20 text-amber-300'
                                : 'bg-primary/10 text-primary group-hover:bg-primary/15'
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold truncate">{item.label}</p>
                            <p
                              className={cn(
                                'text-[10px] truncate',
                                isActive ? 'text-slate-300' : 'text-muted-foreground'
                              )}
                            >
                              {item.description}
                            </p>
                          </div>
                        </div>

                        {typeof item.count === 'number' ? (
                          <span
                            className={cn(
                              'text-[10px] font-mono font-bold px-2 py-0.5 rounded-md shrink-0',
                              isActive ? 'bg-white/15 text-amber-300' : 'bg-muted text-muted-foreground'
                            )}
                          >
                            {item.count}
                          </span>
                        ) : item.badge ? (
                          <span
                            className={cn(
                              'text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0',
                              isActive
                                ? 'bg-amber-400/20 text-amber-300'
                                : 'bg-primary/10 text-primary'
                            )}
                          >
                            {item.badge}
                          </span>
                        ) : (
                          <ChevronRight
                            className={cn(
                              'h-3.5 w-3.5 shrink-0 transition-transform',
                              isActive ? 'text-amber-300 translate-x-0.5' : 'text-muted-foreground/50'
                            )}
                          />
                        )}
                      </button>
                    );
                  })}
                </nav>
              </Card>

              {/* 24/7 Private Concierge Card */}
              <Card className="border-primary/25 rounded-2xl shadow-sm overflow-hidden bg-[#08111e] text-white">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-amber-300 shrink-0">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-amber-300 font-bold">
                        Private Concierge
                      </p>
                      <h3 className="text-sm font-headline font-bold text-white">Direct Gemologist Desk</h3>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Need custom mine access dates, private chauffeur transfers, or invoice adjustments? Speak directly with our Sri Lanka team.
                  </p>
                  <div className="space-y-2 pt-1">
                    <Button
                      asChild
                      size="sm"
                      className="w-full rounded-xl h-9 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white border-none"
                    >
                      <a href={conciergeWhatsappUrl} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="mr-1.5 h-3.5 w-3.5" /> WhatsApp Concierge
                      </a>
                    </Button>
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="w-full rounded-xl h-8 text-[11px] text-slate-300 hover:text-white hover:bg-white/10"
                    >
                      <Link href="/contact">
                        Visit Concierge Desk <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </aside>

            {/* Right Active Workspace Column */}
            <div className="min-w-0 w-full space-y-6">

            {/* TAB 1: MY EXPEDITIONS & BOOKINGS */}
            {activeTab === 'bookings' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/60 pb-4">
                  <div className="space-y-1">
                    <h2 className="text-lg sm:text-xl font-headline font-bold text-foreground">
                      Expedition Booking History
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Track your private Ratnapura gem mine tours, confirmed dates, and expedition concierge notes.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {(['all', 'confirmed', 'pending', 'cancelled'] as const).map((statusKey) => (
                      <button
                        key={statusKey}
                        type="button"
                        onClick={() => setBookingFilter(statusKey)}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-[11px] font-semibold capitalize transition-colors border',
                          bookingFilter === statusKey
                            ? 'bg-[#08111e] text-white border-[#08111e]'
                            : 'bg-card text-muted-foreground border-border/80 hover:text-foreground hover:border-border'
                        )}
                      >
                        {statusKey}
                      </button>
                    ))}
                    <Button
                      asChild
                      size="sm"
                      className="rounded-xl text-xs h-8 px-3.5 bg-primary text-primary-foreground font-semibold shadow-sm"
                    >
                      <Link href="/tours">
                        <Compass className="mr-1.5 h-3.5 w-3.5" /> New Booking
                      </Link>
                    </Button>
                  </div>
                </div>

                {isLoadingData ? (
                  <Card className="border-border/80 rounded-2xl py-20">
                    <CardContent className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                      <LoaderCircle className="h-8 w-8 text-primary animate-spin" />
                      <p className="text-xs font-medium">Fetching your expedition itinerary...</p>
                    </CardContent>
                  </Card>
                ) : filteredBookings.length > 0 ? (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                    {filteredBookings.map((booking) => {
                      const pkg = packagesMap[booking.tourType];
                      const bgImg =
                        booking.tourImage ||
                        pkg?.imageUrl ||
                        pkg?.heroImage ||
                        'https://content-provider.payshia.com/sapphire-trail/images/img35.webp';
                      const pkgSlug = booking.tourSlug || pkg?.slug;

                      return (
                        <Card
                          key={booking.id}
                          className="group overflow-hidden border-border/80 shadow-sm hover:shadow-md hover:border-primary/40 transition-all bg-card flex flex-col justify-between rounded-2xl w-full"
                        >
                          <div>
                            {/* Tour Visual Header */}
                            <div className="relative h-36 sm:h-40 w-full overflow-hidden bg-[#08111e]">
                              <Image
                                src={bgImg}
                                alt={booking.tourTitle || 'Tour Package'}
                                fill
                                sizes="(max-width: 1280px) 100vw, 50vw"
                                className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#08111e] via-[#08111e]/45 to-transparent" />

                              <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                                <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-white/15 shrink-0">
                                  REF #{booking.id}
                                </span>
                                {getStatusBadge(booking.status)}
                              </div>

                              <div className="absolute bottom-3 left-3 right-3">
                                <h3 className="font-headline font-bold text-white text-base sm:text-lg line-clamp-1">
                                  {booking.tourTitle}
                                </h3>
                              </div>
                            </div>

                            {/* Card Body */}
                            <CardContent className="p-4 sm:p-5 space-y-3.5">
                              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-muted/40 border border-border/60 text-xs">
                                <div className="flex items-center gap-2 min-w-0">
                                  <Calendar className="h-4 w-4 text-primary shrink-0" />
                                  <div className="min-w-0">
                                    <span className="text-[10px] text-muted-foreground block">Expedition Date</span>
                                    <span className="truncate font-semibold text-foreground block">
                                      {booking.date ? format(parseISO(booking.date), 'PPP') : 'Date TBD'}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 min-w-0">
                                  <Users className="h-4 w-4 text-primary shrink-0" />
                                  <div className="min-w-0">
                                    <span className="text-[10px] text-muted-foreground block">Party Size</span>
                                    <span className="font-semibold text-foreground truncate block">
                                      {booking.guests} Guest{booking.guests !== 1 ? 's' : ''}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {booking.message && (
                                <div className="p-3 rounded-xl bg-muted/30 border border-border/60 text-xs text-muted-foreground line-clamp-2 italic break-words">
                                  &quot;{booking.message}&quot;
                                </div>
                              )}

                              {booking.invoice_number && (
                                <div className="flex items-center justify-between p-2.5 rounded-xl bg-primary/5 border border-primary/20 text-xs">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <FileText className="h-4 w-4 text-primary shrink-0" />
                                    <span className="font-mono font-semibold text-foreground text-xs truncate">
                                      {booking.invoice_number}
                                    </span>
                                  </div>
                                  <Link
                                    href={`/invoices/${booking.invoice_number}`}
                                    target="_blank"
                                    className="text-primary hover:underline font-semibold text-[11px] flex items-center gap-1 shrink-0 ml-2"
                                  >
                                    Open Invoice <ExternalLink className="h-3 w-3" />
                                  </Link>
                                </div>
                              )}
                            </CardContent>
                          </div>

                          <CardFooter className="p-4 sm:px-5 sm:py-3.5 border-t border-border/60 bg-muted/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 mt-auto">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedBooking(booking)}
                              className="rounded-xl text-xs h-9 px-3.5 border-border hover:border-primary/40 hover:bg-primary/5 w-full sm:w-auto justify-center"
                            >
                              View Itinerary Summary
                            </Button>

                            {pkgSlug && (
                              <Button
                                asChild
                                variant="ghost"
                                size="sm"
                                className="rounded-xl text-xs h-9 text-primary hover:text-primary hover:bg-primary/10 w-full sm:w-auto justify-center"
                              >
                                <Link href={`/tours/${pkgSlug}`}>
                                  Package Dossier <ArrowRight className="ml-1 h-3.5 w-3.5" />
                                </Link>
                              </Button>
                            )}
                          </CardFooter>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <Card className="border-dashed border-2 border-border/80 py-14 sm:py-16 text-center rounded-2xl bg-card/60">
                    <CardContent className="flex flex-col items-center justify-center gap-3 p-4">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                        <Compass className="h-7 w-7" />
                      </div>
                      <h3 className="font-headline font-bold text-base sm:text-lg text-foreground">
                        {bookingFilter === 'all' ? 'No Expeditions Booked Yet' : `No ${bookingFilter} Expeditions`}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground max-w-md">
                        {bookingFilter === 'all'
                          ? 'Reserve a private Ratnapura gemological journey to track your VIP permits, itineraries, and tax invoices here.'
                          : 'Try switching the status filter above to inspect your other expedition requests.'}
                      </p>
                      {bookingFilter === 'all' ? (
                        <Button
                          asChild
                          className="rounded-xl text-xs h-10 px-5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold mt-2"
                        >
                          <Link href="/tours">
                            <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Explore Tour Packages
                          </Link>
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => setBookingFilter('all')}
                          className="rounded-xl text-xs h-9 px-4 mt-2"
                        >
                          Show All Expeditions
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* TAB 2: INVOICES & BILLING */}
            {activeTab === 'invoices' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-border/60 pb-4">
                  <div className="space-y-1">
                    <h2 className="text-lg sm:text-xl font-headline font-bold text-foreground">
                      Invoices &amp; Official Receipts
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Download verified digital tax invoices, payment confirmations, and transparent billing records.
                    </p>
                  </div>
                  <Badge variant="outline" className="w-fit text-xs font-mono px-3 py-1 border-border">
                    {invoicedBookings.length} Issued Document{invoicedBookings.length === 1 ? '' : 's'}
                  </Badge>
                </div>

                {invoicedBookings.length > 0 ? (
                  <div className="space-y-3.5">
                    {invoicedBookings.map((b) => (
                      <Card
                        key={b.id}
                        className="border-border/80 shadow-sm hover:border-primary/40 transition-colors rounded-2xl w-full bg-card"
                      >
                        <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-start gap-3.5 min-w-0 flex-1">
                            <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 mt-0.5">
                              <CreditCard className="h-5 w-5" />
                            </div>
                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono font-bold text-sm text-foreground">{b.invoice_number}</span>
                                {b.invoice_payment_status === 'paid' ? (
                                  <Badge className="bg-emerald-600 text-white text-[10px] px-2 py-0 shrink-0">
                                    Paid in Full
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="secondary"
                                    className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[10px] px-2 py-0 shrink-0"
                                  >
                                    {b.invoice_payment_status || 'Pending Payment'}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs sm:text-sm text-foreground/90 font-medium truncate">{b.tourTitle}</p>
                              <p className="text-[11px] text-muted-foreground flex flex-wrap items-center gap-2">
                                <span>Tour Date: {b.date ? format(parseISO(b.date), 'PPP') : 'TBD'}</span>
                                <span>&bull;</span>
                                <span>{b.guests} Guest(s)</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-border/60">
                            {b.invoice_total && (
                              <div className="text-left sm:text-right">
                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                                  Total Amount
                                </span>
                                <span className="font-mono font-bold text-sm text-primary whitespace-nowrap">
                                  USD {b.invoice_total.toLocaleString()}
                                </span>
                              </div>
                            )}

                            <Button
                              asChild
                              size="sm"
                              className="rounded-xl text-xs h-9 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm shrink-0"
                            >
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
                  <Card className="border-dashed border-2 border-border/80 py-14 sm:py-16 text-center rounded-2xl bg-card/60">
                    <CardContent className="flex flex-col items-center justify-center gap-3 p-4">
                      <div className="w-14 h-14 rounded-2xl bg-muted/70 border border-border flex items-center justify-center text-muted-foreground">
                        <FileText className="h-7 w-7" />
                      </div>
                      <h3 className="font-headline font-bold text-base sm:text-lg text-foreground">No Invoices Issued</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground max-w-md">
                        Official Sapphire Trails tax invoices are automatically issued and archived here once your expedition booking is finalized.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* TAB 3: PERSONAL PROFILE & CONTACT INFO */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                <div className="border-b border-border/60 pb-4 space-y-1">
                  <h2 className="text-lg sm:text-xl font-headline font-bold text-foreground">
                    Personal Details &amp; VIP Profile
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Manage your verified traveler credentials for private transport coordination and mine access permits.
                  </p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
                  {/* Identity & Contact Form (7 cols) */}
                  <Card className="xl:col-span-7 border-border/80 shadow-sm rounded-2xl bg-card flex flex-col">
                    <CardHeader className="p-5 sm:p-6 pb-3">
                      <CardTitle className="text-base sm:text-lg font-headline font-bold flex items-center gap-2">
                        <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                        <span>Identity &amp; Contact Credentials</span>
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Updates take effect immediately across upcoming itineraries and concierge dispatches.
                      </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSaveProfile} className="flex-1 flex flex-col justify-between">
                      <CardContent className="p-5 sm:p-6 pt-2 space-y-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">Full Legal / Guest Name *</Label>
                          <Input
                            value={profileForm.name}
                            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                            required
                            className="text-xs sm:text-sm h-10 rounded-xl"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold">Primary Email Address</Label>
                            <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-700 dark:text-emerald-300 bg-emerald-500/5">
                              Primary Login ID
                            </Badge>
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
                          <p className="text-[11px] text-muted-foreground">
                            Used strictly by your assigned gemologist host for Colombo/Galle hotel pickups and private permits.
                          </p>
                        </div>
                      </CardContent>

                      <CardFooter className="flex justify-end gap-2 border-t border-border/60 p-5 sm:p-6 pt-4">
                        <Button
                          type="submit"
                          disabled={isSavingProfile}
                          className="w-full sm:w-auto rounded-xl text-xs sm:text-sm h-10 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm"
                        >
                          {isSavingProfile && <LoaderCircle className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                          <span>Save Profile Changes</span>
                        </Button>
                      </CardFooter>
                    </form>
                  </Card>

                  {/* Account Standing & Concierge Summary (5 cols) */}
                  <div className="xl:col-span-5 flex flex-col gap-5">
                    <Card className="border-border/80 shadow-sm rounded-2xl bg-card overflow-hidden">
                      <div className="bg-[#08111e] text-white px-5 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Gem className="h-4 w-4 text-amber-300" />
                          <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                            Membership Standing
                          </span>
                        </div>
                        <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px]">
                          Verified
                        </Badge>
                      </div>
                      <CardContent className="p-5 space-y-4">
                        <div className="flex items-center justify-between text-xs border-b border-border/60 pb-3">
                          <span className="text-muted-foreground">Access Tier</span>
                          <span className="font-semibold text-foreground">
                            {user.type === 'admin' ? 'System Administrator' : 'Expedition Club Member'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs border-b border-border/60 pb-3">
                          <span className="text-muted-foreground">Member Since</span>
                          <span className="font-mono font-medium text-foreground">
                            {user.created_at
                              ? new Date(user.created_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })
                              : 'Active 2026'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Account Reference</span>
                          <span className="font-mono font-semibold text-primary">ST-MBR-{user.id}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-border/80 shadow-sm rounded-2xl bg-muted/25 flex-1">
                      <CardContent className="p-5 space-y-2.5">
                        <p className="text-xs font-bold text-foreground flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-primary" />
                          Private Coordination Assurance
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Guest records are encrypted and never shared with third-party operators outside your licensed Sapphire Trails expedition host team.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: SECURITY & PASSWORD */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="border-b border-border/60 pb-4 space-y-1">
                  <h2 className="text-lg sm:text-xl font-headline font-bold text-foreground">
                    Security &amp; Access Control
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Update your sign-in credentials and safeguard your private expedition portal.
                  </p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
                  {/* Password Update Form (7 cols) */}
                  <Card className="xl:col-span-7 border-border/80 shadow-sm rounded-2xl bg-card flex flex-col">
                    <CardHeader className="p-5 sm:p-6 pb-3">
                      <CardTitle className="text-base sm:text-lg font-headline font-bold flex items-center gap-2">
                        <KeyRound className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                        <span>Update Account Password</span>
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Choose a unique password you do not use on other travel platforms.
                      </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleUpdatePassword} className="flex-1 flex flex-col justify-between">
                      <CardContent className="p-5 sm:p-6 pt-2 space-y-4">
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
                              aria-label={showNewPassword ? 'Hide password' : 'Show password'}
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
                      </CardContent>

                      <CardFooter className="flex justify-end gap-2 border-t border-border/60 p-5 sm:p-6 pt-4">
                        <Button
                          type="submit"
                          disabled={isUpdatingPassword}
                          className="w-full sm:w-auto rounded-xl text-xs sm:text-sm h-10 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm"
                        >
                          {isUpdatingPassword && <LoaderCircle className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                          <span>Update Password</span>
                        </Button>
                      </CardFooter>
                    </form>
                  </Card>

                  {/* Security Posture & Guidelines (5 cols) */}
                  <div className="xl:col-span-5 flex flex-col gap-5">
                    <Card className="border-border/80 shadow-sm rounded-2xl bg-card flex-1 flex flex-col">
                      <CardHeader className="p-5 sm:p-6 pb-3">
                        <CardTitle className="text-base font-headline font-bold flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-primary" />
                          <span>Security Recommendations</span>
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Best practices for keeping your VIP portal protected.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-5 sm:p-6 pt-2 flex-1 space-y-3 text-xs text-muted-foreground">
                        <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
                          <p className="font-semibold text-foreground">Password Best Practices</p>
                          <ul className="space-y-1.5 text-[11px]">
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span>Use at least 6+ characters combining letters and numbers.</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span>Google Sign-In members can set a backup password anytime here.</span>
                            </li>
                          </ul>
                        </div>
                      </CardContent>
                      <CardFooter className="mt-auto border-t border-border/60 p-5 sm:p-6 pt-4 flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-foreground text-xs">Active Session</p>
                          <p className="text-[11px] text-muted-foreground">Signed in via encrypted token</p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => logout()}
                          className="rounded-xl text-xs h-9 px-3.5 border-destructive/30 text-destructive hover:bg-destructive/10 shrink-0"
                        >
                          <LogOut className="mr-1.5 h-3.5 w-3.5" /> Sign Out
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: REFERRAL AGENT PROGRAM */}
            {activeTab === 'referrals' && <AgentReferralTab />}
            </div>
          </div>

          {/* Mobile & Tablet Concierge Card */}
          <Card className="lg:hidden mt-6 border-primary/25 rounded-2xl shadow-sm overflow-hidden bg-[#08111e] text-white">
            <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-amber-300 shrink-0">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-amber-300 font-bold">
                    24/7 Private Concierge
                  </p>
                  <p className="text-xs text-slate-300">
                    Speak directly with our Sri Lanka gemologist desk for date changes or VIP transfers.
                  </p>
                </div>
              </div>
              <Button
                asChild
                size="sm"
                className="rounded-xl h-9 px-4 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
              >
                <a href={conciergeWhatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-1.5 h-3.5 w-3.5" /> WhatsApp Desk
                </a>
              </Button>
            </CardContent>
          </Card>
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
                  <p className="text-muted-foreground flex items-center gap-1.5 text-[11px] break-words min-w-0">
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

