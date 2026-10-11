import React, { useState, useRef } from 'react';
import { Camera, Mic, Tag, Upload, ImageIcon, Search, QrCode, X } from 'lucide-react';

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
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [voiceQuery, setVoiceQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [hsnQuery, setHsnQuery] = useState('');
  const [scanError, setScanError] = useState('');
  const [imageError, setImageError] = useState('');
  const recognitionRef = useRef<any>(null);

  if (!isOpen) return null;

  // Upload a barcode image to the backend and retrieve the matched product query
  const handleSimulateScan = async (e?: React.ChangeEvent<HTMLInputElement>) => {
    const file = e?.target?.files?.[0];
    if (!file) return;
    setScanError('');
    setScanning(true);
    try {
      const form = new FormData();
      form.append('image', file);
      const res = await fetch('/api/search/barcode', { method: 'POST', body: form });
      if (!res.ok) throw new Error('Barcode lookup failed');
      const data = await res.json();
      if (onSearchSelect && data.query) onSearchSelect(data.query);
      onClose();
    } catch (err: any) {
      setScanError(err.message || 'Could not decode barcode. Please try again.');
    } finally {
      setScanning(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelectedImage(url);
      setSelectedImageFile(file);
      setImageError('');
    }
  };

  // Send the uploaded product image to the backend for AI visual matching
  const handleExecuteImageSearch = async () => {
    if (!selectedImageFile) {
      setImageError('Please upload an image first.');
      return;
    }
    setImageError('');
    try {
      const form = new FormData();
      form.append('image', selectedImageFile);
      const res = await fetch('/api/search/visual', { method: 'POST', body: form });
      if (!res.ok) throw new Error('Visual search failed');
      const data = await res.json();
      if (onSearchSelect && data.query) onSearchSelect(data.query);
      onClose();
    } catch (err: any) {
      setImageError(err.message || 'Visual search failed. Please try again.');
    }
  };

  // Use the browser Web Speech API for voice recognition
  const handleToggleVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceQuery('Voice search is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceQuery('');
    };
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join('');
      setVoiceQuery(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const handleVoiceSearchSubmit = () => {
    if (voiceQuery && onSearchSelect) {
      onSearchSelect(voiceQuery);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-[fadeIn_0.15s_ease]">
      <div className="bg-card rounded-[24px] max-w-xl w-full p-6 md:p-8 shadow-2xl relative border border-gray-100 overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-line/30 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center text-sm transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Title */}
        <div className="mb-6">
          <span className="text-[11px] font-bold text-accent uppercase tracking-[.14em]">TRISHULAN SMART SEARCH TOOLS</span>
          <h3 className="text-[22px] font-black text-ink mt-1">Multi-Modal Product Finder</h3>
          <p className="text-xs text-muted mt-1">Search industrial commodities via barcode scanner, visual image recognition, or voice input.</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-line/30 p-1.5 rounded-xl gap-1 mb-6 border border-line">
          <button
            onClick={() => setTab('barcode')}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              tab === 'barcode' ? 'bg-accent text-white shadow-sm' : 'text-muted hover:text-gray-900'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Barcode / QR</span>
          </button>

          <button
            onClick={() => setTab('image')}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              tab === 'image' ? 'bg-accent text-white shadow-sm' : 'text-muted hover:text-gray-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Image Search</span>
          </button>

          <button
            onClick={() => setTab('voice')}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              tab === 'voice' ? 'bg-accent text-white shadow-sm' : 'text-muted hover:text-gray-900'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Voice</span>
          </button>

          <button
            onClick={() => setTab('hsn')}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              tab === 'hsn' ? 'bg-accent text-white shadow-sm' : 'text-muted hover:text-gray-900'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>HSN Code</span>
          </button>
        </div>

        {/* Tab Content */}
        {tab === 'barcode' && (
          <div className="space-y-4">
            <div className="h-44 border-2 border-dashed border-gray-300 rounded-2xl bg-card flex flex-col items-center justify-center relative overflow-hidden group">
              {scanning ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full border-4 border-[#EA580C] border-t-transparent animate-spin"></div>
                  <span className="text-xs font-bold text-accent animate-pulse">Decoding barcode — looking up catalog item...</span>
                </div>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-2xl mb-2">
                    ▤
                  </div>
                  <span className="text-xs font-bold text-gray-700">Scan Product Barcode or EAN / QR Code</span>
                  <span className="text-[11px] text-muted/70 mt-0.5">Upload a barcode image to identify the product</span>
                </>
              )}

              {/* Laser animation bar */}
              {scanning && (
                <div className="absolute left-0 right-0 h-1 bg-accent shadow-[0_0_12px_#EA580C] animate-[bounce_1.5s_infinite]"></div>
              )}
            </div>

            {scanError && (
              <p className="text-xs text-red-600 font-semibold">{scanError}</p>
            )}

            <label className={`w-full py-3 rounded-xl font-bold text-xs text-center cursor-pointer transition-all flex items-center justify-center gap-2 ${
              scanning ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-accent hover:bg-[#c2410a] text-white shadow'
            }`}>
              <Upload className="w-4 h-4" />
              <span>{scanning ? 'Scanning...' : 'Upload Barcode / QR Image'}</span>
              <input type="file" accept="image/*" onChange={handleSimulateScan} disabled={scanning} className="hidden" />
            </label>
          </div>
        )}

        {tab === 'image' && (
          <div className="space-y-4">
            <div className="h-44 border-2 border-dashed border-gray-300 rounded-2xl bg-card flex flex-col items-center justify-center relative overflow-hidden">
              {selectedImage ? (
                <div className="relative w-full h-full p-2">
                  <img src={selectedImage} alt="Uploaded product" className="w-full h-full object-contain rounded-xl" />
                  <button
                    onClick={() => { setSelectedImage(null); setSelectedImageFile(null); setImageError(''); }}
                    className="absolute top-4 right-4 bg-red-600 text-white text-xs px-2 py-1 rounded-md font-bold shadow"
                  >
                    Change Image
                  </button>
                </div>
              ) : (
                <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center mb-2">
                    <ImageIcon className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-bold text-gray-700">Drop Industrial Product Image Here</span>
                  <span className="text-[11px] text-muted/70 mt-0.5">Supports PNG, JPG, WEBP — Instant AI Visual Match</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )}
            </div>

            {imageError && (
              <p className="text-xs text-red-600 font-semibold">{imageError}</p>
            )}

            <button
              onClick={handleExecuteImageSearch}
              disabled={!selectedImageFile}
              className="w-full py-3 bg-accent hover:bg-[#c2410a] text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Search className="w-4 h-4" />
              <span>Run AI Visual Product Match</span>
            </button>
          </div>
        )}

        {tab === 'voice' && (
          <div className="space-y-5 text-center py-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-orange-100 text-accent flex items-center justify-center shadow-inner relative">
              <Mic className="w-8 h-8" />
              {isListening && (
                <span className="absolute inset-0 rounded-full border-4 border-[#EA580C] animate-ping opacity-75"></span>
              )}
            </div>

            <div>
              <h4 className="text-sm font-bold text-ink">
                {isListening ? 'Listening to your query...' : 'Click microphone to speak'}
              </h4>
              <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
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
                className={`px-6 py-3 rounded-xl font-bold text-xs shadow transition-all ${
                  isListening
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-accent hover:bg-[#c2410a] text-white'
                }`}
              >
                {isListening ? 'Stop Listening' : 'Start Voice Search'}
              </button>

              {voiceQuery && (
                <button
                  onClick={handleVoiceSearchSubmit}
                  className="px-6 py-3 bg-accent hover:bg-[#c2410a] text-white font-bold text-xs rounded-xl shadow"
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
              <label className="block text-xs font-bold text-ink mb-1">Enter HSN / SAC Code</label>
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
                  className="px-6 py-3 bg-accent text-white font-bold text-xs rounded-xl hover:bg-[#c2410a]"
                >
                  Lookup HSN
                </button>
              </div>
            </div>

            <div className="p-4 bg-card border border-line rounded-xl">
              <div className="text-[11px] font-bold text-muted/70 uppercase mb-2">Popular Industrial HSN Chapters</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => {
                    if (onSearchSelect) onSearchSelect('HSN 7214');
                    onClose();
                  }}
                  className="p-2 bg-card rounded-lg border border-line text-left hover:border-[#EA580C]"
                >
                  <span className="font-bold text-ink block">7214</span>
                  <span className="text-[10px] text-muted">Bars & Rods of Iron/Steel</span>
                </button>

                <button
                  onClick={() => {
                    if (onSearchSelect) onSearchSelect('HSN 8482');
                    onClose();
                  }}
                  className="p-2 bg-card rounded-lg border border-line text-left hover:border-[#EA580C]"
                >
                  <span className="font-bold text-ink block">8482</span>
                  <span className="text-[10px] text-muted">Ball & Roller Bearings</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
