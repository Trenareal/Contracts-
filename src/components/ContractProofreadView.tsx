import React from 'react';
import { ContractMaterialItem, ContractImage, PartyDetails, ContractType, SalaryDetails } from '../types';
import { formatCurrency } from '../utils/formatters';
import { getI18nText } from '../utils/i18n';
import { MaterialsTable } from './MaterialsTable';
import { ImageUploader } from './ImageUploader';
import { OccupationDefinition } from '../data/occupations';
import { 
  FileCheck, ArrowLeft, ArrowRight, UserCheck, Download, 
  DollarSign, Calendar, Lock, FileText, Building, 
  User, CheckCircle2, Sparkles, Layers, Image as ImageIcon,
  ShieldCheck, Loader2, Users, Briefcase, Clock, Award
} from 'lucide-react';

export interface ProofreadContractData {
  title: string;
  category: string;
  contractType?: ContractType;
  salaryDetails?: SalaryDetails;
  occupation?: string;
  description: string;
  termsAndConditions: string;
  totalCost: number;
  depositAmount: number;
  currency: string;
  language: string;
  deliveryDate: string;
  hasMaterialsTable: boolean;
  materialsList: ContractMaterialItem[];
  images: ContractImage[];
  adminParty: PartyDetails;
  clientParty?: Partial<PartyDetails>;
}

interface ContractProofreadViewProps {
  data: ProofreadContractData;
  occupationDefinition?: OccupationDefinition | null;
  onBackToEdit: () => void;
  onConfirmPublish: () => void;
  onSignInPerson?: () => void;
  onDownloadPdfDraft: () => void;
  isSubmitting?: boolean;
  isGeneratingPdf?: boolean;
}

