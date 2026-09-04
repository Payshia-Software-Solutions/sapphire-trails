'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Plus, 
  LoaderCircle, 
  User as UserIcon, 
  Trash2, 
  Shield, 
  UserCircle, 
  Pencil, 
  Search, 
  RefreshCw, 
  Users, 
  ShieldCheck, 
  UserCheck, 
  Sparkles, 
  MoreHorizontal, 
  Copy, 
  Mail, 
  Phone, 
  Eye, 
  EyeOff, 
  KeyRound,
  ArrowUpDown,
  Filter
} from 'lucide-react';
import type { User as AuthUser } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/utils';
import { authFetch } from '@/lib/api';

export default function UserManagementPage() {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'client'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name-asc' | 'name-desc'>('newest');

  // Create User Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'admin' as 'admin' | 'client',
    password: '',
  });
  const [showCreatePassword, setShowCreatePassword] = useState(false);

  // Edit User Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState<AuthUser | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'admin' as 'admin' | 'client',
    password: '',
  });
  const [showEditPassword, setShowEditPassword] = useState(false);

  // Delete Dialog State
  const [userToDelete, setUserToDelete] = useState<AuthUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch Users
  const fetchUsers = async (showRefreshToast = false) => {
    setIsRefreshing(true);
    try {
      const response = await authFetch(`${API_BASE_URL}/users`);
      if (!response.ok) {
        throw new Error('Failed to fetch users from the server.');
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setUsers(data);
        if (showRefreshToast) {
          toast({ title: 'User List Refreshed', description: `Loaded ${data.length} user accounts.` });
        }
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error Loading Users',
        description: 'Could not connect to the user database. Please verify the backend server is online.',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtered & Sorted Users
  const filteredUsers = useMemo(() => {
    return users
      .filter((u) => {
        const matchesSearch =
          searchQuery === '' ||
          u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (u.phone && u.phone.includes(searchQuery));
        const matchesRole = roleFilter === 'all' || u.type === roleFilter;
        return matchesSearch && matchesRole;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
        return 0;
      });
  }, [users, searchQuery, roleFilter, sortBy]);

  // KPI Metrics Calculation
  const totalUsersCount = users.length;
  const adminCount = users.filter((u) => u.type === 'admin').length;
  const clientCount = users.filter((u) => u.type === 'client').length;
  const latestUser = users.length > 0
    ? [...users].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
    : null;

  // Generate strong random password
  const generateStrongPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*';
    let pass = '';
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

  // Handle Create User
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim() || !createForm.email.trim() || !createForm.password) {
      toast({ variant: 'destructive', title: 'Required Fields Missing', description: 'Please provide full name, email, and password.' });
      return;
    }

    setIsCreating(true);
    try {
      const response = await authFetch(`${API_BASE_URL}/users/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(createForm),
      });

      const responseData = await response.json().catch(() => null);

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error('A user with this email address already exists.');
        }
        throw new Error(responseData?.error || 'Failed to create user account.');
      }

      toast({
        title: 'Account Created Successfully!',
        description: `New ${createForm.type} user "${createForm.name}" has been registered.`,
      });

      setIsCreateOpen(false);
      setCreateForm({ name: '', email: '', phone: '', type: 'admin', password: '' });
      fetchUsers();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Creation Failed',
        description: err.message || 'Something went wrong.',
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (user: AuthUser) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      type: user.type,
      password: '',
    });
    setShowEditPassword(false);
    setIsEditOpen(true);
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsEditing(true);
    try {
      const payload: any = {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        type: editForm.type,
      };
      if (editForm.password.trim()) {
        payload.password = editForm.password;
      }

      const response = await authFetch(`${API_BASE_URL}/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(responseData?.error || 'Failed to update user.');
      }

      toast({
        title: 'User Updated',
        description: `Account for "${editForm.name}" updated successfully.`,
      });

      setIsEditOpen(false);
      fetchUsers();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: err.message || 'Something went wrong.',
      });
    } finally {
      setIsEditing(false);
    }
  };

  // Quick Role Toggle (1-click)
  const handleQuickRoleToggle = async (user: AuthUser) => {
    const newRole = user.type === 'admin' ? 'client' : 'admin';
    try {
      const response = await authFetch(`${API_BASE_URL}/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          type: newRole,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update role.');
      }

      toast({
        title: 'Role Changed',
        description: `${user.name} is now a ${newRole}.`,
      });
      fetchUsers();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message || 'Could not change role.',
      });
    }
  };

  // Handle Delete User
  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      const response = await authFetch(`${API_BASE_URL}/users/${userToDelete.id}/`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete user.');
      }
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      toast({
        title: 'User Deleted',
        description: `User "${userToDelete.name}" has been permanently removed.`,
      });
      setUserToDelete(null);
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Delete Failed',
        description: err.message || 'Could not delete the user.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Get Initials for Avatar
  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full pb-12">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Role &amp; Access Control</span>
          </div>
          <h1 className="text-3xl font-headline font-bold tracking-tight text-foreground">
            User Management Studio
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage system administrators, expedition staff, and registered client accounts in real time.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchUsers(true)}
            disabled={isRefreshing}
            className="rounded-xl h-10 px-3.5 gap-2 border-border"
          >
            <RefreshCw className={`h-4 w-4 text-muted-foreground ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline text-xs font-medium">Refresh</span>
          </Button>

          <Button
            onClick={() => setIsCreateOpen(true)}
            className="rounded-xl h-10 px-4 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md"
          >
            <Plus className="h-4 w-4" />
            <span>Create New User</span>
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Users */}
        <Card className="border-border/80 shadow-xs bg-card/60 backdrop-blur-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Total Accounts</p>
              <p className="text-2xl font-bold text-foreground font-headline">{totalUsersCount}</p>
              <p className="text-[11px] text-muted-foreground">Registered in database</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Users className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Admins */}
        <Card className="border-border/80 shadow-xs bg-card/60 backdrop-blur-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">System Admins</p>
              <p className="text-2xl font-bold text-primary font-headline">{adminCount}</p>
              <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                ● Full CMS &amp; Data Access
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Shield className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Clients */}
        <Card className="border-border/80 shadow-xs bg-card/60 backdrop-blur-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Expedition Clients</p>
              <p className="text-2xl font-bold text-foreground font-headline">{clientCount}</p>
              <p className="text-[11px] text-muted-foreground">Guest booking members</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
              <UserCheck className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Latest User */}
        <Card className="border-border/80 shadow-xs bg-card/60 backdrop-blur-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1 min-w-0 flex-1 pr-2">
              <p className="text-xs font-medium text-muted-foreground">Latest Member</p>
              <p className="text-sm font-bold text-foreground truncate">{latestUser?.name || 'None'}</p>
              <p className="text-[11px] text-muted-foreground">
                {latestUser ? new Date(latestUser.created_at).toLocaleDateString() : '—'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
              <Sparkles className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Main Table Card with Search & Filters */}
      <Card className="border-border/80 shadow-sm overflow-hidden">
        <CardHeader className="p-5 pb-4 border-b border-border/60 bg-muted/20">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span>All User Directory ({filteredUsers.length})</span>
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Filter by role or search instantly by name, email, or telephone number.
              </CardDescription>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-2.5">
              
              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search users, emails, phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 text-xs h-9 rounded-xl bg-background border-border/80"
                />
              </div>

              {/* Role Filter */}
              <Select value={roleFilter} onValueChange={(val: any) => setRoleFilter(val)}>
                <SelectTrigger className="w-[130px] text-xs h-9 rounded-xl bg-background border-border/80">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admins Only</SelectItem>
                  <SelectItem value="client">Clients Only</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort By */}
              <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
                <SelectTrigger className="w-[140px] text-xs h-9 rounded-xl bg-background border-border/80">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                </SelectContent>
              </Select>

            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <LoaderCircle className="h-8 w-8 text-primary animate-spin" />
              <p className="text-sm font-medium">Loading user directory from server...</p>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="w-[280px]">User Profile</TableHead>
                    <TableHead>Contact Info</TableHead>
                    <TableHead>Account Role</TableHead>
                    <TableHead className="hidden md:table-cell">Joined Date</TableHead>
                    <TableHead className="text-right pr-6">Quick Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
                      
                      {/* Name & Avatar */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className={`h-10 w-10 border ${
                            user.type === 'admin' 
                              ? 'border-primary/40 bg-primary/10 text-primary' 
                              : 'border-slate-300 dark:border-slate-700 bg-muted text-foreground'
                          }`}>
                            <AvatarFallback className="font-bold text-xs font-mono">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-0.5">
                            <p className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                              <span>{user.name}</span>
                              {user.type === 'admin' && (
                                <Shield className="h-3 w-3 text-primary shrink-0" />
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono truncate max-w-[200px]">
                              ID #{user.id}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Email & Phone */}
                      <TableCell>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-1.5 text-foreground">
                            <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
                            <a href={`mailto:${user.email}`} className="hover:text-primary hover:underline transition-colors truncate max-w-[220px]">
                              {user.email}
                            </a>
                          </div>
                          {user.phone ? (
                            <div className="flex items-center gap-1.5 text-muted-foreground font-mono">
                              <Phone className="h-3 w-3 text-muted-foreground shrink-0" />
                              <a href={`tel:${user.phone}`} className="hover:text-primary transition-colors">
                                {user.phone}
                              </a>
                            </div>
                          ) : (
                            <span className="text-[11px] text-muted-foreground/60 italic">No phone added</span>
                          )}
                        </div>
                      </TableCell>

                      {/* Role Badge */}
                      <TableCell>
                        {user.type === 'admin' ? (
                          <Badge className="bg-primary text-primary-foreground font-semibold px-2.5 py-0.5 rounded-full text-xs gap-1 border-none shadow-xs">
                            <Shield className="h-3 w-3" />
                            <span>Administrator</span>
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="font-medium px-2.5 py-0.5 rounded-full text-xs gap-1">
                            <UserCircle className="h-3 w-3" />
                            <span>Client / Guest</span>
                          </Badge>
                        )}
                      </TableCell>

                      {/* Created At */}
                      <TableCell className="hidden md:table-cell text-xs text-muted-foreground font-mono">
                        {new Date(user.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(user)}
                            className="h-8 text-xs rounded-xl px-2.5 gap-1.5 border-border hover:border-primary/40 hover:bg-primary/5"
                          >
                            <Pencil className="h-3.5 w-3.5 text-primary" />
                            <span className="hidden sm:inline">Edit</span>
                          </Button>

                          {/* Dropdown Options */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg">
                              <DropdownMenuLabel className="text-xs">User Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              
                              <DropdownMenuItem
                                onClick={() => {
                                  navigator.clipboard.writeText(user.email);
                                  toast({ title: 'Email Copied', description: user.email });
                                }}
                                className="text-xs gap-2 cursor-pointer"
                              >
                                <Copy className="h-3.5 w-3.5" />
                                <span>Copy Email</span>
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => handleQuickRoleToggle(user)}
                                className="text-xs gap-2 cursor-pointer"
                              >
                                <KeyRound className="h-3.5 w-3.5 text-amber-500" />
                                <span>
                                  Switch to {user.type === 'admin' ? 'Client' : 'Admin'}
                                </span>
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              <DropdownMenuItem
                                onClick={() => setUserToDelete(user)}
                                className="text-xs gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Delete Account</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>

                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center gap-4 text-center px-4">
              <div className="w-16 h-16 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground">
                <UserIcon className="h-8 w-8" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="font-bold text-base text-foreground">No Users Found</h3>
                <p className="text-xs text-muted-foreground">
                  {searchQuery 
                    ? `No matching users found for "${searchQuery}". Try clearing your search.`
                    : 'There are currently no users in the database.'}
                </p>
              </div>
              {searchQuery && (
                <Button variant="outline" size="sm" onClick={() => setSearchQuery('')} className="rounded-xl text-xs">
                  Clear Search
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* CREATE NEW USER DIALOG */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              <span>Create New User Account</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Add a new administrator or client account to Sapphire Trails.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Full Name *</Label>
              <Input
                placeholder="e.g., Samantha Perera"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                required
                className="text-xs h-9 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Email Address *</Label>
              <Input
                type="email"
                placeholder="e.g., samantha@sapphiretrails.lk"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                required
                className="text-xs h-9 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Phone Number (Optional)</Label>
                <Input
                  placeholder="071 234 5678"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                  className="text-xs h-9 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Account Role *</Label>
                <Select
                  value={createForm.type}
                  onValueChange={(val: any) => setCreateForm({ ...createForm, type: val })}
                >
                  <SelectTrigger className="text-xs h-9 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="client">Expedition Client</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Initial Password *</Label>
                <button
                  type="button"
                  onClick={() => {
                    const pass = generateStrongPassword();
                    setCreateForm({ ...createForm, password: pass });
                    setShowCreatePassword(true);
                  }}
                  className="text-[11px] text-primary hover:underline font-medium"
                >
                  Generate Strong
                </button>
              </div>
              <div className="relative">
                <Input
                  type={showCreatePassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  required
                  className="text-xs h-9 rounded-xl pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCreatePassword(!showCreatePassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCreatePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <DialogFooter className="pt-3 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-xl text-xs h-9"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating}
                className="rounded-xl text-xs h-9 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                {isCreating && <LoaderCircle className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                <span>Create Account</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT USER DIALOG */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Pencil className="h-5 w-5 text-primary" />
              <span>Edit User Account</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Update information or change role for {editingUser?.name}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Full Name *</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                required
                className="text-xs h-9 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Email Address *</Label>
              <Input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                required
                className="text-xs h-9 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Phone Number</Label>
                <Input
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="text-xs h-9 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Account Role *</Label>
                <Select
                  value={editForm.type}
                  onValueChange={(val: any) => setEditForm({ ...editForm, type: val })}
                >
                  <SelectTrigger className="text-xs h-9 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="client">Expedition Client</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Reset Password (Optional)</Label>
                <span className="text-[10px] text-muted-foreground">Leave blank to keep unchanged</span>
              </div>
              <div className="relative">
                <Input
                  type={showEditPassword ? 'text' : 'password'}
                  placeholder="New password (optional)"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  className="text-xs h-9 rounded-xl pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowEditPassword(!showEditPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showEditPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <DialogFooter className="pt-3 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                className="rounded-xl text-xs h-9"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isEditing}
                className="rounded-xl text-xs h-9 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                {isEditing && <LoaderCircle className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                <span>Save Changes</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION ALERT DIALOG */}
      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              <span>Delete User Account?</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs leading-relaxed">
              Are you sure you want to permanently delete the account for <strong className="text-foreground">{userToDelete?.name}</strong> ({userToDelete?.email})? This action cannot be reversed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl text-xs h-9">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="rounded-xl text-xs h-9 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold"
            >
              {isDeleting ? 'Deleting...' : 'Yes, Delete Account'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}

