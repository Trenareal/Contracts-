import React from 'react';
import { CURRENCY_LIST, CurrencyOption, formatCurrency } from '../utils/formatters';
import { DollarSign, Check, Globe, Sparkles } from 'lucide-react';

interface CurrencyManagerProps {
  selectedCurrency: string;
  onSelectCurrency: (code: string) => void;
}

export const CurrencyManager: React.FC<CurrencyManagerProps> = ({
  selectedCurrency,
  onSelectCurrency,
}) => {
  return (
    <div className="space-y-6 pb-24 md:pb-12 text-slate-900">
      {/* Banner */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white p-6 sm:p-8 border border-slate-800 shadow-lg rounded-3xl">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-mono uppercase tracking-wider font-bold mb-3 rounded-full">
            <DollarSign className="w-3.5 h-3.5 text-blue-400" />
            Global Financial Currencies
          </span>
          <h2 className="text-xl sm:text-3xl font-serif font-normal text-white">
            Multi-Currency Manager
          </h2>
          <p className="text-xs sm:text-sm font-sans text-slate-300 leading-relaxed mt-2">
            Execute binding contracts in any world currency from Nigerian Naira (₦) to US Dollars ($), Euros (€), Japanese Yen (¥), British Pounds (£), UAE Dirham (د.إ), Saudi Riyal, South African Rand (R), Ghanaian Cedi (₵), and 25+ others!
          </p>
        </div>
      </div>

      {/* Grid of Currencies */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {CURRENCY_LIST.map((curr) => {
          const isSelected = curr.code.toLowerCase() === selectedCurrency.toLowerCase();

          return (
            <button
              key={curr.code}
              type="button"
              onClick={() => onSelectCurrency(curr.code)}
              className={`p-4 sm:p-5 border text-left transition-all cursor-pointer flex flex-col justify-between rounded-2xl ${
                isSelected
                  ? 'bg-blue-50/80 border-blue-500 shadow-md ring-2 ring-blue-500/30'
                  : 'bg-white border-slate-200 hover:border-slate-400 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{curr.flag}</span>
                  <div>
                    <span className="font-mono font-bold text-sm text-slate-900">{curr.code}</span>
                    <p className="text-[11px] font-sans text-slate-500">{curr.name}</p>
                  </div>
                </div>
                {isSelected && (
                  <span className="p-1 bg-blue-600 text-white rounded-full">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>

              {/* Sample Format Preview */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between font-mono text-xs text-slate-700">
                <span className="text-[10px] font-sans text-slate-400">Sample (100k):</span>
                <span className="font-bold text-blue-700">{formatCurrency(100000, curr.code)}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
