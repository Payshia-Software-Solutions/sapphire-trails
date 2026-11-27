export type CommissionType = 'percentage' | 'fixed';
export type GuestDiscountType = 'none' | 'percentage' | 'fixed';
export type DiscountBearMode = 'company' | 'split' | 'agent';
export type AgentStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
export type CommissionStatus = 'pending' | 'approved' | 'paid' | 'cancelled';

export interface ReferralSettings {
  program_enabled: boolean;
  commission_type: CommissionType;
  commission_value: number;
  commission_basis: 'gross' | 'net';
  guest_discount_type: GuestDiscountType;
  guest_discount_value: number;
  discount_bear_mode: DiscountBearMode;
  agent_discount_share_percent: number;
  min_booking_amount: number;
  attribution_days: number;
  require_admin_approval: boolean;
  auto_approve_on_booking_confirm: boolean;
}

export interface ReferralAgent {
  id: number;
  user_id: number;
  referral_code: string | null;
  status: AgentStatus;
  agent_type: string;
  application_note?: string | null;
  admin_note?: string | null;
  commission_type?: CommissionType | null;
  commission_value?: number | null;
  guest_discount_type?: GuestDiscountType | null;
  guest_discount_value?: number | null;
  discount_bear_mode?: DiscountBearMode | null;
  agent_discount_share_percent?: number | null;
  total_clicks: number;
  approved_by?: number | null;
  approved_at?: string | null;
  created_at?: string;
  user_name?: string;
  user_email?: string;
  user_phone?: string;
  user_type?: string;
  total_referrals?: number;
  total_sales_generated?: number;
  pending_commission?: number;
  approved_commission?: number;
  paid_commission?: number;
  effective_rules?: ReferralSettings;
}

export interface ReferralCommission {
  id: number;
  agent_id: number;
  user_id: number;
  booking_id: number;
  referral_code: string;
  gross_amount: number;
  guest_discount_amount: number;
  net_booking_amount: number;
  company_discount_share: number;
  agent_discount_share: number;
  gross_commission_amount: number;
  net_commission_amount: number;
  commission_type: string;
  commission_rate: number;
  guest_discount_type: string;
  guest_discount_rate: number;
  discount_bear_mode: string;
  agent_discount_share_percent: number;
  status: CommissionStatus;
  payout_reference?: string | null;
  payout_notes?: string | null;
  paid_at?: string | null;
  created_at: string;
  agent_name?: string;
  agent_email?: string;
  guest_name?: string;
  guest_first_name?: string;
  guest_email?: string;
  tour_date?: string;
  booking_status?: string;
  tour_title?: string;
  invoice_number?: string | null;
  invoice_payment_status?: string | null;
}

export interface ReferralValidationResult {
  valid: boolean;
  code?: string;
  agent_name?: string;
  eligible?: boolean;
  min_booking_amount?: number;
  guest_discount_type?: GuestDiscountType;
  guest_discount_value?: number;
  gross_amount?: number;
  guest_discount_amount?: number;
  net_booking_amount?: number;
  error?: string;
}

const REFERRAL_STORAGE_KEY = 'sapphire_referral_attribution';

export function saveAttributedReferralCode(code: string, days = 30): void {
  if (typeof window === 'undefined' || !code.trim()) return;
  const expiresAt = Date.now() + days * 24 * 60 * 60 * 1000;
  localStorage.setItem(
    REFERRAL_STORAGE_KEY,
    JSON.stringify({ code: code.trim().toUpperCase(), expiresAt })
  );
}

export function getAttributedReferralCode(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(REFERRAL_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.code) return null;
    if (parsed.expiresAt && Date.now() > Number(parsed.expiresAt)) {
      localStorage.removeItem(REFERRAL_STORAGE_KEY);
      return null;
    }
    return String(parsed.code);
  } catch {
    return null;
  }
}

export function clearAttributedReferralCode(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(REFERRAL_STORAGE_KEY);
  }
}

/**
 * Client-side preview calculator matching the backend Referral::calculateBreakdown math
 */
export function calculateReferralPreview(grossAmount: number, settings: Partial<ReferralSettings>) {
  const gross = Math.max(0, Number(grossAmount) || 0);
  const commType = settings.commission_type || 'percentage';
  const commVal = Math.max(0, Number(settings.commission_value ?? 10));
  const commBasis = settings.commission_basis || 'gross';
  const discType = settings.guest_discount_type || 'percentage';
  const discVal = Math.max(0, Number(settings.guest_discount_value ?? 5));
  const bearMode = settings.discount_bear_mode || 'split';

  let agentSharePct = Number(settings.agent_discount_share_percent ?? 50);
  if (bearMode === 'company') agentSharePct = 0;
  if (bearMode === 'agent') agentSharePct = 100;
  agentSharePct = Math.min(100, Math.max(0, agentSharePct));

  let guestDiscount = 0;
  if (discType === 'percentage') guestDiscount = Math.round(gross * (discVal / 100) * 100) / 100;
  if (discType === 'fixed') guestDiscount = Math.round(discVal * 100) / 100;
  guestDiscount = Math.min(gross, Math.max(0, guestDiscount));

  const netBooking = Math.max(0, Math.round((gross - guestDiscount) * 100) / 100);
  const commBase = commBasis === 'net' ? netBooking : gross;

  let grossCommission = 0;
  if (commType === 'percentage') grossCommission = Math.round(commBase * (commVal / 100) * 100) / 100;
  if (commType === 'fixed') grossCommission = Math.round(commVal * 100) / 100;

  const agentDiscountShare = Math.round(guestDiscount * (agentSharePct / 100) * 100) / 100;
  const companyDiscountShare = Math.round((guestDiscount - agentDiscountShare) * 100) / 100;
  const netCommission = Math.max(0, Math.round((grossCommission - agentDiscountShare) * 100) / 100);
  const companyNetRevenue = Math.max(0, Math.round((netBooking - netCommission) * 100) / 100);

  return {
    gross,
    guestDiscount,
    netBooking,
    grossCommission,
    agentDiscountShare,
    companyDiscountShare,
    netCommission,
    companyNetRevenue,
    agentSharePct,
  };
}
