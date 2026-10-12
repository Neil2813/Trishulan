'use client';

import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  BarChart3,
  Camera,
  ChevronRight,
  ClipboardList,
  FileText,
  Globe,
  LayoutGrid,
  MapPin,
  Mic,
  Package,
  QrCode,
  Search,
  Shield,
  ShoppingCart,
  Sparkles,
  Store,
  Tag,
  Truck,
  X,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export type SearchToolTab = 'barcode' | 'image' | 'voice' | 'hsn';

export interface Shortcut {
  label: string;
  icon: React.ReactNode;
  link: string;
}

export interface SearchResult {
  icon: React.ReactNode;
  label: string;
  description: string;
  link: string;
  badge?: string;
  toolTab?: SearchToolTab;
}

const SVGFilter = () => (
  <svg width="0" height="0" className="absolute pointer-events-none">
    <filter id="blob">
      <feGaussianBlur stdDeviation="10" in="SourceGraphic" />
      <feColorMatrix
        values="
          1 0 0 0 0
          0 1 0 0 0
          0 0 1 0 0
          0 0 0 18 -9
        "
        result="blob"
      />
      <feBlend in="SourceGraphic" in2="blob" />
    </filter>
  </svg>
);

interface ShortcutButtonProps {
  icon: React.ReactNode;
  label: string;
  link: string;
  onClick?: () => void;
}

const ShortcutButton = ({ icon, label, link, onClick }: ShortcutButtonProps) => {
  const inner = (
    <div
      className="rounded-full cursor-pointer hover:shadow-lg opacity-40 hover:opacity-100 transition-[opacity,shadow] duration-200"
      title={label}
    >
      <div className="size-16 aspect-square flex items-center justify-center text-neutral-800">
        {icon}
      </div>
    </div>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="outline-none focus:opacity-100">
        {inner}
      </button>
    );
  }

  return (
    <a href={link} className="outline-none focus:opacity-100">
      {inner}
    </a>
  );
};

interface SpotlightPlaceholderProps {
  text: string;
  className?: string;
}

const SpotlightPlaceholder = ({ text, className }: SpotlightPlaceholderProps) => (
  <motion.div
    layout
    className={cn('absolute text-gray-500 flex items-center pointer-events-none z-10', className)}
  >
    <AnimatePresence mode="popLayout">
      <motion.p
        layoutId={`placeholder-${text}`}
        key={`placeholder-${text}`}
        initial={{ opacity: 0, y: 10, filter: 'blur(5px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: -10, filter: 'blur(5px)' }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        {text}
      </motion.p>
    </AnimatePresence>
  </motion.div>
);

interface SpotlightInputProps {
  placeholder: string;
  hidePlaceholder: boolean;
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholderClassName?: string;
}

const SpotlightInput = ({
  placeholder,
  hidePlaceholder,
  value,
  onChange,
  onClear,
  onKeyDown,
  placeholderClassName,
}: SpotlightInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus input when opened
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex items-center w-full justify-start gap-3 px-6 h-16">
      <motion.div layoutId="search-icon" className="text-neutral-500">
        <Search className="size-6" />
      </motion.div>
      <div className="flex-1 relative text-xl md:text-2xl">
        {!hidePlaceholder && (
          <SpotlightPlaceholder text={placeholder} className={placeholderClassName} />
        )}
        <motion.input
          ref={inputRef}
          layout="position"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          className="w-full bg-transparent outline-none ring-0 text-neutral-900 placeholder-transparent"
        />
      </div>
      {value && (
        <button
          type="button"
          onClick={onClear}
          className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 transition-colors"
          title="Clear search"
        >
          <X className="size-5" />
        </button>
      )}
    </div>
  );
};

interface SearchResultCardProps extends SearchResult {
  isLast: boolean;
  onSelect: () => void;
}

const SearchResultCard = ({
  icon,
  label,
  description,
  badge,
  isLast,
  onSelect,
}: SearchResultCardProps) => (
  <button
    type="button"
    onClick={onSelect}
    className="overflow-hidden w-full group/card text-left outline-none block"
  >
    <div
      className={cn(
        'flex items-center text-black justify-start hover:bg-white gap-3 py-2.5 px-3 rounded-xl hover:shadow-sm w-full transition-all cursor-pointer',
        isLast && 'rounded-b-3xl'
      )}
    >
      <div className="size-8 [&_svg]:stroke-[1.8] [&_svg]:size-5 aspect-square flex items-center justify-center text-accent bg-accent/10 rounded-lg shrink-0">
        {icon}
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-[13.5px] text-neutral-900 truncate">{label}</p>
          {badge && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-neutral-200 text-neutral-700 shrink-0">
              {badge}
            </span>
          )}
        </div>
        <p className="text-[11.5px] text-neutral-500 truncate">{description}</p>
      </div>
      <div className="flex items-center justify-end opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 text-neutral-400 shrink-0">
        <ChevronRight className="size-5" />
      </div>
    </div>
  </button>
);

