'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { 
  type Invoice, 
  mapServerInvoiceToClient, 
  formatCurrency 
} from '@/lib/invoices-data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Printer, 
  Download, 
  CalendarDays, 
  MessageCircle, 
  LoaderCircle, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  ArrowLeft,
  Gem,
  Send 
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/utils';
import { trackContactClick } from '@/lib/analytics';

export default function DigitalInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const invoiceNumber = params.invoiceNumber as string;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Date Change Request Dialog (Traveler Self-Service)
  const [isDateChangeOpen, setIsDateChangeOpen] = useState(false);
  const [requestedDate, setRequestedDate] = useState('');
  const [requestedEndDate, setRequestedEndDate] = useState('');
  const [dateChangeReason, setDateChangeReason] = useState('');
  const [isSubmittingDateChange, setIsSubmittingDateChange] = useState(false);

  useEffect(() => {
    if (!invoiceNumber) return;

    async function fetchInvoice() {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/invoices/by-number/${invoiceNumber}`);
        if (!res.ok) throw new Error('Invoice not found');
        const data = await res.json();
        setInvoice(mapServerInvoiceToClient(data));
      } catch (error) {
        console.error(error);
        setInvoice(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchInvoice();
  }, [invoiceNumber]);

  const handlePrint = () => {
    window.print();
  };

  const handleDateChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice || !invoice.booking_id) {
      toast({
        variant: 'destructive',
        title: 'Direct Invoice',
        description: 'Please contact our concierge directly to modify custom invoices.',
      });
      return;
    }

    if (!requestedDate) {
      toast({
        variant: 'destructive',
        title: 'Date Required',
        description: 'Please select your preferred tour date.',
      });
      return;
    }

    setIsSubmittingDateChange(true);
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/${invoice.booking_id}/reschedule-request/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          new_date: requestedDate,
          new_end_date: requestedEndDate || null,
          reason: dateChangeReason.trim() || 'Date change requested by customer via invoice portal',
          send_email: true,
        }),
      });

      if (!res.ok) throw new Error('Failed to submit date change request.');

      toast({
        title: '🗓️ Date Change Request Submitted',
        description: 'Your reschedule request has been sent to our team and confirmed.',
      });

      // Refresh invoice
      setIsDateChangeOpen(false);
      const updatedRes = await fetch(`${API_BASE_URL}/invoices/by-number/${invoiceNumber}`);
      if (updatedRes.ok) {
        const data = await updatedRes.json();
        setInvoice(mapServerInvoiceToClient(data));
      }
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Submission Error',
        description: e instanceof Error ? e.message : 'Could not submit date change request.',
      });
    } finally {
      setIsSubmittingDateChange(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090b0e] text-white flex flex-col items-center justify-center gap-4">
        <LoaderCircle className="h-10 w-10 animate-spin text-[#c79954]" />
        <p className="text-xs text-muted-foreground tracking-widest uppercase font-mono">Loading Official Statement...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-[#090b0e] text-white flex flex-col items-center justify-center gap-6 p-4">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-serif text-[#c79954]">Invoice Not Found</h1>
          <p className="text-xs text-muted-foreground">The requested invoice number ({invoiceNumber}) could not be located.</p>
        </div>
        <Button asChild variant="outline" className="text-xs border-[#c79954]/40 text-[#c79954]">
          <Link href="/">Return to Sapphire Trails Homepage</Link>
        </Button>
      </div>
    );
  }

  const isPaid = invoice.payment_status === 'paid';
  const isPartiallyPaid = invoice.payment_status === 'partially_paid';

  return (
    <div className="min-h-screen bg-[#08090c] text-white font-sans selection:bg-[#c79954]/30 selection:text-white print:bg-white print:text-black">
      {/* Top Floating Action Bar (Hidden on Print) */}
      <header className="sticky top-0 z-50 bg-[#0f1218]/90 backdrop-blur-md border-b border-border/40 px-4 py-3 print:hidden">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm" className="h-8 px-2 text-xs text-muted-foreground hover:text-white">
              <Link href="/">
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                Home
              </Link>
            </Button>
            <span className="hidden sm:inline-block font-mono text-xs text-[#c79954] font-semibold">
              {invoice.invoice_number}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Request Date Change (Customer Self-Service) */}
            {invoice.booking_id && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setRequestedDate(invoice.tour_date || '');
                  setIsDateChangeOpen(true);
                }}
                className="h-8 px-2.5 text-xs border-[#c79954]/40 text-[#c79954] hover:bg-[#c79954]/10"
              >
                <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
                Reschedule Tour
              </Button>
            )}

            {/* WhatsApp Concierge */}
            <Button asChild variant="outline" size="sm" className="h-8 px-2.5 text-xs text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10">
              <a
                href={`https://wa.me/94712357700?text=${encodeURIComponent(`Hello Sapphire Trails, I have an inquiry regarding Invoice #${invoice.invoice_number} (${invoice.customer_name}).`)}`}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackContactClick({ channel: 'whatsapp', source: `invoice_${invoice.invoice_number}` })}
              >
                <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                WhatsApp Concierge
              </a>
            </Button>

            {/* Print & PDF Button */}
            <Button
              onClick={handlePrint}
              size="sm"
              className="h-8 px-3 text-xs bg-[#c79954] hover:bg-[#b58844] text-black font-semibold shadow-sm"
            >
              <Printer className="h-3.5 w-3.5 mr-1.5" />
              Print / Save PDF
            </Button>
          </div>
        </div>
      </header>

      {/* Invoice Document Paper Container */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 print:p-0 print:max-w-none">
        <div className="bg-[#12151d] border border-[#c79954]/30 rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden print:border-none print:bg-white print:p-0 print:shadow-none">
          
          {/* Subtle Luxury Watermark background icon (Locked Top-Right) */}
          <div 
            className="absolute top-0 right-0 pointer-events-none text-[#c79954]/5 print:text-[#c79954] print:opacity-10 z-0 overflow-hidden"
            style={{ position: 'absolute', top: 0, right: 0 }}
          >
            <Gem className="w-72 h-72 translate-x-8 -translate-y-8" />
          </div>

          {/* Document Top Header (Locked Side-by-Side) */}
          <div className="flex flex-row justify-between items-start gap-6 border-b border-border/60 pb-8 relative z-10 print:border-gray-300 w-full">
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="font-serif text-2xl sm:text-3xl font-bold tracking-[0.15em] text-[#c79954] print:text-black">
                  SAPPHIRE TRAILS
                </span>
              </div>
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground mt-1 print:text-gray-600">
                Luxury Gem Mine Expeditions &bull; Sri Lanka
              </p>
              <div className="text-xs text-muted-foreground mt-3 space-y-0.5 leading-relaxed print:text-gray-600">
                <p>Grand Silver Ray Complex, Colombo - Batticaloa Hwy</p>
                <p>Ratnapura, Sabaragamuwa Province, Sri Lanka</p>
                <p>Direct: +94 71 235 7700 &bull; reservations@sapphiretrails.lk</p>
              </div>
            </div>

            {/* Invoice Stamp & Meta */}
            <div className="flex flex-col items-end gap-2 text-right">
              {/* Payment Status Seal */}
              <div className="mb-1">
                {isPaid ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 print:border-emerald-600 print:text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    PAID IN FULL
                  </span>
                ) : isPartiallyPaid ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-blue-500/15 text-blue-400 border border-blue-500/40 print:border-blue-600 print:text-blue-700">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    DEPOSIT PAID
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/40 print:border-amber-600 print:text-amber-700">
                    <Clock className="h-3.5 w-3.5" />
                    PAYMENT PENDING
                  </span>
                )}
              </div>

              <div className="font-mono text-xl sm:text-2xl font-bold text-white print:text-black">
                {invoice.invoice_number}
              </div>

              <div className="text-xs text-muted-foreground space-y-0.5 print:text-gray-600">
                <p>Issue Date: <strong className="text-foreground print:text-black">{format(parseISO(invoice.issue_date), 'MMMM dd, yyyy')}</strong></p>
                {invoice.due_date && (
                  <p>Due Date: <strong className="text-foreground print:text-black">{format(parseISO(invoice.due_date), 'MMMM dd, yyyy')}</strong></p>
                )}
                {invoice.booking_id && (
                  <p className="font-mono text-[11px]">Booking Ref: #ST-BK-{invoice.booking_id}</p>
                )}
              </div>
            </div>
          </div>

          {/* Billed To & Tour Details Grid (Strictly Side-by-Side) */}
          <div className="flex flex-row justify-between items-start gap-6 py-6 border-b border-border/60 print:border-gray-300 relative z-10 text-xs w-full">
            <div className="space-y-1 w-[48%] text-left">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#c79954] print:text-[#996515] block mb-1">
                Billed To (Traveler)
              </span>
              <p className="text-base font-semibold text-white print:text-black">{invoice.customer_name}</p>
              <p className="text-muted-foreground print:text-gray-700">{invoice.customer_email}</p>
              {invoice.customer_phone && (
                <p className="text-muted-foreground print:text-gray-700">{invoice.customer_phone}</p>
              )}
              {invoice.customer_address && (
                <p className="text-muted-foreground print:text-gray-700">{invoice.customer_address}</p>
              )}
            </div>

            <div className="space-y-1 w-[48%] text-right">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#c79954] print:text-[#996515] block mb-1">
                Tour Expedition Schedule
              </span>
              <p className="text-base font-semibold text-white print:text-black">
                {invoice.tour_title || 'Private Gem Mine Expedition'}
              </p>
              <p className="text-muted-foreground print:text-gray-700">
                Scheduled Tour Date: <strong className="text-[#c79954] print:text-black">
                  {invoice.tour_date ? format(parseISO(invoice.tour_date), 'MMMM dd, yyyy') : 'Dates to be Confirmed'}
                </strong>
              </p>
              {invoice.payment_method && (
                <p className="text-muted-foreground print:text-gray-700">Payment Method: {invoice.payment_method}</p>
              )}
            </div>
          </div>

          {/* Itemized Table */}
          <div className="py-6 relative z-10">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-[#c79954]/50 text-muted-foreground uppercase text-[10px] tracking-wider print:border-black print:text-black">
                    <th className="py-3 px-2">#</th>
                    <th className="py-3 px-2">Expedition Item Description</th>
                    <th className="py-3 px-2 text-center">Qty</th>
                    <th className="py-3 px-2 text-right">Unit Rate ({invoice.currency})</th>
                    <th className="py-3 px-2 text-right">Amount ({invoice.currency})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30 print:divide-gray-200">
                  {invoice.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] print:hover:bg-transparent">
                      <td className="py-3.5 px-2 font-mono text-muted-foreground print:text-gray-500">{idx + 1}</td>
                      <td className="py-3.5 px-2 font-medium text-white print:text-black">
                        {item.description}
                      </td>
                      <td className="py-3.5 px-2 text-center text-muted-foreground print:text-gray-700">{item.quantity}</td>
                      <td className="py-3.5 px-2 text-right font-mono text-muted-foreground print:text-gray-700">
                        {item.unit_price.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-2 text-right font-mono font-semibold text-white print:text-black">
                        {item.total_price.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations and Summary Box (Strictly Side-by-Side) */}
            <div className="mt-6 flex flex-row justify-between items-start gap-6 pt-4 border-t border-border/60 print:border-gray-300 w-full">
              {/* Payment Instructions / Bank Details */}
              <div className="w-[50%] space-y-2 text-xs text-left">
                {invoice.bank_details && (
                  <div className="p-4 rounded-xl border border-border/80 bg-[#0c0e14] print:border-gray-300 print:bg-gray-50">
                    <span className="font-semibold text-[#c79954] text-[11px] uppercase tracking-wider block mb-1.5 print:text-[#996515]">
                      Payment Instructions / Bank Transfer
                    </span>
                    <p className="font-mono text-[11px] text-muted-foreground whitespace-pre-line leading-relaxed print:text-gray-800">
                      {invoice.bank_details}
                    </p>
                  </div>
                )}
              </div>

              {/* Totals Breakdown */}
              <div className="w-[45%] space-y-2 text-xs">
                <div className="flex justify-between py-1 text-muted-foreground print:text-gray-700">
                  <span>Subtotal:</span>
                  <span className="font-mono font-semibold text-white print:text-black">
                    {formatCurrency(invoice.subtotal, invoice.currency)}
                  </span>
                </div>

                {invoice.discount_amount > 0 && (
                  <div className="flex justify-between py-1 text-emerald-400 print:text-emerald-700">
                    <span>Discount:</span>
                    <span className="font-mono font-semibold">
                      - {formatCurrency(invoice.discount_amount, invoice.currency)}
                    </span>
                  </div>
                )}

                {invoice.tax_amount > 0 && (
                  <div className="flex justify-between py-1 text-muted-foreground print:text-gray-700">
                    <span>Tax &amp; Service:</span>
                    <span className="font-mono font-semibold text-white print:text-black">
                      + {formatCurrency(invoice.tax_amount, invoice.currency)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between py-2 border-t-2 border-[#c79954]/60 text-sm font-bold text-[#c79954] print:border-black print:text-black">
                  <span>Grand Total:</span>
                  <span className="font-mono text-base">
                    {formatCurrency(invoice.total_amount, invoice.currency)}
                  </span>
                </div>

                <div className="flex justify-between py-1 text-muted-foreground print:text-gray-700">
                  <span>Amount Received:</span>
                  <span className="font-mono font-semibold text-emerald-400 print:text-emerald-700">
                    {formatCurrency(invoice.amount_paid, invoice.currency)}
                  </span>
                </div>

                <div className="flex justify-between py-1.5 border-t border-border/50 text-xs font-bold print:border-gray-300">
                  <span className="text-muted-foreground print:text-gray-800">Balance Outstanding:</span>
                  <span className={`font-mono ${invoice.balance_due > 0 ? 'text-amber-400 print:text-amber-700' : 'text-emerald-400 print:text-emerald-700'}`}>
                    {formatCurrency(invoice.balance_due, invoice.currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Terms & Policies Footer */}
          {invoice.notes && (
            <div className="pt-6 border-t border-border/40 text-[11px] text-muted-foreground space-y-1 print:border-gray-300 print:text-gray-600">
              <span className="font-semibold text-white print:text-black uppercase text-[10px] tracking-wider block">
                Terms &amp; Expedition Policies
              </span>
              <p className="whitespace-pre-line leading-relaxed">
                {invoice.notes}
              </p>
            </div>
          )}

          {/* Bottom Copyright & Verification */}
          <div className="mt-8 pt-4 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between text-[10px] text-muted-foreground print:border-gray-300 print:text-gray-500">
            <p>&copy; {new Date().getFullYear()} Sapphire Trails (Pvt) Ltd. All rights reserved.</p>
            <p className="font-mono mt-1 sm:mt-0">Verified Official Statement &bull; sapphiretrails.lk</p>
          </div>
        </div>
      </main>

      {/* Date Change Request Dialog */}
      <Dialog open={isDateChangeOpen} onOpenChange={setIsDateChangeOpen}>
        <DialogContent className="sm:max-w-[480px] bg-[#12151d] text-white border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-serif text-[#c79954]">
              <CalendarDays className="h-4 w-4" />
              Request Tour Date Rescheduling
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Select your preferred new expedition dates for reservation <strong>#{invoice.booking_id}</strong>.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleDateChangeSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-white">Preferred Start Date *</Label>
                <Input
                  type="date"
                  value={requestedDate}
                  onChange={e => setRequestedDate(e.target.value)}
                  required
                  className="h-9 text-xs bg-[#0c0e14] border-border text-white"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-white">End Date (Optional)</Label>
                <Input
                  type="date"
                  value={requestedEndDate}
                  onChange={e => setRequestedEndDate(e.target.value)}
                  min={requestedDate || undefined}
                  className="h-9 text-xs bg-[#0c0e14] border-border text-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-white">Reason for Change / Special Request</Label>
              <Textarea
                rows={2}
                placeholder="e.g. Flight delay, preferred weekend slot..."
                value={dateChangeReason}
                onChange={e => setDateChangeReason(e.target.value)}
                className="text-xs bg-[#0c0e14] border-border text-white resize-none"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsDateChangeOpen(false)} disabled={isSubmittingDateChange} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-[#c79954] hover:bg-[#b58844] text-black font-semibold text-xs" disabled={isSubmittingDateChange}>
                {isSubmittingDateChange ? <LoaderCircle className="h-3.5 w-3.5 animate-spin mr-1" /> : <Send className="h-3.5 w-3.5 mr-1" />}
                Submit Reschedule Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
