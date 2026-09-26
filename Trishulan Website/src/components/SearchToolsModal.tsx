"use client";

import React, { useState } from 'react';

interface SearchToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTabDefault?: 'barcode' | 'image' | 'voice' | 'hsn';
  onSearchSelect?: (query: string) => void;
}

export default function SearchToolsModal({
  isOpen,
  onClose,
  activeTabDefault = 'barcode',
  onSearchSelect,
}: SearchToolsModalProps) {
  const [tab, setTab] = useState<'barcode' | 'image' | 'voice' | 'hsn'>(activeTabDefault);
  const [scanning, setScanning] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [voiceQuery, setVoiceQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [hsnQuery, setHsnQuery] = useState('');

  if (!isOpen) return null;

  const handleSimulateScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      const code = '8901030678912 (Hydraulic Bearing 6205-ZZ)';
      if (onSearchSelect) onSearchSelect('Hydraulic Bearing 6205');
      onClose();
    }, 1800);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelectedImage(url);
    }
  };

  const handleExecuteImageSearch = () => {
    if (onSearchSelect) onSearchSelect('Steel TMT Rebar 12mm Fe550D');
    onClose();
  };

  const handleToggleVoice = () => {
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      setVoiceQuery('Listening... Say product name like "TMT Steel 16mm"');
      setTimeout(() => {
        setVoiceQuery('TMT Steel 16mm Tata Tiscon');
        setIsListening(false);
      }, 2500);
    }
  };

  const handleVoiceSearchSubmit = () => {
    if (voiceQuery && onSearchSelect) {
      onSearchSelect(voiceQuery);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-[fadeIn_0.15s_ease]">
      <div className="bg-white rounded-[24px] max-w-xl w-full p-6 md:p-8 shadow-2xl relative border border-gray-100 overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center text-sm transition-colors"
        >
          ✕
        </button>

        {/* Modal Title */}
        <div className="mb-6">
          <span className="text-[11px] font-bold text-[#EA580C] uppercase tracking-[.14em]">TRISHULAN SMART SEARCH TOOLS</span>
          <h3 className="text-[22px] font-black text-[#0A1629] mt-1">Multi-Modal Product Finder</h3>
          <p className="text-xs text-gray-500 mt-1">Search industrial commodities via barcode scanner, visual image recognition, or voice input.</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-gray-100 p-1.5 rounded-xl gap-1 mb-6 border border-gray-200">
          <button
            onClick={() => setTab('barcode')}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              tab === 'barcode' ? 'bg-[#0A1629] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>▤</span>
            <span>Barcode / QR</span>
          </button>

          <button
            onClick={() => setTab('image')}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              tab === 'image' ? 'bg-[#0A1629] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>📷</span>
            <span>Image Search</span>
          </button>

          <button
            onClick={() => setTab('voice')}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              tab === 'voice' ? 'bg-[#0A1629] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>🎙️</span>
            <span>Voice</span>
          </button>

          <button
            onClick={() => setTab('hsn')}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              tab === 'hsn' ? 'bg-[#0A1629] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>🔖</span>
            <span>HSN Code</span>
          </button>
        </div>

        {/* Tab Content */}
        {tab === 'barcode' && (
          <div className="space-y-4">
            <div className="h-44 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 flex flex-col items-center justify-center relative overflow-hidden group">
              {scanning ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full border-4 border-[#EA580C] border-t-transparent animate-spin"></div>
                  <span className="text-xs font-bold text-[#EA580C] animate-pulse">Scanning barcode & decoding catalog item...</span>
                </div>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-2xl mb-2">
                    ▤
                  </div>
                  <span className="text-xs font-bold text-gray-700">Scan Product Barcode or EAN / QR Code</span>
                  <span className="text-[11px] text-gray-400 mt-0.5">Position camera over product barcode or upload image</span>
                </>
              )}

              {/* Laser animation bar */}
              {scanning && (
                <div className="absolute left-0 right-0 h-1 bg-[#EA580C] shadow-[0_0_12px_#EA580C] animate-[bounce_1.5s_infinite]"></div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSimulateScan}
                disabled={scanning}
                className="flex-1 py-3 bg-[#EA580C] hover:bg-[#c2410a] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>📷</span>
                <span>{scanning ? 'Scanning...' : 'Start Camera Scan'}</span>
              </button>

              <label className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-[#0A1629] font-bold text-xs rounded-xl border border-gray-300 text-center cursor-pointer transition-all flex items-center justify-center gap-2">
                <span>📁</span>
                <span>Upload Barcode File</span>
                <input type="file" accept="image/*" onChange={handleSimulateScan} className="hidden" />
              </label>
            </div>
          </div>
        )}

        {tab === 'image' && (
          <div className="space-y-4">
            <div className="h-44 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 flex flex-col items-center justify-center relative overflow-hidden">
              {selectedImage ? (
                <div className="relative w-full h-full p-2">
                  <img src={selectedImage} alt="Uploaded sample" className="w-full h-full object-contain rounded-xl" />
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-4 right-4 bg-red-600 text-white text-xs px-2 py-1 rounded-md font-bold shadow-md"
                  >
                    Change Image
                  </button>
                </div>
              ) : (
                <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center text-2xl mb-2">
                    🖼️
                  </div>
                  <span className="text-xs font-bold text-gray-700">Drop Industrial Product Image Here</span>
                  <span className="text-[11px] text-gray-400 mt-0.5">Supports PNG, JPG, WEBP — Instant AI Visual Match</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )}
            </div>

            <button
              onClick={handleExecuteImageSearch}
              className="w-full py-3 bg-[#0A1629] hover:bg-[#1E293B] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>🔍</span>
              <span>Run AI Visual Product Match</span>
            </button>
          </div>
        )}

        {tab === 'voice' && (
          <div className="space-y-5 text-center py-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-orange-100 text-[#EA580C] flex items-center justify-center text-3xl shadow-inner relative">
              🎙️
              {isListening && (
                <span className="absolute inset-0 rounded-full border-4 border-[#EA580C] animate-ping opacity-75"></span>
              )}
            </div>

            <div>
              <h4 className="text-sm font-bold text-[#0A1629]">
                {isListening ? 'Listening to your query...' : 'Click microphone to speak'}
              </h4>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Speak product names, specifications, or company names in English or Hindi.
              </p>
            </div>

            {voiceQuery && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 font-bold text-xs rounded-xl max-w-md mx-auto">
                "{voiceQuery}"
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={handleToggleVoice}
                className={`px-6 py-3 rounded-xl font-bold text-xs shadow-md transition-all ${
                  isListening
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-[#EA580C] hover:bg-[#c2410a] text-white'
                }`}
              >
                {isListening ? 'Stop Listening' : 'Start Voice Search'}
              </button>

              {voiceQuery && (
                <button
                  onClick={handleVoiceSearchSubmit}
                  className="px-6 py-3 bg-[#0A1629] hover:bg-[#1E293B] text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Search Now →
                </button>
              )}
            </div>
          </div>
        )}

        {tab === 'hsn' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#0A1629] mb-1">Enter HSN / SAC Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={hsnQuery}
                  onChange={(e) => setHsnQuery(e.target.value)}
                  placeholder="e.g. 7214 (Iron/Steel Bars), 8482 (Ball Bearings)..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-[#EA580C]"
                />
                <button
                  onClick={() => {
                    if (onSearchSelect) onSearchSelect(hsnQuery || '7214');
                    onClose();
                  }}
                  className="px-6 py-3 bg-[#EA580C] text-white font-bold text-xs rounded-xl hover:bg-[#c2410a]"
                >
                  Lookup HSN
                </button>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <div className="text-[11px] font-bold text-gray-400 uppercase mb-2">Popular Industrial HSN Chapters</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => {
                    if (onSearchSelect) onSearchSelect('HSN 7214');
                    onClose();
                  }}
                  className="p-2 bg-white rounded-lg border border-gray-200 text-left hover:border-[#EA580C]"
                >
                  <span className="font-bold text-[#0A1629] block">7214</span>
                  <span className="text-[10px] text-gray-500">Bars & Rods of Iron/Steel</span>
                </button>

                <button
                  onClick={() => {
                    if (onSearchSelect) onSearchSelect('HSN 8482');
                    onClose();
                  }}
                  className="p-2 bg-white rounded-lg border border-gray-200 text-left hover:border-[#EA580C]"
                >
                  <span className="font-bold text-[#0A1629] block">8482</span>
                  <span className="text-[10px] text-gray-500">Ball & Roller Bearings</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
