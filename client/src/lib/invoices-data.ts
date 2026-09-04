export interface InvoiceItem {
  id?: number;
  invoice_id?: number;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  sort_order?: number;
}

export type PaymentStatus = 'unpaid' | 'partially_paid' | 'paid' | 'refunded' | 'cancelled';

export interface Invoice {
  id: number;
  invoice_number: string;
  booking_id?: number | null;
  user_id?: number | null;
  customer_name: string;
  customer_email: string;
  customer_phone?: string | null;
  customer_address?: string | null;
  tour_title?: string | null;
  tour_date?: string | null;
  booking_tour_date?: string | null;
  booking_end_date?: string | null;
  booking_guests?: number | null;
  currency: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  amount_paid: number;
  balance_due: number;
  payment_status: PaymentStatus;
  payment_method?: string | null;
  issue_date: string;
  due_date?: string | null;
  notes?: string | null;
  bank_details?: string | null;
  created_at?: string;
  updated_at?: string;
  items: InvoiceItem[];
}

export const DEFAULT_BANK_DETAILS = `Bank Name: Commercial Bank of Ceylon
Account Name: Sapphire Trails (Pvt) Ltd
Account Number: 8001 2345 6789
Branch: Ratnapura City Branch (Branch Code: 042)
SWIFT / BIC: CCEYLKLX
Reference: Please include your Invoice Number in the transfer remarks.`;

export const DEFAULT_INVOICE_NOTES = `Thank you for choosing Sapphire Trails.
- Full payment is required 48 hours prior to tour departure unless cash on arrival was confirmed.
- Free rescheduling available up to 72 hours prior to scheduled tour time.
- All tours include private VIP transportation, licensed gemologist guide, and mining permits.`;

export const formatCurrency = (amount: number | string, currency: string = 'USD'): string => {
  const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  return `${currency} ${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const mapServerInvoiceToClient = (raw: any): Invoice => ({
  id: Number(raw.id),
  invoice_number: raw.invoice_number,
  booking_id: raw.booking_id ? Number(raw.booking_id) : null,
  user_id: raw.user_id ? Number(raw.user_id) : null,
  customer_name: raw.customer_name || '',
  customer_email: raw.customer_email || '',
  customer_phone: raw.customer_phone || '',
  customer_address: raw.customer_address || '',
  tour_title: raw.tour_title || '',
  tour_date: raw.tour_date || null,
  booking_tour_date: raw.booking_tour_date || null,
  booking_end_date: raw.booking_end_date || null,
  booking_guests: raw.booking_guests ? Number(raw.booking_guests) : null,
  currency: raw.currency || 'USD',
  subtotal: parseFloat(raw.subtotal) || 0,
  discount_amount: parseFloat(raw.discount_amount) || 0,
  tax_amount: parseFloat(raw.tax_amount) || 0,
  total_amount: parseFloat(raw.total_amount) || 0,
  amount_paid: parseFloat(raw.amount_paid) || 0,
  balance_due: parseFloat(raw.balance_due) || 0,
  payment_status: raw.payment_status || 'unpaid',
  payment_method: raw.payment_method || 'Bank Transfer',
  issue_date: raw.issue_date || new Date().toISOString().split('T')[0],
  due_date: raw.due_date || null,
  notes: raw.notes || '',
  bank_details: raw.bank_details || '',
  created_at: raw.created_at,
  updated_at: raw.updated_at,
  items: (raw.items || []).map((item: any, idx: number) => ({
    id: item.id ? Number(item.id) : undefined,
    invoice_id: item.invoice_id ? Number(item.invoice_id) : undefined,
    description: item.description || '',
    quantity: parseFloat(item.quantity) || 1,
    unit_price: parseFloat(item.unit_price) || 0,
    total_price: parseFloat(item.total_price) || 0,
    sort_order: item.sort_order ? Number(item.sort_order) : idx + 1,
  })),
});
