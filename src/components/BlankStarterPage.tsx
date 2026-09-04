import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  RotateCcw, 
  Briefcase, 
  DollarSign, 
  ShieldCheck, 
  FileText,
  Wrench,
  TrendingUp,
  Truck,
  Sparkles
} from 'lucide-react';
import { ContractType } from '../types';

interface BlankStarterPageProps {
  onStartDrafting: (options?: { contractType?: ContractType; occupationId?: string }) => void;
}

export const BlankStarterPage: React.FC<BlankStarterPageProps> = ({ onStartDrafting }) => {
  const [savedDraftTitle, setSavedDraftTitle] = useState<string | null>(null);
  const [savedDraftType, setSavedDraftType] = useState<ContractType | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('contract_app_active_draft');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && (parsed.title || parsed.selectedOccupationId || parsed.description)) {
          setSavedDraftTitle(parsed.title || 'In-Progress Agreement');
          setSavedDraftType(parsed.contractType || 'business');
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const handleDiscardSavedDraft = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Discard the previously saved draft and start fresh?')) {
      try {
        sessionStorage.removeItem('contract_app_active_draft');
        sessionStorage.removeItem('contract_app_is_drafting');
      } catch {}
      setSavedDraftTitle(null);
      setSavedDraftType(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 animate-in fade-in zoom-in-98 duration-300">
      
      {/* Top Main Heading */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200/80 rounded-full text-xs font-bold uppercase tracking-wider shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Professional Contract & Agreement Suite</span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          What would you like to draft today?
        </h1>
        
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Create legally enforceable contracts for commercial business partnerships or company agreements for workers, staff roles, and salary terms.
        </p>
      </div>

      {/* Saved Draft Alert Box */}
      {savedDraftTitle && (
        <div className="bg-blue-50 border-2 border-blue-200/90 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-3 h-3 rounded-full bg-blue-600 shrink-0 animate-ping" />
            <div className="min-w-0">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-blue-700 block">
                Saved {savedDraftType === 'worker_employment' ? 'Worker & Salary Agreement' : 'Business Contract'} Draft Found
              </span>
              <p className="text-sm font-bold text-slate-900 truncate">
                {savedDraftTitle}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              type="button"
              onClick={handleDiscardSavedDraft}
              className="text-xs font-bold text-slate-500 hover:text-rose-600 hover:underline cursor-pointer px-2 py-1"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={() => onStartDrafting()}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs cursor-pointer transition-all active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Resume Draft</span>
            </button>
          </div>
        </div>
      )}

      {/* Primary Drafting Choice Cards: Business vs Workers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 pt-2">
        
        {/* OPTION 1: DRAFT FOR BUSINESS */}
        <div 
          onClick={() => onStartDrafting({ contractType: 'business' })}
          className="group relative bg-white border-2 border-slate-200 hover:border-blue-500 rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer active:scale-[0.99]"
        >
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="w-13 h-13 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                <Building2 className="w-7 h-7" />
              </div>
              <span className="px-2.5 py-1 text-[11px] font-bold font-mono uppercase tracking-wider bg-slate-100 text-slate-700 rounded-lg">
                B2B & Trade Deals
              </span>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                Draft for Business
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Create binding commercial contracts, client service agreements, trade & artisan work orders, vendor supply deals, and project deliverables with milestones and deposit terms.
              </p>
            </div>

            {/* Quick Template Chips for Business */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-mono uppercase font-bold text-slate-400 block tracking-wider">
                Popular Business Presets:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: 'Trade & Artisan Bespoke', id: 'tailor-bespoke' },
                  { label: 'Corporate Vendor Supply', id: 'biz-vendor-supply-contract' },
                  { label: 'Corporate SLA & Retainer', id: 'biz-service-level-agreement' },
                  { label: 'Construction & Welder', id: 'welder-structural' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartDrafting({ contractType: 'business', occupationId: item.id });
                    }}
                    className="px-2.5 py-1 text-xs font-semibold bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 rounded-lg transition-colors cursor-pointer"
                  >
                    + {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              Includes: Scope, Deposits, Materials & E-Sign
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform uppercase tracking-wider">
              Draft Business Contract <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>

        {/* OPTION 2: DRAFT FOR WORKERS & EMPLOYMENT */}
        <div 
          onClick={() => onStartDrafting({ contractType: 'worker_employment' })}
          className="group relative bg-white border-2 border-slate-200 hover:border-emerald-500 rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer active:scale-[0.99]"
        >
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                <Users className="w-7 h-7" />
              </div>
              <span className="px-2.5 py-1 text-[11px] font-bold font-mono uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg">
                Staff & Salaries
              </span>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                Draft for Workers & Staff
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Draft agreements between companies and workers detailing monthly/weekly salary, job responsibilities, probationary terms, company code of conduct, and workplace rules.
              </p>
            </div>

            {/* Quick Template Chips for Workers */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-mono uppercase font-bold text-slate-400 block tracking-wider">
                Popular Worker & Salary Presets:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: 'Full-Time Staff & Salary', id: 'emp-full-time-staff' },
                  { label: 'Workshop / Factory Worker', id: 'emp-factory-workshop-worker' },
                  { label: 'Sales & Commission Rep', id: 'emp-sales-marketing-executive' },
                  { label: 'Driver & Logistics Fleet', id: 'emp-driver-logistics-officer' },
                  { label: 'Security & Facility Guard', id: 'emp-security-guard-contract' },
                  { label: 'Apprentice / Trainee Stipend', id: 'emp-apprentice-trainee-stipend' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartDrafting({ contractType: 'worker_employment', occupationId: item.id });
                    }}
                    className="px-2.5 py-1 text-xs font-semibold bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 rounded-lg transition-colors cursor-pointer"
                  >
                    + {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              Includes: Monthly Salary, Probation, Rules & Sign
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform uppercase tracking-wider">
              Draft Worker Agreement <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>

      </div>

      {/* Feature Guarantee Badges */}
      <div className="pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="font-semibold">B2B & Employment Compliant</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">Automated Salary & Compensation Math</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="font-semibold">Remote & In-Person E-Signature</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">Instant Stamped PDF Generation</span>
        </div>
      </div>

    </div>
  );
};
