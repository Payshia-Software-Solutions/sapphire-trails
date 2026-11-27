'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { API_BASE_URL } from '@/lib/utils';
import { saveAttributedReferralCode } from '@/lib/referrals-data';

const CLICK_SESSION_PREFIX = 'sapphire_ref_clicked_';

export function ReferralTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref')?.trim().toUpperCase();
    if (!ref || ref.length < 3) return;

    saveAttributedReferralCode(ref, 30);

    const sessionKey = `${CLICK_SESSION_PREFIX}${ref}`;
    if (!sessionStorage.getItem(sessionKey)) {
      sessionStorage.setItem(sessionKey, '1');
      fetch(`${API_BASE_URL}/referrals/track-click/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: ref }),
      }).catch(() => {});
    }
  }, [pathname]);

  return null;
}
