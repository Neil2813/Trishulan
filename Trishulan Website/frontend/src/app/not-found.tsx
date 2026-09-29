import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] bg-[#F7F9FB] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="max-w-md mx-auto space-y-6">
        <div className="w-20 h-20 bg-orange-100 text-[#EA580C] rounded-3xl flex items-center justify-center text-4xl mx-auto font-black shadow-inner">
          404
        </div>
        <div>
          <h1 className="text-3xl font-black text-[#0A1629] tracking-tight">
            Page Not Found
          </h1>
          <p className="text-sm text-[#64748B] mt-2 leading-relaxed">
            The page you are looking for might have been moved, renamed, or is temporarily unavailable on Trishulan.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl bg-[#0A1629] hover:bg-[#1E293B] text-white font-bold text-xs shadow-md transition-colors"
          >
            ← Back to Homepage
          </Link>
          <Link
            href="/rfq"
            className="px-6 py-3 rounded-xl bg-[#EA580C] hover:bg-[#c2410a] text-white font-bold text-xs shadow-md transition-colors"
          >
            Submit an RFQ
          </Link>
        </div>
      </div>
    </div>
  );
}
