'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import type { AdminUser } from '@/lib/schemas';
import { useToast } from '@/hooks/use-toast';

const ADMIN_USERS_KEY = 'sapphire-admins';
const ADMIN_SESSION_KEY = 'adminUser';

const defaultSuperAdmin: AdminUser = {
  username: 'admin',
  password: 'admin123',
  role: 'superadmin'
};

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Seed the first super admin if no admins exist
    try {
      const storedAdmins = localStorage.getItem(ADMIN_USERS_KEY);
      if (!storedAdmins) {
        localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify([defaultSuperAdmin]));
      }
    } catch (error) {
        console.error("Failed to seed admin user", error);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const storedAdminsRaw = localStorage.getItem(ADMIN_USERS_KEY);
        const storedAdmins: AdminUser[] = storedAdminsRaw ? JSON.parse(storedAdminsRaw) : [];
        
        const foundAdmin = storedAdmins.find(admin => admin.username === username && admin.password === password);

        if (foundAdmin) {
            sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(foundAdmin));
            toast({
                title: "Login Successful",
                description: `Welcome back, ${foundAdmin.username}!`,
            });
            router.push('/admin/dashboard');
        } else {
            setError('Invalid username or password');
        }
    } catch (error) {
        console.error("Login failed", error);
        setError('An unexpected error occurred. Please try again.');
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
