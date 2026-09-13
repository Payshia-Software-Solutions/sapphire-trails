'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  Gem, 
  Clock, 
  CheckCheck, 
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { trackContactClick } from '@/lib/analytics';
import { useSiteContent, getWhatsappUrl, getContactPhone } from '@/lib/site-content';

const QUICK_INQUIRIES = [
  '💎 Inquire about Private Gem Mine Tour',
  '💍 Custom Proposal & Engagement Ring Package',
  '📅 Check availability for upcoming dates',
  '📍 Ratnapura Private Day Expedition details'
];

export function WhatsAppButton() {
  const { content } = useSiteContent();
  const pathname = usePathname();

  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [hasSent, setHasSent] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Determine visibility based on path (hide on admin/invoice views)
  useEffect(() => {
    const isExcluded = pathname?.startsWith('/admin') || pathname?.startsWith('/invoices') || pathname?.startsWith('/auth');
    setIsVisible(!isExcluded);
  }, [pathname]);

  // Set formatted time
  useEffect(() => {
    const now = new Date();
    setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, []);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        isOpen &&
        chatWindowRef.current &&
        !chatWindowRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!isVisible) {
    return null;
  }

  const handleSendMessage = (textToSend?: string) => {
    const msg = (textToSend !== undefined ? textToSend : message).trim();
    const finalMessage = msg || 'Hello! I am interested in Sapphire Trails gem mine expeditions and custom packages.';

    trackContactClick({ 
      channel: 'whatsapp', 
      source: 'interactive_chat_widget' 
    });

    setHasSent(true);
    const targetUrl = getWhatsappUrl(content, finalMessage);

    // Open WhatsApp in new tab
    window.open(targetUrl, '_blank', 'noopener,noreferrer');

    // Reset after a brief moment
    setTimeout(() => {
      setMessage('');
      setHasSent(false);
      setIsOpen(false);
    }, 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div ref={chatWindowRef} className="fixed bottom-6 right-6 z-50 print:hidden select-none">
      
      {/* ===================================================================== */}
      {/* LIVE CHAT INTERACTIVE WINDOW                                         */}
      {/* ===================================================================== */}
      {isOpen && (
        <div 
          className={cn(
            "absolute bottom-20 right-0 w-[92vw] max-w-[370px] sm:max-w-[390px] rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.35)]",
            "border border-border/80 bg-card text-foreground backdrop-blur-xl",
            "flex flex-col transition-all duration-300 animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-5"
          )}
          style={{ maxHeight: 'min(620px, 85vh)' }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0d2818] via-[#1b4332] to-[#2d6a4f] text-white p-3.5 sm:p-4 flex items-center justify-between relative shadow-md">
            <div className="flex items-center gap-2.5">
              {/* Concierge Avatar with Active Dot */}
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-primary font-serif font-bold text-sm shadow-inner">
                  <Gem className="h-4 w-4 text-emerald-300" />
                </div>
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 border-2 border-[#1b4332] animate-pulse" />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-serif font-medium text-sm tracking-wide text-white">
                    Sapphire Trails Concierge
                  </h4>
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
                </div>
                <p className="text-[10px] text-emerald-100/80 font-light flex items-center gap-1 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
                  Direct WhatsApp Dispatch &bull; Online
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="h-7 w-7 rounded-full bg-black/20 hover:bg-black/30 text-white/80 hover:text-white flex items-center justify-center transition-colors"
              aria-label="Close chat"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Chat Messages Body (Scrollbar hidden for luxury app feel) */}
          <div className="p-3.5 sm:p-4 space-y-3 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex-1 bg-muted/20 text-xs">
            {/* Timestamp */}
            <div className="text-center">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-muted/60 text-muted-foreground text-[10px] font-mono">
                {currentTime || 'Today'}
              </span>
            </div>

            {/* Inbound Agent Welcome Bubble */}
            <div className="flex items-start gap-2.5 max-w-[88%]">
              <div className="h-7 w-7 rounded-full bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <div className="p-3.5 rounded-2xl rounded-tl-sm bg-card border border-border/70 shadow-xs space-y-1.5">
                <p className="text-xs text-foreground leading-relaxed">
                  Ayubowan! Welcome to <strong>Sapphire Trails</strong>.
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed font-light">
                  How may we assist you with our private gem pit expeditions, certified gemologists, or custom proposal packages?
                </p>
                <div className="flex items-center justify-end gap-1 text-[9px] text-muted-foreground/60 pt-0.5">
                  <span>{currentTime}</span>
                  <CheckCheck className="h-3 w-3 text-emerald-500" />
                </div>
              </div>
            </div>

            {/* Quick Inquiry Suggestions */}
            <div className="space-y-1.5 pt-1">
              <p className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground/80 font-semibold px-1">
                Frequently Requested
              </p>
              <div className="flex flex-col gap-1.5">
                {QUICK_INQUIRIES.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setMessage(item);
                      inputRef.current?.focus();
                    }}
                    className="text-left px-3 py-2 rounded-xl border border-border/60 bg-background/80 hover:bg-primary/10 hover:border-primary/40 hover:text-primary transition-all text-[11px] flex items-center justify-between group shadow-2xs"
                  >
                    <span className="line-clamp-1">{item}</span>
                    <ChevronRight className="h-3 w-3 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback when message dispatched */}
            {hasSent && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-center animate-in fade-in zoom-in-95 duration-200">
                <p className="text-xs font-semibold flex items-center justify-center gap-1.5">
                  <CheckCheck className="h-4 w-4" />
                  Connecting to WhatsApp Concierge...
                </p>
              </div>
            )}
          </div>

          {/* Composer Footer */}
          <div className="p-3 sm:p-4 bg-card border-t border-border/70 space-y-2.5">
            <div className="relative">
              <textarea
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                placeholder="Type your message or inquiry..."
                className="w-full text-xs p-3 pr-10 rounded-2xl border border-border/80 bg-background resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500/50 leading-relaxed placeholder:text-muted-foreground/60"
              />
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={hasSent}
                className={cn(
                  "absolute bottom-2.5 right-2.5 h-8 w-8 rounded-xl flex items-center justify-center transition-all",
                  message.trim() 
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs" 
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
                aria-label="Send message to WhatsApp"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex items-center justify-between text-[10px] text-muted-foreground px-1">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> Press Enter to send
              </span>
              <button
                type="button"
                onClick={() => handleSendMessage()}
                className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium inline-flex items-center gap-1"
              >
                <span>Direct to WhatsApp</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* FLOATING TRIGGER BUTTON                                               */}
      {/* ===================================================================== */}
      <div className="relative group">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full shadow-2xl transition-all duration-300",
            isOpen
              ? "bg-foreground text-background rotate-90 scale-95"
              : "bg-primary text-primary-foreground hover:scale-105 active:scale-95 shadow-primary/25"
          )}
          aria-label={isOpen ? "Close concierge chat" : "Open WhatsApp concierge chat"}
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <MessageSquare className="h-7 w-7 sm:h-8 sm:w-8" fill="currentColor" />
          )}
        </button>

        {/* Pulsing "Online" Green Status Badge when closed */}
        {!isOpen && (
          <span className="absolute top-0 right-0 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-background" />
          </span>
        )}

        {/* Hover Micro Tooltip */}
        {!isOpen && (
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 hidden sm:block opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200">
            <div className="bg-slate-950 text-white text-[11px] font-serif tracking-wider uppercase px-3 py-1.5 rounded-full shadow-lg border border-primary/30 whitespace-nowrap">
              Chat with Concierge
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
