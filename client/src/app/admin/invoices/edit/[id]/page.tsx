'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  type Invoice, 
  type InvoiceItem, 
  type PaymentStatus, 
  mapServerInvoiceToClient, 
  formatCurrency 
} from '@/lib/invoices-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Receipt, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  LoaderCircle, 
  ExternalLink,
  Calculator,
  Save 
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/utils';
import { authFetch } from '@/lib/api';

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const id = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState('');

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [tourTitle, setTourTitle] = useState('');
  const [tourDate, setTourDate] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [issueDate, setIssueDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('unpaid');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [taxAmount, setTaxAmount] = useState<number>(0);
  const [bankDetails, setBankDetails] = useState('');
  const [notes, setNotes] = useState('');

  // Line items
  const [items, setItems] = useState<InvoiceItem[]>([]);

  useEffect(() => {
    if (!id) return;

    async function fetchInvoice() {
      setIsLoading(true);
      try {
        const res = await authFetch(`${API_BASE_URL}/invoices/${id}`);
        if (!res.ok) throw new Error('Invoice not found');
        const data = await res.json();
        const inv = mapServerInvoiceToClient(data);

        setInvoiceNumber(inv.invoice_number);
        setCustomerName(inv.customer_name);
        setCustomerEmail(inv.customer_email);
        setCustomerPhone(inv.customer_phone || '');
        setCustomerAddress(inv.customer_address || '');
        setTourTitle(inv.tour_title || '');
        setTourDate(inv.tour_date || '');
        setCurrency(inv.currency || 'USD');
        setIssueDate(inv.issue_date);
        setDueDate(inv.due_date || '');
        setPaymentStatus(inv.payment_status);
        setPaymentMethod(inv.payment_method || 'Bank Transfer');
        setAmountPaid(inv.amount_paid);
        setDiscountAmount(inv.discount_amount);
        setTaxAmount(inv.tax_amount);
        setBankDetails(inv.bank_details || '');
        setNotes(inv.notes || '');
        setItems(inv.items && inv.items.length > 0 ? inv.items : [
          { description: 'Tour Experience', quantity: 1, unit_price: inv.total_amount, total_price: inv.total_amount }
        ]);
      } catch (e) {
        console.error(e);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load invoice details.',
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchInvoice();
  }, [id, toast]);

  // Handle Item row updates
  const handleItemChange = (index: number, field: keyof InvoiceItem, val: any) => {
    setItems(prev => {
      const updated = [...prev];
      const target = { ...updated[index], [field]: val };

      if (field === 'quantity' || field === 'unit_price') {
        const q = field === 'quantity' ? parseFloat(val) || 0 : target.quantity;
        const u = field === 'unit_price' ? parseFloat(val) || 0 : target.unit_price;
        target.total_price = q * u;
      }

      updated[index] = target;
      return updated;
    });
  };

  const addItemRow = () => {
    setItems(prev => [
      ...prev,
      { description: '', quantity: 1, unit_price: 0, total_price: 0, sort_order: prev.length + 1 }
    ]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, idx) => idx !== index));
  };

  // Totals calculations
  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + (item.total_price || 0), 0);
  }, [items]);

  const grandTotal = useMemo(() => {
    return Math.max(0, subtotal - discountAmount + taxAmount);
  }, [subtotal, discountAmount, taxAmount]);

  const balanceDue = useMemo(() => {
    return Math.max(0, grandTotal - amountPaid);
  }, [grandTotal, amountPaid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName || !customerEmail) {
      toast({
        variant: 'destructive',
        title: 'Required Fields Missing',
        description: 'Please enter customer name and email address.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        customer_address: customerAddress,
        tour_title: tourTitle,
        tour_date: tourDate || null,
        currency,
        issue_date: issueDate,
        due_date: dueDate || null,
        subtotal,
        discount_amount: discountAmount,
        tax_amount: taxAmount,
        total_amount: grandTotal,
        amount_paid: amountPaid,
        balance_due: balanceDue,
        payment_status: paymentStatus,
        payment_method: paymentMethod,
        notes,
        bank_details: bankDetails,
        items,
      };

      const res = await authFetch(`${API_BASE_URL}/invoices/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to update invoice.');
      }

      toast({
        title: '✓ Invoice Updated',
        description: `Invoice ${invoiceNumber} changes saved.`,
      });

      router.push('/admin/invoices');
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Error Updating Invoice',
        description: e instanceof Error ? e.message : 'Could not save invoice updates.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-28 flex flex-col items-center gap-3">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground">Loading invoice #{id}...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary font-serif">Edit Invoice</h1>
              <span className="font-mono text-sm font-semibold text-muted-foreground">({invoiceNumber})</span>
            </div>
            <p className="text-xs text-muted-foreground">Modify line items, discounts, taxes, and payment status.</p>
          </div>
        </div>

        <Button asChild variant="outline" size="sm" className="gap-1 text-xs">
          <a href={`/invoices/${invoiceNumber}`} target="_blank" rel="noreferrer">
            <ExternalLink className="h-3.5 w-3.5 mr-1" />
            Preview Printable Invoice
          </a>
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Customer & Tour Information */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-base font-semibold">1. Customer &amp; Tour Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Customer Full Name *</Label>
              <Input
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Customer Email Address *</Label>
              <Input
                type="email"
                value={customerEmail}
                onChange={e => setCustomerEmail(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Phone / WhatsApp</Label>
              <Input
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Address / Country</Label>
              <Input
                value={customerAddress}
                onChange={e => setCustomerAddress(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Tour Package Title</Label>
              <Input
                value={tourTitle}
                onChange={e => setTourTitle(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Tour Scheduled Date</Label>
              <Input
                type="date"
                value={tourDate}
                onChange={e => setTourDate(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Invoice Dates & Currency */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-base font-semibold">2. Invoice Dates &amp; Currency</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Currency *</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($) - US Dollar</SelectItem>
                  <SelectItem value="LKR">LKR (Rs) - Sri Lankan Rupee</SelectItem>
                  <SelectItem value="EUR">EUR (€) - Euro</SelectItem>
                  <SelectItem value="GBP">GBP (£) - British Pound</SelectItem>
                  <SelectItem value="AUD">AUD ($) - Australian Dollar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Issue Date *</Label>
              <Input
                type="date"
                value={issueDate}
                onChange={e => setIssueDate(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Payment Due Date</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Itemized Line Items */}
        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/50">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Calculator className="h-4 w-4 text-primary" />
                3. Line Items &amp; Pricing Breakdown
              </CardTitle>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addItemRow} className="gap-1 text-xs text-primary border-primary/30">
              <Plus className="h-3.5 w-3.5" /> Add Line Item
            </Button>
          </CardHeader>

          <CardContent className="pt-4 space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 p-3 rounded-xl border border-border/80 bg-background-alt/40">
                <div className="flex-1 w-full space-y-1">
                  <span className="text-[10px] text-muted-foreground font-semibold">Item #{idx + 1} Description *</span>
                  <Input
                    placeholder="e.g. VIP Helitour Transfer / Private Mining Pit Permit"
                    value={item.description}
                    onChange={e => handleItemChange(idx, 'description', e.target.value)}
                    required
                    className="h-9 text-xs"
                  />
                </div>

                <div className="w-full sm:w-24 space-y-1">
                  <span className="text-[10px] text-muted-foreground font-semibold">Qty</span>
                  <Input
                    type="number"
                    min="0.1"
                    step="any"
                    value={item.quantity}
                    onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="w-full sm:w-32 space-y-1">
                  <span className="text-[10px] text-muted-foreground font-semibold">Unit Rate ({currency})</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={item.unit_price}
                    onChange={e => handleItemChange(idx, 'unit_price', e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="w-full sm:w-32 space-y-1 text-right">
                  <span className="text-[10px] text-muted-foreground font-semibold block">Total</span>
                  <div className="h-9 px-3 flex items-center justify-end font-bold text-xs font-mono bg-background rounded-md border border-border">
                    {formatCurrency(item.total_price, currency)}
                  </div>
                </div>

                <div className="pt-4 sm:pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItemRow(idx)}
                    disabled={items.length <= 1}
                    className="h-9 w-9 text-muted-foreground hover:text-destructive"
                    title="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {/* Totals Summary Box */}
            <div className="pt-4 border-t border-border/60 flex justify-end">
              <div className="w-full sm:w-80 space-y-2 bg-background-alt p-4 rounded-xl border border-border">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-semibold">{formatCurrency(subtotal, currency)}</span>
                </div>

                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-muted-foreground">Discount ({currency}):</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={discountAmount}
                    onChange={e => setDiscountAmount(parseFloat(e.target.value) || 0)}
                    className="h-7 w-28 text-xs text-right"
                  />
                </div>

                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-muted-foreground">Tax / Service ({currency}):</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={taxAmount}
                    onChange={e => setTaxAmount(parseFloat(e.target.value) || 0)}
                    className="h-7 w-28 text-xs text-right"
                  />
                </div>

                <div className="border-t border-border pt-2 flex justify-between text-sm font-bold text-primary">
                  <span>Grand Total:</span>
                  <span>{formatCurrency(grandTotal, currency)}</span>
                </div>

                <div className="flex items-center justify-between gap-2 text-xs pt-1">
                  <span className="text-muted-foreground">Amount Paid ({currency}):</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={amountPaid}
                    onChange={e => setAmountPaid(parseFloat(e.target.value) || 0)}
                    className="h-7 w-28 text-xs text-right text-emerald-500 font-bold"
                  />
                </div>

                <div className="border-t border-border pt-1 flex justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">Balance Due:</span>
                  <span className={balanceDue > 0 ? 'text-amber-500' : 'text-emerald-500'}>
                    {formatCurrency(balanceDue, currency)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Payment Status & Terms */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-base font-semibold">4. Payment Terms &amp; Bank Instructions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Payment Status</Label>
              <Select value={paymentStatus} onValueChange={(v: PaymentStatus) => setPaymentStatus(v)}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="partially_paid">Partially Paid (Deposit)</SelectItem>
                  <SelectItem value="paid">Fully Paid</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
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
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-semibold">Bank Details / Payment Instructions</Label>
              <Textarea
                rows={4}
                value={bankDetails}
                onChange={e => setBankDetails(e.target.value)}
                className="text-xs font-mono leading-relaxed"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-semibold">Invoice Terms &amp; Policies</Label>
              <Textarea
                rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="text-xs leading-relaxed"
              />
            </div>
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => router.push('/admin/invoices')}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm">
            {isSubmitting ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Update Invoice
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
