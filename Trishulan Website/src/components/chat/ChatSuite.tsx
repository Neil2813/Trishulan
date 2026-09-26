"use client";

import React, { useState, useEffect } from 'react';
import { ChatMessage } from '@/types';

interface ChatSuiteProps {
  partnerName?: string;
  rfqId?: string;
}

export default function ChatSuite({
  partnerName = 'Sreegopalakrishnacollections Prop J...',
  rfqId,
}: ChatSuiteProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [attachment, setAttachment] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Unread' | 'Favourites' | 'Archived' | 'Blocked'>('All');
  const [userRating, setUserRating] = useState<number>(0);
  const [showFeedback, setShowFeedback] = useState(true);
  const [loading, setLoading] = useState(false);

  const mockConversations = [
    { id: 1, name: 'Sreegopalakrishnacollections Pr...', msg: 'IndiaMART connected you with this seller', time: '24/7/26', unread: 0, tag: 'All' },
    { id: 2, name: 'Nithya Sri Enterprises, Guntur', msg: 'If You want Please Call or WhatsApp :- 799...', time: '6/7/26', unread: 2, tag: 'Unread' },
    { id: 3, name: 'Elite Writing Instruments, Mumbai', msg: 'You have sent an enquiry to this seller', time: '29/6/26', unread: 0, tag: 'Favourites' },
    { id: 4, name: 'Maruthi Plastics & Packaging ...', msg: 'IndiaMART connected you with this seller', time: '25/4/26', unread: 1, tag: 'All' },
    { id: 5, name: '3 Idea Technology Limited, Mu...', msg: 'Voice call', time: '2/2/26', unread: 11, tag: 'All' },
  ];

  const fetchMessages = async () => {
    try {
      const url = rfqId ? `/api/chat?rfqId=${rfqId}` : '/api/chat';
      const res = await fetch(url);
      const data = await res.json();
      if (data.chats && data.chats.length > 0) {
        setMessages(data.chats);
      } else {
        // Initial default message thread for showcase matching Page 6
        setMessages([
          {
            id: '1',
            senderId: 'partner-1',
            senderName: partnerName,
            receiverId: 'user-1',
            receiverName: 'Buyer',
            text: 'Hello! Welcome to Sreegopalakrishnacollections. Here is the catalog model specs for SGK ALPHA PRO 20 32.',
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [rfqId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !attachment) return;

    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          attachmentUrl: attachment || undefined,
          rfqId,
          receiverName: partnerName,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setText('');
        setAttachment('');
        fetchMessages();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[24px] border border-gray-200 shadow-2xl overflow-hidden flex flex-col md:flex-row h-[680px]">
      
      {/* Left Sidebar: Conversations list & Filter Chips (Page 5 in PDF) */}
      <div className="w-full md:w-[320px] bg-gray-50 border-r border-gray-200 flex flex-col shrink-0">
        
        {/* Title */}
        <div className="p-4 bg-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">☰</span>
            <h3 className="font-extrabold text-[16px]">Messages</h3>
          </div>
          <span className="text-xs bg-teal-800 px-2.5 py-0.5 rounded-full font-bold">Inbox</span>
        </div>

        {/* Search Chat Input */}
        <div className="p-3 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
            <span className="text-gray-400 text-xs">🔍</span>
            <input
              type="text"
              placeholder="Search chats"
              className="bg-transparent text-xs outline-none w-full"
            />
          </div>
        </div>

        {/* Filters Row: All, Unread, Favourites, Archived, Blocked (Page 5 in PDF) */}
        <div className="p-2 border-b border-gray-200 flex gap-1 overflow-x-auto bg-white scrollbar-none">
          {(['All', 'Unread', 'Favourites', 'Archived', 'Blocked'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold shrink-0 transition-all ${
                activeFilter === filter
                  ? 'bg-teal-700 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Chat List Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {mockConversations.map((c) => (
            <div
              key={c.id}
              className={`p-3 flex items-start gap-3 cursor-pointer hover:bg-gray-100 transition-colors ${
                c.id === 1 ? 'bg-teal-50/70 border-l-4 border-teal-700' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-[#0A1629] text-white flex items-center justify-center font-bold text-xs shrink-0">
                {c.name.charAt(0)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[12.5px] text-[#0A1629] truncate">{c.name}</h4>
                  <span className="text-[10px] text-gray-400 font-mono">{c.time}</span>
                </div>
                <p className="text-[11px] text-gray-500 truncate mt-0.5">{c.msg}</p>
              </div>

              {c.unread > 0 && (
                <span className="w-4 h-4 rounded-full bg-teal-600 text-white font-bold text-[9px] flex items-center justify-center shrink-0">
                  {c.unread}
                </span>
              )}
            </div>
          ))}
        </div>

      </div>

      {/* Right Main Thread Area (Page 6 in PDF) */}
      <div className="flex-1 flex flex-col bg-slate-50/50">
        
        {/* Chat Header Bar */}
        <div className="p-4 bg-teal-700 text-white flex items-center justify-between border-b border-teal-800">
          <div>
            <h4 className="font-extrabold text-[15px]">{partnerName}</h4>
            <div className="flex items-center gap-2 text-[11px] text-teal-100 mt-0.5 flex-wrap">
              <span>📍 Rajahmundry ⭐⭐⭐⭐ 4.4(16)</span>
              <span className="px-1.5 py-0.2 bg-teal-800 rounded font-bold text-[9.5px]">✓ GST</span>
              <span className="px-1.5 py-0.2 bg-amber-500 text-slate-900 rounded font-bold text-[9.5px]">✓ TrustSEAL</span>
              <span className="px-1.5 py-0.2 bg-green-500 text-white rounded font-bold text-[9.5px]">✓ Payment Protected</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => alert('Initiating Direct Voice Call to Seller: +91 883 245 9901')}
              className="w-9 h-9 rounded-full bg-teal-800 hover:bg-teal-900 text-white flex items-center justify-center text-base"
              title="Call Seller"
            >
              📞
            </button>
          </div>
        </div>

        {/* Message Thread Scroll View */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          
          {/* Catalog Visited Notice Header */}
          <div className="text-center">
            <span className="px-4 py-1.5 rounded-full bg-amber-100 text-amber-900 font-bold text-xs border border-amber-200">
              You visited this seller's catalog
            </span>
          </div>

          {/* In-Chat Product Catalog Card (Page 6 in PDF Spec) */}
          <div className="max-w-sm mx-auto bg-teal-50 border border-teal-200 rounded-2xl p-5 shadow-md text-center space-y-3">
            <h4 className="font-black text-[16px] text-[#0A1629]">SGK ALPHA PRO 20 32</h4>

            <button
              onClick={() => alert('Calling seller for SGK ALPHA PRO 20 32...')}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
            >
              <span>📞</span>
              <span>Call Now</span>
            </button>

            {/* Catalog Spec Grid */}
            <div className="text-left text-xs space-y-1 pt-2 border-t border-teal-200 text-teal-950 font-medium">
              <div className="flex justify-between">
                <span>Needle Count:</span>
                <span className="font-bold">12 Needle</span>
              </div>
              <div className="flex justify-between">
                <span>Embroidery Area:</span>
                <span className="font-bold">500*800</span>
              </div>
              <div className="flex justify-between">
                <span>Max Speed:</span>
                <span className="font-bold">1200 spm</span>
              </div>
              <div className="flex justify-between">
                <span>Machine Type:</span>
                <span className="font-bold">Computerized</span>
              </div>
              <div className="flex justify-between">
                <span>Application:</span>
                <span className="font-bold">T Shirt</span>
              </div>
            </div>

            <div className="text-[10px] text-gray-400 text-right">24 Jul ✓✓</div>
          </div>

          {/* Rating & Feedback Prompt Widget (Page 6 in PDF) */}
          {showFeedback && (
            <div className="max-w-md mx-auto bg-white border border-gray-200 rounded-2xl p-4 shadow-lg relative text-center space-y-2 animate-[fadeIn_0.2s_ease]">
              <button
                onClick={() => setShowFeedback(false)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 font-bold text-sm"
              >
                ✕
              </button>

              <div className="font-extrabold text-xs text-[#0A1629]">
                Your Feedback Matters. Please rate <br />
                <span className="text-teal-700 font-black">{partnerName}</span>
              </div>

              {/* Star Buttons */}
              <div className="flex items-center justify-center gap-2 pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setUserRating(star)}
                    className={`text-2xl transition-transform hover:scale-125 ${
                      star <= userRating ? 'text-amber-400' : 'text-gray-300'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>

              {userRating > 0 && (
                <div className="text-[11px] font-bold text-green-600">
                  Thank you! You rated {userRating} / 5 Stars.
                </div>
              )}
            </div>
          )}

          {/* Message Bubbles */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[80%] ${
                msg.senderName === partnerName ? 'self-start' : 'self-end items-end'
              }`}
            >
              <div
                className={`p-4 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                  msg.senderName === partnerName
                    ? 'bg-white text-[#0A1629] border border-gray-200 rounded-tl-none'
                    : 'bg-teal-700 text-white rounded-tr-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

        </div>

        {/* Bottom Message Input Form (Page 6 in PDF) */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-200 flex items-center gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Message"
            className="flex-1 px-4 py-3 rounded-full border border-gray-300 text-xs focus:outline-none focus:border-teal-600"
          />

          <button
            type="button"
            onClick={() => {
              const file = prompt('Enter Spec Document URL:');
              if (file) setAttachment(file);
            }}
            className="w-10 h-10 rounded-full border border-gray-300 hover:bg-gray-100 flex items-center justify-center text-gray-600 text-base"
            title="Attach Document"
          >
            📎
          </button>

          <button
            type="submit"
            disabled={loading}
            className="w-10 h-10 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-bold flex items-center justify-center text-base shadow-md transition-colors"
          >
            📞
          </button>
        </form>

      </div>

    </div>
  );
}
