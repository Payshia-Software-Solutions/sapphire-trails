'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  LoaderCircle, 
  Trash2, 
  Eye, 
  MessageSquare, 
  Download, 
  Search, 
  BookOpen, 
  Mail, 
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  Send,
  CheckCheck,
  Filter
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
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
import { format, parseISO } from 'date-fns';
import { API_BASE_URL } from '@/lib/utils';
import { authFetch } from '@/lib/api';

export type InquiryStatus = 'unread' | 'read' | 'replied' | 'resolved' | 'pending';

export interface Submission {
  id: number;
  name: string;
  email: string;
  phone?: string;
  tour_interest?: string;
  subject?: string;
  message: string;
  status?: InquiryStatus;
  created_at: string;
}

export default function ContactSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | 'replied' | 'guide' | 'inquiries'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchSubmissions() {
      setIsLoading(true);
      try {
        const response = await authFetch(`${API_BASE_URL}/contacts`);
        if (!response.ok) {
          throw new Error('Could not fetch submissions from server.');
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setSubmissions(
            data.map((item) => ({
              ...item,
              status: item.status || 'unread',
            })).sort((a, b) => parseISO(b.created_at).getTime() - parseISO(a.created_at).getTime())
          );
        }
      } catch (error) {
        console.error(error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to load data.',
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchSubmissions();
  }, [toast]);

  const handleStatusChange = async (submissionId: number, newStatus: InquiryStatus) => {
    setUpdatingId(submissionId);
    try {
      const response = await authFetch(`${API_BASE_URL}/contacts/${submissionId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        // Fallback to general PUT
        const fallbackRes = await authFetch(`${API_BASE_URL}/contacts/${submissionId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });
        if (!fallbackRes.ok) throw new Error('Failed to update status on server.');
      }

      setSubmissions((prev) =>
        prev.map((sub) => (sub.id === submissionId ? { ...sub, status: newStatus } : sub))
      );

      toast({
        title: 'Status Updated',
        description: `Inquiry #${submissionId} marked as "${newStatus}".`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error instanceof Error ? error.message : 'Could not change status.',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (submissionId: number, submissionName: string) => {
    try {
      const response = await authFetch(`${API_BASE_URL}/contacts/${submissionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete submission from server.');
      }

      setSubmissions((prev) => prev.filter((sub) => sub.id !== submissionId));
      toast({
        title: 'Submission Deleted',
        description: `The entry from "${submissionName}" has been deleted.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Delete Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
    }
  };

  const isGuideSubscriber = (sub: Submission) => {
    const text = (
      sub.message +
      ' ' +
      (sub.tour_interest || '') +
      ' ' +
      (sub.subject || '') +
      ' ' +
      sub.name
    ).toLowerCase();
    return text.includes('guide') || text.includes('subscriber') || text.includes('lead magnet');
  };

  const filteredSubmissions = submissions.filter((sub) => {
    const isGuide = isGuideSubscriber(sub);
    const matchesFilter =
      selectedFilter === 'all' ||
      (selectedFilter === 'unread' && (sub.status === 'unread' || !sub.status)) ||
      (selectedFilter === 'replied' && (sub.status === 'replied' || sub.status === 'resolved')) ||
      (selectedFilter === 'guide' && isGuide) ||
      (selectedFilter === 'inquiries' && !isGuide);

    const matchesSearch =
      sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sub.subject && sub.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (sub.status && sub.status.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const unreadCount = submissions.filter((s) => s.status === 'unread' || !s.status).length;
  const repliedCount = submissions.filter((s) => s.status === 'replied' || s.status === 'resolved').length;
  const guideCount = submissions.filter(isGuideSubscriber).length;
  const inquiryCount = submissions.length - guideCount;

  const handleExportCSV = () => {
    if (submissions.length === 0) {
      toast({
        title: 'No Data to Export',
        description: 'There are no submissions currently available to export.',
      });
      return;
    }

    const headers = ['ID', 'Status', 'Type', 'Name', 'Email', 'Phone', 'Subject / Tour', 'Message', 'Date'];
    const rows = filteredSubmissions.map((sub) => [
      sub.id,
      sub.status || 'unread',
      isGuideSubscriber(sub) ? 'Guide Subscriber' : 'Contact Inquiry',
      `"${(sub.name || '').replace(/"/g, '""')}"`,
      `"${(sub.email || '').replace(/"/g, '""')}"`,
      `"${(sub.phone || '').replace(/"/g, '""')}"`,
      `"${(sub.tour_interest || sub.subject || '').replace(/"/g, '""')}"`,
      `"${(sub.message || '').replace(/"/g, '""')}"`,
      `"${sub.created_at}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sapphire_trails_inquiries_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: '✨ CSV Exported',
      description: `Downloaded ${filteredSubmissions.length} records successfully.`,
    });
  };

  return (
    <div className="space-y-6 w-full pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-headline font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <MessageSquare className="h-7 w-7 text-primary" />
            Customer Inquiries &amp; Leads
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage incoming messages, inquiry response statuses, and newsletter lead submissions.
          </p>
        </div>

        <Button
          onClick={handleExportCSV}
          variant="outline"
          className="rounded-full h-10 px-5 text-xs gap-2 border-primary/40 text-primary hover:bg-primary/10 font-semibold shadow-sm"
        >
          <Download className="h-4 w-4" />
          Export Inquiries (CSV)
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border/80 p-4 rounded-2xl shadow-xs">
          <p className="text-xs text-muted-foreground font-medium">Total Submissions</p>
          <p className="text-2xl font-headline font-bold text-foreground mt-1">{submissions.length}</p>
        </Card>

        <Card className="bg-card border-amber-500/30 bg-amber-500/5 p-4 rounded-2xl shadow-xs">
          <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Unread / Awaiting Action
          </p>
          <div className="flex items-baseline justify-between mt-1">
            <p className="text-2xl font-headline font-bold text-amber-700 dark:text-amber-300">{unreadCount}</p>
            {unreadCount > 0 && (
              <span className="text-[10px] bg-amber-500/20 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold">
                Action needed
              </span>
            )}
          </div>
        </Card>

        <Card className="bg-card border-emerald-500/30 bg-emerald-500/5 p-4 rounded-2xl shadow-xs">
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
            <CheckCheck className="h-3.5 w-3.5" />
            Replied / Resolved
          </p>
          <p className="text-2xl font-headline font-bold text-emerald-700 dark:text-emerald-300 mt-1">{repliedCount}</p>
        </Card>

        <Card className="bg-card border-border/80 p-4 rounded-2xl shadow-xs">
          <p className="text-xs text-primary font-semibold flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            Guide Subscribers
          </p>
          <p className="text-2xl font-headline font-bold text-foreground mt-1">{guideCount}</p>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <Card className="bg-card border-border/80 shadow-sm">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, subject, status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs h-10 bg-background"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <Button
              variant={selectedFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('all')}
              className={`text-xs h-8 rounded-full ${
                selectedFilter === 'all' ? 'bg-primary text-primary-foreground' : 'border-border'
              }`}
            >
              All ({submissions.length})
            </Button>
            <Button
              variant={selectedFilter === 'unread' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('unread')}
              className={`text-xs h-8 rounded-full gap-1 ${
                selectedFilter === 'unread' ? 'bg-amber-600 text-white' : 'border-border'
              }`}
            >
              <Clock className="h-3 w-3" /> Unread ({unreadCount})
            </Button>
            <Button
              variant={selectedFilter === 'replied' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('replied')}
              className={`text-xs h-8 rounded-full gap-1 ${
                selectedFilter === 'replied' ? 'bg-emerald-600 text-white' : 'border-border'
              }`}
            >
              <CheckCheck className="h-3 w-3" /> Replied ({repliedCount})
            </Button>
            <Button
              variant={selectedFilter === 'guide' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('guide')}
              className={`text-xs h-8 rounded-full gap-1 ${
                selectedFilter === 'guide' ? 'bg-primary text-primary-foreground' : 'border-border'
              }`}
            >
              <BookOpen className="h-3 w-3" /> Guide ({guideCount})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Table Card */}
      <Card className="bg-card border-border/80 shadow-sm overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/80">
          <CardTitle className="text-base font-headline font-bold text-foreground">
            Customer Messages &amp; Status Pipeline
          </CardTitle>
          <CardDescription className="text-xs">
            Track inquiries from initial contact to response and resolution.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center text-muted-foreground py-16 flex flex-col items-center gap-4">
              <LoaderCircle className="h-10 w-10 text-primary animate-spin" />
              <p className="text-xs">Loading customer submissions...</p>
            </div>
          ) : filteredSubmissions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-background-alt/50 border-b border-border/80">
                  <TableHead className="text-xs font-bold text-foreground">Status</TableHead>
                  <TableHead className="text-xs font-bold text-foreground">Sender &amp; Details</TableHead>
                  <TableHead className="text-xs font-bold text-foreground hidden md:table-cell">Message Preview</TableHead>
                  <TableHead className="text-xs font-bold text-foreground">Received Date</TableHead>
                  <TableHead className="text-xs font-bold text-foreground text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((submission) => {
                  const isGuide = isGuideSubscriber(submission);
                  const status = submission.status || 'unread';

                  return (
                    <TableRow
                      key={submission.id}
                      className={`border-b border-border/60 hover:bg-background-alt/40 transition-colors ${
                        status === 'unread' ? 'bg-amber-500/[0.02]' : ''
                      }`}
                    >
                      {/* Status Selector Cell */}
                      <TableCell className="py-3 w-[150px]">
                        <Select
                          value={status}
                          onValueChange={(val) => handleStatusChange(submission.id, val as InquiryStatus)}
                          disabled={updatingId === submission.id}
                        >
                          <SelectTrigger className="h-7 text-xs border rounded-full px-2.5 gap-1 font-medium bg-background">
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
                      </TableCell>

                      {/* Sender Info */}
                      <TableCell className="py-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-xs text-foreground break-words">
                              {submission.name}
                            </span>
                            {isGuide ? (
                              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-primary/10 text-primary border border-primary/20">
                                Guide
                              </span>
                            ) : null}
                          </div>
                          <p className="text-[11px] text-muted-foreground break-all">{submission.email}</p>
                          {submission.phone && (
                            <p className="text-[10px] text-muted-foreground">{submission.phone}</p>
                          )}
                        </div>
                      </TableCell>

                      {/* Message Preview */}
                      <TableCell className="hidden md:table-cell py-3 max-w-[320px]">
                        <p className="text-xs text-muted-foreground truncate" title={submission.message}>
                          {submission.message}
                        </p>
                        {submission.subject && (
                          <span className="text-[10px] text-primary/80 font-medium truncate block">
                            Sub: {submission.subject}
                          </span>
                        )}
                      </TableCell>

                      {/* Received Date */}
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(submission.created_at), 'MMM d, yyyy')}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right space-x-1.5 whitespace-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="h-8 px-2.5 text-xs gap-1 border-border"
                        >
                          <Link href={`/admin/contact-submissions/${submission.id}/view`}>
                            <Eye className="h-3.5 w-3.5 text-primary" />
                            View
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Submission?</AlertDialogTitle>
                              <AlertDialogDescription className="break-words text-xs">
                                This will permanently delete the entry from{' '}
                                <span className="font-semibold text-foreground">&quot;{submission.name}&quot;</span>.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(submission.id, submission.name)}
                                className="bg-destructive text-destructive-foreground text-xs"
                              >
                                Yes, delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center text-muted-foreground py-16 flex flex-col items-center gap-3">
              <MessageSquare className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-xs">No matching submissions found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
