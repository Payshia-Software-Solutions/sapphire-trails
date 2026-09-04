'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { 
  Mail, 
  Send, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Search, 
  Trash2, 
  LoaderCircle, 
  Save, 
  ShieldCheck, 
  Eye, 
  AlertTriangle,
  Server,
  Inbox
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/utils';
import { authFetch } from '@/lib/api';
import { format, parseISO } from 'date-fns';

interface MailSettings {
  id?: number;
  mail_driver: string;
  smtp_host: string;
  smtp_port: number;
  smtp_encryption: string;
  smtp_username: string;
  smtp_password?: string;
  from_email: string;
  from_name: string;
  admin_emails: string;
  admin_emails_cc: string;
  admin_emails_bcc: string;
  is_enabled: number | boolean;
  updated_at?: string;
}

interface MailLog {
  id: number;
  recipient: string;
  subject: string;
  email_type: string;
  status: 'sent' | 'failed';
  error_message: string | null;
  body_preview: string | null;
  created_at: string;
}

export default function MailSettingsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('settings');

  // Settings State
  const [settings, setSettings] = useState<MailSettings>({
    mail_driver: 'smtp',
    smtp_host: '',
    smtp_port: 465,
    smtp_encryption: 'ssl',
    smtp_username: '',
    smtp_password: '',
    from_email: '',
    from_name: 'Sapphire Trails',
    admin_emails: '',
    admin_emails_cc: '',
    admin_emails_bcc: '',
    is_enabled: true,
  });
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Test Email State
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testEmailRecipient, setTestEmailRecipient] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);

  // Logs State
  const [logs, setLogs] = useState<MailLog[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState<MailLog | null>(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isClearingLogs, setIsClearingLogs] = useState(false);

  const logsPerPage = 20;

  // 1. Fetch Mail Settings
  const fetchSettings = useCallback(async () => {
    setIsLoadingSettings(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/mail/settings`);
      if (!res.ok) throw new Error('Failed to fetch settings');
      const data = await res.json();
      setSettings({
        ...data,
        is_enabled: Boolean(data.is_enabled),
      });
    } catch (err) {
      console.error(err);
      toast({
        variant: 'destructive',
        title: 'Error Loading Settings',
        description: 'Could not load mail server configuration from the database.',
      });
    } finally {
      setIsLoadingSettings(false);
    }
  }, [toast]);

  // 2. Fetch Mail Logs
  const fetchLogs = useCallback(async () => {
    setIsLoadingLogs(true);
    try {
      const offset = (currentPage - 1) * logsPerPage;
      const params = new URLSearchParams({
        limit: String(logsPerPage),
        offset: String(offset),
        status: statusFilter,
        email_type: typeFilter,
      });
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      const res = await authFetch(`${API_BASE_URL}/mail/logs?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch mail logs');
      const data = await res.json();
      setLogs(data.logs || []);
      setTotalLogs(data.total || 0);
    } catch (err) {
      console.error(err);
      toast({
        variant: 'destructive',
        title: 'Error Loading Logs',
        description: 'Could not fetch mail delivery logs.',
      });
    } finally {
      setIsLoadingLogs(false);
    }
  }, [currentPage, statusFilter, typeFilter, searchTerm, toast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (activeTab === 'logs') {
      fetchLogs();
    }
  }, [activeTab, fetchLogs]);

  // Handle Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/mail/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...settings,
          is_enabled: settings.is_enabled ? 1 : 0,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save settings');
      }

      toast({
        title: 'Mail Settings Saved',
        description: 'SMTP Server configuration has been successfully updated in database.',
      });
      fetchSettings();
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: err instanceof Error ? err.message : 'Could not save mail settings.',
      });
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Handle Send Test Email
  const handleSendTestEmail = async () => {
    if (!testEmailRecipient || !testEmailRecipient.includes('@')) {
      toast({ variant: 'destructive', title: 'Invalid Email', description: 'Please enter a valid recipient email address.' });
      return;
    }

    setIsSendingTest(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/mail/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: testEmailRecipient }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'SMTP delivery failed');
      }

      toast({
        title: 'Test Email Sent!',
        description: `Verification message successfully dispatched to ${testEmailRecipient}.`,
      });
      setIsTestModalOpen(false);
      if (activeTab === 'logs') fetchLogs();
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Delivery Failed',
        description: err instanceof Error ? err.message : 'Could not connect to SMTP server.',
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  // Handle Clear Logs
  const handleClearLogs = async () => {
    setIsClearingLogs(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/mail/logs/clear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (!res.ok) throw new Error('Failed to clear logs');

      toast({ title: 'Logs Cleared', description: 'All email delivery logs have been purged.' });
      fetchLogs();
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not clear mail logs.',
      });
    } finally {
      setIsClearingLogs(false);
    }
  };

  const totalPages = Math.ceil(totalLogs / logsPerPage) || 1;

  const getTypeBadge = (type: string) => {
    if (type.includes('booking')) {
      return <Badge className="bg-primary/20 text-primary border-primary/30">Booking</Badge>;
    }
    if (type.includes('contact')) {
      return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Contact</Badge>;
    }
    if (type.includes('proposal')) {
      return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Proposal</Badge>;
    }
    return <Badge variant="outline">Test</Badge>;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
            <Mail className="h-8 w-8" />
            Mail Server &amp; Logs
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure PHP SMTP Mailer, automated booking &amp; contact notifications, and monitor delivery logs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsTestModalOpen(true)} className="gap-2 border-primary/40 text-primary hover:bg-primary/10">
            <Send className="h-4 w-4" />
            Send Test Email
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 w-full max-w-md bg-background-alt border border-border">
          <TabsTrigger value="settings" className="gap-2">
            <Server className="h-4 w-4" />
            SMTP Configuration
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-2">
            <Inbox className="h-4 w-4" />
            Delivery Logs ({totalLogs})
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: SMTP CONFIGURATION */}
        <TabsContent value="settings" className="space-y-6">
          <form onSubmit={handleSaveSettings}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">SMTP Server Credentials</CardTitle>
                    <CardDescription>
                      Connect your outbound mail server for sending customer booking confirmations and admin alerts.
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="mail-enabled" className="text-sm font-medium">
                      {settings.is_enabled ? 'Mailer Active' : 'Mailer Disabled'}
                    </Label>
                    <Switch
                      id="mail-enabled"
                      checked={Boolean(settings.is_enabled)}
                      onCheckedChange={(checked) => setSettings({ ...settings, is_enabled: checked })}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoadingSettings ? (
                  <div className="py-12 flex items-center justify-center gap-2 text-muted-foreground">
                    <LoaderCircle className="h-6 w-6 animate-spin text-primary" />
                    <span>Loading SMTP settings...</span>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="smtp_host">SMTP Host Server</Label>
                        <Input
                          id="smtp_host"
                          placeholder="e.g. mail.silverray.lk or smtp.gmail.com"
                          value={settings.smtp_host}
                          onChange={(e) => setSettings({ ...settings, smtp_host: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="smtp_port">Port</Label>
                        <Input
                          id="smtp_port"
                          type="number"
                          placeholder="465 or 587"
                          value={settings.smtp_port}
                          onChange={(e) => setSettings({ ...settings, smtp_port: Number(e.target.value) })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="smtp_encryption">Encryption</Label>
                        <Select
                          value={settings.smtp_encryption}
                          onValueChange={(val) => setSettings({ ...settings, smtp_encryption: val })}
                        >
                          <SelectTrigger id="smtp_encryption">
                            <SelectValue placeholder="Select encryption" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ssl">SSL (Recommended for Port 465)</SelectItem>
                            <SelectItem value="tls">TLS / STARTTLS (Port 587)</SelectItem>
                            <SelectItem value="none">None (Port 25)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="smtp_username">SMTP Username / Email</Label>
                        <Input
                          id="smtp_username"
                          type="email"
                          placeholder="e.g. web-booking@silverray.lk"
                          value={settings.smtp_username}
                          onChange={(e) => setSettings({ ...settings, smtp_username: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="smtp_password">SMTP Password</Label>
                        <Input
                          id="smtp_password"
                          type="password"
                          placeholder="Enter new password to update"
                          value={settings.smtp_password}
                          onChange={(e) => setSettings({ ...settings, smtp_password: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">Leave as ******** to keep current password.</p>
                      </div>
                    </div>

                    <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="from_name">Sender Display Name</Label>
                        <Input
                          id="from_name"
                          placeholder="e.g. Sapphire Trails"
                          value={settings.from_name}
                          onChange={(e) => setSettings({ ...settings, from_name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="from_email">Sender From Email</Label>
                        <Input
                          id="from_email"
                          type="email"
                          placeholder="e.g. web-booking@silverray.lk"
                          value={settings.from_email}
                          onChange={(e) => setSettings({ ...settings, from_email: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="border-t pt-4 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="admin_emails">Admin Notification Recipients (Comma separated)</Label>
                        <Input
                          id="admin_emails"
                          placeholder="e.g. reservation@silverray.lk, info@silverray.lk"
                          value={settings.admin_emails}
                          onChange={(e) => setSettings({ ...settings, admin_emails: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">
                          New tour bookings and contact inquiries will automatically trigger alerts to these addresses.
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="admin_emails_cc">Admin CC (Multiple emails separated by comma)</Label>
                          <Input
                            id="admin_emails_cc"
                            placeholder="e.g. manager@silverray.lk, gm@silverray.lk"
                            value={settings.admin_emails_cc}
                            onChange={(e) => setSettings({ ...settings, admin_emails_cc: e.target.value })}
                          />
                          <p className="text-[11px] text-muted-foreground">
                            Copy multiple recipients on booking and inquiry alerts.
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="admin_emails_bcc">Admin BCC (Multiple emails separated by comma)</Label>
                          <Input
                            id="admin_emails_bcc"
                            placeholder="e.g. archive@silverray.lk, audit@silverray.lk"
                            value={settings.admin_emails_bcc}
                            onChange={(e) => setSettings({ ...settings, admin_emails_bcc: e.target.value })}
                          />
                          <p className="text-[11px] text-muted-foreground">
                            Blind carbon copy for backups or auditing.
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter className="flex justify-between border-t py-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsTestModalOpen(true)}
                  disabled={isLoadingSettings || isSavingSettings}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Test Configuration
                </Button>
                <Button type="submit" disabled={isLoadingSettings || isSavingSettings}>
                  {isSavingSettings ? (
                    <>
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                      Saving Settings...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Configuration
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        {/* TAB 2: DELIVERY LOGS */}
        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader className="p-4 sm:p-6 pb-2">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-xl">Outbound Email Logs</CardTitle>
                  <CardDescription>
                    Real-time audit log of all system emails dispatched through the PHP SMTP mailer.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={fetchLogs} disabled={isLoadingLogs}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingLogs ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" disabled={logs.length === 0 || isClearingLogs}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear Logs
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Purge Email Logs?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete all mail delivery history from the database. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleClearLogs} className="bg-destructive text-destructive-foreground">
                          Purge Logs
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search recipient or subject..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
                <div>
                  <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="sent">Sent (Success)</SelectItem>
                      <SelectItem value="failed">Failed (Error)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={typeFilter} onValueChange={(val) => { setTypeFilter(val); setCurrentPage(1); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Email Types</SelectItem>
                      <SelectItem value="booking_customer">Booking (Customer)</SelectItem>
                      <SelectItem value="booking_admin">Booking (Admin)</SelectItem>
                      <SelectItem value="contact_customer">Contact (Customer)</SelectItem>
                      <SelectItem value="contact_admin">Contact (Admin)</SelectItem>
                      <SelectItem value="test">Test Messages</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0 sm:p-6 sm:pt-0">
              {isLoadingLogs ? (
                <div className="py-16 flex items-center justify-center gap-2 text-muted-foreground">
                  <LoaderCircle className="h-6 w-6 animate-spin text-primary" />
                  <span>Fetching mail delivery records...</span>
                </div>
              ) : logs.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground">
                  <Inbox className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-base font-medium">No mail delivery records found</p>
                  <p className="text-xs">Outbound emails from bookings and inquiries will appear here automatically.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Recipient</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                            {log.created_at ? format(parseISO(log.created_at), 'MMM dd, HH:mm:ss') : 'N/A'}
                          </TableCell>
                          <TableCell className="font-medium text-sm break-all max-w-[200px]">
                            {log.recipient}
                          </TableCell>
                          <TableCell className="text-sm max-w-[250px] truncate" title={log.subject}>
                            {log.subject}
                          </TableCell>
                          <TableCell>{getTypeBadge(log.email_type)}</TableCell>
                          <TableCell>
                            {log.status === 'sent' ? (
                              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Sent
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="gap-1">
                                <XCircle className="h-3 w-3" />
                                Failed
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedLog(log);
                                setIsLogModalOpen(true);
                              }}
                            >
                              <Eye className="h-3.5 w-3.5 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex items-center justify-between border-t px-4 py-4">
              <div className="text-xs sm:text-sm text-muted-foreground">
                Showing {logs.length} of {totalLogs} delivery records (Page {currentPage} of {totalPages})
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1 || isLoadingLogs}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage >= totalPages || isLoadingLogs}
                >
                  Next
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* DIALOG 1: SEND TEST EMAIL */}
      <Dialog open={isTestModalOpen} onOpenChange={setIsTestModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              Dispatch Test Message
            </DialogTitle>
            <DialogDescription>
              Verify your SMTP server credentials and firewall connectivity by sending an instant test email.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label htmlFor="test-recipient">Destination Email Address</Label>
              <Input
                id="test-recipient"
                type="email"
                placeholder="your.email@example.com"
                value={testEmailRecipient}
                onChange={(e) => setTestEmailRecipient(e.target.value)}
              />
            </div>
            <div className="text-xs text-muted-foreground bg-background-alt p-3 rounded border border-border">
              <strong>Active SMTP Server:</strong> {settings.smtp_host}:{settings.smtp_port} ({settings.smtp_encryption})
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTestModalOpen(false)} disabled={isSendingTest}>
              Cancel
            </Button>
            <Button onClick={handleSendTestEmail} disabled={isSendingTest}>
              {isSendingTest ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Testing Connection...
                </>
              ) : (
                'Send Test Message'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG 2: VIEW LOG DETAILS */}
      <Dialog open={isLogModalOpen} onOpenChange={setIsLogModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Email Log #{selectedLog?.id}
            </DialogTitle>
            <DialogDescription>
              {selectedLog?.created_at ? format(parseISO(selectedLog.created_at), 'PPPP • HH:mm:ss') : ''}
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4 py-2 text-sm">
              <div className="grid grid-cols-2 gap-2 bg-card/60 p-3 rounded-lg border border-border">
                <div>
                  <span className="text-xs text-muted-foreground block">Recipient</span>
                  <span className="font-semibold text-foreground break-all">{selectedLog.recipient}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Delivery Status</span>
                  {selectedLog.status === 'sent' ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5" /> Sent Successfully
                    </span>
                  ) : (
                    <span className="text-rose-400 font-semibold flex items-center gap-1">
                      <XCircle className="h-3.5 w-3.5" /> Delivery Failed
                    </span>
                  )}
                </div>
                <div className="col-span-2 pt-2 border-t border-border">
                  <span className="text-xs text-muted-foreground block">Subject</span>
                  <span className="font-semibold text-foreground">{selectedLog.subject}</span>
                </div>
              </div>

              {selectedLog.error_message && (
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-3 text-rose-400">
                  <div className="flex items-center gap-1.5 font-semibold mb-1 text-xs uppercase tracking-wide">
                    <AlertTriangle className="h-4 w-4" />
                    SMTP Error Details
                  </div>
                  <pre className="text-xs whitespace-pre-wrap font-mono">{selectedLog.error_message}</pre>
                </div>
              )}

              {selectedLog.body_preview && (
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">Message Content Preview</span>
                  <div className="bg-background-alt border border-border rounded-lg p-3 text-xs text-foreground/80 max-h-48 overflow-y-auto whitespace-pre-wrap">
                    {selectedLog.body_preview}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsLogModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
