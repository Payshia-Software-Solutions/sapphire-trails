'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/utils';
import { authFetch } from '@/lib/api';
import type { ReferralAgent, ReferralCommission, ReferralSettings } from '@/lib/referrals-data';
import {
  Award,
  Copy,
  Check,
  Clock,
  CheckCircle2,
  XCircle,
  LoaderCircle,
  Share2,
  DollarSign,
  MousePointerClick,
  Users,
  AlertCircle,
  ShieldCheck,
  Gem,
  ArrowUpRight,
} from 'lucide-react';

interface MyReferralResponse {
  program_enabled: boolean;
  agent: ReferralAgent | null;
  effective_rules: ReferralSettings;
  stats: {
    total_clicks: number;
    total_referrals: number;
    pending_commission: number;
    approved_commission: number;
    paid_commission: number;
    total_discount_shared: number;
  };
  commissions: ReferralCommission[];
}

export function AgentReferralTab() {
  const { toast } = useToast();
  const [data, setData] = useState<MyReferralResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [agentType, setAgentType] = useState('customer_agent');
  const [applicationNote, setApplicationNote] = useState('');
  const [copiedField, setCopiedField] = useState<'code' | 'link' | null>(null);

  const loadMyReferral = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/referrals/my/`);
      if (res.ok) {
        const json: MyReferralResponse = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error('Failed to load referral profile:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMyReferral();
  }, [loadMyReferral]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsApplying(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/referrals/apply/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_type: agentType,
          application_note: applicationNote.trim(),
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.error || 'Could not submit application.');
      }
      toast({
        title: 'Application Submitted',
        description: json?.message || 'An administrator will review your referral agent request.',
      });
      setApplicationNote('');
      await loadMyReferral();
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Application Error',
        description: err instanceof Error ? err.message : 'Failed to apply.',
      });
    } finally {
      setIsApplying(false);
    }
  };

  const copyText = (text: string, type: 'code' | 'link') => {
    navigator.clipboard.writeText(text);
    setCopiedField(type);
    toast({ title: 'Copied!', description: `${type === 'code' ? 'Referral code' : 'Referral link'} copied to clipboard.` });
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-4 border-b border-border/60">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-headline font-bold text-foreground">
              Agent &amp; Partner Program
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Invitation-only referral partnership and commission ledger.
            </p>
          </div>
        </div>
        <Card className="border-border/80 rounded-2xl">
          <CardContent className="py-20 flex flex-col items-center justify-center gap-3">
            <LoaderCircle className="h-7 w-7 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">Loading your partner credentials...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const agent = data?.agent || null;
  const rules = data?.effective_rules;
  const stats = data?.stats;
  const commissions = data?.commissions || [];
  const referralUrl =
    agent?.referral_code && typeof window !== 'undefined'
      ? `${window.location.origin}/?ref=${encodeURIComponent(agent.referral_code)}`
      : agent?.referral_code
      ? `https://sapphiretrails.lk/?ref=${encodeURIComponent(agent.referral_code)}`
      : '';

  const formatRate = (type?: string, value?: number) => {
    if (!type || type === 'none') return 'None';
    return type === 'percentage' ? `${Number(value || 0)}%` : `$${Number(value || 0).toFixed(2)}`;
  };

  const renderCommissionStatus = (status: ReferralCommission['status']) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-emerald-600 text-white text-[10px] rounded-full px-2.5">Paid</Badge>;
      case 'approved':
        return <Badge className="bg-blue-600 text-white text-[10px] rounded-full px-2.5">Approved</Badge>;
      case 'cancelled':
        return <Badge variant="destructive" className="text-[10px] rounded-full px-2.5">Cancelled</Badge>;
      default:
        return <Badge variant="secondary" className="text-[10px] rounded-full px-2.5">Pending</Badge>;
    }
  };

  // Not yet an approved agent — Unified 12-col Portal Layout
  if (!agent || agent.status !== 'approved') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-4 border-b border-border/60">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-headline font-bold text-foreground">
              Agent &amp; Partner Program
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Apply for authorized referral partner status to share private invitations and earn commissions.
            </p>
          </div>
          <Badge variant="outline" className="w-fit rounded-full px-3 py-1 text-[11px] font-medium border-primary/30 text-primary shrink-0">
            {agent?.status === 'pending'
              ? 'Application Under Review'
              : agent?.status === 'suspended'
              ? 'Account Paused'
              : 'Approval Required'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
          {/* Left: Application Form / Status Card */}
          <Card className="xl:col-span-7 border-border/80 shadow-sm rounded-2xl flex flex-col bg-card">
            <CardHeader className="p-5 sm:p-6 pb-4">
              <CardTitle className="text-base sm:text-lg font-headline font-bold flex items-center gap-2">
                <Award className="h-5 w-5 text-primary shrink-0" />
                <span>Partner Application</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Referral links and partner commissions are exclusively unlocked for admin-approved registered members.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 pt-0 space-y-4">
              {agent?.status === 'pending' && (
                <div className="p-4 sm:p-5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                  <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                    <Clock className="h-4 w-4 shrink-0" /> Application Pending Review
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Thank you for applying. Our concierge team is reviewing your partner request and will activate your personal referral code shortly.
                  </p>
                </div>
              )}

              {agent?.status === 'suspended' && (
                <div className="p-4 sm:p-5 rounded-xl bg-destructive/10 border border-destructive/30 space-y-2">
                  <p className="text-sm font-semibold text-destructive flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" /> Partner Access Paused
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Your referral privileges are currently suspended. Please contact our concierge desk for further details.
                  </p>
                </div>
              )}

              {(!agent || agent.status === 'rejected') && (
                <form onSubmit={handleApply} className="space-y-4">
                  {agent?.status === 'rejected' && (
                    <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/30 text-xs text-destructive flex items-center gap-2">
                      <XCircle className="h-4 w-4 shrink-0" />
                      <span>Your previous request was not approved. You may update your partner details and re-submit below.</span>
                    </div>
                  )}

                  {!data?.program_enabled ? (
                    <div className="p-4 rounded-xl bg-muted/60 border text-xs text-muted-foreground">
                      The referral partner program is currently closed to new applications.
                    </div>
                  ) : (
                    <>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Partner Category</Label>
                        <Select value={agentType} onValueChange={setAgentType}>
                          <SelectTrigger className="rounded-xl text-xs sm:text-sm h-11">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="customer_agent">Past Guest / Brand Ambassador</SelectItem>
                            <SelectItem value="tour_guide">Tour Guide / Chauffeur</SelectItem>
                            <SelectItem value="hotel_partner">Hotel / Villa Concierge</SelectItem>
                            <SelectItem value="travel_agent">Travel Agency / Concierge</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">How will you introduce guests? (Optional)</Label>
                        <Textarea
                          placeholder="e.g. I manage a boutique villa in Galle / I coordinate private luxury itineraries across Sri Lanka..."
                          value={applicationNote}
                          onChange={(e) => setApplicationNote(e.target.value)}
                          className="rounded-xl text-xs sm:text-sm min-h-[110px]"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isApplying}
                        className="w-full sm:w-auto rounded-xl h-11 px-6 text-xs sm:text-sm font-semibold"
                      >
                        {isApplying && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                        Submit Partner Application
                      </Button>
                    </>
                  )}
                </form>
              )}
            </CardContent>
          </Card>

          {/* Right: Editorial Partnership Overview Card (No internal commission/split leakage) */}
          <Card className="xl:col-span-5 border-border/80 shadow-sm rounded-2xl bg-muted/25 flex flex-col justify-between">
            <div>
              <CardHeader className="p-5 sm:p-6 pb-3">
                <CardTitle className="text-base font-headline font-bold flex items-center gap-2">
                  <Gem className="h-4 w-4 text-primary shrink-0" />
                  <span>How Partnership Works</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Designed for luxury hospitality hosts, travel advisors, and past Sapphire Trails guests.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 sm:p-6 pt-2 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Submit Request</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                      Select your partner profile so our Ratnapura concierge desk can verify your account.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Admin Verification &amp; Activation</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                      Once approved, your personal referral code, shareable link, and rate tier become active here.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Track Referrals &amp; Payouts</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                      Monitor link clicks, confirmed bookings, and settled commissions directly from your portal.
                    </p>
                  </div>
                </div>
              </CardContent>
            </div>

            <div className="px-5 sm:px-6 pb-5 pt-3 border-t border-border/60 flex items-center gap-2 text-[11px] text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Verified 30-day referral attribution window on all invitations.</span>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Approved Partner Dashboard
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-4 border-b border-border/60">
        <div className="space-y-1">
          <h2 className="text-lg sm:text-xl font-headline font-bold text-foreground">
            Agent &amp; Partner Portal
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Share your personal invitation code and monitor referred bookings &amp; settlements.
          </p>
        </div>
        <Badge className="w-fit bg-emerald-600 text-white rounded-full px-3 py-1 text-[11px] gap-1.5 shrink-0">
          <CheckCircle2 className="h-3.5 w-3.5" /> Active Partner
        </Badge>
      </div>

      {/* Partner Link & Rate Terms Row */}
      <div className="grid gap-6 xl:grid-cols-12 items-stretch">
        <Card className="xl:col-span-8 border-border/80 shadow-sm rounded-2xl overflow-hidden flex flex-col bg-card">
          <CardHeader className="p-5 sm:p-6 pb-3 bg-[#08111e] text-white border-b border-white/10">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base sm:text-lg font-headline font-bold flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-400" />
                <span>Your Invitation Credentials</span>
              </CardTitle>
              <span className="text-[10px] uppercase tracking-widest text-amber-300 font-semibold">30-Day Attribution</span>
            </div>
            <CardDescription className="text-xs text-slate-300">
              Guests booking with your link or code receive an automatic privilege discount at checkout.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 sm:p-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Referral Code</Label>
                <div className="flex gap-2">
                  <Input value={agent.referral_code || ''} readOnly className="font-mono font-bold text-sm bg-muted/30 h-11 rounded-xl" />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-11 w-11 rounded-xl shrink-0"
                    onClick={() => copyText(agent.referral_code || '', 'code')}
                    aria-label="Copy referral code"
                  >
                    {copiedField === 'code' ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Invitation Link</Label>
                <div className="flex gap-2">
                  <Input value={referralUrl} readOnly className="text-xs bg-muted/30 h-11 rounded-xl" />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-11 w-11 rounded-xl shrink-0"
                    onClick={() => copyText(referralUrl, 'link')}
                    aria-label="Copy referral link"
                  >
                    {copiedField === 'link' ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="rounded-xl text-xs h-9 px-4"
                onClick={() =>
                  window.open(
                    `https://wa.me/?text=${encodeURIComponent(
                      `Book a luxury private Ratnapura gem mine tour with Sapphire Trails and enjoy an exclusive guest privilege using my invitation code ${agent.referral_code}: ${referralUrl}`
                    )}`,
                    '_blank'
                  )
                }
              >
                <Share2 className="h-3.5 w-3.5 mr-1.5" /> Share via WhatsApp
                <ArrowUpRight className="h-3.5 w-3.5 ml-1 opacity-70" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-4 border-border/80 shadow-sm rounded-2xl flex flex-col bg-card">
          <CardHeader className="p-5 sm:p-6 pb-3">
            <CardTitle className="text-base font-headline font-bold">Partner Rate Summary</CardTitle>
            <CardDescription className="text-xs">Active commercial terms on your account</CardDescription>
          </CardHeader>
          <CardContent className="p-5 sm:p-6 pt-0 space-y-3 text-xs">
            <div className="flex justify-between items-center p-3 rounded-xl bg-muted/40 border border-border/60">
              <span className="text-muted-foreground">Your Commission</span>
              <span className="font-bold text-sm text-foreground">{formatRate(rules?.commission_type, rules?.commission_value)}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-muted/40 border border-border/60">
              <span className="text-muted-foreground">Guest Privilege</span>
              <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                {formatRate(rules?.guest_discount_type, rules?.guest_discount_value)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-muted/40 border border-border/60">
              <span className="text-muted-foreground">Discount Share</span>
              <span className="font-semibold text-right">
                {Number(rules?.agent_discount_share_percent ?? 0) === 0
                  ? 'Company 100%'
                  : Number(rules?.agent_discount_share_percent ?? 0) === 100
                  ? 'Agent 100%'
                  : `Co ${100 - Number(rules?.agent_discount_share_percent ?? 50)}% / You ${Number(rules?.agent_discount_share_percent ?? 50)}%`}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>Link Clicks</span>
              <MousePointerClick className="h-4 w-4 text-primary" />
            </div>
            <p className="text-2xl font-bold tracking-tight">{stats?.total_clicks ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>Referred Bookings</span>
              <Users className="h-4 w-4 text-primary" />
            </div>
            <p className="text-2xl font-bold tracking-tight">{stats?.total_referrals ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>Pending / Payable</span>
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
              ${((stats?.pending_commission ?? 0) + (stats?.approved_commission ?? 0)).toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>Settled Payouts</span>
              <DollarSign className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              ${(stats?.paid_commission ?? 0).toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Commission History */}
      <Card className="border-border/80 shadow-sm rounded-2xl">
        <CardHeader className="p-5 sm:p-6 pb-3">
          <CardTitle className="text-base font-headline font-bold">Referral Commission Ledger</CardTitle>
          <CardDescription className="text-xs">
            Itemized statement of gross expedition value, guest discount, shared discount allocation, and net payout.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 sm:p-6 pt-0">
          {commissions.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
              No bookings have used your referral code yet. Share your invitation link to begin earning.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Booking</TableHead>
                    <TableHead className="text-xs">Guest / Expedition</TableHead>
                    <TableHead className="text-xs text-right">Gross</TableHead>
                    <TableHead className="text-xs text-right">Guest Disc.</TableHead>
                    <TableHead className="text-xs text-right">Gross Comm.</TableHead>
                    <TableHead className="text-xs text-right">Your Disc. Share</TableHead>
                    <TableHead className="text-xs text-right">Net Earned</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissions.map((c) => (
                    <TableRow key={c.id} className="text-xs">
                      <TableCell className="font-mono font-semibold">#{c.booking_id}</TableCell>
                      <TableCell>
                        <div className="font-medium">{c.guest_first_name || 'Guest'}</div>
                        <div className="text-[11px] text-muted-foreground">{c.tour_title || c.tour_date}</div>
                      </TableCell>
                      <TableCell className="text-right">${Number(c.gross_amount).toFixed(2)}</TableCell>
                      <TableCell className="text-right text-amber-600 dark:text-amber-400">
                        -${Number(c.guest_discount_amount).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">${Number(c.gross_commission_amount).toFixed(2)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        -${Number(c.agent_discount_share).toFixed(2)} ({Number(c.agent_discount_share_percent)}%)
                      </TableCell>
                      <TableCell className="text-right font-bold text-emerald-600 dark:text-emerald-400">
                        ${Number(c.net_commission_amount).toFixed(2)}
                      </TableCell>
                      <TableCell>{renderCommissionStatus(c.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
