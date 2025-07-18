
'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, AlertTriangle, Plus, Package as PackageIcon, LoaderCircle } from 'lucide-react';
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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

  // Note: Delete functionality would require a DELETE endpoint on the server.
  const handleDelete = (id: number) => {
    // This would be a fetch('.../tours/{id}', { method: 'DELETE' }) call
    toast({
        title: 'Delete Not Implemented',
        description: 'Please implement a DELETE endpoint on the server.',
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-primary">Manage Tour Packages</h1>
            <p className="text-muted-foreground">Add or delete custom tour packages for your website.</p>
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
            <div className="grid gap-6">
              {packages.map((pkg) => (
                <div key={pkg.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <Image
                    src={pkg.imageUrl}
                    alt={pkg.homepageTitle}
                    width={80}
                    height={80}
                    className="rounded-md object-cover aspect-square bg-muted"
                  />
                  <div className="grid gap-1 text-sm flex-1">
                    <div className="font-medium text-lg break-words">{pkg.homepageTitle}</div>
                    <div className="text-muted-foreground break-all">ID: {pkg.id}</div>
                  </div>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                       <Button variant="destructive" size="icon">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete {pkg.homepageTitle}</span>
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
                        <AlertDialogAction onClick={() => handleDelete(pkg.id)}>
                          Yes, delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  
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