interface SearchResultsContainerProps {
  searchResults: SearchResult[];
  onHover: (index: number | null) => void;
  onSelectResult: (result: SearchResult) => void;
  query?: string;
  onExecuteSearch?: () => void;
}

const SearchResultsContainer = ({
  searchResults,
  onHover,
  onSelectResult,
  query,
  onExecuteSearch,
}: SearchResultsContainerProps) => (
  <motion.div
    layout
    onMouseLeave={() => onHover(null)}
    className="px-3 border-t border-neutral-200/80 flex flex-col bg-neutral-100 max-h-96 overflow-y-auto w-full py-2"
  >
    {/* Enter Action Banner when user is typing */}
    {query && query.trim().length > 0 && (
      <button
        type="button"
        onClick={onExecuteSearch}
        className="w-full flex items-center justify-between px-3 py-2.5 mb-1.5 rounded-xl bg-accent text-white font-semibold text-xs hover:bg-[#c2410a] transition-all shadow-sm"
      >
        <div className="flex items-center gap-2 truncate">
          <Search className="size-4 shrink-0" />
          <span className="truncate">Search for &quot;{query}&quot; in all listings &amp; suppliers</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-bold bg-black/20 px-2 py-0.5 rounded">
          <span>↵ Enter</span>
        </div>
      </button>
    )}

    <div className="px-3 pt-1 pb-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
      {query ? `Suggestions & Matches (${searchResults.length})` : 'Popular Searches & Portals'}
    </div>

    {searchResults.length === 0 ? (
      <div className="px-3 py-4 text-center text-xs text-neutral-500">
        No direct matches found. Press <kbd className="font-mono bg-neutral-200 px-1 py-0.5 rounded text-neutral-700">Enter</kbd> to search marketplace listings.
      </div>
    ) : (
      searchResults.map((result, index) => (
        <motion.div
          key={`search-result-${index}`}
          onMouseEnter={() => onHover(index)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            delay: index * 0.02,
            duration: 0.15,
            ease: 'easeOut',
          }}
        >
          <SearchResultCard
            icon={result.icon}
            label={result.label}
            description={result.description}
            badge={result.badge}
            link={result.link}
            isLast={index === searchResults.length - 1}
            onSelect={() => onSelectResult(result)}
          />
        </motion.div>
      ))
    )}
  </motion.div>
);

// ── Trishulan Core Shortcuts ──────────────────────────────────────────────────
const DEFAULT_SHORTCUTS: Shortcut[] = [
  { label: 'Buy Products',     icon: <ShoppingCart className="size-7" />, link: '/buy' },
  { label: 'Sell & Supply',    icon: <Store className="size-7" />,        link: '/sell' },
  { label: 'Logistics Desk',   icon: <Truck className="size-7" />,        link: '/logistics' },
  { label: 'Workspace',        icon: <ClipboardList className="size-7" />, link: '/customer-workspace' },
];

