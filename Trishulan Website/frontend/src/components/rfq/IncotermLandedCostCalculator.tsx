"use client";

import React, { useState, useMemo } from 'react';
import { Calculator, ShieldCheck, Truck, Percent, ArrowRight, HelpCircle } from 'lucide-react';

export type IncotermType = 'EXW' | 'FOB' | 'CIF' | 'DDP';

interface IncotermLandedCostCalculatorProps {
  initialUnitPrice?: number;
  initialQuantity?: number;
  initialCurrency?: string;
  initialIncoterm?: IncotermType;
  initialFreight?: number;
  initialTaxPercent?: number;
  onApply?: (calculatedLandedCost: number) => void;
  onClose?: () => void;
}

export default function IncotermLandedCostCalculator({
  initialUnitPrice = 1000,
  initialQuantity = 100,
  initialCurrency = 'INR',
  initialIncoterm = 'EXW',
  initialFreight = 0,
  initialTaxPercent = 18,
  onApply,
  onClose,
}: IncotermLandedCostCalculatorProps) {
  const [incoterm, setIncoterm] = useState<IncotermType>(initialIncoterm);
  const [unitPrice, setUnitPrice] = useState<number>(initialUnitPrice);
  const [quantity, setQuantity] = useState<number>(initialQuantity);
  const [currency, setCurrency] = useState<string>(initialCurrency);

  // Additional cost inputs
  const [originTrucking, setOriginTrucking] = useState<number>(incoterm === 'EXW' ? 2500 : 0);
  const [internationalFreight, setInternationalFreight] = useState<number>(initialFreight || (incoterm === 'EXW' || incoterm === 'FOB' ? 5000 : 0));
  const [insurancePercent, setInsurancePercent] = useState<number>(0.35); // 0.35% transit insurance
  const [customsDutyPercent, setCustomsDutyPercent] = useState<number>(incoterm === 'DDP' ? 0 : 7.5); // 7.5% BCD
  const [igstPercent, setIgstPercent] = useState<number>(initialTaxPercent); // 18% IGST
  const [destTransport, setDestTransport] = useState<number>(incoterm === 'DDP' ? 0 : 1500);

  // Calculation breakdown
  const calculation = useMemo(() => {
    const rawQuantity = Math.max(1, Number(quantity) || 1);
    const rawUnitPrice = Math.max(0, Number(unitPrice) || 0);
    const invoiceValue = rawUnitPrice * rawQuantity;

    let freightTotal = 0;
    let originTransportTotal = 0;
    let destinationTransportTotal = 0;
    let insuranceTotal = 0;
    let customsDutyTotal = 0;
    let swsTotal = 0; // Social Welfare Surcharge (10% of BCD)
    let igstTotal = 0;

    if (incoterm === 'EXW') {
      // Buyer pays origin transport, international freight, insurance, customs, taxes, dest transport
      originTransportTotal = Number(originTrucking) || 0;
      freightTotal = Number(internationalFreight) || 0;
      const assessableBase = invoiceValue + originTransportTotal + freightTotal;
      insuranceTotal = (assessableBase * (Number(insurancePercent) || 0)) / 100;
      const cifValue = assessableBase + insuranceTotal;
      customsDutyTotal = (cifValue * (Number(customsDutyPercent) || 0)) / 100;
      swsTotal = customsDutyTotal * 0.1; // 10% of BCD
      const assessableForGst = cifValue + customsDutyTotal + swsTotal;
      igstTotal = (assessableForGst * (Number(igstPercent) || 0)) / 100;
      destinationTransportTotal = Number(destTransport) || 0;
    } else if (incoterm === 'FOB') {
      // Seller loaded on vessel. Buyer pays freight, insurance, customs, taxes, dest transport
      freightTotal = Number(internationalFreight) || 0;
      const assessableBase = invoiceValue + freightTotal;
      insuranceTotal = (assessableBase * (Number(insurancePercent) || 0)) / 100;
      const cifValue = assessableBase + insuranceTotal;
      customsDutyTotal = (cifValue * (Number(customsDutyPercent) || 0)) / 100;
      swsTotal = customsDutyTotal * 0.1;
      const assessableForGst = cifValue + customsDutyTotal + swsTotal;
      igstTotal = (assessableForGst * (Number(igstPercent) || 0)) / 100;
      destinationTransportTotal = Number(destTransport) || 0;
    } else if (incoterm === 'CIF') {
      // Seller pays freight and insurance to destination port. Buyer pays customs, taxes, dest transport
      const cifValue = invoiceValue;
      customsDutyTotal = (cifValue * (Number(customsDutyPercent) || 0)) / 100;
      swsTotal = customsDutyTotal * 0.1;
      const assessableForGst = cifValue + customsDutyTotal + swsTotal;
      igstTotal = (assessableForGst * (Number(igstPercent) || 0)) / 100;
      destinationTransportTotal = Number(destTransport) || 0;
    } else if (incoterm === 'DDP') {
      // Delivered Duty Paid: Seller covers all shipping, duties, taxes and destination delivery
      // Buyer only pays the DDP invoice value
      igstTotal = (invoiceValue * (Number(igstPercent) || 0)) / 100;
    }

    const totalLandedCost =
      invoiceValue +
      originTransportTotal +
      freightTotal +
      insuranceTotal +
      customsDutyTotal +
      swsTotal +
      igstTotal +
      destinationTransportTotal;

    const landedCostPerUnit = totalLandedCost / rawQuantity;
    const additionalCostRatio = invoiceValue > 0 ? ((totalLandedCost - invoiceValue) / invoiceValue) * 100 : 0;

    return {
      invoiceValue,
      originTransportTotal,
      freightTotal,
      insuranceTotal,
      customsDutyTotal,
      swsTotal,
      igstTotal,
      destinationTransportTotal,
      totalLandedCost,
      landedCostPerUnit,
      additionalCostRatio,
    };
  }, [
    incoterm,
    unitPrice,
    quantity,
    originTrucking,
    internationalFreight,
    insurancePercent,
    customsDutyPercent,
    igstPercent,
    destTransport,
  ]);

  return (
    <div className="bg-card border border-line rounded-2xl shadow-xl overflow-hidden max-w-2xl w-full">
      {/* Header */}
      <div className="bg-[#0A1629] text-white p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-black">Incoterm Landed Cost Calculator</h3>
            <p className="text-[11px] text-slate-300">
              Align quote pricing into true destination delivery cost
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm w-7 h-7 rounded-full bg-white/10 flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
        {/* Incoterm Selector */}
        <div>
          <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">
            Select Quoted Incoterm
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['EXW', 'FOB', 'CIF', 'DDP'] as IncotermType[]).map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => setIncoterm(term)}
                className={`py-2 px-3 rounded-xl text-xs font-extrabold border transition-all ${
                  incoterm === term
                    ? 'bg-ink text-white border-ink shadow-sm'
                    : 'bg-white text-muted border-line hover:border-gray-400'
                }`}
              >
                {term}
              </button>
            ))}
          </div>
          <div className="mt-2 text-[11px] text-muted flex items-start gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-accent" />
            <span>
              {incoterm === 'EXW' && 'Ex Works: Buyer handles all origin pickup, export customs, freight, import duties, and inland transport.'}
              {incoterm === 'FOB' && 'Free on Board: Seller delivers to vessel port. Buyer covers ocean/air freight, insurance, duties, and inland delivery.'}
              {incoterm === 'CIF' && 'Cost, Insurance & Freight: Seller covers freight and marine insurance to destination port. Buyer pays customs, GST, and final transport.'}
              {incoterm === 'DDP' && 'Delivered Duty Paid: Seller delivers directly to buyer factory with all freight, duties, and taxes pre-paid.'}
            </span>
          </div>
        </div>

        {/* Primary Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-muted uppercase mb-1">
              Unit Price ({currency})
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={unitPrice}
              onChange={(e) => setUnitPrice(Number(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-white border border-line rounded-lg text-xs font-bold text-ink focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-muted uppercase mb-1">
              Order Quantity
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value) || 1)}
              className="w-full px-3 py-2 bg-white border border-line rounded-lg text-xs font-bold text-ink focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-muted uppercase mb-1">
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-line rounded-lg text-xs font-bold text-ink focus:outline-none focus:border-accent"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>
        </div>

        {/* Dynamic Incoterm Cost Adders */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-3">
          <span className="text-[11px] font-extrabold text-ink uppercase tracking-wider block">
            Applicable Transport & Regulatory Adders
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {incoterm === 'EXW' && (
              <div>
                <label className="block text-[11px] font-semibold text-muted mb-1">Origin Inland Trucking</label>
                <input
                  type="number"
                  min="0"
                  value={originTrucking}
                  onChange={(e) => setOriginTrucking(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-white border border-line rounded-md text-xs font-semibold"
                />
              </div>
            )}

            {(incoterm === 'EXW' || incoterm === 'FOB') && (
              <div>
                <label className="block text-[11px] font-semibold text-muted mb-1">International Ocean / Air Freight</label>
                <input
                  type="number"
                  min="0"
                  value={internationalFreight}
                  onChange={(e) => setInternationalFreight(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-white border border-line rounded-md text-xs font-semibold"
                />
              </div>
            )}

            {(incoterm === 'EXW' || incoterm === 'FOB') && (
              <div>
                <label className="block text-[11px] font-semibold text-muted mb-1">Transit Insurance (%)</label>
                <input
                  type="number"
                  min="0"
                  step="0.05"
                  value={insurancePercent}
                  onChange={(e) => setInsurancePercent(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-white border border-line rounded-md text-xs font-semibold"
                />
              </div>
            )}

            {incoterm !== 'DDP' && (
              <div>
                <label className="block text-[11px] font-semibold text-muted mb-1">Customs Duty / BCD (%)</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={customsDutyPercent}
                  onChange={(e) => setCustomsDutyPercent(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-white border border-line rounded-md text-xs font-semibold"
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-muted mb-1">IGST / GST (%)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={igstPercent}
                onChange={(e) => setIgstPercent(Number(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 bg-white border border-line rounded-md text-xs font-semibold"
              />
            </div>

            {incoterm !== 'DDP' && (
              <div>
                <label className="block text-[11px] font-semibold text-muted mb-1">Destination Factory Delivery</label>
                <input
                  type="number"
                  min="0"
                  value={destTransport}
                  onChange={(e) => setDestTransport(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-white border border-line rounded-md text-xs font-semibold"
                />
              </div>
            )}
          </div>
        </div>

        {/* Results Card */}
        <div className="bg-gradient-to-br from-orange-50 via-white to-amber-50 border border-orange-200 rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-orange-200/60 pb-3">
            <div>
              <div className="text-[11px] font-bold text-orange-800 uppercase tracking-wider">
                True Landed Cost Per Unit
              </div>
              <div className="text-2xl font-black text-ink">
                {currency} {calculation.landedCostPerUnit.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] font-bold text-muted uppercase">
                Invoice vs Landed Delta
              </div>
              <div className="text-sm font-extrabold text-orange-700">
                +{calculation.additionalCostRatio.toFixed(1)}% overhead
              </div>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-muted">
              <span>Base Goods (FOB / EXW Invoice):</span>
              <span className="font-semibold text-ink">{currency} {calculation.invoiceValue.toLocaleString('en-IN')}</span>
            </div>
            {calculation.originTransportTotal > 0 && (
              <div className="flex justify-between text-muted">
                <span>Origin Trucking / Export Handling:</span>
                <span className="font-semibold text-ink">{currency} {calculation.originTransportTotal.toLocaleString('en-IN')}</span>
              </div>
            )}
            {calculation.freightTotal > 0 && (
              <div className="flex justify-between text-muted">
                <span>International Freight:</span>
                <span className="font-semibold text-ink">{currency} {calculation.freightTotal.toLocaleString('en-IN')}</span>
              </div>
            )}
            {calculation.insuranceTotal > 0 && (
              <div className="flex justify-between text-muted">
                <span>Marine / Cargo Transit Insurance:</span>
                <span className="font-semibold text-ink">{currency} {calculation.insuranceTotal.toFixed(2)}</span>
              </div>
            )}
            {calculation.customsDutyTotal > 0 && (
              <div className="flex justify-between text-muted">
                <span>Customs Duty (BCD + SWS):</span>
                <span className="font-semibold text-ink">{currency} {(calculation.customsDutyTotal + calculation.swsTotal).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-muted">
              <span>IGST ({igstPercent}%):</span>
              <span className="font-semibold text-ink">{currency} {calculation.igstTotal.toFixed(2)}</span>
            </div>
            {calculation.destinationTransportTotal > 0 && (
              <div className="flex justify-between text-muted">
                <span>Destination Inland Delivery:</span>
                <span className="font-semibold text-ink">{currency} {calculation.destinationTransportTotal.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-ink pt-2 border-t border-orange-200">
              <span>Total Landed Commitment:</span>
              <span className="text-accent">{currency} {calculation.totalLandedCost.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          {onApply && (
            <button
              onClick={() => onApply(calculation.landedCostPerUnit)}
              className="w-full py-2.5 bg-accent hover:bg-accent-2 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5"
            >
              Apply Landed Cost to Quote Evaluation <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
