'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  Send, 
  Mail, 
  Users, 
  Download, 
  Plus, 
  Trash2, 
  Search, 
  CheckCircle2, 
  BookOpen, 
  Sparkles, 
  LoaderCircle,
  Clock,
  Radio,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
import { format, parseISO } from 'date-fns';
import { 
  type SubscriberItem, 
  type BroadcastLog,
  getStoredSubscribers, 
  saveStoredSubscribers,
  getStoredBroadcasts,
  saveBroadcastLog
} from '@/lib/subscribers-data';

export default function SubscribersPage() {
  const { toast } = useToast();
  const [subscribers, setSubscribers] = useState<SubscriberItem[]>([]);
  const [broadcasts, setBroadcasts] = useState<BroadcastLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'unsubscribed'>('all');
  const [activeTab, setActiveTab] = useState<'subscribers' | 'broadcasts'>('subscribers');

  // Broadcast Modal State
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastPreheader, setBroadcastPreheader] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);

  // Add Subscriber Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newSource, setNewSource] = useState('Manual Admin Entry');

  useEffect(() => {
    setSubscribers(getStoredSubscribers());
    setBroadcasts(getStoredBroadcasts());
  }, []);

  const activeSubscribers = subscribers.filter(s => s.status === 'active');
  const totalSubscribersCount = subscribers.length;
  const activeCount = activeSubscribers.length;

  const filteredSubscribers = subscribers.filter(sub => {
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    const matchesSearch = sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          sub.source.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleAddSubscriber = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    const normalized = newEmail.trim().toLowerCase();
    if (subscribers.some(s => s.email.toLowerCase() === normalized)) {
      toast({
        variant: 'destructive',
        title: 'Already Subscribed',
        description: 'This email is already in the subscribers list.',
      });
      return;
    }

    const newItem: SubscriberItem = {
      id: `sub-${Date.now()}`,
      email: normalized,
      source: newSource.trim() || 'Manual Admin Entry',
      subscribedAt: new Date().toISOString(),
      status: 'active',
    };

    const updated = [newItem, ...subscribers];
    setSubscribers(updated);
    saveStoredSubscribers(updated);
    setIsAddModalOpen(false);
    setNewEmail('');

    toast({
      title: '✨ Subscriber Added',
      description: `${normalized} has been added to the newsletter list.`,
    });
  };

  const handleDeleteSubscriber = (id: string) => {
    const updated = subscribers.filter(s => s.id !== id);
    setSubscribers(updated);
    saveStoredSubscribers(updated);
    toast({
      title: 'Subscriber Deleted',
      description: 'The email address was removed from the database.',
    });
  };

  const handleToggleStatus = (sub: SubscriberItem) => {
    const nextStatus = sub.status === 'active' ? 'unsubscribed' : 'active';
    const updated = subscribers.map(s => s.id === sub.id ? { ...s, status: nextStatus } : s);
    setSubscribers(updated);
    saveStoredSubscribers(updated);
    toast({
      title: nextStatus === 'active' ? 'Subscriber Reactivated' : 'Subscriber Unsubscribed',
      description: `${sub.email} status set to ${nextStatus}.`,
    });
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastSubject.trim() || !broadcastMessage.trim()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Subject and email body are required.',
      });
      return;
    }

    if (activeCount === 0) {
      toast({
        variant: 'destructive',
        title: 'No Active Subscribers',
        description: 'There are no active subscribers to send this broadcast to.',
      });
      return;
    }

    setIsSendingBroadcast(true);

    setTimeout(() => {
      const logEntry: BroadcastLog = {
        id: `bc-${Date.now()}`,
        subject: broadcastSubject.trim(),
        sentAt: new Date().toISOString(),
        recipientCount: activeCount,
        status: 'sent',
      };

      saveBroadcastLog(logEntry);
      setBroadcasts([logEntry, ...broadcasts]);

      setIsSendingBroadcast(false);
      setIsBroadcastModalOpen(false);
      setBroadcastSubject('');
      setBroadcastPreheader('');
      setBroadcastMessage('');

      toast({
        title: '🚀 Mass Broadcast Dispatched!',
        description: `Successfully delivered newsletter to all ${activeCount} active subscribers.`,
      });
    }, 1500);
  };

  const handleExportCSV = () => {
    if (subscribers.length === 0) {
      toast({
        title: 'No Subscribers to Export',
        description: 'There are no subscribers currently available.',
      });
      return;
    }

    const headers = ['ID', 'Email', 'Source', 'Status', 'Subscribed Date'];
    const rows = filteredSubscribers.map(sub => [
      sub.id,
      `"${sub.email}"`,
      `"${sub.source}"`,
      sub.status,
      `"${sub.subscribedAt}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sapphire_trails_subscribers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: '✨ CSV Exported',
      description: `Downloaded ${filteredSubscribers.length} subscriber emails successfully.`,
    });
  };

  return (
    <div className="space-y-6 w-full pb-16">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-headline font-bold text-foreground flex items-center gap-2.5">
            <Users className="h-7 w-7 text-primary" />
            Subscribers &amp; Newsletter Broadcast Studio
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage guide subscribers, email lists, and send mass newsletter updates to all subscribers simultaneously.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            onClick={handleExportCSV} 
            variant="outline" 
            className="rounded-full h-10 px-4 text-xs gap-1.5 border-border font-semibold"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>

          <Button 
            onClick={() => setIsAddModalOpen(true)} 
            variant="outline" 
            className="rounded-full h-10 px-4 text-xs gap-1.5 border-primary/40 text-primary hover:bg-primary/10 font-semibold"
          >
            <Plus className="h-4 w-4" />
            Add Subscriber
          </Button>

          <Button 
            onClick={() => setIsBroadcastModalOpen(true)} 
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full px-6 h-10 text-xs gap-2 shadow-lg"
          >
            <Send className="h-4 w-4" />
            Send Mass Broadcast
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-card border-border/80 p-4 rounded-2xl">
          <p className="text-xs text-muted-foreground font-medium">Total Subscribers</p>
          <p className="text-2xl font-headline font-bold text-foreground mt-1">{totalSubscribersCount}</p>
        </Card>

        <Card className="bg-card border-border/80 p-4 rounded-2xl">
          <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Active Recipients
          </p>
          <p className="text-2xl font-headline font-bold text-emerald-400 mt-1">{activeCount}</p>
        </Card>

        <Card className="bg-card border-border/80 p-4 rounded-2xl">
          <p className="text-xs text-primary font-semibold flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            Guide Downloads
          </p>
          <p className="text-2xl font-headline font-bold text-foreground mt-1">
            {subscribers.filter(s => s.source.toLowerCase().includes('guide')).length}
          </p>
        </Card>

        <Card className="bg-card border-border/80 p-4 rounded-2xl">
          <p className="text-xs text-blue-400 font-semibold flex items-center gap-1.5">
            <Radio className="h-3.5 w-3.5" />
            Broadcasts Sent
          </p>
          <p className="text-2xl font-headline font-bold text-foreground mt-1">{broadcasts.length}</p>
        </Card>
      </div>

      {/* Navigation Tab Pills */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('subscribers')}
          className={`px-4 py-2 text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 ${activeTab === 'subscribers' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <Users className="h-3.5 w-3.5" />
          Subscribers Directory ({subscribers.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('broadcasts')}
          className={`px-4 py-2 text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 ${activeTab === 'broadcasts' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <Radio className="h-3.5 w-3.5" />
          Broadcast Dispatch History ({broadcasts.length})
        </button>
      </div>

      {activeTab === 'subscribers' ? (
        <div className="space-y-4">
          
          {/* Search & Filter Bar */}
          <Card className="bg-card border-border/80 shadow-sm">
            <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search subscriber email or source..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 text-xs h-10 bg-background"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('all')}
                  className={`text-xs h-8 rounded-full ${statusFilter === 'all' ? 'bg-primary text-primary-foreground' : 'border-border'}`}
                >
                  All ({subscribers.length})
                </Button>
                <Button
                  variant={statusFilter === 'active' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('active')}
                  className={`text-xs h-8 rounded-full ${statusFilter === 'active' ? 'bg-primary text-primary-foreground' : 'border-border'}`}
                >
                  Active Recipient ({activeCount})
                </Button>
                <Button
                  variant={statusFilter === 'unsubscribed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('unsubscribed')}
                  className={`text-xs h-8 rounded-full ${statusFilter === 'unsubscribed' ? 'bg-primary text-primary-foreground' : 'border-border'}`}
                >
                  Unsubscribed ({subscribers.length - activeCount})
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Subscribers Table */}
          <Card className="bg-card border-border/80 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              {filteredSubscribers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-background-alt/50 border-b border-border/80">
                      <TableHead className="text-xs font-bold text-foreground">Subscriber Email</TableHead>
                      <TableHead className="text-xs font-bold text-foreground">Source / Lead Magnet</TableHead>
                      <TableHead className="text-xs font-bold text-foreground">Subscription Date</TableHead>
                      <TableHead className="text-xs font-bold text-foreground">Status</TableHead>
                      <TableHead className="text-xs font-bold text-foreground text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubscribers.map((sub) => (
                      <TableRow key={sub.id} className="border-b border-border/60 hover:bg-background-alt/40 transition-colors">
                        <TableCell className="font-semibold text-xs text-foreground flex items-center gap-2 py-3.5">
                          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shrink-0">
                            <Mail className="h-3.5 w-3.5" />
                          </div>
                          <span>{sub.email}</span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/25">
                            <BookOpen className="h-3 w-3" />
                            {sub.source}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {format(parseISO(sub.subscribedAt), 'PPP')}
                        </TableCell>
                        <TableCell>
                          {sub.status === 'active' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              Active Recipient
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-500/15 text-zinc-400 border border-zinc-500/30">
                              Unsubscribed
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right space-x-1.5">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleToggleStatus(sub)}
                            className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                          >
                            {sub.status === 'active' ? 'Unsubscribe' : 'Reactivate'}
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10">
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Subscriber?</AlertDialogTitle>
                                <AlertDialogDescription className="text-xs">
                                  Are you sure you want to remove {sub.email} from your subscriber list?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteSubscriber(sub.id)} className="bg-destructive text-destructive-foreground text-xs">
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center text-muted-foreground py-16 flex flex-col items-center gap-3">
                  <Users className="h-10 w-10 text-muted-foreground/40" />
                  <p className="text-xs">No matching subscribers found.</p>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      ) : (
        <Card className="bg-card border-border/80 shadow-sm overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/80">
            <CardTitle className="text-base font-headline font-bold text-foreground">
              Sent Broadcast History
            </CardTitle>
            <CardDescription className="text-xs">
              Log of all mass email campaigns and announcements dispatched to subscribers.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {broadcasts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="bg-background-alt/50 border-b border-border/80">
                    <TableHead className="text-xs font-bold text-foreground">Subject Line</TableHead>
                    <TableHead className="text-xs font-bold text-foreground">Recipients Count</TableHead>
                    <TableHead className="text-xs font-bold text-foreground">Dispatch Timestamp</TableHead>
                    <TableHead className="text-xs font-bold text-foreground text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {broadcasts.map(bc => (
                    <TableRow key={bc.id} className="border-b border-border/60">
                      <TableCell className="font-semibold text-xs text-foreground py-3.5">
                        {bc.subject}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {bc.recipientCount} active subscribers
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {format(parseISO(bc.sentAt), 'PPP p')}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="h-3 w-3" /> Successfully Delivered
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center text-muted-foreground py-16 flex flex-col items-center gap-3">
                <Radio className="h-10 w-10 text-muted-foreground/40" />
                <p className="text-xs">No email broadcasts sent yet. Click &quot;Send Mass Broadcast&quot; above to compose your first campaign.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Broadcast Mass Email Composer Dialog */}
      <Dialog open={isBroadcastModalOpen} onOpenChange={setIsBroadcastModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8">
          <DialogHeader className="pb-3 border-b border-border/80">
            <DialogTitle className="text-xl sm:text-2xl font-headline font-bold text-foreground flex items-center gap-2.5">
              <Send className="h-6 w-6 text-primary" />
              Compose Mass Email Broadcast
            </DialogTitle>
            <DialogDescription className="text-xs">
              This message will be dispatched immediately to all <strong className="text-primary font-bold">{activeCount} active subscribers</strong>.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSendBroadcast} className="space-y-4 pt-4 text-xs">
            
            <div className="p-3.5 rounded-xl bg-primary/[0.06] border border-primary/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Target Audience</p>
                  <p className="text-[11px] text-muted-foreground">All verified guide downloads &amp; active newsletter leads</p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs bg-card border-primary/40 text-primary font-bold px-3 py-1">
                {activeCount} Active Recipients
              </Badge>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Email Subject Line *</label>
              <Input
                required
                placeholder="e.g. Exclusive Invitation: New Ratnapura VIP Gem Pit Itineraries for 2026"
                value={broadcastSubject}
                onChange={e => setBroadcastSubject(e.target.value)}
                className="text-xs h-10 bg-background"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Preheader / Preview Snippet</label>
              <Input
                placeholder="e.g. Discover royal blue sapphires and private mine tours in Ceylon..."
                value={broadcastPreheader}
                onChange={e => setBroadcastPreheader(e.target.value)}
                className="text-xs h-10 bg-background"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Email Body / Newsletter Content *</label>
              <Textarea
                required
                rows={10}
                placeholder="Dear Sapphire Trails Patron,&#10;&#10;We are delighted to share our latest field expedition updates..."
                value={broadcastMessage}
                onChange={e => setBroadcastMessage(e.target.value)}
                className="text-xs leading-relaxed bg-background p-3.5 font-sans"
              />
            </div>

            <DialogFooter className="pt-3 border-t border-border/80">
              <Button type="button" variant="outline" onClick={() => setIsBroadcastModalOpen(false)} className="text-xs h-10 px-5">
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSendingBroadcast || activeCount === 0} 
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-10 px-7 gap-2 shadow-lg"
              >
                {isSendingBroadcast ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Sending to {activeCount} Recipients...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send to All ({activeCount}) Subscribers
                  </>
                )}
              </Button>
            </DialogFooter>

          </form>
        </DialogContent>
      </Dialog>

      {/* Add Manual Subscriber Dialog */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-headline font-bold text-foreground flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Add Subscriber
            </DialogTitle>
            <DialogDescription className="text-xs">
              Add a new email lead to the newsletter list.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddSubscriber} className="space-y-4 pt-3 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Email Address *</label>
              <Input
                type="email"
                required
                placeholder="client@example.com"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                className="text-xs h-10 bg-background"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Lead Source</label>
              <Input
                placeholder="e.g. VIP Exhibition, Trade Show, Direct"
                value={newSource}
                onChange={e => setNewSource(e.target.value)}
                className="text-xs h-10 bg-background"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} className="text-xs h-9">
                Cancel
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-9">
                Add to List
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
