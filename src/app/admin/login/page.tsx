'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin123') {
      sessionStorage.setItem('isAdminAuthenticated', 'true');
      router.push('/admin/booking-requests');
    } else {
      setError('Invalid username or password');
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
            className="mb-4"
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
