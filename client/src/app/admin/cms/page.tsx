'use client';

import { useEffect, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  fetchSiteContent, 
  saveSiteContent, 
  defaultSiteContent, 
  type SiteContentData,
  SECTION_COLOR_THEMES,
  getSectionThemeClass,
  mergeProposalContent,
  uploadCmsImage
} from '@/lib/site-content';


import { 
  LoaderCircle, 
  Save, 
  RefreshCw, 
  Home, 
  Info, 
  Compass, 
  Heart, 
  MapPin, 
  BookOpen, 
  Phone, 
  Share2, 
  CheckCircle2, 
  ExternalLink,
  Sparkles,
  Smartphone,
  Monitor,
  CalendarCheck,
  Footprints,
  Download,
  Users,
  Award,
  ShieldCheck,
  Gem,
  Upload,
  Image as ImageIcon,
  History,
  HeartHandshake,
  Trees,
  Pickaxe,
  Waves,
  ArrowRight,
  ArrowLeft,
  Crown,
  FileCheck2,
  Building2,
  MessageSquare,
  HelpCircle,
  Eye,
  EyeOff,
  Palette,
  Clock,
  PackageSearch,
  Mail,
  Plus,
  Trash2
} from 'lucide-react';





import Link from 'next/link';
import Image from 'next/image';

const defaultStatsIcons = [Users, Award, ShieldCheck, Gem];
const defaultValuesIcons = [HeartHandshake, Trees, ShieldCheck, Award];
const defaultJourneyIcons = [Pickaxe, Waves, Sparkles, Gem];

const defaultPointsPerCard = [
  ['100% Government Licensed Pits (NGJA)', 'Direct artisan profit sharing', 'Strict zero child-labor policy'],
  ['Zero chemical mining methods', 'Paddy field & waterway preservation', 'Active tree replanting initiatives'],
  ['Safety helmets, harnesses & boots provided', 'Structural pit safety inspection', '24/7 Concierge & medical backup'],
  ['Independent laboratory testing', 'Conflict-free origin verification', 'Transparent valuation & pricing'],
];

