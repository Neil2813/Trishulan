"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Bot,
  Sparkles,
  Send,
  RotateCcw,
  Copy,
  Check,
  TrendingUp,
  ShieldCheck,
  Package,
  MapPin,
  ExternalLink,
  User,
  Zap,
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
      text: 'Namaste! I am your Trishulan Industrial AI Assistant. I can assist you with live mandi benchmark prices, KYC & document verification, posting RFQs, or locating physical service points. What would you like to explore today?',
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

  const quickTopics = [
    {
      category: 'Market Prices',
      icon: TrendingUp,
      color: 'text-orange-600 bg-orange-50 border-orange-200',
      question: 'What are today’s TMT Steel 12mm market prices?',
    },
    {
      category: 'KYC & ID Card',
      icon: ShieldCheck,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      question: 'How do I complete KYC photo & document verification?',
    },
    {
      category: 'Digital ID',
      icon: Zap,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      question: 'How do I generate and download my B2B Digital ID card?',
    },
    {
      category: 'Wholesale RFQ',
      icon: Package,
      color: 'text-orange-600 bg-orange-50 border-orange-200',
      question: 'How do I post a requirement to get verified supplier quotes?',
    },
    {
      category: 'Service Points',
      icon: MapPin,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
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
      let botAnswer = 'I can help you with that! Trishulan connects verified industrial buyers and suppliers with transparent mandi benchmarks, verified credentials, and secure escrow settlement.';
      let actionLink: { label: string; href: string } | undefined;

      const lower = textToSend.toLowerCase();
      if (lower.includes('kyc') || lower.includes('photo') || lower.includes('document')) {
        botAnswer = 'To complete KYC verification: Head to your Profile page, upload your AADHAR, PAN, GST certificate, and MSME details, followed by a quick photo verification. Your badge will instantly update to 100% Verified!';
        actionLink = { label: 'Go to Profile & KYC Verification', href: '/profile' };
      } else if (lower.includes('price') || lower.includes('steel') || lower.includes('market') || lower.includes('tmt') || lower.includes('copper')) {
        botAnswer = 'Current Indian Steel Rebar (12mm Fe550D) spot price is ₹46,850 / MT in Maharashtra and ₹47,200 / MT in Gujarat. Copper Cathodes are benchmarked at ₹7,32,000 / MT with live Frankfurter FX tracking.';
        actionLink = { label: 'Open Live Market Prices', href: '/market-prices' };
      } else if (lower.includes('id card') || lower.includes('digital id')) {
        botAnswer = 'Your official B2B Digital ID Card is automatically generated upon completing your account details. It includes your verified role, GSTIN, and a tamper-proof scannable QR verification badge.';
        actionLink = { label: 'View & Download Digital ID', href: '/profile' };
      } else if (lower.includes('service point') || lower.includes('location') || lower.includes('hub')) {
        botAnswer = 'Trishulan physical Service Point hubs are operational in Mumbai MIDC, Ahmedabad GIDC, Hyderabad Cherlapally, Rajahmundry, Guntur, and Vijayawada. Each hub provides on-site material testing, weighing, and dispatch assistance.';
      } else if (lower.includes('seller') || lower.includes('supplier') || lower.includes('rfq') || lower.includes('requirement')) {
        botAnswer = 'You can submit your procurement requirement on the RFQ broadcast board. Verified manufacturers and verified stockists matching your specs will respond directly with quotes.';
        actionLink = { label: 'Post a New Requirement (RFQ)', href: '/rfq' };
      } else if (lower.includes('consent') || lower.includes('contact') || lower.includes('workspace')) {
        botAnswer = 'You can configure granular buyer phone and WhatsApp contact sharing permissions in the Customer Workspace. Sellers only receive your direct phone number after you grant explicit consent.';
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
    }, 850);
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
        text: 'Chat history cleared. How can I assist you with your industrial procurement today?',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  if (!embedded && !isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs shadow-2xl flex items-center gap-2.5 border border-orange-300 transition-all cursor-pointer"
      >
        <Sparkles className="w-4 h-4 text-amber-200" />
        <span>Ask Trishulan AI Copilot</span>
      </button>
    );
  }

  return (
    <div
      className={`bg-card rounded-[26px] border border-line shadow-xl overflow-hidden flex flex-col ${
        embedded
          ? 'h-[680px] w-full'
          : 'fixed bottom-6 right-6 z-50 w-[380px] sm:w-[480px] h-[600px]'
      }`}
    >
      {/* Bot Header (Light Blue & Light Orange Theme) */}
      <div className="bg-gradient-to-r from-orange-50/90 via-white to-sky-50/80 border-b border-orange-200/60 p-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center font-bold shadow-sm ring-4 ring-orange-100">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-[16px] text-ink">Trishulan AI Assistant</h3>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                v2.4 Live
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Online • Mandi Benchmark &amp; KYC Engine</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetChat}
            className="p-2 rounded-xl text-muted hover:text-ink hover:bg-orange-100/50 transition-colors border border-transparent hover:border-orange-200"
            title="Reset conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          {!embedded && (
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-line/30 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Main Content: Split Rail on Wide Screens */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side: Topic Shortcuts (Desktop Rail) */}
        {embedded && (
          <aside className="hidden lg:flex flex-col w-[280px] bg-gradient-to-b from-orange-50/30 via-card to-sky-50/20 border-r border-line p-4 space-y-4 shrink-0 overflow-y-auto">
            <div>
              <span className="text-[10px] font-black text-orange-600 uppercase tracking-wider block">
                EXPLORE TOPICS
              </span>
              <p className="text-[11px] text-muted mt-0.5">Tap a question to ask the AI instantly:</p>
            </div>

            <div className="space-y-2">
              {quickTopics.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(item.question)}
                    className="w-full text-left p-2.5 rounded-xl border border-line hover:border-orange-300 bg-card hover:bg-orange-50/40 transition-all text-xs group cursor-pointer shadow-2xs"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`p-1 rounded-md border ${item.color}`}>
                        <IconComponent className="w-3 h-3" />
                      </span>
                      <span className="text-[11px] font-extrabold text-ink group-hover:text-orange-600 transition-colors">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-[11.5px] text-muted line-clamp-2 leading-snug">
                      {item.question}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="mt-auto pt-3 border-t border-line text-[11px] text-muted space-y-1.5">
              <div className="flex justify-between items-center">
                <span>Indexed Mandis:</span>
                <span className="font-bold text-ink">28+ Pan-India</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Verified Suppliers:</span>
                <span className="font-bold text-ink">5,000+</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Response Speed:</span>
                <span className="font-bold text-emerald-600">&lt; 1 sec</span>
              </div>
            </div>
          </aside>
        )}

        {/* Right Side: Chat Conversation Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-b from-white via-card to-orange-50/15">
          
          {/* Quick Prompt Carousel on Mobile / Top */}
          <div className="p-2.5 px-4 bg-orange-50/40 border-b border-orange-200/50 flex gap-2 overflow-x-auto scrollbar-none shrink-0">
            {quickTopics.slice(0, 4).map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q.question)}
                className="px-3 py-1.5 rounded-full bg-card hover:bg-orange-50 border border-orange-200 text-[11px] font-bold text-ink hover:text-orange-600 shrink-0 transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3 h-3 text-orange-500" />
                <span>{q.question}</span>
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 max-w-[90%] sm:max-w-[80%] ${
                  m.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold shadow-2xs ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gradient-to-tr from-orange-500 to-amber-500 text-white'
                  }`}
                >
                  {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Bubble Body */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div
                    className={`p-4 rounded-2xl text-[13.5px] leading-relaxed shadow-sm ${
                      m.sender === 'user'
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-tr-xs'
                        : 'bg-card text-ink border border-orange-200/70 rounded-tl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.text}</p>

                    {/* Contextual Action Link */}
                    {m.actionLink && (
                      <div className="mt-3 pt-2.5 border-t border-orange-200/60">
                        <Link
                          href={m.actionLink.href}
                          className="inline-flex items-center gap-1.5 text-xs font-black text-orange-600 hover:text-orange-700 hover:underline bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200"
                        >
                          <span>{m.actionLink.label}</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Metadata & Actions */}
                  <div
                    className={`flex items-center gap-2 px-1 text-[10px] text-muted ${
                      m.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <span>{m.time}</span>
                    {m.sender === 'bot' && (
                      <button
                        onClick={() => handleCopy(m.id, m.text)}
                        className="hover:text-ink transition-colors flex items-center gap-1 cursor-pointer"
                        title="Copy message"
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600 font-bold">Copied</span>
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
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-3 mr-auto">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3.5 px-4 rounded-2xl bg-card border border-orange-200/70 rounded-tl-xs shadow-2xs flex items-center gap-2 text-xs text-muted">
                  <div className="flex gap-1 items-center">
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce"></span>
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.15s]"></span>
                    <span className="w-2 h-2 rounded-full bg-orange-400 animate-bounce [animation-delay:0.3s]"></span>
                  </div>
                  <span className="text-orange-700 font-medium">Trishulan AI analyzing verified industrial database...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Input Form */}
          <div className="p-4 bg-card border-t border-line">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2 bg-card rounded-2xl border border-orange-200 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100 p-1.5 transition-all shadow-sm"
            >
              <div className="pl-3 text-orange-500 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask about prices, suppliers, KYC verification, RFQs, ID cards..."
                className="flex-1 px-2 py-2 bg-transparent text-[13px] text-ink placeholder:text-muted outline-none min-w-0"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim() || isTyping}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-white font-extrabold text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
            <p className="text-[10px] text-muted text-center mt-2">
              AI provides indicative intelligence from verified Trishulan sources. Always confirm final commercial terms before ordering.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

