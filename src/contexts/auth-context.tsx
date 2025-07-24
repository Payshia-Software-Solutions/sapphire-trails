
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

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
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type ServerStatus = 'connecting' | 'connected' | 'error';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  serverStatus: ServerStatus;
  login: (email: string, pass: string) => Promise<User | null>;
  signup: (name: string, email: string, phone: string | undefined, pass: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [serverStatus, setServerStatus] = useState<ServerStatus>('connecting');
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    // Check server health on initial load
    const checkServerHealth = async () => {
      if (!API_BASE_URL) {
        console.error("API_BASE_URL is not defined. Please check your environment variables.");
        setServerStatus('error');
        return;
      }
      try {
        // We assume the root of the API should return something, even an error, but not a network failure.
        // A simple GET request to a known endpoint (like users) is a good test.
        const response = await fetch(`${API_BASE_URL}/users`, { method: 'GET' });
        if (response.ok || response.status < 500) { // If it's a client error (4xx) or success (2xx), server is up.
          setServerStatus('connected');
        } else {
          throw new Error(`Server responded with status: ${response.status}`);
        }
      } catch (error) {
        console.error('Server health check failed:', error);
        setServerStatus('error');
      }
    };
    checkServerHealth();
  }, []);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(USER_SESSION_KEY);
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

  const login = async (email: string, pass: string): Promise<User | null> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
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
      if (!loggedInUser) {
        throw new Error('Login successful, but no user data was returned from the server.');
      }

      setUser(loggedInUser);
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(loggedInUser));
      localStorage.setItem('adminUser', JSON.stringify(loggedInUser)); // Also set admin key for admin panel access
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

      const newUser: User = data;
      if (!newUser) {
          throw new Error('Sign-up successful, but no user data was returned from the server.');
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

  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_SESSION_KEY);
    localStorage.removeItem('adminUser');
    toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
    if (pathname.startsWith('/profile') || pathname.startsWith('/booking') || pathname.startsWith('/admin')) {
         router.push('/');
    }
  };

  const value = { user, isLoading, serverStatus, login, signup, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
