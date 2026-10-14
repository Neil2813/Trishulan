import React, { useEffect, useRef, useState } from 'react';
import { User, Mail, Download, Check, QrCode } from 'lucide-react';
import { toBlob } from 'html-to-image';
import { QRCodeSVG } from 'qrcode.react';

interface DigitalIDCardProps {
  name: string;
  role: 'BUYER' | 'SELLER';
  companyName: string;
  companyId?: string;
  gstNumber?: string;
  email?: string;
  photoUrl?: string;
  isVerified?: boolean;
}

export default function DigitalIDCard({
  name,
  role,
  companyName,
  companyId,
  gstNumber,
  email,
  photoUrl,
  isVerified = false,
}: DigitalIDCardProps) {
  const [emailSent, setEmailSent] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const cardRef = useRef<HTMLDivElement>(null);
  const [verificationUrl, setVerificationUrl] = useState('');

  useEffect(() => {
    if (companyId) {
      setVerificationUrl(`${window.location.origin}/verify/${encodeURIComponent(companyId)}`);
    } else {
      setVerificationUrl('');
    }
  }, [companyId]);

  const handleSendEmail = () => {
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 4000);
  };

  const handleDownload = async () => {
    if (!cardRef.current) {
      setDownloadError('The ID card is not ready to download. Please try again.');
      return;
    }

    setIsDownloading(true);
    setDownloadError('');

    try {
      await document.fonts.ready;
      const image = await toBlob(cardRef.current, {
        backgroundColor: '#ffffff',
        cacheBust: true,
        pixelRatio: 2,
        skipFonts: true,
        filter: (node: Node) => !(node instanceof HTMLElement && node.dataset.exportExclude === 'true'),
      });
      if (!image) {
        throw new Error('The ID card image could not be generated.');
      }

      const memberName = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'member';
      const imageUrl = URL.createObjectURL(image);
      const link = document.createElement('a');
      link.download = `trishulan-id-${memberName}.png`;
      link.href = imageUrl;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(imageUrl), 1000);
    } catch (error) {
      console.error('Failed to download the digital ID card:', error);
      setDownloadError('Could not download the ID card. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div
      ref={cardRef}
      aria-busy={isDownloading}
      className="bg-gradient-to-br from-white via-slate-50 to-orange-50/40 text-ink rounded-[24px] p-5 sm:p-7 md:p-8 shadow-xl border border-line relative overflow-hidden w-full max-w-2xl mx-auto"
    >
      
      {/* Background Accent Gradients */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Card Header */}
      <div className="flex items-center justify-between pb-5 border-b border-line mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center font-extrabold text-accent text-lg font-alata shadow-sm">
            T
          </div>
          <div>
            <h4 className="font-extrabold text-[15px] tracking-wider text-ink">TRISHULAN CONNECT</h4>
            <span className="text-[9.5px] uppercase font-bold text-muted tracking-widest block">OFFICIAL B2B INDUSTRIAL ID</span>
          </div>
        </div>

        {role === 'SELLER' && (
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border font-extrabold text-[10px] tracking-wider uppercase shadow-sm ${
            isVerified
              ? 'bg-green-100 border-green-300 text-green-800'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}>
            {isVerified && <Check className="w-3 h-3 text-green-700" />}
            <span>{isVerified ? 'VERIFIED' : 'VERIFICATION PENDING'}</span>
          </span>
        )}
      </div>

      {/* Card Main Body */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
        
        {/* User Photo Box */}
        <div className="flex flex-col items-center">
          <div className="w-28 h-28 rounded-2xl bg-card border-2 border-[#EA580C] p-1 shadow relative overflow-hidden flex items-center justify-center text-4xl">
            {photoUrl ? (
              <img src={photoUrl} alt={name} className="w-full h-full object-cover rounded-xl" />
            ) : (
              <User className="w-12 h-12 text-muted/70" />
            )}
          </div>
          <span className="mt-2 text-[10px] font-extrabold text-accent uppercase tracking-widest">
            {role === 'SELLER' ? (isVerified ? 'VERIFIED SELLER' : 'SELLER') : 'BUYER'}
          </span>
        </div>

        {/* Member Details */}
        <div className="sm:col-span-2 min-w-0 space-y-2.5">
          <div>
            <span className="text-[9.5px] font-bold text-muted uppercase tracking-wider block">Member / Firm Representative</span>
            <h3 className="text-[18px] font-black text-ink leading-tight">{name || '—'}</h3>
          </div>

          <div>
            <span className="text-[9.5px] font-bold text-muted uppercase tracking-wider block">Company / Firm Name</span>
            <div className="text-[13.5px] font-extrabold text-accent">{companyName || '—'}</div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <span className="text-[9px] font-bold text-muted uppercase tracking-wider block">Company ID</span>
              <span className="text-xs font-mono font-bold text-ink bg-card px-2 py-0.5 rounded border border-gray-300 block break-all shadow-2xs">
                {companyId || '—'}
              </span>
            </div>

            <div>
              <span className="text-[9px] font-bold text-muted uppercase tracking-wider block">GSTIN / Tax ID</span>
              <span className="text-xs font-mono font-bold text-ink bg-card px-2 py-0.5 rounded border border-gray-300 block break-all shadow-2xs">
                {gstNumber || '—'}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* QR Code & Verification Row */}
      <div className="mt-6 pt-5 border-t border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 bg-card p-1.5 rounded-xl shrink-0 border border-gray-300 shadow-sm">
            {verificationUrl ? (
              <QRCodeSVG
                value={verificationUrl}
                size={52}
                level="M"
                includeMargin
                title="Scan to verify this Trishulan member ID"
              />
            ) : (
              <QrCode className="w-full h-full text-muted/50" aria-hidden="true" />
            )}
          </div>

          <div className="text-[11px] text-gray-700">
            <span className="font-bold text-ink block">Scan to Verify Authenticity</span>
            <span className="text-[10px] text-muted">{email || 'Account email unavailable'}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div data-export-exclude="true" className="flex flex-col gap-2 shrink-0 w-full sm:w-auto">
          <button
            onClick={handleSendEmail}
            className="px-3.5 py-2 rounded-xl bg-accent hover:bg-[#c2410a] text-white font-bold text-xs shadow transition-colors flex items-center justify-center gap-1.5"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>{emailSent ? 'Sent to Email!' : 'Send to Email'}</span>
          </button>

          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="px-3.5 py-1.5 rounded-xl bg-line/30 hover:bg-gray-200 disabled:opacity-60 disabled:cursor-wait border border-gray-300 text-ink font-bold text-[11px] transition-colors flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isDownloading ? 'Preparing ID…' : 'Download ID'}</span>
          </button>
        </div>

      </div>

      {downloadError && (
        <p role="alert" className="mt-3 text-xs font-semibold text-red-700 text-right">
          {downloadError}
        </p>
      )}

      {emailSent && email && (
        <div data-export-exclude="true" className="mt-4 p-2.5 bg-green-100 border border-green-300 text-green-900 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5 animate-[fadeIn_0.15s_ease]">
          <Check className="w-3.5 h-3.5 text-green-800" />
          <span>Digital ID Card & Verification Certificate emailed to {email}</span>
        </div>
      )}

    </div>
  );
}
