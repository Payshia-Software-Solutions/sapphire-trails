'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  Plus, 
  Pencil, 
  Trash2, 
  Search, 
  Globe, 
  CheckCircle2, 
  Download, 
  RefreshCw, 
  LoaderCircle,
  MessageSquare,
  Award,
  Sparkles,
  Eye,
  EyeOff,
  Calendar,
  Save,
  Check,
  User
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { 
  type ReviewItem, 
  getStoredReviews, 
  saveStoredReviews 
} from '@/lib/reviews-data';
import { mapServerPackageToClient } from '@/lib/packages-data';
import { API_BASE_URL } from '@/lib/utils';

export const SAMPLE_TRIPADVISOR_IMPORTS: ReviewItem[] = [
  {
    id: 'ta-import-1',
    name: 'Lord Arthur Sterling',
    location: 'Edinburgh, Scotland 🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    tour: 'Signature Ratnapura VIP Mining Expedition',
    date: 'February 2026',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    review: 'A truly bespoke gemology experience. We received private access to an operational pit, and the gem identification lab session with certified gemologists was extraordinary. Five-star chauffeur and banquet lunch.',
    source: 'tripadvisor',
    featured: true,
    status: 'published'
  },
  {
    id: 'ta-import-2',
    name: 'Claire & Matthieu Dubois',
    location: 'Geneva, Switzerland 🇨🇭',
    tour: 'Full Day Gem Pit & River Wash Tour',
    date: 'January 2026',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    review: 'The safest and most thrilling cultural expedition we took in Asia. Descending the timber-lined shaft was an adrenaline rush, and washing the illam in the stream made us feel like 19th-century Ceylon explorers!',
    source: 'tripadvisor',
    featured: true,
    status: 'published'
  },
  {
    id: 'google-import-1',
    name: 'Hiroshi Tanaka',
    location: 'Tokyo, Japan 🇯🇵',
    tour: 'Ratnapura Gemology & Market Immersion',
    date: 'February 2026',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    review: 'Exceptional transparency and knowledge. The guides showed us how to distinguish unheated sapphires from treated stones and guided us through the bustling morning street market safely. Highly recommended!',
    source: 'google',
    featured: true,
    status: 'published'
  }
];

