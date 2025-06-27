
'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { TourPackage } from '@/lib/packages-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, AlertTriangle, Plus, Package as PackageIcon } from 'lucide-react';
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
import Image from 'next/image';
import Link from 'next/link';

export default function ManagePackagesPage() {
  const { toast } = useToast();
  const [customPackages, setCustomPackages] = useState<TourPackage[]>([]);

  useEffect(() => {
    try {
      const storedPackagesRaw = localStorage.getItem('customPackages');
      if (storedPackagesRaw) {
        const storedPackages = JSON.parse(storedPackagesRaw) as TourPackage[];
        if (Array.isArray(storedPackages)) {
          setCustomPackages(storedPackages);
        }
      }
    } catch (error) {
      console.error('Failed to load custom packages from localStorage', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not load custom packages.',
      });
    }
  }, [toast]);

  const handleDelete = (id: string) => {
    const updatedPackages = customPackages.filter(pkg => pkg.id !== id);
    try {
      localStorage.setItem('customPackages', JSON.stringify(updatedPackages));
      setCustomPackages(updatedPackages);
      toast({
        title: 'Package Deleted!',
        description: `The tour package has been successfully removed.`,
      });
    } catch (error) {
      console.error('Failed to save to localStorage', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'There was a problem deleting the package.',
      });
    }
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
          <CardTitle>Custom Added Packages</CardTitle>
          <CardDescription>
            Only packages added via the form are listed here. Deleting an item is permanent.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {customPackages.length > 0 ? (
            <div className="grid gap-6">
              {customPackages.map((pkg) => (
                <div key={pkg.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <Image
                    src={pkg.imageUrl}
                    alt={pkg.homepageTitle}
                    width={80}
                    height={80}
                    className="rounded-md object-cover aspect-square"
                  />
                  <div className="grid gap-1 text-sm flex-1">
                    <div className="font-medium text-lg break-words">{pkg.title?.line2 || pkg.homepageTitle}</div>
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
              <p>No custom packages have been added yet.</p>
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
