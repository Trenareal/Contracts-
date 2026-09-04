import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  RotateCcw, 
  Sparkles,
  FileCheck,
  DollarSign,
  Shield,
  Layers,
  Send
} from 'lucide-react';
import { ContractType } from '../types';

interface BlankStarterPageProps {
  onStartDrafting: (options?: { contractType?: ContractType; occupationId?: string }) => void;
}

export const BlankStarterPage: React.FC<BlankStarterPageProps> = ({ onStartDrafting }) => {
  const [savedDraftTitle, setSavedDraftTitle] = useState<string | null>(null);
  const [savedDraftType, setSavedDraftType] = useState<ContractType | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10 animate-in fade-in zoom-in-98 duration-300">
      
      {/* Top Header Introduction */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-blue-50 to-teal-50 text-slate-800 border border-teal-200/80 rounded-full text-xs font-semibold tracking-wide shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Professional Contract & Agreement Suite</span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Create & Sign Binding Agreements
        </h1>
        
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Select an agreement category below to get started. Build legally enforceable commercial contracts for clients and vendors, or clear employment agreements for workers and staff.
        </p>
      </div>

      {/* Saved Draft In-Progress Alert (if any) */}
      {savedDraftTitle && (
        <div className="bg-gradient-to-r from-blue-50/80 to-teal-50/80 border border-teal-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600 shrink-0 animate-ping" />
            <div className="min-w-0">
              <span className="text-[10px] font-mono uppercase font-semibold tracking-wider text-teal-700 block">
                Saved {savedDraftType === 'worker_employment' ? 'Workers & Salary Agreement' : 'Business Contract'} In Progress
              </span>
              <p className="text-sm font-semibold text-slate-900 truncate">
                {savedDraftTitle}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              type="button"
              onClick={handleDiscardSavedDraft}
              className="text-xs font-medium text-slate-500 hover:text-rose-600 hover:underline cursor-pointer px-2 py-1"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={() => onStartDrafting()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white text-xs font-semibold uppercase tracking-wider rounded-lg shadow-2xs cursor-pointer transition-all active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Resume</span>
            </button>
          </div>
        </div>
      )}

      {/* Two Main Category Introduction Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* CARD 1: BUSINESS CONTRACTS */}
        <div 
          onClick={() => onStartDrafting({ contractType: 'business' })}
          className="group relative bg-white border border-slate-200 hover:border-blue-500 rounded-2xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer active:scale-[0.99]"
        >
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-0.5 text-[11px] font-semibold font-mono uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 rounded-md">
                Commercial & B2B
              </span>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                Business Contracts
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                For commercial client engagements, contractor services, trade work orders, and supply deals. Defines exact deliverables, milestones, payment schedules, and photo specifications.
              </p>
            </div>

            {/* What's Included List */}
            <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-100 space-y-2 text-xs text-slate-700">
              <span className="font-semibold text-slate-900 block text-[11px] uppercase font-mono tracking-wider">
                Key Inclusions:
              </span>
              <ul className="space-y-1.5">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  <span>Project scope, milestones, and delivery timeline</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  <span>Advance deposit terms, milestone costs & balance due</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  <span>Itemized materials, equipment & up to 20 photo specs</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  <span>Remote client e-signing link or in-person execution</span>
                </li>
              </ul>
            </div>

            {/* Popular Presets */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-mono uppercase font-semibold text-slate-400 block tracking-wider">
                Popular Presets:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: 'Trade & Artisan Bespoke', id: 'tailor-bespoke' },
                  { label: 'Vendor Supply Agreement', id: 'biz-vendor-supply-contract' },
                  { label: 'Service Level Agreement', id: 'biz-service-level-agreement' },
                  { label: 'Construction & Fabrication', id: 'welder-structural' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartDrafting({ contractType: 'business', occupationId: item.id });
                    }}
                    className="px-2.5 py-1 text-xs font-medium bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 rounded-md transition-colors cursor-pointer"
                  >
                    + {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              For Clients & Vendors
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform uppercase tracking-wider">
              Start Business Contract <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* CARD 2: WORKERS AND SALARY */}
        <div 
          onClick={() => onStartDrafting({ contractType: 'worker_employment' })}
          className="group relative bg-white border border-slate-200 hover:border-teal-500 rounded-2xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer active:scale-[0.99]"
        >
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 border border-teal-200 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-0.5 text-[11px] font-semibold font-mono uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200 rounded-md">
                Staff & Employment
              </span>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-teal-600 transition-colors">
                Workers and Salary
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                For hiring staff, factory operators, field technicians, sales reps, and workshop assistants. Formalizes wage/salary terms, probation, roles, and company rules.
              </p>
            </div>

            {/* What's Included List */}
            <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-100 space-y-2 text-xs text-slate-700">
              <span className="font-semibold text-slate-900 block text-[11px] uppercase font-mono tracking-wider">
                Key Inclusions:
              </span>
              <ul className="space-y-1.5">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                  <span>Job role, daily duties & assigned supervisor</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                  <span>Monthly, weekly, or piece-rate salary & allowances</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                  <span>Probation duration, work schedule & leave allowances</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                  <span>Company code of conduct & worker e-signature link</span>
                </li>
              </ul>
            </div>

            {/* Popular Presets */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-mono uppercase font-semibold text-slate-400 block tracking-wider">
                Popular Presets:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: 'Full-Time Staff', id: 'emp-full-time-staff' },
                  { label: 'Factory / Workshop Crew', id: 'emp-factory-workshop-worker' },
                  { label: 'Sales & Commission Rep', id: 'emp-sales-marketing-executive' },
                  { label: 'Driver & Logistics', id: 'emp-driver-logistics-officer' },
                  { label: 'Apprentice / Trainee', id: 'emp-apprentice-trainee-stipend' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartDrafting({ contractType: 'worker_employment', occupationId: item.id });
                    }}
                    className="px-2.5 py-1 text-xs font-medium bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-200 hover:border-teal-300 rounded-md transition-colors cursor-pointer"
                  >
                    + {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              For Staff & Crew
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 group-hover:translate-x-0.5 transition-transform uppercase tracking-wider">
              Start Worker Agreement <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

      </div>

      {/* 3 Simple Workflow Steps */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-2xs space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 uppercase font-mono tracking-wider text-center">
          How It Works
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1.5">
            <div className="w-8 h-8 mx-auto rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
              1
            </div>
            <h4 className="text-xs font-semibold text-slate-900">Choose Agreement Type</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Select Business for client & vendor projects, or Workers & Salary for employment.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1.5">
            <div className="w-8 h-8 mx-auto rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
              2
            </div>
            <h4 className="text-xs font-semibold text-slate-900">Customize Terms</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Fill in scope, pricing or salary math, attach photo blueprints, and proofread live.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1.5">
            <div className="w-8 h-8 mx-auto rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
              3
            </div>
            <h4 className="text-xs font-semibold text-slate-900">Sign & Export</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Share a secure 1-click signing link or sign in person, then export a sealed PDF.
            </p>
          </div>
        </div>
      </div>

      {/* Assurance Feature Badges */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-slate-600 pt-2">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
          <span>E-Signature Compliant</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
          <span>Automated Financial & Salary Math</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Remote Link & In-Person Signing</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
          <span>Instant Stamped PDF Output</span>
        </div>
      </div>

    </div>
  );
};