function SectionToolbar({
  title,
  isActive = true,
  onToggleActive,
  currentTheme = 'default',
  onChangeTheme,
}: {
  title: string;
  isActive?: boolean;
  onToggleActive: (active: boolean) => void;
  currentTheme?: string;
  onChangeTheme: (theme: string) => void;
}) {
  return (
    <div className="p-3.5 rounded-2xl border border-border/80 bg-card flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-bold text-muted-foreground uppercase font-mono tracking-wider">
          Section Status:
        </span>
        <Button
          type="button"
          size="sm"
          variant={isActive ? "default" : "outline"}
          onClick={() => onToggleActive(!isActive)}
          className={`h-7 px-3 rounded-full text-xs font-semibold gap-1.5 transition-all ${
            isActive 
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs' 
              : 'border-rose-500/50 text-rose-500 hover:bg-rose-500/10'
          }`}
        >
          {isActive ? (
            <>
              <Eye className="h-3.5 w-3.5" />
              Active (Visible on Site)
            </>
          ) : (
            <>
              <EyeOff className="h-3.5 w-3.5" />
              Inactive (Hidden from Site)
            </>
          )}
        </Button>
      </div>

      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        <span className="text-[11px] font-bold text-muted-foreground uppercase font-mono tracking-wider flex items-center gap-1">
          <Palette className="h-3.5 w-3.5 text-primary" />
          Color Theme:
        </span>
        <select
          value={currentTheme || 'default'}
          onChange={(e) => onChangeTheme(e.target.value)}
          className="h-8 rounded-xl border border-border/80 bg-background px-2.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xs cursor-pointer"
        >
          {SECTION_COLOR_THEMES.map((theme) => (
            <option key={theme.id} value={theme.id}>
              {theme.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default function MasterCmsPage() {
  const { toast } = useToast();
  const [content, setContent] = useState<SiteContentData>(defaultSiteContent);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('homepage');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  
  // Section Selectors for Homepage, About Us & Proposal
  const [homeSection, setHomeSection] = useState<'hero' | 'stats' | 'journey' | 'discover' | 'tours' | 'reviews' | 'explore' | 'faq' | 'articles' | 'guide' | 'trust'>('hero');
  const [aboutSection, setAboutSection] = useState<'hero' | 'metrics' | 'story' | 'experience' | 'values' | 'journey' | 'whyRatnapura' | 'trustStrip' | 'cta'>('hero');
  const [proposalSection, setProposalSection] = useState<'hero' | 'overview' | 'pillars' | 'timeline' | 'faqs'>('hero');
  const [toursSection, setToursSection] = useState<'hero' | 'proposalCallout' | 'guarantees' | 'grid'>('hero');
  const [exploreSection, setExploreSection] = useState<'hero' | 'catalog' | 'intro' | 'locations'>('hero');
  const [articlesSection, setArticlesSection] = useState<'hero' | 'list' | 'library'>('hero');
  const [contactSection, setContactSection] = useState<'hero' | 'channels' | 'map' | 'faqs'>('hero');
  const [footerSection, setFooterSection] = useState<'brand' | 'columns' | 'partner' | 'socials' | 'bottom'>('brand');

  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
  const aboutJourneyFileRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
  const aboutExpFileRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
  const ourStoryFileRef = useRef<HTMLInputElement | null>(null);
  const ourStoryFileRef2 = useRef<HTMLInputElement | null>(null);
  const ourStoryFileRef3 = useRef<HTMLInputElement | null>(null);
  const whyRatnapuraFileRef = useRef<HTMLInputElement | null>(null);

  const aboutHeroFileRef = useRef<HTMLInputElement | null>(null);
  const proposalOverviewFileRef = useRef<HTMLInputElement | null>(null);
  const proposalPillarFileRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
  const toursHeroFileRef = useRef<HTMLInputElement | null>(null);
  const exploreHeroFileRef = useRef<HTMLInputElement | null>(null);
  const articlesHeroFileRef = useRef<HTMLInputElement | null>(null);
  const contactHeroFileRef = useRef<HTMLInputElement | null>(null);
  const footerBrandLogoRef = useRef<HTMLInputElement | null>(null);
  const footerPartnerLogoRef = useRef<HTMLInputElement | null>(null);






  const handleToggleHomeVisibility = (key: string, active: boolean) => {
    setContent((prev) => ({
      ...prev,
      homepage: {
        ...prev.homepage,
        sectionVisibility: {
          ...(prev.homepage.sectionVisibility || {}),
          [key]: active,
        },
      },
    }));
  };

  const handleSetHomeTheme = (key: string, theme: string) => {
    setContent((prev) => ({
      ...prev,
      homepage: {
        ...prev.homepage,
        sectionStyles: {
          ...(prev.homepage.sectionStyles || {}),
          [key]: theme,
        },
      },
    }));
  };

  const handleToggleAboutVisibility = (key: string, active: boolean) => {
    setContent((prev) => ({
      ...prev,
      about: {
        ...prev.about,
        sectionVisibility: {
          ...(prev.about.sectionVisibility || {}),
          [key]: active,
        },
      },
    }));
  };

  const handleSetAboutTheme = (key: string, theme: string) => {
    setContent((prev) => ({
      ...prev,
      about: {
        ...prev.about,
        sectionStyles: {
          ...(prev.about.sectionStyles || {}),
          [key]: theme,
        },
      },
    }));
  };

  const handleToggleProposalVisibility = (key: string, active: boolean) => {
    setContent((prev) => ({
      ...prev,
      proposal: {
        ...prev.proposal,
        sectionVisibility: {
          ...(prev.proposal.sectionVisibility || {}),
          [key]: active,
        },
      },
    }));
  };

  const handleSetProposalTheme = (key: string, theme: string) => {
    setContent((prev) => ({
      ...prev,
      proposal: {
        ...prev.proposal,
        sectionStyles: {
          ...(prev.proposal.sectionStyles || {}),
          [key]: theme,
        },
      },
    }));
  };

  const handleToggleToursVisibility = (key: string, active: boolean) => {

    setContent((prev) => ({
      ...prev,
      tours: {
        ...prev.tours,
        sectionVisibility: {
          ...(prev.tours.sectionVisibility || {}),
          [key]: active,
        },
      },
    }));
  };

  const handleSetToursTheme = (key: string, theme: string) => {
    setContent((prev) => ({
      ...prev,
      tours: {
        ...prev.tours,
        sectionStyles: {
          ...(prev.tours.sectionStyles || {}),
          [key]: theme,
        },
      },
    }));
  };

  const handleToursHeroImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    toast({
      title: 'Uploading to FTP...',
      description: `Uploading ${file.name} to FTP /cms/tours folder...`,
    });
    try {
      const res = await uploadCmsImage(file, 'cms/tours');
      setContent({
        ...content,
        tours: {
          ...content.tours,
          hero: {
            ...content.tours.hero,
            image: res.url,
          },
        },
      });
      toast({
        title: 'Tours Hero Image Uploaded!',
        description: `Permanent CDN URL: ${res.url}`,
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: err.message || 'Failed to upload to FTP server.',
      });
    }
  };

  const handleToggleExploreVisibility = (key: string, active: boolean) => {
    setContent((prev) => ({
      ...prev,
      explore: {
        ...prev.explore,
        sectionVisibility: {
          ...(prev.explore.sectionVisibility || {}),
          [key]: active,
        },
      },
    }));
  };

  const handleSetExploreTheme = (key: string, theme: string) => {
    setContent((prev) => ({
      ...prev,
      explore: {
        ...prev.explore,
        sectionStyles: {
          ...(prev.explore.sectionStyles || {}),
          [key]: theme,
        },
      },
    }));
  };

  const handleExploreHeroImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    toast({
      title: 'Uploading to FTP...',
      description: `Uploading ${file.name} to FTP /cms/explore folder...`,
    });
    try {
      const res = await uploadCmsImage(file, 'cms/explore');
      setContent({
        ...content,
        explore: {
          ...content.explore,
          hero: {
            ...content.explore.hero,
            image: res.url,
          },
        },
      });
      toast({
        title: 'Explore Hero Image Uploaded!',
        description: `Permanent CDN URL: ${res.url}`,
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: err.message || 'Failed to upload to FTP server.',
      });
    }
  };

  const handleToggleArticlesVisibility = (key: string, active: boolean) => {
    setContent((prev) => ({
      ...prev,
      articles: {
        ...prev.articles,
        sectionVisibility: {
          ...(prev.articles.sectionVisibility || {}),
          [key]: active,
        },
      },
    }));
  };

  const handleSetArticlesTheme = (key: string, theme: string) => {
    setContent((prev) => ({
      ...prev,
      articles: {
        ...prev.articles,
        sectionStyles: {
          ...(prev.articles.sectionStyles || {}),
          [key]: theme,
        },
      },
    }));
  };

  const handleArticlesHeroImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    toast({
      title: 'Uploading to FTP...',
      description: `Uploading ${file.name} to FTP /cms/articles folder...`,
    });
    try {
      const res = await uploadCmsImage(file, 'cms/articles');
      setContent({
        ...content,
        articles: {
          ...content.articles,
          hero: {
            ...content.articles.hero,
            image: res.url,
          },
        },
      });
      toast({
        title: 'Articles Hero Image Uploaded!',
        description: `Permanent CDN URL: ${res.url}`,
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: err.message || 'Failed to upload to FTP server.',
      });
    }
  };

  const handleToggleContactVisibility = (key: string, active: boolean) => {
    setContent((prev) => ({
      ...prev,
      contact: {
        ...prev.contact,
        sectionVisibility: {
          ...(prev.contact.sectionVisibility || {}),
          [key]: active,
        },
      },
    }));
  };

  const handleSetContactTheme = (key: string, theme: string) => {
    setContent((prev) => ({
      ...prev,
      contact: {
        ...prev.contact,
        sectionStyles: {
          ...(prev.contact.sectionStyles || {}),
          [key]: theme,
        },
      },
    }));
  };

  const handleContactHeroImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    toast({
      title: 'Uploading to FTP...',
      description: `Uploading ${file.name} to FTP /cms/contact folder...`,
    });
    try {
      const res = await uploadCmsImage(file, 'cms/contact');
      setContent({
        ...content,
        contact: {
          ...content.contact,
          hero: {
            ...content.contact.hero,
            image: res.url,
          },
        },
      });
      toast({
        title: 'Contact Hero Image Uploaded!',
        description: `Permanent CDN URL: ${res.url}`,
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: err.message || 'Failed to upload to FTP server.',
      });
    }
  };

  const handleAddContactFaq = () => {
    const currentFaqs = content.contact.faqs || defaultSiteContent.contact.faqs || [];
    setContent({
      ...content,
      contact: {
        ...content.contact,
        faqs: [
          ...currentFaqs,
          { question: 'New Question', answer: 'Provide clear and detailed answer here.' },
        ],
      },
    });
  };

  const handleRemoveContactFaq = (index: number) => {
    const currentFaqs = [...(content.contact.faqs || defaultSiteContent.contact.faqs || [])];
    currentFaqs.splice(index, 1);
    setContent({
      ...content,
      contact: {
        ...content.contact,
        faqs: currentFaqs,
      },
    });
  };

  const handleUpdateContactFaq = (index: number, field: 'question' | 'answer', value: string) => {
    const currentFaqs = [...(content.contact.faqs || defaultSiteContent.contact.faqs || [])];
    if (currentFaqs[index]) {
      currentFaqs[index] = { ...currentFaqs[index], [field]: value };
      setContent({
        ...content,
        contact: {
          ...content.contact,
          faqs: currentFaqs,
        },
      });
    }
  };

  const handleToggleFooterVisibility = (key: string, active: boolean) => {
    setContent((prev) => ({
      ...prev,
      footer: {
        ...prev.footer,
        sectionVisibility: {
          ...(prev.footer.sectionVisibility || {}),
          [key]: active,
        },
      },
    }));
  };

  const handleSetFooterTheme = (key: string, theme: string) => {
    setContent((prev) => ({
      ...prev,
      footer: {
        ...prev.footer,
        sectionStyles: {
          ...(prev.footer.sectionStyles || {}),
          [key]: theme,
        },
      },
    }));
  };

  const handleFooterBrandLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    toast({
      title: 'Uploading to FTP...',
      description: `Uploading ${file.name} to FTP /cms/footer folder...`,
    });
    try {
      const res = await uploadCmsImage(file, 'cms/footer');
      setContent({
        ...content,
        footer: {
          ...content.footer,
          brandLogo: res.url,
        },
      });
      toast({
        title: 'Brand Logo Uploaded!',
        description: `Permanent CDN URL: ${res.url}`,
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: err.message || 'Failed to upload to FTP server.',
      });
    }
  };

  const handleFooterPartnerLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    toast({
      title: 'Uploading to FTP...',
      description: `Uploading ${file.name} to FTP /cms/footer folder...`,
    });
    try {
      const res = await uploadCmsImage(file, 'cms/footer');
      setContent({
        ...content,
        footer: {
          ...content.footer,
          partnerLogo: res.url,
        },
      });
      toast({
        title: 'Partner Logo Uploaded!',
        description: `Permanent CDN URL: ${res.url}`,
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: err.message || 'Failed to upload to FTP server.',
      });
    }
  };










  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const data = await fetchSiteContent();
        setContent({
          ...data,
          proposal: mergeProposalContent(data.proposal),
        });
      } catch (e) {
        console.error('Error loading site content', e);
        toast({
          variant: 'destructive',
          title: 'Error loading CMS',
          description: 'Using cached or default content.',
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [toast]);


  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const res = await saveSiteContent(content);
      if (res.success) {
        toast({
          title: 'Content Published Live!',
          description: 'All website text, images, and settings have been updated across the live website.',
        });
      } else {
        throw new Error(res.message);
      }
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: err instanceof Error ? err.message : 'Could not save changes.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefault = () => {
    if (confirm('Are you sure you want to reset all content to system defaults?')) {
      setContent(defaultSiteContent);
      toast({
        title: 'Reset to Defaults',
        description: 'Click "Save All Changes" to commit the default content.',
      });
    }
  };

  const handleAboutJourneyImageChange = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    toast({
      title: 'Uploading to FTP...',
      description: `Uploading ${file.name} to FTP /cms/about/journey folder...`,
    });
    try {
      const res = await uploadCmsImage(file, 'cms/about/journey');
      const newSteps = [...content.about.gemJourney.steps];
      if (newSteps[index]) {
        newSteps[index].image = res.url;
        setContent({
          ...content,
          about: {
            ...content.about,
            gemJourney: {
              ...content.about.gemJourney,
              steps: newSteps,
            },
          },
        });
        toast({
          title: `Journey Stage #${index + 1} Uploaded!`,
          description: `Permanent CDN URL: ${res.url}`,
        });
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: err.message || 'Failed to upload to FTP server.',
      });
    }
  };

  const handleAboutExpImageChange = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    toast({
      title: 'Uploading to FTP...',
      description: `Uploading ${file.name} to FTP /cms/about/experience folder...`,
    });
    try {
      const res = await uploadCmsImage(file, 'cms/about/experience');
      const newItems = [...content.about.experience.items];
      if (newItems[index]) {
        newItems[index].image = res.url;
        setContent({
          ...content,
          about: {
            ...content.about,
            experience: {
              ...content.about.experience,
              items: newItems,
            },
          },
        });
        toast({
          title: `Experience Card #${index + 1} Uploaded!`,
          description: `Permanent CDN URL: ${res.url}`,
        });
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: err.message || 'Failed to upload to FTP server.',
      });
    }
  };

  const handleOurStoryImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    toast({
      title: 'Uploading to FTP...',
      description: `Uploading ${file.name} to FTP /cms/about/story folder...`,
    });
    try {
      const res = await uploadCmsImage(file, 'cms/about/story');
      setContent({
        ...content,
        about: {
          ...content.about,
          story: {
            ...content.about.story,
            image: res.url,
          },
        },
      });
      toast({
        title: 'Main Story Image Uploaded!',
        description: `Permanent CDN URL: ${res.url}`,
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: err.message || 'Failed to upload to FTP server.',
      });
    }
  };

  const handleOurStoryImageChange2 = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    toast({
      title: 'Uploading to FTP...',
      description: `Uploading ${file.name} to FTP /cms/about/story folder...`,
    });
    try {
      const res = await uploadCmsImage(file, 'cms/about/story');
      setContent({
        ...content,
        about: {
          ...content.about,
          story: {
            ...content.about.story,
            image2: res.url,
          },
        },
      });
      toast({
        title: 'Sub-Photo 1 Uploaded!',
        description: `Permanent CDN URL: ${res.url}`,
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: err.message || 'Failed to upload to FTP server.',
      });
    }
  };

  const handleOurStoryImageChange3 = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    toast({
      title: 'Uploading to FTP...',
      description: `Uploading ${file.name} to FTP /cms/about/story folder...`,
    });
    try {
      const res = await uploadCmsImage(file, 'cms/about/story');
      setContent({
        ...content,
        about: {
          ...content.about,
          story: {
            ...content.about.story,
            image3: res.url,
          },
        },
      });
      toast({
        title: 'Sub-Photo 2 Uploaded!',
        description: `Permanent CDN URL: ${res.url}`,
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: err.message || 'Failed to upload to FTP server.',
      });
    }
  };


  const handleWhyRatnapuraImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    toast({
      title: 'Uploading to FTP...',
      description: `Uploading ${file.name} to FTP /cms/about folder...`,
    });
    try {
      const res = await uploadCmsImage(file, 'cms/about');
      setContent({
        ...content,
        about: {
          ...content.about,
          whyRatnapura: {
            ...content.about.whyRatnapura,
            image: res.url,
          },
        },
      });
      toast({
        title: 'Why Ratnapura Image Uploaded!',
        description: `Permanent CDN URL: ${res.url}`,
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: err.message || 'Failed to upload to FTP server.',
      });
    }
  };

  const handleAboutHeroImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    toast({
      title: 'Uploading to FTP...',
      description: `Uploading ${file.name} to FTP /cms/about folder...`,
    });
    try {
      const res = await uploadCmsImage(file, 'cms/about');
      setContent({
        ...content,
        about: {
          ...content.about,
          hero: {
            ...content.about.hero,
            image: res.url,
          },
        },
      });
      toast({
        title: 'About Hero Image Uploaded!',
        description: `Permanent CDN URL: ${res.url}`,
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: err.message || 'Failed to upload to FTP server.',
      });
    }
  };



  const handleImageFileChange = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    toast({
      title: 'Uploading to FTP...',
      description: `Uploading ${file.name} to FTP /cms/homepage/discover folder...`,
    });
    try {
      const res = await uploadCmsImage(file, 'cms/homepage/discover');
      const newImages = [...content.homepage.discover.images];
      if (newImages[index]) {
        newImages[index].src = res.url;
        setContent({
          ...content,
          homepage: {
            ...content.homepage,
            discover: {
              ...content.homepage.discover,
              images: newImages,
            },
          },
        });
        toast({
          title: `Photo #${index + 1} Uploaded to FTP!`,
          description: `Permanent CDN URL: ${res.url}`,
        });
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: err.message || 'Failed to upload to FTP server.',
      });
    }
  };


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <LoaderCircle className="h-10 w-10 text-primary animate-spin" />
        <p className="text-sm font-medium text-muted-foreground">Loading Master CMS Hub...</p>
      </div>
    );
  }

  const hp = content.homepage;
  const hero = hp.hero;
  const ab = content.about;

  return (
    <div className="w-full space-y-6 pb-24">
      
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-card border border-border/80 shadow-xs w-full">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-semibold uppercase tracking-wider">
            <Sparkles className="h-3 w-3" />
            <span>Master Content Management System</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-headline text-foreground">
            Section-by-Section Live Studio
          </h1>
          <p className="text-xs text-muted-foreground">
            Select a page, choose a specific section below, edit text &amp; images on the left, and watch the instant live preview.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetToDefault}
            className="rounded-xl text-xs gap-1.5 border-border h-9"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset
          </Button>

          <Button
            type="button"
            onClick={() => handleSave()}
            disabled={isSaving}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl text-xs h-9 px-6 gap-2 shadow-md"
          >
            {isSaving ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{isSaving ? 'Publishing...' : 'Save All Changes'}</span>
          </Button>
        </div>
      </div>

      {/* 1. Page Selection Tabs (Fixed at the Top) */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-5">
        <div className="bg-card p-1 rounded-2xl border border-border/80 shadow-xs w-full">
          <TabsList className="bg-transparent h-auto p-0 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1 w-full">
            <TabsTrigger value="homepage" className="rounded-xl py-2 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5 justify-center">
              <Home className="h-3.5 w-3.5" /> Homepage
            </TabsTrigger>
            <TabsTrigger value="about" className="rounded-xl py-2 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5 justify-center">
              <Info className="h-3.5 w-3.5" /> About Us
            </TabsTrigger>
            <TabsTrigger value="tours" className="rounded-xl py-2 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5 justify-center">
              <Compass className="h-3.5 w-3.5" /> Tours
            </TabsTrigger>
            <TabsTrigger value="proposal" className="rounded-xl py-2 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5 justify-center">
              <Heart className="h-3.5 w-3.5" /> Proposal
            </TabsTrigger>
            <TabsTrigger value="explore" className="rounded-xl py-2 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5 justify-center">
              <MapPin className="h-3.5 w-3.5" /> Explore
            </TabsTrigger>
            <TabsTrigger value="articles" className="rounded-xl py-2 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5 justify-center">
              <BookOpen className="h-3.5 w-3.5" /> Articles
            </TabsTrigger>
            <TabsTrigger value="contact" className="rounded-xl py-2 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5 justify-center">
              <Phone className="h-3.5 w-3.5" /> Contact
            </TabsTrigger>
            <TabsTrigger value="footer" className="rounded-xl py-2 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5 justify-center">
              <Share2 className="h-3.5 w-3.5" /> Footer
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ========================================================================= */}
        {/* 1. HOMEPAGE TAB WITH SUB-SECTION SELECTOR */}
        {/* ========================================================================= */}
        <TabsContent value="homepage" className="w-full space-y-4">
          
          {/* Homepage Sub-Section Navigation Pills - 11 Sections */}
          <div className="flex items-center gap-1.5 p-1.5 bg-muted/40 rounded-2xl border border-border/60 overflow-x-auto [scrollbar-width:none]">
            <span className="text-[11px] font-bold text-muted-foreground px-3 shrink-0 uppercase tracking-wider font-mono">
              Sections:
            </span>
            <Button
              type="button"
              variant={homeSection === 'hero' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setHomeSection('hero')}
              className="h-8 rounded-xl text-xs shrink-0 gap-1.5 font-semibold"
            >
              <Sparkles className="h-3.5 w-3.5" /> 1. Hero
            </Button>
            <Button
              type="button"
              variant={homeSection === 'stats' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setHomeSection('stats')}
              className="h-8 rounded-xl text-xs shrink-0 gap-1.5 font-semibold"
            >
              <Award className="h-3.5 w-3.5" /> 2. Stats
            </Button>
            <Button
              type="button"
              variant={homeSection === 'journey' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setHomeSection('journey')}
              className="h-8 rounded-xl text-xs shrink-0 gap-1.5 font-semibold"
            >
              <Footprints className="h-3.5 w-3.5" /> 3. 4-Step Journey
            </Button>
            <Button
              type="button"
              variant={homeSection === 'discover' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setHomeSection('discover')}
              className="h-8 rounded-xl text-xs shrink-0 gap-1.5 font-semibold"
            >
              <Gem className="h-3.5 w-3.5" /> 4. 8-Photo Mosaic
            </Button>
            <Button
              type="button"
              variant={homeSection === 'tours' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setHomeSection('tours')}
              className="h-8 rounded-xl text-xs shrink-0 gap-1.5 font-semibold"
            >
              <Compass className="h-3.5 w-3.5" /> 5. Tours
            </Button>
            <Button
              type="button"
              variant={homeSection === 'reviews' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setHomeSection('reviews')}
              className="h-8 rounded-xl text-xs shrink-0 gap-1.5 font-semibold"
            >
              <Users className="h-3.5 w-3.5" /> 6. Reviews
            </Button>
            <Button
              type="button"
              variant={homeSection === 'explore' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setHomeSection('explore')}
              className="h-8 rounded-xl text-xs shrink-0 gap-1.5 font-semibold"
            >
              <MapPin className="h-3.5 w-3.5" /> 7. Explore
            </Button>
            <Button
              type="button"
              variant={homeSection === 'faq' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setHomeSection('faq')}
              className="h-8 rounded-xl text-xs shrink-0 gap-1.5 font-semibold"
            >
              <HelpCircle className="h-3.5 w-3.5" /> 8. FAQ
            </Button>
            <Button
              type="button"
              variant={homeSection === 'articles' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setHomeSection('articles')}
              className="h-8 rounded-xl text-xs shrink-0 gap-1.5 font-semibold"
            >
              <BookOpen className="h-3.5 w-3.5" /> 9. Field Journal
            </Button>
            <Button
              type="button"
              variant={homeSection === 'guide' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setHomeSection('guide')}
              className="h-8 rounded-xl text-xs shrink-0 gap-1.5 font-semibold"
            >
              <Download className="h-3.5 w-3.5" /> 10. Gem Guide
            </Button>
            <Button
              type="button"
              variant={homeSection === 'trust' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setHomeSection('trust')}
              className="h-8 rounded-xl text-xs shrink-0 gap-1.5 font-semibold"
            >
              <ShieldCheck className="h-3.5 w-3.5" /> 11. Trust Badges
            </Button>
          </div>


          {/* Focused Split Screen: Left Editor (6 cols) | Right Live Preview (6 cols) */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            
            {/* LEFT 6 COLS: FOCUSED SECTION EDITOR */}
            <div className="xl:col-span-6 space-y-4">
              
              {/* Universal Section Visibility & Background Theme Toolbar */}
              <SectionToolbar
                title="Selected Section"
                isActive={content.homepage.sectionVisibility?.[homeSection] !== false}
                onToggleActive={(active) => handleToggleHomeVisibility(homeSection, active)}
                currentTheme={content.homepage.sectionStyles?.[homeSection] || 'default'}
                onChangeTheme={(theme) => handleSetHomeTheme(homeSection, theme)}
              />

              {/* Section 1: Hero */}
              {homeSection === 'hero' && (

                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Hero Cinematic Banner
                    </CardTitle>
                    <CardDescription>
                      Configure top pill badge, 2-line headline typography, sub-headline, and CTA buttons.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Top Pill Tagline</Label>
                      <Input
                        value={hero.tagline}
                        placeholder="THE OFFICIAL SRI LANKA GEM MINE TOUR • RATNAPURA"
                        onChange={(e) => setContent({
                          ...content,
                          homepage: {
                            ...content.homepage,
                            hero: { ...content.homepage.hero, tagline: e.target.value }
                          }
                        })}
                      />
                    </div>

                    <div className="space-y-3 p-3.5 rounded-xl border border-primary/20 bg-primary/5">
                      <span className="text-xs font-bold text-primary">2-Line Structured Headline</span>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-foreground">Line 1 (Bold White Text)</Label>
                        <Input
                          value={hero.headlineLine1}
                          placeholder="Sri Lanka Gem Mine Tour"
                          className="font-bold bg-background"
                          onChange={(e) => setContent({
                            ...content,
                            homepage: {
                              ...content.homepage,
                              hero: { ...content.homepage.hero, headlineLine1: e.target.value }
                            }
                          })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-primary">Line 2 (Gold Luxury Serif Accent)</Label>
                        <Input
                          value={hero.headlineLine2}
                          placeholder="AN EXCLUSIVE LUXURY EXPERIENCE"
                          className="font-serif text-primary bg-background uppercase tracking-wider"
                          onChange={(e) => setContent({
                            ...content,
                            homepage: {
                              ...content.homepage,
                              hero: { ...content.homepage.hero, headlineLine2: e.target.value }
                            }
                          })}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Hero Sub-headline Narrative</Label>
                      <Textarea
                        rows={3}
                        value={hero.subheadline}
                        onChange={(e) => setContent({
                          ...content,
                          homepage: {
                            ...content.homepage,
                            hero: { ...content.homepage.hero, subheadline: e.target.value }
                          }
                        })}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Primary Button Text</Label>
                        <Input
                          value={hero.ctaPrimaryText}
                          onChange={(e) => setContent({
                            ...content,
                            homepage: {
                              ...content.homepage,
                              hero: { ...content.homepage.hero, ctaPrimaryText: e.target.value }
                            }
                          })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Secondary Button Text</Label>
                        <Input
                          value={hero.ctaSecondaryText}
                          onChange={(e) => setContent({
                            ...content,
                            homepage: {
                              ...content.homepage,
                              hero: { ...content.homepage.hero, ctaSecondaryText: e.target.value }
                            }
                          })}
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Button type="button" size="sm" onClick={() => setHomeSection('stats')} className="text-xs gap-1.5">
                        Next: Heritage Stats <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Section 2: Stats */}
              {homeSection === 'stats' && (
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                      <Award className="h-4 w-4 text-primary" />
                      Heritage Numbers &amp; Authority Stats
                    </CardTitle>
                    <CardDescription>4 counter cards highlighting happy guests, years of heritage, and safety.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {hp.stats.map((stat, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl border bg-muted/20 space-y-2">
                          <Badge variant="outline" className="text-[10px]">Stat #{idx + 1}</Badge>
                          <div className="space-y-1">
                            <Label className="text-xs">Counter Value</Label>
                            <Input
                              value={stat.value}
                              onChange={(e) => {
                                const newStats = [...hp.stats];
                                newStats[idx].value = e.target.value;
                                setContent({ ...content, homepage: { ...content.homepage, stats: newStats } });
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Label Text</Label>
                            <Input
                              value={stat.label}
                              onChange={(e) => {
                                const newStats = [...hp.stats];
                                newStats[idx].label = e.target.value;
                                setContent({ ...content, homepage: { ...content.homepage, stats: newStats } });
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 flex justify-between">
                      <Button type="button" variant="outline" size="sm" onClick={() => setHomeSection('hero')} className="text-xs gap-1.5">
                        <ArrowLeft className="h-3.5 w-3.5" /> Hero Banner
                      </Button>
                      <Button type="button" size="sm" onClick={() => setHomeSection('journey')} className="text-xs gap-1.5">
                        Next: 4-Step Journey <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Section 3: 4-Step Journey */}
              {homeSection === 'journey' && (
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                      <Footprints className="h-4 w-4 text-primary" />
                      Signature 4-Step Expedition Journey
                    </CardTitle>
                    <CardDescription>Titles and descriptions for the 4 stages of the gemological trail.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Section Tagline</Label>
                        <Input
                          value={hp.journey.tagline}
                          onChange={(e) => setContent({ ...content, homepage: { ...content.homepage, journey: { ...content.homepage.journey, tagline: e.target.value } } })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Section Heading</Label>
                        <Input
                          value={hp.journey.heading}
                          onChange={(e) => setContent({ ...content, homepage: { ...content.homepage, journey: { ...content.homepage.journey, heading: e.target.value } } })}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Section Subtitle</Label>
                      <Textarea
                        rows={2}
                        value={hp.journey.subtitle}
                        onChange={(e) => setContent({ ...content, homepage: { ...content.homepage, journey: { ...content.homepage.journey, subtitle: e.target.value } } })}
                      />
                    </div>

                    <div className="space-y-3 pt-1">
                      {hp.journey.steps.map((step, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl border bg-muted/20 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-primary">Step {step.step || `0${idx + 1}`}</span>
                            <span className="text-[10px] text-muted-foreground">{step.subtitle}</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <Label className="text-[11px]">Title</Label>
                              <Input
                                value={step.title}
                                className="text-xs h-8"
                                onChange={(e) => {
                                  const newSteps = [...hp.journey.steps];
                                  newSteps[idx].title = e.target.value;
                                  setContent({ ...content, homepage: { ...content.homepage, journey: { ...content.homepage.journey, steps: newSteps } } });
                                }}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[11px]">Subtitle</Label>
                              <Input
                                value={step.subtitle}
                                className="text-xs h-8"
                                onChange={(e) => {
                                  const newSteps = [...hp.journey.steps];
                                  newSteps[idx].subtitle = e.target.value;
                                  setContent({ ...content, homepage: { ...content.homepage, journey: { ...content.homepage.journey, steps: newSteps } } });
                                }}
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[11px]">Description</Label>
                            <Textarea
                              rows={2}
                              value={step.description}
                              className="text-xs"
                              onChange={(e) => {
                                const newSteps = [...hp.journey.steps];
                                newSteps[idx].description = e.target.value;
                                setContent({ ...content, homepage: { ...content.homepage, journey: { ...content.homepage.journey, steps: newSteps } } });
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 flex justify-between">
                      <Button type="button" variant="outline" size="sm" onClick={() => setHomeSection('stats')} className="text-xs gap-1.5">
                        <ArrowLeft className="h-3.5 w-3.5" /> Stats Numbers
                      </Button>
                      <Button type="button" size="sm" onClick={() => setHomeSection('discover')} className="text-xs gap-1.5">
                        Next: 8-Photo Mosaic <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Section 4: Discover 8-Photo Mosaic */}
              {homeSection === 'discover' && (
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                      <Gem className="h-4 w-4 text-primary" />
                      Discover Section &amp; 8-Photo Mosaic Gallery
                    </CardTitle>
                    <CardDescription>Story narrative paragraph and direct image upload for all 8 mosaic photos.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3 p-3.5 rounded-xl border bg-muted/20">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Heading Title</Label>
                        <Input
                          value={hp.discover.heading}
                          onChange={(e) => setContent({ ...content, homepage: { ...content.homepage, discover: { ...content.homepage.discover, heading: e.target.value } } })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Story Description</Label>
                        <Textarea
                          rows={3}
                          value={hp.discover.description}
                          onChange={(e) => setContent({ ...content, homepage: { ...content.homepage, discover: { ...content.homepage.discover, description: e.target.value } } })}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold text-primary flex items-center gap-1.5">
                          <ImageIcon className="h-4 w-4" /> 8 Mosaic Gallery Photos
                        </Label>
                        <span className="text-[10px] text-muted-foreground">Click 'Change Photo' to upload from PC</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {hp.discover.images.map((img, idx) => (
                          <div key={idx} className="p-3 rounded-xl border bg-card space-y-2.5 shadow-xs">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-[10px] font-semibold text-primary">
                                Photo #{idx + 1}
                              </Badge>
                              <span className="text-[9px] text-muted-foreground font-mono">{img.hint}</span>
                            </div>

                            <div className="flex items-center gap-2.5">
                              <div className="relative w-16 h-14 rounded-lg overflow-hidden border border-border bg-slate-900 shrink-0">
                                <Image src={img.src} alt={img.alt || `Photo ${idx + 1}`} fill className="object-cover" />
                              </div>

                              <div className="space-y-1 flex-1">
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  className="hidden" 
                                  ref={(el) => { fileInputRefs.current[idx] = el; }}
                                  onChange={(e) => handleImageFileChange(idx, e)}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => fileInputRefs.current[idx]?.click()}
                                  className="w-full text-xs h-7 gap-1 border-dashed border-primary/40 hover:border-primary hover:bg-primary/5"
                                >
                                  <Upload className="h-3 w-3 text-primary" />
                                  <span>Change Photo</span>
                                </Button>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <Label className="text-[10px] text-muted-foreground">Hover Description</Label>
                              <Textarea
                                rows={2}
                                value={img.hoverDescription}
                                className="text-xs"
                                onChange={(e) => {
                                  const newImages = [...hp.discover.images];
                                  newImages[idx].hoverDescription = e.target.value;
                                  setContent({ ...content, homepage: { ...content.homepage, discover: { ...content.homepage.discover, images: newImages } } });
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 flex justify-between">
                      <Button type="button" variant="outline" size="sm" onClick={() => setHomeSection('journey')} className="text-xs gap-1.5">
                        <ArrowLeft className="h-3.5 w-3.5" /> 4-Step Journey
                      </Button>
                      <Button type="button" size="sm" onClick={() => setHomeSection('headers')} className="text-xs gap-1.5">
                        Next: Section Headers <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Section 5: Curated Tours */}
              {homeSection === 'tours' && (
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                      <Compass className="h-4 w-4 text-primary" />
                      5. Curated Tours &amp; Proposal Spotlight
                    </CardTitle>
                    <CardDescription>Configure the tours catalog header and the custom engagement ring spotlight banner.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {/* Part A: Catalog Header */}
                    <div className="space-y-3.5 pb-4 border-b border-border/60">
                      <span className="text-xs font-bold text-primary uppercase font-mono tracking-wider">
                        A. Tours Catalog Section Header
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs font-semibold">Pill Tagline</Label>
                          <Input
                            value={hp.toursHeader.tagline}
                            placeholder="Curated Expeditions"
                            onChange={(e) => setContent({ ...content, homepage: { ...content.homepage, toursHeader: { ...content.homepage.toursHeader, tagline: e.target.value } } })}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-semibold">Main Heading</Label>
                          <Input
                            value={hp.toursHeader.heading}
                            onChange={(e) => setContent({ ...content, homepage: { ...content.homepage, toursHeader: { ...content.homepage.toursHeader, heading: e.target.value } } })}
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Subtitle Description</Label>
                        <Textarea
                          rows={2}
                          value={hp.toursHeader.subtitle}
                          onChange={(e) => setContent({ ...content, homepage: { ...content.homepage, toursHeader: { ...content.homepage.toursHeader, subtitle: e.target.value } } })}
                        />
                      </div>
                    </div>

                    {/* Part B: Spotlight Banner (Engagement Ring) */}
                    <div className="space-y-3.5">
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />
                        <span className="text-xs font-bold text-rose-500 uppercase font-mono tracking-wider">
                          B. Custom Proposal &amp; Engagement Ring Spotlight Banner
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs font-semibold">Pill Badge</Label>
                          <Input
                            value={content.tours.proposalCallout?.badge || ''}
                            placeholder="Once in a Lifetime"
                            onChange={(e) => setContent({
                              ...content,
                              tours: {
                                ...content.tours,
                                proposalCallout: {
                                  ...content.tours.proposalCallout,
                                  badge: e.target.value
                                }
                              }
                            })}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-semibold">Banner Heading</Label>
                          <Input
                            value={content.tours.proposalCallout?.title || ''}
                            placeholder="Design Your Custom Engagement Ring in the Mines of Ceylon"
                            onChange={(e) => setContent({
                              ...content,
                              tours: {
                                ...content.tours,
                                proposalCallout: {
                                  ...content.tours.proposalCallout,
                                  title: e.target.value
                                }
                              }
                            })}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Banner Narrative Description</Label>
                        <Textarea
                          rows={3}
                          value={content.tours.proposalCallout?.description || ''}
                          placeholder="Find your own rough sapphire straight from the earth, watch our master lapidaries precision-cut your gem, and craft a bespoke engagement ring with our master jewelers."
                          onChange={(e) => setContent({
                            ...content,
                            tours: {
                              ...content.tours,
                              proposalCallout: {
                                ...content.tours.proposalCallout,
                                description: e.target.value
                              }
                            }
                          })}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs font-semibold">Primary Button Label</Label>
                          <Input
                            value={content.tours.proposalCallout?.primaryButtonText || 'Explore Proposal Package'}
                            onChange={(e) => setContent({
                              ...content,
                              tours: {
                                ...content.tours,
                                proposalCallout: {
                                  ...content.tours.proposalCallout,
                                  primaryButtonText: e.target.value
                                }
                              }
                            })}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-semibold">Secondary Button Label</Label>
                          <Input
                            value={content.tours.proposalCallout?.secondaryButtonText || 'Inquire with Concierge'}
                            onChange={(e) => setContent({
                              ...content,
                              tours: {
                                ...content.tours,
                                proposalCallout: {
                                  ...content.tours.proposalCallout,
                                  secondaryButtonText: e.target.value
                                }
                              }
                            })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-between">
                      <Button type="button" variant="outline" size="sm" onClick={() => setHomeSection('discover')} className="text-xs gap-1.5">
                        <ArrowLeft className="h-3.5 w-3.5" /> 8-Photo Mosaic
                      </Button>
                      <Button type="button" size="sm" onClick={() => setHomeSection('reviews')} className="text-xs gap-1.5">
                        Next: Verified Reviews <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}


              {/* Section 6: Verified Reviews */}
              {homeSection === 'reviews' && (
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      6. Verified Traveler Reviews Header
                    </CardTitle>
                    <CardDescription>Pill tagline, main headline, and subtitle for guest testimonials.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Pill Tagline</Label>
                        <Input
                          value={hp.reviewsHeader.tagline}
                          placeholder="Verified Traveler Experiences"
                          onChange={(e) => setContent({ ...content, homepage: { ...content.homepage, reviewsHeader: { ...content.homepage.reviewsHeader, tagline: e.target.value } } })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Main Heading</Label>
                        <Input
                          value={hp.reviewsHeader.heading}
                          onChange={(e) => setContent({ ...content, homepage: { ...content.homepage, reviewsHeader: { ...content.homepage.reviewsHeader, heading: e.target.value } } })}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Subtitle Description</Label>
                      <Textarea
                        rows={3}
                        value={hp.reviewsHeader.subtitle}
                        onChange={(e) => setContent({ ...content, homepage: { ...content.homepage, reviewsHeader: { ...content.homepage.reviewsHeader, subtitle: e.target.value } } })}
                      />
                    </div>
                    <div className="pt-2 flex justify-between">
                      <Button type="button" variant="outline" size="sm" onClick={() => setHomeSection('tours')} className="text-xs gap-1.5">
                        <ArrowLeft className="h-3.5 w-3.5" /> Curated Tours
                      </Button>
                      <Button type="button" size="sm" onClick={() => setHomeSection('explore')} className="text-xs gap-1.5">
                        Next: Explore Ratnapura <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Section 7: Explore Ratnapura */}
              {homeSection === 'explore' && (
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      7. Explore Ratnapura Header
                    </CardTitle>
                    <CardDescription>Headlines and lore for regional attractions (Rainforest, Waterfalls, Safaris).</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Pill Tagline</Label>
                        <Input
                          value={hp.exploreHeader.tagline}
                          placeholder="Regional Wonders"
                          onChange={(e) => setContent({ ...content, homepage: { ...content.homepage, exploreHeader: { ...content.homepage.exploreHeader, tagline: e.target.value } } })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Main Heading</Label>
                        <Input
                          value={hp.exploreHeader.heading}
                          onChange={(e) => setContent({ ...content, homepage: { ...content.homepage, exploreHeader: { ...content.homepage.exploreHeader, heading: e.target.value } } })}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Subtitle Description</Label>
                      <Textarea
                        rows={3}
                        value={hp.exploreHeader.subtitle}
                        onChange={(e) => setContent({ ...content, homepage: { ...content.homepage, exploreHeader: { ...content.homepage.exploreHeader, subtitle: e.target.value } } })}
                      />
                    </div>
                    <div className="pt-2 flex justify-between">
                      <Button type="button" variant="outline" size="sm" onClick={() => setHomeSection('reviews')} className="text-xs gap-1.5">
                        <ArrowLeft className="h-3.5 w-3.5" /> Verified Reviews
                      </Button>
                      <Button type="button" size="sm" onClick={() => setHomeSection('faq')} className="text-xs gap-1.5">
                        Next: FAQ Accordion <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Section 8: FAQ Accordion */}
              {homeSection === 'faq' && (
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-primary" />
                      8. Frequently Asked Questions Header
                    </CardTitle>
                    <CardDescription>Pill tagline, main headline, and subtitle for the interactive FAQ accordion.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Pill Tagline</Label>
                        <Input
                          value={hp.faqHeader.tagline}
                          placeholder="Traveler Inquiries"
                          onChange={(e) => setContent({ ...content, homepage: { ...content.homepage, faqHeader: { ...content.homepage.faqHeader, tagline: e.target.value } } })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Main Heading</Label>
                        <Input
                          value={hp.faqHeader.heading}
                          onChange={(e) => setContent({ ...content, homepage: { ...content.homepage, faqHeader: { ...content.homepage.faqHeader, heading: e.target.value } } })}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Subtitle Description</Label>
                      <Textarea
                        rows={3}
                        value={hp.faqHeader.subtitle}
                        onChange={(e) => setContent({ ...content, homepage: { ...content.homepage, faqHeader: { ...content.homepage.faqHeader, subtitle: e.target.value } } })}
                      />
                    </div>
                    <div className="pt-2 flex justify-between">
                      <Button type="button" variant="outline" size="sm" onClick={() => setHomeSection('explore')} className="text-xs gap-1.5">
                        <ArrowLeft className="h-3.5 w-3.5" /> Explore Ratnapura
                      </Button>
                      <Button type="button" size="sm" onClick={() => setHomeSection('articles')} className="text-xs gap-1.5">
                        Next: Field Journal <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Section 9: Field Journal & Articles */}
              {homeSection === 'articles' && (
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-primary" />
                      9. Stories from the Mines (Articles Header)
                    </CardTitle>
                    <CardDescription>Tagline, heading, and intro description for the field journal articles section.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Pill Tagline</Label>
                        <Input
                          value={hp.articlesHeader.tagline}
                          placeholder="Field Journal & Gemology Insights"
                          onChange={(e) => setContent({ ...content, homepage: { ...content.homepage, articlesHeader: { ...content.homepage.articlesHeader, tagline: e.target.value } } })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Main Heading</Label>
                        <Input
                          value={hp.articlesHeader.heading}
                          onChange={(e) => setContent({ ...content, homepage: { ...content.homepage, articlesHeader: { ...content.homepage.articlesHeader, heading: e.target.value } } })}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Subtitle Description</Label>
                      <Textarea
                        rows={3}
                        value={hp.articlesHeader.subtitle}
                        onChange={(e) => setContent({ ...content, homepage: { ...content.homepage, articlesHeader: { ...content.homepage.articlesHeader, subtitle: e.target.value } } })}
                      />
                    </div>
                    <div className="pt-2 flex justify-between">
                      <Button type="button" variant="outline" size="sm" onClick={() => setHomeSection('faq')} className="text-xs gap-1.5">
                        <ArrowLeft className="h-3.5 w-3.5" /> FAQ Accordion
                      </Button>
                      <Button type="button" size="sm" onClick={() => setHomeSection('guide')} className="text-xs gap-1.5">
                        Next: Gem Guide <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Section 10: Lead Magnet Guide */}
              {homeSection === 'guide' && (
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                      <Download className="h-4 w-4 text-primary" />
                      10. Complimentary 2026 Gem Guide Banner
                    </CardTitle>
                    <CardDescription>Newsletter / 30-page field guide download lead magnet box.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Tagline Badge</Label>
                        <Input
                          value={hp.subscription.tagline}
                          onChange={(e) => setContent({ ...content, homepage: { ...content.homepage, subscription: { ...content.homepage.subscription, tagline: e.target.value } } })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Main Heading</Label>
                        <Input
                          value={hp.subscription.heading}
                          onChange={(e) => setContent({ ...content, homepage: { ...content.homepage, subscription: { ...content.homepage.subscription, heading: e.target.value } } })}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Sub-headline Narrative</Label>
                      <Textarea
                        rows={2}
                        value={hp.subscription.subheadline}
                        onChange={(e) => setContent({ ...content, homepage: { ...content.homepage, subscription: { ...content.homepage.subscription, subheadline: e.target.value } } })}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Button Label</Label>
                      <Input
                        value={hp.subscription.buttonText}
                        onChange={(e) => setContent({ ...content, homepage: { ...content.homepage, subscription: { ...content.homepage.subscription, buttonText: e.target.value } } })}
                      />
                    </div>

                    <div className="pt-2 flex justify-between">
                      <Button type="button" variant="outline" size="sm" onClick={() => setHomeSection('articles')} className="text-xs gap-1.5">
                        <ArrowLeft className="h-3.5 w-3.5" /> Field Journal
                      </Button>
                      <Button type="button" size="sm" onClick={() => setHomeSection('trust')} className="text-xs gap-1.5">
                        Next: Trust Badges <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Section 11: Trust Badges */}
              {homeSection === 'trust' && (
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      11. Trust Badges &amp; Accreditations Strip
                    </CardTitle>
                    <CardDescription>Bottom compliance strip (Government licensed, GIA, SLTDA).</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Strip Heading</Label>
                      <Input
                        value={ab.trustStrip.heading}
                        onChange={(e) => setContent({ ...content, about: { ...content.about, trustStrip: { ...content.about.trustStrip, heading: e.target.value } } })}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="p-3 rounded-xl border bg-muted/20 space-y-1">
                        <Label className="text-[11px] font-bold text-primary">Badge #1</Label>
                        <Input
                          value={ab.trustStrip.badge1}
                          className="text-xs"
                          onChange={(e) => setContent({ ...content, about: { ...content.about, trustStrip: { ...content.about.trustStrip, badge1: e.target.value } } })}
                        />
                      </div>
                      <div className="p-3 rounded-xl border bg-muted/20 space-y-1">
                        <Label className="text-[11px] font-bold text-emerald-500">Badge #2</Label>
                        <Input
                          value={ab.trustStrip.badge2}
                          className="text-xs"
                          onChange={(e) => setContent({ ...content, about: { ...content.about, trustStrip: { ...content.about.trustStrip, badge2: e.target.value } } })}
                        />
                      </div>
                      <div className="p-3 rounded-xl border bg-muted/20 space-y-1">
                        <Label className="text-[11px] font-bold text-blue-500">Badge #3</Label>
                        <Input
                          value={ab.trustStrip.badge3}
                          className="text-xs"
                          onChange={(e) => setContent({ ...content, about: { ...content.about, trustStrip: { ...content.about.trustStrip, badge3: e.target.value } } })}
                        />
                      </div>
                      <div className="p-3 rounded-xl border bg-muted/20 space-y-1">
                        <Label className="text-[11px] font-bold text-amber-500">Badge #4</Label>
                        <Input
                          value={ab.trustStrip.badge4}
                          className="text-xs"
                          onChange={(e) => setContent({ ...content, about: { ...content.about, trustStrip: { ...content.about.trustStrip, badge4: e.target.value } } })}
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-start">
                      <Button type="button" variant="outline" size="sm" onClick={() => setHomeSection('guide')} className="text-xs gap-1.5">
                        <ArrowLeft className="h-3.5 w-3.5" /> 2026 Gem Guide
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

            </div>

            {/* RIGHT 6 COLS: STICKY REAL-TIME LIVE VISUAL PREVIEW STUDIO */}
            <div className="xl:col-span-6 xl:sticky xl:top-24 space-y-3">
              
              <div className="flex items-center justify-between p-3 rounded-2xl bg-card border border-border/80 shadow-xs">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground ml-2 truncate">
                    https://sapphiretrails.lk #{homeSection}
                  </span>
                </div>

                <div className="flex items-center bg-muted p-0.5 rounded-xl gap-1">
                  <Button
                    type="button"
                    variant={previewDevice === 'desktop' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setPreviewDevice('desktop')}
                    className="h-7 px-2 rounded-lg text-xs"
                  >
                    <Monitor className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant={previewDevice === 'mobile' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setPreviewDevice('mobile')}
                    className="h-7 px-2 rounded-lg text-xs"
                  >
                    <Smartphone className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Live Preview Canvas */}
              <div className={`mx-auto transition-all duration-300 rounded-2xl overflow-hidden border border-border/80 shadow-2xl bg-background text-foreground ${
                previewDevice === 'mobile' ? 'max-w-sm' : 'w-full'
              }`}>
                {content.homepage.sectionVisibility?.[homeSection] === false ? (
                  <div className="p-8 sm:p-12 text-center bg-muted/30 border border-dashed border-rose-500/40 rounded-2xl space-y-3 m-3">
                    <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
                      <EyeOff className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-foreground">Section is Inactive (Hidden)</h4>
                      <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                        This section is currently turned OFF and will not be displayed to visitors on the live website.
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleToggleHomeVisibility(homeSection, true)}
                      className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-4 font-semibold shadow-xs"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1.5" />
                      Activate Section
                    </Button>
                  </div>
                ) : (
                  <div className={getSectionThemeClass(content.homepage.sectionStyles?.[homeSection])}>
                    {homeSection === 'hero' && (
                      <div className="relative min-h-[460px] p-6 sm:p-8 flex flex-col items-center justify-center text-center overflow-hidden bg-slate-950 text-white">
                        <Image src="https://content-provider.payshia.com/sapphire-trail/images/img35.webp" alt="Backdrop" fill className="object-cover opacity-35 brightness-75 -z-0" />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/35 to-black/80 z-0 pointer-events-none" />

                        <div className="relative z-10 flex flex-col items-center justify-center space-y-4 max-w-lg">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 border border-primary/50 text-[10px] sm:text-xs tracking-widest uppercase text-primary shadow-md">
                            <Sparkles className="h-3 w-3 text-primary shrink-0" />
                            <span className="truncate max-w-[280px]">{hero.tagline}</span>
                          </div>

                          <div className="relative w-24 sm:w-28 h-auto flex items-center justify-center py-1">
                            <Image src="/img/logo4.png" alt="Sapphire Trails" width={120} height={120} className="h-auto w-full object-contain drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]" />
                          </div>

                          <div className="space-y-1">
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-headline font-bold text-white leading-tight">
                              {hero.headlineLine1}
                            </h2>
                            <p className="text-primary/95 text-sm sm:text-base md:text-lg font-serif tracking-wider uppercase font-normal">
                              {hero.headlineLine2}
                            </p>
                          </div>

                          <p className="text-xs sm:text-sm text-slate-200 font-light leading-relaxed max-w-md">
                            {hero.subheadline}
                          </p>

                          <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2 w-full justify-center">
                            <div className="px-5 py-2 rounded-full bg-primary text-primary-foreground font-semibold text-xs flex items-center gap-1.5 shadow-md">
                              <CalendarCheck className="h-3.5 w-3.5" />
                              <span>{hero.ctaPrimaryText}</span>
                            </div>
                            <div className="px-5 py-2 rounded-full border border-white/40 bg-black/40 text-white font-medium text-xs flex items-center gap-1.5">
                              <Compass className="h-3.5 w-3.5 text-primary" />
                              <span>{hero.ctaSecondaryText}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {homeSection === 'stats' && (
                      <div className="p-6 bg-primary/[0.04] border-y border-primary/20 space-y-6 text-center">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
                          <Award className="h-3.5 w-3.5" /> Authority Heritage Stats
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          {hp.stats.map((stat, idx) => {
                            const Icon = defaultStatsIcons[idx % defaultStatsIcons.length];
                            return (
                              <div key={idx} className="p-4 rounded-xl bg-card border border-border/80 shadow-xs flex flex-col items-center gap-1">
                                <Icon className="h-6 w-6 text-primary mb-1" />
                                <p className="text-xl font-headline font-bold text-foreground">{stat.value}</p>
                                <p className="text-[11px] text-muted-foreground">{stat.label}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {homeSection === 'journey' && (
                      <div className="p-6 bg-background space-y-5">
                        <div className="text-center space-y-1.5">
                          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-wider">
                            <Footprints className="h-3.5 w-3.5" /> {hp.journey.tagline}
                          </div>
                          <h3 className="text-lg font-headline font-bold text-primary">{hp.journey.heading}</h3>
                          <p className="text-xs text-muted-foreground max-w-sm mx-auto line-clamp-2">{hp.journey.subtitle}</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {hp.journey.steps.map((s, idx) => (
                            <div key={idx} className="p-3 rounded-xl border bg-card space-y-1">
                              <span className="text-[10px] font-mono font-bold text-primary">STEP {s.step || `0${idx + 1}`}</span>
                              <h4 className="text-xs font-headline font-bold text-foreground">{s.title}</h4>
                              <p className="text-[10px] text-muted-foreground line-clamp-2">{s.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {homeSection === 'discover' && (
                      <div className="p-5 bg-card space-y-4">
                        <div className="text-center space-y-1">
                          <span className="text-[10px] font-semibold text-primary uppercase tracking-widest font-serif">
                            {hp.discover.tagline || 'Authentic Ratnapura Exploration'}
                          </span>
                          <h3 className="text-lg font-headline font-bold text-primary">{hp.discover.heading}</h3>
                          <p className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto line-clamp-2">
                            {hp.discover.description}
                          </p>
                        </div>

                        <div className="grid grid-cols-4 gap-1.5 pt-1">
                          {hp.discover.images.map((img, i) => (
                            <div key={i} className="group relative aspect-video rounded-lg overflow-hidden border border-border/60 bg-slate-900">
                              <Image src={img.src} alt={img.alt} fill className="object-cover" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {homeSection === 'tours' && (
                      <div className="p-5 bg-background space-y-4">
                        {/* Catalog Header */}
                        <div className="text-center space-y-2 pb-3 border-b border-border/40">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-wider">
                            <Compass className="h-3.5 w-3.5" /> {hp.toursHeader.tagline || 'Curated Expeditions'}
                          </div>
                          <h3 className="text-base font-headline font-bold text-primary">{hp.toursHeader.heading}</h3>
                          <p className="text-[11px] text-muted-foreground max-w-md mx-auto leading-relaxed">{hp.toursHeader.subtitle}</p>
                        </div>

                        {/* Spotlight Banner Simulation */}
                        <div className="relative rounded-2xl overflow-hidden border border-primary/40 bg-zinc-950 p-5 text-white shadow-lg space-y-3">
                          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/20 border border-primary/40 text-[9px] font-semibold uppercase text-primary">
                            <Heart className="h-2.5 w-2.5 fill-primary text-primary" />
                            {content.tours.proposalCallout?.badge || 'Once in a Lifetime'}
                          </div>
                          <h4 className="text-sm sm:text-base font-headline font-bold text-white leading-tight">
                            {content.tours.proposalCallout?.title || 'Design Your Custom Engagement Ring in the Mines of Ceylon'}
                          </h4>
                          <p className="text-[10px] text-white/75 line-clamp-2 leading-relaxed">
                            {content.tours.proposalCallout?.description}
                          </p>
                          <div className="flex items-center gap-2 pt-1">
                            <div className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold flex items-center gap-1 shadow-xs">
                              <Sparkles className="h-3 w-3" />
                              <span>{content.tours.proposalCallout?.primaryButtonText || 'Explore Proposal Package'}</span>
                            </div>
                            <div className="px-3 py-1.5 rounded-full border border-white/30 text-white text-[10px] font-medium">
                              <span>{content.tours.proposalCallout?.secondaryButtonText || 'Inquire with Concierge'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {homeSection === 'reviews' && (
                      <div className="p-6 bg-card space-y-4 text-center">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-semibold uppercase tracking-wider">
                          <Users className="h-3.5 w-3.5" /> {hp.reviewsHeader.tagline || 'Verified Traveler Experiences'}
                        </div>
                        <h3 className="text-lg font-headline font-bold text-primary">{hp.reviewsHeader.heading}</h3>
                        <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">{hp.reviewsHeader.subtitle}</p>
                      </div>
                    )}

                    {homeSection === 'explore' && (
                      <div className="p-6 bg-card space-y-4 text-center">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-wider">
                          <MapPin className="h-3.5 w-3.5" /> {hp.exploreHeader.tagline || 'Regional Wonders'}
                        </div>
                        <h3 className="text-lg font-headline font-bold text-primary">{hp.exploreHeader.heading}</h3>
                        <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">{hp.exploreHeader.subtitle}</p>
                      </div>
                    )}

                    {homeSection === 'faq' && (
                      <div className="p-6 bg-card space-y-4 text-center">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-wider">
                          <HelpCircle className="h-3.5 w-3.5" /> {hp.faqHeader.tagline || 'Traveler Inquiries'}
                        </div>
                        <h3 className="text-lg font-headline font-bold text-primary">{hp.faqHeader.heading}</h3>
                        <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">{hp.faqHeader.subtitle}</p>
                      </div>
                    )}

                    {homeSection === 'articles' && (
                      <div className="p-6 bg-card space-y-4 text-center">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-wider">
                          <BookOpen className="h-3.5 w-3.5" /> {hp.articlesHeader.tagline || 'Field Journal & Gemology Insights'}
                        </div>
                        <h3 className="text-lg font-headline font-bold text-primary">{hp.articlesHeader.heading}</h3>
                        <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">{hp.articlesHeader.subtitle}</p>
                      </div>
                    )}

                    {homeSection === 'guide' && (
                      <div className="p-6 bg-card space-y-4 text-center">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold uppercase tracking-wider">
                          <BookOpen className="h-3.5 w-3.5" /> {hp.subscription.tagline}
                        </div>
                        <h3 className="text-lg font-headline font-bold text-foreground">{hp.subscription.heading}</h3>
                        <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">{hp.subscription.subheadline}</p>
                        <div className="flex items-center justify-center gap-2 pt-2">
                          <div className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1.5 shadow-md">
                            <Download className="h-3.5 w-3.5" />
                            <span>{hp.subscription.buttonText}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {homeSection === 'trust' && (
                      <div className="p-6 bg-card space-y-4 text-center">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-wider">
                          <ShieldCheck className="h-3.5 w-3.5" /> Accreditations &amp; Trust
                        </div>
                        <h3 className="text-base font-headline font-bold text-foreground">{ab.trustStrip.heading}</h3>
                        <div className="grid grid-cols-2 gap-2 pt-2">
                          <div className="p-2 rounded-lg border bg-background text-[11px] font-bold text-primary">
                            {ab.trustStrip.badge1}
                          </div>
                          <div className="p-2 rounded-lg border bg-background text-[11px] font-bold text-emerald-500">
                            {ab.trustStrip.badge2}
                          </div>
                          <div className="p-2 rounded-lg border bg-background text-[11px] font-bold text-blue-500">
                            {ab.trustStrip.badge3}
                          </div>
                          <div className="p-2 rounded-lg border bg-background text-[11px] font-bold text-amber-500">
                            {ab.trustStrip.badge4}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>

          </div>
        </TabsContent>



        {/* ========================================================================= */}
        {/* 2. ABOUT US TAB - ALL 9 COMPLETE SUB-SECTIONS */}
        {/* ========================================================================= */}
        <TabsContent value="about" className="w-full space-y-4">
          
          {/* About Us Sub-Section Navigation Pills - 9 Sections */}
          <div className="flex items-center gap-1.5 p-1.5 bg-muted/40 rounded-2xl border border-border/60 overflow-x-auto [scrollbar-width:none]">
            <span className="text-[11px] font-bold text-muted-foreground px-3 shrink-0 uppercase tracking-wider font-mono">
              Sections:
            </span>
            <Button
              type="button"
              variant={aboutSection === 'hero' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setAboutSection('hero')}
              className="h-8 rounded-xl text-xs shrink-0 gap-1.5 font-semibold"
            >
              <Sparkles className="h-3.5 w-3.5" /> 1. Hero
            </Button>
            <Button
              type="button"
              variant={aboutSection === 'metrics' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setAboutSection('metrics')}
              className="h-8 rounded-xl text-xs shrink-0 gap-1.5 font-semibold"
            >
              <Award className="h-3.5 w-3.5" /> 2. Metrics
            </Button>
            <Button
              type="button"
              variant={aboutSection === 'story' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setAboutSection('story')}
              className="h-8 rounded-xl text-xs shrink-0 gap-1.5 font-semibold"
            >
              <History className="h-3.5 w-3.5" /> 3. Our Story
            </Button>
            <Button
              type="button"
              variant={aboutSection === 'experience' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setAboutSection('experience')}
              className="h-8 rounded-xl text-xs shrink-0 gap-1.5 font-semibold"
            >
              <Gem className="h-3.5 w-3.5" /> 4. Experience
            </Button>
            <Button
              type="button"
              variant={aboutSection === 'values' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setAboutSection('values')}
              className="h-8 rounded-xl text-xs shrink-0 gap-1.5 font-semibold"
            >
              <HeartHandshake className="h-3.5 w-3.5" /> 5. Values
            </Button>
            <Button
              type="button"
              variant={aboutSection === 'journey' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setAboutSection('journey')}
              className="h-8 rounded-xl text-xs shrink-0 gap-1.5 font-semibold"
            >
              <Pickaxe className="h-3.5 w-3.5" /> 6. 4-Stage Journey
            </Button>
            <Button
              type="button"
              variant={aboutSection === 'whyRatnapura' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setAboutSection('whyRatnapura')}
              className="h-8 rounded-xl text-xs shrink-0 gap-1.5 font-semibold"
            >
              <Crown className="h-3.5 w-3.5" /> 7. Why Ratnapura
            </Button>
            <Button
              type="button"
              variant={aboutSection === 'trustStrip' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setAboutSection('trustStrip')}
              className="h-8 rounded-xl text-xs shrink-0 gap-1.5 font-semibold"
            >
              <ShieldCheck className="h-3.5 w-3.5" /> 8. Trust Badges
            </Button>
            <Button
              type="button"
              variant={aboutSection === 'cta' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setAboutSection('cta')}
              className="h-8 rounded-xl text-xs shrink-0 gap-1.5 font-semibold"
            >
              <Phone className="h-3.5 w-3.5" /> 9. Executive CTA
            </Button>
          </div>

          {/* Focused Split Screen: Left Editor (6 cols) | Right Live Preview (6 cols) */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            
            {/* LEFT 6 COLS: FOCUSED ABOUT SECTION EDITOR */}
            <div className="xl:col-span-6 space-y-4">
              
              {/* Universal Section Visibility & Background Theme Toolbar */}
              <SectionToolbar
                title="Selected Section"
                isActive={content.about.sectionVisibility?.[aboutSection] !== false}
                onToggleActive={(active) => handleToggleAboutVisibility(aboutSection, active)}
                currentTheme={content.about.sectionStyles?.[aboutSection] || 'default'}
                onChangeTheme={(theme) => handleSetAboutTheme(aboutSection, theme)}
              />

              {/* Section 1: Hero */}
              {aboutSection === 'hero' && (

                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      1. About Page Cinematic Hero
                    </CardTitle>
                    <CardDescription>Hero banner tagline, main title, and descriptive subtitle.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Brand Tagline (Pill Badge)</Label>
                        <Input
                          value={ab.hero.tagline}
                          onChange={(e) => setContent({ ...content, about: { ...content.about, hero: { ...content.about.hero, tagline: e.target.value } } })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Main Hero Title</Label>
                        <Input
                          value={ab.hero.title}
                          onChange={(e) => setContent({ ...content, about: { ...content.about, hero: { ...content.about.hero, title: e.target.value } } })}
                        />
                      </div>
                    </div>

                    {/* Hero Backdrop Image Uploader */}
                    <div className="p-3.5 rounded-xl border bg-muted/20 space-y-2">
                      <Label className="text-xs font-bold text-primary">Hero Backdrop Image</Label>
                      <div className="flex items-center gap-3">
                        <div className="relative w-20 h-14 rounded-lg overflow-hidden border border-border bg-slate-900 shrink-0">
                          <Image src={ab.hero.image || 'https://content-provider.payshia.com/sapphire-trail/images/tour-11-optimized.webp'} alt="About Hero" fill className="object-cover" />
                        </div>
                        <div className="space-y-1 flex-1">
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            ref={aboutHeroFileRef}
                            onChange={handleAboutHeroImageChange}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => aboutHeroFileRef.current?.click()}
                            className="w-full text-xs h-7 gap-1 border-dashed border-primary/40 hover:border-primary hover:bg-primary/5"
                          >
                            <Upload className="h-3 w-3 text-primary" />
                            <span>Change Backdrop Photo</span>
                          </Button>
                          <Input
                            value={ab.hero.image || ''}
                            placeholder="Or paste image URL..."
                            className="text-[10px] h-6 font-mono"
                            onChange={(e) => setContent({ ...content, about: { ...content.about, hero: { ...content.about.hero, image: e.target.value } } })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Hero Subtitle</Label>
                      <Textarea
                        rows={3}
                        value={ab.hero.subtitle}
                        onChange={(e) => setContent({ ...content, about: { ...content.about, hero: { ...content.about.hero, subtitle: e.target.value } } })}
                      />
                    </div>


                    <div className="pt-2 flex justify-end">
                      <Button type="button" size="sm" onClick={() => setAboutSection('metrics')} className="text-xs gap-1.5">
                        Next: Impact Metrics <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Section 2: Metrics */}
              {aboutSection === 'metrics' && (
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                      <Award className="h-4 w-4 text-primary" />
                      2. Key Impact Metrics &amp; Heritage Counters
                    </CardTitle>
                    <CardDescription>4 counter cards shown on the About page.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {ab.metrics.map((m, idx) => (
                        <div key={idx} className="p-3 rounded-xl border bg-muted/20 space-y-2">
                          <Badge variant="outline" className="text-[10px]">Metric #{idx + 1}</Badge>
                          <div className="space-y-1">
                            <Label className="text-xs">Counter Value</Label>
                            <Input
                              value={m.value}
                              onChange={(e) => {
                                const newM = [...ab.metrics];
                                newM[idx].value = e.target.value;
                                setContent({ ...content, about: { ...content.about, metrics: newM } });
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Label Text</Label>
                            <Input
                              value={m.label}
                              onChange={(e) => {
                                const newM = [...ab.metrics];
                                newM[idx].label = e.target.value;
                                setContent({ ...content, about: { ...content.about, metrics: newM } });
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Description</Label>
                            <Input
                              value={m.description}
                              onChange={(e) => {
                                const newM = [...ab.metrics];
                                newM[idx].description = e.target.value;
                                setContent({ ...content, about: { ...content.about, metrics: newM } });
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 flex justify-between">
                      <Button type="button" variant="outline" size="sm" onClick={() => setAboutSection('hero')} className="text-xs gap-1.5">
                        <ArrowLeft className="h-3.5 w-3.5" /> Hero Banner
                      </Button>
                      <Button type="button" size="sm" onClick={() => setAboutSection('story')} className="text-xs gap-1.5">
                        Next: Our Story <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Section 3: Our Story */}
              {aboutSection === 'story' && (
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                      <History className="h-4 w-4 text-primary" />
                      3. Deep Heritage &amp; Our Story
                    </CardTitle>
                    <CardDescription>Story paragraphs, founding conviction quote, and 3 timeline milestones.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3.5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Story Tagline</Label>
                        <Input
                          value={ab.story.tagline}
                          onChange={(e) => setContent({ ...content, about: { ...content.about, story: { ...content.about.story, tagline: e.target.value } } })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Story Heading</Label>
                        <Input
                          value={ab.story.heading}
                          onChange={(e) => setContent({ ...content, about: { ...content.about, story: { ...content.about.story, heading: e.target.value } } })}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Paragraph 1 (Origins &amp; Grand Silver Ray)</Label>
                      <Textarea
                        rows={3}
                        value={ab.story.paragraph1}
                        onChange={(e) => setContent({ ...content, about: { ...content.about, story: { ...content.about.story, paragraph1: e.target.value } } })}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Paragraph 2 (The Real Mining Magic)</Label>
                      <Textarea
                        rows={3}
                        value={ab.story.paragraph2}
                        onChange={(e) => setContent({ ...content, about: { ...content.about, story: { ...content.about.story, paragraph2: e.target.value } } })}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Founding Conviction Quote</Label>
                      <Textarea
                        rows={2}
                        value={ab.story.quote}
                        onChange={(e) => setContent({ ...content, about: { ...content.about, story: { ...content.about.story, quote: e.target.value } } })}
                      />
                    </div>

                    {/* Story 3-Image Collage Uploaders */}
                    <div className="p-4 rounded-xl border bg-muted/20 space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold text-primary">Story 3-Photo Collage (Right-Side Visual)</Label>
                        <Badge variant="outline" className="text-[10px]">3 Photos Grid</Badge>
                      </div>

                      {/* Photo 1: Main Top Featured Image */}
                      <div className="p-3 rounded-lg border bg-background space-y-2">
                        <Label className="text-[11px] font-semibold text-foreground flex items-center justify-between">
                          <span>1. Main Featured Photo (Top Large)</span>
                          <span className="text-[9px] text-muted-foreground font-mono truncate max-w-[150px]">{ab.story.image}</span>
                        </Label>
                        <div className="flex items-center gap-3">
                          <div className="relative w-20 h-14 rounded-lg overflow-hidden border border-border bg-slate-900 shrink-0">
                            <Image src={ab.story.image || 'https://content-provider.payshia.com/sapphire-trail/images/tour-4-optimized.webp'} alt="Story Main" fill className="object-cover" />
                          </div>
                          <div className="space-y-1 flex-1">
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              ref={ourStoryFileRef}
                              onChange={handleOurStoryImageChange}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => ourStoryFileRef.current?.click()}
                              className="w-full text-xs h-7 gap-1 border-dashed border-primary/40 hover:border-primary hover:bg-primary/5"
                            >
                              <Upload className="h-3 w-3 text-primary" />
                              <span>Upload Main Photo</span>
                            </Button>
                            <Input
                              value={ab.story.image || ''}
                              placeholder="Or paste CDN URL..."
                              className="text-[10px] h-6 font-mono"
                              onChange={(e) => setContent({ ...content, about: { ...content.about, story: { ...content.about.story, image: e.target.value } } })}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Photo 2 & 3: Two Sub-Images Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        
                        {/* Sub-Photo 2 (Bottom Left) */}
                        <div className="p-2.5 rounded-lg border bg-background space-y-2">
                          <Label className="text-[11px] font-semibold text-foreground">2. Sub-Photo Left (Bottom)</Label>
                          <div className="flex items-center gap-2">
                            <div className="relative w-14 h-12 rounded-md overflow-hidden border border-border bg-slate-900 shrink-0">
                              <Image src={ab.story.image2 || 'https://content-provider.payshia.com/sapphire-trail/images/tour-2-optimized.webp'} alt="Sub Photo 1" fill className="object-cover" />
                            </div>
                            <div className="space-y-1 flex-1">
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                ref={ourStoryFileRef2}
                                onChange={handleOurStoryImageChange2}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => ourStoryFileRef2.current?.click()}
                                className="w-full text-[11px] h-6 gap-1 border-dashed border-primary/40"
                              >
                                <Upload className="h-2.5 w-2.5 text-primary" />
                                <span>Upload</span>
                              </Button>
                            </div>
                          </div>
                          <Input
                            value={ab.story.image2 || ''}
                            placeholder="CDN URL 2..."
                            className="text-[9px] h-6 font-mono"
                            onChange={(e) => setContent({ ...content, about: { ...content.about, story: { ...content.about.story, image2: e.target.value } } })}
                          />
                        </div>

                        {/* Sub-Photo 3 (Bottom Right) */}
                        <div className="p-2.5 rounded-lg border bg-background space-y-2">
                          <Label className="text-[11px] font-semibold text-foreground">3. Sub-Photo Right (Bottom)</Label>
                          <div className="flex items-center gap-2">
                            <div className="relative w-14 h-12 rounded-md overflow-hidden border border-border bg-slate-900 shrink-0">
                              <Image src={ab.story.image3 || 'https://content-provider.payshia.com/sapphire-trail/images/tour-6-optimized.webp'} alt="Sub Photo 2" fill className="object-cover" />
                            </div>
                            <div className="space-y-1 flex-1">
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                ref={ourStoryFileRef3}
                                onChange={handleOurStoryImageChange3}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => ourStoryFileRef3.current?.click()}
                                className="w-full text-[11px] h-6 gap-1 border-dashed border-primary/40"
                              >
                                <Upload className="h-2.5 w-2.5 text-primary" />
                                <span>Upload</span>
                              </Button>
                            </div>
                          </div>
                          <Input
                            value={ab.story.image3 || ''}
                            placeholder="CDN URL 3..."
                            className="text-[9px] h-6 font-mono"
                            onChange={(e) => setContent({ ...content, about: { ...content.about, story: { ...content.about.story, image3: e.target.value } } })}
                          />
                        </div>

                      </div>
                    </div>


                    {/* 3 Milestones */}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                      <div className="p-2.5 rounded-xl border bg-muted/20 space-y-1.5">
                        <Label className="text-xs font-bold text-primary">Milestone 1</Label>
                        <Input
                          value={ab.story.badge1.year}
                          className="text-xs h-7"
                          onChange={(e) => setContent({ ...content, about: { ...content.about, story: { ...content.about.story, badge1: { ...content.about.story.badge1, year: e.target.value } } } })}
                        />
                        <Input
                          value={ab.story.badge1.title}
                          className="text-xs h-7 font-semibold"
                          onChange={(e) => setContent({ ...content, about: { ...content.about, story: { ...content.about.story, badge1: { ...content.about.story.badge1, title: e.target.value } } } })}
                        />
                        <Textarea
                          rows={2}
                          value={ab.story.badge1.desc}
                          className="text-[10px]"
                          onChange={(e) => setContent({ ...content, about: { ...content.about, story: { ...content.about.story, badge1: { ...content.about.story.badge1, desc: e.target.value } } } })}
                        />
                      </div>

                      <div className="p-2.5 rounded-xl border bg-muted/20 space-y-1.5">
                        <Label className="text-xs font-bold text-primary">Milestone 2</Label>
                        <Input
                          value={ab.story.badge2.year}
                          className="text-xs h-7"
                          onChange={(e) => setContent({ ...content, about: { ...content.about, story: { ...content.about.story, badge2: { ...content.about.story.badge2, year: e.target.value } } } })}
                        />
                        <Input
                          value={ab.story.badge2.title}
                          className="text-xs h-7 font-semibold"
                          onChange={(e) => setContent({ ...content, about: { ...content.about, story: { ...content.about.story, badge2: { ...content.about.story.badge2, title: e.target.value } } } })}
                        />
                        <Textarea
                          rows={2}
                          value={ab.story.badge2.desc}
                          className="text-[10px]"
                          onChange={(e) => setContent({ ...content, about: { ...content.about, story: { ...content.about.story, badge2: { ...content.about.story.badge2, desc: e.target.value } } } })}
                        />
                      </div>

                      <div className="p-2.5 rounded-xl border bg-muted/20 space-y-1.5">
                        <Label className="text-xs font-bold text-primary">Milestone 3</Label>
                        <Input
                          value={ab.story.badge3.year}
                          className="text-xs h-7"
                          onChange={(e) => setContent({ ...content, about: { ...content.about, story: { ...content.about.story, badge3: { ...content.about.story.badge3, year: e.target.value } } } })}
                        />
                        <Input
                          value={ab.story.badge3.title}
                          className="text-xs h-7 font-semibold"
                          onChange={(e) => setContent({ ...content, about: { ...content.about, story: { ...content.about.story, badge3: { ...content.about.story.badge3, title: e.target.value } } } })}
                        />
                        <Textarea
                          rows={2}
                          value={ab.story.badge3.desc}
                          className="text-[10px]"
                          onChange={(e) => setContent({ ...content, about: { ...content.about, story: { ...content.about.story, badge3: { ...content.about.story.badge3, desc: e.target.value } } } })}
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-between">
                      <Button type="button" variant="outline" size="sm" onClick={() => setAboutSection('metrics')} className="text-xs gap-1.5">
                        <ArrowLeft className="h-3.5 w-3.5" /> Impact Metrics
                      </Button>
                      <Button type="button" size="sm" onClick={() => setAboutSection('experience')} className="text-xs gap-1.5">
                        Next: The Experience <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Section 4: The Experience */}
              {aboutSection === 'experience' && (
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                      <Gem className="h-4 w-4 text-primary" />
                      4. The Sapphire Trails Multi-Faceted Experience
                    </CardTitle>
                    <CardDescription>4 experience highlights (Mining, Luxury Stays, Workshops, Cultural Immersions).</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Tagline</Label>
                        <Input
                          value={ab.experience.tagline}
                          onChange={(e) => setContent({ ...content, about: { ...content.about, experience: { ...content.about.experience, tagline: e.target.value } } })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Heading Title</Label>
                        <Input
                          value={ab.experience.heading}
                          onChange={(e) => setContent({ ...content, about: { ...content.about, experience: { ...content.about.experience, heading: e.target.value } } })}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Section Narrative Description</Label>
                      <Textarea
                        rows={2}
                        value={ab.experience.description}
                        onChange={(e) => setContent({ ...content, about: { ...content.about, experience: { ...content.about.experience, description: e.target.value } } })}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                      {ab.experience.items.map((item, idx) => (
                        <div key={idx} className="p-3 rounded-xl border bg-muted/20 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-primary">Card #{idx + 1}</span>
                            <span className="text-xs font-semibold text-foreground truncate">{item.title}</span>
                          </div>

                          {/* Image Uploader & Thumbnail */}
                          <div className="flex items-center gap-3">
                            <div className="relative w-16 h-14 rounded-lg overflow-hidden border border-border bg-slate-900 shrink-0">
                              <Image src={item.image} alt={item.title} fill className="object-cover" />
                            </div>

                            <div className="space-y-1 flex-1">
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                ref={(el) => { aboutExpFileRefs.current[idx] = el; }}
                                onChange={(e) => handleAboutExpImageChange(idx, e)}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => aboutExpFileRefs.current[idx]?.click()}
                                className="w-full text-xs h-7 gap-1 border-dashed border-primary/40 hover:border-primary hover:bg-primary/5"
                              >
                                <Upload className="h-3 w-3 text-primary" />
                                <span>Change Card Photo</span>
                              </Button>
                              <Input
                                value={item.image}
                                placeholder="Or paste image URL..."
                                className="text-[10px] h-6 font-mono"
                                onChange={(e) => {
                                  const newItems = [...ab.experience.items];
                                  newItems[idx].image = e.target.value;
                                  setContent({ ...content, about: { ...content.about, experience: { ...content.about.experience, items: newItems } } });
                                }}
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[11px] font-semibold">Title</Label>
                            <Input
                              value={item.title}
                              className="text-xs h-8"
                              onChange={(e) => {
                                const newItems = [...ab.experience.items];
                                newItems[idx].title = e.target.value;
                                setContent({ ...content, about: { ...content.about, experience: { ...content.about.experience, items: newItems } } });
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[11px]">Description</Label>
                            <Textarea
                              rows={2}
                              value={item.description}
                              className="text-xs"
                              onChange={(e) => {
                                const newItems = [...ab.experience.items];
                                newItems[idx].description = e.target.value;
                                setContent({ ...content, about: { ...content.about, experience: { ...content.about.experience, items: newItems } } });
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>


                    <div className="pt-2 flex justify-between">
                      <Button type="button" variant="outline" size="sm" onClick={() => setAboutSection('story')} className="text-xs gap-1.5">
                        <ArrowLeft className="h-3.5 w-3.5" /> Our Story
                      </Button>
                      <Button type="button" size="sm" onClick={() => setAboutSection('values')} className="text-xs gap-1.5">
                        Next: Core Values <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Section 5: Core Values */}
              {aboutSection === 'values' && (
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                      <HeartHandshake className="h-4 w-4 text-primary" />
                      5. Core Values &amp; Guiding Principles
                    </CardTitle>
                    <CardDescription>4 value pillars (Ethical Alliances, Eco Restoration, Safety, Certification).</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3.5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Values Tagline</Label>
                        <Input
                          value={ab.values.tagline}
                          onChange={(e) => setContent({ ...content, about: { ...content.about, values: { ...content.about.values, tagline: e.target.value } } })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Values Heading</Label>
                        <Input
                          value={ab.values.heading}
                          onChange={(e) => setContent({ ...content, about: { ...content.about, values: { ...content.about.values, heading: e.target.value } } })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {ab.values.items.map((val, idx) => (
                        <div key={idx} className="p-3 rounded-xl border bg-muted/20 space-y-2">
                          <div className="space-y-1">
                            <Label className="text-[11px] font-semibold">Value Title</Label>
                            <Input
                              value={val.title}
                              className="text-xs h-8"
                              onChange={(e) => {
                                const newVals = [...ab.values.items];
                                newVals[idx].title = e.target.value;
                                setContent({ ...content, about: { ...content.about, values: { ...content.about.values, items: newVals } } });
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[11px]">Badge Pill</Label>
                            <Input
                              value={val.badge}
                              className="text-xs h-8 text-primary"
                              onChange={(e) => {
                                const newVals = [...ab.values.items];
                                newVals[idx].badge = e.target.value;
                                setContent({ ...content, about: { ...content.about, values: { ...content.about.values, items: newVals } } });
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[11px]">Description</Label>
                            <Textarea
                              rows={2}
                              value={val.description}
                              className="text-xs"
                              onChange={(e) => {
                                const newVals = [...ab.values.items];
                                newVals[idx].description = e.target.value;
                                setContent({ ...content, about: { ...content.about, values: { ...content.about.values, items: newVals } } });
                              }}
                            />
                          </div>

                          {/* 3 Tickmark Checklist Points */}
                          <div className="space-y-1.5 pt-1">
                            <Label className="text-[10px] font-bold text-primary flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-primary" /> 3 Checklist Bullet Points (Tickmarks)
                            </Label>
                            {[0, 1, 2].map((pIdx) => (
                              <div key={pIdx} className="flex items-center gap-1.5">
                                <span className="text-[10px] font-mono text-muted-foreground w-4 text-right">{pIdx + 1}.</span>
                                <Input
                                  value={val.points?.[pIdx] !== undefined ? val.points[pIdx] : (defaultPointsPerCard[idx]?.[pIdx] || '')}
                                  placeholder={`Point #${pIdx + 1}`}
                                  className="text-xs h-7"
                                  onChange={(e) => {
                                    const newVals = [...ab.values.items];
                                    const currentPoints = newVals[idx].points && newVals[idx].points!.length > 0 
                                      ? [...newVals[idx].points!] 
                                      : [...(defaultPointsPerCard[idx] || ['', '', ''])];
                                    currentPoints[pIdx] = e.target.value;
                                    newVals[idx].points = currentPoints;
                                    setContent({ ...content, about: { ...content.about, values: { ...content.about.values, items: newVals } } });
                                  }}
                                />
                              </div>
                            ))}

                          </div>
                        </div>
                      ))}
                    </div>


                    <div className="pt-2 flex justify-between">
                      <Button type="button" variant="outline" size="sm" onClick={() => setAboutSection('experience')} className="text-xs gap-1.5">
                        <ArrowLeft className="h-3.5 w-3.5" /> The Experience
                      </Button>
                      <Button type="button" size="sm" onClick={() => setAboutSection('journey')} className="text-xs gap-1.5">
                        Next: 4-Stage Journey <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Section 6: 4-Stage Journey with Image Uploader */}
              {aboutSection === 'journey' && (
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                      <Pickaxe className="h-4 w-4 text-primary" />
                      6. From Mine to Masterpiece: 4-Stage Journey
                    </CardTitle>
                    <CardDescription>Upload photos, titles, and descriptions for each of the 4 stages.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Journey Tagline</Label>
                        <Input
                          value={ab.gemJourney.tagline}
                          onChange={(e) => setContent({ ...content, about: { ...content.about, gemJourney: { ...content.about.gemJourney, tagline: e.target.value } } })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Journey Heading</Label>
                        <Input
                          value={ab.gemJourney.heading}
                          onChange={(e) => setContent({ ...content, about: { ...content.about, gemJourney: { ...content.about.gemJourney, heading: e.target.value } } })}
                        />
                      </div>
                    </div>

                    <div className="space-y-3 pt-1">
                      {ab.gemJourney.steps.map((st, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl border bg-muted/20 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-primary">Stage {st.step || `0${idx + 1}`}</span>
                            <span className="text-xs font-semibold text-foreground">{st.title}</span>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="relative w-20 h-16 rounded-lg overflow-hidden border border-border bg-slate-900 shrink-0">
                              <Image 
                                src={st.image || defaultJourneyIcons[idx % defaultJourneyIcons.length] as any} 
                                alt={st.title} 
                                fill 
                                className="object-cover" 
                              />
                            </div>

                            <div className="space-y-1 flex-1">
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                ref={(el) => { aboutJourneyFileRefs.current[idx] = el; }}
                                onChange={(e) => handleAboutJourneyImageChange(idx, e)}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => aboutJourneyFileRefs.current[idx]?.click()}
                                className="w-full text-xs h-7 gap-1.5 border-dashed border-primary/40 hover:border-primary hover:bg-primary/5"
                              >
                                <Upload className="h-3 w-3 text-primary" />
                                <span>Change Stage Photo</span>
                              </Button>
                              <Input
                                value={st.image || ''}
                                placeholder="Or paste image URL..."
                                className="text-[10px] h-6 font-mono"
                                onChange={(e) => {
                                  const newSt = [...ab.gemJourney.steps];
                                  newSt[idx].image = e.target.value;
                                  setContent({ ...content, about: { ...content.about, gemJourney: { ...content.about.gemJourney, steps: newSt } } });
                                }}
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[11px]">Title</Label>
                            <Input
                              value={st.title}
                              className="text-xs h-8"
                              onChange={(e) => {
                                const newSt = [...ab.gemJourney.steps];
                                newSt[idx].title = e.target.value;
                                setContent({ ...content, about: { ...content.about, gemJourney: { ...content.about.gemJourney, steps: newSt } } });
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[11px]">Description</Label>
                            <Textarea
                              rows={2}
                              value={st.description}
                              className="text-xs"
                              onChange={(e) => {
                                const newSt = [...ab.gemJourney.steps];
                                newSt[idx].description = e.target.value;
                                setContent({ ...content, about: { ...content.about, gemJourney: { ...content.about.gemJourney, steps: newSt } } });
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 flex justify-between">
                      <Button type="button" variant="outline" size="sm" onClick={() => setAboutSection('values')} className="text-xs gap-1.5">
                        <ArrowLeft className="h-3.5 w-3.5" /> Core Values
                      </Button>
                      <Button type="button" size="sm" onClick={() => setAboutSection('whyRatnapura')} className="text-xs gap-1.5">
                        Next: Why Ratnapura <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Section 7: Why Ratnapura */}
              {aboutSection === 'whyRatnapura' && (
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                      <Crown className="h-4 w-4 text-primary" />
                      7. Why Ratnapura: The World’s Sapphire Epicenter
                    </CardTitle>
                    <CardDescription>Geological lore, history, quote, and quick fact card.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3.5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Tagline</Label>
                        <Input
                          value={ab.whyRatnapura.tagline}
                          onChange={(e) => setContent({ ...content, about: { ...content.about, whyRatnapura: { ...content.about.whyRatnapura, tagline: e.target.value } } })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Heading Title</Label>
                        <Input
                          value={ab.whyRatnapura.heading}
                          onChange={(e) => setContent({ ...content, about: { ...content.about, whyRatnapura: { ...content.about.whyRatnapura, heading: e.target.value } } })}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Paragraph 1 (Etymology &amp; Adam's Peak)</Label>
                      <Textarea
                        rows={3}
                        value={ab.whyRatnapura.paragraph1}
                        onChange={(e) => setContent({ ...content, about: { ...content.about, whyRatnapura: { ...content.about.whyRatnapura, paragraph1: e.target.value } } })}
                      />
                    </div>

                    {/* Valley Showcase Image Uploader */}
                    <div className="p-3.5 rounded-xl border bg-muted/20 space-y-2">
                      <Label className="text-xs font-bold text-primary">Ratnapura Valley Showcase Photo</Label>
                      <div className="flex items-center gap-3">
                        <div className="relative w-20 h-16 rounded-lg overflow-hidden border border-border bg-slate-900 shrink-0">
                          <Image src={ab.whyRatnapura.image || 'https://content-provider.payshia.com/sapphire-trail/images/tour-11-optimized.webp'} alt="Why Ratnapura" fill className="object-cover" />
                        </div>
                        <div className="space-y-1 flex-1">
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            ref={whyRatnapuraFileRef}
                            onChange={handleWhyRatnapuraImageChange}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => whyRatnapuraFileRef.current?.click()}
                            className="w-full text-xs h-7 gap-1 border-dashed border-primary/40 hover:border-primary hover:bg-primary/5"
                          >
                            <Upload className="h-3 w-3 text-primary" />
                            <span>Change Valley Photo</span>
                          </Button>
                          <Input
                            value={ab.whyRatnapura.image || ''}
                            placeholder="Or paste image URL..."
                            className="text-[10px] h-6 font-mono"
                            onChange={(e) => setContent({ ...content, about: { ...content.about, whyRatnapura: { ...content.about.whyRatnapura, image: e.target.value } } })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">

                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Fact Card Title</Label>
                        <Input
                          value={ab.whyRatnapura.factTitle}
                          onChange={(e) => setContent({ ...content, about: { ...content.about, whyRatnapura: { ...content.about.whyRatnapura, factTitle: e.target.value } } })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Fact Card Description</Label>
                        <Input
                          value={ab.whyRatnapura.factDesc}
                          onChange={(e) => setContent({ ...content, about: { ...content.about, whyRatnapura: { ...content.about.whyRatnapura, factDesc: e.target.value } } })}
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-between">
                      <Button type="button" variant="outline" size="sm" onClick={() => setAboutSection('journey')} className="text-xs gap-1.5">
                        <ArrowLeft className="h-3.5 w-3.5" /> 4-Stage Journey
                      </Button>
                      <Button type="button" size="sm" onClick={() => setAboutSection('trustStrip')} className="text-xs gap-1.5">
                        Next: Trust Badges <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Section 8: Trust Badges */}
              {aboutSection === 'trustStrip' && (
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      8. Official Accreditations &amp; Compliance Strip
                    </CardTitle>
                    <CardDescription>Main title and 4 accreditation sub-badges (NGJA, SLTDA, GIA, 27-Yr Base).</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Section Heading</Label>
                      <Input
                        value={ab.trustStrip.heading}
                        onChange={(e) => setContent({ ...content, about: { ...content.about, trustStrip: { ...content.about.trustStrip, heading: e.target.value } } })}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="p-3 rounded-xl border bg-muted/20 space-y-1">
                        <Label className="text-[11px] font-bold text-primary">NGJA Licensed Badge Text</Label>
                        <Input
                          value={ab.trustStrip.badge1}
                          className="text-xs"
                          onChange={(e) => setContent({ ...content, about: { ...content.about, trustStrip: { ...content.about.trustStrip, badge1: e.target.value } } })}
                        />
                      </div>
                      <div className="p-3 rounded-xl border bg-muted/20 space-y-1">
                        <Label className="text-[11px] font-bold text-emerald-500">SLTDA Compliant Badge Text</Label>
                        <Input
                          value={ab.trustStrip.badge2}
                          className="text-xs"
                          onChange={(e) => setContent({ ...content, about: { ...content.about, trustStrip: { ...content.about.trustStrip, badge2: e.target.value } } })}
                        />
                      </div>
                      <div className="p-3 rounded-xl border bg-muted/20 space-y-1">
                        <Label className="text-[11px] font-bold text-blue-500">GIA Standards Badge Text</Label>
                        <Input
                          value={ab.trustStrip.badge3}
                          className="text-xs"
                          onChange={(e) => setContent({ ...content, about: { ...content.about, trustStrip: { ...content.about.trustStrip, badge3: e.target.value } } })}
                        />
                      </div>
                      <div className="p-3 rounded-xl border bg-muted/20 space-y-1">
                        <Label className="text-[11px] font-bold text-amber-500">Hospitality Base Badge Text</Label>
                        <Input
                          value={ab.trustStrip.badge4}
                          className="text-xs"
                          onChange={(e) => setContent({ ...content, about: { ...content.about, trustStrip: { ...content.about.trustStrip, badge4: e.target.value } } })}
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-between">
                      <Button type="button" variant="outline" size="sm" onClick={() => setAboutSection('whyRatnapura')} className="text-xs gap-1.5">
                        <ArrowLeft className="h-3.5 w-3.5" /> Why Ratnapura
                      </Button>
                      <Button type="button" size="sm" onClick={() => setAboutSection('cta')} className="text-xs gap-1.5">
                        Next: Executive CTA <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Section 9: Executive CTA */}
              {aboutSection === 'cta' && (
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary" />
                      9. High-Converting Executive CTA Banner
                    </CardTitle>
                    <CardDescription>Bottom action banner with booking and WhatsApp concierge buttons.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Tagline</Label>
                        <Input
                          value={ab.cta.tagline}
                          onChange={(e) => setContent({ ...content, about: { ...content.about, cta: { ...content.about.cta, tagline: e.target.value } } })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Main Heading</Label>
                        <Input
                          value={ab.cta.heading}
                          onChange={(e) => setContent({ ...content, about: { ...content.about, cta: { ...content.about.cta, heading: e.target.value } } })}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Narrative Subtitle</Label>
                      <Textarea
                        rows={3}
                        value={ab.cta.subtitle}
                        onChange={(e) => setContent({ ...content, about: { ...content.about, cta: { ...content.about.cta, subtitle: e.target.value } } })}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Primary Button Text</Label>
                        <Input
                          value={ab.cta.primaryButtonText}
                          onChange={(e) => setContent({ ...content, about: { ...content.about, cta: { ...content.about.cta, primaryButtonText: e.target.value } } })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">WhatsApp Button Text</Label>
                        <Input
                          value={ab.cta.secondaryButtonText}
                          onChange={(e) => setContent({ ...content, about: { ...content.about, cta: { ...content.about.cta, secondaryButtonText: e.target.value } } })}
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-start">
                      <Button type="button" variant="outline" size="sm" onClick={() => setAboutSection('trustStrip')} className="text-xs gap-1.5">
                        <ArrowLeft className="h-3.5 w-3.5" /> Trust Badges
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

            </div>

            {/* RIGHT 6 COLS: ABOUT PAGE STICKY REAL-TIME LIVE VISUAL PREVIEW */}
            <div className="xl:col-span-6 xl:sticky xl:top-24 space-y-3">
              
              <div className="flex items-center justify-between p-3 rounded-2xl bg-card border border-border/80 shadow-xs">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground ml-2 truncate">
                    https://sapphiretrails.lk/about #{aboutSection}
                  </span>
                </div>

                <div className="flex items-center bg-muted p-0.5 rounded-xl gap-1">
                  <Button
                    type="button"
                    variant={previewDevice === 'desktop' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setPreviewDevice('desktop')}
                    className="h-7 px-2 rounded-lg text-xs"
                  >
                    <Monitor className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant={previewDevice === 'mobile' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setPreviewDevice('mobile')}
                    className="h-7 px-2 rounded-lg text-xs"
                  >
                    <Smartphone className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Live Preview Canvas for About */}
              <div className={`mx-auto transition-all duration-300 rounded-2xl overflow-hidden border border-border/80 shadow-2xl bg-background text-foreground ${
                previewDevice === 'mobile' ? 'max-w-sm' : 'w-full'
              }`}>
                {content.about.sectionVisibility?.[aboutSection] === false ? (
                  <div className="p-8 sm:p-12 text-center bg-muted/30 border border-dashed border-rose-500/40 rounded-2xl space-y-3 m-3">
                    <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
                      <EyeOff className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-foreground">Section is Inactive (Hidden)</h4>
                      <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                        This section is currently turned OFF and will not be displayed to visitors on the live website.
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleToggleAboutVisibility(aboutSection, true)}
                      className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-4 font-semibold shadow-xs"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1.5" />
                      Activate Section
                    </Button>
                  </div>
                ) : (
                  <div className={getSectionThemeClass(content.about.sectionStyles?.[aboutSection])}>
                    {aboutSection === 'hero' && (
                      <div className="relative min-h-[420px] p-6 sm:p-8 flex flex-col justify-center overflow-hidden bg-slate-950 text-white">
                        <Image src="https://content-provider.payshia.com/sapphire-trail/images/tour-11-optimized.webp" alt="Backdrop" fill className="object-cover opacity-35 brightness-75 -z-0" />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-slate-950/75 to-slate-950/85 z-0 pointer-events-none" />


                    <div className="relative z-10 space-y-4 max-w-lg">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-primary">
                        <Sparkles className="h-3 w-3 text-primary" />
                        <span>{ab.hero.tagline}</span>
                      </div>

                      <h2 className="text-2xl sm:text-3xl font-headline font-bold text-white leading-tight">
                        {ab.hero.title}
                      </h2>

                      <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
                        {ab.hero.subtitle}
                      </p>

                      <div className="pt-2 flex items-center gap-3">
                        <div className="px-4 py-2 rounded-full bg-primary text-primary-foreground font-semibold text-xs shadow-md">
                          Our Heritage &amp; Story
                        </div>
                        <div className="px-4 py-2 rounded-full border border-white/20 bg-white/5 text-white font-medium text-xs">
                          Inquire Concierge
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {aboutSection === 'metrics' && (
                  <div className="p-6 bg-card border-y border-border/80 space-y-4">
                    <div className="text-center space-y-1">
                      <span className="text-[10px] font-semibold text-primary uppercase tracking-wider font-mono">
                        Key Impact Metrics
                      </span>
                      <h4 className="text-base font-headline font-bold text-foreground">Generational Heritage Numbers</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {ab.metrics.map((m, idx) => {
                        const Icon = defaultStatsIcons[idx % defaultStatsIcons.length];
                        return (
                          <div key={idx} className="p-3.5 rounded-xl bg-background border border-border/60 shadow-xs flex items-start gap-3">
                            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-lg font-headline font-bold text-foreground">{m.value}</p>
                              <p className="text-[10px] font-semibold text-primary uppercase">{m.label}</p>
                              <p className="text-[10px] text-muted-foreground line-clamp-1">{m.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {aboutSection === 'story' && (
                  <div className="p-6 bg-background space-y-4">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-wider">
                        <History className="h-3 w-3" /> {ab.story.tagline}
                      </div>
                      <h3 className="text-lg font-headline font-bold text-foreground leading-tight">{ab.story.heading}</h3>
                    </div>

                    {/* 3-Image Collage Live Preview */}
                    <div className="space-y-2">
                      <div className="relative h-28 w-full rounded-xl overflow-hidden border shadow-xs bg-slate-900">
                        <Image src={ab.story.image || 'https://content-provider.payshia.com/sapphire-trail/images/tour-4-optimized.webp'} alt="Story Main Visual" fill className="object-cover" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="relative h-16 w-full rounded-lg overflow-hidden border shadow-xs bg-slate-900">
                          <Image src={ab.story.image2 || 'https://content-provider.payshia.com/sapphire-trail/images/tour-2-optimized.webp'} alt="Sub Photo 1" fill className="object-cover" />
                        </div>
                        <div className="relative h-16 w-full rounded-lg overflow-hidden border shadow-xs bg-slate-900">
                          <Image src={ab.story.image3 || 'https://content-provider.payshia.com/sapphire-trail/images/tour-6-optimized.webp'} alt="Sub Photo 2" fill className="object-cover" />
                        </div>
                      </div>
                    </div>


                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 font-light">
                      {ab.story.paragraph1}
                    </p>

                    {ab.story.quote && (
                      <p className="p-3 rounded-xl bg-muted/40 border-l-3 border-primary text-foreground font-serif italic text-xs">
                        &ldquo;{ab.story.quote}&rdquo;
                      </p>
                    )}

                    <div className="grid grid-cols-3 gap-2 pt-2">
                      <div className="p-2.5 rounded-lg border bg-card text-center space-y-0.5">
                        <span className="text-[9px] font-bold text-primary font-mono">{ab.story.badge1.year}</span>
                        <p className="text-[10px] font-bold text-foreground truncate">{ab.story.badge1.title}</p>
                      </div>
                      <div className="p-2.5 rounded-lg border bg-card text-center space-y-0.5">
                        <span className="text-[9px] font-bold text-primary font-mono">{ab.story.badge2.year}</span>
                        <p className="text-[10px] font-bold text-foreground truncate">{ab.story.badge2.title}</p>
                      </div>
                      <div className="p-2.5 rounded-lg border bg-card text-center space-y-0.5">
                        <span className="text-[9px] font-bold text-primary font-mono">{ab.story.badge3.year}</span>
                        <p className="text-[10px] font-bold text-foreground truncate">{ab.story.badge3.title}</p>
                      </div>
                    </div>
                  </div>
                )}


                {aboutSection === 'experience' && (
                  <div className="p-6 bg-card space-y-4">
                    <div className="text-center space-y-1">
                      <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                        {ab.experience.tagline || 'The Signature Trail'}
                      </span>
                      <h3 className="text-base font-headline font-bold text-primary">{ab.experience.heading}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">{ab.experience.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      {ab.experience.items.map((item, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl border bg-background space-y-1.5">
                          {item.image && (
                            <div className="relative h-16 w-full rounded-lg overflow-hidden border">
                              <Image src={item.image} alt={item.title} fill className="object-cover" />
                            </div>
                          )}
                          <h4 className="text-xs font-headline font-bold text-foreground truncate">{item.title}</h4>
                          <p className="text-[10px] text-muted-foreground line-clamp-2">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {aboutSection === 'values' && (
                  <div className="p-6 bg-background space-y-4">
                    <div className="text-center space-y-1">
                      <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                        {ab.values.tagline}
                      </span>
                      <h3 className="text-base font-headline font-bold text-foreground">{ab.values.heading}</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {ab.values.items.map((val, idx) => {
                        const Icon = defaultValuesIcons[idx % defaultValuesIcons.length];
                        return (
                          <div key={idx} className="p-3 rounded-xl border bg-card space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                <Icon className="h-3.5 w-3.5" />
                              </div>
                              <span className="text-[9px] text-primary font-semibold uppercase">{val.badge}</span>
                            </div>
                            <h4 className="text-xs font-headline font-bold text-foreground">{val.title}</h4>
                            <p className="text-[10px] text-muted-foreground line-clamp-2">{val.description}</p>

                            {((val.points && val.points.length > 0) ? val.points : (defaultPointsPerCard[idx] || [])).length > 0 && (
                              <div className="pt-2 border-t border-border/50 space-y-1">
                                {((val.points && val.points.length > 0) ? val.points : (defaultPointsPerCard[idx] || [])).map((pt, pIdx) => pt ? (
                                  <div key={pIdx} className="flex items-center gap-1.5 text-[9px] text-foreground/80">
                                    <CheckCircle2 className="h-2.5 w-2.5 text-primary shrink-0" />
                                    <span className="truncate">{pt}</span>
                                  </div>
                                ) : null)}
                              </div>
                            )}

                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}


                {aboutSection === 'journey' && (
                  <div className="p-6 bg-card space-y-4">
                    <div className="text-center space-y-1">
                      <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                        {ab.gemJourney.tagline}
                      </span>
                      <h3 className="text-base font-headline font-bold text-primary">{ab.gemJourney.heading}</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      {ab.gemJourney.steps.map((st, idx) => {
                        const Icon = defaultJourneyIcons[idx % defaultJourneyIcons.length];
                        return (
                          <div key={idx} className="p-2.5 rounded-xl border bg-background space-y-2 overflow-hidden">
                            {st.image && (
                              <div className="relative h-20 w-full rounded-lg overflow-hidden border">
                                <Image src={st.image} alt={st.title} fill className="object-cover" />
                              </div>
                            )}
                            <div className="flex items-center gap-1.5 text-primary text-[10px] font-mono font-bold">
                              <Icon className="h-3 w-3" /> STAGE {st.step || `0${idx + 1}`}
                            </div>
                            <h4 className="text-xs font-headline font-bold text-foreground line-clamp-1">{st.title}</h4>
                            <p className="text-[10px] text-muted-foreground line-clamp-2">{st.description}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {aboutSection === 'whyRatnapura' && (
                  <div className="p-6 bg-background space-y-4">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-wider">
                        <Crown className="h-3 w-3" /> {ab.whyRatnapura.tagline}
                      </div>
                      <h3 className="text-lg font-headline font-bold text-foreground leading-tight">{ab.whyRatnapura.heading}</h3>
                    </div>

                    {ab.whyRatnapura.image && (
                      <div className="relative h-28 w-full rounded-xl overflow-hidden border shadow-xs">
                        <Image src={ab.whyRatnapura.image} alt="Why Ratnapura" fill className="object-cover" />
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 font-light">
                      {ab.whyRatnapura.paragraph1}
                    </p>

                    <div className="p-3 rounded-xl bg-card border flex items-center gap-3">
                      <Crown className="h-6 w-6 text-amber-500 shrink-0" />
                      <div className="text-xs">
                        <p className="font-bold text-foreground">{ab.whyRatnapura.factTitle}</p>
                        <p className="text-[11px] text-muted-foreground">{ab.whyRatnapura.factDesc}</p>
                      </div>
                    </div>
                  </div>
                )}


                {aboutSection === 'trustStrip' && (
                  <div className="p-6 bg-card space-y-4">
                    <div className="text-center space-y-1">
                      <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                        Recognized &amp; Certified
                      </span>
                      <h3 className="text-base font-headline font-bold text-foreground">{ab.trustStrip.heading}</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="p-2.5 rounded-xl border bg-background text-center space-y-1">
                        <ShieldCheck className="h-5 w-5 text-primary mx-auto" />
                        <p className="text-xs font-bold text-foreground">NGJA Licensed</p>
                        <p className="text-[10px] text-muted-foreground line-clamp-2">{ab.trustStrip.badge1}</p>
                      </div>
                      <div className="p-2.5 rounded-xl border bg-background text-center space-y-1">
                        <Building2 className="h-5 w-5 text-emerald-500 mx-auto" />
                        <p className="text-xs font-bold text-foreground">SLTDA Compliant</p>
                        <p className="text-[10px] text-muted-foreground line-clamp-2">{ab.trustStrip.badge2}</p>
                      </div>
                      <div className="p-2.5 rounded-xl border bg-background text-center space-y-1">
                        <FileCheck2 className="h-5 w-5 text-blue-500 mx-auto" />
                        <p className="text-xs font-bold text-foreground">GIA Standards</p>
                        <p className="text-[10px] text-muted-foreground line-clamp-2">{ab.trustStrip.badge3}</p>
                      </div>
                      <div className="p-2.5 rounded-xl border bg-background text-center space-y-1">
                        <Award className="h-5 w-5 text-amber-500 mx-auto" />
                        <p className="text-xs font-bold text-foreground">27-Yr Base</p>
                        <p className="text-[10px] text-muted-foreground line-clamp-2">{ab.trustStrip.badge4}</p>
                      </div>
                    </div>
                  </div>
                )}

                    {aboutSection === 'cta' && (
                      <div className="p-6 bg-slate-950 text-white space-y-4 text-center rounded-xl">
                        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-semibold uppercase">
                          <Sparkles className="h-3 w-3" /> {ab.cta.tagline}
                        </div>
                        <h3 className="text-base font-headline font-bold text-white">{ab.cta.heading}</h3>
                        <p className="text-xs text-slate-300 font-light line-clamp-2">{ab.cta.subtitle}</p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                          <div className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1.5 shadow-md">
                            <span>{ab.cta.primaryButtonText}</span>
                          </div>
                          <div className="px-4 py-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-white text-xs font-medium flex items-center gap-1.5">
                            <MessageSquare className="h-3 w-3 text-emerald-400" />
                            <span>{ab.cta.secondaryButtonText}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>

            </div>

          </div>
        </TabsContent>


        {/* 3. TOURS PAGE STUDIO - 4 SUB-SECTIONS WITH SPLIT-SCREEN PREVIEW */}
        <TabsContent value="tours" className="w-full space-y-4">
          
          {/* Tours Sub-Section Navigation Pills */}
          <div className="flex items-center gap-1.5 p-1.5 bg-muted/40 rounded-2xl border border-border/60 overflow-x-auto [scrollbar-width:none]">
            <span className="text-[11px] font-bold text-muted-foreground px-3 shrink-0 uppercase tracking-wider font-mono">
              Sections:
            </span>
            <Button
              type="button"
              variant={toursSection === 'hero' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setToursSection('hero')}
              className="h-8 rounded-xl text-xs shrink-0 gap-1.5 font-semibold"
            >
              <Compass className="h-3.5 w-3.5" />
              <span>1. Hero Banner</span>
            </Button>
            <Button
              type="button"
              variant={toursSection === 'proposalCallout' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setToursSection('proposalCallout')}
              className="h-8 rounded-xl text-xs shrink-0 gap-1.5 font-semibold"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>2. Special Proposal Banner</span>
            </Button>
            <Button
              type="button"
              variant={toursSection === 'guarantees' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setToursSection('guarantees')}
              className="h-8 rounded-xl text-xs shrink-0 gap-1.5 font-semibold"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>3. Guarantees &amp; Inclusions</span>
            </Button>
            <Button
              type="button"
              variant={toursSection === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setToursSection('grid')}
              className="h-8 rounded-xl text-xs shrink-0 gap-1.5 font-semibold"
            >
              <PackageSearch className="h-3.5 w-3.5" />
              <span>4. Tour Grid Settings</span>
            </Button>
          </div>

          {/* Split Screen Grid: Left = Form Editor, Right = Sticky Live Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Form Editor (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* SECTION 1: HERO BANNER */}
              {toursSection === 'hero' && (
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="p-4 pb-3">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <Compass className="h-4 w-4 text-primary" />
                      Tours Page Hero Banner
                    </CardTitle>
                    <CardDescription className="text-xs">
                      The top cinematic banner on /tours with backdrop photo and breadcrumb navigation.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-4">
                    <SectionToolbar
                      title="Hero Banner"
                      isActive={content.tours.sectionVisibility?.hero !== false}
                      onToggleActive={(active) => handleToggleToursVisibility('hero', active)}
                      currentTheme={content.tours.sectionStyles?.hero || 'default'}
                      onChangeTheme={(theme) => handleSetToursTheme('hero', theme)}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Tagline Badge</Label>
                        <Input
                          value={content.tours.hero.tagline}
                          onChange={(e) => setContent({ ...content, tours: { ...content.tours, hero: { ...content.tours.hero, tagline: e.target.value } } })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Main Hero Title</Label>
                        <Input
                          value={content.tours.hero.title}
                          onChange={(e) => setContent({ ...content, tours: { ...content.tours, hero: { ...content.tours.hero, title: e.target.value } } })}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Hero Subtitle</Label>
                      <Textarea
                        rows={2}
                        value={content.tours.hero.subtitle}
                        onChange={(e) => setContent({ ...content, tours: { ...content.tours, hero: { ...content.tours.hero, subtitle: e.target.value } } })}
                      />
                    </div>

                    {/* Backdrop Image Uploader */}
                    <div className="p-3.5 rounded-xl border bg-muted/20 space-y-2">
                      <Label className="text-xs font-bold text-primary flex items-center justify-between">
                        <span>Hero Backdrop Image</span>
                        <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[200px]">{content.tours.hero.image}</span>
                      </Label>
                      <div className="flex items-center gap-3">
                        <div className="relative w-20 h-14 rounded-lg overflow-hidden border border-border bg-slate-900 shrink-0">
                          <Image src={content.tours.hero.image || 'https://content-provider.payshia.com/sapphire-trail/images/img35.webp'} alt="Tours Hero" fill className="object-cover" />
                        </div>
                        <div className="space-y-1 flex-1">
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            ref={toursHeroFileRef}
                            onChange={handleToursHeroImageChange}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => toursHeroFileRef.current?.click()}
                            className="w-full text-xs h-7 gap-1 border-dashed border-primary/40 hover:border-primary hover:bg-primary/5"
                          >
                            <Upload className="h-3 w-3 text-primary" />
                            <span>Upload Backdrop Photo</span>
                          </Button>
                          <Input
                            value={content.tours.hero.image || ''}
                            placeholder="Or paste CDN image URL..."
                            className="text-[10px] h-6 font-mono"
                            onChange={(e) => setContent({ ...content, tours: { ...content.tours, hero: { ...content.tours.hero, image: e.target.value } } })}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* SECTION 2: SPECIAL PROPOSAL CALLOUT BANNER */}
              {toursSection === 'proposalCallout' && (
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="p-4 pb-3">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Special Romantic Proposal Callout Banner
                    </CardTitle>
                    <CardDescription className="text-xs">
                      The luxury spotlight box appearing between the hero and tour grid promoting custom rings.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-4">
                    <SectionToolbar
                      title="Proposal Callout"
                      isActive={content.tours.sectionVisibility?.proposalCallout !== false}
                      onToggleActive={(active) => handleToggleToursVisibility('proposalCallout', active)}
                      currentTheme={content.tours.sectionStyles?.proposalCallout || 'default'}
                      onChangeTheme={(theme) => handleSetToursTheme('proposalCallout', theme)}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Badge Text</Label>
                        <Input
                          value={content.tours.proposalCallout?.badge || ''}
                          placeholder="Special Experience"
                          onChange={(e) => setContent({ ...content, tours: { ...content.tours, proposalCallout: { ...content.tours.proposalCallout, badge: e.target.value } } })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Main Heading</Label>
                        <Input
                          value={content.tours.proposalCallout?.title || ''}
                          onChange={(e) => setContent({ ...content, tours: { ...content.tours, proposalCallout: { ...content.tours.proposalCallout, title: e.target.value } } })}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Description</Label>
                      <Textarea
                        rows={3}
                        value={content.tours.proposalCallout?.description || ''}
                        onChange={(e) => setContent({ ...content, tours: { ...content.tours, proposalCallout: { ...content.tours.proposalCallout, description: e.target.value } } })}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Primary Button Text</Label>
                        <Input
                          value={content.tours.proposalCallout?.primaryButtonText || ''}
                          placeholder="Explore Proposal Package"
                          onChange={(e) => setContent({ ...content, tours: { ...content.tours, proposalCallout: { ...content.tours.proposalCallout, primaryButtonText: e.target.value } } })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Secondary Button Text</Label>
                        <Input
                          value={content.tours.proposalCallout?.secondaryButtonText || ''}
                          placeholder="WhatsApp Concierge"
                          onChange={(e) => setContent({ ...content, tours: { ...content.tours, proposalCallout: { ...content.tours.proposalCallout, secondaryButtonText: e.target.value } } })}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* SECTION 3: GUARANTEES & INCLUSIONS */}
              {toursSection === 'guarantees' && (
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="p-4 pb-3">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      What&apos;s Included &amp; Guarantees Strip
                    </CardTitle>
                    <CardDescription className="text-xs">
                      The 4 core trust pillars displayed below the tour grid on /tours.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-4">
                    <SectionToolbar
                      title="Guarantees Strip"
                      isActive={content.tours.sectionVisibility?.guarantees !== false}
                      onToggleActive={(active) => handleToggleToursVisibility('guarantees', active)}
                      currentTheme={content.tours.sectionStyles?.guarantees || 'default'}
                      onChangeTheme={(theme) => handleSetToursTheme('guarantees', theme)}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Section Tagline</Label>
                        <Input
                          value={content.tours.guaranteesHeader?.tagline || defaultSiteContent.tours.guaranteesHeader?.tagline}
                          onChange={(e) => setContent({ 
                            ...content, 
                            tours: { 
                              ...content.tours, 
                              guaranteesHeader: { 
                                ...(content.tours.guaranteesHeader || defaultSiteContent.tours.guaranteesHeader!), 
                                tagline: e.target.value 
                              } 
                            } 
                          })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Section Heading</Label>
                        <Input
                          value={content.tours.guaranteesHeader?.heading || defaultSiteContent.tours.guaranteesHeader?.heading}
                          onChange={(e) => setContent({ 
                            ...content, 
                            tours: { 
                              ...content.tours, 
                              guaranteesHeader: { 
                                ...(content.tours.guaranteesHeader || defaultSiteContent.tours.guaranteesHeader!), 
                                heading: e.target.value 
                              } 
                            } 
                          })}
                        />
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <Label className="text-xs font-bold text-primary">4 Guarantee Cards</Label>
                      {(content.tours.guarantees || defaultSiteContent.tours.guarantees).map((item, idx) => (
                        <div key={idx} className="p-3 rounded-xl border bg-muted/20 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold font-mono text-primary">Card #{idx + 1}</span>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[11px] font-semibold">Title</Label>
                            <Input
                              value={item.title}
                              className="text-xs h-8 font-semibold"
                              onChange={(e) => {
                                const updated = [...(content.tours.guarantees || defaultSiteContent.tours.guarantees)];
                                updated[idx] = { ...updated[idx], title: e.target.value };
                                setContent({ ...content, tours: { ...content.tours, guarantees: updated } });
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[11px] font-semibold">Description</Label>
                            <Textarea
                              rows={2}
                              value={item.description}
                              className="text-xs"
                              onChange={(e) => {
                                const updated = [...(content.tours.guarantees || defaultSiteContent.tours.guarantees)];
                                updated[idx] = { ...updated[idx], description: e.target.value };
                                setContent({ ...content, tours: { ...content.tours, guarantees: updated } });
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* SECTION 4: TOUR GRID SETTINGS */}
              {toursSection === 'grid' && (
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="p-4 pb-3">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <PackageSearch className="h-4 w-4 text-primary" />
                      Tour Grid Visibility &amp; Theme
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Controls for the filterable tour packages catalogue grid section.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-4">
                    <SectionToolbar
                      title="Tour Grid Section"
                      isActive={content.tours.sectionVisibility?.grid !== false}
                      onToggleActive={(active) => handleToggleToursVisibility('grid', active)}
                      currentTheme={content.tours.sectionStyles?.grid || 'default'}
                      onChangeTheme={(theme) => handleSetToursTheme('grid', theme)}
                    />

                    <div className="p-4 rounded-xl border bg-primary/5 space-y-3">
                      <div className="flex items-center gap-2 text-primary font-semibold text-xs">
                        <Sparkles className="h-4 w-4 shrink-0" />
                        <span>Manage Individual Tour Packages</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        To add new packages, edit itineraries, customize inclusions, or update tour prices and photos, use the dedicated Tour Packages Manager.
                      </p>
                      <Button asChild size="sm" className="gap-1.5 h-8 text-xs font-semibold">
                        <Link href="/admin/manage-packages">
                          <PackageSearch className="h-3.5 w-3.5" />
                          <span>Open Tour Packages Manager</span>
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

            </div>

            {/* Right Column: Sticky Live Preview Canvas (5 cols) */}
            <div className="lg:col-span-5 sticky top-24 space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase font-mono">
                  <Eye className="h-3.5 w-3.5 text-primary" />
                  <span>Tours Page Live Preview</span>
                </div>

                {/* Device responsive toggle */}
                <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-lg border border-border/60">
                  <Button
                    type="button"
                    variant={previewDevice === 'desktop' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setPreviewDevice('desktop')}
                    className="h-6 px-2 text-[11px] gap-1 rounded-md"
                  >
                    <Monitor className="h-3 w-3" /> Desktop
                  </Button>
                  <Button
                    type="button"
                    variant={previewDevice === 'mobile' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setPreviewDevice('mobile')}
                    className="h-6 px-2 text-[11px] gap-1 rounded-md"
                  >
                    <Smartphone className="h-3 w-3" /> Mobile
                  </Button>
                </div>
              </div>

              {/* Preview Window Canvas */}
              <div className={`rounded-2xl border border-border/80 bg-background overflow-hidden shadow-lg transition-all duration-300 ${
                previewDevice === 'mobile' ? 'max-w-xs mx-auto text-xs' : 'w-full'
              }`}>
                
                {/* Simulated Browser Bar */}
                <div className="bg-muted/80 px-3 py-2 border-b border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground/80">https://sapphiretrails.lk/tours</span>
                  <div className="w-4" />
                </div>

                {/* Live Preview Render Area */}
                <div className="divide-y divide-border/40">
                  
                  {/* Hero Preview */}
                  {toursSection === 'hero' && (
                    <div className="relative p-6 bg-slate-950 text-white overflow-hidden space-y-3">
                      <div className="absolute inset-0 z-0">
                        <Image
                          src={content.tours.hero.image || 'https://content-provider.payshia.com/sapphire-trail/images/img35.webp'}
                          alt="Hero Backdrop"
                          fill
                          className="object-cover opacity-30"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/90" />
                      </div>
                      <div className="relative z-10 space-y-2">
                        <span className="text-[10px] font-mono font-semibold text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-full border border-primary/30">
                          {content.tours.hero.tagline}
                        </span>
                        <h3 className="text-lg font-headline font-bold text-white leading-tight">
                          {content.tours.hero.title}
                        </h3>
                        <p className="text-xs text-slate-300 font-light line-clamp-3">
                          {content.tours.hero.subtitle}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Proposal Callout Preview */}
                  {toursSection === 'proposalCallout' && (
                    <div className="p-4 bg-background">
                      <div className="p-4 rounded-xl bg-gradient-to-br from-card via-background to-card border border-primary/40 space-y-2">
                        <span className="text-[9px] font-serif font-bold uppercase tracking-widest text-primary bg-primary/15 px-2 py-0.5 rounded-full">
                          {content.tours.proposalCallout?.badge || 'Special Experience'}
                        </span>
                        <h4 className="text-sm font-headline font-bold text-foreground leading-tight">
                          {content.tours.proposalCallout?.title}
                        </h4>
                        <p className="text-[10px] text-muted-foreground line-clamp-2">
                          {content.tours.proposalCallout?.description}
                        </p>
                        <div className="flex gap-2 pt-1">
                          <div className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-[9px] font-semibold">
                            {content.tours.proposalCallout?.primaryButtonText || 'Explore Proposal'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Guarantees Preview */}
                  {toursSection === 'guarantees' && (
                    <div className="p-5 bg-background-alt space-y-3">
                      <div className="text-center space-y-0.5">
                        <span className="text-[9px] font-serif uppercase tracking-widest text-primary font-bold">
                          {content.tours.guaranteesHeader?.tagline || defaultSiteContent.tours.guaranteesHeader?.tagline}
                        </span>
                        <h4 className="text-xs font-headline font-bold text-foreground">
                          {content.tours.guaranteesHeader?.heading || defaultSiteContent.tours.guaranteesHeader?.heading}
                        </h4>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {(content.tours.guarantees || defaultSiteContent.tours.guarantees).map((g, i) => (
                          <div key={i} className="p-2 rounded-lg bg-card border text-[9px] space-y-0.5">
                            <h5 className="font-bold text-foreground truncate">{g.title}</h5>
                            <p className="text-muted-foreground line-clamp-2 text-[8px] leading-tight">{g.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Grid Preview */}
                  {toursSection === 'grid' && (
                    <div className="p-5 bg-card space-y-3">
                      <div className="flex items-center justify-between pb-1 border-b">
                        <span className="text-xs font-bold font-headline">Available Tour Packages</span>
                        <span className="text-[10px] text-muted-foreground">Single-Day &amp; Multi-Day</span>
                      </div>
                      <div className="space-y-2">
                        <div className="p-2.5 rounded-xl border bg-background flex gap-2.5 items-center">
                          <div className="w-12 h-10 rounded-lg bg-slate-900 overflow-hidden relative shrink-0">
                            <Image src="https://content-provider.payshia.com/sapphire-trail/images/tour-1-optimized.webp" alt="Tour" fill className="object-cover" />
                          </div>
                          <div className="space-y-0.5 flex-1 min-w-0">
                            <h5 className="text-[11px] font-bold truncate">Exclusive Pit Descent Expedition</h5>
                            <p className="text-[9px] text-muted-foreground">Full Day • VIP Private Tour</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>

          </div>

        </TabsContent>


        {/* 4. PROPOSAL PACKAGE TAB - 5 COMPLETE SUB-SECTIONS WITH SPLIT-SCREEN PREVIEW */}
        <TabsContent value="proposal" className="w-full space-y-4">
          
          {/* Proposal Sub-Section Navigation Pills */}
          <div className="flex items-center gap-1.5 p-1.5 bg-muted/40 rounded-2xl border border-border/60 overflow-x-auto [scrollbar-width:none]">
            <span className="text-[11px] font-bold text-muted-foreground px-3 shrink-0 uppercase tracking-wider font-mono">
              Sections:
            </span>
            <Button
              type="button"
              variant={proposalSection === 'hero' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setProposalSection('hero')}
              className="h-8 rounded-xl text-xs shrink-0 gap-1.5 font-semibold"
            >
              <Sparkles className="h-3.5 w-3.5" /> 1. Hero Banner
            </Button>
            <Button
              type="button"
              variant={proposalSection === 'overview' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setProposalSection('overview')}
              className="h-8 rounded-xl text-xs shrink-0 gap-1.5 font-semibold"
            >
              <Heart className="h-3.5 w-3.5" /> 2. Story Overview
            </Button>
            <Button
              type="button"
              variant={proposalSection === 'pillars' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setProposalSection('pillars')}
              className="h-8 rounded-xl text-xs shrink-0 gap-1.5 font-semibold"
            >
              <Gem className="h-3.5 w-3.5" /> 3. 4 Experience Pillars
            </Button>
            <Button
              type="button"
              variant={proposalSection === 'timeline' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setProposalSection('timeline')}
              className="h-8 rounded-xl text-xs shrink-0 gap-1.5 font-semibold"
            >
              <Clock className="h-3.5 w-3.5" /> 4. 5-Stage Timeline
            </Button>
            <Button
              type="button"
              variant={proposalSection === 'faqs' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setProposalSection('faqs')}
              className="h-8 rounded-xl text-xs shrink-0 gap-1.5 font-semibold"
            >
              <HelpCircle className="h-3.5 w-3.5" /> 5. Proposal FAQs
            </Button>
          </div>

          {/* Focused Split Screen: Left Editor (6 cols) | Right Live Preview (6 cols) */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            
            {/* LEFT 6 COLS: FOCUSED PROPOSAL SECTION EDITOR */}
            <div className="xl:col-span-6 space-y-4">
              
              {/* Universal Section Visibility & Background Theme Toolbar */}
              <SectionToolbar
                title="Selected Section"
                isActive={content.proposal.sectionVisibility?.[proposalSection] !== false}
                onToggleActive={(active) => handleToggleProposalVisibility(proposalSection, active)}
                currentTheme={content.proposal.sectionStyles?.[proposalSection] || 'default'}
                onChangeTheme={(theme) => handleSetProposalTheme(proposalSection, theme)}
              />

              {/* Section 1: Hero */}
              {proposalSection === 'hero' && (
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      1. Proposal Page Cinematic Hero
                    </CardTitle>
                    <CardDescription>Configure badge, main heading, and narrative subheadline.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Pill Badge Tagline</Label>
                        <Input
                          value={content.proposal.hero?.tagline || ''}
                          placeholder="5-Day Atelier Engagement Ring Crafting"
                          onChange={(e) => setContent({ ...content, proposal: { ...content.proposal, hero: { ...content.proposal.hero, tagline: e.target.value } } })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Main Heading</Label>
                        <Input
                          value={content.proposal.hero?.title || ''}
                          placeholder="Custom Proposal & Bespoke Ring Package"
                          onChange={(e) => setContent({ ...content, proposal: { ...content.proposal, hero: { ...content.proposal.hero, title: e.target.value } } })}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Subtitle Description</Label>
                      <Textarea
                        rows={3}
                        value={content.proposal.hero?.subtitle || ''}
                        onChange={(e) => setContent({ ...content, proposal: { ...content.proposal, hero: { ...content.proposal.hero, subtitle: e.target.value } } })}
                      />
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Button type="button" size="sm" onClick={() => setProposalSection('overview')} className="text-xs gap-1.5">
                        Next: Story Overview <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Section 2: Story Overview */}
              {proposalSection === 'overview' && (
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                      <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />
                      2. Overview &amp; Romantic Story
                    </CardTitle>
                    <CardDescription>Story narrative, featured craftsmanship photo, and CTA buttons.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Tagline Sub-header</Label>
                        <Input
                          value={content.proposal.overview?.tagline || ''}
                          placeholder="GEM TOUR • BESPOKE RING • 5-DAY DELIVERY"
                          onChange={(e) => setContent({ ...content, proposal: { ...content.proposal, overview: { ...content.proposal.overview, tagline: e.target.value } } })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Section Heading</Label>
                        <Input
                          value={content.proposal.overview?.heading || ''}
                          placeholder="A Romantic Journey in the City of Gems"
                          onChange={(e) => setContent({ ...content, proposal: { ...content.proposal, overview: { ...content.proposal.overview, heading: e.target.value } } })}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Story Paragraph 1</Label>
                      <Textarea
                        rows={3}
                        value={content.proposal.overview?.paragraph1 || ''}
                        onChange={(e) => setContent({ ...content, proposal: { ...content.proposal, overview: { ...content.proposal.overview, paragraph1: e.target.value } } })}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Story Paragraph 2</Label>
                      <Textarea
                        rows={3}
                        value={content.proposal.overview?.paragraph2 || ''}
                        onChange={(e) => setContent({ ...content, proposal: { ...content.proposal, overview: { ...content.proposal.overview, paragraph2: e.target.value } } })}
                      />
                    </div>

                    {/* Featured Image Uploader */}
                    <div className="space-y-2 p-3.5 rounded-xl border border-primary/20 bg-primary/5">
                      <Label className="text-xs font-semibold flex items-center justify-between">
                        <span>Featured Story Photo</span>
                        <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[200px]">{content.proposal.overview?.image}</span>
                      </Label>
                      <div className="flex gap-2 items-center">
                        <Input
                          value={content.proposal.overview?.image || ''}
                          placeholder="https://content-provider.payshia.com/..."
                          className="text-xs font-mono"
                          onChange={(e) => setContent({ ...content, proposal: { ...content.proposal, overview: { ...content.proposal.overview, image: e.target.value } } })}
                        />
                        <input
                          type="file"
                          accept="image/*"
                          ref={proposalOverviewFileRef}
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            toast({ title: 'Uploading to FTP...', description: `Uploading ${file.name} to FTP /cms/proposal folder...` });
                            try {
                              const res = await uploadCmsImage(file, 'cms/proposal');
                              setContent({ ...content, proposal: { ...content.proposal, overview: { ...content.proposal.overview, image: res.url } } });
                              toast({ title: 'Image Uploaded to FTP!', description: `Permanent CDN URL: ${res.url}` });
                            } catch (err: any) {
                              toast({ variant: 'destructive', title: 'Upload Failed', description: err.message || 'Could not upload to FTP server' });
                            }
                          }}
                        />

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => proposalOverviewFileRef.current?.click()}
                          className="h-9 px-3 text-xs gap-1.5 shrink-0 bg-background hover:bg-muted"
                        >
                          <Upload className="h-3.5 w-3.5 text-primary" /> Upload
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Primary Button Text</Label>
                        <Input
                          value={content.proposal.overview?.primaryButtonText || 'Inquire For Custom Quote'}
                          onChange={(e) => setContent({ ...content, proposal: { ...content.proposal, overview: { ...content.proposal.overview, primaryButtonText: e.target.value } } })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">WhatsApp Button Text</Label>
                        <Input
                          value={content.proposal.overview?.secondaryButtonText || 'WhatsApp Concierge'}
                          onChange={(e) => setContent({ ...content, proposal: { ...content.proposal, overview: { ...content.proposal.overview, secondaryButtonText: e.target.value } } })}
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-between">
                      <Button type="button" variant="outline" size="sm" onClick={() => setProposalSection('hero')} className="text-xs gap-1.5">
                        <ArrowLeft className="h-3.5 w-3.5" /> Hero Banner
                      </Button>
                      <Button type="button" size="sm" onClick={() => setProposalSection('pillars')} className="text-xs gap-1.5">
                        Next: 4 Pillars <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Section 3: 4 Experience Pillars */}
              {proposalSection === 'pillars' && (() => {
                const pillarItems = (content.proposal.pillars?.items && content.proposal.pillars.items.length > 0)
                  ? content.proposal.pillars.items
                  : defaultSiteContent.proposal.pillars.items;

                return (
                  <Card className="border-border/80 shadow-xs">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                        <Gem className="h-4 w-4 text-primary" />
                        3. The 4 Experience Pillars
                      </CardTitle>
                      <CardDescription>Manage titles, narratives, and images for the 4 core experience cards.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs font-semibold">Section Heading</Label>
                          <Input
                            value={content.proposal.pillars?.heading || defaultSiteContent.proposal.pillars.heading}
                            placeholder="The 4 Pillars of Your Proposal Journey"
                            onChange={(e) => setContent({ ...content, proposal: { ...content.proposal, pillars: { ...content.proposal.pillars, heading: e.target.value, items: pillarItems } } })}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-semibold">Section Subtitle</Label>
                          <Input
                            value={content.proposal.pillars?.subtitle || defaultSiteContent.proposal.pillars.subtitle}
                            placeholder="From ethical mining pits in Ratnapura to an exquisite custom engagement ring..."
                            onChange={(e) => setContent({ ...content, proposal: { ...content.proposal, pillars: { ...content.proposal.pillars, subtitle: e.target.value, items: pillarItems } } })}
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        {pillarItems.map((item, idx) => (
                          <div key={idx} className="p-3.5 rounded-xl border border-border/80 bg-muted/20 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-primary font-mono">PILLAR #{idx + 1}</span>
                              <Badge variant="outline" className="text-[10px]">Card {idx + 1}</Badge>
                            </div>

                            <div className="space-y-1">
                              <Label className="text-xs font-semibold">Pillar Title</Label>
                              <Input
                                value={item.title}
                                onChange={(e) => {
                                  const updated = [...pillarItems];
                                  updated[idx] = { ...updated[idx], title: e.target.value };
                                  setContent({ ...content, proposal: { ...content.proposal, pillars: { ...content.proposal.pillars, items: updated } } });
                                }}
                              />
                            </div>

                            <div className="space-y-1">
                              <Label className="text-xs font-semibold">Pillar Description</Label>
                              <Textarea
                                rows={2}
                                value={item.description}
                                onChange={(e) => {
                                  const updated = [...pillarItems];
                                  updated[idx] = { ...updated[idx], description: e.target.value };
                                  setContent({ ...content, proposal: { ...content.proposal, pillars: { ...content.proposal.pillars, items: updated } } });
                                }}
                              />
                            </div>

                            {/* Image upload */}
                            <div className="space-y-1.5 pt-1">
                              <Label className="text-[11px] font-semibold text-muted-foreground">Card Photo</Label>
                              <div className="flex gap-2 items-center">
                                <Input
                                  value={item.image}
                                  className="text-xs font-mono h-8"
                                  onChange={(e) => {
                                    const updated = [...pillarItems];
                                    updated[idx] = { ...updated[idx], image: e.target.value };
                                    setContent({ ...content, proposal: { ...content.proposal, pillars: { ...content.proposal.pillars, items: updated } } });
                                  }}
                                />
                                <input
                                  type="file"
                                  accept="image/*"
                                  ref={(el) => { proposalPillarFileRefs.current[idx] = el; }}
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    toast({ title: 'Uploading to FTP...', description: `Uploading Pillar #${idx + 1} photo to FTP /cms/proposal/pillars folder...` });
                                    try {
                                      const res = await uploadCmsImage(file, 'cms/proposal/pillars');
                                      const updated = [...pillarItems];
                                      updated[idx] = { ...updated[idx], image: res.url };
                                      setContent({ ...content, proposal: { ...content.proposal, pillars: { ...content.proposal.pillars, items: updated } } });
                                      toast({ title: 'Pillar Photo Uploaded to FTP!', description: `Permanent CDN URL: ${res.url}` });
                                    } catch (err: any) {
                                      toast({ variant: 'destructive', title: 'Upload Failed', description: err.message || 'Could not upload to FTP server' });
                                    }
                                  }}
                                />

                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => proposalPillarFileRefs.current[idx]?.click()}
                                  className="h-8 px-2.5 text-xs gap-1 shrink-0 bg-background"
                                >
                                  <Upload className="h-3 w-3 text-primary" /> Upload
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 flex justify-between">
                        <Button type="button" variant="outline" size="sm" onClick={() => setProposalSection('overview')} className="text-xs gap-1.5">
                          <ArrowLeft className="h-3.5 w-3.5" /> Story Overview
                        </Button>
                        <Button type="button" size="sm" onClick={() => setProposalSection('timeline')} className="text-xs gap-1.5">
                          Next: 5-Stage Timeline <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })()}

              {/* Section 4: 5-Stage Journey Timeline */}
              {proposalSection === 'timeline' && (() => {
                const timelineSteps = (content.proposal.timeline?.steps && content.proposal.timeline.steps.length > 0)
                  ? content.proposal.timeline.steps
                  : defaultSiteContent.proposal.timeline.steps;

                return (
                  <Card className="border-border/80 shadow-xs">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        4. 5-Stage Journey Timeline
                      </CardTitle>
                      <CardDescription>Configure day-by-day expedition and manufacturing timeline.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs font-semibold">Section Tagline</Label>
                          <Input
                            value={content.proposal.timeline?.tagline || defaultSiteContent.proposal.timeline.tagline}
                            placeholder="THE 5-STAGE JOURNEY"
                            onChange={(e) => setContent({ ...content, proposal: { ...content.proposal, timeline: { ...content.proposal.timeline, tagline: e.target.value, steps: timelineSteps } } })}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-semibold">Section Heading</Label>
                          <Input
                            value={content.proposal.timeline?.heading || defaultSiteContent.proposal.timeline.heading}
                            placeholder="From Mine To Ring In 5 Days"
                            onChange={(e) => setContent({ ...content, proposal: { ...content.proposal, timeline: { ...content.proposal.timeline, heading: e.target.value, steps: timelineSteps } } })}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Timeline Subtitle</Label>
                        <Textarea
                          rows={2}
                          value={content.proposal.timeline?.subtitle || defaultSiteContent.proposal.timeline.subtitle}
                          onChange={(e) => setContent({ ...content, proposal: { ...content.proposal, timeline: { ...content.proposal.timeline, subtitle: e.target.value, steps: timelineSteps } } })}
                        />
                      </div>

                      <div className="space-y-3">
                        {timelineSteps.map((step, idx) => (
                          <div key={idx} className="p-3.5 rounded-xl border border-border/80 bg-muted/20 space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <Label className="text-[11px] font-semibold text-primary font-mono">Step ID</Label>
                                <Input
                                  value={step.time}
                                  className="h-8 text-xs font-semibold"
                                  placeholder="Step 01"
                                  onChange={(e) => {
                                    const updated = [...timelineSteps];
                                    updated[idx] = { ...updated[idx], time: e.target.value };
                                    setContent({ ...content, proposal: { ...content.proposal, timeline: { ...content.proposal.timeline, steps: updated } } });
                                  }}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-[11px] font-semibold text-muted-foreground font-mono">Day &amp; Time</Label>
                                <Input
                                  value={step.step}
                                  className="h-8 text-xs font-semibold"
                                  placeholder="Day 1 (Morning)"
                                  onChange={(e) => {
                                    const updated = [...timelineSteps];
                                    updated[idx] = { ...updated[idx], step: e.target.value };
                                    setContent({ ...content, proposal: { ...content.proposal, timeline: { ...content.proposal.timeline, steps: updated } } });
                                  }}
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <Label className="text-xs font-semibold">Stage Title</Label>
                              <Input
                                value={step.title}
                                onChange={(e) => {
                                  const updated = [...timelineSteps];
                                  updated[idx] = { ...updated[idx], title: e.target.value };
                                  setContent({ ...content, proposal: { ...content.proposal, timeline: { ...content.proposal.timeline, steps: updated } } });
                                }}
                              />
                            </div>

                            <div className="space-y-1">
                              <Label className="text-xs font-semibold">Stage Description</Label>
                              <Textarea
                                rows={2}
                                value={step.description}
                                onChange={(e) => {
                                  const updated = [...timelineSteps];
                                  updated[idx] = { ...updated[idx], description: e.target.value };
                                  setContent({ ...content, proposal: { ...content.proposal, timeline: { ...content.proposal.timeline, steps: updated } } });
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 flex justify-between">
                        <Button type="button" variant="outline" size="sm" onClick={() => setProposalSection('pillars')} className="text-xs gap-1.5">
                          <ArrowLeft className="h-3.5 w-3.5" /> 4 Pillars
                        </Button>
                        <Button type="button" size="sm" onClick={() => setProposalSection('faqs')} className="text-xs gap-1.5">
                          Next: Proposal FAQs <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })()}

              {/* Section 5: Proposal FAQs */}
              {proposalSection === 'faqs' && (() => {
                const faqItems = (content.proposal.faqs?.items && content.proposal.faqs.items.length > 0)
                  ? content.proposal.faqs.items
                  : defaultSiteContent.proposal.faqs.items;

                return (
                  <Card className="border-border/80 shadow-xs">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                        <HelpCircle className="h-4 w-4 text-primary" />
                        5. Proposal Package FAQs
                      </CardTitle>
                      <CardDescription>Questions and answers for bespoke proposals and ring crafting.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Section Heading</Label>
                        <Input
                          value={content.proposal.faqs?.heading || defaultSiteContent.proposal.faqs.heading}
                          placeholder="Proposal Package FAQ"
                          onChange={(e) => setContent({ ...content, proposal: { ...content.proposal, faqs: { ...content.proposal.faqs, heading: e.target.value, items: faqItems } } })}
                        />
                      </div>

                      <div className="space-y-3">
                        {faqItems.map((faq, idx) => (
                          <div key={idx} className="p-3.5 rounded-xl border border-border/80 bg-muted/20 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-primary font-mono">FAQ #{idx + 1}</span>
                              <Badge variant="outline" className="text-[10px]">Question {idx + 1}</Badge>
                            </div>

                            <div className="space-y-1">
                              <Label className="text-xs font-semibold">Question</Label>
                              <Input
                                value={faq.question}
                                onChange={(e) => {
                                  const updated = [...faqItems];
                                  updated[idx] = { ...updated[idx], question: e.target.value };
                                  setContent({ ...content, proposal: { ...content.proposal, faqs: { ...content.proposal.faqs, items: updated } } });
                                }}
                              />
                            </div>

                            <div className="space-y-1">
                              <Label className="text-xs font-semibold">Answer</Label>
                              <Textarea
                                rows={3}
                                value={faq.answer}
                                onChange={(e) => {
                                  const updated = [...faqItems];
                                  updated[idx] = { ...updated[idx], answer: e.target.value };
                                  setContent({ ...content, proposal: { ...content.proposal, faqs: { ...content.proposal.faqs, items: updated } } });
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 flex justify-start">
                        <Button type="button" variant="outline" size="sm" onClick={() => setProposalSection('timeline')} className="text-xs gap-1.5">
                          <ArrowLeft className="h-3.5 w-3.5" /> 5-Stage Timeline
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })()}


            </div>

            {/* RIGHT 6 COLS: PROPOSAL PACKAGE STICKY REAL-TIME LIVE VISUAL PREVIEW */}
            <div className="xl:col-span-6 xl:sticky xl:top-24 space-y-3">
              
              <div className="flex items-center justify-between p-3 rounded-2xl bg-card border border-border/80 shadow-xs">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground ml-2 truncate">
                    https://sapphiretrails.lk/custom-proposal-package #{proposalSection}
                  </span>
                </div>

                <div className="flex items-center bg-muted p-0.5 rounded-xl gap-1">
                  <Button
                    type="button"
                    variant={previewDevice === 'desktop' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setPreviewDevice('desktop')}
                    className="h-7 px-2 rounded-lg text-xs"
                  >
                    <Monitor className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant={previewDevice === 'mobile' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setPreviewDevice('mobile')}
                    className="h-7 px-2 rounded-lg text-xs"
                  >
                    <Smartphone className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Live Preview Canvas for Proposal Package */}
              <div className={`mx-auto transition-all duration-300 rounded-2xl overflow-hidden border border-border/80 shadow-2xl bg-background text-foreground ${
                previewDevice === 'mobile' ? 'max-w-sm' : 'w-full'
              }`}>
                {content.proposal.sectionVisibility?.[proposalSection] === false ? (
                  <div className="p-8 sm:p-12 text-center bg-muted/30 border border-dashed border-rose-500/40 rounded-2xl space-y-3 m-3">
                    <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
                      <EyeOff className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-foreground">Section is Inactive (Hidden)</h4>
                      <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                        This section is currently turned OFF and will not be displayed to visitors on the live website.
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleToggleProposalVisibility(proposalSection, true)}
                      className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-4 font-semibold shadow-xs"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1.5" />
                      Activate Section
                    </Button>
                  </div>
                ) : (
                  <div className={getSectionThemeClass(content.proposal.sectionStyles?.[proposalSection])}>
                    
                    {proposalSection === 'hero' && (
                      <div className="relative min-h-[380px] p-6 sm:p-8 flex flex-col justify-center text-center overflow-hidden bg-slate-950 text-white">
                        <Image src="https://content-provider.payshia.com/sapphire-trail/images/tour-7-optimized.webp" alt="Backdrop" fill className="object-cover opacity-25 brightness-75 -z-0" />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/80 z-0 pointer-events-none" />

                        <div className="relative z-10 flex flex-col items-center justify-center space-y-4 max-w-lg mx-auto">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 border border-primary/40 text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-primary shadow-md">
                            <Sparkles className="h-3 w-3 text-primary shrink-0" />
                            <span>{content.proposal.hero?.tagline}</span>
                          </div>

                          <h2 className="text-xl sm:text-2xl md:text-3xl font-headline font-bold text-white leading-tight">
                            {content.proposal.hero?.title}
                          </h2>

                          <p className="text-xs sm:text-sm text-slate-200 font-light leading-relaxed max-w-md">
                            {content.proposal.hero?.subtitle}
                          </p>

                          <div className="flex items-center gap-2 pt-2">
                            <div className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-md flex items-center gap-1.5">
                              <Heart className="h-3.5 w-3.5" /> Inquire For Quote
                            </div>
                            <div className="px-4 py-2 rounded-full border border-white/30 text-white text-xs font-medium">
                              WhatsApp Concierge
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {proposalSection === 'overview' && (
                      <div className="p-6 bg-card space-y-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-semibold text-primary uppercase tracking-widest font-serif">
                            {content.proposal.overview?.tagline}
                          </span>
                          <h3 className="text-base sm:text-lg font-headline font-bold text-primary">
                            {content.proposal.overview?.heading}
                          </h3>
                        </div>

                        {content.proposal.overview?.image && (
                          <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border shadow-xs">
                            <Image src={content.proposal.overview.image} alt="Story photo" fill className="object-cover" />
                          </div>
                        )}

                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                          {content.proposal.overview?.paragraph1}
                        </p>

                        <div className="flex items-center gap-2 pt-1">
                          <div className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold flex items-center gap-1 shadow-xs">
                            <Heart className="h-3 w-3" />
                            <span>{content.proposal.overview?.primaryButtonText || 'Inquire For Custom Quote'}</span>
                          </div>
                          <div className="px-3 py-1.5 rounded-full border border-border text-foreground text-[10px] font-medium">
                            <span>{content.proposal.overview?.secondaryButtonText || 'WhatsApp Concierge'}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {proposalSection === 'pillars' && (() => {
                      const prevPillars = (content.proposal.pillars?.items && content.proposal.pillars.items.length > 0)
                        ? content.proposal.pillars.items
                        : defaultSiteContent.proposal.pillars.items;

                      return (
                        <div className="p-6 bg-card space-y-4">
                          <div className="text-center space-y-1">
                            <h3 className="text-base font-headline font-bold text-primary">{content.proposal.pillars?.heading || defaultSiteContent.proposal.pillars.heading}</h3>
                            <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">{content.proposal.pillars?.subtitle || defaultSiteContent.proposal.pillars.subtitle}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-2.5">
                            {prevPillars.map((item, i) => (
                              <div key={i} className="rounded-xl border bg-background overflow-hidden space-y-1.5 pb-2">
                                <div className="relative aspect-[3/2] w-full bg-slate-900">
                                  <Image src={item.image} alt={item.title} fill className="object-cover" />
                                </div>
                                <div className="px-2">
                                  <h4 className="text-[11px] font-headline font-bold text-primary truncate">{item.title}</h4>
                                  <p className="text-[9px] text-muted-foreground line-clamp-2 leading-tight">{item.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                    {proposalSection === 'timeline' && (() => {
                      const prevTimeline = (content.proposal.timeline?.steps && content.proposal.timeline.steps.length > 0)
                        ? content.proposal.timeline.steps
                        : defaultSiteContent.proposal.timeline.steps;

                      return (
                        <div className="p-6 bg-card space-y-4">
                          <div className="text-center space-y-1">
                            <span className="text-[10px] font-semibold text-primary uppercase tracking-widest font-mono">
                              {content.proposal.timeline?.tagline || defaultSiteContent.proposal.timeline.tagline}
                            </span>
                            <h3 className="text-base font-headline font-bold text-foreground">{content.proposal.timeline?.heading || defaultSiteContent.proposal.timeline.heading}</h3>
                          </div>

                          <div className="space-y-2">
                            {prevTimeline.map((step, i) => (
                              <div key={i} className="p-2.5 rounded-xl border bg-background flex gap-2.5 items-start">
                                <div className="shrink-0 text-center w-14 pt-0.5">
                                  <span className="text-[10px] font-bold text-primary font-mono block leading-tight">{step.time}</span>
                                  <span className="text-[8px] text-muted-foreground">{step.step}</span>
                                </div>
                                <div className="space-y-0.5">
                                  <h4 className="text-[11px] font-bold text-foreground leading-tight">{step.title}</h4>
                                  <p className="text-[9px] text-muted-foreground line-clamp-2 leading-tight">{step.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                    {proposalSection === 'faqs' && (() => {
                      const prevFaqs = (content.proposal.faqs?.items && content.proposal.faqs.items.length > 0)
                        ? content.proposal.faqs.items
                        : defaultSiteContent.proposal.faqs.items;

                      return (
                        <div className="p-6 bg-card space-y-3">
                          <div className="text-center pb-1">
                            <h3 className="text-base font-headline font-bold text-primary">{content.proposal.faqs?.heading || defaultSiteContent.proposal.faqs.heading}</h3>
                          </div>
                          <div className="space-y-2">
                            {prevFaqs.map((faq, i) => (
                              <div key={i} className="p-2.5 rounded-xl border bg-background space-y-1">
                                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                  <HelpCircle className="h-3 w-3 text-primary shrink-0" />
                                  <span>{faq.question}</span>
                                </h4>
                                <p className="text-[10px] text-muted-foreground pl-4 leading-relaxed line-clamp-3">
                                  {faq.answer}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}


                  </div>
                )}
              </div>

            </div>

          </div>
        </TabsContent>


        {/* 5. EXPLORE RATNAPURA STUDIO - 4 SUB-SECTIONS WITH SPLIT-SCREEN PREVIEW */}
        <TabsContent value="explore" className="w-full space-y-4">
          
          {/* Explore Sub-Section Navigation Pills */}
          <div className="flex items-center gap-1.5 p-1.5 bg-muted/40 rounded-2xl border border-border/60 overflow-x-auto [scrollbar-width:none]">
            <span className="text-[11px] font-bold text-muted-foreground px-3 shrink-0 uppercase tracking-wider font-mono">
              Sections:
            </span>
            <Button
              type="button"
              variant={exploreSection === 'hero' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setExploreSection('hero')}
              className="h-8 rounded-xl text-xs shrink-0 gap-1.5 font-semibold"
            >
              <MapPin className="h-3.5 w-3.5" />
              <span>1. Hero Banner</span>
            </Button>
            <Button
              type="button"
              variant={exploreSection === 'catalog' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setExploreSection('catalog')}
              className="h-8 rounded-xl text-xs shrink-0 gap-1.5 font-semibold"
            >
              <Compass className="h-3.5 w-3.5" />
              <span>2. Catalog &amp; Filter Header</span>
            </Button>
            <Button
              type="button"
              variant={exploreSection === 'intro' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setExploreSection('intro')}
              className="h-8 rounded-xl text-xs shrink-0 gap-1.5 font-semibold"
            >
              <History className="h-3.5 w-3.5" />
              <span>3. Heritage Story / Intro</span>
            </Button>
            <Button
              type="button"
              variant={exploreSection === 'locations' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setExploreSection('locations')}
              className="h-8 rounded-xl text-xs shrink-0 gap-1.5 font-semibold"
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>4. Individual Attractions</span>
            </Button>
          </div>

          {/* Split Screen Grid: Left = Form Editor, Right = Sticky Live Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Form Editor (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* SECTION 1: HERO BANNER */}
              {exploreSection === 'hero' && (
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="p-4 pb-3">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      Explore Ratnapura Hero Banner
                    </CardTitle>
                    <CardDescription className="text-xs">
                      The cinematic header on /explore-ratnapura with backdrop photo and breadcrumb navigation.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-4">
                    <SectionToolbar
                      title="Hero Banner"
                      isActive={content.explore.sectionVisibility?.hero !== false}
                      onToggleActive={(active) => handleToggleExploreVisibility('hero', active)}
                      currentTheme={content.explore.sectionStyles?.hero || 'default'}
                      onChangeTheme={(theme) => handleSetExploreTheme('hero', theme)}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Tagline Badge</Label>
                        <Input
                          value={content.explore.hero.tagline}
                          onChange={(e) => setContent({ ...content, explore: { ...content.explore, hero: { ...content.explore.hero, tagline: e.target.value } } })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Main Hero Title</Label>
                        <Input
                          value={content.explore.hero.title}
                          onChange={(e) => setContent({ ...content, explore: { ...content.explore, hero: { ...content.explore.hero, title: e.target.value } } })}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Hero Subtitle</Label>
                      <Textarea
                        rows={2}
                        value={content.explore.hero.subtitle}
                        onChange={(e) => setContent({ ...content, explore: { ...content.explore, hero: { ...content.explore.hero, subtitle: e.target.value } } })}
                      />
                    </div>

                    {/* Backdrop Image Uploader */}
                    <div className="p-3.5 rounded-xl border bg-muted/20 space-y-2">
                      <Label className="text-xs font-bold text-primary flex items-center justify-between">
                        <span>Hero Backdrop Image</span>
                        <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[200px]">{content.explore.hero.image}</span>
                      </Label>
                      <div className="flex items-center gap-3">
                        <div className="relative w-20 h-14 rounded-lg overflow-hidden border border-border bg-slate-900 shrink-0">
                          <Image src={content.explore.hero.image || 'https://content-provider.payshia.com/sapphire-trail/images/img33.webp'} alt="Explore Hero" fill className="object-cover" />
                        </div>
                        <div className="space-y-1 flex-1">
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            ref={exploreHeroFileRef}
                            onChange={handleExploreHeroImageChange}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => exploreHeroFileRef.current?.click()}
                            className="w-full text-xs h-7 gap-1 border-dashed border-primary/40 hover:border-primary hover:bg-primary/5"
                          >
                            <Upload className="h-3 w-3 text-primary" />
                            <span>Upload Backdrop Photo</span>
                          </Button>
                          <Input
                            value={content.explore.hero.image || ''}
                            placeholder="Or paste CDN image URL..."
                            className="text-[10px] h-6 font-mono"
                            onChange={(e) => setContent({ ...content, explore: { ...content.explore, hero: { ...content.explore.hero, image: e.target.value } } })}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* SECTION 2: CATALOG & FILTER HEADER */}
              {exploreSection === 'catalog' && (
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="p-4 pb-3">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <Compass className="h-4 w-4 text-primary" />
                      Attractions Catalog &amp; Filter Header
                    </CardTitle>
                    <CardDescription className="text-xs">
                      The title and category tabs (All, Nature, Gem Mining, Cultural) introducing attractions.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-4">
                    <SectionToolbar
                      title="Catalog Header"
                      isActive={content.explore.sectionVisibility?.catalog !== false}
                      onToggleActive={(active) => handleToggleExploreVisibility('catalog', active)}
                      currentTheme={content.explore.sectionStyles?.catalog || 'default'}
                      onChangeTheme={(theme) => handleSetExploreTheme('catalog', theme)}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Badge Text</Label>
                        <Input
                          value={content.explore.catalogHeader?.badge || defaultSiteContent.explore.catalogHeader?.badge}
                          onChange={(e) => setContent({ 
                            ...content, 
                            explore: { 
                              ...content.explore, 
                              catalogHeader: { 
                                ...(content.explore.catalogHeader || defaultSiteContent.explore.catalogHeader!), 
                                badge: e.target.value 
                              } 
                            } 
                          })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Catalog Main Heading</Label>
                        <Input
                          value={content.explore.catalogHeader?.heading || defaultSiteContent.explore.catalogHeader?.heading}
                          onChange={(e) => setContent({ 
                            ...content, 
                            explore: { 
                              ...content.explore, 
                              catalogHeader: { 
                                ...(content.explore.catalogHeader || defaultSiteContent.explore.catalogHeader!), 
                                heading: e.target.value 
                              } 
                            } 
                          })}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Catalog Subtitle</Label>
                      <Textarea
                        rows={2}
                        value={content.explore.catalogHeader?.subtitle || defaultSiteContent.explore.catalogHeader?.subtitle}
                        onChange={(e) => setContent({ 
                          ...content, 
                          explore: { 
                            ...content.explore, 
                            catalogHeader: { 
                              ...(content.explore.catalogHeader || defaultSiteContent.explore.catalogHeader!), 
                              subtitle: e.target.value 
                            } 
                          } 
                        })}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* SECTION 3: HERITAGE STORY / INTRO */}
              {exploreSection === 'intro' && (
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="p-4 pb-3">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <History className="h-4 w-4 text-primary" />
                      Heritage Story / Overview Intro
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Background history of the City of Gems and mining culture.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-4">
                    <SectionToolbar
                      title="Heritage Intro"
                      isActive={content.explore.sectionVisibility?.intro !== false}
                      onToggleActive={(active) => handleToggleExploreVisibility('intro', active)}
                      currentTheme={content.explore.sectionStyles?.intro || 'default'}
                      onChangeTheme={(theme) => handleSetExploreTheme('intro', theme)}
                    />

                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Intro Heading</Label>
                      <Input
                        value={content.explore.intro?.heading || defaultSiteContent.explore.intro.heading}
                        onChange={(e) => setContent({ 
                          ...content, 
                          explore: { 
                            ...content.explore, 
                            intro: { 
                              ...(content.explore.intro || defaultSiteContent.explore.intro), 
                              heading: e.target.value 
                            } 
                          } 
                        })}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Intro Story Paragraph</Label>
                      <Textarea
                        rows={4}
                        value={content.explore.intro?.description || defaultSiteContent.explore.intro.description}
                        onChange={(e) => setContent({ 
                          ...content, 
                          explore: { 
                            ...content.explore, 
                            intro: { 
                              ...(content.explore.intro || defaultSiteContent.explore.intro), 
                              description: e.target.value 
                            } 
                          } 
                        })}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* SECTION 4: INDIVIDUAL ATTRACTIONS */}
              {exploreSection === 'locations' && (
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="p-4 pb-3">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      Individual Attractions &amp; Destinations Manager
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Manage single attraction detail pages, photo galleries, coordinates, distance badges, and visitor guides.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-4">
                    <div className="p-4 rounded-xl border bg-primary/5 space-y-3">
                      <div className="flex items-center gap-2 text-primary font-semibold text-xs">
                        <Sparkles className="h-4 w-4 shrink-0" />
                        <span>Manage Attraction Locations &amp; Photo Galleries</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        To add new attractions (e.g. Sinharaja Forest, Gem Market, Bopath Ella), edit entrance fees, upload 360° photo galleries, and update Google Maps coordinates, open the Attractions Manager.
                      </p>
                      <Button asChild size="sm" className="gap-1.5 h-8 text-xs font-semibold">
                        <Link href="/admin/locations">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>Open Attraction Locations Manager</span>
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

            </div>

            {/* Right Column: Sticky Live Preview Canvas (5 cols) */}
            <div className="lg:col-span-5 sticky top-24 space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase font-mono">
                  <Eye className="h-3.5 w-3.5 text-primary" />
                  <span>Explore Page Live Preview</span>
                </div>

                {/* Device responsive toggle */}
                <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-lg border border-border/60">
                  <Button
                    type="button"
                    variant={previewDevice === 'desktop' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setPreviewDevice('desktop')}
                    className="h-6 px-2 text-[11px] gap-1 rounded-md"
                  >
                    <Monitor className="h-3 w-3" /> Desktop
                  </Button>
                  <Button
                    type="button"
                    variant={previewDevice === 'mobile' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setPreviewDevice('mobile')}
                    className="h-6 px-2 text-[11px] gap-1 rounded-md"
                  >
                    <Smartphone className="h-3 w-3" /> Mobile
                  </Button>
                </div>
              </div>

              {/* Preview Window Canvas */}
              <div className={`rounded-2xl border border-border/80 bg-background overflow-hidden shadow-lg transition-all duration-300 ${
                previewDevice === 'mobile' ? 'max-w-xs mx-auto text-xs' : 'w-full'
              }`}>
                
                {/* Simulated Browser Bar */}
                <div className="bg-muted/80 px-3 py-2 border-b border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground/80">https://sapphiretrails.lk/explore-ratnapura</span>
                  <div className="w-4" />
                </div>

                {/* Live Preview Render Area */}
                <div className="divide-y divide-border/40">
                  
                  {/* Hero Preview */}
                  {exploreSection === 'hero' && (
                    <div className="relative p-6 bg-slate-950 text-white overflow-hidden space-y-3">
                      <div className="absolute inset-0 z-0">
                        <Image
                          src={content.explore.hero.image || 'https://content-provider.payshia.com/sapphire-trail/images/img33.webp'}
                          alt="Hero Backdrop"
                          fill
                          className="object-cover opacity-30"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/90" />
                      </div>
                      <div className="relative z-10 space-y-2">
                        <span className="text-[10px] font-mono font-semibold text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-full border border-primary/30">
                          {content.explore.hero.tagline}
                        </span>
                        <h3 className="text-lg font-headline font-bold text-white leading-tight">
                          {content.explore.hero.title}
                        </h3>
                        <p className="text-xs text-slate-300 font-light line-clamp-3">
                          {content.explore.hero.subtitle}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Catalog Header Preview */}
                  {exploreSection === 'catalog' && (
                    <div className="p-5 bg-background text-center space-y-3">
                      <div className="inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                        <Compass className="h-3 w-3" />
                        <span>{content.explore.catalogHeader?.badge || defaultSiteContent.explore.catalogHeader?.badge}</span>
                      </div>
                      <h4 className="text-sm font-headline font-bold text-foreground">
                        {content.explore.catalogHeader?.heading || defaultSiteContent.explore.catalogHeader?.heading}
                      </h4>
                      <p className="text-[10px] text-muted-foreground line-clamp-2">
                        {content.explore.catalogHeader?.subtitle || defaultSiteContent.explore.catalogHeader?.subtitle}
                      </p>
                      <div className="flex justify-center gap-1 pt-1">
                        <span className="px-2 py-0.5 rounded-md bg-primary text-primary-foreground text-[8px] font-semibold">All</span>
                        <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[8px]">Nature</span>
                        <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[8px]">Gem Mining</span>
                        <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[8px]">Cultural</span>
                      </div>
                    </div>
                  )}

                  {/* Intro Story Preview */}
                  {exploreSection === 'intro' && (
                    <div className="p-5 bg-card space-y-2">
                      <h4 className="text-xs font-headline font-bold text-foreground">
                        {content.explore.intro?.heading || defaultSiteContent.explore.intro.heading}
                      </h4>
                      <p className="text-[10px] text-muted-foreground leading-relaxed font-light line-clamp-4">
                        {content.explore.intro?.description || defaultSiteContent.explore.intro.description}
                      </p>
                    </div>
                  )}

                  {/* Locations Grid Preview */}
                  {exploreSection === 'locations' && (
                    <div className="p-4 bg-background space-y-3">
                      <div className="flex items-center justify-between pb-1 border-b">
                        <span className="text-xs font-bold font-headline">Featured Attractions</span>
                        <span className="text-[9px] text-primary font-semibold">View Catalog</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 rounded-xl border bg-card space-y-1.5">
                          <div className="w-full h-12 rounded-lg bg-slate-900 overflow-hidden relative">
                            <Image src="https://content-provider.payshia.com/sapphire-trail/images/tour-3-optimized.webp" alt="Location" fill className="object-cover" />
                          </div>
                          <h5 className="text-[10px] font-bold truncate">Ratnapura Gem Market</h5>
                          <p className="text-[8px] text-muted-foreground">Gem Mining • 4.2 km</p>
                        </div>
                        <div className="p-2 rounded-xl border bg-card space-y-1.5">
                          <div className="w-full h-12 rounded-lg bg-slate-900 overflow-hidden relative">
                            <Image src="https://content-provider.payshia.com/sapphire-trail/images/tour-5-optimized.webp" alt="Location" fill className="object-cover" />
                          </div>
                          <h5 className="text-[10px] font-bold truncate">Saman Devalaya</h5>
                          <p className="text-[8px] text-muted-foreground">Cultural • 6.8 km</p>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>

          </div>

        </TabsContent>


        {/* 6. ARTICLES PAGE STUDIO - 3 SUB-SECTIONS WITH SPLIT-SCREEN PREVIEW */}
        <TabsContent value="articles" className="w-full space-y-4">
          
          {/* Articles Sub-Section Navigation Pills */}
          <div className="flex items-center gap-1.5 p-1.5 bg-muted/40 rounded-2xl border border-border/60 overflow-x-auto [scrollbar-width:none]">
            <span className="text-[11px] font-bold text-muted-foreground px-3 shrink-0 uppercase tracking-wider font-mono">
              Sections:
            </span>
            <Button
              type="button"
              variant={articlesSection === 'hero' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setArticlesSection('hero')}
              className="h-8 rounded-xl text-xs shrink-0 gap-1.5 font-semibold"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>1. Hero Banner</span>
            </Button>
            <Button
              type="button"
              variant={articlesSection === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setArticlesSection('list')}
              className="h-8 rounded-xl text-xs shrink-0 gap-1.5 font-semibold"
            >
              <Compass className="h-3.5 w-3.5" />
              <span>2. Journal Search &amp; Grid Header</span>
            </Button>
            <Button
              type="button"
              variant={articlesSection === 'library' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setArticlesSection('library')}
              className="h-8 rounded-xl text-xs shrink-0 gap-1.5 font-semibold"
            >
              <FileCheck2 className="h-3.5 w-3.5" />
              <span>3. Manage Articles Library</span>
            </Button>
          </div>

          {/* Split Screen Grid: Left = Form Editor, Right = Sticky Live Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Form Editor (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* SECTION 1: HERO BANNER */}
              {articlesSection === 'hero' && (
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="p-4 pb-3">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-primary" />
                      Articles &amp; Field Journal Hero Banner
                    </CardTitle>
                    <CardDescription className="text-xs">
                      The top cinematic header on /articles with backdrop photo and breadcrumb navigation.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-4">
                    <SectionToolbar
                      title="Hero Banner"
                      isActive={content.articles.sectionVisibility?.hero !== false}
                      onToggleActive={(active) => handleToggleArticlesVisibility('hero', active)}
                      currentTheme={content.articles.sectionStyles?.hero || 'default'}
                      onChangeTheme={(theme) => handleSetArticlesTheme('hero', theme)}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Tagline Badge</Label>
                        <Input
                          value={content.articles.hero.tagline}
                          onChange={(e) => setContent({ ...content, articles: { ...content.articles, hero: { ...content.articles.hero, tagline: e.target.value } } })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Main Hero Title</Label>
                        <Input
                          value={content.articles.hero.title}
                          onChange={(e) => setContent({ ...content, articles: { ...content.articles, hero: { ...content.articles.hero, title: e.target.value } } })}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Hero Subtitle</Label>
                      <Textarea
                        rows={2}
                        value={content.articles.hero.subtitle}
                        onChange={(e) => setContent({ ...content, articles: { ...content.articles, hero: { ...content.articles.hero, subtitle: e.target.value } } })}
                      />
                    </div>

                    {/* Backdrop Image Uploader */}
                    <div className="p-3.5 rounded-xl border bg-muted/20 space-y-2">
                      <Label className="text-xs font-bold text-primary flex items-center justify-between">
                        <span>Hero Backdrop Image</span>
                        <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[200px]">{content.articles.hero.image}</span>
                      </Label>
                      <div className="flex items-center gap-3">
                        <div className="relative w-20 h-14 rounded-lg overflow-hidden border border-border bg-slate-900 shrink-0">
                          <Image src={content.articles.hero.image || 'https://content-provider.payshia.com/sapphire-trail/images/img33.webp'} alt="Articles Hero" fill className="object-cover" />
                        </div>
                        <div className="space-y-1 flex-1">
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            ref={articlesHeroFileRef}
                            onChange={handleArticlesHeroImageChange}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => articlesHeroFileRef.current?.click()}
                            className="w-full text-xs h-7 gap-1 border-dashed border-primary/40 hover:border-primary hover:bg-primary/5"
                          >
                            <Upload className="h-3 w-3 text-primary" />
                            <span>Upload Backdrop Photo</span>
                          </Button>
                          <Input
                            value={content.articles.hero.image || ''}
                            placeholder="Or paste CDN image URL..."
                            className="text-[10px] h-6 font-mono"
                            onChange={(e) => setContent({ ...content, articles: { ...content.articles, hero: { ...content.articles.hero, image: e.target.value } } })}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* SECTION 2: JOURNAL SEARCH & GRID HEADER */}
              {articlesSection === 'list' && (
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="p-4 pb-3">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <Compass className="h-4 w-4 text-primary" />
                      Journal Search &amp; Grid Header
                    </CardTitle>
                    <CardDescription className="text-xs">
                      The heading above the search bar and filterable article cards.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-4">
                    <SectionToolbar
                      title="Articles Grid Section"
                      isActive={content.articles.sectionVisibility?.list !== false}
                      onToggleActive={(active) => handleToggleArticlesVisibility('list', active)}
                      currentTheme={content.articles.sectionStyles?.list || 'default'}
                      onChangeTheme={(theme) => handleSetArticlesTheme('list', theme)}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Section Tagline</Label>
                        <Input
                          value={content.articles.listHeader?.tagline || defaultSiteContent.articles.listHeader?.tagline}
                          onChange={(e) => setContent({ 
                            ...content, 
                            articles: { 
                              ...content.articles, 
                              listHeader: { 
                                ...(content.articles.listHeader || defaultSiteContent.articles.listHeader!), 
                                tagline: e.target.value 
                              } 
                            } 
                          })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Section Main Heading</Label>
                        <Input
                          value={content.articles.listHeader?.heading || defaultSiteContent.articles.listHeader?.heading}
                          onChange={(e) => setContent({ 
                            ...content, 
                            articles: { 
                              ...content.articles, 
                              listHeader: { 
                                ...(content.articles.listHeader || defaultSiteContent.articles.listHeader!), 
                                heading: e.target.value 
                              } 
                            } 
                          })}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* SECTION 3: MANAGE ARTICLES LIBRARY */}
              {articlesSection === 'library' && (
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="p-4 pb-3">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <FileCheck2 className="h-4 w-4 text-primary" />
                      Articles &amp; Field Journal Publishing Library
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Write, edit, and publish new articles with rich Markdown content, covers, and author details.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-4">
                    <div className="p-4 rounded-xl border bg-primary/5 space-y-3">
                      <div className="flex items-center gap-2 text-primary font-semibold text-xs">
                        <Sparkles className="h-4 w-4 shrink-0" />
                        <span>Publish &amp; Manage Full Articles</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        To compose new field journals, update Ceylon sapphire research guides, manage tags, categories, and cover images, open the Articles Manager.
                      </p>
                      <Button asChild size="sm" className="gap-1.5 h-8 text-xs font-semibold">
                        <Link href="/admin/manage-articles">
                          <BookOpen className="h-3.5 w-3.5" />
                          <span>Open Articles &amp; Journal Manager</span>
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

            </div>

            {/* Right Column: Sticky Live Preview Canvas (5 cols) */}
            <div className="lg:col-span-5 sticky top-24 space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase font-mono">
                  <Eye className="h-3.5 w-3.5 text-primary" />
                  <span>Articles Page Live Preview</span>
                </div>

                {/* Device responsive toggle */}
                <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-lg border border-border/60">
                  <Button
                    type="button"
                    variant={previewDevice === 'desktop' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setPreviewDevice('desktop')}
                    className="h-6 px-2 text-[11px] gap-1 rounded-md"
                  >
                    <Monitor className="h-3 w-3" /> Desktop
                  </Button>
                  <Button
                    type="button"
                    variant={previewDevice === 'mobile' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setPreviewDevice('mobile')}
                    className="h-6 px-2 text-[11px] gap-1 rounded-md"
                  >
                    <Smartphone className="h-3 w-3" /> Mobile
                  </Button>
                </div>
              </div>

              {/* Preview Window Canvas */}
              <div className={`rounded-2xl border border-border/80 bg-background overflow-hidden shadow-lg transition-all duration-300 ${
                previewDevice === 'mobile' ? 'max-w-xs mx-auto text-xs' : 'w-full'
              }`}>
                
                {/* Simulated Browser Bar */}
                <div className="bg-muted/80 px-3 py-2 border-b border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground/80">https://sapphiretrails.lk/articles</span>
                  <div className="w-4" />
                </div>

                {/* Live Preview Render Area */}
                <div className="divide-y divide-border/40">
                  
                  {/* Hero Preview */}
                  {articlesSection === 'hero' && (
                    <div className="relative p-6 bg-slate-950 text-white overflow-hidden space-y-3">
                      <div className="absolute inset-0 z-0">
                        <Image
                          src={content.articles.hero.image || 'https://content-provider.payshia.com/sapphire-trail/images/img33.webp'}
                          alt="Hero Backdrop"
                          fill
                          className="object-cover opacity-30"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/90" />
                      </div>
                      <div className="relative z-10 space-y-2">
                        <span className="text-[10px] font-mono font-semibold text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-full border border-primary/30">
                          {content.articles.hero.tagline}
                        </span>
                        <h3 className="text-lg font-headline font-bold text-white leading-tight">
                          {content.articles.hero.title}
                        </h3>
                        <p className="text-xs text-slate-300 font-light line-clamp-3">
                          {content.articles.hero.subtitle}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* List Header & Sample Cards Preview */}
                  {(articlesSection === 'list' || articlesSection === 'library') && (
                    <div className="p-4 bg-background space-y-3">
                      <div className="pb-2 border-b">
                        <span className="text-[9px] font-serif uppercase tracking-widest text-primary font-bold">
                          {content.articles.listHeader?.tagline || defaultSiteContent.articles.listHeader?.tagline}
                        </span>
                        <h4 className="text-xs font-headline font-bold text-foreground">
                          {content.articles.listHeader?.heading || defaultSiteContent.articles.listHeader?.heading}
                        </h4>
                      </div>

                      {/* Featured Spotlight Preview */}
                      <div className="p-2.5 rounded-xl border bg-card space-y-2">
                        <div className="w-full h-16 rounded-lg bg-slate-900 overflow-hidden relative">
                          <Image src="https://content-provider.payshia.com/sapphire-trail/images/tour-4-optimized.webp" alt="Featured Article" fill className="object-cover" />
                          <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-[8px] text-primary font-bold uppercase">
                            Featured
                          </div>
                        </div>
                        <h5 className="text-[11px] font-bold truncate">Understanding Royal Blue Sapphire Grading</h5>
                        <p className="text-[9px] text-muted-foreground line-clamp-2">Complete insider guide to optical sorting, inclusions, and NGJA certifications.</p>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>

          </div>

        </TabsContent>


        {/* 7. CONTACT US & GLOBAL SETTINGS STUDIO - 4 SUB-SECTIONS WITH SPLIT-SCREEN PREVIEW */}
        <TabsContent value="contact" className="w-full space-y-4">
          
          {/* Contact Sub-Section Navigation Pills */}
          <div className="flex items-center gap-1.5 p-1.5 bg-muted/40 rounded-2xl border border-border/60 overflow-x-auto [scrollbar-width:none]">
            <span className="text-[11px] font-bold text-muted-foreground px-3 shrink-0 uppercase tracking-wider font-mono">
              Sections:
            </span>
            <Button
              type="button"
              variant={contactSection === 'hero' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setContactSection('hero')}
              className="h-8 rounded-xl text-xs shrink-0 gap-1.5 font-semibold"
            >
              <Phone className="h-3.5 w-3.5" />
              <span>1. Hero Banner</span>
            </Button>
            <Button
              type="button"
              variant={contactSection === 'channels' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setContactSection('channels')}
              className="h-8 rounded-xl text-xs shrink-0 gap-1.5 font-semibold"
            >
              <Mail className="h-3.5 w-3.5" />
              <span>2. Direct Channels &amp; Form</span>
            </Button>
            <Button
              type="button"
              variant={contactSection === 'map' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setContactSection('map')}
              className="h-8 rounded-xl text-xs shrink-0 gap-1.5 font-semibold"
            >
              <MapPin className="h-3.5 w-3.5" />
              <span>3. Headquarters Map</span>
            </Button>
            <Button
              type="button"
              variant={contactSection === 'faqs' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setContactSection('faqs')}
              className="h-8 rounded-xl text-xs shrink-0 gap-1.5 font-semibold"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>4. Contact FAQs</span>
            </Button>
          </div>

          {/* Split Screen Grid: Left = Form Editor, Right = Sticky Live Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Form Editor (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* SUB-SECTION 1: HERO BANNER */}
              {contactSection === 'hero' && (
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="p-4 pb-3">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary" />
                      Contact Page Hero Banner
                    </CardTitle>
                    <CardDescription className="text-xs">
                      The top cinematic header with backdrop photo and concierge tagline.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-4">
                    <SectionToolbar
                      title="Hero Banner"
                      isActive={content.contact.sectionVisibility?.hero !== false}
                      onToggleActive={(active) => handleToggleContactVisibility('hero', active)}
                      currentTheme={content.contact.sectionStyles?.hero || 'default'}
                      onChangeTheme={(theme) => handleSetContactTheme('hero', theme)}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Tagline Badge</Label>
                        <Input
                          value={content.contact.hero.tagline}
                          onChange={(e) => setContent({ ...content, contact: { ...content.contact, hero: { ...content.contact.hero, tagline: e.target.value } } })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Hero Title</Label>
                        <Input
                          value={content.contact.hero.title}
                          onChange={(e) => setContent({ ...content, contact: { ...content.contact, hero: { ...content.contact.hero, title: e.target.value } } })}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Hero Subtitle</Label>
                      <Textarea
                        rows={2}
                        value={content.contact.hero.subtitle}
                        onChange={(e) => setContent({ ...content, contact: { ...content.contact, hero: { ...content.contact.hero, subtitle: e.target.value } } })}
                      />
                    </div>

                    {/* Backdrop Image Uploader */}
                    <div className="p-3.5 rounded-xl border bg-muted/20 space-y-2">
                      <Label className="text-xs font-bold text-primary flex items-center justify-between">
                        <span>Hero Backdrop Image</span>
                        <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[200px]">{content.contact.hero.image}</span>
                      </Label>
                      <div className="flex items-center gap-3">
                        <div className="relative w-20 h-14 rounded-lg overflow-hidden border border-border bg-slate-900 shrink-0">
                          <Image src={content.contact.hero.image || 'https://content-provider.payshia.com/sapphire-trail/images/img35.webp'} alt="Contact Hero" fill className="object-cover" />
                        </div>
                        <div className="space-y-1 flex-1">
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            ref={contactHeroFileRef}
                            onChange={handleContactHeroImageChange}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => contactHeroFileRef.current?.click()}
                            className="w-full text-xs h-7 gap-1 border-dashed border-primary/40 hover:border-primary hover:bg-primary/5"
                          >
                            <Upload className="h-3 w-3 text-primary" />
                            <span>Upload Backdrop Photo</span>
                          </Button>
                          <Input
                            value={content.contact.hero.image || ''}
                            placeholder="Or paste CDN image URL..."
                            className="text-[10px] h-6 font-mono"
                            onChange={(e) => setContent({ ...content, contact: { ...content.contact, hero: { ...content.contact.hero, image: e.target.value } } })}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* SUB-SECTION 2: DIRECT CHANNELS & FORM */}
              {contactSection === 'channels' && (
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="p-4 pb-3">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" />
                      Direct Communication Channels &amp; Operating Hours
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Official contact numbers, emails, physical address, and hours shown across the site.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-4">
                    <SectionToolbar
                      title="Direct Channels & Form"
                      isActive={content.contact.sectionVisibility?.channels !== false}
                      onToggleActive={(active) => handleToggleContactVisibility('channels', active)}
                      currentTheme={content.contact.sectionStyles?.channels || 'default'}
                      onChangeTheme={(theme) => handleSetContactTheme('channels', theme)}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Primary Hotline Phone</Label>
                        <Input
                          value={content.contact.primaryPhone}
                          onChange={(e) => setContent({ ...content, contact: { ...content.contact, primaryPhone: e.target.value } })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Secondary Phone</Label>
                        <Input
                          value={content.contact.secondaryPhone}
                          onChange={(e) => setContent({ ...content, contact: { ...content.contact, secondaryPhone: e.target.value } })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Primary Email Address</Label>
                        <Input
                          value={content.contact.primaryEmail}
                          onChange={(e) => setContent({ ...content, contact: { ...content.contact, primaryEmail: e.target.value } })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">WhatsApp Number (with Country Code)</Label>
                        <Input
                          value={content.contact.whatsappNumber}
                          onChange={(e) => setContent({ ...content, contact: { ...content.contact, whatsappNumber: e.target.value } })}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Physical Lounge Address</Label>
                      <Input
                        value={content.contact.physicalAddress}
                        onChange={(e) => setContent({ ...content, contact: { ...content.contact, physicalAddress: e.target.value } })}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Weekdays Operating Hours</Label>
                        <Input
                          value={content.contact.openingHoursWeekdays}
                          onChange={(e) => setContent({ ...content, contact: { ...content.contact, openingHoursWeekdays: e.target.value } })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Weekends / Poya Operating Hours</Label>
                        <Input
                          value={content.contact.openingHoursWeekends}
                          onChange={(e) => setContent({ ...content, contact: { ...content.contact, openingHoursWeekends: e.target.value } })}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* SUB-SECTION 3: HEADQUARTERS MAP */}
              {contactSection === 'map' && (
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="p-4 pb-3">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      Headquarters &amp; Tour Lounge Map Section
                    </CardTitle>
                    <CardDescription className="text-xs">
                      The interactive map banner, address bar, and directions button.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-4">
                    <SectionToolbar
                      title="Headquarters Map Section"
                      isActive={content.contact.sectionVisibility?.map !== false}
                      onToggleActive={(active) => handleToggleContactVisibility('map', active)}
                      currentTheme={content.contact.sectionStyles?.map || 'default'}
                      onChangeTheme={(theme) => handleSetContactTheme('map', theme)}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Map Badge Text</Label>
                        <Input
                          value={content.contact.map?.badge || defaultSiteContent.contact.map?.badge}
                          onChange={(e) => setContent({
                            ...content,
                            contact: {
                              ...content.contact,
                              map: { ...(content.contact.map || defaultSiteContent.contact.map!), badge: e.target.value }
                            }
                          })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Map Main Heading</Label>
                        <Input
                          value={content.contact.map?.heading || defaultSiteContent.contact.map?.heading}
                          onChange={(e) => setContent({
                            ...content,
                            contact: {
                              ...content.contact,
                              map: { ...(content.contact.map || defaultSiteContent.contact.map!), heading: e.target.value }
                            }
                          })}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Map Subtitle</Label>
                      <Input
                        value={content.contact.map?.subtitle || defaultSiteContent.contact.map?.subtitle}
                        onChange={(e) => setContent({
                          ...content,
                          contact: {
                            ...content.contact,
                            map: { ...(content.contact.map || defaultSiteContent.contact.map!), subtitle: e.target.value }
                          }
                        })}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Address Text Under Map</Label>
                        <Input
                          value={content.contact.map?.addressText || defaultSiteContent.contact.map?.addressText}
                          onChange={(e) => setContent({
                            ...content,
                            contact: {
                              ...content.contact,
                              map: { ...(content.contact.map || defaultSiteContent.contact.map!), addressText: e.target.value }
                            }
                          })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Google Maps Directions URL</Label>
                        <Input
                          value={content.contact.map?.directionsUrl || defaultSiteContent.contact.map?.directionsUrl}
                          onChange={(e) => setContent({
                            ...content,
                            contact: {
                              ...content.contact,
                              map: { ...(content.contact.map || defaultSiteContent.contact.map!), directionsUrl: e.target.value }
                            }
                          })}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* SUB-SECTION 4: CONTACT FAQS */}
              {contactSection === 'faqs' && (
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="p-4 pb-3">
                    <CardTitle className="text-base font-bold flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="h-4 w-4 text-primary" />
                        <span>Contact Page FAQs</span>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleAddContactFaq}
                        className="h-7 text-xs gap-1 text-primary border-primary/40 hover:bg-primary/5"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Add Question</span>
                      </Button>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Manage the accordion FAQ list displayed on /contact.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-4">
                    <SectionToolbar
                      title="Contact FAQs Section"
                      isActive={content.contact.sectionVisibility?.faqs !== false}
                      onToggleActive={(active) => handleToggleContactVisibility('faqs', active)}
                      currentTheme={content.contact.sectionStyles?.faqs || 'default'}
                      onChangeTheme={(theme) => handleSetContactTheme('faqs', theme)}
                    />

                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">FAQ Section Main Heading</Label>
                      <Input
                        value={content.contact.faqsHeader?.heading || defaultSiteContent.contact.faqsHeader?.heading}
                        onChange={(e) => setContent({
                          ...content,
                          contact: {
                            ...content.contact,
                            faqsHeader: { heading: e.target.value }
                          }
                        })}
                      />
                    </div>

                    <div className="space-y-3 pt-2">
                      {(content.contact.faqs || defaultSiteContent.contact.faqs || []).map((faq, idx) => (
                        <div key={idx} className="p-3 rounded-xl border bg-muted/20 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-primary font-mono">Q{idx + 1}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveContactFaq(idx)}
                              className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10 rounded-md"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          <Input
                            placeholder="Question"
                            value={faq.question}
                            className="text-xs font-semibold"
                            onChange={(e) => handleUpdateContactFaq(idx, 'question', e.target.value)}
                          />
                          <Textarea
                            rows={2}
                            placeholder="Answer"
                            value={faq.answer}
                            className="text-xs"
                            onChange={(e) => handleUpdateContactFaq(idx, 'answer', e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

            </div>

            {/* Right Column: Sticky Live Preview Canvas (5 cols) */}
            <div className="lg:col-span-5 sticky top-24 space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase font-mono">
                  <Eye className="h-3.5 w-3.5 text-primary" />
                  <span>Contact Page Live Preview</span>
                </div>

                {/* Device responsive toggle */}
                <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-lg border border-border/60">
                  <Button
                    type="button"
                    variant={previewDevice === 'desktop' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setPreviewDevice('desktop')}
                    className="h-6 px-2 text-[11px] gap-1 rounded-md"
                  >
                    <Monitor className="h-3 w-3" /> Desktop
                  </Button>
                  <Button
                    type="button"
                    variant={previewDevice === 'mobile' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setPreviewDevice('mobile')}
                    className="h-6 px-2 text-[11px] gap-1 rounded-md"
                  >
                    <Smartphone className="h-3 w-3" /> Mobile
                  </Button>
                </div>
              </div>

              {/* Preview Window Canvas */}
              <div className={`rounded-2xl border border-border/80 bg-background overflow-hidden shadow-lg transition-all duration-300 ${
                previewDevice === 'mobile' ? 'max-w-xs mx-auto text-xs' : 'w-full'
              }`}>
                
                {/* Simulated Browser Bar */}
                <div className="bg-muted/80 px-3 py-2 border-b border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground/80">https://sapphiretrails.lk/contact</span>
                  <div className="w-4" />
                </div>

                {/* Live Preview Render Area */}
                <div className="divide-y divide-border/40">
                  
                  {/* Hero Preview */}
                  {contactSection === 'hero' && (
                    <div className="relative p-6 bg-slate-950 text-white overflow-hidden space-y-3">
                      <div className="absolute inset-0 z-0">
                        <Image
                          src={content.contact.hero.image || 'https://content-provider.payshia.com/sapphire-trail/images/img35.webp'}
                          alt="Hero Backdrop"
                          fill
                          className="object-cover opacity-30"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/90" />
                      </div>
                      <div className="relative z-10 space-y-2">
                        <span className="text-[10px] font-mono font-semibold text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-full border border-primary/30">
                          {content.contact.hero.tagline}
                        </span>
                        <h3 className="text-lg font-headline font-bold text-white leading-tight">
                          {content.contact.hero.title}
                        </h3>
                        <p className="text-xs text-slate-300 font-light line-clamp-3">
                          {content.contact.hero.subtitle}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Channels Preview */}
                  {contactSection === 'channels' && (
                    <div className="p-4 bg-card space-y-3">
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center gap-2 text-foreground font-semibold">
                          <Phone className="h-3.5 w-3.5 text-primary" />
                          <span>{content.contact.primaryPhone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-3.5 w-3.5 text-primary" />
                          <span>{content.contact.primaryEmail}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 text-primary" />
                          <span className="truncate">{content.contact.physicalAddress}</span>
                        </div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-muted/40 border text-[10px] space-y-1">
                        <div className="flex justify-between font-medium">
                          <span>Mon - Sat:</span>
                          <span className="font-mono text-foreground">{content.contact.openingHoursWeekdays}</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>Sun &amp; Poya:</span>
                          <span className="font-mono text-foreground">{content.contact.openingHoursWeekends}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Map Preview */}
                  {contactSection === 'map' && (
                    <div className="p-4 bg-background space-y-2">
                      <div className="text-center space-y-1">
                        <span className="text-[9px] font-bold text-primary uppercase">{content.contact.map?.badge || defaultSiteContent.contact.map?.badge}</span>
                        <h4 className="text-xs font-bold">{content.contact.map?.heading || defaultSiteContent.contact.map?.heading}</h4>
                      </div>
                      <div className="h-24 rounded-lg bg-slate-900 border flex items-center justify-center text-muted-foreground text-[10px] gap-1.5">
                        <MapPin className="h-4 w-4 text-primary animate-pulse" />
                        <span>Interactive Google Map Embed</span>
                      </div>
                    </div>
                  )}

                  {/* FAQs Preview */}
                  {contactSection === 'faqs' && (
                    <div className="p-4 bg-background space-y-2">
                      <h4 className="text-xs font-bold text-center text-primary">{content.contact.faqsHeader?.heading || 'Frequently Asked Questions'}</h4>
                      <div className="space-y-1.5">
                        {(content.contact.faqs || defaultSiteContent.contact.faqs || []).slice(0, 3).map((faq, idx) => (
                          <div key={idx} className="p-2 rounded-md border text-[11px] bg-card">
                            <span className="font-semibold block truncate">{faq.question}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>

          </div>

        </TabsContent>


        {/* 8. FOOTER & SOCIAL LINKS STUDIO - 5 SUB-SECTIONS WITH SPLIT-SCREEN PREVIEW */}
        <TabsContent value="footer" className="w-full space-y-4">
          
          {/* Footer Sub-Section Navigation Pills */}
          <div className="flex items-center gap-1.5 p-1.5 bg-muted/40 rounded-2xl border border-border/60 overflow-x-auto [scrollbar-width:none]">
            <span className="text-[11px] font-bold text-muted-foreground px-3 shrink-0 uppercase tracking-wider font-mono">
              Sections:
            </span>
            <Button
              type="button"
              variant={footerSection === 'brand' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFooterSection('brand')}
              className="h-8 rounded-xl text-xs shrink-0 gap-1.5 font-semibold"
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>1. Brand &amp; Narrative</span>
            </Button>
            <Button
              type="button"
              variant={footerSection === 'columns' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFooterSection('columns')}
              className="h-8 rounded-xl text-xs shrink-0 gap-1.5 font-semibold"
            >
              <Compass className="h-3.5 w-3.5" />
              <span>2. Column Headings</span>
            </Button>
            <Button
              type="button"
              variant={footerSection === 'partner' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFooterSection('partner')}
              className="h-8 rounded-xl text-xs shrink-0 gap-1.5 font-semibold"
            >
              <Award className="h-3.5 w-3.5" />
              <span>3. Hospitality Partner</span>
            </Button>
            <Button
              type="button"
              variant={footerSection === 'socials' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFooterSection('socials')}
              className="h-8 rounded-xl text-xs shrink-0 gap-1.5 font-semibold"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>4. Social Media Links</span>
            </Button>
            <Button
              type="button"
              variant={footerSection === 'bottom' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFooterSection('bottom')}
              className="h-8 rounded-xl text-xs shrink-0 gap-1.5 font-semibold"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>5. Copyright &amp; Credits</span>
            </Button>
          </div>

          {/* Split Screen Grid: Left = Form Editor, Right = Sticky Live Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Form Editor (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* SUB-SECTION 1: BRAND & NARRATIVE */}
              {footerSection === 'brand' && (
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="p-4 pb-3">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      Footer Brand Identity &amp; Narrative (Column 1)
                    </CardTitle>
                    <CardDescription className="text-xs">
                      The brand emblem, title, and mission overview shown in the first footer column.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-4">
                    <SectionToolbar
                      title="Brand Column"
                      isActive={content.footer.sectionVisibility?.brand !== false}
                      onToggleActive={(active) => handleToggleFooterVisibility('brand', active)}
                      currentTheme={content.footer.sectionStyles?.footer || 'default'}
                      onChangeTheme={(theme) => handleSetFooterTheme('footer', theme)}
                    />

                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Brand Title Heading</Label>
                      <Input
                        value={content.footer.brandHeading || defaultSiteContent.footer.brandHeading}
                        onChange={(e) => setContent({ ...content, footer: { ...content.footer, brandHeading: e.target.value } })}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Footer About / Description Narrative</Label>
                      <Textarea
                        rows={3}
                        value={content.footer.aboutText}
                        onChange={(e) => setContent({ ...content, footer: { ...content.footer, aboutText: e.target.value } })}
                      />
                    </div>

                    {/* Brand Logo Uploader */}
                    <div className="p-3.5 rounded-xl border bg-muted/20 space-y-2">
                      <Label className="text-xs font-bold text-primary flex items-center justify-between">
                        <span>Brand Logo Image</span>
                        <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[200px]">{content.footer.brandLogo}</span>
                      </Label>
                      <div className="flex items-center gap-3">
                        <div className="relative w-20 h-14 rounded-lg overflow-hidden border border-border bg-slate-900 shrink-0 p-1 flex items-center justify-center">
                          <Image src={content.footer.brandLogo || '/img/logo4.png'} alt="Brand Logo" width={60} height={40} className="object-contain" />
                        </div>
                        <div className="space-y-1 flex-1">
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            ref={footerBrandLogoRef}
                            onChange={handleFooterBrandLogoChange}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => footerBrandLogoRef.current?.click()}
                            className="w-full text-xs h-7 gap-1 border-dashed border-primary/40 hover:border-primary hover:bg-primary/5"
                          >
                            <Upload className="h-3 w-3 text-primary" />
                            <span>Upload Brand Logo (FTP)</span>
                          </Button>
                          <Input
                            value={content.footer.brandLogo || ''}
                            placeholder="Or paste CDN image URL..."
                            className="text-[10px] h-6 font-mono"
                            onChange={(e) => setContent({ ...content, footer: { ...content.footer, brandLogo: e.target.value } })}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* SUB-SECTION 2: COLUMN HEADINGS */}
              {footerSection === 'columns' && (
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="p-4 pb-3">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <Compass className="h-4 w-4 text-primary" />
                      Footer Column Headings &amp; Navigation
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Headings for the Tour Packages column (Col 2) and Contact Us column (Col 3).
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Column 2 Heading</Label>
                        <Input
                          value={content.footer.packagesHeading || defaultSiteContent.footer.packagesHeading}
                          onChange={(e) => setContent({ ...content, footer: { ...content.footer, packagesHeading: e.target.value } })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Column 3 Heading</Label>
                        <Input
                          value={content.footer.contactHeading || defaultSiteContent.footer.contactHeading}
                          onChange={(e) => setContent({ ...content, footer: { ...content.footer, contactHeading: e.target.value } })}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Find Us On Google Maps URL (Column 3 Link)</Label>
                      <Input
                        value={content.footer.googleMapsUrl || defaultSiteContent.footer.googleMapsUrl}
                        onChange={(e) => setContent({ ...content, footer: { ...content.footer, googleMapsUrl: e.target.value } })}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* SUB-SECTION 3: HOSPITALITY PARTNER */}
              {footerSection === 'partner' && (
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="p-4 pb-3">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <Award className="h-4 w-4 text-primary" />
                      Hospitality Partner (Column 4)
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Grand Silver Ray logo and hospitality partnership tagline.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-4">
                    <SectionToolbar
                      title="Partner Column"
                      isActive={content.footer.sectionVisibility?.partner !== false}
                      onToggleActive={(active) => handleToggleFooterVisibility('partner', active)}
                      currentTheme={content.footer.sectionStyles?.footer || 'default'}
                      onChangeTheme={(theme) => handleSetFooterTheme('footer', theme)}
                    />

                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Hospitality Partner Tagline</Label>
                      <Input
                        value={content.footer.partnerTagline || defaultSiteContent.footer.partnerTagline}
                        onChange={(e) => setContent({ ...content, footer: { ...content.footer, partnerTagline: e.target.value } })}
                      />
                    </div>

                    {/* Partner Logo Uploader */}
                    <div className="p-3.5 rounded-xl border bg-muted/20 space-y-2">
                      <Label className="text-xs font-bold text-primary flex items-center justify-between">
                        <span>Partner Logo Image</span>
                        <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[200px]">{content.footer.partnerLogo}</span>
                      </Label>
                      <div className="flex items-center gap-3">
                        <div className="relative w-20 h-14 rounded-lg overflow-hidden border border-border bg-slate-900 shrink-0 p-1 flex items-center justify-center">
                          <Image src={content.footer.partnerLogo || '/img/logo2.png'} alt="Partner Logo" width={60} height={40} className="object-contain" />
                        </div>
                        <div className="space-y-1 flex-1">
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            ref={footerPartnerLogoRef}
                            onChange={handleFooterPartnerLogoChange}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => footerPartnerLogoRef.current?.click()}
                            className="w-full text-xs h-7 gap-1 border-dashed border-primary/40 hover:border-primary hover:bg-primary/5"
                          >
                            <Upload className="h-3 w-3 text-primary" />
                            <span>Upload Partner Logo (FTP)</span>
                          </Button>
                          <Input
                            value={content.footer.partnerLogo || ''}
                            placeholder="Or paste CDN image URL..."
                            className="text-[10px] h-6 font-mono"
                            onChange={(e) => setContent({ ...content, footer: { ...content.footer, partnerLogo: e.target.value } })}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* SUB-SECTION 4: SOCIAL MEDIA LINKS */}
              {footerSection === 'socials' && (
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="p-4 pb-3">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <Share2 className="h-4 w-4 text-primary" />
                      Official Social Media Channels
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Social media URLs linked to the icons in the footer.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Facebook Page URL</Label>
                        <Input
                          value={content.footer.facebookUrl}
                          onChange={(e) => setContent({ ...content, footer: { ...content.footer, facebookUrl: e.target.value } })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Instagram Profile URL</Label>
                        <Input
                          value={content.footer.instagramUrl}
                          onChange={(e) => setContent({ ...content, footer: { ...content.footer, instagramUrl: e.target.value } })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">YouTube Channel URL</Label>
                        <Input
                          value={content.footer.youtubeUrl}
                          onChange={(e) => setContent({ ...content, footer: { ...content.footer, youtubeUrl: e.target.value } })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">TripAdvisor Profile URL</Label>
                        <Input
                          value={content.footer.tripadvisorUrl}
                          onChange={(e) => setContent({ ...content, footer: { ...content.footer, tripadvisorUrl: e.target.value } })}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* SUB-SECTION 5: COPYRIGHT & CREDITS */}
              {footerSection === 'bottom' && (
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="p-4 pb-3">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      Bottom Bar: Copyright &amp; Credits
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Copyright notice and developer credit line at the bottom of the footer.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-4">
                    <SectionToolbar
                      title="Bottom Copyright Strip"
                      isActive={content.footer.sectionVisibility?.bottom !== false}
                      onToggleActive={(active) => handleToggleFooterVisibility('bottom', active)}
                      currentTheme={content.footer.sectionStyles?.footer || 'default'}
                      onChangeTheme={(theme) => handleSetFooterTheme('footer', theme)}
                    />

                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Copyright Notice Text</Label>
                      <Input
                        value={content.footer.copyrightText}
                        onChange={(e) => setContent({ ...content, footer: { ...content.footer, copyrightText: e.target.value } })}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Powered By Text</Label>
                        <Input
                          value={content.footer.poweredByText || defaultSiteContent.footer.poweredByText}
                          onChange={(e) => setContent({ ...content, footer: { ...content.footer, poweredByText: e.target.value } })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Powered By URL</Label>
                        <Input
                          value={content.footer.poweredByUrl || defaultSiteContent.footer.poweredByUrl}
                          onChange={(e) => setContent({ ...content, footer: { ...content.footer, poweredByUrl: e.target.value } })}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

            </div>

            {/* Right Column: Sticky Live Preview Canvas (5 cols) */}
            <div className="lg:col-span-5 sticky top-24 space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase font-mono">
                  <Eye className="h-3.5 w-3.5 text-primary" />
                  <span>Footer Live Preview</span>
                </div>

                {/* Device responsive toggle */}
                <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-lg border border-border/60">
                  <Button
                    type="button"
                    variant={previewDevice === 'desktop' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setPreviewDevice('desktop')}
                    className="h-6 px-2 text-[11px] gap-1 rounded-md"
                  >
                    <Monitor className="h-3 w-3" /> Desktop
                  </Button>
                  <Button
                    type="button"
                    variant={previewDevice === 'mobile' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setPreviewDevice('mobile')}
                    className="h-6 px-2 text-[11px] gap-1 rounded-md"
                  >
                    <Smartphone className="h-3 w-3" /> Mobile
                  </Button>
                </div>
              </div>

              {/* Preview Window Canvas */}
              <div className={`rounded-2xl border border-border/80 bg-background-alt overflow-hidden shadow-lg transition-all duration-300 ${
                previewDevice === 'mobile' ? 'max-w-xs mx-auto text-xs' : 'w-full'
              }`}>
                
                {/* Simulated Browser Bar */}
                <div className="bg-muted/80 px-3 py-2 border-b border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground/80">Site-wide Footer Section</span>
                  <div className="w-4" />
                </div>

                {/* 4-Column Footer Live Render */}
                <div className="p-4 space-y-4 text-[11px]">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Col 1: Brand */}
                    <div className="space-y-1.5">
                      <div className="w-10 h-6 relative">
                        <Image src={content.footer.brandLogo || '/img/logo4.png'} alt="Logo" fill className="object-contain" />
                      </div>
                      <span className="font-serif font-bold text-[10px] tracking-widest text-primary block">
                        {content.footer.brandHeading || 'SAPPHIRE TRAILS'}
                      </span>
                      <p className="text-[9px] text-muted-foreground leading-tight line-clamp-3">
                        {content.footer.aboutText}
                      </p>
                    </div>

                    {/* Col 2: Packages */}
                    <div className="space-y-1">
                      <span className="font-bold text-[10px] text-primary block">
                        {content.footer.packagesHeading || 'TOUR PACKAGES'}
                      </span>
                      <ul className="text-[9px] text-muted-foreground space-y-0.5">
                        <li>Custom Proposal &amp; Ring</li>
                        <li>Gem Mine Tours</li>
                        <li>Gem City Attractions</li>
                        <li>Day Gem Mine Tours</li>
                      </ul>
                    </div>

                    {/* Col 3: Contact */}
                    <div className="space-y-1">
                      <span className="font-bold text-[10px] text-primary block">
                        {content.footer.contactHeading || 'CONTACT US'}
                      </span>
                      <p className="text-[9px] text-muted-foreground truncate">{content.contact.physicalAddress}</p>
                      <p className="text-[9px] text-primary font-mono">{content.contact.primaryPhone}</p>
                      <p className="text-[9px] text-muted-foreground">{content.contact.primaryEmail}</p>
                    </div>

                    {/* Col 4: Partner & Socials */}
                    <div className="space-y-1.5 sm:text-right">
                      <div className="w-10 h-6 relative sm:ml-auto">
                        <Image src={content.footer.partnerLogo || '/img/logo2.png'} alt="Partner" fill className="object-contain" />
                      </div>
                      <p className="text-[8px] text-muted-foreground">
                        {content.footer.partnerTagline || 'Hospitality Partner for Luxury Gem Tours.'}
                      </p>
                      <div className="flex items-center gap-2 sm:justify-end pt-1 text-primary">
                        <Share2 className="h-3 w-3" />
                      </div>
                    </div>

                  </div>

                  {/* Bottom Strip */}
                  <div className="pt-2 border-t text-[9px] text-muted-foreground flex justify-between items-center">
                    <span>{content.footer.copyrightText}</span>
                    <span className="text-primary font-medium">{content.footer.poweredByText}</span>
                  </div>

                </div>
              </div>
            </div>

          </div>

        </TabsContent>

      </Tabs>

      {/* Floating Bottom Sticky Save Bar */}
      <div className="sticky bottom-4 z-30 flex items-center justify-between p-4 rounded-2xl bg-slate-950/90 text-white backdrop-blur-xl border border-primary/30 shadow-2xl">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>Real-time Live Preview Active &bull; Single-click updates all live pages</span>
        </div>

        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10 rounded-xl text-xs">
            <Link href="/" target="_blank">
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
              Live Website
            </Link>
          </Button>

          <Button
            type="button"
            onClick={() => handleSave()}
            disabled={isSaving}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl text-xs h-10 px-8 gap-2 shadow-lg"
          >
            {isSaving ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{isSaving ? 'Publishing Changes...' : 'Save All Changes'}</span>
          </Button>
        </div>
      </div>

    </div>
  );
}
