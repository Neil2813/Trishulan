import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

interface ServicePointsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ServicePointsModal({ isOpen, onClose }: ServicePointsModalProps) {
  const [searchCity, setSearchCity] = useState('');

  if (!isOpen) return null;

  const servicePoints = [
    {
      id: 1,
      city: 'Rajahmundry Hub',
      state: 'Andhra Pradesh',
      address: 'Industrial Development Zone, NH-16, Rajahmundry, AP - 533101',
      phone: '+91 883 245 9901',
      services: ['Material Inspection', 'Dispute Resolution', 'Escrow Desk', 'Weight Verification'],
      status: 'OPERATIONAL',
    },
    {
      id: 2,
      city: 'Guntur Industrial Hub',
      state: 'Andhra Pradesh',
      address: 'Auto Nagar Phase-2, Main Guntur Highway, Guntur - 522001',
      phone: '+91 863 299 8812',
      services: ['Quality Testing', 'Warehouse Storage', 'Logistics Terminal'],
      status: 'OPERATIONAL',
    },
    {
      id: 3,
      city: 'Vijayawada Central',
      state: 'Andhra Pradesh',
      address: 'Jawahar Autonagar Industrial Area, Vijayawada - 520007',
      phone: '+91 866 254 3300',
      services: ['Steel Quality Verification', 'GST Verification Desk', 'Logistics hub'],
      status: 'OPERATIONAL',
    },
    {
      id: 4,
      city: 'Mumbai MIDC Logistics Point',
      state: 'Maharashtra',
      address: 'TTC Industrial Area, Pawne, Navi Mumbai, MH - 400705',
      phone: '+91 22 6789 4400',
      services: ['Port Customs Clearance', 'Chem-Lab Testing', 'Buyer Escrow Desk'],
      status: 'OPERATIONAL',
    },
    {
      id: 5,
      city: 'Ahmedabad GIDC Service Point',
      state: 'Gujarat',
      address: 'Vatva GIDC Phase 4, Ahmedabad, GJ - 382445',
      phone: '+91 79 4001 2233',
      services: ['Polymer Testing', 'Machinery Inspection', 'Dispatch Audit'],
      status: 'OPERATIONAL',
    },
    {
      id: 6,
      city: 'Hyderabad Cherlapally Hub',
      state: 'Telangana',
      address: 'Cherlapally Industrial Estate, Phase 3, Hyderabad, TS - 500051',
      phone: '+91 40 2712 9988',
      services: ['Pharma Grade Testing', 'Logistics Dispatch', 'Verification Center'],
      status: 'OPERATIONAL',
    },
  ];

  const filteredPoints = servicePoints.filter((pt) =>
    pt.city.toLowerCase().includes(searchCity.toLowerCase()) ||
    pt.state.toLowerCase().includes(searchCity.toLowerCase()) ||
    pt.address.toLowerCase().includes(searchCity.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-[fadeIn_0.15s_ease]">
      <div className="bg-white rounded-[24px] max-w-3xl w-full p-6 md:p-8 shadow-2xl relative border border-gray-100 max-h-[85vh] flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center text-sm transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="mb-4 pr-10">
          <span className="text-[11px] font-bold text-[#EA580C] uppercase tracking-[.14em]">PHYSICAL VERIFICATION HUBS</span>
          <h3 className="text-[24px] font-black text-[#0A1629] mt-0.5">Trishulan Service Point Locations</h3>
          <p className="text-xs text-gray-500 mt-1">
            Verified physical centers across industrial corridors for quality testing, escrow collection, and weight inspection.
          </p>
        </div>

        {/* Search Input */}
        <div className="mb-4">
          <input
            type="text"
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            placeholder="Search by city, state, or hub name (e.g. Rajahmundry, Mumbai, Guntur)..."
            className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs font-semibold focus:outline-none focus:border-[#EA580C]"
          />
        </div>

        {/* List of Service Points */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {filteredPoints.length === 0 ? (
            <div className="text-center py-10 text-xs text-gray-500">No service points found matching your search.</div>
          ) : (
            filteredPoints.map((pt) => (
              <div key={pt.id} className="p-5 rounded-2xl bg-gray-50 border border-gray-200 hover:border-[#EA580C] transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-200 gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-[#EA580C] uppercase tracking-wider">{pt.state}</span>
                    <h4 className="text-[17px] font-extrabold text-[#0A1629]">{pt.city}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-[10px] font-extrabold">
                      ● {pt.status}
                    </span>
                    <span className="text-xs font-bold text-[#0A1629]">{pt.phone}</span>
                  </div>
                </div>

                <div className="mt-3 text-xs text-gray-600">
                  <span className="font-semibold text-gray-700 block">Address:</span>
                  <span>{pt.address}</span>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {pt.services.map((svc, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-gray-200 text-[11px] font-bold text-[#0A1629]">
                      <Check className="w-3 h-3 text-green-600" />
                      <span>{svc}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between text-[11px] text-gray-500">
          <span>Need a custom quality inspection at your factory?</span>
          <a href="/rfq" className="font-bold text-[#EA580C] hover:underline">Book Trishulan Inspector →</a>
        </div>

      </div>
    </div>
  );
}
