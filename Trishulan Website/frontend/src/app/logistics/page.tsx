import React, { useState } from 'react';
import { Truck } from 'lucide-react';

export default function LogisticsPage() {
  const [submitted, setSubmitted] = useState(false);
  const [serviceType, setServiceType] = useState('TRANSPORT');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [details, setDetails] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#FCFBF8] py-12 px-6">
      <div className="max-w-[800px] mx-auto bg-white rounded-[24px] border border-gray-200 shadow-xl p-8 md:p-10">
        
        <div className="text-center mb-8">
          <span className="text-[12px] font-bold text-emerald-600 uppercase tracking-wider">END-TO-END OPERATIONAL SUPPORT</span>
          <h1 className="text-[32px] font-black text-[#0A1629] mt-1">Logistics & Packing Services</h1>
          <p className="text-xs text-gray-500 mt-1">
            Book FTL/PTL Freight, Heavy Equipment Crating, Labour Insurance, and Industrial Workforce.
          </p>
        </div>

        {submitted ? (
          <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center text-emerald-900">
            <Truck className="w-10 h-10 text-emerald-700 mx-auto mb-2" />
            <h3 className="font-extrabold text-[18px]">Logistics Request Submitted</h3>
            <p className="text-xs text-emerald-700 mt-1">
              Integrated freight carriers will review your route specs and provide verified transit rates within 1 hour.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-[#0A1629] mb-1">Select Service</label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs font-bold bg-white"
              >
                <option value="TRANSPORT">Transport & Freight Shipping (FTL / PTL)</option>
                <option value="PACKING">Professional Industrial Packaging & Heavy Crating</option>
                <option value="INSURANCE">Site Labour & Cargo Transit Insurance</option>
                <option value="WORKFORCE">Skilled Industrial Worker Directory</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0A1629] mb-1">Pickup / Origin City</label>
                <input
                  type="text"
                  required
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="e.g. Mumbai Port, Maharashtra"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0A1629] mb-1">Destination City</label>
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Ahmedabad, Gujarat"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0A1629] mb-1">Cargo Specs & Tonnage Details</label>
              <textarea
                required
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Weight in MT, container dimensions, special handling (fragile/oversized machinery)..."
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-emerald-600"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg transition-all"
            >
              Get Instant Carrier Freight Quotes →
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