// ── Trishulan Search Suggestions & Catalog ────────────────────────────────────
const DEFAULT_RESULTS: SearchResult[] = [
  // Products & Raw Materials
  { icon: <Package />,     label: 'Steel Rebar 12mm Fe-550D',        description: 'Raw Material · Primary Mills · Maharashtra Mandi',  link: '/platform-a?query=steel+rebar', badge: 'Steel' },
  { icon: <Package />,     label: 'Industrial Pump Parts & Valves',   description: 'Machinery Components · Precision Cast · Gujarat',  link: '/platform-a?query=pump+parts',  badge: 'Machinery' },
  { icon: <Package />,     label: 'Structural Steel Beams & Angles',  description: 'Hot Rolled Structural Sections · Mandi Govindgarh', link: '/platform-a?query=steel+beams', badge: 'Steel' },
  // HSN Codes
  { icon: <Tag />,         label: 'HSN 7214 – Iron & Non-Alloy Steel Bars', description: 'Indian Customs Tariff & GST Rate Lookup',       link: '/platform-a?query=HSN+7214', badge: 'HSN' },
  { icon: <Tag />,         label: 'HSN 8482 – Ball & Roller Bearings', description: 'Mechanical Transmission Components Chapter 84',      link: '/platform-a?query=HSN+8482', badge: 'HSN' },
  // Portals & Tools
  { icon: <BarChart3 />,   label: 'Industrial Market Analyzer',       description: 'AI Product Intelligence & Demand Index Matrix',     link: '/market-analyzer', badge: 'Analytics' },
  { icon: <Activity />,    label: 'Live Commodity Market Prices',     description: 'Real-time spot rates across Indian mandis',         link: '/market-prices', badge: 'Live Rates' },
  { icon: <Globe />,       label: 'Platform A – Buyer Discovery',     description: 'Verified suppliers, quotes & RFQ broadcast',        link: '/platform-a', badge: 'Market' },
  { icon: <Store />,       label: 'Platform B – Seller Management',    description: 'Post listings, manage inventory & leads',           link: '/platform-b', badge: 'Market' },
  { icon: <Truck />,       label: 'Logistics & Freight Workspace',    description: 'Book freight transport & track dispatches',         link: '/logistics', badge: 'Logistics' },
  { icon: <Shield />,      label: 'Industrial Health Insurance',      description: 'Worker healthcare access & corporate plans',        link: '/insurance', badge: 'Services' },
  { icon: <FileText />,    label: 'Operations & Billing Desk',        description: 'E-invoicing, GST filing & business accounts',       link: '/operations', badge: 'Operations' },
  { icon: <MapPin />,      label: 'Physical Service Points',          description: 'Trishulan touchpoints across major industrial hubs', link: '#', badge: 'Network' },
  { icon: <LayoutGrid />,  label: 'Member Dashboard',                 description: 'Activity overview, quotes & active inquiries',     link: '/dashboard', badge: 'Dashboard' },
];

export interface AppleSpotlightProps {
  shortcuts?: Shortcut[];
  isOpen?: boolean;
  handleClose?: () => void;
  onSearch?: (query: string) => void;
  onOpenTools?: (tab: SearchToolTab) => void;
}

