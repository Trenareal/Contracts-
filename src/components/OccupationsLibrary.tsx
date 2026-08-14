import React, { useState } from 'react';
import { OCCUPATIONS_DATABASE, OccupationDefinition } from '../data/occupations';
import { formatCurrency } from '../utils/formatters';
import { 
  Briefcase, 
  Search, 
  Sparkles, 
  Plus, 
  Layers, 
  CheckCircle2,
  X
} from 'lucide-react';

interface OccupationsLibraryProps {
  onSelectOccupation: (occ: OccupationDefinition) => void;
  currency?: string;
}

export const OccupationsLibrary: React.FC<OccupationsLibraryProps> = ({
  onSelectOccupation,
  currency = 'NGN',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(OCCUPATIONS_DATABASE.map(o => o.category)))];

  const filteredOccupations = OCCUPATIONS_DATABASE.filter(occ => {
    const matchesCategory = selectedCategory === 'All' || occ.category === selectedCategory;
    const matchesSearch = 
      occ.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      occ.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      occ.defaultScope.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-5 sm:space-y-6 pb-24 md:pb-12 text-slate-900">
      {/* Sleek Banner */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white p-6 sm:p-8 border border-slate-800 shadow-lg relative overflow-hidden rounded-3xl">
        <div className="max-w-3xl relative z-10 space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-mono uppercase tracking-wider font-bold rounded-full">
            <Sparkles className="w-3 h-3 text-blue-400" />
            100+ Professional Occupations & Trades
          </span>
          <h2 className="text-xl sm:text-3xl font-serif font-normal text-white">
            Occupation & Trade Contract Generator
          </h2>
          <p className="text-xs sm:text-sm font-sans text-slate-300 leading-relaxed">
            Select any trade from Bespoke Tailoring, Structural Welding, Master Carpentry, Solar Engineering, Plumbing, Web Development, Catering to Heavy Mechanics.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 border border-slate-200 shadow-xs rounded-2xl">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search 100+ trades (Tailor, Welder, Carpenter, Solar, Mechanic)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-sans rounded-xl transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Filter Dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2 bg-slate-50 border border-slate-200 text-xs font-sans font-bold text-slate-900 focus:outline-none focus:border-blue-600 rounded-xl"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat} {cat === 'All' ? `(${OCCUPATIONS_DATABASE.length})` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Occupations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {filteredOccupations.map((occ) => {
          const defaultMaterialsCost = occ.defaultMaterials.reduce(
            (sum, item) => sum + (item.quantity * item.unitPrice),
            0
          );

          return (
            <div
              key={occ.id}
              className="bg-white border border-slate-200 hover:border-slate-400 shadow-xs hover:shadow-md transition-all flex flex-col justify-between p-5 group rounded-2xl"
            >
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 bg-slate-100 text-slate-900 group-hover:bg-blue-600 group-hover:text-white transition-colors rounded-xl">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-sm text-slate-900 leading-tight">
                        {occ.title}
                      </h3>
                      <span className="text-[10px] font-sans uppercase tracking-wider text-slate-500">
                        {occ.category}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Scope Snippet */}
                <p className="text-xs font-sans text-slate-600 line-clamp-3 leading-relaxed mb-3">
                  {occ.defaultScope}
                </p>

                {/* Materials Count & Sample Total */}
                <div className="bg-slate-50 p-3 border border-slate-200 text-xs font-sans space-y-1 mb-4 rounded-xl">
                  <div className="flex items-center justify-between text-slate-800 font-bold">
                    <span>Includes Specs Table:</span>
                    <span className="text-blue-700 font-mono">{occ.defaultMaterials.length} Items</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span>Default Estimate:</span>
                    <span className="font-mono font-bold text-slate-900">{formatCurrency(defaultMaterialsCost, currency)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onSelectOccupation(occ)}
                className="w-full py-2.5 px-3 bg-slate-900 hover:bg-blue-600 text-white text-xs font-sans font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 rounded-xl shadow-xs active:scale-98 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-blue-300" />
                <span>Draft with This Trade</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
