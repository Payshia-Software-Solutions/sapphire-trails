'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { adminCreationSchema, type AdminUser } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';

const ADMIN_USERS_KEY = 'sapphire-admins';

export default function CreateAdminPage() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof adminCreationSchema>>({
    resolver: zodResolver(adminCreationSchema),
    defaultValues: {
      username: '',
      password: '',
      role: 'admin',
    },
  });

  const onSubmit = (data: z.infer<typeof adminCreationSchema>) => {
    try {
      const storedAdminsRaw = localStorage.getItem(ADMIN_USERS_KEY);
      const storedAdmins: AdminUser[] = storedAdminsRaw ? JSON.parse(storedAdminsRaw) : [];

      const userExists = storedAdmins.some(admin => admin.username === data.username);
      if (userExists) {
        form.setError('username', { type: 'manual', message: 'This username already exists.' });
        return;
      }

      const newAdmin: AdminUser = {
        username: data.username,
        password: data.password,
        role: data.role,
      };

      const updatedAdmins = [...storedAdmins, newAdmin];
      localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(updatedAdmins));

      toast({
        title: 'Admin Created',
        description: `Admin user "${data.username}" has been successfully created.`,
      });
      router.push('/admin/user-management');
    } catch (error) {
      console.error('Failed to create admin:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred while creating the admin.',
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-primary">Create New Admin</h1>
          <p className="text-muted-foreground">Add a new administrator with specific privileges.</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Admin Details</CardTitle>
          <CardDescription>
            Fill in the details below to create a new admin account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., john.doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Admin Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Admin (Handles booking requests only)</SelectItem>
                        <SelectItem value="superadmin">Super Admin (Full access)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end pt-4">
                <Button type="submit">Create Admin</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