const AppleSpotlight = ({
  shortcuts = DEFAULT_SHORTCUTS,
  isOpen = true,
  handleClose = () => {},
  onSearch,
  onOpenTools,
}: AppleSpotlightProps) => {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const [hoveredSearchResult, setHoveredSearchResult] = useState<number | null>(null);
  const [hoveredShortcut, setHoveredShortcut] = useState<number | null>(null);
  const [searchValue, setSearchValue] = useState('');

  // Live filtered suggestions
  const filteredResults = searchValue.trim()
    ? DEFAULT_RESULTS.filter(
        (r) =>
          r.label.toLowerCase().includes(searchValue.toLowerCase()) ||
          r.description.toLowerCase().includes(searchValue.toLowerCase())
      )
    : DEFAULT_RESULTS.slice(0, 7);

  const executeSearch = (queryToSearch?: string) => {
    const q = queryToSearch ?? searchValue;
    if (!q || !q.trim()) return;
    if (onSearch) {
      onSearch(q.trim());
    } else {
      router.push(`/platform-a?query=${encodeURIComponent(q.trim())}`);
    }
    handleClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeSearch();
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    if (result.toolTab && onOpenTools) {
      onOpenTools(result.toolTab);
      handleClose();
      return;
    }
    if (result.link && result.link !== '#') {
      router.push(result.link);
      handleClose();
      return;
    }
    executeSearch(result.label);
  };

  const handleSelectTool = (tab: SearchToolTab) => {
    if (onOpenTools) {
      onOpenTools(tab);
    }
    handleClose();
  };

  // Global Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, handleClose]);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-start pt-[12vh] px-4 bg-black/60 backdrop-blur-md"
          onClick={handleClose}
        >
          <SVGFilter />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20, filter: 'blur(10px) url(#blob)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px) url(#blob)' }}
            exit={{ opacity: 0, scale: 0.95, y: -20, filter: 'blur(10px) url(#blob)' }}
            transition={{ stiffness: 550, damping: 50, type: 'spring' }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => {
              setHovered(false);
              setHoveredShortcut(null);
            }}
            onClick={(e) => e.stopPropagation()}
            style={{ filter: 'url(#blob)' }}
            className={cn(
              'w-full flex items-center justify-end gap-3 z-20 group',
              '[&>div]:bg-neutral-100 [&>div]:text-black [&>div]:rounded-full [&>div]:backdrop-blur-xl',
              '[&_svg]:size-7 [&_svg]:stroke-[1.4]',
              'max-w-2xl md:max-w-3xl'
            )}
          >
            <AnimatePresence mode="popLayout">
              <motion.div
                layoutId="search-input-container"
                transition={{
                  layout: {
                    duration: 0.4,
                    type: 'spring',
                    bounce: 0.2,
                  },
                }}
                style={{
                  borderRadius: '28px',
                }}
                className="h-full w-full flex flex-col items-center justify-start z-10 relative shadow-2xl overflow-hidden border border-neutral-300/80 bg-neutral-100"
              >
                {/* Search Input Bar */}
                <SpotlightInput
                  placeholder={
                    hoveredShortcut !== null
                      ? shortcuts[hoveredShortcut].label
                      : hoveredSearchResult !== null
                      ? filteredResults[hoveredSearchResult]?.label ?? 'Search'
                      : 'Search products, HSN codes, suppliers…'
                  }
                  placeholderClassName={
                    hoveredSearchResult !== null ? 'text-black bg-white' : 'text-gray-500'
                  }
                  hidePlaceholder={!(hoveredSearchResult !== null || !searchValue)}
                  value={searchValue}
                  onChange={setSearchValue}
                  onClear={() => setSearchValue('')}
                  onKeyDown={handleKeyDown}
                />

                {/* Integrated Search Tools Strip */}
                <div className="w-full px-4 py-2 bg-neutral-200/60 border-t border-neutral-200/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-neutral-500 uppercase shrink-0 mr-1">
                    <Sparkles className="size-3.5 text-accent" />
                    <span>Tools:</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSelectTool('barcode')}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white hover:bg-neutral-50 border border-neutral-300 text-neutral-800 text-[11.5px] font-semibold hover:border-accent hover:text-accent transition-all shrink-0 shadow-sm"
                    title="Scan spec barcode or QR"
                  >
                    <QrCode className="size-3.5" />
                    <span>Barcode / QR</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectTool('image')}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white hover:bg-neutral-50 border border-neutral-300 text-neutral-800 text-[11.5px] font-semibold hover:border-accent hover:text-accent transition-all shrink-0 shadow-sm"
                    title="Upload photo or spec sheet"
                  >
                    <Camera className="size-3.5" />
                    <span>Image / Spec</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectTool('voice')}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white hover:bg-neutral-50 border border-neutral-300 text-neutral-800 text-[11.5px] font-semibold hover:border-accent hover:text-accent transition-all shrink-0 shadow-sm"
                    title="Voice speech-to-text inquiry"
                  >
                    <Mic className="size-3.5" />
                    <span>Voice Search</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectTool('hsn')}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white hover:bg-neutral-50 border border-neutral-300 text-neutral-800 text-[11.5px] font-semibold hover:border-accent hover:text-accent transition-all shrink-0 shadow-sm"
                    title="Browse 8-digit HSN codes"
                  >
                    <Tag className="size-3.5" />
                    <span>HSN Directory</span>
                  </button>
                </div>

                {/* Results & Suggestions Container */}
                <SearchResultsContainer
                  searchResults={filteredResults}
                  onHover={setHoveredSearchResult}
                  onSelectResult={handleSelectResult}
                  query={searchValue}
                  onExecuteSearch={() => executeSearch()}
                />
              </motion.div>

              {/* Signature Hover Floating Shortcut Bubbles */}
              {hovered &&
                !searchValue &&
                shortcuts.map((shortcut, index) => (
                  <motion.div
                    key={`shortcut-${index}`}
                    onMouseEnter={() => setHoveredShortcut(index)}
                    layout
                    initial={{ scale: 0.7, x: -1 * (64 * (index + 1)) }}
                    animate={{ scale: 1, x: 0 }}
                    exit={{
                      scale: 0.7,
                      x:
                        1 *
                        (16 * (shortcuts.length - index - 1) + 64 * (shortcuts.length - index - 1)),
                    }}
                    transition={{
                      duration: 0.6,
                      type: 'spring',
                      bounce: 0.2,
                      delay: index * 0.04,
                    }}
                    className="rounded-full cursor-pointer hidden md:block"
                  >
                    <ShortcutButton
                      icon={shortcut.icon}
                      label={shortcut.label}
                      link={shortcut.link}
                      onClick={() => {
                        router.push(shortcut.link);
                        handleClose();
                      }}
                    />
                  </motion.div>
                ))}
            </AnimatePresence>
          </motion.div>

          {/* Dismiss & Keyboard Hints */}
          <div className="mt-4 flex items-center gap-4 text-xs text-white/70 select-none">
            <span className="flex items-center gap-1">
              Press <kbd className="bg-white/15 px-1.5 py-0.5 rounded text-white font-mono text-[11px]">↵ Enter</kbd> to search
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              Press <kbd className="bg-white/15 px-1.5 py-0.5 rounded text-white font-mono text-[11px]">Esc</kbd> or click outside to close
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export { AppleSpotlight };
export default AppleSpotlight;
