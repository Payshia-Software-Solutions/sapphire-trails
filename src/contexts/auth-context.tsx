
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

// User data type
interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

const USER_SESSION_KEY = 'sapphire-user';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  signup: (name: string, email: string, phone: string | undefined, pass: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem(USER_SESSION_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to parse user session data', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost/sapphire_trails_server/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email: email, password: pass }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed. Please check your credentials.');
      }
      
      const loggedInUser: User = data.user;
      setUser(loggedInUser);
      sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(loggedInUser));
      toast({ title: 'Success!', description: 'You have logged in successfully.' });
      return true;

    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred during login.';
      toast({ variant: 'destructive', title: 'Error', description: errorMessage });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, phone: string | undefined, pass: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const userId = crypto.randomUUID();
      const response = await fetch('http://localhost/sapphire_trails_server/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          id: userId,
          name: name,
          email: email,
          password: pass,
          phone: phone || '',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || `Sign-up failed. Please try again.`;
        throw new Error(errorMessage);
      }

      const newUser: User = { id: userId, name, email, phone };
      
      setUser(newUser);
      sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(newUser));
      toast({ title: 'Welcome!', description: 'Your account has been created successfully.' });
      return true;

    } catch (error) {
      console.error('Signup failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred during sign-up.';
      toast({ variant: 'destructive', title: 'Error', description: errorMessage });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem(USER_SESSION_KEY);
    toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
    if (pathname.startsWith('/profile') || pathname.startsWith('/booking')) {
         router.push('/');
    }
  };

  const value = { user, isLoading, login, signup, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
