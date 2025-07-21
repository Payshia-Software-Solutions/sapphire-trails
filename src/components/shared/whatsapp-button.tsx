
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

const CMS_DATA_KEY = 'sapphire-cms-data';

const WhatsAppIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className="h-8 w-8"
    fill="currentColor"
  >
    <path d="M16.75 13.96c.25.13.41.2.52.34.11.14.16.32.16.52s-.05.4-.16.54a.76.76 0 01-.52.34c-.11.05-.28.07-1.14.07-.48 0-1.13-.13-1.75-.37s-1.13-.56-1.58-.93a8.1 8.1 0 01-1.25-1.52c-.22-.32-.4-.6-.54-1.03-.13-.43-.2-.82-.2-1.15 0-.19.01-.4.04-.63.03-.23.04-.38.04-.42a.53.53 0 01.2-.42c.1-.1.25-.13.4-.13h.1c.1 0 .22.01.34.01.12 0 .24.01.3.01s.14.04.2.13c.05.1.1.28.1.5s-.05.47-.1.7c-.05.23-.1.45-.1.52s0 .18.06.27a4.99 4.99 0 001.03 1.25c.34.4.73.72 1.18.96.46.25.82.37 1.08.37.1 0 .19-.01.27-.04a.7.7 0 00.34-.23c.09-.12.16-.3.2-.52.04-.22.04-.4.04-.52s-.01-.22-.04-.3-.07-.14-.13-.2a.45.45 0 00-.3-.13c-.1 0-.2.01-.25.04zM12 2a10 10 0 00-10 10 10 10 0 005.02 8.65L2 22l1.35-4.98A10 10 0 0012 22a10 10 0 0010-10 10 10 0 00-10-10z" />
  </svg>
);

export function WhatsAppButton() {
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Determine visibility based on path
    const isAdminPage = pathname.startsWith('/admin');
    setIsVisible(!isAdminPage);

    // Fetch number from local storage
    try {
      const storedDataRaw = localStorage.getItem(CMS_DATA_KEY);
      if (storedDataRaw) {
        const storedData = JSON.parse(storedDataRaw);
        if (storedData.general?.whatsappNumber) {
          setWhatsappNumber(storedData.general.whatsappNumber);
        }
      }
    } catch (error) {
      console.error("Failed to load WhatsApp number from storage", error);
    }
  }, [pathname]);

  if (!isVisible || !whatsappNumber) {
    return null;
  }

  return (
    <Link
      href={`https://wa.me/${whatsappNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform duration-300 hover:scale-110",
        "animate-in fade-in-0 zoom-in-95"
      )}
      aria-label="Chat on WhatsApp"
    >
      <WhatsAppIcon />
    </Link>
  );
}
