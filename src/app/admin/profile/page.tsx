
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { adminProfilePasswordSchema } from '@/lib/schemas';
import type { User as AuthUser } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';

const USER_SESSION_KEY = 'sapphire-user';

export default function AdminProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [adminUser, setAdminUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const userSessionRaw = sessionStorage.getItem(USER_SESSION_KEY);
    if (userSessionRaw) {
      const user: AuthUser = JSON.parse(userSessionRaw);
      if (user && user.type === 'admin') {
        setAdminUser(user);
      } else {
         router.push('/admin/login');
      }
    } else {
      router.push('/admin/login');
    }
  }, [router]);

  const form = useForm<z.infer<typeof adminProfilePasswordSchema>>({
    resolver: zodResolver(adminProfilePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmitPassword = (data: z.infer<typeof adminProfilePasswordSchema>) => {
    if (!adminUser) return;
    toast({
        variant: 'destructive',
        title: 'Not Implemented',
        description: 'Password change functionality needs to be connected to the server.',
    });
    // This would be a server call, e.g.
    // fetch(`/api/users/${adminUser.id}`, { method: 'PUT', body: ... })
  };

  if (!adminUser) {
    return <div className="flex items-center justify-center h-full"><p>Loading...</p></div>;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-primary">My Profile</h1>
          <p className="text-muted-foreground">Manage your account settings.</p>
        </div>
      </div>
      
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              Your personal details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="space-y-1">
                  <Label>Name</Label>
                  <p className="text-sm font-medium">{adminUser.name}</p>
              </div>
              <div className="space-y-1">
                  <Label>Email</Label>
                  <p className="text-sm font-medium">{adminUser.email}</p>
              </div>
               {adminUser.phone && (
                <div className="space-y-1">
                  <Label>Phone</Label>
                  <p className="text-sm font-medium">{adminUser.phone}</p>
                </div>
              )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Update your password here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitPassword)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
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
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
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
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end pt-2">
                  <Button type="submit">Update Password</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
