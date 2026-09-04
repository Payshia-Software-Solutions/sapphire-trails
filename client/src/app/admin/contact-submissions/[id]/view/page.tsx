'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  LoaderCircle, 
  User, 
  Mail, 
  Calendar, 
  MessageSquare, 
  Phone, 
  CheckCircle2, 
  Clock, 
  Send, 
  Sparkles, 
  Copy, 
  Check, 
  ExternalLink,
  ShieldCheck,
  Globe,
  Trash2,
  Share2,
  FileText,
  HelpCircle,
  CornerDownRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';

import { API_BASE_URL } from '@/lib/utils';
import { authFetch } from '@/lib/api';

interface Submission {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  tour_interest?: string;
  message: string;
  status?: 'unread' | 'read' | 'replied' | 'resolved' | 'pending';
  created_at: string;
}

export default function ViewContactSubmissionPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const id = params.id as string;

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Email reply form state
  const [replyTo, setReplyTo] = useState('');
  const [replySubject, setReplySubject] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    async function fetchSubmission() {
      setIsLoading(true);
      try {
        const response = await authFetch(`${API_BASE_URL}/contacts/${id}`);
        if (!response.ok) {
          throw new Error('Submission not found.');
        }
        const data = await response.json();
        setSubmission(data);

        // Pre-fill email reply defaults
        setReplyTo(data.email || '');
        const subj = data.subject || data.tour_interest || 'Your Inquiry with Sapphire Trails';
        setReplySubject(subj.startsWith('Re:') ? subj : `Re: ${subj}`);

        // If status was unread, automatically mark as read
        if (data.status === 'unread' || !data.status) {
          authFetch(`${API_BASE_URL}/contacts/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'read' }),
          }).catch(() => {});
          setSubmission((prev) => (prev ? { ...prev, status: 'read' } : prev));
        }
      } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load submission data.' });
      } finally {
        setIsLoading(false);
      }
    }
    fetchSubmission();
  }, [id, toast]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!id) return;
    setIsUpdatingStatus(true);
    try {
      const response = await authFetch(`${API_BASE_URL}/contacts/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const fb = await authFetch(`${API_BASE_URL}/contacts/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });
        if (!fb.ok) throw new Error('Failed to update status');
      }

      setSubmission((prev) => (prev ? { ...prev, status: newStatus as any } : prev));
      toast({
        title: 'Status Updated',
        description: `Marked inquiry as ${newStatus}.`,
      });
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not update status.',
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !submission) return;

    if (!replyMessage.trim()) {
      toast({
        variant: 'destructive',
        title: 'Message Required',
        description: 'Please enter a reply message before sending.',
      });
      return;
    }

    setIsSendingReply(true);
    try {
      const response = await authFetch(`${API_BASE_URL}/contacts/${id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: replyTo,
          subject: replySubject,
          message: replyMessage,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'Failed to dispatch email reply.');
      }

      // Update local status to replied
      setSubmission((prev) => (prev ? { ...prev, status: 'replied' } : prev));
      
      toast({
        title: '✨ Email Dispatched Successfully',
        description: `Reply sent directly to ${replyTo}. Inquiry marked as Replied.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Email Delivery Failed',
        description: error instanceof Error ? error.message : 'Could not send email reply.',
      });
    } finally {
      setIsSendingReply(false);
    }
  };

  const applyTemplate = (type: 'proposal' | 'availability' | 'general') => {
    if (!submission) return;
    const name = submission.name || 'Valued Guest';

    if (type === 'proposal') {
      setReplyMessage(
`Dear ${name},

Thank you for contacting Sapphire Trails regarding your bespoke gem tour and custom jewelry inquiry.

We have reviewed your preferences and requirements. Our senior gemologist and bespoke travel concierge are preparing a customized proposal including:
- Private VIP transport and guided exploration of the Ratnapura gem mines.
- Exclusive access to private rough and cut sapphire trading vaults.
- Expert selection of certified Ceylon sapphires matching your specifications.

Could you please let us know if your preferred dates remain flexible, and if you have any specific accommodation preferences during your stay in Sri Lanka?

We look forward to curating an unforgettable bespoke experience for you.

Warm regards,
The Sapphire Trails Concierge Team`
      );
    } else if (type === 'availability') {
      setReplyMessage(
`Dear ${name},

Thank you for your interest in Sapphire Trails.

We are delighted to confirm that our private gemological tours and expert mining experiences have availability for your requested timeframe.

All our tours include private VIP transportation, licensed gemologist guide, gemological museum visits, and traditional Sri Lankan refreshments.

Please let us know your preferred start date and party size so we can secure your private itinerary.

Best regards,
Sapphire Trails Concierge`
      );
    } else if (type === 'general') {
      setReplyMessage(
`Dear ${name},

Thank you for reaching out to Sapphire Trails.

Regarding your inquiry:


Please feel free to reply to this email or contact us directly on WhatsApp (+94 71 235 7700) if you have any additional questions.

Best regards,
The Sapphire Trails Team`
      );
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
    toast({
      title: 'Copied to Clipboard',
      description: `${label} copied.`,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <div className="flex flex-col items-center gap-3 text-muted-foreground animate-pulse">
          <LoaderCircle className="animate-spin h-10 w-10 text-primary" />
          <p className="text-sm font-medium">Loading inquiry details...</p>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 min-h-[400px]">
        <p className="text-xl font-semibold">Submission not found.</p>
        <Button onClick={() => router.push('/admin/contact-submissions')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Submissions
        </Button>
      </div>
    );
  }

  const status = submission.status || 'read';
  const cleanPhone = submission.phone ? submission.phone.replace(/[^0-9+]/g, '') : '';
  const waPhone = cleanPhone.startsWith('0') ? '94' + cleanPhone.substring(1) : cleanPhone;

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1600px] mx-auto pb-16">
      {/* 1. Full-Width Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/80 pb-5">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => router.push('/admin/contact-submissions')} 
            className="h-10 w-10 shrink-0 bg-background shadow-xs hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Inquiry #{submission.id}
              </h1>
              <span className="text-muted-foreground font-normal text-lg sm:text-2xl">
                • {submission.name}
              </span>
              <Badge
                variant="outline"
                className={`capitalize font-semibold text-xs px-3 py-0.5 rounded-full ${
                  status === 'unread'
                    ? 'bg-amber-500/15 text-amber-600 border-amber-300 animate-pulse'
                    : status === 'replied'
                    ? 'bg-emerald-500/15 text-emerald-600 border-emerald-300'
                    : status === 'resolved'
                    ? 'bg-slate-500/15 text-slate-600 border-slate-300'
                    : 'bg-blue-500/15 text-blue-600 border-blue-300'
                }`}
              >
                ● Status: {status}
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5" />
              Received on {format(parseISO(submission.created_at), 'EEEE, MMMM d, yyyy • h:mm a')}
            </p>
          </div>
        </div>

        {/* Top Controls & Status Dropdown */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-card p-1 rounded-xl border shadow-xs">
            <span className="text-xs font-semibold text-muted-foreground pl-2">Status:</span>
            <Select
              value={status}
              onValueChange={handleStatusUpdate}
              disabled={isUpdatingStatus}
            >
              <SelectTrigger className="h-8 w-36 text-xs font-semibold bg-background border rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unread" className="text-xs text-amber-600 font-semibold">
                  ● Unread
                </SelectItem>
                <SelectItem value="read" className="text-xs text-blue-600 font-semibold">
                  ● Read
                </SelectItem>
                <SelectItem value="replied" className="text-xs text-emerald-600 font-semibold">
                  ● Replied
                </SelectItem>
                <SelectItem value="resolved" className="text-xs text-slate-600 font-semibold">
                  ● Resolved
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {cleanPhone && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-10 text-xs gap-2 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 font-semibold"
            >
              <a
                href={`https://wa.me/${waPhone}?text=${encodeURIComponent(`Hello ${submission.name}, thank you for contacting Sapphire Trails regarding your inquiry.`)}`}
                target="_blank"
                rel="noreferrer"
              >
                <MessageSquare className="h-4 w-4" />
                WhatsApp
              </a>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/contact-submissions')}
            className="h-10 text-xs gap-1.5"
          >
            All Inquiries
          </Button>
        </div>
      </div>

      {/* 2. Full-Width 2-Column Command Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full items-start">
        
        {/* LEFT COLUMN (Inquiry Details & Customer Message) - 6 Cols */}
        <div className="xl:col-span-6 space-y-6">
          
          {/* Sender Overview Card */}
          <Card className="border bg-card shadow-xs overflow-hidden">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Sender Information
                </CardTitle>
                <Badge variant="outline" className="text-[11px] font-medium bg-background">
                  Lead ID #{submission.id}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Full Name</p>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-background border">
                  <span className="font-semibold text-sm text-foreground">{submission.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                    onClick={() => copyToClipboard(submission.name, 'Name')}
                  >
                    {copiedField === 'Name' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Email Address</p>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-background border">
                  <span className="font-semibold text-sm text-foreground truncate max-w-[200px]" title={submission.email}>
                    {submission.email}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                    onClick={() => copyToClipboard(submission.email, 'Email')}
                  >
                    {copiedField === 'Email' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              </div>

              {submission.phone && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Phone / WhatsApp</p>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-background border">
                    <span className="font-semibold text-sm text-foreground">{submission.phone}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                      onClick={() => copyToClipboard(submission.phone || '', 'Phone')}
                    >
                      {copiedField === 'Phone' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </div>
              )}

              {submission.subject && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Subject / Topic</p>
                  <div className="p-2.5 rounded-lg bg-background border">
                    <span className="font-semibold text-sm text-foreground truncate block" title={submission.subject}>
                      {submission.subject}
                    </span>
                  </div>
                </div>
              )}

              {submission.tour_interest && (
                <div className="space-y-1 sm:col-span-2">
                  <p className="text-xs text-muted-foreground font-medium">Tour Package / Interest</p>
                  <div className="p-2.5 rounded-lg bg-background border flex items-center justify-between">
                    <span className="font-semibold text-sm text-foreground">{submission.tour_interest}</span>
                    <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
                      Tour Lead
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Message & Custom Proposal Requirements Card */}
          <Card className="border bg-card shadow-xs overflow-hidden">
            <CardHeader className="pb-3 border-b bg-muted/20 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Inquiry Message &amp; Specifications
                </CardTitle>
                <CardDescription className="text-xs">Original customer requirements submitted from website</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => copyToClipboard(submission.message, 'Message')}
              >
                {copiedField === 'Message' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                Copy Message
              </Button>
            </CardHeader>
            <CardContent className="p-5">
              <div className="p-4 rounded-xl bg-background border border-border/80 text-foreground text-sm leading-relaxed whitespace-pre-wrap font-sans">
                {submission.message}
              </div>
            </CardContent>
            <CardFooter className="pt-0 border-t flex items-center justify-between text-xs text-muted-foreground py-2.5 bg-muted/20">
              <span>Length: {submission.message.length} characters</span>
              <span className="text-emerald-600 font-medium">✓ SSL Encrypted Submission</span>
            </CardFooter>
          </Card>
        </div>

        {/* RIGHT COLUMN (Direct Email Reply Console) - 6 Cols */}
        <div className="xl:col-span-6 space-y-6">
          <Card className="border border-primary/20 bg-card shadow-md overflow-hidden">
            <CardHeader className="pb-3 border-b bg-primary/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold">Direct Email Reply Console</CardTitle>
                    <CardDescription className="text-xs">
                      Send official branded response via Sapphire Trails SMTP
                    </CardDescription>
                  </div>
                </div>
                {status === 'replied' ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Already Replied
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-200">
                    <Clock className="h-3.5 w-3.5" /> Awaiting Response
                  </span>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              {/* Quick Template Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Load Quick Response Templates:
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => applyTemplate('proposal')}
                    className="h-7 text-xs rounded-full border-primary/30 hover:bg-primary/10 text-foreground"
                  >
                    💎 Bespoke Proposal
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => applyTemplate('availability')}
                    className="h-7 text-xs rounded-full border-sky-500/30 hover:bg-sky-500/10 text-foreground"
                  >
                    📅 Tour Availability
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => applyTemplate('general')}
                    className="h-7 text-xs rounded-full border-border hover:bg-muted text-foreground"
                  >
                    ✍️ General Template
                  </Button>
                </div>
              </div>

              <form onSubmit={handleSendReply} className="space-y-4 pt-2">
                {/* To Recipient */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Recipient Email (To):</label>
                  <Input
                    type="email"
                    value={replyTo}
                    onChange={(e) => setReplyTo(e.target.value)}
                    required
                    placeholder="customer@example.com"
                    className="h-9 text-xs bg-background"
                  />
                </div>

                {/* Email Subject */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Email Subject:</label>
                  <Input
                    type="text"
                    value={replySubject}
                    onChange={(e) => setReplySubject(e.target.value)}
                    required
                    placeholder="Re: Your Inquiry"
                    className="h-9 text-xs bg-background"
                  />
                </div>

                {/* Message Body */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-muted-foreground">Reply Message Body:</label>
                    <span className="text-[11px] text-muted-foreground">{replyMessage.length} chars</span>
                  </div>
                  <Textarea
                    rows={12}
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    required
                    placeholder="Type your official reply here... (Will be enclosed in Sapphire Trails luxury email template with logo, concierge signature & WhatsApp link)"
                    className="text-xs bg-background font-sans leading-relaxed min-h-[220px]"
                  />
                </div>

                {/* Information Banner */}
                <div className="p-3 rounded-xl bg-muted/40 border text-[11px] text-muted-foreground flex items-start gap-2.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p>
                    Emails are sent with official Sapphire Trails branding, licensed gemologist footer, customer quotation reference, and a direct WhatsApp concierge link.
                  </p>
                </div>

                {/* Submit Action */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={isSendingReply || !replyMessage.trim()}
                    className="w-full sm:w-auto h-10 px-6 gap-2 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                  >
                    {isSendingReply ? (
                      <>
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        <span>Sending Official Email...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Send Official Email Reply</span>
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setReplyMessage('')}
                    disabled={isSendingReply || !replyMessage}
                    className="w-full sm:w-auto h-10 text-xs"
                  >
                    Clear Message
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
