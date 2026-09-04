import React, { useState } from 'react';
import { Contract, CreateContractPayload } from '../types';
import { ContractForm } from './ContractForm';
import { InPersonSigningModal } from './InPersonSigningModal';
import { generateContractPDF } from '../utils/pdfGenerator';
import { formatCurrency } from '../utils/formatters';
import { OccupationDefinition } from '../data/occupations';
import { UserBusinessProfile } from './OccupationSelectModal';
import { 
  FileText, Plus, Copy, ExternalLink, Download, Ban, Trash2, 
  Search, ShieldCheck, DollarSign, Clock, CheckCircle2, AlertCircle,
  FileCheck, RefreshCw, Eye, Sparkles, Lock, ArrowUpRight, Edit3, User, LogOut, LogIn, Briefcase,
  MoreVertical, X, Check, ArrowRight, Building, UserCheck
} from 'lucide-react';

interface AdminDashboardProps {
  contracts: Contract[];
  user?: { displayName?: string | null; email?: string | null } | null;
  userOccupation?: OccupationDefinition | null;
  userBusinessProfile?: UserBusinessProfile | null;
  onOpenOccupationModal?: () => void;
  onOpenAuthModal?: () => void;
  onSignOut?: () => void;
  onCreateContract: (payload: CreateContractPayload) => void;
  onUpdateContract: (contractId: string, payload: CreateContractPayload) => void;
  onCompleteContract: (contractId: string) => void;
  onInvalidateLink: (contractId: string) => void;
  onDeleteContract: (contractId: string) => void;
  onOpenClientPortal: (contract: Contract) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  contracts,
  user,
  userOccupation,
  userBusinessProfile,
  onOpenOccupationModal,
  onOpenAuthModal,
  onSignOut,
  onCreateContract,
  onUpdateContract,
  onCompleteContract,
  onInvalidateLink,
  onDeleteContract,
  onOpenClientPortal,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed' | 'draft'>('all');
  const [selectedAuditContract, setSelectedAuditContract] = useState<Contract | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [mobileActionContract, setMobileActionContract] = useState<Contract | null>(null);
  const [inPersonSigningContract, setInPersonSigningContract] = useState<Contract | null>(null);

  // Metrics
  const totalValue = contracts.reduce((acc, c) => acc + c.totalCost, 0);
  const totalDeposits = contracts.reduce((acc, c) => acc + c.depositAmount, 0);
  const pendingCount = contracts.filter((c) => c.status === 'pending_signature' && !c.linkInvalidated).length;
  const completedCount = contracts.filter((c) => c.status === 'completed').length;

