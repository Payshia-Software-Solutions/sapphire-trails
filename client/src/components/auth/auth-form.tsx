'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { loginSchema, signupSchema } from '@/lib/auth-schemas';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LoaderCircle,
  Gem,
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  FileText,
  Award,
  ArrowRight,
} from 'lucide-react';

function GoogleLogoIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
      />
    </svg>
  );
}

export function AuthForm() {
  const [activeTab, setActiveTab] = useState('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading, login, loginWithGoogle, signup } = useAuth();

  const redirectUrl = searchParams.get('redirect') || '/profile';

  // If already logged in, send straight to My Profile (or requested redirect)
  useEffect(() => {
    if (!authLoading && user) {
      router.replace(redirectUrl);
    }
  }, [user, authLoading, redirectUrl, router]);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', email: '', phone: '', password: '' },
  });

  const onLoginSubmit = async (data: z.infer<typeof loginSchema>) => {
    setIsSubmitting(true);
    const loggedInUser = await login(data.email, data.password);
    setIsSubmitting(false);

    if (loggedInUser) {
      router.push(redirectUrl);
    }
  };

  const onSignupSubmit = async (data: z.infer<typeof signupSchema>) => {
    setIsSubmitting(true);
    const success = await signup(data.name, data.email, data.phone, data.password);
    setIsSubmitting(false);

    if (success) {
      router.push(redirectUrl);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    const loggedInUser = await loginWithGoogle();
    setIsGoogleLoading(false);

    if (loggedInUser) {
      router.push(redirectUrl);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    loginForm.reset();
    signupForm.reset();
  };

  const busy = isSubmitting || isGoogleLoading;

  return (
    <div className="container mx-auto px-4 md:px-6">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-border/80 bg-card shadow-2xl grid grid-cols-1 lg:grid-cols-12">
        {/* Left Editorial Luxury Panel */}
        <div className="relative hidden lg:flex lg:col-span-5 flex-col justify-between overflow-hidden bg-[#08111e] p-8 xl:p-10 text-white">
          <Image
            src="/img/hero-misty-mountains.jpg"
            alt="Ratnapura gem valleys"
            fill
            sizes="(max-width: 1024px) 0vw, 42vw"
            className="object-cover opacity-35"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#08111e]/95 via-[#0B1E38]/80 to-[#08111e]/95" />

          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-200">
              <Gem className="h-3.5 w-3.5 text-amber-300" />
              <span>Sapphire Trails Concierge</span>
            </div>

            <div className="space-y-3">
              <h1 className="font-brand text-3xl xl:text-4xl font-semibold leading-tight tracking-wide text-white">
                Your Private Gateway to Ceylon&apos;s Gem Capital
              </h1>
              <p className="text-sm leading-relaxed text-slate-300/90">
                Sign in to access your expedition vouchers, track live itinerary updates, download official invoices, or manage your Referral Agent earnings.
              </p>
            </div>
          </div>

          <div className="relative z-10 space-y-3.5 pt-8 border-t border-white/10">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 border border-white/10 text-amber-300">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Expedition Passport &amp; Vouchers</p>
                <p className="text-[11px] text-slate-400">Real-time reservation status &amp; private pickup coordination.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 border border-white/10 text-amber-300">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Digital Invoices &amp; Rescheduling</p>
                <p className="text-[11px] text-slate-400">View statements, payment records, and request date changes anytime.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 border border-white/10 text-amber-300">
                <Award className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Referral Agent Program</p>
                <p className="text-[11px] text-slate-400">Apply for partner approval and earn commissions on referrals.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="lg:col-span-7 p-6 sm:p-10 xl:p-12 flex flex-col justify-center bg-card">
          {/* Mobile Brand Header */}
          <div className="lg:hidden mb-6 text-center space-y-1.5">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              <Gem className="h-3 w-3" />
              <span>Sapphire Trails</span>
            </div>
            <h1 className="font-brand text-2xl font-bold text-foreground">VIP Guest Portal</h1>
          </div>

          <Tabs defaultValue="login" value={activeTab} className="w-full" onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-muted/80 p-1.5 h-auto mb-6 border border-border/60">
              <TabsTrigger
                value="login"
                className="rounded-xl py-2.5 text-xs sm:text-sm font-semibold data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-xs transition-all"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="rounded-xl py-2.5 text-xs sm:text-sm font-semibold data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-xs transition-all"
              >
                Create Account
              </TabsTrigger>
            </TabsList>

            {/* Google Sign-In Button (shared across both tabs) */}
            <div className="space-y-4 mb-5">
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={handleGoogleSignIn}
                className="w-full h-11 rounded-xl border-border/90 bg-background hover:bg-muted/60 font-medium text-sm gap-2.5 shadow-xs transition-all"
              >
                {isGoogleLoading ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <GoogleLogoIcon />
                )}
                <span>Continue with Google</span>
              </Button>

              <div className="relative flex items-center">
                <div className="flex-grow border-t border-border/70" />
                <span className="mx-3 shrink text-[11px] uppercase tracking-widest text-muted-foreground font-medium">
                  or with email
                </span>
                <div className="flex-grow border-t border-border/70" />
              </div>
            </div>

            <TabsContent value="login" className="mt-0 space-y-5">
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">Welcome Back</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Sign in with your email to open your My Profile portal.
                </p>
              </div>

              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Email Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="you@example.com"
                              className="h-11 rounded-xl pl-10 text-sm"
                              autoComplete="email"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type={showLoginPassword ? 'text' : 'password'}
                              placeholder="Enter your password"
                              className="h-11 rounded-xl pl-10 pr-10 text-sm"
                              autoComplete="current-password"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowLoginPassword(!showLoginPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                              aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                            >
                              {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow-sm mt-2"
                    disabled={busy}
                  >
                    {isSubmitting ? (
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowRight className="mr-2 h-4 w-4" />
                    )}
                    Sign In to My Profile
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="signup" className="mt-0 space-y-5">
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">Create Your Account</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Join Sapphire Trails to book private tours and access your guest portal.
                </p>
              </div>

              <Form {...signupForm}>
                <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <FormField
                      control={signupForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold">Full Name</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Your full name"
                                className="h-11 rounded-xl pl-10 text-sm"
                                autoComplete="name"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signupForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold">Phone (Optional)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="tel"
                                placeholder="+94 77 123 4567"
                                className="h-11 rounded-xl pl-10 text-sm"
                                autoComplete="tel"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={signupForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Email Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="you@example.com"
                              className="h-11 rounded-xl pl-10 text-sm"
                              autoComplete="email"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={signupForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type={showSignupPassword ? 'text' : 'password'}
                              placeholder="Minimum 6 characters"
                              className="h-11 rounded-xl pl-10 pr-10 text-sm"
                              autoComplete="new-password"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowSignupPassword(!showSignupPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                              aria-label={showSignupPassword ? 'Hide password' : 'Show password'}
                            >
                              {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow-sm mt-2"
                    disabled={busy}
                  >
                    {isSubmitting ? (
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowRight className="mr-2 h-4 w-4" />
                    )}
                    Create Account &amp; Continue
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 pt-5 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              Encrypted JWT Session &amp; Verified Guest Access
            </span>
            <Link href="/contact" className="hover:text-primary transition-colors underline underline-offset-2">
              Need concierge help?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
