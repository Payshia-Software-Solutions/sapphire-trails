
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import type { AdminUser } from '@/lib/schemas';

const ADMIN_SESSION_KEY = 'adminUser';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Hardcoded superadmin login for development/testing
    if (username === 'admin' && password === 'admin123') {
      const superAdminUser: AdminUser = {
        id: 0,
        username: 'admin',
        role: 'superadmin',
        created_at: new Date().toISOString(),
      };
      sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(superAdminUser));
      toast({
        title: 'Login Successful',
        description: `Logged in as Super Admin.`,
      });
      router.push('/admin/dashboard');
      return;
    }

    // Default server-side login for all other users
    try {
      const response = await fetch('http://localhost/sapphire_trails_server/admin/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed. Please check your credentials.');
      }

      if (data.admin) {
        sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(data.admin));
        toast({
          title: 'Login Successful',
          description: `Welcome back, ${data.admin.username}!`,
        });
        router.push('/admin/dashboard');
      } else {
         throw new Error('Login successful, but no admin data was returned.');
      }

    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
      setError(errorMessage);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background-alt">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <Image
            src="/img/logo4.png"
            alt="Sapphire Trails Logo"
            width={120}
            height={80}
            className="mb-4 [filter:drop-shadow(0_2px_3px_rgba(0,0,0,0.2))]"
          />
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>Enter your credentials to access the dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="admin"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
