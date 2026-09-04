
export interface Booking {
  id: number;
  user_id?: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  tourType: number;
  tourTitle?: string;
  tourImage?: string;
  tourSlug?: string;
  adults?: number;
  children?: number;
  guests: number;
  date: string; // YYYY-MM-DD
  end_date?: string; // YYYY-MM-DD
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'confirmed' | 'rescheduled' | 'completed' | 'cancelled';
  booking_source?: 'website' | 'airbnb' | 'booking_com' | 'agoda' | 'other' | string;
  external_booking_id?: string;
  reschedule_reason?: string;
  original_tour_date?: string;
  rescheduled_at?: string;
  invoice_id?: number | null;
  invoice_number?: string | null;
  invoice_payment_status?: 'unpaid' | 'partially_paid' | 'paid' | 'refunded' | 'cancelled' | null;
  invoice_total?: number | null;
  admin_notes?: string | null;
}

export interface PackageICalFeed {
  id: number;
  tour_package_id: number;
  tour_title?: string;
  platform: 'airbnb' | 'booking_com' | 'agoda' | 'other' | string;
  feed_name?: string;
  feed_url: string;
  last_synced_at?: string;
  sync_status: 'pending' | 'success' | 'error';
  last_error_message?: string;
  created_at?: string;
}

export const mockBookings: Booking[] = [];

