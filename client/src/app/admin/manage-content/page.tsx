
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Trash2, 
  AlertTriangle, 
  Plus, 
  LoaderCircle, 
  Pencil, 
  ExternalLink, 
  MapPin, 
  Search, 
  Compass, 
  TreePine, 
  Wheat, 
  Landmark 
} from 'lucide-react';
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
import Link from 'next/link';
import { mapServerLocationToClient } from '@/lib/locations-data';
import { API_BASE_URL } from '@/lib/utils';
import { authFetch } from '@/lib/api';

// Type for the location card display
interface ManagedLocation {
    slug: string;
    title: string;
    cardImage: string;
    distance?: string;
    category?: 'nature' | 'agriculture' | 'cultural' | string;
    cardDescription?: string;
}

export default function ManageContentPage() {
  const { toast } = useToast();
  const [locations, setLocations] = useState<ManagedLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    async function fetchLocations() {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/locations`);
        if (!response.ok) {
          throw new Error('Failed to fetch locations from the server.');
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setLocations(data.map(loc => {
            const mapped = mapServerLocationToClient(loc);
            return {
              slug: mapped.slug,
              title: mapped.title,
              cardImage: mapped.cardImage,
              distance: mapped.distance,
              category: mapped.category,
              cardDescription: mapped.cardDescription,
            };
          }));
        }
      } catch (error) {
        console.error(error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not load locations. Please ensure the server is running.',
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchLocations();
  }, [toast]);

  const handleDelete = async (slug: string) => {
    try {
        const response = await authFetch(`${API_BASE_URL}/locations/${slug}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || 'Failed to delete the location.');
        }

        // Remove the location from the local state to update the UI instantly
        setLocations(prevLocations => prevLocations.filter(location => location.slug !== slug));

        toast({
            title: 'Location Deleted',
            description: `The location "${slug}" has been successfully deleted.`,
        });

    } catch (error) {
        console.error('Failed to delete location:', error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: error instanceof Error ? error.message : 'Could not connect to the server.',
        });
    }
  };

  // Filter locations by search term and category
  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      const matchesSearch = 
        loc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (loc.cardDescription && loc.cardDescription.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = 
        selectedCategory === 'all' || loc.category?.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [locations, searchQuery, selectedCategory]);

  const getCategoryIcon = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'nature':
        return <TreePine className="h-3 w-3" />;
      case 'agriculture':
        return <Wheat className="h-3 w-3" />;
      case 'cultural':
        return <Landmark className="h-3 w-3" />;
      default:
        return <Compass className="h-3 w-3" />;
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'nature':
        return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
      case 'agriculture':
        return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'cultural':
        return 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30';
      default:
        return 'bg-primary/15 text-primary border-primary/30';
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl font-bold tracking-tight text-primary font-serif">Manage Locations</h1>
            <Badge variant="outline" className="text-xs px-2.5 py-0.5 border-primary/30 text-primary font-mono">
              {locations.length} Total
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">Add, edit, or delete custom locations for the &quot;Explore Ratnapura&quot; page.</p>
        </div>

        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm">
          <Link href="/admin/add-content">
            <Plus className="mr-2 h-4 w-4" />
            Add New Location
          </Link>
        </Button>
      </div>

      {/* Main Container Card */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-4 border-b border-border/60">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Custom Added Locations
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Explore Ratnapura showcase cards. Deleting a location is permanent.
              </CardDescription>
            </div>

            {/* Search & Category Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>

              {/* Category Pill Filters */}
              <div className="flex items-center rounded-lg border border-border p-1 bg-background-alt/50 text-xs overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${selectedCategory === 'all' ? 'bg-primary text-primary-foreground font-semibold shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('nature')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${selectedCategory === 'nature' ? 'bg-primary text-primary-foreground font-semibold shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Nature
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('agriculture')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${selectedCategory === 'agriculture' ? 'bg-primary text-primary-foreground font-semibold shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Agri
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('cultural')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${selectedCategory === 'cultural' ? 'bg-primary text-primary-foreground font-semibold shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Cultural
                </button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center text-muted-foreground py-20 flex flex-col items-center gap-4">
              <LoaderCircle className="h-10 w-10 text-primary animate-spin" />
              <p className="text-sm">Loading locations from server...</p>
            </div>
          ) : filteredLocations.length > 0 ? (
            /* RESPONSIVE CARD GRID LAYOUT */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredLocations.map((location) => (
                <div 
                  key={location.slug} 
                  className="group bg-card border border-border/80 hover:border-primary/50 rounded-2xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-all duration-200"
                >
                  {/* Card Image Banner */}
                  <div className="relative aspect-[16/10] w-full bg-muted overflow-hidden">
                    <img
                      src={location.cardImage}
                      alt={location.title}
                      onError={(e) => { 
                        (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546708973-b339540b5162?w=400&auto=format&fit=crop&q=80'; 
                      }}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Category Badge Top-Left */}
                    {location.category && (
                      <div className="absolute top-2.5 left-2.5 z-10">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-md border uppercase tracking-wider ${getCategoryColor(location.category)}`}>
                          {getCategoryIcon(location.category)}
                          {location.category}
                        </span>
                      </div>
                    )}

                    {/* Distance Badge Top-Right */}
                    {location.distance && (
                      <div className="absolute top-2.5 right-2.5 z-10">
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-md">
                          <MapPin className="h-2.5 w-2.5 text-primary" />
                          {location.distance}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Card Body */}
                  <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                    <div className="space-y-1.5">
                      <h3 
                        className="font-bold text-base text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2 min-h-[2.5rem] break-words" 
                        title={location.title}
                      >
                        {location.title}
                      </h3>

                      <div className="text-[11px] text-muted-foreground font-mono truncate">
                        /{location.slug}
                      </div>

                      {location.cardDescription && (
                        <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed pt-1">
                          {location.cardDescription}
                        </p>
                      )}
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="flex items-center justify-between border-t border-border/50 pt-3 mt-auto">
                      {/* Public Preview Link */}
                      <Button asChild variant="ghost" size="sm" className="h-8 px-2 text-xs text-muted-foreground hover:text-primary">
                        <a href={`/explore-ratnapura/${location.slug}`} target="_blank" rel="noreferrer" title="Open live page in new tab">
                          <ExternalLink className="h-3.5 w-3.5 mr-1" />
                          Preview
                        </a>
                      </Button>
                      
                      <div className="flex items-center gap-1.5">
                        {/* Edit Button */}
                        <Button asChild variant="outline" size="sm" className="h-8 px-2.5 text-xs text-primary border-primary/30 hover:bg-primary/10">
                          <Link href={`/admin/edit-content/${location.slug}`}>
                            <Pencil className="h-3.5 w-3.5 mr-1" />
                            Edit
                          </Link>
                        </Button>
                        
                        {/* Delete Confirmation Dialog */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                              title="Delete location"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span className="sr-only">Delete {location.title}</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription className="break-words">
                                This action cannot be undone. This will permanently delete the attraction page for <span className="font-semibold text-foreground">&quot;{location.title}&quot;</span>.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(location.slug)} 
                                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold"
                              >
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
              <AlertTriangle className="h-12 w-12 text-muted-foreground/50" />
              <div className="space-y-1">
                <p className="font-medium text-foreground text-sm">No locations matched your filter.</p>
                <p className="text-xs text-muted-foreground">Try clearing your search query or selecting &quot;All&quot; categories.</p>
              </div>
              {searchQuery && (
                <Button variant="outline" size="sm" onClick={() => setSearchQuery('')} className="text-xs">
                  Clear Search Filter
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
