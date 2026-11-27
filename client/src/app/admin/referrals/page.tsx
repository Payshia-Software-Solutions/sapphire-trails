'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/utils';
import { authFetch } from '@/lib/api';
import type { User as AuthUser } from '@/contexts/auth-context';
import {
  calculateReferralPreview,
  type ReferralAgent,
  type ReferralCommission,
  type ReferralSettings,
  type AgentStatus,
  type CommissionStatus,
  type CommissionType,
  type GuestDiscountType,
  type DiscountBearMode,
} from '@/lib/referrals-data';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  LoaderCircle,
  Plus,
  RefreshCw,
  Settings,
  Users,
  Calculator,
  Pencil,
  Ban,
  CreditCard,
} from 'lucide-react';

const DEFAULT_SETTINGS: ReferralSettings = {
  program_enabled: true,
  commission_type: 'percentage',
  commission_value: 10,
  commission_basis: 'gross',
  guest_discount_type: 'percentage',
  guest_discount_value: 5,
  discount_bear_mode: 'split',
  agent_discount_share_percent: 50,
  min_booking_amount: 0,
  attribution_days: 30,
  require_admin_approval: true,
  auto_approve_on_booking_confirm: true,
};

export default function AdminReferralsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('agents');
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const [agents, setAgents] = useState<ReferralAgent[]>([]);
  const [commissions, setCommissions] = useState<ReferralCommission[]>([]);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [settings, setSettings] = useState<ReferralSettings>(DEFAULT_SETTINGS);
  const [commissionFilter, setCommissionFilter] = useState<string>('all');
  const [simulatorAmount, setSimulatorAmount] = useState<number>(10000);

  // Enable customer as agent modal
  const [isEnableOpen, setIsEnableOpen] = useState(false);
  const [isEnabling, setIsEnabling] = useState(false);
  const [enableForm, setEnableForm] = useState({
    user_id: '',
    referral_code: '',
    agent_type: 'customer_agent',
    admin_note: '',
  });

  // Edit agent modal (status, code, custom rates)
  const [editingAgent, setEditingAgent] = useState<ReferralAgent | null>(null);
  const [isSavingAgent, setIsSavingAgent] = useState(false);
  const [editAgentForm, setEditAgentForm] = useState({
    status: 'approved' as AgentStatus,
    referral_code: '',
    agent_type: 'customer_agent',
    admin_note: '',
    use_custom_rates: false,
    commission_type: 'percentage' as CommissionType,
    commission_value: 10,
    guest_discount_type: 'percentage' as GuestDiscountType,
    guest_discount_value: 5,
    discount_bear_mode: 'split' as DiscountBearMode,
    agent_discount_share_percent: 50,
  });

  // Payout modal
  const [payingCommission, setPayingCommission] = useState<ReferralCommission | null>(null);
  const [payoutRef, setPayoutRef] = useState('');
  const [payoutNotes, setPayoutNotes] = useState('');
  const [isUpdatingCommission, setIsUpdatingCommission] = useState(false);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [agentsRes, commRes, usersRes] = await Promise.all([
        authFetch(`${API_BASE_URL}/referrals/agents/`),
        authFetch(`${API_BASE_URL}/referrals/commissions/`),
        authFetch(`${API_BASE_URL}/users/`),
      ]);

      if (agentsRes.ok) {
        const d = await agentsRes.json();
        setAgents(Array.isArray(d.agents) ? d.agents : []);
        if (d.settings) setSettings({ ...DEFAULT_SETTINGS, ...d.settings });
      }
      if (commRes.ok) {
        const c = await commRes.json();
        setCommissions(Array.isArray(c) ? c : []);
      }
      if (usersRes.ok) {
        const u = await usersRes.json();
        setUsers(Array.isArray(u) ? u : []);
      }
    } catch (e) {
      console.error('Failed to load referral data:', e);
      toast({ variant: 'destructive', title: 'Load Failed', description: 'Could not load referral system data.' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const nonAgentUsers = useMemo(() => {
    const existingIds = new Set(agents.map((a) => Number(a.user_id)));
    return users.filter((u) => !existingIds.has(Number(u.id)));
  }, [users, agents]);

  const pendingCount = useMemo(() => agents.filter((a) => a.status === 'pending').length, [agents]);

  const kpis = useMemo(() => {
    let pendingAmt = 0;
    let approvedAmt = 0;
    let paidAmt = 0;
    let totalSales = 0;
    commissions.forEach((c) => {
      if (c.status === 'cancelled') return;
      totalSales += Number(c.net_booking_amount || 0);
      if (c.status === 'pending') pendingAmt += Number(c.net_commission_amount || 0);
      if (c.status === 'approved') approvedAmt += Number(c.net_commission_amount || 0);
      if (c.status === 'paid') paidAmt += Number(c.net_commission_amount || 0);
    });
    return {
      activeAgents: agents.filter((a) => a.status === 'approved').length,
      pendingAgents: pendingCount,
      totalSales,
      payableNow: approvedAmt,
      pendingAmt,
      paidAmt,
    };
  }, [agents, commissions, pendingCount]);

  const filteredCommissions = useMemo(() => {
    if (commissionFilter === 'all') return commissions;
    return commissions.filter((c) => c.status === commissionFilter);
  }, [commissions, commissionFilter]);

  const simulator = useMemo(() => calculateReferralPreview(simulatorAmount, settings), [simulatorAmount, settings]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/referrals/settings/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || 'Failed to save referral settings');
      if (json?.settings) setSettings({ ...DEFAULT_SETTINGS, ...json.settings });
      toast({ title: 'Settings Saved', description: 'Global commission, guest discount & cost-sharing rules updated.' });
      loadAll();
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Save Error',
        description: err instanceof Error ? err.message : 'Could not save settings.',
      });
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleQuickAgentStatus = async (agent: ReferralAgent, status: AgentStatus) => {
    try {
      const res = await authFetch(`${API_BASE_URL}/referrals/agents/${agent.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || 'Failed to update agent status');
      toast({ title: 'Updated', description: `${agent.user_name}'s agent status is now ${status}.` });
      loadAll();
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: err instanceof Error ? err.message : 'Failed to update agent.',
      });
    }
  };

  const handleEnableCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enableForm.user_id) {
      toast({ variant: 'destructive', title: 'Select User', description: 'Please choose a registered user.' });
      return;
    }
    setIsEnabling(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/referrals/agents/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: Number(enableForm.user_id),
          referral_code: enableForm.referral_code.trim() || undefined,
          agent_type: enableForm.agent_type,
          admin_note: enableForm.admin_note.trim() || undefined,
          status: 'approved',
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || 'Failed to enable referral agent');
      toast({ title: 'Agent Enabled', description: `Code ${json?.agent?.referral_code || ''} is now active.` });
      setIsEnableOpen(false);
      setEnableForm({ user_id: '', referral_code: '', agent_type: 'customer_agent', admin_note: '' });
      loadAll();
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Enable Failed',
        description: err instanceof Error ? err.message : 'Could not enable agent.',
      });
    } finally {
      setIsEnabling(false);
    }
  };

  const openEditAgent = (agent: ReferralAgent) => {
    const hasCustom =
      agent.commission_value !== null ||
      agent.guest_discount_value !== null ||
      agent.discount_bear_mode !== null;
    setEditingAgent(agent);
    setEditAgentForm({
      status: agent.status,
      referral_code: agent.referral_code || '',
      agent_type: agent.agent_type || 'customer_agent',
      admin_note: agent.admin_note || '',
      use_custom_rates: hasCustom,
      commission_type: (agent.commission_type || settings.commission_type) as CommissionType,
      commission_value: Number(agent.commission_value ?? settings.commission_value),
      guest_discount_type: (agent.guest_discount_type || settings.guest_discount_type) as GuestDiscountType,
      guest_discount_value: Number(agent.guest_discount_value ?? settings.guest_discount_value),
      discount_bear_mode: (agent.discount_bear_mode || settings.discount_bear_mode) as DiscountBearMode,
      agent_discount_share_percent: Number(agent.agent_discount_share_percent ?? settings.agent_discount_share_percent),
    });
  };

  const handleSaveEditAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAgent) return;
    setIsSavingAgent(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/referrals/agents/${editingAgent.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editAgentForm),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || 'Failed to update agent');
      toast({ title: 'Agent Updated', description: `Saved changes for ${editingAgent.user_name}.` });
      setEditingAgent(null);
      loadAll();
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Update Error',
        description: err instanceof Error ? err.message : 'Could not update agent.',
      });
    } finally {
      setIsSavingAgent(false);
    }
  };

  const handleCommissionStatusChange = async (
    id: number,
    status: CommissionStatus,
    ref?: string,
    notes?: string
  ) => {
    setIsUpdatingCommission(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/referrals/commissions/${id}/status/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          payout_reference: ref || null,
          payout_notes: notes || null,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || 'Failed to update commission');
      toast({ title: 'Commission Updated', description: `Status set to ${status}.` });
      setPayingCommission(null);
      setPayoutRef('');
      setPayoutNotes('');
      loadAll();
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update commission.',
      });
    } finally {
      setIsUpdatingCommission(false);
    }
  };

  const agentStatusBadge = (status: AgentStatus) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-emerald-600 text-white text-[10px]">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-amber-600 text-white text-[10px]">Pending</Badge>;
      case 'suspended':
        return <Badge variant="destructive" className="text-[10px]">Suspended</Badge>;
      default:
        return <Badge variant="secondary" className="text-[10px]">Rejected</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
            <Award className="h-7 w-7" />
            <span>Referrals &amp; Agent Program</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Approve registered customers as referral agents, configure guest discounts &amp; company/agent cost sharing, and manage payouts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadAll}>
            <RefreshCw className="h-4 w-4 mr-1.5" /> Refresh
          </Button>
          <Button size="sm" onClick={() => setIsEnableOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" /> Enable Customer as Agent
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Active Approved Agents</p>
            <p className="text-2xl font-bold mt-1">{kpis.activeAgents}</p>
            {kpis.pendingAgents > 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1">
                {kpis.pendingAgents} pending approval
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Referred Booking Sales</p>
            <p className="text-2xl font-bold mt-1">${kpis.totalSales.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Approved Payable Now</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">${kpis.payableNow.toFixed(2)}</p>
            <p className="text-[11px] text-muted-foreground mt-1">Pending review: ${kpis.pendingAmt.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Paid Out</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">${kpis.paidAmt.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="agents" className="gap-1.5">
            <Users className="h-4 w-4" />
            Agents &amp; Approvals
            {pendingCount > 0 && (
              <Badge className="ml-1 bg-amber-600 text-white text-[10px] px-1.5">{pendingCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="commissions" className="gap-1.5">
            <DollarSign className="h-4 w-4" />
            Commissions &amp; Payouts ({commissions.length})
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-1.5">
            <Settings className="h-4 w-4" />
            Rates &amp; Discount Sharing
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: AGENTS & APPROVALS */}
        <TabsContent value="agents">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Registered Referral Agents</CardTitle>
              <CardDescription>
                Only approved registered customers can share referral codes. Normal customers remain blocked until approved.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {agents.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  No agent applications or active agents yet. Click &quot;Enable Customer as Agent&quot; to approve a registered user.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer / Agent</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Effective Terms</TableHead>
                        <TableHead className="text-right">Clicks / Sales</TableHead>
                        <TableHead className="text-right">Net Payable / Paid</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {agents.map((a) => {
                        const r = a.effective_rules || settings;
                        const isCustom =
                          a.commission_value !== null || a.guest_discount_value !== null || a.discount_bear_mode !== null;
                        return (
                          <TableRow key={a.id}>
                            <TableCell>
                              <div className="font-semibold text-sm">{a.user_name}</div>
                              <div className="text-xs text-muted-foreground">{a.user_email}</div>
                              <div className="text-[11px] text-muted-foreground capitalize">
                                {a.agent_type.replace('_', ' ')}
                                {a.application_note ? ` — "${a.application_note}"` : ''}
                              </div>
                            </TableCell>
                            <TableCell>
                              {a.referral_code ? (
                                <Badge variant="outline" className="font-mono">{a.referral_code}</Badge>
                              ) : (
                                <span className="text-xs text-muted-foreground">Assigned on approval</span>
                              )}
                            </TableCell>
                            <TableCell className="text-xs">
                              <div>
                                Comm: <strong>{r.commission_value}{r.commission_type === 'percentage' ? '%' : ' USD'}</strong>
                                {' | '}
                                Guest: <strong>
                                  {r.guest_discount_type === 'none'
                                    ? '0'
                                    : `${r.guest_discount_value}${r.guest_discount_type === 'percentage' ? '%' : ' USD'}`}
                                </strong>
                              </div>
                              <div className="text-[11px] text-muted-foreground">
                                Bear: Co {100 - Number(r.agent_discount_share_percent)}% / Agent {Number(r.agent_discount_share_percent)}%
                                {isCustom && <Badge variant="secondary" className="ml-1.5 text-[9px]">Custom</Badge>}
                              </div>
                            </TableCell>
                            <TableCell className="text-right text-xs">
                              <div>{a.total_clicks} clicks / {a.total_referrals ?? 0} bookings</div>
                              <div className="text-muted-foreground">${Number(a.total_sales_generated || 0).toFixed(2)}</div>
                            </TableCell>
                            <TableCell className="text-right text-xs">
                              <div className="font-semibold text-blue-600 dark:text-blue-400">
                                ${(Number(a.pending_commission || 0) + Number(a.approved_commission || 0)).toFixed(2)} due
                              </div>
                              <div className="text-emerald-600 dark:text-emerald-400">
                                ${Number(a.paid_commission || 0).toFixed(2)} paid
                              </div>
                            </TableCell>
                            <TableCell>{agentStatusBadge(a.status)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {a.status === 'pending' && (
                                  <>
                                    <Button
                                      size="sm"
                                      className="h-7 px-2 text-xs bg-emerald-600 hover:bg-emerald-700"
                                      onClick={() => handleQuickAgentStatus(a, 'approved')}
                                    >
                                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      className="h-7 px-2 text-xs"
                                      onClick={() => handleQuickAgentStatus(a, 'rejected')}
                                    >
                                      <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                                    </Button>
                                  </>
                                )}
                                {a.status === 'approved' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-2 text-xs"
                                    onClick={() => handleQuickAgentStatus(a, 'suspended')}
                                    title="Suspend Agent"
                                  >
                                    <Ban className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                                {a.status === 'suspended' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-2 text-xs text-emerald-600"
                                    onClick={() => handleQuickAgentStatus(a, 'approved')}
                                  >
                                    Reactivate
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 text-xs"
                                  onClick={() => openEditAgent(a)}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: COMMISSIONS & PAYOUTS */}
        <TabsContent value="commissions">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg">Commission &amp; Cost-Sharing Ledger</CardTitle>
                <CardDescription>
                  Tracks guest discount split between company and agent for every referred booking.
                </CardDescription>
              </div>
              <Select value={commissionFilter} onValueChange={setCommissionFilter}>
                <SelectTrigger className="w-44 h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              {filteredCommissions.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">No commission records match this filter.</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Booking / Code</TableHead>
                        <TableHead>Agent</TableHead>
                        <TableHead>Guest</TableHead>
                        <TableHead className="text-right">Gross</TableHead>
                        <TableHead className="text-right">Guest Disc.</TableHead>
                        <TableHead className="text-right">Co. / Agent Bear</TableHead>
                        <TableHead className="text-right">Gross Comm.</TableHead>
                        <TableHead className="text-right">Net Payout</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCommissions.map((c) => (
                        <TableRow key={c.id} className="text-xs">
                          <TableCell>
                            <div className="font-mono font-semibold">#{c.booking_id}</div>
                            <Badge variant="outline" className="font-mono text-[10px] mt-0.5">{c.referral_code}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{c.agent_name}</div>
                            <div className="text-[11px] text-muted-foreground">{c.agent_email}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{c.guest_name}</div>
                            <div className="text-[11px] text-muted-foreground">{c.booking_status} • {c.tour_date}</div>
                          </TableCell>
                          <TableCell className="text-right">${Number(c.gross_amount).toFixed(2)}</TableCell>
                          <TableCell className="text-right text-amber-600 dark:text-amber-400">
                            -${Number(c.guest_discount_amount).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right text-[11px]">
                            <div>Co: ${Number(c.company_discount_share).toFixed(2)}</div>
                            <div className="text-muted-foreground">
                              Ag: ${Number(c.agent_discount_share).toFixed(2)} ({Number(c.agent_discount_share_percent)}%)
                            </div>
                          </TableCell>
                          <TableCell className="text-right">${Number(c.gross_commission_amount).toFixed(2)}</TableCell>
                          <TableCell className="text-right font-bold text-emerald-600 dark:text-emerald-400">
                            ${Number(c.net_commission_amount).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={c.status === 'cancelled' ? 'destructive' : c.status === 'pending' ? 'secondary' : 'default'}
                              className={
                                c.status === 'paid'
                                  ? 'bg-emerald-600 text-white text-[10px]'
                                  : c.status === 'approved'
                                  ? 'bg-blue-600 text-white text-[10px]'
                                  : 'text-[10px]'
                              }
                            >
                              {c.status}
                            </Badge>
                            {c.payout_reference && (
                              <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">{c.payout_reference}</div>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {c.status === 'pending' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2 text-xs"
                                  disabled={isUpdatingCommission}
                                  onClick={() => handleCommissionStatusChange(c.id, 'approved')}
                                >
                                  Approve
                                </Button>
                              )}
                              {(c.status === 'pending' || c.status === 'approved') && (
                                <Button
                                  size="sm"
                                  className="h-7 px-2 text-xs bg-emerald-600 hover:bg-emerald-700"
                                  onClick={() => {
                                    setPayingCommission(c);
                                    setPayoutRef('');
                                    setPayoutNotes('');
                                  }}
                                >
                                  <CreditCard className="h-3 w-3 mr-1" /> Pay
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: SETTINGS & LIVE COST-SHARING SIMULATOR */}
        <TabsContent value="settings">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Global Commission, Guest Discount &amp; Cost-Sharing Rules</CardTitle>
                <CardDescription>
                  Configure default rates for all approved agents (individual agents can also have custom overrides).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveSettings} className="space-y-6">
                  <div className="flex items-center justify-between p-3 rounded-xl border bg-muted/30">
                    <div>
                      <Label className="font-semibold">Enable Referral Program</Label>
                      <p className="text-xs text-muted-foreground">Allow approved agents to refer guests and earn commissions</p>
                    </div>
                    <Switch
                      checked={settings.program_enabled}
                      onCheckedChange={(v) => setSettings({ ...settings, program_enabled: v })}
                    />
                  </div>

                  {/* Referrer Commission */}
                  <div className="space-y-3 pt-2 border-t">
                    <h3 className="text-sm font-semibold">1. Referrer / Agent Commission</h3>
                    <div className="grid sm:grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Commission Type</Label>
                        <Select
                          value={settings.commission_type}
                          onValueChange={(v) => setSettings({ ...settings, commission_type: v as CommissionType })}
                        >
                          <SelectTrigger className="text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">Percentage (%)</SelectItem>
                            <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">
                          Commission Value ({settings.commission_type === 'percentage' ? '%' : '$'})
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max={settings.commission_type === 'percentage' ? 100 : undefined}
                          value={settings.commission_value}
                          onChange={(e) => setSettings({ ...settings, commission_value: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Calculated On</Label>
                        <Select
                          value={settings.commission_basis}
                          onValueChange={(v) => setSettings({ ...settings, commission_basis: v as 'gross' | 'net' })}
                        >
                          <SelectTrigger className="text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gross">Gross Booking Value</SelectItem>
                            <SelectItem value="net">Net Value (After Discount)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Guest Discount */}
                  <div className="space-y-3 pt-2 border-t">
                    <h3 className="text-sm font-semibold">2. New Guest Discount</h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Discount Type</Label>
                        <Select
                          value={settings.guest_discount_type}
                          onValueChange={(v) => setSettings({ ...settings, guest_discount_type: v as GuestDiscountType })}
                        >
                          <SelectTrigger className="text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Guest Discount</SelectItem>
                            <SelectItem value="percentage">Percentage (%)</SelectItem>
                            <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {settings.guest_discount_type !== 'none' && (
                        <div className="space-y-1.5">
                          <Label className="text-xs">
                            Discount Value ({settings.guest_discount_type === 'percentage' ? '%' : '$'})
                          </Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max={settings.guest_discount_type === 'percentage' ? 100 : undefined}
                            value={settings.guest_discount_value}
                            onChange={(e) =>
                              setSettings({ ...settings, guest_discount_value: parseFloat(e.target.value) || 0 })
                            }
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cost Sharing Split */}
                  <div className="space-y-3 pt-2 border-t">
                    <h3 className="text-sm font-semibold">3. Who Bears the Guest Discount? (Cost Sharing)</h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Bearing Mode</Label>
                        <Select
                          value={settings.discount_bear_mode}
                          onValueChange={(v) => {
                            const mode = v as DiscountBearMode;
                            setSettings({
                              ...settings,
                              discount_bear_mode: mode,
                              agent_discount_share_percent:
                                mode === 'company' ? 0 : mode === 'agent' ? 100 : settings.agent_discount_share_percent || 50,
                            });
                          }}
                        >
                          <SelectTrigger className="text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="company">Company Bears 100%</SelectItem>
                            <SelectItem value="split">Split Between Company &amp; Agent (e.g. 50/50)</SelectItem>
                            <SelectItem value="agent">Agent Bears 100% (Deducted from Commission)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {settings.discount_bear_mode === 'split' && (
                        <div className="space-y-1.5">
                          <Label className="text-xs">Agent Share of Discount (%)</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="1"
                            value={settings.agent_discount_share_percent}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                agent_discount_share_percent: Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)),
                              })
                            }
                          />
                          <p className="text-[11px] text-muted-foreground">
                            Company bears {100 - settings.agent_discount_share_percent}% • Agent bears {settings.agent_discount_share_percent}%
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Workflow Options */}
                  <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Minimum Booking Value ($)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={settings.min_booking_amount}
                        onChange={(e) => setSettings({ ...settings, min_booking_amount: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl border bg-muted/20">
                      <div>
                        <Label className="text-xs font-semibold">Auto-Approve Commission on Confirm</Label>
                        <p className="text-[11px] text-muted-foreground">Approve commission when booking is confirmed</p>
                      </div>
                      <Switch
                        checked={settings.auto_approve_on_booking_confirm}
                        onCheckedChange={(v) => setSettings({ ...settings, auto_approve_on_booking_confirm: v })}
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={isSavingSettings}>
                    {isSavingSettings && <LoaderCircle className="h-4 w-4 animate-spin mr-1.5" />}
                    Save Global Referral Rules
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Live Example Simulator */}
            <Card className="border-primary/30 bg-primary/5 h-fit">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-primary" />
                  <span>Live Split Simulator</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Preview the exact math with your current rules
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <Label className="text-xs">Sample Booking Value ($)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={simulatorAmount}
                    onChange={(e) => setSimulatorAmount(parseFloat(e.target.value) || 0)}
                    className="bg-card font-mono font-bold"
                  />
                </div>

                <div className="space-y-2 p-3.5 rounded-xl bg-card border">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gross Booking</span>
                    <span className="font-semibold">${simulator.gross.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Guest Discount</span>
                    <span>-${simulator.guestDiscount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t pt-1.5">
                    <span>Guest Pays</span>
                    <span>${simulator.netBooking.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-2 p-3.5 rounded-xl bg-card border">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gross Agent Commission</span>
                    <span className="font-semibold">${simulator.grossCommission.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-amber-600 dark:text-amber-400">
                    <span>Agent Discount Share ({simulator.agentSharePct}%)</span>
                    <span>-${simulator.agentDiscountShare.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Company Discount Share ({100 - simulator.agentSharePct}%)</span>
                    <span>-${simulator.companyDiscountShare.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t pt-1.5 text-primary">
                    <span>Agent Net Commission</span>
                    <span>${simulator.netCommission.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-muted-foreground">
                    <span>Company Net Revenue</span>
                    <span>${simulator.companyNetRevenue.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Enable Registered Customer Modal */}
      <Dialog open={isEnableOpen} onOpenChange={setIsEnableOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enable Customer as Referral Agent</DialogTitle>
            <DialogDescription>
              Select a registered user to immediately activate them as an approved referral partner.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEnableCustomerSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Registered Customer</Label>
              <Select
                value={enableForm.user_id}
                onValueChange={(v) => setEnableForm({ ...enableForm, user_id: v })}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Select a registered user..." />
                </SelectTrigger>
                <SelectContent>
                  {nonAgentUsers.length === 0 ? (
                    <SelectItem value="none" disabled>All users are already in the agent list</SelectItem>
                  ) : (
                    nonAgentUsers.map((u) => (
                      <SelectItem key={u.id} value={String(u.id)}>
                        {u.name} ({u.email})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Partner Type</Label>
              <Select
                value={enableForm.agent_type}
                onValueChange={(v) => setEnableForm({ ...enableForm, agent_type: v })}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer_agent">Customer Ambassador</SelectItem>
                  <SelectItem value="tour_guide">Tour Guide / Chauffeur</SelectItem>
                  <SelectItem value="hotel_partner">Hotel / Villa Partner</SelectItem>
                  <SelectItem value="travel_agent">Travel Agent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Custom Referral Code (Optional)</Label>
              <Input
                placeholder="Leave blank to auto-generate (e.g. KASUN)"
                className="uppercase font-mono"
                value={enableForm.referral_code}
                onChange={(e) => setEnableForm({ ...enableForm, referral_code: e.target.value.toUpperCase() })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEnableOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isEnabling}>
                {isEnabling && <LoaderCircle className="h-4 w-4 animate-spin mr-1.5" />}
                Approve &amp; Enable
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Agent & Per-Agent Rate Overrides Modal */}
      <Dialog open={!!editingAgent} onOpenChange={(open) => !open && setEditingAgent(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Agent: {editingAgent?.user_name}</DialogTitle>
            <DialogDescription>
              Edit referral code, status, or assign custom commission &amp; discount-sharing rates for this agent.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveEditAgent} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Status</Label>
                <Select
                  value={editAgentForm.status}
                  onValueChange={(v) => setEditAgentForm({ ...editAgentForm, status: v as AgentStatus })}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Referral Code</Label>
                <Input
                  className="uppercase font-mono text-xs"
                  value={editAgentForm.referral_code}
                  onChange={(e) => setEditAgentForm({ ...editAgentForm, referral_code: e.target.value.toUpperCase() })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border bg-muted/20">
              <div>
                <Label className="text-xs font-semibold">Override Global Rates for This Agent</Label>
                <p className="text-[11px] text-muted-foreground">When disabled, agent inherits global settings</p>
              </div>
              <Switch
                checked={editAgentForm.use_custom_rates}
                onCheckedChange={(v) => setEditAgentForm({ ...editAgentForm, use_custom_rates: v })}
              />
            </div>

            {editAgentForm.use_custom_rates && (
              <div className="space-y-3 p-3.5 rounded-xl border bg-muted/10">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Commission Type</Label>
                    <Select
                      value={editAgentForm.commission_type}
                      onValueChange={(v) => setEditAgentForm({ ...editAgentForm, commission_type: v as CommissionType })}
                    >
                      <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="fixed">Fixed ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Commission Value</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editAgentForm.commission_value}
                      onChange={(e) => setEditAgentForm({ ...editAgentForm, commission_value: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Guest Discount Type</Label>
                    <Select
                      value={editAgentForm.guest_discount_type}
                      onValueChange={(v) => setEditAgentForm({ ...editAgentForm, guest_discount_type: v as GuestDiscountType })}
                    >
                      <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="fixed">Fixed ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Guest Discount Value</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editAgentForm.guest_discount_value}
                      onChange={(e) => setEditAgentForm({ ...editAgentForm, guest_discount_value: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Discount Bear Mode</Label>
                    <Select
                      value={editAgentForm.discount_bear_mode}
                      onValueChange={(v) => setEditAgentForm({ ...editAgentForm, discount_bear_mode: v as DiscountBearMode })}
                    >
                      <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="company">Company 100%</SelectItem>
                        <SelectItem value="split">Split %</SelectItem>
                        <SelectItem value="agent">Agent 100%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {editAgentForm.discount_bear_mode === 'split' && (
                    <div className="space-y-1">
                      <Label className="text-xs">Agent Share (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={editAgentForm.agent_discount_share_percent}
                        onChange={(e) =>
                          setEditAgentForm({
                            ...editAgentForm,
                            agent_discount_share_percent: Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)),
                          })
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingAgent(null)}>Cancel</Button>
              <Button type="submit" disabled={isSavingAgent}>
                {isSavingAgent && <LoaderCircle className="h-4 w-4 animate-spin mr-1.5" />}
                Save Agent
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Mark Payout Paid Modal */}
      <Dialog open={!!payingCommission} onOpenChange={(open) => !open && setPayingCommission(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Agent Commission Payout</DialogTitle>
            <DialogDescription>
              Mark commission #{payingCommission?.id} (${Number(payingCommission?.net_commission_amount || 0).toFixed(2)} to{' '}
              {payingCommission?.agent_name}) as Paid.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Bank Transfer / Payout Reference</Label>
              <Input
                placeholder="e.g. TXN-2026-9912"
                value={payoutRef}
                onChange={(e) => setPayoutRef(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Payout Notes (Optional)</Label>
              <Input
                placeholder="e.g. Settled via Commercial Bank transfer"
                value={payoutNotes}
                onChange={(e) => setPayoutNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setPayingCommission(null)}>Cancel</Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={isUpdatingCommission}
              onClick={() =>
                payingCommission &&
                handleCommissionStatusChange(payingCommission.id, 'paid', payoutRef.trim(), payoutNotes.trim())
              }
            >
              {isUpdatingCommission && <LoaderCircle className="h-4 w-4 animate-spin mr-1.5" />}
              Confirm Payout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
