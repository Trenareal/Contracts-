import React from 'react';
import { 
  FileText, 
  DollarSign, 
  ImageIcon, 
  PenTool, 
  CheckCircle2, 
  Layers, 
  FileCheck, 
  Download, 
  Loader2, 
  Eye, 
  ListChecks,
  Sparkles,
  Users,
  Building2,
  Lock
} from 'lucide-react';
import { ContractType } from '../types';
import { formatCurrency } from '../utils/formatters';

export type SectionKey = 'scope' | 'financials' | 'photos' | 'parties';

interface ContractSidebarToggleProps {
  activeSection: SectionKey;
  onSelectSection: (section: SectionKey) => void;
  viewMode: 'single' | 'all';
  onToggleViewMode: () => void;
  contractType: ContractType;
  title: string;
  selectedOccupationId: string;
  totalCost: number;
  currency: string;
  isEmployment: boolean;
  salaryAmount: number;
  salaryFrequency: string;
  hasMaterials: boolean;
  materialsCount: number;
  imagesCount: number;
  isSignedByAdmin: boolean;
  isLocked: boolean;
  isSubmitting: boolean;
  isGeneratingPdf: boolean;
  onOpenProofread: () => void;
  onDownloadPdfDraft: () => void;
  onSubmit: () => void;
}

