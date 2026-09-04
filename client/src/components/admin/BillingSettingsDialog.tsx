'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Landmark, LoaderCircle, Save, Check, Sparkles, Building2 } from 'lucide-react';
import { API_BASE_URL } from '@/lib/utils';
import { authFetch } from '@/lib/api';

interface BillingSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export function BillingSettingsDialog({ isOpen, onClose, onSaved }: BillingSettingsDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Settings State
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [branchName, setBranchName] = useState('');
  const [swiftCode, setSwiftCode] = useState('');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [defaultCurrency, setDefaultCurrency] = useState('USD');
  const [defaultNotes, setDefaultNotes] = useState('');

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/invoices/settings/`);
      if (res.ok) {
        const data = await res.json();
        setBankName(data.bank_name || '');
        setAccountName(data.account_name || '');
        setAccountNumber(data.account_number || '');
        setBranchName(data.branch_name || '');
        setSwiftCode(data.swift_code || '');
        setAdditionalInstructions(data.additional_instructions || '');
        setDefaultCurrency(data.default_currency || 'USD');
        setDefaultNotes(data.default_notes || '');
      }
    } catch (e) {
      console.error("Could not load billing settings", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSettings();
    }
  }, [isOpen]);

  // Formatted output preview
  const formattedBankDetails = `Bank Name: ${bankName || 'Your Bank Name'}
Account Name: ${accountName || 'Your Company Name'}
Account Number: ${accountNumber || '0000 0000 0000'}
Branch: ${branchName || 'City Branch'}
SWIFT / BIC: ${swiftCode || 'SWIFTCODE'}
${additionalInstructions ? `Reference: ${additionalInstructions}` : ''}`.trim();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        bank_name: bankName,
        account_name: accountName,
        account_number: accountNumber,
        branch_name: branchName,
        swift_code: swiftCode,
        additional_instructions: additionalInstructions,
        default_currency: defaultCurrency,
        default_notes: defaultNotes,
      };

      const res = await authFetch(`${API_BASE_URL}/invoices/settings/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save settings.');

      toast({
        title: '✨ Bank & Billing Settings Saved',
        description: 'Default bank account details updated for all future invoices.',
      });

      if (onSaved) onSaved();
      onClose();
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Error Saving Settings',
        description: e instanceof Error ? e.message : 'Could not save bank details.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-serif text-primary">
            <Landmark className="h-5 w-5" />
            Default Bank Account &amp; Billing Settings
          </DialogTitle>
          <DialogDescription className="text-xs">
            Configure your official company bank account and standard terms. These will automatically pre-populate on all newly created invoices.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-16 text-center flex flex-col items-center gap-3">
            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">Loading current settings...</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4 pt-2">
            {/* Bank Information Grid */}
            <div className="p-4 rounded-xl border border-border bg-background-alt/50 space-y-3">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-primary" />
                Bank Account Details
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Bank Name *</Label>
                  <Input
                    placeholder="e.g. Commercial Bank of Ceylon / HSBC"
                    value={bankName}
                    onChange={e => setBankName(e.target.value)}
                    required
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Account Holder Name *</Label>
                  <Input
                    placeholder="e.g. Sapphire Trails (Pvt) Ltd"
                    value={accountName}
                    onChange={e => setAccountName(e.target.value)}
                    required
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Account Number *</Label>
                  <Input
                    placeholder="e.g. 8001 2345 6789"
                    value={accountNumber}
                    onChange={e => setAccountNumber(e.target.value)}
                    required
                    className="h-9 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Branch Name &amp; Code</Label>
                  <Input
                    placeholder="e.g. Ratnapura City Branch (Code: 042)"
                    value={branchName}
                    onChange={e => setBranchName(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">SWIFT / BIC Code (International)</Label>
                  <Input
                    placeholder="e.g. CCEYLKLX"
                    value={swiftCode}
                    onChange={e => setSwiftCode(e.target.value)}
                    className="h-9 text-xs font-mono uppercase"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Default Invoice Currency</Label>
                  <Select value={defaultCurrency} onValueChange={setDefaultCurrency}>
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
              </div>

              <div className="space-y-1.5 pt-1">
                <Label className="text-xs font-semibold">Transfer Reference Instruction</Label>
                <Input
                  placeholder="e.g. Please include your Invoice Number in the transfer remarks."
                  value={additionalInstructions}
                  onChange={e => setAdditionalInstructions(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Standard Terms */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Default Invoice Terms &amp; Policies</Label>
              <Textarea
                rows={3}
                placeholder="Payment timeline, rescheduling policy, VIP inclusions..."
                value={defaultNotes}
                onChange={e => setDefaultNotes(e.target.value)}
                className="text-xs leading-relaxed"
              />
            </div>

            {/* Live Preview Box */}
            <div className="p-3 rounded-xl border border-primary/20 bg-primary/5 space-y-1 text-xs">
              <span className="text-[11px] font-bold text-primary flex items-center gap-1 uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5" />
                Live Invoice Preview
              </span>
              <pre className="font-mono text-[11px] text-muted-foreground whitespace-pre-line bg-background p-2.5 rounded-lg border border-border">
                {formattedBankDetails}
              </pre>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-1.5 h-3.5 w-3.5" />
                    Save Default Bank Details
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
