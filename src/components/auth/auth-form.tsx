
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, type User } from '@/contexts/auth-context';
import { loginSchema, signupSchema } from '@/lib/auth-schemas';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoaderCircle, ShieldCheck } from 'lucide-react';

export function AuthForm() {
  const [activeTab, setActiveTab] = useState('login');
  const [isLoading, setIsLoading] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, signup } = useAuth();
  
  const redirectUrl = searchParams.get('redirect') || '/profile';

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', email: '', phone: '', password: '' },
  });

  const onLoginSubmit = async (data: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    setLoggedInUser(null);
    const user = await login(data.email, data.password);
    setIsLoading(false);
    
    if (user) {
      if (user.type === 'admin') {
        setLoggedInUser(user);
      } else {
        router.push(redirectUrl);
      }
    }
  };

  const onSignupSubmit = async (data: z.infer<typeof signupSchema>) => {
    setIsLoading(true);
    const success = await signup(data.name, data.email, data.phone, data.password);
    setIsLoading(false);
    if (success) {
      router.push(redirectUrl);
    }
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setLoggedInUser(null); // Clear logged-in state when switching tabs
    loginForm.reset();
    signupForm.reset();
  }

  return (
    <div className="container mx-auto px-4 md:px-6">
      <div className="mx-auto max-w-md">
        <Tabs defaultValue="login" value={activeTab} className="w-full" onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>{loggedInUser ? `Welcome, ${loggedInUser.name}` : 'Welcome Back'}</CardTitle>
                <CardDescription>{loggedInUser ? 'You have successfully signed in.' : 'Enter your credentials to access your account.'}</CardDescription>
              </CardHeader>
              <CardContent>
                {loggedInUser ? (
                  <div className="space-y-4">
                    <Button onClick={() => router.push('/admin/dashboard')} className="w-full" size="lg">
                        <ShieldCheck className="mr-2 h-5 w-5" />
                        Go to Admin Panel
                    </Button>
                    <Button onClick={() => setLoggedInUser(null)} variant="outline" className="w-full">
                        Sign in as another user
                    </Button>
                  </div>
                ) : (
                    <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                        <FormField control={loginForm.control} name="email" render={({ field }) => ( <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="you@example.com" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={loginForm.control} name="password" render={({ field }) => ( <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                        Login
                        </Button>
                    </form>
                    </Form>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Create an Account</CardTitle>
                <CardDescription>It&apos;s quick and easy to get started.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...signupForm}>
                  <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                    <FormField control={signupForm.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Your Name" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={signupForm.control} name="email" render={({ field }) => ( <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="you@example.com" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={signupForm.control} name="phone" render={({ field }) => ( <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" placeholder="Your Phone Number" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={signupForm.control} name="password" render={({ field }) => ( <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem> )} />
                     <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                      Create Account
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
