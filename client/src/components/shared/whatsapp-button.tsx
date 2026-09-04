
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { MessageSquare } from 'lucide-react';
import { trackContactClick } from '@/lib/analytics';

const CMS_DATA_KEY = 'sapphire-cms-data';
const DEFAULT_WHATSAPP_NUMBER = '94712357700';

export function WhatsAppButton() {
  const [whatsappNumber, setWhatsappNumber] = useState(DEFAULT_WHATSAPP_NUMBER);
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Determine visibility based on path
    const isExcludedPage = pathname.startsWith('/admin') || pathname.startsWith('/invoices');
    setIsVisible(!isExcludedPage);

    // Fetch number from local storage to allow override
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
      onClick={() => trackContactClick({ channel: 'whatsapp', source: 'floating_concierge' })}
      className={cn(
        "fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform duration-300 hover:scale-110",
        "animate-in fade-in-0 zoom-in-95 print:hidden"
      )}
      aria-label="Chat with us"
    >
      <MessageSquare className="h-8 w-8" fill="currentColor" />
    </Link>
  );
}