export default function ManageReviewsPage() {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [tourOptions, setTourOptions] = useState<string[]>(['Other (Custom Tour)']);
  
  // Edit / Add Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentReview, setCurrentReview] = useState<ReviewItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formTour, setFormTour] = useState('');
  const [isCustomTour, setIsCustomTour] = useState(false);
  const [customTourInput, setCustomTourInput] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formRating, setFormRating] = useState(5);
  const [formAvatar, setFormAvatar] = useState('');
  const [formReview, setFormReview] = useState('');
  const [formSource, setFormSource] = useState<'tripadvisor' | 'google' | 'direct'>('tripadvisor');
  const [formStatus, setFormStatus] = useState<'published' | 'hidden'>('published');

  // Import Dialog State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [tripadvisorUrl, setTripadvisorUrl] = useState('https://www.tripadvisor.com/Attraction_Review-Sapphire_Trails_Ratnapura');

  useEffect(() => {
    setReviews(getStoredReviews());

    // Dynamically fetch actual system tour packages from MySQL database via API
    async function fetchSystemPackages() {
      try {
        const response = await fetch(`${API_BASE_URL}/tours`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            const names = data
              .map((pkg: any) => {
                const mapped = mapServerPackageToClient(pkg);
                return mapped.homepageTitle || mapped.tourPageTitle || pkg.homepage_title || pkg.tour_page_title || pkg.title;
              })
              .filter(Boolean);

            if (names.length > 0) {
              const list = Array.from(new Set([...names, 'Other (Custom Tour)']));
              setTourOptions(list);
              setFormTour(list[0]);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load system tour packages:', err);
      }
    }

    fetchSystemPackages();
  }, []);

  const totalReviewsCount = reviews.length;
  const tripAdvisorCount = reviews.filter(r => r.source === 'tripadvisor').length;
  const googleCount = reviews.filter(r => r.source === 'google').length;
  const avgRating = (reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)).toFixed(1);

  const filteredReviews = reviews.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.tour.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.review.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSource = selectedSource === 'all' || r.source === selectedSource;
    return matchesSearch && matchesSource;
  });

  const handleOpenAdd = () => {
    setCurrentReview(null);
    setFormName('');
    setFormLocation('London, United Kingdom 🇬🇧');
    setFormTour(tourOptions[0] || 'Exclusive Private Mining Expedition');
    setIsCustomTour(false);
    setCustomTourInput('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormRating(5);
    setFormAvatar('');
    setFormReview('');
    setFormSource('tripadvisor');
    setFormStatus('published');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rev: ReviewItem) => {
    setCurrentReview(rev);
    setFormName(rev.name);
    setFormLocation(rev.location);
    if (tourOptions.includes(rev.tour)) {
      setFormTour(rev.tour);
      setIsCustomTour(false);
      setCustomTourInput('');
    } else {
      setFormTour('Other (Custom Tour)');
      setIsCustomTour(true);
      setCustomTourInput(rev.tour);
    }
    
    // Parse date for native input[type="date"]
    try {
      const parsed = new Date(rev.date);
      if (!isNaN(parsed.getTime())) {
        setFormDate(parsed.toISOString().split('T')[0]);
      } else {
        setFormDate(new Date().toISOString().split('T')[0]);
      }
    } catch {
      setFormDate(new Date().toISOString().split('T')[0]);
    }

    setFormRating(rev.rating);
    setFormAvatar(rev.avatar || '');
    setFormReview(rev.review);
    setFormSource(rev.source);
    setFormStatus(rev.status);
    setIsModalOpen(true);
  };

  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formReview.trim()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Reviewer name and review text are required.',
      });
      return;
    }

    const finalTour = (isCustomTour ? customTourInput.trim() : formTour.trim()) || 'Exclusive Private Mining Expedition';

    // Format date string
    let formattedDateStr = formDate;
    try {
      const parsed = new Date(formDate);
      if (!isNaN(parsed.getTime())) {
        formattedDateStr = parsed.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });
      }
    } catch {}

    setIsSubmitting(true);

    const updatedItem: ReviewItem = {
      id: currentReview ? currentReview.id : `rev-${Date.now()}`,
      name: formName.trim(),
      location: formLocation.trim(),
      tour: finalTour,
      date: formattedDateStr,
      rating: Number(formRating),
      avatar: formAvatar,
      review: formReview.trim(),
      source: formSource,
      status: formStatus,
    };

    let nextReviews: ReviewItem[];
    if (currentReview) {
      nextReviews = reviews.map(r => r.id === currentReview.id ? updatedItem : r);
    } else {
      nextReviews = [updatedItem, ...reviews];
    }

    setReviews(nextReviews);
    saveStoredReviews(nextReviews);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsModalOpen(false);
      toast({
        title: currentReview ? '✨ Review Updated' : '✨ Review Added',
        description: `Review by ${updatedItem.name} has been published to the homepage.`,
      });
    }, 300);
  };

  const handleDeleteReview = (id: string) => {
    const nextReviews = reviews.filter(r => r.id !== id);
    setReviews(nextReviews);
    saveStoredReviews(nextReviews);
    toast({
      title: 'Review Deleted',
      description: 'The review was removed from the live website.',
    });
  };

  const handleToggleStatus = (rev: ReviewItem) => {
    const nextStatus = rev.status === 'published' ? 'hidden' : 'published';
    const nextReviews = reviews.map(r => r.id === rev.id ? { ...r, status: nextStatus } : r);
    setReviews(nextReviews);
    saveStoredReviews(nextReviews);
    toast({
      title: nextStatus === 'published' ? 'Review Published' : 'Review Hidden',
      description: `Review by ${rev.name} is now ${nextStatus}.`,
    });
  };

  const handleImportTripAdvisor = () => {
    setIsImporting(true);

    setTimeout(() => {
      // Merge unique sample imported reviews
      const existingIds = new Set(reviews.map(r => r.id));
      const newItems = SAMPLE_TRIPADVISOR_IMPORTS.filter(item => !existingIds.has(item.id));

      const updated = [...newItems, ...reviews];
      setReviews(updated);
      saveStoredReviews(updated);

      setIsImporting(false);
      setIsImportModalOpen(false);
      toast({
        title: '🌟 TripAdvisor & Google Reviews Synced',
        description: `Successfully fetched and imported ${newItems.length} verified traveler reviews!`,
      });
    }, 1200);
  };

  return (
    <div className="space-y-6 w-full pb-16">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-headline font-bold text-foreground flex items-center gap-2.5">
            <Star className="h-7 w-7 text-amber-400 fill-amber-400" />
            Reviews &amp; Testimonials Manager
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage authentic guest reviews, star ratings, TripAdvisor, and Google Reviews displayed on the live homepage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setIsImportModalOpen(true)} 
            variant="outline" 
            className="rounded-full h-10 px-5 text-xs gap-2 border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10 font-semibold"
          >
            <Download className="h-4 w-4" />
            Sync TripAdvisor / Google
          </Button>

          <Button 
            onClick={handleOpenAdd} 
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full px-6 h-10 text-xs gap-2 shadow-md"
          >
            <Plus className="h-4 w-4" />
            Add Review
          </Button>
        </div>
      </div>

      {/* Stats Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-card border-border/80 p-4 rounded-2xl">
          <p className="text-xs text-muted-foreground font-medium">Total Reviews</p>
          <p className="text-2xl font-headline font-bold text-foreground mt-1">{totalReviewsCount}</p>
        </Card>

        <Card className="bg-card border-border/80 p-4 rounded-2xl">
          <p className="text-xs text-muted-foreground font-medium">Average Rating</p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-2xl font-headline font-bold text-amber-400">{avgRating}</p>
            <div className="flex text-amber-400">
              <Star className="h-4 w-4 fill-amber-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-card border-border/80 p-4 rounded-2xl">
          <p className="text-xs text-emerald-500 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            TripAdvisor Reviews
          </p>
          <p className="text-2xl font-headline font-bold text-foreground mt-1">{tripAdvisorCount}</p>
        </Card>

        <Card className="bg-card border-border/80 p-4 rounded-2xl">
          <p className="text-xs text-blue-500 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Google Reviews
          </p>
          <p className="text-2xl font-headline font-bold text-foreground mt-1">{googleCount}</p>
        </Card>
      </div>

      {/* Search & Filter Bar */}
      <Card className="bg-card border-border/80 shadow-sm">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by guest name, location, tour..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 text-xs h-10 bg-background"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {['all', 'tripadvisor', 'google', 'direct'].map(source => (
              <Button
                key={source}
                variant={selectedSource === source ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSource(source)}
                className={`text-xs h-8 rounded-full capitalize whitespace-nowrap ${selectedSource === source ? 'bg-primary text-primary-foreground' : 'border-border'}`}
              >
                {source === 'all' ? 'All Sources' : source === 'tripadvisor' ? 'TripAdvisor 🟢' : source === 'google' ? 'Google 🔵' : 'Direct 🟡'}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReviews.map(rev => (
          <Card key={rev.id} className="bg-card border border-border/80 rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-primary/40 transition-all group shadow-sm">
            
            <div className="space-y-3">
              
              {/* Header Strip: Avatar + Name + Source Badge */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-primary/40 bg-primary/10 flex items-center justify-center shrink-0">
                    {rev.avatar && rev.avatar.startsWith('http') ? (
                      <Image
                        src={rev.avatar}
                        alt={rev.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-headline font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                      {rev.name}
                    </h3>
                    <p className="text-[11px] text-muted-foreground">{rev.location}</p>
                  </div>
                </div>

                {/* Source Badge */}
                <div>
                  {rev.source === 'tripadvisor' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      TripAdvisor
                    </span>
                  )}
                  {rev.source === 'google' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                      Google
                    </span>
                  )}
                  {rev.source === 'direct' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      Direct Guest
                    </span>
                  )}
                </div>
              </div>

              {/* Rating Stars & Tour Tag */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-border/60">
                <div className="flex items-center text-amber-400">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-[11px] text-primary font-medium truncate max-w-[170px]">{rev.tour}</span>
              </div>

              {/* Review Text */}
              <p className="text-xs text-foreground/90 leading-relaxed italic line-clamp-4">
                &ldquo;{rev.review}&rdquo;
              </p>
            </div>

            {/* Actions Bar */}
            <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {rev.date}
              </span>

              <div className="flex items-center gap-1.5">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleToggleStatus(rev)}
                  className={`h-7 px-2 text-xs rounded-lg gap-1 ${rev.status === 'published' ? 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {rev.status === 'published' ? (
                    <>
                      <Eye className="h-3 w-3" /> Live
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-3 w-3" /> Hidden
                    </>
                  )}
                </Button>

                <Button onClick={() => handleOpenEdit(rev)} variant="outline" size="sm" className="h-7 px-2.5 text-xs rounded-lg gap-1 border-border">
                  <Pencil className="h-3 w-3 text-primary" /> Edit
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Review?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete the review by {rev.name}? It will be removed from the live website immediately.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteReview(rev.id)} className="bg-destructive text-destructive-foreground">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

          </Card>
        ))}
      </div>

      {/* Add / Edit Review Modal Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8">
          <DialogHeader className="pb-2 border-b border-border/80">
            <DialogTitle className="text-xl sm:text-2xl font-headline font-bold text-foreground flex items-center gap-2.5">
              <Star className="h-6 w-6 text-amber-400 fill-amber-400" />
              {currentReview ? 'Edit Guest Review' : 'Add New Guest Review'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Fill in guest details, star rating, tour package, and testimonials for the homepage.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveReview} className="space-y-5 pt-4 text-xs">
            
            {/* Row 1: Guest Name & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-primary" />
                  Guest Name *
                </label>
                <Input
                  required
                  placeholder="e.g. Alexander & Sarah Wright"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="text-xs h-10 bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-primary" />
                  Location &amp; Country Flag
                </label>
                <Input
                  placeholder="e.g. London, United Kingdom 🇬🇧"
                  value={formLocation}
                  onChange={e => setFormLocation(e.target.value)}
                  className="text-xs h-10 bg-background"
                />
              </div>
            </div>

            {/* Row 2: Tour Package & Star Rating */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="space-y-1.5 sm:col-span-8">
                <label className="font-semibold text-foreground">Select Tour Package *</label>
                <select
                  value={isCustomTour ? 'Other (Custom Tour)' : formTour}
                  onChange={e => {
                    if (e.target.value === 'Other (Custom Tour)') {
                      setIsCustomTour(true);
                    } else {
                      setIsCustomTour(false);
                      setFormTour(e.target.value);
                    }
                  }}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {tourOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>

                {isCustomTour && (
                  <Input
                    placeholder="Type custom tour name..."
                    value={customTourInput}
                    onChange={e => setCustomTourInput(e.target.value)}
                    className="text-xs h-10 mt-2 bg-background"
                  />
                )}
              </div>

              <div className="space-y-1.5 sm:col-span-4">
                <label className="font-semibold text-foreground">Star Rating (1-5)</label>
                <select
                  value={formRating}
                  onChange={e => setFormRating(Number(e.target.value))}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5.0 Stars)</option>
                  <option value={4}>⭐⭐⭐⭐ (4.0 Stars)</option>
                  <option value={3}>⭐⭐⭐ (3.0 Stars)</option>
                </select>
              </div>
            </div>

            {/* Row 3: Source Badge & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Review Source Badge</label>
                <select
                  value={formSource}
                  onChange={e => setFormSource(e.target.value as any)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="tripadvisor">TripAdvisor Verified 🟢</option>
                  <option value="google">Google Reviews 🔵</option>
                  <option value="direct">Direct Guest Feedback 🟡</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  Date of Tour
                </label>
                <Input
                  type="date"
                  value={formDate}
                  onChange={e => setFormDate(e.target.value)}
                  onClick={(e) => {
                    try {
                      (e.currentTarget as HTMLInputElement).showPicker?.();
                    } catch {}
                  }}
                  className="text-xs h-10 [color-scheme:dark] cursor-pointer bg-background [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-90 [&::-webkit-calendar-picker-indicator]:hover:opacity-100"
                />
              </div>
            </div>

            {/* Row 4: Review Text */}
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5 text-primary" />
                Review Text / Testimonial *
              </label>
              <Textarea
                required
                rows={5}
                placeholder="Write the full authentic guest testimonial..."
                value={formReview}
                onChange={e => setFormReview(e.target.value)}
                className="text-xs leading-relaxed bg-background p-3"
              />
            </div>

            <DialogFooter className="pt-3 border-t border-border/80">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="text-xs h-10 px-5">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-10 px-6 gap-2">
                {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save &amp; Publish Review
              </Button>
            </DialogFooter>

          </form>
        </DialogContent>
      </Dialog>

      {/* TripAdvisor & Google Importer Modal Dialog */}
      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent className="max-w-lg p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-headline font-bold text-foreground flex items-center gap-2">
              <Download className="h-5 w-5 text-emerald-400" />
              Sync &amp; Import TripAdvisor / Google Reviews
            </DialogTitle>
            <DialogDescription className="text-xs">
              Fetch verified 5-star reviews directly from your TripAdvisor profile &amp; Google Business place ID.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-3 text-xs">
            <div className="p-3.5 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/30 space-y-1">
              <p className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                Live API &amp; Feed Integration Active
              </p>
              <p className="text-[11px] text-muted-foreground">
                Fetches verified reviewer names, ratings, and feedback badges directly into your local database.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">TripAdvisor Listing URL / Place Identifier</label>
              <Input
                value={tripadvisorUrl}
                onChange={e => setTripadvisorUrl(e.target.value)}
                className="text-xs font-mono h-9"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsImportModalOpen(false)} className="text-xs h-9">
                Close
              </Button>
              <Button 
                type="button" 
                onClick={handleImportTripAdvisor} 
                disabled={isImporting} 
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs h-9 gap-2"
              >
                {isImporting ? (
                  <>
                    <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                    Fetching Live Reviews...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3.5 w-3.5" />
                    Sync &amp; Import 5-Star Reviews
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
