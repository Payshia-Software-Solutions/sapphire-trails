'use client';

import { API_BASE_URL } from '@/lib/utils';
import { authFetch } from '@/lib/api';

export interface SubscriberItem {
  id: string | number;
  email: string;
  source: string;
  subscribedAt: string;
  status: 'active' | 'unsubscribed';
}

export interface BroadcastLog {
  id: string;
  subject: string;
  sentAt: string;
  recipientCount: number;
  status: 'sent' | 'failed';
}

export const initialSubscribers: SubscriberItem[] = [
  {
    id: 'sub-1',
    email: 'alexander.wright@londonheritage.co.uk',
    source: '2026 Gem Buyer Guide Download',
    subscribedAt: '2026-02-28T14:20:00Z',
    status: 'active',
  },
  {
    id: 'sub-2',
    email: 'marcus.weber@mineralien-munich.de',
    source: '2026 Gem Buyer Guide Download',
    subscribedAt: '2026-02-27T10:15:00Z',
    status: 'active',
  },
  {
    id: 'sub-3',
    email: 'jessica.chen@sydneyluxury.com.au',
    source: 'Homepage Lead Magnet',
    subscribedAt: '2026-02-26T18:45:00Z',
    status: 'active',
  }
];

const SUBSCRIBERS_STORAGE_KEY = 'sapphire_trails_subscribers_v1';
const BROADCAST_STORAGE_KEY = 'sapphire_trails_broadcasts_v1';

export function getStoredSubscribers(): SubscriberItem[] {
  if (typeof window === 'undefined') return initialSubscribers;
  try {
    const raw = localStorage.getItem(SUBSCRIBERS_STORAGE_KEY);
    if (!raw) {
      return initialSubscribers;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : initialSubscribers;
  } catch {
    return initialSubscribers;
  }
}

export function saveStoredSubscribers(subscribers: SubscriberItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SUBSCRIBERS_STORAGE_KEY, JSON.stringify(subscribers));
  } catch (e) {
    console.error('Failed to save subscribers', e);
  }
}

export function addSubscriber(email: string, source: string = '2026 Gem Buyer Guide Download'): void {
  const current = getStoredSubscribers();
  const normalized = email.trim().toLowerCase();
  
  const existing = current.find(s => s.email.toLowerCase() === normalized);
  if (existing) {
    if (existing.status === 'unsubscribed') {
      existing.status = 'active';
      saveStoredSubscribers(current);
    }
    return;
  }

  const newItem: SubscriberItem = {
    id: `sub-${Date.now()}`,
    email: normalized,
    source,
    subscribedAt: new Date().toISOString(),
    status: 'active',
  };

  saveStoredSubscribers([newItem, ...current]);
}

export function getStoredBroadcasts(): BroadcastLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(BROADCAST_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveBroadcastLog(broadcast: BroadcastLog): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getStoredBroadcasts();
    localStorage.setItem(BROADCAST_STORAGE_KEY, JSON.stringify([broadcast, ...current]));
  } catch (e) {
    console.error('Failed to save broadcast log', e);
  }
}

/**
 * Fetch subscribers from live database with fallback to localStorage
 */
export async function fetchSubscribersFromServer(): Promise<SubscriberItem[]> {
  try {
    const response = await authFetch(`${API_BASE_URL}/subscribers`);
    if (!response.ok) {
      throw new Error(`Failed with status ${response.status}`);
    }
    const data = await response.json();
    if (Array.isArray(data)) {
      const mapped: SubscriberItem[] = data.map((item: any) => ({
        id: item.id,
        email: item.email,
        source: item.source || 'Website Subscription',
        subscribedAt: item.created_at || new Date().toISOString(),
        status: (item.status === 'unsubscribed' ? 'unsubscribed' : 'active') as 'active' | 'unsubscribed',
      }));
      saveStoredSubscribers(mapped);
      return mapped;
    }
  } catch (err) {
    console.warn('[fetchSubscribersFromServer] Falling back to local cache:', err);
  }
  return getStoredSubscribers();
}

/**
 * Add a new subscriber to the server database
 */
export async function createSubscriberOnServer(email: string, source: string): Promise<SubscriberItem> {
  const response = await authFetch(`${API_BASE_URL}/subscribers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim(), source: source.trim() }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to save subscriber on server.');
  }

  const result = await response.json();
  const sub = result.subscriber || result.data;
  return {
    id: sub?.id || `sub-${Date.now()}`,
    email: sub?.email || email.trim().toLowerCase(),
    source: sub?.source || source,
    subscribedAt: sub?.created_at || new Date().toISOString(),
    status: (sub?.status === 'unsubscribed' ? 'unsubscribed' : 'active') as 'active' | 'unsubscribed',
  };
}

/**
 * Toggle or update subscriber status on the server
 */
export async function updateSubscriberStatusOnServer(id: string | number, status: 'active' | 'unsubscribed'): Promise<void> {
  const response = await authFetch(`${API_BASE_URL}/subscribers/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error('Failed to update subscriber status on server.');
  }
}

/**
 * Delete a subscriber from the server database
 */
export async function deleteSubscriberOnServer(id: string | number): Promise<void> {
  const response = await authFetch(`${API_BASE_URL}/subscribers/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete subscriber from server.');
  }
}

/**
 * Dispatch mass broadcast newsletter to all active subscribers via server Mailer
 */
export async function sendBroadcastOnServer(payload: { subject: string; message: string; preheader?: string }): Promise<any> {
  const response = await authFetch(`${API_BASE_URL}/subscribers/broadcast`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to send broadcast from server.');
  }

  return response.json();
}
