'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  BookOpen, 
  ArrowLeft, 
  Save, 
  Sparkles, 
  CheckCircle2, 
  X, 
  User, 
  Image as ImageIcon,
  LoaderCircle,
  Bold,
  Italic,
  Underline,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link2,
  Upload,
  FileCode,
  Trash2,
  RefreshCw,
  CalendarDays,
  Check
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  type ArticleItem, 
  getStoredArticles, 
  saveStoredArticles,
  createArticleApi
} from '@/lib/articles-data';

const PRESET_AVATARS = [
  {
    id: 'rohan',
    name: 'Dr. Rohan Samarasinghe, FGA',
    role: 'Chief Gemological Consultant',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    label: 'Senior Gemologist'
  },
  {
    id: 'chaminda',
    name: 'Chaminda Wijesinghe',
    role: 'Master Pit Mining Director',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    label: 'Mining Director'
  },
  {
    id: 'dilshan',
    name: 'Dilshan Perera',
    role: 'Gem Market & Trading Specialist',
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    label: 'Trading Specialist'
  },
  {
    id: 'anoma',
    name: 'Anoma Jayawardena, GG',
    role: 'Gemological Historian & Curator',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    label: 'Historian'
  },
  {
    id: 'malik',
    name: 'Malik Fernando',
    role: 'Senior Luxury Expedition Guide',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
    label: 'Expedition Guide'
  },
  {
    id: 'editorial',
    name: 'Sapphire Trails Editorial',
    role: 'Official Research & Field Journal Team',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    label: 'Editorial Team'
  }
];

