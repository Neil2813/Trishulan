"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Send,
  RotateCcw,
  Copy,
  Check,
  TrendingUp,
  ShieldCheck,
  Package,
  MapPin,
  ExternalLink,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';

interface AIAssistantBotProps {
  embedded?: boolean;
}

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

export default function AIAssistantBot({ embedded = false }: AIAssistantBotProps) {
  const [isOpen, setIsOpen] = useState(embedded);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'bot',
      text: 'Hello. I can assist you with mandi benchmark prices, KYC verification requirements, posting RFQs, or locating physical service points. What would you like to inquire about?',
      time: 'Just now',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const commonInquiries = [
    {
      label: 'TMT Steel Mandi Rates',
      icon: TrendingUp,
      question: 'What are today’s TMT Steel 12mm market prices?',
    },
    {
      label: 'KYC Document Checklist',
      icon: ShieldCheck,
      question: 'How do I complete KYC photo & document verification?',
    },
    {
      label: 'B2B Digital ID Card',
      icon: ShieldCheck,
      question: 'How do I generate and download my B2B Digital ID card?',
    },
    {
      label: 'Post Wholesale RFQ',
      icon: Package,
      question: 'How do I post a requirement to get verified supplier quotes?',
    },
    {
      label: 'Physical Service Points',
      icon: MapPin,
      question: 'Where are Trishulan physical service point hubs located?',
    },
  ];

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
      let botAnswer = 'Trishulan connects verified industrial buyers and suppliers with transparent mandi benchmarks, verified credentials, and escrow protection.';
      let actionLink: { label: string; href: string } | undefined;

      const lower = textToSend.toLowerCase();
      if (lower.includes('kyc') || lower.includes('photo') || lower.includes('document')) {
        botAnswer = 'To complete KYC verification, open your Profile page and upload your AADHAR, PAN, GSTIN certificate, and MSME details, followed by photo verification. The status will update to Verified once processed.';
        actionLink = { label: 'Open KYC Profile', href: '/profile' };
      } else if (lower.includes('price') || lower.includes('steel') || lower.includes('market') || lower.includes('tmt') || lower.includes('copper')) {
        botAnswer = 'Current Indian Steel Rebar (12mm Fe550D) spot benchmark is approximately ₹46,850 / MT in Maharashtra and ₹47,200 / MT in Gujarat. Copper Cathodes are benchmarked at ₹7,32,000 / MT based on live market feeds.';
        actionLink = { label: 'View Market Prices Panel', href: '/market-prices' };
      } else if (lower.includes('id card') || lower.includes('digital id')) {
        botAnswer = 'Your B2B Digital ID Card is generated from your registered profile details. It includes your verified role, GSTIN, and QR verification stamp for business identity confirmation.';
        actionLink = { label: 'View Digital ID', href: '/profile' };
      } else if (lower.includes('service point') || lower.includes('location') || lower.includes('hub')) {
        botAnswer = 'Trishulan physical Service Point hubs operate in Mumbai MIDC, Ahmedabad GIDC, Hyderabad Cherlapally, Rajahmundry, Guntur, and Vijayawada. These hubs offer inspection, weighing, and dispatch support.';
      } else if (lower.includes('seller') || lower.includes('supplier') || lower.includes('rfq') || lower.includes('requirement')) {
        botAnswer = 'You can broadcast a procurement requirement through the RFQ portal. Matching verified manufacturers and distributors will review the specifications and submit competitive quotes.';
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
        text: 'Chat history cleared. How can I assist you with your procurement or verification inquiries?',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  if (!embedded && !isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-ink hover:bg-slate-800 text-bg font-bold text-xs shadow-xl flex items-center gap-2 border border-line cursor-pointer transition-all"
      >
        <MessageSquare className="w-4 h-4 text-accent" />
        <span>Trishulan Help Desk</span>
      </button>
    );
  }

  return (
    <div
      className={`bg-card rounded-2xl border border-line shadow-sm overflow-hidden flex flex-col ${
        embedded
          ? 'h-[640px] w-full'
          : 'fixed bottom-6 right-6 z-50 w-[380px] sm:w-[460px] h-[580px]'
      }`}
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
              <span>Available</span>
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
          {!embedded && (
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-line/50 transition-colors text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Column: Common Inquiries */}
        {embedded && (
          <aside className="hidden lg:flex flex-col w-[260px] bg-bg/50 border-r border-line p-4 space-y-3 shrink-0 overflow-y-auto">
            <div>
              <span className="text-[11px] font-bold text-muted uppercase tracking-wider block">
                Common Topics
              </span>
              <p className="text-[11px] text-muted/80 mt-0.5">Select a query to ask directly:</p>
            </div>

            <div className="space-y-1.5">
              {commonInquiries.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(item.question)}
                    className="w-full text-left p-2.5 rounded-lg border border-line/80 hover:border-accent/40 bg-card hover:bg-line/20 transition-all text-xs group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <IconComponent className="w-3 h-3 text-muted group-hover:text-accent transition-colors" />
                      <span className="font-semibold text-ink group-hover:text-accent transition-colors text-[11.5px]">
                        {item.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted line-clamp-1">
                      {item.question}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="mt-auto pt-3 border-t border-line text-[11px] text-muted space-y-1">
              <div className="text-[10.5px] text-muted">Reference Datasets:</div>
              <div className="text-[10.5px] text-ink font-medium">Pan-India Mandis, KYC Registry, RFQs</div>
            </div>
          </aside>
        )}

        {/* Right Column: Chat Conversation Stream */}
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

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 mr-auto text-xs text-muted p-2 bg-bg border border-line rounded-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
                <span>Searching knowledge base...</span>
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
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask about commodity prices, KYC verification, RFQs..."
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
              Information provided is based on published platform benchmark indices and documentation.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

