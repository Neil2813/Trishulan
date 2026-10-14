"use client";

import React from 'react';
import { FileText, MessageSquareQuote, MessagesSquare, CheckCircle, PackageCheck } from 'lucide-react';

export type RFQStage = 1 | 2 | 3 | 4 | 5;

interface RFQStageProgressRibbonProps {
  currentStage?: RFQStage;
  rfqTitle?: string;
  quotesCount?: number;
  className?: string;
}

const STAGES = [
  {
    stage: 1,
    title: 'RFQ Issued',
    desc: 'Requirement posted',
    icon: FileText,
  },
  {
    stage: 2,
    title: 'Quotes In',
    desc: 'Suppliers responded',
    icon: MessageSquareQuote,
  },
  {
    stage: 3,
    title: 'Clarification',
    desc: 'Negotiation & Q&A',
    icon: MessagesSquare,
  },
  {
    stage: 4,
    title: 'PO Accepted',
    desc: 'Terms confirmed',
    icon: CheckCircle,
  },
  {
    stage: 5,
    title: 'Fulfilled',
    desc: 'Shipment delivered',
    icon: PackageCheck,
  },
];

export default function RFQStageProgressRibbon({
  currentStage = 3,
  rfqTitle,
  quotesCount,
  className = '',
}: RFQStageProgressRibbonProps) {
  return (
    <div className={`bg-card border border-line rounded-2xl p-4 shadow-xs ${className}`}>
      {rfqTitle && (
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2.5 border-b border-line/60">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
              Active RFQ Thread
            </span>
            <span className="text-xs font-black text-ink">{rfqTitle}</span>
          </div>
          {quotesCount !== undefined && (
            <span className="text-[11px] font-bold text-muted">
              {quotesCount} {quotesCount === 1 ? 'quote' : 'quotes'} received
            </span>
          )}
        </div>
      )}

      {/* 5-Stage Ribbon */}
      <div className="grid grid-cols-5 gap-1.5 md:gap-2">
        {STAGES.map((s) => {
          const Icon = s.icon;
          const isCompleted = s.stage < currentStage;
          const isCurrent = s.stage === currentStage;

          return (
            <div
              key={s.stage}
              className={`relative flex flex-col items-center text-center p-2 rounded-xl border transition-all ${
                isCurrent
                  ? 'bg-orange-50/80 border-accent text-accent shadow-xs'
                  : isCompleted
                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800'
                  : 'bg-slate-50/60 border-line text-muted/70'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 text-xs font-black ${
                  isCurrent
                    ? 'bg-accent text-white shadow-2xs'
                    : isCompleted
                    ? 'bg-emerald-600 text-white'
                    : 'bg-line text-muted'
                }`}
              >
                {isCompleted ? '✓' : <Icon className="w-3 h-3" />}
              </div>

              <span
                className={`text-[10px] md:text-[11px] font-extrabold leading-tight ${
                  isCurrent ? 'text-ink' : isCompleted ? 'text-emerald-900' : 'text-muted'
                }`}
              >
                {s.title}
              </span>

              <span className="text-[9px] text-muted hidden md:block mt-0.5 font-medium leading-tight">
                {s.desc}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
