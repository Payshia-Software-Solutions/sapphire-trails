'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Plus, 
  Pencil, 
  Trash2, 
  ExternalLink, 
  Search, 
  Clock, 
  Calendar, 
  Eye
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
import Image from 'next/image';
import Link from 'next/link';
import { 
  type ArticleItem, 
  getStoredArticles, 
  saveStoredArticles 
} from '@/lib/articles-data';

export default function ManageArticlesPage() {
  const { toast } = useToast();
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Load articles
  useEffect(() => {
    setArticles(getStoredArticles());
  }, []);

  const categories = ['all', ...Array.from(new Set(articles.map(a => a.category)))];

  const filteredArticles = articles.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || a.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDeleteArticle = (id: string) => {
    const nextArticles = articles.filter(a => a.id !== id);
    setArticles(nextArticles);
    saveStoredArticles(nextArticles);
    toast({
      title: 'Article Deleted',
      description: 'The article was removed from the live site.',
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-headline font-bold text-foreground flex items-center gap-2.5">
            <BookOpen className="h-7 w-7 text-primary" />
            Manage Articles &amp; Field Journal
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create, edit, and publish expert gemology guides, mining expedition stories, and market reports.
          </p>
        </div>

        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full px-6 shadow-md gap-2">
          <Link href="/admin/manage-articles/add">
            <Plus className="h-4 w-4" />
            New Article
          </Link>
        </Button>
      </div>

      {/* Filters & Search */}
      <Card className="bg-card border-border/80 shadow-sm">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, description, or slug..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 text-xs h-10 bg-background"
            />
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map(cat => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs h-8 rounded-full capitalize whitespace-nowrap ${selectedCategory === cat ? 'bg-primary text-primary-foreground' : 'border-border'}`}
              >
                {cat}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map(article => (
          <Card key={article.id} className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-md flex flex-col justify-between group hover:border-primary/50 transition-all">
            
            {/* Thumbnail Header */}
            <div>
              <div className="relative h-44 w-full overflow-hidden bg-muted">
                <Image
                  src={article.imageUrl}
                  alt={article.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Category Badge */}
                <div className="absolute top-3 left-3 bg-black/60 border border-primary/40 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-semibold text-primary uppercase tracking-wider">
                  {article.category}
                </div>

                {/* Published / Read Time */}
                <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-center justify-between text-[11px] text-white/90 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-primary" />
                    {article.readTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-primary" />
                    {article.publishedDate}
                  </span>
                </div>
              </div>

              {/* Body */}
              <CardContent className="p-5 space-y-3">
                <h3 className="font-headline font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                  {article.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {article.description}
                </p>

                {/* Author Strip */}
                <div className="pt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <div className="relative w-5 h-5 rounded-full overflow-hidden border border-primary/40">
                    <Image
                      src={article.author.avatar}
                      alt={article.author.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="truncate">{article.author.name}</span>
                </div>
              </CardContent>
            </div>

            {/* Actions Bar */}
            <div className="p-4 bg-background-alt/50 border-t border-border/60 flex items-center justify-between gap-2">
              <Button asChild variant="ghost" size="sm" className="text-xs h-8 text-muted-foreground hover:text-primary gap-1">
                <Link href={`/articles/${article.slug}`} target="_blank">
                  <Eye className="h-3.5 w-3.5" />
                  Preview
                </Link>
              </Button>

              <div className="flex items-center gap-1.5">
                <Button asChild variant="outline" size="sm" className="text-xs h-8 gap-1 border-primary/40 text-primary hover:bg-primary/10">
                  <Link href={`/admin/manage-articles/edit/${article.slug}`}>
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Link>
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-xs h-8 text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Article?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete &ldquo;{article.title}&rdquo;? This will remove it from the live site immediately.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteArticle(article.id)} className="bg-destructive text-destructive-foreground">
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

    </div>
  );
}
