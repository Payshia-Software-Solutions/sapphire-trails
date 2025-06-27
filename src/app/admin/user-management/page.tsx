
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertTriangle, Plus, ShieldCheck, UserCog } from 'lucide-react';
import type { AdminUser } from '@/lib/schemas';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

const ALL_USERS_KEY = 'sapphire-all-users';
const ADMIN_USERS_KEY = 'sapphire-admins';

export default function UserManagementPage() {
  const [clientUsers, setClientUsers] = useState<User[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);

  useEffect(() => {
    // Load client users
    try {
      const storedUsersRaw = localStorage.getItem(ALL_USERS_KEY);
      if (storedUsersRaw) {
        const storedUsers = JSON.parse(storedUsersRaw);
        if (Array.isArray(storedUsers)) {
          setClientUsers(storedUsers);
        }
      }
    } catch (error) {
      console.error('Failed to load client users from localStorage', error);
    }
    
    // Load admin users
    try {
        const storedAdminsRaw = localStorage.getItem(ADMIN_USERS_KEY);
        if (storedAdminsRaw) {
            const storedAdmins = JSON.parse(storedAdminsRaw);
            if (Array.isArray(storedAdmins)) {
                setAdminUsers(storedAdmins);
            }
        }
    } catch (error) {
        console.error('Failed to load admin users from localStorage', error);
    }
  }, []);

  return (
    <div className="flex flex-col gap-8 h-full">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-primary">User Management</h1>
            <p className="text-muted-foreground">View client accounts and manage administrator roles.</p>
        </div>
      </div>
      
      {/* Admin Users Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Admin Accounts</CardTitle>
            <CardDescription>
              Manage users with access to this admin dashboard.
            </CardDescription>
          </div>
          <Button asChild>
            <Link href="/admin/user-management/create-admin">
              <Plus className="mr-2 h-4 w-4" />
              Create Admin
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {adminUsers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adminUsers.map((user) => (
                  <TableRow key={user.username}>
                    <TableCell className="font-medium break-words">{user.username}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'superadmin' ? 'default' : 'secondary'} className="capitalize">
                         {user.role === 'superadmin' && <ShieldCheck className="mr-1 h-3.5 w-3.5" />}
                         {user.role === 'admin' && <UserCog className="mr-1 h-3.5 w-3.5" />}
                        {user.role}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
             <div className="text-center text-muted-foreground py-16 flex flex-col items-center gap-4">
              <AlertTriangle className="h-12 w-12 text-muted-foreground/50" />
              <p>No admin users found. A default superadmin is created on first login.</p>
            </div>
          )}
        </CardContent>
      </Card>


      {/* Client Users Card */}
      <Card>
        <CardHeader>
          <CardTitle>Registered Client Users</CardTitle>
          <CardDescription>
            This is a list of all users who have signed up through the client-facing website.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {clientUsers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden sm:table-cell">User ID</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email Address</TableHead>
                  <TableHead>Phone Number</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="hidden sm:table-cell font-mono text-xs">{user.id}</TableCell>
                    <TableCell className="font-medium break-words">{user.name}</TableCell>
                    <TableCell className="break-all">{user.email}</TableCell>
                    <TableCell className="break-all">{user.phone || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center text-muted-foreground py-16 flex flex-col items-center gap-4">
              <AlertTriangle className="h-12 w-12 text-muted-foreground/50" />
              <p>No client users have signed up yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
