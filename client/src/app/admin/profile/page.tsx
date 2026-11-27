'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { adminProfilePasswordSchema } from '@/lib/schemas';
import type { User as AuthUser } from '@/contexts/auth-context';
import { authFetch } from '@/lib/api';
import { API_BASE_URL } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Gem, KeyRound, LoaderCircle, Mail, Phone, ShieldCheck, UserCheck } from 'lucide-react';

const ADMIN_SESSION_KEY = 'adminUser';

export default function AdminProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [adminUser, setAdminUser] = useState<AuthUser | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY) || localStorage.getItem('sapphire-user');
    if (raw) {
      try {
        const user: AuthUser = JSON.parse(raw);
        if (user && user.type === 'admin') {
          setAdminUser(user);
          return;
        }
      } catch {
        // Fallback redirect below
      }
    }
    router.push('/auth?redirect=/admin/profile');
  }, [router]);

  const form = useForm<z.infer<typeof adminProfilePasswordSchema>>({
    resolver: zodResolver(adminProfilePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmitPassword = async (data: z.infer<typeof adminProfilePasswordSchema>) => {
    if (!adminUser) return;
    setIsUpdating(true);
    try {
      const response = await authFetch(`${API_BASE_URL}/users/${adminUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: adminUser.name,
          email: adminUser.email,
          phone: adminUser.phone || '',
          type: adminUser.type,
          password: data.newPassword,
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error || 'Could not update administrator password.');
      }

      form.reset();
      toast({
        title: 'Password Updated',
        description: 'Your Concierge Studio credentials have been updated.',
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: err instanceof Error ? err.message : 'Unable to update password.',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!adminUser) {
    return (
      <div className="flex items-center justify-center min-h-[360px]">
        <LoaderCircle className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-xl shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-headline font-bold text-foreground">
              Administrator Profile &amp; Security
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Manage your Concierge Studio identity and access credentials.
            </p>
          </div>
        </div>

        <Button asChild variant="outline" size="sm" className="rounded-xl text-xs h-9 px-4 w-fit">
          <Link href="/profile">
            <UserCheck className="mr-1.5 h-3.5 w-3.5 text-primary" />
            <span>Open VIP Member Portal</span>
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Account Identity Summary (5 cols) */}
        <Card className="xl:col-span-5 border-border/80 shadow-sm rounded-2xl overflow-hidden bg-card">
          <div className="bg-[#08111e] text-white px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gem className="h-4 w-4 text-amber-300" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Studio Standing
              </span>
            </div>
            <Badge className="bg-primary text-primary-foreground text-[10px] border-none gap-1">
              <ShieldCheck className="h-3 w-3" /> Administrator
            </Badge>
          </div>
          <CardContent className="p-5 sm:p-6 space-y-4">
            <div className="border-b border-border/60 pb-3">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Full Name</p>
              <p className="text-sm font-semibold text-foreground mt-1">{adminUser.name}</p>
            </div>
            <div className="border-b border-border/60 pb-3">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Email Address</p>
              <p className="text-sm font-medium text-foreground mt-1 flex items-center gap-2 break-words">
                <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>{adminUser.email}</span>
              </p>
            </div>
            {adminUser.phone && (
              <div className="border-b border-border/60 pb-3">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Phone</p>
                <p className="text-sm font-mono font-medium text-foreground mt-1 flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>{adminUser.phone}</span>
                </p>
              </div>
            )}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-muted-foreground">Account Reference</span>
              <span className="font-mono font-semibold text-primary">ST-ADM-{adminUser.id}</span>
            </div>
          </CardContent>
        </Card>

        {/* Password Update Card (7 cols) */}
        <Card className="xl:col-span-7 border-border/80 shadow-sm rounded-2xl bg-card">
          <CardHeader className="p-5 sm:p-6 pb-3">
            <CardTitle className="text-base sm:text-lg font-headline font-bold flex items-center gap-2">
              <KeyRound className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <span>Update Administrator Password</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Maintain strong credentials to protect booking records, financial invoices, and partner ledgers.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 sm:p-6 pt-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitPassword)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Current Password</FormLabel>
                      <FormControl>
                        <Input type="password" className="h-10 rounded-xl text-xs sm:text-sm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">New Password</FormLabel>
                      <FormControl>
                        <Input type="password" className="h-10 rounded-xl text-xs sm:text-sm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Confirm New Password</FormLabel>
                      <FormControl>
                        <Input type="password" className="h-10 rounded-xl text-xs sm:text-sm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end pt-3 border-t border-border/60">
                  <Button
                    type="submit"
                    disabled={isUpdating}
                    className="rounded-xl text-xs sm:text-sm h-10 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                  >
                    {isUpdating && <LoaderCircle className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                    <span>Update Password</span>
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
