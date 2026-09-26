"use client";

import React, { useState } from 'react';

interface AIAssistantBotProps {
  embedded?: boolean;
}

export default function AIAssistantBot({ embedded = false }: AIAssistantBotProps) {
  const [isOpen, setIsOpen] = useState(embedded);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Namaste! I am Trishulan AI Bot. How can I assist with your industrial sourcing, KYC verification, market prices, or supplier connections today?',
      time: 'Just now',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const predefinedQuestions = [
    'How do I complete KYC photo & document verification?',
    'What are today’s TMT Steel 12mm market prices?',
    'How do I generate and download my B2B Digital ID card?',
    'Where are Trishulan physical service point hubs located?',
  ];

  const handleSendMessage = (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputQuery('');
    setIsTyping(true);

    // Simulate AI intelligent response
    setTimeout(() => {
      let botAnswer = 'I can help you with that! Trishulan connects verified buyers and suppliers with transparent market prices and escrow protection.';

      const lower = textToSend.toLowerCase();
      if (lower.includes('kyc') || lower.includes('photo') || lower.includes('document')) {
        botAnswer = 'To complete KYC verification: Go to Register/Profile, upload your AADHAR, PAN, GST certificate, MSME number, and take a quick selfie photo verification. Your status will instantly update to 100% Verified!';
      } else if (lower.includes('price') || lower.includes('steel') || lower.includes('market')) {
        botAnswer = 'Current Indian Steel Rebar (12mm Fe550D) spot price is ₹46,850 / MT in Maharashtra and ₹47,200 / MT in Gujarat. Visit the Market Prices page to see state-wise and country-wise breakdowns!';
      } else if (lower.includes('id card') || lower.includes('digital id')) {
        botAnswer = 'Your Digital ID Card is automatically generated upon completing registration or KYC. You can view, download, or email your ID Card complete with scannable QR code directly from your Profile or Registration page!';
      } else if (lower.includes('service point') || lower.includes('location') || lower.includes('hub')) {
        botAnswer = 'Trishulan physical Service Point hubs are operational in Rajahmundry, Guntur, Vijayawada, Mumbai MIDC, Ahmedabad GIDC, and Hyderabad Cherlapally. Click the "Service Points" button in the header to view full addresses and phone numbers!';
      } else if (lower.includes('seller') || lower.includes('supplier') || lower.includes('rfq')) {
        botAnswer = 'You can post your requirement on the RFQ page ("Let Us Provide You Verified Sellers"). Verified manufacturers will submit instant quotes to your Messages inbox!';
      }

      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: botAnswer,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 1000);
  };

  if (!embedded && !isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-full bg-[#0A1629] hover:bg-[#1E293B] text-white font-extrabold text-xs shadow-2xl flex items-center gap-2 border border-[#EA580C] animate-bounce"
      >
        <span className="text-xl">🤖</span>
        <span>Ask Trishulan AI Bot</span>
      </button>
    );
  }

  return (
    <div className={`bg-white rounded-[24px] border border-gray-200 shadow-2xl overflow-hidden flex flex-col ${
      embedded ? 'h-[520px] w-full' : 'fixed bottom-6 right-6 z-50 w-[360px] sm:w-[420px] h-[540px]'
    }`}>
      
      {/* Bot Header */}
      <div className="bg-[#0A1629] text-white p-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EA580C] text-white flex items-center justify-center font-bold text-xl shadow-md">
            🤖
          </div>
          <div>
            <h4 className="font-extrabold text-[15px]">Trishulan AI Assistant</h4>
            <div className="flex items-center gap-1.5 text-[10px] text-green-400">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              <span>Online • Solves Doubts & Industrial Queries</span>
            </div>
          </div>
        </div>

        {!embedded && (
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* Suggested Quick Questions */}
      <div className="p-3 bg-gray-50 border-b border-gray-200 flex gap-1.5 overflow-x-auto scrollbar-none">
        {predefinedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:border-[#EA580C] text-[11px] font-semibold text-[#0A1629] shrink-0 transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Message History */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col max-w-[85%] ${m.sender === 'user' ? 'self-end items-end' : 'self-start'}`}
          >
            <div
              className={`p-3.5 rounded-2xl text-[12.5px] leading-relaxed shadow-sm ${
                m.sender === 'user'
                  ? 'bg-[#EA580C] text-white rounded-tr-none'
                  : 'bg-white text-[#0A1629] border border-gray-200 rounded-tl-none'
              }`}
            >
              {m.text}
            </div>
            <span className="text-[9px] text-gray-400 mt-1 px-1">{m.time}</span>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-gray-400 p-2">
            <span className="w-2 h-2 rounded-full bg-[#EA580C] animate-ping"></span>
            <span>Trishulan AI is resolving query...</span>
          </div>
        )}
      </div>

      {/* Form Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-white border-t border-gray-200 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask AI bot about prices, KYC, ID cards, suppliers..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-[#EA580C]"
        />
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-[#0A1629] hover:bg-[#1E293B] text-white font-bold text-xs shadow-md transition-colors"
        >
          Ask
        </button>
      </form>

    </div>
  );
}
