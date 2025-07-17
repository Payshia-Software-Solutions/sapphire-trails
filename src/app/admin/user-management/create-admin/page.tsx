'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { adminCreationSchema } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ArrowLeft } from 'lucide-react';

export default function CreateAdminPage() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof adminCreationSchema>>({
    resolver: zodResolver(adminCreationSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof adminCreationSchema>) => {
    try {
      const response = await fetch('http://localhost/sapphire_trails_server/users/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          type: 'admin', // Explicitly create user as 'admin' type
        }),
      });

      const responseData = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMessage = responseData?.error || 'An unexpected error occurred.';
        
        if (response.status === 409) { // Conflict for existing email
             form.setError('email', { type: 'manual', message: 'This email already exists.' });
        } else {
             toast({
                variant: 'destructive',
                title: 'Creation Failed',
                description: errorMessage,
            });
        }
        return;
      }

      toast({
        title: 'Admin Created',
        description: `Admin user "${data.name}" has been successfully created.`,
      });
      router.push('/admin/user-management');

    } catch (error) {
      console.error('Failed to create admin:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not connect to the server. Please try again later.',
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-primary">Create New Admin</h1>
          <p className="text-muted-foreground">Add a new administrator to the system.</p>
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Jane Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="e.g., jane.doe@example.com" {...field} />
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
