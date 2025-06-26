
'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Location } from '@/lib/locations-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, AlertTriangle, Plus } from 'lucide-react';
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

export default function ManageContentPage() {
  const { toast } = useToast();
  const [customLocations, setCustomLocations] = useState<Location[]>([]);

  useEffect(() => {
    try {
      const storedLocationsRaw = localStorage.getItem('customLocations');
      if (storedLocationsRaw) {
        const storedLocations = JSON.parse(storedLocationsRaw) as Location[];
        if (Array.isArray(storedLocations)) {
          setCustomLocations(storedLocations);
        }
      }
    } catch (error) {
      console.error('Failed to load custom locations from localStorage', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not load custom locations.',
      });
    }
  }, [toast]);

  const handleDelete = (slug: string) => {
    const updatedLocations = customLocations.filter(loc => loc.slug !== slug);
    try {
      localStorage.setItem('customLocations', JSON.stringify(updatedLocations));
      setCustomLocations(updatedLocations);
      toast({
        title: 'Content Deleted!',
        description: `The location has been successfully removed.`,
      });
    } catch (error) {
      console.error('Failed to save to localStorage', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'There was a problem deleting the content.',
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-primary">Manage Content</h1>
            <p className="text-muted-foreground">Add or delete custom locations for the &quot;Explore Ratnapura&quot; page.</p>
        </div>
        <Button asChild>
          <Link href="/admin/add-content">
            <Plus className="mr-2 h-4 w-4" />
            Add New Location
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Custom Added Locations</CardTitle>
          <CardDescription>
            Only locations added via the &apos;Add Content&apos; form are listed here. Deleting an item is permanent.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {customLocations.length > 0 ? (
            <div className="grid gap-6">
              {customLocations.map((location) => (
                <div key={location.slug} className="flex items-center gap-4 p-4 border rounded-lg">
                  <Image
                    src={location.cardImage}
                    alt={location.title}
                    width={80}
                    height={80}
                    className="rounded-md object-cover aspect-square"
                  />
                  <div className="grid gap-1 text-sm flex-1">
                    <div className="font-medium text-lg">{location.title}</div>
                    <div className="text-muted-foreground">Slug: {location.slug}</div>
                  </div>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                       <Button variant="destructive" size="icon">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete {location.title}</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the content for <span className="font-semibold text-foreground">&quot;{location.title}&quot;</span>.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(location.slug)}>
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
              <AlertTriangle className="h-12 w-12 text-muted-foreground/50" />
              <p>No custom locations have been added yet.</p>
              <Button asChild variant="link" className="text-primary">
                <Link href="/admin/add-content">Add your first location</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
