'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { 
  type Invoice, 
  type PaymentStatus, 
  mapServerInvoiceToClient, 
  formatCurrency 
} from '@/lib/invoices-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Receipt, 
  Plus, 
  Search, 
  RefreshCw, 
  LoaderCircle, 
  ExternalLink, 
  Pencil, 
  Trash2, 
  Send, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  CreditCard,
  Landmark
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/utils';
import { authFetch } from '@/lib/api';
import { BillingSettingsDialog } from '@/components/admin/BillingSettingsDialog';

const ITEMS_PER_PAGE = 10;

export default function ManageInvoicesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sendingEmailId, setSendingEmailId] = useState<number | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Quick Payment Recording Dialog
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentStatusSelect, setPaymentStatusSelect] = useState<PaymentStatus>('paid');
  const [paymentMethod, setPaymentMethod] = useState<string>('Bank Transfer');
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/invoices`);
      if (!res.ok) throw new Error('Failed to fetch invoices.');
      const data = await res.json();
      if (Array.isArray(data)) {
        setInvoices(data.map(mapServerInvoiceToClient));
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not load invoices from the server.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleDelete = async (id: number, invoiceNumber: string) => {
    try {
      const res = await authFetch(`${API_BASE_URL}/invoices/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete invoice.');
      setInvoices(prev => prev.filter(inv => inv.id !== id));
      toast({
        title: 'Invoice Deleted',
        description: `Invoice ${invoiceNumber} has been removed.`,
      });
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: e instanceof Error ? e.message : 'Could not delete invoice.',
      });
    }
  };

  const handleSendEmail = async (inv: Invoice) => {
    setSendingEmailId(inv.id);
    try {
      const res = await authFetch(`${API_BASE_URL}/invoices/${inv.id}/send-email/`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to dispatch invoice email.');
      toast({
        title: '✉️ Invoice Sent',
        description: `Official invoice dispatched to ${inv.customer_email}.`,
      });
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: e instanceof Error ? e.message : 'Could not send invoice email.',
      });
    } finally {
      setSendingEmailId(null);
    }
  };

  const openPaymentDialog = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setPaymentAmount(String(inv.total_amount));
    setPaymentStatusSelect('paid');
    setPaymentMethod(inv.payment_method || 'Bank Transfer');
    setPaymentDialogOpen(true);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    setIsUpdatingPayment(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/invoices/${selectedInvoice.id}/payment/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_status: paymentStatusSelect,
          amount_paid: parseFloat(paymentAmount) || 0,
          payment_method: paymentMethod,
        }),
      });

      if (!res.ok) throw new Error('Failed to record payment.');
      const updated = await res.json();

      setInvoices(prev => prev.map(inv => inv.id === selectedInvoice.id ? mapServerInvoiceToClient(updated) : inv));
      toast({
        title: '💳 Payment Recorded',
        description: `Invoice ${selectedInvoice.invoice_number} updated to ${paymentStatusSelect.toUpperCase()}.`,
      });
      setPaymentDialogOpen(false);
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: e instanceof Error ? e.message : 'Could not record payment.',
      });
    } finally {
      setIsUpdatingPayment(false);
    }
  };

  // Metrics KPI calculations
  const stats = useMemo(() => {
    const totalCount = invoices.length;
    let totalInvoiced = 0;
    let totalCollected = 0;
    let totalOutstanding = 0;

    invoices.forEach(inv => {
      totalInvoiced += inv.total_amount;
      totalCollected += inv.amount_paid;
      totalOutstanding += inv.balance_due;
    });

    return { totalCount, totalInvoiced, totalCollected, totalOutstanding };
  }, [invoices]);

  // Filters
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchSearch = 
        searchTerm === '' ||
        inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inv.tour_title && inv.tour_title.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus = statusFilter === 'all' || inv.payment_status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [invoices, searchTerm, statusFilter]);

  // Pagination
  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredInvoices.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredInvoices, currentPage]);

  const totalPages = Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE) || 1;

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px]">PAID</Badge>;
      case 'partially_paid':
        return <Badge className="bg-blue-600 hover:bg-blue-700 text-white text-[11px]">PARTIALLY PAID</Badge>;
      case 'unpaid':
        return <Badge className="bg-amber-600 hover:bg-amber-700 text-white text-[11px]">UNPAID</Badge>;
      case 'refunded':
        return <Badge className="bg-purple-600 hover:bg-purple-700 text-white text-[11px]">REFUNDED</Badge>;
      default:
        return <Badge variant="outline" className="text-[11px] uppercase">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl font-bold tracking-tight text-primary font-serif">Invoices &amp; Billing</h1>
            <Badge variant="outline" className="text-xs px-2.5 py-0.5 border-primary/30 text-primary font-mono">
              {invoices.length} Total
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">Manage official billing records, payment receipts, and client invoice delivery.</p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSettingsOpen(true)}
            className="text-xs border-primary/40 text-primary hover:bg-primary/10 h-9"
          >
            <Landmark className="mr-1.5 h-4 w-4" />
            Bank &amp; Billing Settings
          </Button>

          <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm text-xs h-9">
            <Link href="/admin/invoices/create">
              <Plus className="mr-1.5 h-4 w-4" />
              Create Custom Invoice
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Total Invoiced</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold font-serif text-primary">
              {formatCurrency(stats.totalInvoiced, 'USD')}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">{stats.totalCount} Invoices generated</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Revenue Collected</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold font-serif text-emerald-500">
              {formatCurrency(stats.totalCollected, 'USD')}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Paid &amp; deposited funds</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Outstanding Due</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold font-serif text-amber-500">
              {formatCurrency(stats.totalOutstanding, 'USD')}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Pending client payments</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Invoices Issued</CardTitle>
            <Receipt className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold font-serif text-foreground">
              {stats.totalCount}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Active invoice records</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-4 border-b border-border/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                All Invoices
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Official billing statements and transaction histories.
              </CardDescription>
            </div>

            {/* Search & Status Filter */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search invoice, client, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 w-full sm:w-40 text-xs">
                  <SelectValue placeholder="Payment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="partially_paid">Partially Paid</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm" onClick={fetchInvoices} disabled={isLoading} className="h-9 px-3 text-xs">
                <RefreshCw className={`h-3.5 w-3.5 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center text-muted-foreground py-20 flex flex-col items-center gap-4">
              <LoaderCircle className="h-10 w-10 text-primary animate-spin" />
              <p className="text-sm">Loading invoices from database...</p>
            </div>
          ) : paginatedInvoices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px]">Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Tour Package &amp; Date</TableHead>
                  <TableHead>Total Invoiced</TableHead>
                  <TableHead>Balance Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedInvoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-mono font-bold text-xs">
                      <a 
                        href={`/invoices/${inv.invoice_number}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                        title="View printable digital invoice"
                      >
                        {inv.invoice_number}
                        <ExternalLink className="h-3 w-3 opacity-60" />
                      </a>
                      <span className="text-[10px] text-muted-foreground font-normal block">
                        Issued: {inv.issue_date}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="font-semibold text-xs text-foreground">{inv.customer_name}</div>
                      <div className="text-[11px] text-muted-foreground">{inv.customer_email}</div>
                    </TableCell>

                    <TableCell>
                      <div className="font-medium text-xs text-foreground line-clamp-1">{inv.tour_title || 'Custom Gem Expedition'}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {inv.tour_date ? format(parseISO(inv.tour_date), 'MMM dd, yyyy') : 'No Date Set'}
                      </div>
                    </TableCell>

                    <TableCell className="font-bold text-xs text-foreground">
                      {formatCurrency(inv.total_amount, inv.currency)}
                    </TableCell>

                    <TableCell className="font-semibold text-xs text-muted-foreground">
                      <span className={inv.balance_due > 0 ? 'text-amber-500' : 'text-emerald-500'}>
                        {formatCurrency(inv.balance_due, inv.currency)}
                      </span>
                    </TableCell>

                    <TableCell>
                      {getStatusBadge(inv.payment_status)}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Quick Record Payment */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openPaymentDialog(inv)}
                          className="h-8 px-2 text-xs text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                          title="Record Payment"
                        >
                          <CreditCard className="h-3.5 w-3.5 mr-1" />
                          Payment
                        </Button>

                        {/* Send Email */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSendEmail(inv)}
                          disabled={sendingEmailId === inv.id}
                          className="h-8 px-2 text-xs text-primary hover:bg-primary/10"
                          title="Email Invoice to Customer"
                        >
                          {sendingEmailId === inv.id ? (
                            <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Send className="h-3.5 w-3.5" />
                          )}
                        </Button>

                        {/* Edit */}
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <Link href={`/admin/invoices/edit/${inv.id}`} title="Edit Invoice">
                            <Pencil className="h-3.5 w-3.5" />
                          </Link>
                        </Button>

                        {/* Delete Dialog */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" title="Delete Invoice">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete invoice <strong className="text-foreground">{inv.invoice_number}</strong> for {inv.customer_name}.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(inv.id, inv.invoice_number)} className="bg-destructive text-destructive-foreground">
                                Yes, delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center text-muted-foreground py-16 flex flex-col items-center gap-4">
              <Receipt className="h-12 w-12 text-muted-foreground/50" />
              <div className="space-y-1">
                <p className="font-medium text-foreground text-sm">No invoices found</p>
                <p className="text-xs text-muted-foreground">Create an invoice manually or generate one from any booking request.</p>
              </div>
              <Button asChild variant="outline" size="sm" className="text-xs">
                <Link href="/admin/invoices/create">Create your first invoice</Link>
              </Button>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t px-4 py-3">
          <div className="text-xs text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="text-xs h-8"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="text-xs h-8"
            >
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Record Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-serif">
              <CreditCard className="h-4 w-4 text-primary" />
              Record Payment: {selectedInvoice?.invoice_number}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Update payment received for <strong className="text-foreground">{selectedInvoice?.customer_name}</strong>.
            </DialogDescription>
          </DialogHeader>

          {selectedInvoice && (
            <form onSubmit={handlePaymentSubmit} className="space-y-4 pt-2">
              <div className="p-3 bg-background-alt rounded-xl border border-border/80 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Invoiced:</span>
                  <span className="font-bold text-foreground">{formatCurrency(selectedInvoice.total_amount, selectedInvoice.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Balance Due:</span>
                  <span className="font-bold text-amber-500">{formatCurrency(selectedInvoice.balance_due, selectedInvoice.currency)}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Payment Status *</Label>
                <Select value={paymentStatusSelect} onValueChange={(v: PaymentStatus) => setPaymentStatusSelect(v)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid (Full Payment)</SelectItem>
                    <SelectItem value="partially_paid">Partially Paid (Deposit)</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Amount Paid ({selectedInvoice.currency}) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    required
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="Cash on Arrival">Cash on Arrival</SelectItem>
                      <SelectItem value="Credit Card">Credit Card</SelectItem>
                      <SelectItem value="PayPal">PayPal</SelectItem>
                      <SelectItem value="Wise">Wise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setPaymentDialogOpen(false)} disabled={isUpdatingPayment}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" disabled={isUpdatingPayment}>
                  {isUpdatingPayment ? <LoaderCircle className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                  Save Payment Record
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Company Bank Account & Billing Settings Dialog */}
      <BillingSettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
