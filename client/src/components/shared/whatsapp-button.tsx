'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { MessageSquare } from 'lucide-react';
import { trackContactClick } from '@/lib/analytics';
import { useSiteContent, getWhatsappUrl } from '@/lib/site-content';

export function WhatsAppButton() {
  const { content } = useSiteContent();
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Determine visibility based on path
    const isExcludedPage = pathname.startsWith('/admin') || pathname.startsWith('/invoices');
    setIsVisible(!isExcludedPage);
  }, [pathname]);

  const whatsappUrl = getWhatsappUrl(content);

  if (!isVisible) {
    return null;
  }

  return (
    <Link
      href={whatsappUrl}
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
