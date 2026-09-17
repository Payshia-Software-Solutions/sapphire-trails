'use client';

import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSiteContent, getContactPhone, getWhatsappUrl } from '@/lib/site-content';

export function ArticleConciergeBox() {
  const { content } = useSiteContent();
  const phone = getContactPhone(content);
  const whatsappUrl = getWhatsappUrl(content, 'Hello Sapphire Trails Concierge, I have a question regarding an article on your website.');

  return (
    <div className="p-6 rounded-2xl bg-background-alt border border-border/80 space-y-3">
      <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
        <MessageCircle className="h-4 w-4 text-emerald-500" />
        <span>Have Questions for a Gemologist?</span>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        Our luxury concierge team is available 24/7 on WhatsApp to answer inquiries regarding stone authentication or custom itineraries.
      </p>
      <Button asChild size="sm" className="w-full rounded-full bg-[#0B1E38] hover:bg-[#071527] text-white text-xs h-10 font-medium">
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
          Chat on WhatsApp ({phone})
        </a>
      </Button>
    </div>
  );
}
