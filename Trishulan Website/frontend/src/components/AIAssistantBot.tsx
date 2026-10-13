"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Send,
  RotateCcw,
  Copy,
  Check,
  MessageSquare,
  ArrowRight,
  X,
} from 'lucide-react';

interface Message {
  id: number;
  sender: 'bot' | 'user';
  text: string;
  time: string;
  actionLink?: {
    label: string;
    href: string;
  };
}

export default function AIAssistantBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'bot',
      text: 'Hi! I can help you navigate Trishulan, explore suppliers, check market information, or create an RFQ. What can I help you with?',
      time: 'Just now',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const closeAssistant = useCallback(() => {
    setIsOpen(false);
    window.requestAnimationFrame(() => launcherRef.current?.focus());
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeAssistant();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeAssistant, isOpen]);

  const handleSendMessage = (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: Date.now(),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputQuery('');
    setIsTyping(true);

    setTimeout(() => {
      let botAnswer = 'Trishulan helps buyers and suppliers connect and use marketplace tools for industrial trade.';
      let actionLink: { label: string; href: string } | undefined;

      const lower = textToSend.toLowerCase();
      if (lower.includes('kyc') || lower.includes('photo') || lower.includes('document')) {
        botAnswer = 'Buyer accounts do not need KYC. Supplier account verification requirements are shown in the Profile page.';
        actionLink = { label: 'Open Profile', href: '/profile' };
      } else if (lower.includes('price') || lower.includes('steel') || lower.includes('market') || lower.includes('tmt') || lower.includes('copper')) {
        botAnswer = 'I can’t provide a current price from this chat. Check the Market Prices page for available prices, timestamps, and source details.';
        actionLink = { label: 'View Market Prices Panel', href: '/market-prices' };
      } else if (lower.includes('id card') || lower.includes('digital id')) {
        botAnswer = 'Your Digital ID displays information from your account. Verification indicators are shown only when available in your platform profile.';
        actionLink = { label: 'View Digital ID', href: '/profile' };
      } else if (lower.includes('service point') || lower.includes('location') || lower.includes('hub')) {
        botAnswer = 'Current service point locations are not available in this chat. Please contact support for help.';
        actionLink = { label: 'Contact support', href: '/help' };
      } else if (lower.includes('seller') || lower.includes('supplier') || lower.includes('rfq') || lower.includes('requirement')) {
        botAnswer = 'You can browse supplier listings and post a procurement requirement through the RFQ portal. Check each supplier profile for its current verification status.';
        actionLink = { label: 'Create RFQ', href: '/rfq' };
      } else if (lower.includes('consent') || lower.includes('contact') || lower.includes('workspace')) {
        botAnswer = 'Buyer contact preferences (phone and WhatsApp routing) can be managed in the Customer Workspace. Supplier access to direct contact numbers requires explicit authorization.';
        actionLink = { label: 'Open Customer Workspace', href: '/customer-workspace' };
      }

      const botMsg: Message = {
        id: Date.now() + 1,
        sender: 'bot',
        text: botAnswer,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionLink,
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 700);
  };

  const handleCopy = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: Date.now(),
        sender: 'bot',
        text: 'Chat history cleared. How can I help you use Trishulan?',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  if (!isOpen) {
    return (
      <button
        ref={launcherRef}
        type="button"
        aria-label="Open Trishulan Assistant"
        aria-haspopup="dialog"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-[120] flex h-14 w-14 items-center justify-center rounded-full border border-line bg-ink text-bg shadow-xl transition-transform hover:scale-105 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/40 sm:bottom-6 sm:right-6"
      >
        <MessageSquare className="h-6 w-6 text-accent" />
      </button>
    );
  }

  return (
    <div
      role="dialog"
      id="trishulan-assistant-dialog"
      aria-label="Trishulan Assistant"
      className="fixed bottom-4 right-4 z-[120] flex h-[min(36rem,calc(100dvh-2rem))] w-[calc(100vw-2rem)] max-w-[24rem] flex-col overflow-hidden rounded-2xl border border-line bg-card shadow-2xl sm:bottom-6 sm:right-6"
    >
      {/* Header */}
      <div className="bg-card border-b border-line px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-[14px] text-ink leading-none">Trishulan Assistant</h3>
            <div className="flex items-center gap-1.5 text-[11px] text-muted mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Guidance assistant</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleResetChat}
            className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-line/50 transition-colors"
            title="Clear conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            aria-label="Close assistant"
            onClick={closeAssistant}
            className="rounded-lg p-2 text-muted transition-colors hover:bg-line/50 hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Chat conversation stream */}
        <div className="flex-1 flex flex-col overflow-hidden bg-card">
          
          {/* Messages Stream */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col max-w-[85%] ${
                  m.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                }`}
              >
                {/* Bubble Body */}
                <div
                  className={`p-3.5 rounded-xl text-[13px] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-ink text-bg font-medium'
                      : 'bg-bg border border-line text-ink'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>

                  {/* Contextual Action Link */}
                  {m.actionLink && (
                    <div className="mt-2.5 pt-2 border-t border-line">
                      <Link
                        href={m.actionLink.href}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline"
                      >
                        <span>{m.actionLink.label}</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-2 px-1 mt-1 text-[10px] text-muted">
                  <span>{m.time}</span>
                  {m.sender === 'bot' && (
                    <button
                      onClick={() => handleCopy(m.id, m.text)}
                      className="hover:text-ink transition-colors flex items-center gap-1 cursor-pointer"
                      title="Copy response"
                    >
                      {copiedId === m.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600 font-medium">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {messages.length === 1 && !isTyping && (
              <div className="flex flex-wrap gap-2">
                {[
                  'How do I find suppliers?',
                  'How do I post an RFQ?',
                  'Where can I check market prices?',
                ].map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => handleSendMessage(question)}
                    className="rounded-full border border-line bg-card px-3 py-2 text-left text-[11px] font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 mr-auto text-xs text-muted p-2 bg-bg border border-line rounded-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
                <span>Preparing a response…</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Input Form */}
          <div className="p-3.5 bg-card border-t border-line">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2 bg-bg rounded-xl border border-line focus-within:border-ink/50 p-1.5 transition-colors"
            >
              <input
                ref={inputRef}
                type="text"
                aria-label="Ask Trishulan Assistant"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask about suppliers, market prices, or RFQs..."
                className="flex-1 px-3 py-1.5 bg-transparent text-[13px] text-ink placeholder:text-muted outline-none min-w-0"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim() || isTyping}
                className="px-4 py-2 rounded-lg bg-ink hover:bg-slate-800 disabled:opacity-40 text-bg font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <span>Send</span>
                <Send className="w-3 h-3" />
              </button>
            </form>
            <p className="text-[10px] text-muted text-center mt-1.5">
              General guidance only. Check the linked pages for current details.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
