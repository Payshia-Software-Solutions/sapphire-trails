
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import type { User as AuthUser } from '@/contexts/auth-context';

const ADMIN_SESSION_KEY = 'adminUser';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Hardcoded check for super admin credentials
    if (email === 'admin@gmail.com' && password === 'admin123') {
        const superAdminUser: AuthUser = {
            id: 0, // A special ID for the hardcoded user
            name: 'Super Admin',
            email: 'admin@gmail.com',
            type: 'admin',
            created_at: new Date().toISOString(),
        };
        sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(superAdminUser));
        toast({
            title: 'Login Successful',
            description: `Welcome back, Super Admin!`,
        });
        router.push('/admin/dashboard');
        return;
    }


    try {
      const response = await fetch('http://localhost/sapphire_trails_server/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || 'Login failed. Please check your credentials.');
      }
      
      const loggedInUser: AuthUser = data.user;

      if (loggedInUser && loggedInUser.type === 'admin') {
        sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(loggedInUser));
        toast({
          title: 'Login Successful',
          description: `Welcome back, ${loggedInUser.name}!`,
        });
        router.push('/admin/dashboard');
      } else {
         throw new Error('Access Denied. Only admin users can log in here.');
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