  // Filtering
  const filteredContracts = contracts.filter((c) => {
    const matchesSearch = 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.clientParty?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.clientParty?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'pending') return c.status === 'pending_signature' && !c.linkInvalidated;
    if (activeTab === 'completed') return c.status === 'completed';
    if (activeTab === 'draft') return c.status === 'draft' || c.linkInvalidated;
    return true;
  });

  const copySigningLink = (contract: Contract) => {
    const origin = window.location.origin;
    const link = `${origin}/?token=${contract.signingToken}`;
    navigator.clipboard.writeText(link);
    setCopiedToken(contract.signingToken);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-20 md:pb-12 text-slate-900">
      
      {/* Top Banner & Overview Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-50 text-blue-900 border border-blue-200 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-blue-600" />
              Contract Management Hub
            </span>
            {userBusinessProfile?.businessName && (
              <button
                onClick={onOpenOccupationModal}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/10 text-blue-950 border border-blue-200 text-xs font-sans font-bold hover:bg-blue-600 hover:text-white transition-all cursor-pointer group"
                title="Click to edit business name & trade"
              >
                <Building className="w-3 h-3 text-blue-600 group-hover:text-white" />
                <span>{userBusinessProfile.businessName}</span>
              </button>
            )}
            {userOccupation && (
              <button
                onClick={onOpenOccupationModal}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200 text-xs font-sans font-bold hover:bg-blue-50 hover:text-blue-900 hover:border-blue-200 transition-all cursor-pointer"
                title="Click to switch your trade"
              >
                <Briefcase className="w-3 h-3 text-blue-600" />
                <span>{userOccupation.title}</span>
              </button>
            )}
          </div>

          <h1 className="text-xl sm:text-3xl font-serif font-normal tracking-tight text-slate-900">
            Professional Contract Overview
          </h1>
          <p className="text-xs sm:text-sm font-sans text-slate-600 max-w-2xl leading-relaxed">
            Generate customized agreements, attach materials & photo specs, collect electronic client signatures, and export official archived PDFs.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-sans font-bold uppercase tracking-wider shadow-lg shadow-blue-600/25 active:scale-98 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white stroke-[2.5]" />
            <span>Create New Contract</span>
          </button>
        </div>
      </div>

      {/* Modern Smooth Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Metric 1: Total Value */}
        <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="font-sans text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-500 font-bold">
              Total Contract Value
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xl sm:text-2xl font-serif font-bold text-slate-900 truncate">
              {formatCurrency(totalValue, 'NGN')}
            </p>
            <p className="text-[11px] font-sans text-slate-500 truncate mt-0.5">
              {formatCurrency(totalDeposits, 'NGN')} upfront deposit
            </p>
          </div>
        </div>

        {/* Metric 2: Pending Signatures */}
        <div className="bg-white rounded-3xl border border-blue-200 p-4 sm:p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="font-sans text-[10px] sm:text-[11px] uppercase tracking-wider text-blue-800 font-bold">
              Pending Signatures
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xl sm:text-2xl font-serif font-bold text-blue-900">
              {pendingCount}
            </p>
            <p className="text-[11px] font-sans text-blue-800/80 truncate mt-0.5">
              Awaiting client authorization
            </p>
          </div>
        </div>

        {/* Metric 3: Executed & Archived */}
        <div className="bg-white rounded-3xl border border-emerald-200 p-4 sm:p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="font-sans text-[10px] sm:text-[11px] uppercase tracking-wider text-emerald-800 font-bold">
              Executed & Archived
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xl sm:text-2xl font-serif font-bold text-emerald-900">
              {completedCount}
            </p>
            <p className="text-[11px] font-sans text-emerald-800/80 truncate mt-0.5">
              Electronically bound & archived
            </p>
          </div>
        </div>

        {/* Metric 4: Total Managed */}
        <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="font-sans text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-500 font-bold">
              Total Contracts
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xl sm:text-2xl font-serif font-bold text-slate-900">
              {contracts.length}
            </p>
            <p className="text-[11px] font-sans text-slate-500 truncate mt-0.5">
              Audit log verified
            </p>
          </div>
        </div>

      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        
        {/* Scrollable Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {(['all', 'pending', 'completed', 'draft'] as const).map((tab) => {
            const label = 
              tab === 'all' ? `All (${contracts.length})` :
              tab === 'pending' ? `Pending (${pendingCount})` :
              tab === 'completed' ? `Executed (${completedCount})` :
              `Draft / Revoked`;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-2 text-xs font-sans font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search contracts or clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-blue-600 rounded-xl text-xs text-slate-900 focus:outline-none transition-all"
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

      </div>

      {/* Contract List */}
      <div className="space-y-4">
        {filteredContracts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-14 text-center shadow-xs my-4 space-y-4">
            <div className="w-16 h-16 bg-blue-50 text-blue-800 border border-blue-200 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
              <FileText className="w-8 h-8 text-blue-700" />
            </div>

            <div className="max-w-md mx-auto space-y-1.5">
              <h3 className="text-xl font-serif font-normal text-slate-900">
                No Contracts Found
              </h3>
              <p className="text-xs font-sans text-slate-500 leading-relaxed">
                {userOccupation ? (
                  <>You are drafting under <span className="font-bold text-blue-900">{userOccupation.title}</span>. No contracts currently match your search or filter.</>
                ) : (
                  <>Create your first trade contract to get started with e-signatures.</>
                )}
              </p>
            </div>

            <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-sans font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center gap-2 active:scale-98"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>Create Contract</span>
              </button>

              {onOpenOccupationModal && (
                <button
                  onClick={onOpenOccupationModal}
                  className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2"
                >
                  <Briefcase className="w-4 h-4 text-slate-600" />
                  <span>{userOccupation ? 'Switch Trade' : 'Select Trade'}</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          filteredContracts.map((contract) => {
            const isCompleted = contract.status === 'completed';
            const isLinkInvalid = contract.linkInvalidated;

            return (
              <div
                key={contract.id}
                className="bg-white rounded-3xl border border-slate-200 hover:border-blue-400/80 p-5 sm:p-7 shadow-xs hover:shadow-md transition-all space-y-4"
              >
                {/* Card Header & Main Info */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
                  
                  <div className="space-y-2 max-w-xl">
                    {/* Tags & Status Row */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-1 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200">
                        {contract.category}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        Ref: {contract.id}
                      </span>

                      {/* Status Chip */}
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : isLinkInvalid
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                          : 'bg-blue-50 text-blue-800 border border-blue-200'
                      }`}>
                        {isCompleted ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Executed
                          </>
                        ) : isLinkInvalid ? (
                          <>
                            <Ban className="w-3.5 h-3.5 text-rose-600" />
                            Revoked
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5 text-blue-600" />
                            Active Link
                          </>
                        )}
                      </span>
                    </div>

                    {/* Contract Title */}
                    <h3 className="text-xl sm:text-2xl font-serif font-normal text-slate-900 leading-snug">
                      {contract.title}
                    </h3>

                    <p className="text-xs font-sans text-slate-600 line-clamp-2 leading-relaxed">
                      {contract.description}
                    </p>
                  </div>

                  {/* Financials & Client Info Strip */}
                  <div className="grid grid-cols-2 gap-4 border-t lg:border-t-0 lg:border-l border-slate-200 pt-3 lg:pt-0 lg:pl-6 bg-slate-50 p-4 rounded-2xl">
                    
                    <div>
                      <span className="font-sans text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
                        Total Fee
                      </span>
                      <span className="text-lg sm:text-xl font-serif font-bold text-slate-900 block">
                        {formatCurrency(contract.totalCost, contract.currency)}
                      </span>
                      <span className="text-[11px] font-sans text-emerald-700 font-medium block mt-0.5">
                        Deposit: {formatCurrency(contract.depositAmount, contract.currency)}
                      </span>
                    </div>

                    <div>
                      <span className="font-sans text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
                        Client Party
                      </span>
                      <span className="text-xs sm:text-sm font-sans font-bold text-slate-900 block truncate">
                        {contract.clientParty?.name || 'Pending Client Fill'}
                      </span>
                      <span className="text-[11px] font-sans text-slate-500 block truncate">
                        {contract.clientParty?.email || 'Awaiting link access'}
                      </span>
                    </div>

                  </div>

                </div>

                {/* Responsive Actions Bar */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/80 p-3 rounded-2xl">
                  
                  {/* Link Copy Widget */}
                  <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                    {!isCompleted && !isLinkInvalid ? (
                      <button
                        onClick={() => copySigningLink(contract)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-slate-900 hover:text-white border border-slate-200 rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95"
                      >
                        {copiedToken === contract.signingToken ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                            <span>Copy Signing Link</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <span className="text-xs font-mono text-slate-500 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                        {isCompleted ? 'Link Locked (No New Links)' : 'Link Revoked'}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons Row */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    
                    {/* Mark as Completed Button */}
                    {!isCompleted ? (
                      <button
                        onClick={() => onCompleteContract(contract.id)}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95"
                        title="Mark contract as completed and permanently lock signing links"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        <span>Completed</span>
                      </button>
                    ) : (
                      <span className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-sans font-bold uppercase tracking-wider">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Completed</span>
                      </span>
                    )}

                    {/* In-Person Client Direct Sign (If not signed yet) */}
                    {!isCompleted && !contract.clientParty?.signedAt && !isLinkInvalid && (
                      <button
                        onClick={() => setInPersonSigningContract(contract)}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95"
                        title="Client is in-person: Sign on this screen now"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Sign In-Person</span>
                      </button>
                    )}

                    {/* Client Portal Preview */}
                    <button
                      onClick={() => onOpenClientPortal(contract)}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95"
                      title="Simulate client opening link"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-600" />
                      <span>Portal</span>
                    </button>

                    {/* PDF Download */}
                    <button
                      onClick={() => generateContractPDF(contract)}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95"
                      title="Download official PDF"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-400" />
                      <span>PDF</span>
                    </button>

                    {/* Desktop Full Actions */}
                    <div className="hidden sm:flex items-center gap-2">
                      {!isCompleted && !contract.clientParty?.signedAt ? (
                        <button
                          onClick={() => setEditingContract(contract)}
                          className="flex items-center gap-1 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs"
                          title="Edit Contract Scope & Terms"
                        >
                          <Edit3 className="w-3 h-3 text-white" />
                          <span>Edit</span>
                        </button>
                      ) : (
                        <span 
                          className="flex items-center gap-1 px-3 py-2 bg-slate-100 text-slate-400 text-xs font-sans font-medium uppercase rounded-xl border border-slate-200"
                          title="This contract has been signed or completed and cannot be edited to preserve legal validity"
                        >
                          <Lock className="w-3 h-3 text-slate-400" />
                          <span>Locked</span>
                        </span>
                      )}

                      <button
                        onClick={() => setSelectedAuditContract(contract)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-900 hover:text-white border border-slate-200 rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>Audit</span>
                      </button>

                      {!isCompleted && !isLinkInvalid && (
                        <button
                          onClick={() => onInvalidateLink(contract.id)}
                          className="p-2 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                          title="Revoke signing link"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => onDeleteContract(contract.id)}
                        className="p-2 text-slate-500 hover:text-rose-800 hover:bg-rose-100/50 rounded-xl transition-colors cursor-pointer"
                        title="Delete contract"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Mobile 3-Dots Action Button */}
                    <button
                      onClick={() => setMobileActionContract(contract)}
                      className="sm:hidden p-2 bg-white border border-slate-200 text-slate-700 hover:text-slate-900 rounded-xl cursor-pointer active:scale-95 shadow-xs"
                      title="More Actions"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                  </div>

                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Mobile Contract Actions Bottom Sheet */}
      {mobileActionContract && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="fixed inset-0"
            onClick={() => setMobileActionContract(null)}
          />
          <div className="relative bg-slate-900 text-white border-t border-slate-800 rounded-t-3xl shadow-2xl p-5 space-y-4 pb-safe">
            
            <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto mb-1" />

            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-blue-400 block">Contract #{mobileActionContract.id}</span>
                <h4 className="font-serif font-normal text-base text-white truncate max-w-[240px]">
                  {mobileActionContract.title}
                </h4>
              </div>
              <button
                onClick={() => setMobileActionContract(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 font-sans text-xs">
              
              {/* In-Person Client Direct Sign (If not completed & not signed) */}
              {!mobileActionContract.status.includes('completed') && !mobileActionContract.clientParty?.signedAt && !mobileActionContract.linkInvalidated && (
                <button
                  onClick={() => {
                    const c = mobileActionContract;
                    setMobileActionContract(null);
                    setInPersonSigningContract(c);
                  }}
                  className="w-full flex items-center gap-3 p-3.5 bg-emerald-600 hover:bg-emerald-500 rounded-2xl text-white font-bold cursor-pointer shadow-sm"
                >
                  <UserCheck className="w-4 h-4 text-white" />
                  <span>Client Sign In-Person Now</span>
                </button>
              )}

              {/* Mark as Completed */}
              {!mobileActionContract.status.includes('completed') ? (
                <button
                  onClick={() => {
                    onCompleteContract(mobileActionContract.id);
                    setMobileActionContract(null);
                  }}
                  className="w-full flex items-center gap-3 p-3.5 bg-emerald-600 hover:bg-emerald-500 rounded-2xl text-white font-bold cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark Contract as Completed (Lock Links)</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 rounded-2xl">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>Contract Completed & Archived (New links locked)</span>
                </div>
              )}

              {/* Download PDF */}
              <button
                onClick={() => {
                  generateContractPDF(mobileActionContract);
                  setMobileActionContract(null);
                }}
                className="w-full flex items-center gap-3 p-3.5 bg-slate-800 hover:bg-slate-700 rounded-2xl text-white font-medium cursor-pointer"
              >
                <Download className="w-4 h-4 text-blue-400" />
                <span>Download Official PDF Document</span>
              </button>

              {/* Copy Signing Link */}
              {!mobileActionContract.status.includes('completed') && !mobileActionContract.linkInvalidated && (
                <button
                  onClick={() => {
                    copySigningLink(mobileActionContract);
                    setMobileActionContract(null);
                  }}
                  className="w-full flex items-center gap-3 p-3.5 bg-blue-600 hover:bg-blue-500 rounded-2xl text-white font-bold cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Client Signing Link</span>
                </button>
              )}

              {/* Edit (Blocked if signed by client or completed) */}
              {!mobileActionContract.status.includes('completed') && !mobileActionContract.clientParty?.signedAt ? (
                <button
                  onClick={() => {
                    setEditingContract(mobileActionContract);
                    setMobileActionContract(null);
                  }}
                  className="w-full flex items-center gap-3 p-3.5 bg-slate-800 hover:bg-slate-700 rounded-2xl text-white font-medium cursor-pointer"
                >
                  <Edit3 className="w-4 h-4 text-blue-400" />
                  <span>Edit Contract Scope & Terms</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-slate-800/60 border border-slate-700 text-slate-400 rounded-2xl">
                  <Lock className="w-4 h-4 shrink-0 text-slate-400" />
                  <span>Editing Locked (Signed / Executed Agreement)</span>
                </div>
              )}

              {/* Audit Log */}
              <button
                onClick={() => {
                  setSelectedAuditContract(mobileActionContract);
                  setMobileActionContract(null);
                }}
                className="w-full flex items-center gap-3 p-3.5 bg-slate-800 hover:bg-slate-700 rounded-2xl text-white font-medium"
              >
                <FileCheck className="w-4 h-4 text-blue-400" />
                <span>Security Audit Trail ({mobileActionContract.auditTrail?.length || 0} events)</span>
              </button>

              {/* Revoke Link */}
              {!mobileActionContract.status.includes('completed') && !mobileActionContract.linkInvalidated && (
                <button
                  onClick={() => {
                    onInvalidateLink(mobileActionContract.id);
                    setMobileActionContract(null);
                  }}
                  className="w-full flex items-center gap-3 p-3.5 bg-slate-800/80 text-rose-300 border border-rose-500/30 rounded-2xl font-medium"
                >
                  <Ban className="w-4 h-4" />
                  <span>Revoke / Invalidate Link</span>
                </button>
              )}

              {/* Delete */}
              <button
                onClick={() => {
                  onDeleteContract(mobileActionContract.id);
                  setMobileActionContract(null);
                }}
                className="w-full flex items-center gap-3 p-3.5 bg-rose-950/50 text-rose-300 border border-rose-500/30 rounded-2xl font-bold"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>Delete Contract</span>
              </button>

            </div>

          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {(showCreateModal || editingContract) && (
        <ContractForm
          initialContract={editingContract}
          isEditing={!!editingContract}
          defaultOccupation={userOccupation}
          defaultBusinessProfile={userBusinessProfile}
          onSave={(payload) => {
            if (editingContract) {
              onUpdateContract(editingContract.id, payload);
              setEditingContract(null);
            } else {
              onCreateContract(payload);
              setShowCreateModal(false);
            }
          }}
          onCancel={() => {
            setShowCreateModal(false);
            setEditingContract(null);
          }}
        />
      )}

      {/* Audit Log Modal */}
      {selectedAuditContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 max-w-xl w-full p-6 sm:p-8 space-y-4 shadow-2xl rounded-3xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h3 className="text-lg sm:text-xl font-serif font-normal text-slate-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-600" />
                Security Audit Log
              </h3>
              <button
                onClick={() => setSelectedAuditContract(null)}
                className="text-slate-400 hover:text-slate-900 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="font-sans text-xs text-slate-500">
              Contract Reference: <span className="font-mono text-slate-900 font-bold">{selectedAuditContract.id}</span>
            </p>

            <div className="space-y-2.5 overflow-y-auto flex-1 pr-1">
              {selectedAuditContract.auditTrail?.map((evt, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 space-y-1 rounded-2xl">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-sans font-bold text-slate-900 uppercase tracking-wider">{evt.action}</span>
                    <span className="font-mono text-[10px] text-slate-400">{new Date(evt.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-xs font-sans text-slate-700">{evt.details || `Executed by ${evt.actor}`}</p>
                  {evt.ipAddress && (
                    <p className="text-[10px] font-mono text-slate-400">IP: {evt.ipAddress}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* In-Person Direct Signing Modal */}
      {inPersonSigningContract && (
        <InPersonSigningModal
          contract={inPersonSigningContract}
          onSuccess={(updated) => {
            setInPersonSigningContract(null);
          }}
          onClose={() => setInPersonSigningContract(null)}
        />
      )}

    </div>
  );
};