export default function AddArticlePage() {
  const router = useRouter();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [articleSlug, setArticleSlug] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Gemology & Valuation');
  const [readTime, setReadTime] = useState('5 min read');
  
  // Format current date as YYYY-MM-DD for native input[type="date"]
  const [publishedDate, setPublishedDate] = useState(new Date().toISOString().split('T')[0]);

  const [imageUrl, setImageUrl] = useState('');
  const [imageHint, setImageHint] = useState('');
  
  // Selected Avatar
  const [authorName, setAuthorName] = useState(PRESET_AVATARS[0].name);
  const [authorRole, setAuthorRole] = useState(PRESET_AVATARS[0].role);
  const [authorAvatar, setAuthorAvatar] = useState(PRESET_AVATARS[0].url);

  const [keyTakeaways, setKeyTakeaways] = useState<string[]>([
    'Insight into authentic Ratnapura mining traditions and certified valuation.',
    'How to safely inspect rough sapphires and navigate the gem markets.'
  ]);
  const [newTakeawayInput, setNewTakeawayInput] = useState('');
  const [contentHtml, setContentHtml] = useState('<h2>Introduction</h2><p>Start typing your editorial article content here directly...</p>');

  // Visual WYSIWYG View State
  const [isCodeView, setIsCodeView] = useState(false);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Duplicate slug check
  const isDuplicateSlug = getStoredArticles().some(a => a.slug === articleSlug);

  // Execute visual formatting
  const formatVisual = (command: string, value: string | undefined = undefined) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, value);
      setContentHtml(editorRef.current.innerHTML);
    }
  };

  const handleEditorInput = () => {
    if (editorRef.current) {
      setContentHtml(editorRef.current.innerHTML);
    }
  };

  // Image Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        variant: 'destructive',
        title: 'Invalid File',
        description: 'Please upload an image file (JPG, PNG, WEBP).',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageUrl(event.target.result as string);
        toast({
          title: '✨ Image Uploaded',
          description: `${file.name} is ready for publishing.`,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddTakeaway = () => {
    if (!newTakeawayInput.trim()) return;
    setKeyTakeaways([...keyTakeaways, newTakeawayInput.trim()]);
    setNewTakeawayInput('');
  };

  const handleRemoveTakeaway = (index: number) => {
    setKeyTakeaways(keyTakeaways.filter((_, i) => i !== index));
  };

  const handleSelectAvatar = (preset: typeof PRESET_AVATARS[0]) => {
    setAuthorName(preset.name);
    setAuthorRole(preset.role);
    setAuthorAvatar(preset.url);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSlug = articleSlug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');

    if (!title.trim() || !cleanSlug) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Article headline and slug are required.',
      });
      return;
    }

    // Validate Unique Slug
    const allArticles = getStoredArticles();
    const isDuplicate = allArticles.some(a => a.slug === cleanSlug);

    if (isDuplicate) {
      toast({
        variant: 'destructive',
        title: 'Duplicate Slug Error',
        description: `The URL Slug "${cleanSlug}" is already in use by another article. Please choose a unique slug.`,
      });
      return;
    }

    setIsSubmitting(true);

    const finalHtml = editorRef.current ? editorRef.current.innerHTML : contentHtml;

    // Convert YYYY-MM-DD to friendly formatted string like "February 2026" or "February 28, 2026"
    let formattedDateStr = publishedDate;
    try {
      const parsedDate = new Date(publishedDate);
      if (!isNaN(parsedDate.getTime())) {
        formattedDateStr = parsedDate.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });
      }
    } catch {
      // keep fallback
    }

    const newItem: ArticleItem = {
      id: String(Date.now()),
      slug: cleanSlug,
      title,
      subtitle,
      description,
      category,
      readTime,
      publishedDate: formattedDateStr,
      imageUrl: imageUrl || 'https://content-provider.payshia.com/sapphire-trail/images/img37.webp',
      imageHint: imageHint || 'gemstones',
      status: 'published',
      author: {
        name: authorName,
        role: authorRole,
        avatar: authorAvatar,
      },
      keyTakeaways,
      contentHtml: finalHtml,
    };

    try {
      // Persist to Live MySQL Database
      const created = await createArticleApi(newItem);
      const updatedArticles = [created, ...allArticles];
      saveStoredArticles(updatedArticles);

      toast({
        title: '✨ Article Published Successfully',
        description: `"${newItem.title}" is now saved to the live database and live on the website.`,
      });
      router.push('/admin/manage-articles');
    } catch (err: any) {
      console.error('Failed to create article via API:', err);
      // Fallback local save so user work is never lost
      const updatedArticles = [newItem, ...allArticles];
      saveStoredArticles(updatedArticles);
      toast({
        title: 'Article Saved Locally',
        description: `Saved locally. Warning: ${err.message || 'Database connection issue.'}`,
      });
      router.push('/admin/manage-articles');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 w-full pb-20">
      
      {/* Top Static Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-5">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm" className="rounded-full h-9 px-3 gap-1.5 border-border">
            <Link href="/admin/manage-articles">
              <ArrowLeft className="h-4 w-4" />
              Back to Articles
            </Link>
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-headline font-bold text-foreground truncate max-w-xl">
              Create New Article &amp; Field Guide
            </h1>
            <p className="text-xs text-muted-foreground">
              WYSIWYG Visual Editor &bull; What you see is what you get
            </p>
          </div>
        </div>

        <Button 
          onClick={handleSave} 
          disabled={isSubmitting || isDuplicateSlug} 
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full px-7 h-10 text-xs gap-2 shadow-lg"
        >
          {isSubmitting ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Publishing...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Publish Article
            </>
          )}
        </Button>
      </div>

      {/* Main Full-Width Form */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
        
        {/* Left 8-Column Editor Canvas */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Card 1: Article Titles & Excerpt */}
          <Card className="bg-card border-border/80 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-headline font-bold text-foreground">
                Article Headlines &amp; Excerpt
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Article Headline *</label>
                <Input
                  required
                  placeholder="e.g. The Complete Guide to Gem Mining in Ratnapura"
                  value={title}
                  onChange={e => {
                    setTitle(e.target.value);
                    if (!articleSlug || articleSlug === title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-_]/g, '')) {
                      setArticleSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-_]/g, ''));
                    }
                  }}
                  className="text-base font-headline font-semibold h-11"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Editorial Subtitle</label>
                <Input
                  placeholder="e.g. An insider look into the geological treasures of Sri Lanka’s City of Gems..."
                  value={subtitle}
                  onChange={e => setSubtitle(e.target.value)}
                  className="text-xs h-10"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Excerpt / Meta Description</label>
                <Textarea
                  rows={3}
                  placeholder="Brief summary for card grids and Google search results..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="text-xs leading-relaxed"
                />
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Key Takeaways Executive Summary */}
          <Card className="bg-card border-border/80 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-headline font-bold text-primary flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Key Takeaways (Executive Summary Highlights)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {keyTakeaways.map((point, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 bg-background-alt p-3 rounded-xl border border-border/80 text-xs">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    <span className="flex-1 text-foreground/90">{point}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveTakeaway(idx)} className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive">
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Input
                  placeholder="Add a new executive takeaway bullet..."
                  value={newTakeawayInput}
                  onChange={e => setNewTakeawayInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTakeaway(); } }}
                  className="text-xs h-10"
                />
                <Button type="button" onClick={handleAddTakeaway} size="sm" variant="outline" className="text-xs shrink-0 h-10 px-5">
                  Add Bullet
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Professional WYSIWYG Visual Editor */}
          <Card className="bg-card border-border/80 shadow-sm overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-background-alt/30">
              <div>
                <CardTitle className="text-base font-headline font-bold text-foreground flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  Article Visual Content Editor
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Type and format directly like Microsoft Word / Google Docs. No HTML knowledge required.
                </CardDescription>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (!isCodeView && editorRef.current) {
                    setContentHtml(editorRef.current.innerHTML);
                  } else if (isCodeView && editorRef.current) {
                    editorRef.current.innerHTML = contentHtml;
                  }
                  setIsCodeView(!isCodeView);
                }}
                className="text-xs h-8 gap-1.5 border-border"
              >
                <FileCode className="h-3.5 w-3.5 text-primary" />
                {isCodeView ? 'Switch to Visual Editor' : 'HTML Source View'}
              </Button>
            </CardHeader>

            {/* Visual WYSIWYG Toolbar */}
            {!isCodeView && (
              <div className="p-2.5 bg-background border-b border-border flex flex-wrap items-center gap-1.5 text-xs">
                <Button type="button" variant="ghost" size="sm" onClick={() => formatVisual('formatBlock', '<h2>')} className="h-8 px-2.5 text-xs font-bold gap-1">
                  <Heading2 className="h-3.5 w-3.5 text-primary" /> Section Heading
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => formatVisual('formatBlock', '<h3>')} className="h-8 px-2.5 text-xs font-bold gap-1">
                  <Heading3 className="h-3.5 w-3.5 text-primary" /> Subheading
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => formatVisual('formatBlock', '<p>')} className="h-8 px-2 text-xs font-medium">
                  Normal Paragraph
                </Button>
                <span className="h-4 w-[1px] bg-border mx-1" />
                <Button type="button" variant="ghost" size="sm" onClick={() => formatVisual('bold')} className="h-8 w-8 p-0 hover:bg-primary/10">
                  <Bold className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => formatVisual('italic')} className="h-8 w-8 p-0 hover:bg-primary/10">
                  <Italic className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => formatVisual('underline')} className="h-8 w-8 p-0 hover:bg-primary/10">
                  <Underline className="h-4 w-4" />
                </Button>
                <span className="h-4 w-[1px] bg-border mx-1" />
                <Button type="button" variant="ghost" size="sm" onClick={() => formatVisual('insertUnorderedList')} className="h-8 px-2.5 text-xs gap-1">
                  <List className="h-3.5 w-3.5" /> Bullet List
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => formatVisual('insertOrderedList')} className="h-8 px-2.5 text-xs gap-1">
                  <ListOrdered className="h-3.5 w-3.5" /> Numbered List
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => formatVisual('formatBlock', '<blockquote>')} className="h-8 px-2.5 text-xs gap-1">
                  <Quote className="h-3.5 w-3.5" /> Quote
                </Button>
                <span className="h-4 w-[1px] bg-border mx-1" />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    const url = prompt('Enter website link URL:');
                    if (url) formatVisual('createLink', url);
                  }} 
                  className="h-8 px-2.5 text-xs gap-1 text-primary"
                >
                  <Link2 className="h-3.5 w-3.5" /> Add Link
                </Button>
              </div>
            )}

            <CardContent className="p-0">
              {isCodeView ? (
                <Textarea
                  rows={20}
                  value={contentHtml}
                  onChange={e => setContentHtml(e.target.value)}
                  className="w-full text-xs sm:text-sm font-mono leading-relaxed bg-background p-5 min-h-[480px] border-0 rounded-none focus-visible:ring-0 resize-y"
                  placeholder="Raw HTML code..."
                />
              ) : (
                <div
                  ref={(el) => {
                    editorRef.current = el;
                    if (el && contentHtml && !el.innerHTML.trim()) {
                      el.innerHTML = contentHtml;
                    }
                  }}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={handleEditorInput}
                  className="w-full min-h-[480px] p-6 sm:p-8 bg-card text-foreground focus:outline-none leading-relaxed 
                    prose prose-neutral dark:prose-invert max-w-none
                    [&_h2]:text-2xl sm:[&_h2]:text-3xl [&_h2]:font-headline [&_h2]:font-bold [&_h2]:text-primary [&_h2]:mt-6 [&_h2]:mb-3
                    [&_h3]:text-xl [&_h3]:font-headline [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-5 [&_h3]:mb-2
                    [&_p]:text-sm sm:[&_p]:text-base [&_p]:leading-relaxed [&_p]:text-foreground/90 [&_p]:mb-4
                    [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ul]:mb-5
                    [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5 [&_ol]:mb-5
                    [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4
                    [&_strong]:text-foreground [&_strong]:font-semibold
                  "
                  dangerouslySetInnerHTML={{ __html: contentHtml }}
                />
              )}
            </CardContent>
          </Card>

        </div>

        {/* Right 4-Column Metadata Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Featured Image with Direct File Upload */}
          <Card className="bg-card border-border/80 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-headline font-bold text-foreground flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ImageIcon className="h-4 w-4 text-primary" />
                  Featured Image
                </span>
                {imageUrl && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setImageUrl('')} className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              
              {/* Image Preview Box */}
              {imageUrl ? (
                <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-border shadow-md group">
                  <Image
                    src={imageUrl}
                    alt={title || "Featured Image"}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()} 
                      size="sm" 
                      variant="secondary"
                      className="text-xs h-8 rounded-full gap-1.5"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Replace Image
                    </Button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border hover:border-primary/60 rounded-xl p-6 text-center cursor-pointer transition-colors bg-background-alt/50 flex flex-col items-center justify-center gap-2"
                >
                  <div className="p-3 rounded-full bg-primary/10 text-primary">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Click to upload image</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">JPG, PNG, or WEBP (Max 10MB)</p>
                  </div>
                </div>
              )}

              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />

              {/* Or Direct URL Input */}
              <div className="space-y-1 pt-1">
                <label className="font-semibold text-foreground flex items-center justify-between">
                  <span>Or Enter Image URL</span>
                </label>
                <Input
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  className="text-xs h-9"
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Image Hint (AI Context)</label>
                <Input
                  value={imageHint}
                  onChange={e => setImageHint(e.target.value)}
                  className="text-xs h-9"
                  placeholder="e.g. colorful gemstones collection Ceylon"
                />
              </div>
            </CardContent>
          </Card>

          {/* Publishing & URL Settings */}
          <Card className="bg-card border-border/80 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-headline font-bold text-foreground">
                Publication Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground flex items-center justify-between">
                  <span>URL Slug *</span>
                  {isDuplicateSlug && (
                    <span className="text-[10px] text-destructive font-bold">⚠️ Slug already exists!</span>
                  )}
                </label>
                <Input
                  required
                  value={articleSlug}
                  onChange={e => {
                    const sanitized = e.target.value
                      .toLowerCase()
                      .replace(/\s+/g, '-')
                      .replace(/[^a-z0-9-_]/g, '');
                    setArticleSlug(sanitized);
                  }}
                  className={`text-xs font-mono h-10 ${isDuplicateSlug ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  placeholder="e.g. guide-to-gem-mining"
                />
                {isDuplicateSlug ? (
                  <p className="text-[11px] text-destructive font-medium">This slug is already used by another article. Please change it.</p>
                ) : (
                  <p className="text-[10px] text-muted-foreground">https://sapphiretrails.lk/articles/{articleSlug}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Category</label>
                <Input
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="text-xs h-10"
                  placeholder="e.g. Gemology & Valuation"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Read Time</label>
                  <Input
                    value={readTime}
                    onChange={e => setReadTime(e.target.value)}
                    className="text-xs h-10"
                    placeholder="5 min read"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground flex items-center gap-1">
                    <CalendarDays className="h-3 w-3 text-primary" />
                    Published Date
                  </label>
                  <Input
                    type="date"
                    value={publishedDate}
                    onChange={e => setPublishedDate(e.target.value)}
                    onClick={(e) => {
                      try {
                        (e.currentTarget as HTMLInputElement).showPicker?.();
                      } catch {}
                    }}
                    className="text-xs h-10 [color-scheme:dark] cursor-pointer bg-background [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-90 [&::-webkit-calendar-picker-indicator]:hover:opacity-100"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Author Details with Curated Avatars Selector */}
          <Card className="bg-card border-border/80 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-headline font-bold text-foreground flex items-center gap-1.5">
                <User className="h-4 w-4 text-primary" />
                Author Profile
              </CardTitle>
              <CardDescription className="text-xs">
                Select an expert author or customize details below.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              
              {/* Preset Avatar Selection Grid */}
              <div className="space-y-2">
                <label className="font-semibold text-foreground">Select Author Profile:</label>
                <div className="grid grid-cols-3 gap-2.5">
                  {PRESET_AVATARS.map((preset) => {
                    const isSelected = authorAvatar === preset.url;
                    return (
                      <button
                        type="button"
                        key={preset.id}
                        onClick={() => handleSelectAvatar(preset)}
                        className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all text-center group ${isSelected ? 'border-primary bg-primary/[0.08] shadow-sm' : 'border-border/80 hover:border-primary/40 bg-background-alt/50'}`}
                      >
                        <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 transition-transform group-hover:scale-105" style={{ borderColor: isSelected ? 'hsl(var(--primary))' : 'hsl(var(--border))' }}>
                          <Image
                            src={preset.url}
                            alt={preset.name}
                            fill
                            className="object-cover"
                          />
                          {isSelected && (
                            <div className="absolute inset-0 bg-primary/40 backdrop-blur-[1px] flex items-center justify-center">
                              <Check className="h-4 w-4 text-white stroke-[3]" />
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] font-semibold text-foreground truncate w-full">
                          {preset.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Author Name and Role Fields */}
              <div className="space-y-1.5 pt-2 border-t border-border/60">
                <label className="font-semibold text-foreground">Author Full Name</label>
                <Input
                  value={authorName}
                  onChange={e => setAuthorName(e.target.value)}
                  className="text-xs h-10"
                  placeholder="Dr. Rohan Samarasinghe, FGA"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Author Title / Designation</label>
                <Input
                  value={authorRole}
                  onChange={e => setAuthorRole(e.target.value)}
                  className="text-xs h-10"
                  placeholder="Chief Gemological Consultant"
                />
              </div>

              {/* Active Profile Summary Pill */}
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-background-alt border border-border">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-primary/40 shrink-0">
                  <Image
                    src={authorAvatar}
                    alt={authorName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate">{authorName}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{authorRole}</p>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

      </form>

    </div>
  );
}
