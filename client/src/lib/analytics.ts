'use client';

// Declare global types for gtag and fbq
declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    _fbq?: any;
  }
}

export interface AnalyticsConfig {
  google_analytics_id?: string;
  meta_pixel_id?: string;
  gtm_id?: string;
  is_ga_enabled: boolean;
  is_pixel_enabled: boolean;
  exclude_admin_traffic: boolean;
  enable_ecommerce_events: boolean;
}

/**
 * 1. Page View Tracking
 */
export function trackPageView(url: string, title?: string) {
  if (typeof window === 'undefined') return;

  // 1. Google Analytics
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_path: url,
      page_title: title || document.title,
    });
  }

  // 2. Meta Pixel
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'PageView');
  }
}

/**
 * 2. View Content / Tour Package Viewed
 */
export function trackViewTour(params: {
  id: string | number;
  name: string;
  price?: number;
  category?: string;
}) {
  if (typeof window === 'undefined') return;

  const value = params.price || 150;

  // Google Analytics 4 (view_item)
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'view_item', {
      currency: 'USD',
      value: value,
      items: [
        {
          item_id: String(params.id),
          item_name: params.name,
          item_category: params.category || 'Tour Package',
          price: value,
          quantity: 1,
        },
      ],
    });
  }

  // Meta Pixel (ViewContent)
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'ViewContent', {
      content_ids: [String(params.id)],
      content_name: params.name,
      content_type: 'product',
      value: value,
      currency: 'USD',
    });
  }
}

/**
 * 3. Initiate Checkout / Booking Dialog Opened
 */
export function trackInitiateBooking(params: {
  id: string | number;
  name: string;
  pricePerPerson?: number;
  guests?: number;
}) {
  if (typeof window === 'undefined') return;

  const guests = params.guests || 1;
  const unitPrice = params.pricePerPerson || 150;
  const estimatedTotal = unitPrice * guests;

  // Google Analytics 4 (begin_checkout)
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'begin_checkout', {
      currency: 'USD',
      value: estimatedTotal,
      items: [
        {
          item_id: String(params.id),
          item_name: params.name,
          price: unitPrice,
          quantity: guests,
        },
      ],
    });
  }

  // Meta Pixel (InitiateCheckout)
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'InitiateCheckout', {
      content_ids: [String(params.id)],
      content_name: params.name,
      content_type: 'product',
      value: estimatedTotal,
      currency: 'USD',
      num_items: guests,
    });
  }
}

/**
 * 4. Purchase / Schedule / Booking Form Submitted
 */
export function trackBookingSuccess(params: {
  bookingId: string | number;
  tourName: string;
  tourId?: string | number;
  totalValue?: number;
  guests?: number;
  currency?: string;
}) {
  if (typeof window === 'undefined') return;

  const value = params.totalValue || (params.guests ? params.guests * 150 : 150);
  const currency = params.currency || 'USD';

  // Google Analytics 4 (purchase)
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'purchase', {
      transaction_id: String(params.bookingId),
      value: value,
      currency: currency,
      items: [
        {
          item_id: String(params.tourId || params.bookingId),
          item_name: params.tourName,
          price: value,
          quantity: params.guests || 1,
        },
      ],
    });
  }

  // Meta Pixel (Schedule & Purchase)
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'Schedule', {
      content_name: params.tourName,
      status: 'confirmed',
      value: value,
      currency: currency,
    });

    window.fbq('track', 'Purchase', {
      content_name: params.tourName,
      content_ids: [String(params.tourId || params.bookingId)],
      content_type: 'product',
      value: value,
      currency: currency,
      num_items: params.guests || 1,
    });
  }
}

/**
 * 5. Lead / Inquiry Form Submitted (Contact Form or Bespoke Tour)
 */
export function trackLeadSubmission(params: {
  leadType: 'contact_form' | 'bespoke_proposal' | 'reschedule_request';
  name?: string;
  category?: string;
}) {
  if (typeof window === 'undefined') return;

  // Google Analytics 4 (generate_lead)
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'generate_lead', {
      event_category: 'Lead',
      event_label: params.leadType,
      lead_type: params.leadType,
    });
  }

  // Meta Pixel (Lead)
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'Lead', {
      content_name: params.leadType,
      content_category: params.category || 'Travel Inquiry',
    });
  }
}

/**
 * 6. Contact Action / WhatsApp Click
 */
export function trackContactClick(params: {
  channel: 'whatsapp' | 'email' | 'phone';
  source: string;
}) {
  if (typeof window === 'undefined') return;

  // Google Analytics 4 (contact)
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'contact_click', {
      event_category: 'Engagement',
      channel: params.channel,
      source: params.source,
    });
  }

  // Meta Pixel (Contact)
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'Contact', {
      content_name: `${params.channel}_click`,
      content_category: params.source,
    });
  }
}
