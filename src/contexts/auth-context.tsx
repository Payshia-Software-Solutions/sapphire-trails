
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

// Mock user data and types
interface User {
  id: string;
  name: string;
  email: string;
}

// A mock user database
const mockUsers: User[] = [
  { id: '1', name: 'Test User', email: 'user@test.com' },
];
const MOCK_PASSWORD = 'password123';
const USER_SESSION_KEY = 'sapphire-user';


interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  signup: (name: string, email: string, pass: string) => Promise<boolean>;
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
      console.error('Failed to parse user from sessionStorage', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    const foundUser = mockUsers.find(u => u.email === email);

    if (foundUser && pass === MOCK_PASSWORD) {
      setUser(foundUser);
      sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(foundUser));
      setIsLoading(false);
      toast({ title: 'Success!', description: 'You have logged in successfully.' });
      return true;
    }

    setIsLoading(false);
    toast({ variant: 'destructive', title: 'Error', description: 'Invalid email or password.' });
    return false;
  };

  const signup = async (name: string, email: string, pass: string): Promise<boolean> => {
     setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (mockUsers.find(u => u.email === email)) {
      setIsLoading(false);
      toast({ variant: 'destructive', title: 'Error', description: 'An account with this email already exists.' });
      return false;
    }

    const newUser: User = { id: String(mockUsers.length + 1), name, email };
    mockUsers.push(newUser);
    
    setUser(newUser);
    sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(newUser));
    setIsLoading(false);
    toast({ title: 'Welcome!', description: 'Your account has been created successfully.' });
    return true;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem(USER_SESSION_KEY);
    toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
    // Redirect to home page unless on a non-auth-required page
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