export const ContractSidebarToggle: React.FC<ContractSidebarToggleProps> = ({
  activeSection,
  onSelectSection,
  viewMode,
  onToggleViewMode,
  contractType,
  title,
  selectedOccupationId,
  totalCost,
  currency,
  isEmployment,
  salaryAmount,
  salaryFrequency,
  hasMaterials,
  materialsCount,
  imagesCount,
  isSignedByAdmin,
  isLocked,
  isSubmitting,
  isGeneratingPdf,
  onOpenProofread,
  onDownloadPdfDraft,
  onSubmit,
}) => {
  // Compute completion checklist
  const isScopeDone = Boolean(title.trim() && selectedOccupationId);
  const isFinancialsDone = isEmployment ? salaryAmount > 0 : totalCost > 0;
  const isPhotosDone = imagesCount > 0;
  const isSignaturesDone = isSignedByAdmin;

  const completedCount = [isScopeDone, isFinancialsDone, isPhotosDone, isSignaturesDone].filter(Boolean).length;

  const sections: {
    key: SectionKey;
    number: string;
    label: string;
    subLabel: string;
    icon: React.ReactNode;
    isCompleted: boolean;
    statusText: string;
  }[] = [
    {
      key: 'scope',
      number: '1',
      label: 'Scope',
      subLabel: isEmployment ? 'Role & Duties' : 'Scope & Deliverables',
      icon: <FileText className="w-4 h-4" />,
      isCompleted: isScopeDone,
      statusText: isScopeDone ? 'Configured' : 'Preset Required',
    },
    {
      key: 'financials',
      number: '2',
      label: 'Cost and Spec',
      subLabel: isEmployment ? 'Salary & Terms' : 'Costs & Specs',
      icon: isEmployment ? <DollarSign className="w-4 h-4" /> : <Layers className="w-4 h-4" />,
      isCompleted: isFinancialsDone,
      statusText: isEmployment 
        ? (salaryAmount > 0 ? `${formatCurrency(salaryAmount, currency)} / ${salaryFrequency}` : 'Set Salary') 
        : (totalCost > 0 ? formatCurrency(totalCost, currency) : 'Set Cost'),
    },
    {
      key: 'photos',
      number: '3',
      label: 'Photos',
      subLabel: 'Visual Samples & Specs',
      icon: <ImageIcon className="w-4 h-4" />,
      isCompleted: isPhotosDone,
      statusText: imagesCount > 0 ? `${imagesCount} Attached` : 'Optional (0/20)',
    },
    {
      key: 'parties',
      number: '4',
      label: 'Signature',
      subLabel: 'Parties & Execution',
      icon: <PenTool className="w-4 h-4" />,
      isCompleted: isSignaturesDone,
      statusText: isSignedByAdmin ? 'Signed by You' : 'Signature Required',
    },
  ];

  return (
    <aside className="w-full md:w-64 lg:w-72 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 shrink-0 select-none">
      
      {/* Top Header & Completion Progress */}
      <div className="p-4 border-b border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase flex items-center gap-1.5">
            <ListChecks className="w-3.5 h-3.5 text-blue-400" />
            Steps
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold border border-slate-700">
            {completedCount} / 4 Done
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${
              isEmployment ? 'bg-emerald-500' : 'bg-blue-500'
            }`}
            style={{ width: `${(completedCount / 4) * 100}%` }}
          />
        </div>

        {/* View Mode Switcher (Single Focus vs Full Continuous View) */}
        <div className="pt-1 flex items-center justify-between text-[11px]">
          <span className="text-slate-400 font-medium">Layout:</span>
          <button
            type="button"
            onClick={onToggleViewMode}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium border border-slate-700 cursor-pointer transition-all active:scale-95"
            title="Toggle between single focus and continuous view"
          >
            {viewMode === 'single' ? (
              <>
                <Eye className="w-3 h-3 text-blue-400" />
                <span>Single Focus</span>
              </>
            ) : (
              <>
                <ListChecks className="w-3 h-3 text-emerald-400" />
                <span>Continuous View</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 4 Interactive Toggle Buttons */}
      <nav className="p-3 space-y-2 flex-1 overflow-y-auto">
        {sections.map((sec) => {
          const isActive = activeSection === sec.key;
          return (
            <button
              key={sec.key}
              type="button"
              onClick={() => onSelectSection(sec.key)}
              className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer border flex flex-col gap-1 relative group ${
                isActive
                  ? 'bg-slate-800 border-teal-500/40 text-white shadow-2xs'
                  : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              {/* Active Indicator Bar on left */}
              {isActive && (
                <div 
                  className={`absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full ${
                    isEmployment ? 'bg-teal-400' : 'bg-blue-400'
                  }`} 
                />
              )}

              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-mono font-bold shrink-0 ${
                    isActive
                      ? isEmployment ? 'bg-teal-500/20 text-teal-300' : 'bg-blue-500/20 text-blue-300'
                      : 'bg-slate-700 text-slate-300 group-hover:bg-slate-600'
                  }`}>
                    {sec.number}
                  </span>
                  <span className="font-semibold text-xs uppercase tracking-wider">
                    {sec.label}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {sec.isCompleted ? (
                    <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-[9px] font-bold">
                      ✓
                    </span>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pl-7 text-slate-400">
                <span className="truncate">{sec.subLabel}</span>
                <span className={`text-[10px] font-mono truncate ml-1 px-1.5 py-0.2 rounded ${
                  sec.isCompleted 
                    ? 'text-teal-300 bg-teal-950/60 font-medium' 
                    : 'text-slate-400 bg-slate-900/60'
                }`}>
                  {sec.statusText}
                </span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer Action Tools */}
      <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/60 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onOpenProofread}
            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-teal-300 hover:text-white rounded-lg text-[11px] font-semibold uppercase tracking-wider border border-slate-700 transition-all cursor-pointer active:scale-95 shadow-2xs"
            title="Proofread full agreement layout"
          >
            <FileCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>Proofread</span>
          </button>

          <button
            type="button"
            onClick={onDownloadPdfDraft}
            disabled={isGeneratingPdf}
            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[11px] font-semibold uppercase tracking-wider border border-slate-700 transition-all cursor-pointer active:scale-95 disabled:opacity-50 shadow-2xs"
            title="Download PDF document preview"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>{isGeneratingPdf ? 'PDF...' : 'PDF Preview'}</span>
          </button>
        </div>

        {!isLocked && (
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider text-white shadow-xs transition-all cursor-pointer active:scale-95 ${
              isEmployment
                ? 'bg-teal-700 hover:bg-teal-600'
                : 'bg-blue-600 hover:bg-blue-500'
            }`}
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5" />
            )}
            <span>{isSubmitting ? 'Generating...' : 'Generate Link'}</span>
          </button>
        )}
      </div>

    </aside>
  );
};
