'use client';

export interface SubscriberItem {
  id: string;
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
  },
  {
    id: 'sub-4',
    email: 'elena.rostova@gemcollector-ch.ch',
    source: '2026 Gem Buyer Guide Download',
    subscribedAt: '2026-02-25T09:30:00Z',
    status: 'active',
  },
  {
    id: 'sub-5',
    email: 'jeanpierre.laurent@parisgemology.fr',
    source: '2026 Gem Buyer Guide Download',
    subscribedAt: '2026-02-24T16:10:00Z',
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
      localStorage.setItem(SUBSCRIBERS_STORAGE_KEY, JSON.stringify(initialSubscribers));
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
