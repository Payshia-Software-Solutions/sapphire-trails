
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
import { Plus, LoaderCircle, User, Trash2 } from 'lucide-react';
import type { User as AuthUser } from '@/contexts/auth-context';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function UserManagementPage() {
  const [adminUsers, setAdminUsers] = useState<AuthUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchAdminUsers() {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost/sapphire_trails_server/users/type/admin/');
            if (!response.ok) {
                throw new Error('Failed to fetch admin users from the server.');
            }
            const data = await response.json();
            if (Array.isArray(data)) {
                setAdminUsers(data);
            }
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not load admin users. Please ensure the server is running.',
            });
        } finally {
            setIsLoading(false);
        }
    }
    fetchAdminUsers();
  }, [toast]);
  
  const handleDelete = async (userId: number, userName: string) => {
    try {
        const response = await fetch(`http://localhost/sapphire_trails_server/users/${userId}/`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Failed to delete user.');
        }
        setAdminUsers(prev => prev.filter(user => user.id !== userId));
        toast({
            title: 'User Deleted',
            description: `Admin user "${userName}" has been successfully deleted.`,
        });
    } catch(error) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not delete the user. Please try again.',
        });
    }
  }


  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-primary">Admin User Management</h1>
            <p className="text-muted-foreground">View, create, or delete users with access to this admin dashboard.</p>
        </div>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Admin Accounts</CardTitle>
            <CardDescription>
              This list is fetched from your server.
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
          {isLoading ? (
            <div className="text-center text-muted-foreground py-16 flex flex-col items-center gap-4">
              <LoaderCircle className="h-12 w-12 text-muted-foreground/50 animate-spin" />
              <p>Loading admin users from server...</p>
            </div>
          ) : adminUsers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead className="hidden md:table-cell">Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adminUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium break-words">{user.name}</TableCell>
                    <TableCell className="hidden sm:table-cell break-all">{user.email}</TableCell>
                    <TableCell className="hidden md:table-cell">{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                       <AlertDialog>
                            <AlertDialogTrigger asChild>
                               <Button variant="destructive" size="icon">
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete {user.name}</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription className="break-words">
                                  This action cannot be undone. This will permanently delete the admin account for <span className="font-semibold text-foreground">&quot;{user.name}&quot;</span>.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(user.id, user.name)}>
                                  Yes, delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
             <div className="text-center text-muted-foreground py-16 flex flex-col items-center gap-4">
              <User className="h-12 w-12 text-muted-foreground/50" />
              <p>No admin users found on the server.</p>
               <Button asChild variant="link" className="text-primary">
                <Link href="/admin/user-management/create-admin">Create the first admin</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
