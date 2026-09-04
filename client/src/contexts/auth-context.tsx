'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/utils';
import { setAuthToken, removeAuthToken, getAuthToken } from '@/lib/api';

// Unified user data type
export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  type: 'client' | 'admin';
  created_at: string;
}

const USER_SESSION_KEY = 'sapphire-user';
const ADMIN_SESSION_KEY = 'adminUser';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<User | null>;
  signup: (name: string, email: string, phone: string | undefined, pass: string) => Promise<boolean>;
  updateUser: (updatedUser: Partial<User>) => void;
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
      const storedUser = localStorage.getItem(USER_SESSION_KEY);
      const token = getAuthToken();
      if (storedUser && token) {
        setUser(JSON.parse(storedUser));
      } else if (!token && storedUser) {
        // Stale session without token
        localStorage.removeItem(USER_SESSION_KEY);
        localStorage.removeItem(ADMIN_SESSION_KEY);
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to parse user session data', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string): Promise<User | null> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email: email, password: pass }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || 'Login failed. Please check your credentials.');
      }
      
      const loggedInUser: User = data.user;
      const token: string = data.token;

      if (!loggedInUser || !token) {
        throw new Error('Login successful, but incomplete authentication data was returned.');
      }

      // Store token and user state
      setAuthToken(token);
      setUser(loggedInUser);
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(loggedInUser));
      if (loggedInUser.type === 'admin') {
        localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(loggedInUser));
      }

      toast({ title: 'Success!', description: 'You have logged in successfully.' });
      return loggedInUser;

    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred during login.';
      toast({ variant: 'destructive', title: 'Error', description: errorMessage });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, phone: string | undefined, pass: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          email: email,
          password: pass,
          phone: phone || '',
          type: 'client', // Public signups are always clients
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMessage = data?.error || `Sign-up failed. Please try again.`;
        throw new Error(errorMessage);
      }

      const newUser: User = data.user || data;
      const token: string = data.token;

      if (!newUser) {
        throw new Error('Sign-up successful, but no user data was returned from the server.');
      }
      
      if (token) {
        setAuthToken(token);
      }
      setUser(newUser);
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(newUser));
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

  const updateUser = (updatedFields: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(updated));
      if (updated.type === 'admin') {
        localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(updated));
      }
      return updated;
    });
  };

  const logout = () => {
    setUser(null);
    removeAuthToken();
    localStorage.removeItem(USER_SESSION_KEY);
    localStorage.removeItem(ADMIN_SESSION_KEY);
    toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
    if (pathname.startsWith('/profile') || pathname.startsWith('/booking') || pathname.startsWith('/admin')) {
      router.push('/auth');
    }
  };

  const value = { user, isLoading, login, signup, updateUser, logout };


  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
