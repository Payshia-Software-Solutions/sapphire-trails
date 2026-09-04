
'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, AlertTriangle, Plus, Package as PackageIcon, LoaderCircle, Pencil } from 'lucide-react';
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
import Image from 'next/image';
import Link from 'next/link';
import { mapServerPackageToClient } from '@/lib/packages-data';

import { API_BASE_URL } from '@/lib/utils';
import { authFetch } from '@/lib/api';

// A leaner type for what this page needs to display
interface ManagedPackage {
    id: number;
    homepageTitle: string;
    imageUrl: string;
}

export default function ManagePackagesPage() {
  const { toast } = useToast();
  const [packages, setPackages] = useState<ManagedPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPackages() {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/tours`);
            if (!response.ok) {
                throw new Error('Failed to fetch packages from the server.');
            }
            const data = await response.json();
            if (Array.isArray(data)) {
                const mappedPackages = data.map((pkg: any) => {
                  const mapped = mapServerPackageToClient(pkg);
                  return {
                    id: mapped.id,
                    homepageTitle: mapped.homepageTitle,
                    imageUrl: mapped.imageUrl,
                  };
                });
                setPackages(mappedPackages);
            }
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not load tour packages. Please ensure the server is running.',
            });
        } finally {
            setIsLoading(false);
        }
    }
    fetchPackages();
  }, [toast]);

  const handleDelete = async (id: number, title: string) => {
    try {
        const response = await authFetch(`${API_BASE_URL}/tours/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to delete package.');
        }
        setPackages(prev => prev.filter(p => p.id !== id));
        toast({
            title: 'Package Deleted',
            description: `Package "${title}" has been deleted.`,
        });
    } catch(e) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: e instanceof Error ? e.message : 'Could not delete package.',
        });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-primary">Manage Tour Packages</h1>
            <p className="text-muted-foreground">Add, edit, or delete custom tour packages for your website.</p>
        </div>
        <Button asChild>
          <Link href="/admin/manage-packages/add">
            <Plus className="mr-2 h-4 w-4" />
            Add New Package
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tour Packages</CardTitle>
          <CardDescription>
            This list is fetched from your server. Deleting an item is permanent.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="text-center text-muted-foreground py-16 flex flex-col items-center gap-4">
              <LoaderCircle className="h-12 w-12 text-muted-foreground/50 animate-spin" />
              <p>Loading packages from server...</p>
            </div>
          ) : packages.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {packages.map((pkg) => (
                <div key={pkg.id} className="bg-card border border-border/80 rounded-xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow">
                  {/* Package Image Banner */}
                  <div className="relative aspect-[3/2] w-full bg-muted overflow-hidden">
                    {pkg.imageUrl ? (
                      <img
                        src={pkg.imageUrl}
                        alt={pkg.homepageTitle}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-background-alt text-muted-foreground text-xs italic">
                        No image
                      </div>
                    )}
                  </div>
                  
                  {/* Card Body */}
                  <div className="p-4 flex flex-col flex-1 justify-between gap-4">
                    <div className="space-y-1">
                      <div className="font-bold text-base text-primary leading-snug line-clamp-2 min-h-[2.5rem] break-words" title={pkg.homepageTitle}>
                        {pkg.homepageTitle}
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-border/30 pt-3 mt-auto text-xs">
                      <span className="font-mono text-muted-foreground">ID: {pkg.id}</span>
                      
                      <div className="flex items-center gap-1.5">
                        <Button asChild variant="outline" size="sm" className="h-8 px-2.5">
                          <Link href={`/admin/manage-packages/edit/${pkg.id}`}>
                            <Pencil className="h-3.5 w-3.5 mr-1" />
                            Edit
                          </Link>
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" className="h-8 px-2.5">
                              <Trash2 className="h-3.5 w-3.5 mr-1" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription className="break-words">
                                This action cannot be undone. This will permanently delete the package for <span className="font-semibold text-foreground">&quot;{pkg.homepageTitle}&quot;</span>.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(pkg.id, pkg.homepageTitle)}>
                                Yes, delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-16 flex flex-col items-center gap-4">
              <PackageIcon className="h-12 w-12 text-muted-foreground/50" />
              <p>No custom packages found on the server.</p>
              <Button asChild variant="link" className="text-primary">
                <Link href="/admin/manage-packages/add">Add your first package</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
