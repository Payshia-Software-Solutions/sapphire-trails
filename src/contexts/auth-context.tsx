
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

// Mock user data and types
interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

// A mock user database
const initialMockUsers: User[] = [
  { id: 'ecb0641c-9b8b-49e8-81b7-d264fac96cf3', name: 'Test User', email: 'user@test.com', phone: '123-456-7890' },
];
const MOCK_PASSWORD = 'password123';
const USER_SESSION_KEY = 'sapphire-user';
const ALL_USERS_KEY = 'sapphire-all-users';


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
      
      const allUsers = localStorage.getItem(ALL_USERS_KEY);
      if (!allUsers) {
        localStorage.setItem(ALL_USERS_KEY, JSON.stringify(initialMockUsers));
      }
    } catch (error) {
      console.error('Failed to initialize user data', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const allUsersRaw = localStorage.getItem(ALL_USERS_KEY);
    const allUsers: User[] = allUsersRaw ? JSON.parse(allUsersRaw) : [];
    const foundUser = allUsers.find(u => u.email === email);

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
      
      const allUsersRaw = localStorage.getItem(ALL_USERS_KEY);
      const allUsers: User[] = allUsersRaw ? JSON.parse(allUsersRaw) : [];
      allUsers.push(newUser);
      localStorage.setItem(ALL_USERS_KEY, JSON.stringify(allUsers));

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
