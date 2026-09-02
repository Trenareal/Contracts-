import React from 'react';
import { FileEdit, Sparkles, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

interface BlankStarterPageProps {
  onStartDrafting: () => void;
}

export const BlankStarterPage: React.FC<BlankStarterPageProps> = ({ onStartDrafting }) => {
  return (
    <div className="min-h-[82vh] flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-xl w-full text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Minimal Icon Badge */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-blue-600/10 text-blue-600 border border-blue-600/20 shadow-sm mx-auto">
          <FileEdit className="w-10 h-10 stroke-[1.75]" />
        </div>

        {/* Heading & Subtitle */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Draft Your Contract
          </h1>
          <p className="text-sm sm:text-base text-slate-500 max-w-md mx-auto leading-relaxed">
            Create a custom agreement in minutes, send an instant signing link to your client, and download the stamped PDF once signed.
          </p>
        </div>

        {/* Feature Highlights Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-600 pt-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-full shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            100+ Trade Scopes
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-full shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            Instant E-Signature Link
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-full shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            Export Stamped PDF
          </span>
        </div>

        {/* Big Start Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onStartDrafting}
            className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-sm uppercase tracking-wider rounded-2xl shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
          >
            <span>Start Drafting Contract</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