export const ContractProofreadView: React.FC<ContractProofreadViewProps> = ({
  data,
  occupationDefinition,
  onBackToEdit,
  onConfirmPublish,
  onSignInPerson,
  onDownloadPdfDraft,
  isSubmitting = false,
  isGeneratingPdf = false,
}) => {
  const i18n = getI18nText(data.language || 'en');
  const isEmployment = data.contractType === 'worker_employment';
  const salary = data.salaryDetails;
  const balanceDue = Math.max(0, data.totalCost - data.depositAmount);

  return (
    <div className="max-w-4xl mx-auto py-2 sm:py-4 px-2 sm:px-4 animate-in fade-in duration-300 space-y-4">
      
      {/* Proofreading Banner & Action Toolbar */}
      <div className="bg-slate-900 text-white rounded-3xl p-4 sm:p-6 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
              isEmployment ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400/30' : 'bg-blue-500/20 text-blue-400 border-blue-400/30'
            }`}>
              {isEmployment ? <Users className="w-6 h-6" /> : <FileCheck className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase rounded-full border ${
                  isEmployment 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' 
                    : 'bg-blue-500/20 text-blue-300 border-blue-400/30'
                }`}>
                  {isEmployment ? 'Worker & Employment Contract Review' : 'Proofreading & Pre-Execution Review'}
                </span>
                {occupationDefinition && (
                  <span className="px-2.5 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-sans font-semibold rounded-full">
                    {occupationDefinition.title}
                  </span>
                )}
              </div>
              <h1 className="text-lg sm:text-2xl font-bold text-white tracking-tight mt-1">
                {isEmployment ? 'Proofread Employment & Salary Agreement' : 'Proofread Commercial Contract Document'}
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                Carefully verify all clauses, {isEmployment ? 'remuneration structure, job duties' : 'itemized deliverables, costs'}, and party details before publishing.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
            <button
              type="button"
              onClick={onBackToEdit}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold uppercase tracking-wider rounded-xl border border-slate-700 transition-all cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Edit Form</span>
            </button>

            <button
              type="button"
              onClick={onDownloadPdfDraft}
              disabled={isGeneratingPdf}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold uppercase tracking-wider rounded-xl border border-slate-700 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              title="Download unsealed PDF draft"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>{isGeneratingPdf ? 'PDF...' : 'PDF Draft'}</span>
            </button>
          </div>
        </div>

        {/* Primary Next Action Split (Remote vs In-Person) */}
        <div className="pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          {/* Remote Client / Worker Action */}
          <button
            type="button"
            onClick={onConfirmPublish}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 px-5 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer active:scale-98"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <ArrowRight className="w-4 h-4 text-white" />
            )}
            <span>{isSubmitting ? 'Publishing...' : (isEmployment ? 'Publish & Get Worker Signing Link' : 'Publish & Get Remote Signing Link')}</span>
          </button>

          {/* In-Person Client / Worker Action */}
          {onSignInPerson && (
            <button
              type="button"
              onClick={onSignInPerson}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer active:scale-98"
            >
              <UserCheck className="w-4 h-4 text-white" />
              <span>{isEmployment ? 'Worker is Present: Sign in Person Now' : 'Client is Present: Sign in Person Now'}</span>
            </button>
          )}

        </div>
      </div>

      {/* Main Document Body Formatted Layout */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl shadow-sm overflow-hidden text-slate-900">
        
        {/* Document Header */}
        <div className="p-5 sm:p-8 border-b border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1.5 max-w-xl">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
                {isEmployment ? 'Company & Worker Employment Contract' : 'Official Trade & Commercial Agreement'}
              </span>
              <h2 className="text-xl sm:text-3xl font-serif font-bold text-slate-900 leading-tight">
                {data.title || (isEmployment ? 'Employment Agreement' : 'Untitled Agreement')}
              </h2>
              <div className="flex items-center gap-2 text-xs font-sans text-slate-600 flex-wrap">
                <span className={`font-semibold px-2.5 py-0.5 rounded-md border ${
                  isEmployment 
                    ? 'text-emerald-900 bg-emerald-50 border-emerald-200' 
                    : 'text-blue-900 bg-blue-50 border-blue-200'
                }`}>
                  {data.category}
                </span>
                <span>•</span>
                <span>Language: <strong className="uppercase font-mono">{data.language}</strong></span>
                <span>•</span>
                <span>Currency: <strong className="uppercase font-mono">{data.currency}</strong></span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-left sm:text-right min-w-[190px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Verification State
              </span>
              <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-300 text-[10px] font-bold uppercase rounded-md">
                Proofreading (Pre-Sign)
              </span>
            </div>
          </div>

          {/* Key Financial / Salary Snapshot */}
          {isEmployment ? (
            <div className="space-y-3 bg-emerald-50/60 p-4 border border-emerald-200 rounded-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white p-3 border border-emerald-200 rounded-xl">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800 mb-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Base {salary?.paymentFrequency || 'Monthly'} Salary</span>
                  </div>
                  <p className="text-xl font-bold font-serif text-emerald-950">
                    {formatCurrency(salary?.baseSalary ?? data.totalCost, data.currency)}
                  </p>
                  <span className="text-[10px] text-slate-500 block mt-0.5 capitalize">
                    Paid {salary?.paymentFrequency || 'monthly'}
                  </span>
                </div>

                <div className="bg-white p-3 border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                    <span>Designation & Type</span>
                  </div>
                  <p className="text-base font-bold font-serif text-slate-900 truncate">
                    {salary?.jobTitle || 'Staff Member'}
                  </p>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 inline-block mt-0.5 capitalize">
                    {(salary?.employmentType || 'full_time').replace('_', '-')}
                  </span>
                </div>

                <div className="bg-white p-3 border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Start Date & Probation</span>
                  </div>
                  <p className="text-base font-bold font-serif text-slate-900">
                    {data.deliveryDate ? new Date(data.deliveryDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Immediate'}
                  </p>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Probation: {salary?.probationPeriod || '3 Months'}
                  </span>
                </div>
              </div>

              {/* Extra Employment Details Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Work Schedule</span>
                  <span className="font-medium text-slate-800">{salary?.workingHours || 'Mon - Fri (40 hrs/wk)'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Benefits & Allowances</span>
                  <span className="font-medium text-slate-800">{salary?.allowances || 'Standard statutory'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Annual Leave / Notice</span>
                  <span className="font-medium text-slate-800">{salary?.leaveDays || '21 Days'} • {salary?.noticePeriod || '30 Days Notice'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 border border-slate-200 rounded-2xl">
              <div className="bg-white p-3 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                  <span>{i18n.totalCost || 'Total Contract Fee'}</span>
                </div>
                <p className="text-xl font-bold font-serif text-slate-900">
                  {formatCurrency(data.totalCost, data.currency)}
                </p>
              </div>

              <div className="bg-white p-3 border border-blue-200 rounded-xl">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 mb-1">
                  <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                  <span>{i18n.depositAmount || 'Upfront Deposit'}</span>
                </div>
                <p className="text-xl font-bold font-serif text-blue-900">
                  {formatCurrency(data.depositAmount, data.currency)}
                </p>
                <span className="text-[10px] text-slate-500 block mt-0.5">Due before work starts</span>
              </div>

              <div className="bg-white p-3 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{i18n.deliveryDate || 'Target Delivery Date'}</span>
                </div>
                <p className="text-base font-bold font-serif text-slate-900">
                  {data.deliveryDate ? new Date(data.deliveryDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Milestone Based'}
                </p>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Balance: {formatCurrency(balanceDue, data.currency)}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="p-5 sm:p-8 space-y-6">
          
          {/* Section: Parties Overview */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
              <User className="w-4 h-4 text-blue-600" />
              Contracting Parties
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Party A */}
              <div className="bg-blue-50/40 border border-blue-200 rounded-2xl p-4 space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase text-blue-800 tracking-wider block">
                  {isEmployment ? 'Party A: Employer / Company Signatory' : 'Party A: Contractor / Service Provider'}
                </span>
                <p className="text-sm font-bold text-slate-900">{data.adminParty.name}</p>
                <p className="text-xs text-slate-600">{data.adminParty.company} {data.adminParty.title ? `— ${data.adminParty.title}` : ''}</p>
                <p className="text-xs text-slate-600">{data.adminParty.email}</p>
                {data.adminParty.phone && <p className="text-xs text-slate-600">{data.adminParty.phone}</p>}
                
                <div className="pt-2 border-t border-blue-200/60 mt-2">
                  <span className="text-[10px] font-bold text-slate-500 block mb-1">
                    {isEmployment ? 'Employer Authorized Signature:' : 'Provider Digital Signature:'}
                  </span>
                  {data.adminParty.signature ? (
                    <div className="h-12 bg-white border border-blue-200 rounded-lg p-1 flex items-center justify-center">
                      <img src={data.adminParty.signature} alt="Provider Signature" className="max-h-10 object-contain" />
                    </div>
                  ) : (
                    <span className="text-xs italic text-slate-400">Signed with typed name</span>
                  )}
                </div>
              </div>

              {/* Party B */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider block">
                  {isEmployment ? 'Party B: Worker / Employee' : 'Party B: Client / Buyer'}
                </span>
                <p className="text-sm font-bold text-slate-900">
                  {data.clientParty?.name || (isEmployment ? 'Pending Worker Acceptance' : 'Pending Client Acceptance')}
                </p>
                <p className="text-xs text-slate-600">
                  {data.clientParty?.company ? data.clientParty.company : (isEmployment ? 'Designated Staff / Worker' : 'Client Representative')}
                </p>
                <p className="text-xs text-slate-600">{data.clientParty?.email || 'Email provided at e-sign'}</p>
                
                <div className="pt-2 border-t border-slate-200 mt-2">
                  <span className="text-[10px] font-bold text-slate-500 block mb-1">
                    {isEmployment ? 'Worker Acceptance Signature:' : 'Client Digital Signature:'}
                  </span>
                  {data.clientParty?.signature ? (
                    <div className="h-12 bg-white border border-slate-200 rounded-lg p-1 flex items-center justify-center">
                      <img src={data.clientParty.signature} alt="Client Signature" className="max-h-10 object-contain" />
                    </div>
                  ) : (
                    <span className="text-xs italic text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block">
                      {isEmployment ? 'Awaiting Worker Signature' : 'Awaiting Client Signature'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section: Scope / Job Duties */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
              <FileText className="w-4 h-4 text-blue-600" />
              {isEmployment ? 'Job Description, Key Duties & Responsibilities' : 'Scope of Work & Deliverables'}
            </h3>
            <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-mono">
              {data.description || 'No specific scope entered.'}
            </div>
          </div>

          {/* Section: Itemized Table */}
          {data.hasMaterialsTable && data.materialsList && data.materialsList.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                <Layers className="w-4 h-4 text-blue-600" />
                {isEmployment ? 'Company Asset, Tool & Equipment Allocation' : 'Itemized Work & Material Specifications'}
              </h3>
              <MaterialsTable
                materials={data.materialsList}
                currency={data.currency}
                readOnly={true}
              />
            </div>
          )}

          {/* Section: Visual Attachments */}
          {data.images && data.images.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                <ImageIcon className="w-4 h-4 text-blue-600" />
                Attached Visual Assets & Specifications ({data.images.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                {data.images.map((img, idx) => (
                  <div key={img.id || idx} className="space-y-1">
                    <div className="aspect-4/3 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                      <img src={img.url} alt={img.caption || `Image ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                    {img.caption && (
                      <p className="text-[10px] font-bold text-slate-600 truncate">{img.caption}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Terms and Conditions */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              {isEmployment ? 'Company Terms & Conditions, Code of Conduct & Workplace Policies' : 'Terms & Conditions of Contract'}
            </h3>
            <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl text-[11px] text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">
              {data.termsAndConditions || 'Standard legal conditions apply.'}
            </div>
          </div>

        </div>

        {/* Document Footer Bar */}
        <div className="bg-slate-100 border-t border-slate-200 px-5 sm:px-8 py-3.5 text-center text-xs text-slate-500">
          <p>
            This document preview represents the legally binding {isEmployment ? 'Employment Agreement' : 'Commercial Contract'} terms upon digital execution by both parties.
          </p>
        </div>

      </div>

      {/* Floating Bottom Sticky Action Bar */}
      <div className="sticky bottom-3 bg-slate-900/95 backdrop-blur-md text-white p-3.5 sm:p-4 rounded-2xl border border-slate-800 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-white block">Document Proofread Complete</span>
            <span className="text-slate-400">Ready for digital link dispatch or instant on-site signature</span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={onBackToEdit}
            className="flex-1 sm:flex-none px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold uppercase rounded-xl border border-slate-700 cursor-pointer"
          >
            Edit
          </button>
          
          {onSignInPerson && (
            <button
              type="button"
              onClick={onSignInPerson}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Sign In Person</span>
            </button>
          )}

          <button
            type="button"
            onClick={onConfirmPublish}
            disabled={isSubmitting}
            className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>Publish Link</span>
          </button>
        </div>
      </div>

    </div>
  );
};
