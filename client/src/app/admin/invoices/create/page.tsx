'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  type InvoiceItem, 
  type PaymentStatus, 
  DEFAULT_BANK_DETAILS, 
  DEFAULT_INVOICE_NOTES, 
  formatCurrency 
} from '@/lib/invoices-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { 
  Receipt, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  LoaderCircle, 
  Send, 
  Sparkles,
  Calculator,
  DollarSign 
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/utils';
import { authFetch } from '@/lib/api';

function CreateInvoiceForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const bookingId = searchParams.get('booking_id');

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [tourTitle, setTourTitle] = useState('');
  const [tourDate, setTourDate] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('unpaid');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [taxAmount, setTaxAmount] = useState<number>(0);
  const [bankDetails, setBankDetails] = useState(DEFAULT_BANK_DETAILS);
  const [notes, setNotes] = useState(DEFAULT_INVOICE_NOTES);
  const [sendEmailImmediately, setSendEmailImmediately] = useState(true);

  // Line items
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: 'Private Gem Mine Tour Experience', quantity: 1, unit_price: 150, total_price: 150 }
  ]);

  // Fetch and apply configured Bank details and terms from settings
  useEffect(() => {
    async function loadDefaultSettings() {
      try {
        const res = await authFetch(`${API_BASE_URL}/invoices/settings/`);
        if (res.ok) {
          const data = await res.json();
          if (data.bank_name || data.account_number) {
            const formatted = `Bank Name: ${data.bank_name || ''}
Account Name: ${data.account_name || ''}
Account Number: ${data.account_number || ''}
Branch: ${data.branch_name || ''}
SWIFT / BIC: ${data.swift_code || ''}
${data.additional_instructions ? `Reference: ${data.additional_instructions}` : ''}`.trim();
            setBankDetails(formatted);
          }
          if (data.default_notes) {
            setNotes(data.default_notes);
          }
          if (data.default_currency) {
            setCurrency(data.default_currency);
          }
        }
      } catch (e) {
        console.error("Could not load default billing settings", e);
      }
    }
    loadDefaultSettings();
  }, []);

  // Pre-populate if booking_id is provided
  useEffect(() => {
    if (!bookingId) return;

    async function prefillFromBooking() {
      setIsLoading(true);
      try {
        const res = await authFetch(`${API_BASE_URL}/bookings/${bookingId}`);
        if (!res.ok) throw new Error('Booking not found');
        const data = await res.json();
        const b = data.booking || data;

        setCustomerName(b.name || '');
        setCustomerEmail(b.email || '');
        setCustomerPhone(b.phone || '');
        setCustomerAddress(b.address || '');
        setTourTitle(b.tour_title || '');
        setTourDate(b.tour_date || '');

        const guests = Number(b.guests) || 1;
        let ratePerPerson = 150;
        
        // Fetch package to get accurate unit price
        if (b.tour_package_id) {
          try {
            const pkgRes = await fetch(`${API_BASE_URL}/tours/${b.tour_package_id}`);
            if (pkgRes.ok) {
              const pkg = await pkgRes.json();
              const priceStr = pkg.price || '';
              const parsed = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
              if (!isNaN(parsed) && parsed > 0) {
                ratePerPerson = parsed;
              }
            }
          } catch {}
        }

        const tourDesc = b.tour_title 
          ? `${b.tour_title} - Luxury Expedition (${guests} Travelers)`
          : `Luxury Gem Mine Tour Experience (${guests} Travelers)`;

        setItems([
          {
            description: tourDesc,
            quantity: guests,
            unit_price: ratePerPerson,
            total_price: guests * ratePerPerson,
            sort_order: 1,
          }
        ]);

        toast({
          title: '📋 Auto-Filled from Booking',
          description: `Imported details for ${b.name} (Ref #${bookingId}).`,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }

    prefillFromBooking();
  }, [bookingId]);

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

    if (items.length === 0 || items.some(i => !i.description.trim())) {
      toast({
        variant: 'destructive',
        title: 'Line Items Incomplete',
        description: 'Please provide a description for all line items.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        booking_id: bookingId ? parseInt(bookingId) : null,
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
        send_email: sendEmailImmediately,
      };

      const res = await authFetch(`${API_BASE_URL}/invoices/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to create invoice.');
      }

      const created = await res.json();
      toast({
        title: '🧾 Invoice Created Successfully',
        description: `Invoice ${created.invoice_number} has been generated. ${sendEmailImmediately ? 'Client email dispatched.' : ''}`,
      });

      router.push('/admin/invoices');
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Error Creating Invoice',
        description: e instanceof Error ? e.message : 'Could not save invoice.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary font-serif">Create Official Invoice</h1>
            <p className="text-xs text-muted-foreground">Issue itemized luxury invoices and payment receipts.</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-24 flex flex-col items-center gap-3">
          <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground">Loading booking parameters...</p>
        </div>
      ) : (
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
                  placeholder="e.g. Lord Harrington"
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
                  placeholder="e.g. client@domain.com"
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Phone / WhatsApp</Label>
                <Input
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  placeholder="+44 7911 123456"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Address / Country</Label>
                <Input
                  value={customerAddress}
                  onChange={e => setCustomerAddress(e.target.value)}
                  placeholder="London, United Kingdom"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Tour Package Title</Label>
                <Input
                  value={tourTitle}
                  onChange={e => setTourTitle(e.target.value)}
                  placeholder="e.g. The Master Gemologist VIP Expedition"
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

          {/* Section 2: Invoice Metadata & Currency */}
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
                <CardDescription className="text-xs">
                  Itemize tour packages, VIP transportation, private gemologist consulting, and add-ons.
                </CardDescription>
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
                <Label className="text-xs font-semibold">Initial Payment Status</Label>
                <Select value={paymentStatus} onValueChange={(v: PaymentStatus) => setPaymentStatus(v)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="partially_paid">Partially Paid (Deposit)</SelectItem>
                    <SelectItem value="paid">Fully Paid</SelectItem>
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

          {/* Email Client Toggle & Submission */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border border-primary/30 bg-primary/5">
            <div className="flex items-start gap-2.5">
              <Checkbox
                id="sendEmail"
                checked={sendEmailImmediately}
                onCheckedChange={c => setSendEmailImmediately(Boolean(c))}
                className="mt-0.5"
              />
              <div>
                <Label htmlFor="sendEmail" className="text-xs font-semibold text-foreground cursor-pointer flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Dispatch Branded Luxury Invoice Email Immediately
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Sends an official HTML invoice email to <strong>{customerEmail || 'the client'}</strong> upon saving.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Button type="button" variant="outline" onClick={() => router.push('/admin/invoices')}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm">
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Generating Invoice...
                  </>
                ) : (
                  <>
                    <Receipt className="mr-2 h-4 w-4" />
                    Save &amp; Generate Invoice
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export default function CreateInvoicePage() {
  return (
    <Suspense fallback={<div className="text-center py-20"><LoaderCircle className="h-8 w-8 animate-spin text-primary mx-auto" /></div>}>
      <CreateInvoiceForm />
    </Suspense>
  );
}
