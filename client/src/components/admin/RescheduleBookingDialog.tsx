'use client';

import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Calendar, LoaderCircle, ArrowRight, Sparkles } from 'lucide-react';
import { API_BASE_URL } from '@/lib/utils';
import { authFetch } from '@/lib/api';
import { type Booking } from '@/lib/bookings-data';

interface RescheduleBookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onRescheduleSuccess?: (updatedBooking: Booking) => void;
}

export function RescheduleBookingDialog({
  isOpen,
  onClose,
  booking,
  onRescheduleSuccess,
}: RescheduleBookingDialogProps) {
  const { toast } = useToast();
  const [newDate, setNewDate] = useState<string>('');
  const [newEndDate, setNewEndDate] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [sendEmail, setSendEmail] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Initialize or reset when opened
  const handleOpenChange = (open: boolean) => {
    if (open && booking) {
      setNewDate(booking.date || '');
      setNewEndDate(booking.end_date || '');
      setReason('');
      setSendEmail(true);
    } else {
      onClose();
    }
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;

    if (!newDate) {
      toast({
        variant: 'destructive',
        title: 'Date Required',
        description: 'Please pick a new tour date.',
      });
      return;
    }

    if (newDate === booking.date && (!newEndDate || newEndDate === booking.end_date)) {
      toast({
        variant: 'destructive',
        title: 'Same Date Selected',
        description: 'Please select a different date to reschedule.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authFetch(`${API_BASE_URL}/bookings/${booking.id}/reschedule/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          new_date: newDate,
          new_end_date: newEndDate || null,
          reason: reason.trim() || 'Date change requested by traveler',
          send_email: sendEmail,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to reschedule tour.');
      }

      const result = await response.json();

      toast({
        title: '🗓️ Tour Rescheduled Successfully',
        description: `Booking #${booking.id} shifted to ${format(parseISO(newDate), 'PPP')}. ${sendEmail ? 'Confirmation email dispatched.' : ''}`,
      });

      if (onRescheduleSuccess && result.booking) {
        onRescheduleSuccess(result.booking);
      }
      onClose();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error Rescheduling',
        description: error instanceof Error ? error.message : 'Could not process reschedule request.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!booking) return null;

  const currentFormatted = booking.date 
    ? format(parseISO(booking.date), 'PPP') 
    : 'Unknown Date';

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-border bg-background">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-serif">
            <Calendar className="h-5 w-5 text-primary" />
            Reschedule Tour Dates
          </DialogTitle>
          <DialogDescription className="text-xs">
            Shift booking dates for <strong className="text-foreground">{booking.name}</strong> (Ref #{booking.id}).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleRescheduleSubmit} className="space-y-4 pt-2">
          {/* Current Date Preview */}
          <div className="p-3 rounded-xl bg-background-alt border border-border/80 text-xs flex items-center justify-between">
            <div>
              <span className="text-muted-foreground block text-[11px]">Currently Scheduled:</span>
              <span className="font-semibold text-foreground">{currentFormatted}</span>
            </div>
            {newDate && newDate !== booking.date && (
              <div className="flex items-center gap-2 text-emerald-500 font-semibold">
                <ArrowRight className="h-4 w-4" />
                <span>{format(parseISO(newDate), 'MMM dd, yyyy')}</span>
              </div>
            )}
          </div>

          {/* New Tour Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="newDate" className="text-xs font-semibold">New Tour Start Date *</Label>
              <Input
                id="newDate"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="newEndDate" className="text-xs font-semibold">End Date (Optional)</Label>
              <Input
                id="newEndDate"
                type="date"
                value={newEndDate}
                onChange={(e) => setNewEndDate(e.target.value)}
                min={newDate || undefined}
                className="h-9 text-xs"
              />
            </div>
          </div>

          {/* Reschedule Reason */}
          <div className="space-y-1.5">
            <Label htmlFor="reason" className="text-xs font-semibold">Reason for Rescheduling / Note</Label>
            <Textarea
              id="reason"
              rows={2}
              placeholder="e.g. Traveler requested date change due to flight delay..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="text-xs resize-none"
            />
            <p className="text-[11px] text-muted-foreground">
              This note will be recorded in the booking history and included in the email.
            </p>
          </div>

          {/* Auto Email Toggle */}
          <div className="flex items-start space-x-2.5 p-3 rounded-xl border border-primary/20 bg-primary/5">
            <Checkbox
              id="sendEmail"
              checked={sendEmail}
              onCheckedChange={(c) => setSendEmail(Boolean(c))}
              className="mt-0.5"
            />
            <div className="space-y-0.5">
              <Label htmlFor="sendEmail" className="text-xs font-semibold cursor-pointer flex items-center gap-1.5 text-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Send Reschedule Confirmation Email to Traveler
              </Label>
              <p className="text-[11px] text-muted-foreground">
                Dispatches a branded confirmation email to <strong>{booking.email}</strong> with updated dates &amp; updated invoice link.
              </p>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <LoaderCircle className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Updating Dates...
                </>
              ) : (
                'Confirm Reschedule'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
