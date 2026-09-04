import React from 'react';
import { 
  FileText, 
  Plus, 
  Briefcase, 
  DollarSign, 
  Globe, 
  User, 
  LogOut, 
  LogIn,
  Sparkles,
  X,
  ChevronRight,
  ShieldCheck,
  Check,
  PanelLeftClose,
  FileCheck,
  Image as ImageIcon,
  PenTool,
  FolderLock,
  CheckCircle2,
  Lock,
  ArrowRight,
  Building2,
  Users
} from 'lucide-react';
import { CURRENCY_LIST } from '../utils/formatters';
import { SUPPORTED_LANGUAGES } from '../utils/i18n';
import { OccupationDefinition } from '../data/occupations';
import { UserBusinessProfile } from './OccupationSelectModal';
import { AuthUser, ContractType } from '../types';
import { AppLogo } from './AppLogo';

export type ContractSectionId = 'scope' | 'financials' | 'photos' | 'parties' | 'proofread';

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  // Current view context
  activeView: 'starter' | 'draft' | 'dashboard' | 'ready';
  // Contract Mode
  contractMode: ContractType;
  onContractModeChange: (mode: ContractType) => void;
  // Contract Sections
  activeSection?: 'scope' | 'financials' | 'photos' | 'parties' | 'proofread' | null;
  onSelectSection: (section: ContractSectionId) => void;
  // Page Navigation
  onNavigateToDraft: () => void;
  onNavigateToDashboard: () => void;
  contractsCount: number;
  completedContractsCount: number;
  // Auth & Login
  currentUser?: AuthUser | null;
  isFirebaseLoggedIn?: boolean;
  onOpenAuthModal?: () => void;
  onSignOut?: () => void;
  // Currency & Language
  selectedCurrency: string;
  onCurrencyChange: (code: string) => void;
  selectedLanguage: string;
  onLanguageChange: (langCode: string) => void;
  // Trade & Occupation
  onOpenOccupationModal?: () => void;
  userOccupation?: OccupationDefinition | null;
  userBusinessProfile?: UserBusinessProfile | null;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  isOpen,
  onClose,
  activeView,
  contractMode,
  onContractModeChange,
  activeSection,
  onSelectSection,
  onNavigateToDraft,
  onNavigateToDashboard,
  contractsCount,
  completedContractsCount,
  currentUser,
  isFirebaseLoggedIn = false,
  onOpenAuthModal,
  onSignOut,
  selectedCurrency,
  onCurrencyChange,
  selectedLanguage,
  onLanguageChange,
  onOpenOccupationModal,
  userOccupation,
  userBusinessProfile,
}) => {
  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage) || SUPPORTED_LANGUAGES[0];
  const currentCurrObj = CURRENCY_LIST.find(c => c.code === selectedCurrency) || CURRENCY_LIST[0];

  const contractSections = [
    {
      id: 'scope' as ContractSectionId,
      step: '1',
      title: 'Scope of Work',
      desc: 'Deliverables, milestones & terms',
      icon: FileText,
      color: 'text-blue-400',
    },
    {
      id: 'financials' as ContractSectionId,
      step: '2',
      title: 'Cost & Spec',
      desc: 'Pricing, salary, materials & deposit',
      icon: DollarSign,
      color: 'text-teal-400',
    },
    {
      id: 'photos' as ContractSectionId,
      step: '3',
      title: 'Photos & Attachments',
      desc: 'Up to 20 reference photo specs',
      icon: ImageIcon,
      color: 'text-sky-400',
    },
    {
      id: 'parties' as ContractSectionId,
      step: '4',
      title: 'Signatures & Parties',
      desc: 'Legal entities & digital execution',
      icon: PenTool,
      color: 'text-teal-300',
    },
    {
      id: 'proofread' as ContractSectionId,
      step: '5',
      title: 'Proofread Contract',
      desc: 'Instant audit, preview & publish',
      icon: FileCheck,
      color: 'text-teal-400',
      isSpecial: true,
    },
  ];

  return (
    <>
      {/* Backdrop overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 sm:w-80 bg-slate-900 text-white shadow-2xl transition-transform duration-300 ease-out flex flex-col justify-between border-r border-slate-800 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header & App Branding */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <AppLogo size="md" />

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer active:scale-95"
            title="Close navigation bar"
          >
            <PanelLeftClose className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-5">

          {/* CONTRACT MODE SWITCHER (Business vs Workers & Salary) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                Contract Mode
              </span>
              <span className="text-[9px] font-mono text-teal-300 uppercase bg-teal-500/15 px-1.5 py-0.5 rounded border border-teal-500/30 font-semibold">
                Select
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 bg-slate-950/40 p-1.5 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  onContractModeChange('business');
                  onClose();
                }}
                className={`flex flex-col items-center justify-center py-2 px-2 rounded-lg transition-all cursor-pointer text-center ${
                  contractMode === 'business'
                    ? 'bg-blue-600/20 text-white font-semibold border border-blue-400/40 shadow-2xs'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white border border-transparent'
                }`}
                title="Switch to Business mode"
              >
                <Building2 className="w-4 h-4 mb-1 text-blue-400" />
                <span className="text-xs font-semibold leading-tight">Business</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onContractModeChange('worker_employment');
                  onClose();
                }}
                className={`flex flex-col items-center justify-center py-2 px-2 rounded-lg transition-all cursor-pointer text-center ${
                  contractMode === 'worker_employment'
                    ? 'bg-teal-600/20 text-white font-semibold border border-teal-400/40 shadow-2xs'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white border border-transparent'
                }`}
                title="Switch to Workers & Salary mode"
              >
                <Users className="w-4 h-4 mb-1 text-teal-400" />
                <span className="text-xs font-semibold leading-tight">Workers & Salary</span>
              </button>
            </div>
          </div>

          {/* CONTRACT BUILDER TOGGLE BAR (Scope, Cost & Spec, Photos, Signatures, Proofread) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                Steps
              </span>
              <span className="text-[9px] font-mono text-teal-400 uppercase bg-teal-500/10 px-1.5 py-0.2 rounded border border-teal-500/20 font-semibold">
                Toggle Bar
              </span>
            </div>

            <div className="space-y-1 bg-slate-950/40 p-1.5 rounded-xl border border-slate-800">
              {contractSections.map((sec) => {
                const IconComponent = sec.icon;
                const isCurrent = activeSection === sec.id && activeView === 'draft';
                return (
                  <button
                    key={sec.id}
                    onClick={() => {
                      onSelectSection(sec.id);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all cursor-pointer group ${
                      isCurrent
                        ? 'bg-slate-800 text-teal-200 border border-teal-500/35 shadow-2xs'
                        : sec.isSpecial
                        ? 'bg-teal-950/30 text-teal-300 border border-teal-900/40 hover:bg-teal-900/30'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-mono font-bold shrink-0 ${
                        isCurrent 
                          ? 'bg-teal-500/20 text-teal-300' 
                          : sec.isSpecial 
                          ? 'bg-teal-500/20 text-teal-400' 
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {sec.step}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-semibold truncate leading-tight ${isCurrent ? 'text-white' : sec.isSpecial ? 'text-teal-300' : 'text-slate-200'}`}>
                          {sec.title}
                        </p>
                        <p className={`text-[10px] truncate leading-tight mt-0.5 ${isCurrent ? 'text-teal-200/80' : 'text-slate-400'}`}>
                          {sec.desc}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${isCurrent ? 'text-teal-300 translate-x-0.5' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* PAGES & REPOSITORY LINKS */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 px-2 font-bold">
              Pages & Workspace
            </span>

            <div className="space-y-1">
              {/* New Contract */}
              <button
                onClick={() => {
                  onNavigateToDraft();
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activeView === 'starter' || (activeView === 'draft' && !activeSection)
                    ? 'bg-slate-800 text-teal-300 border border-teal-500/30'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Plus className="w-4 h-4 text-teal-400" />
                  <span>New Contract</span>
                </div>
                <span className="text-[10px] font-mono bg-teal-950 text-teal-300 px-2 py-0.5 rounded-full border border-teal-800/40">
                  New
                </span>
              </button>

              {/* Contracts Repository */}
              <button
                onClick={() => {
                  onNavigateToDashboard();
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activeView === 'dashboard'
                    ? 'bg-slate-800 text-teal-300 border border-teal-500/30'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FolderLock className="w-4 h-4 text-blue-400" />
                  <span>Contract Repository</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300 font-bold">
                    {contractsCount}
                  </span>
                  {completedContractsCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono bg-teal-500/20 text-teal-300 border border-teal-500/40 font-bold">
                      {completedContractsCount} signed
                    </span>
                  )}
                </div>
              </button>

              {/* 100+ Trade Directory */}
              <button
                onClick={() => {
                  onClose();
                  if (onOpenOccupationModal) onOpenOccupationModal();
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Briefcase className="w-4 h-4 text-teal-400" />
                  <span>100+ Trade Directory</span>
                </div>
                <span className="text-[10px] font-mono bg-teal-950 text-teal-300 px-1.5 py-0.5 rounded-full border border-teal-800/40">
                  100+
                </span>
              </button>
            </div>
          </div>

          {/* CURRENCY & REGIONAL SETTINGS (Moved from top bar) */}
          <div className="space-y-2 pt-3 border-t border-slate-800">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 px-2 font-bold">
              Currency & Region
            </span>

            {/* Currency Selector */}
            <div className="bg-slate-800/70 p-2.5 rounded-xl border border-slate-700/70 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-300 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-blue-400" />
                  Contract Currency
                </span>
                <span className="text-[10px] font-mono font-bold text-blue-400">
                  {currentCurrObj.symbol} {currentCurrObj.code}
                </span>
              </div>
              <select
                value={selectedCurrency}
                onChange={(e) => onCurrencyChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-medium focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {CURRENCY_LIST.map((c) => (
                  <option key={c.code} value={c.code} className="bg-slate-900 text-white">
                    {c.flag} {c.symbol} {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Selector */}
            <div className="bg-slate-800/70 p-2.5 rounded-xl border border-slate-700/70 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-300 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  Language
                </span>
                <span className="text-[10px] font-medium text-slate-400">
                  {currentLangObj.name}
                </span>
              </div>
              <select
                value={selectedLanguage}
                onChange={(e) => onLanguageChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-medium focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="bg-slate-900 text-white">
                    {l.flag} {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

        </div>

        {/* Bottom Section: Account / Login & Status Strip */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/90 space-y-3">
          
          {/* USER LOGIN / PROFILE CARD */}
          {isFirebaseLoggedIn && currentUser ? (
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm shrink-0">
                    {currentUser.displayName ? currentUser.displayName.charAt(0) : currentUser.email ? currentUser.email.charAt(0) : 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">
                      {userBusinessProfile?.businessName || currentUser.displayName || currentUser.email?.split('@')[0] || 'Authenticated Account'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono truncate">
                      {currentUser.email || 'Cloud Synced'}
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                  Signed In
                </span>
              </div>

              <div className="flex items-center gap-1.5 pt-1 border-t border-slate-700/60">
                <button
                  onClick={() => {
                    onClose();
                    if (onOpenOccupationModal) onOpenOccupationModal();
                  }}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-200 text-[10px] font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <Briefcase className="w-3 h-3 text-blue-400 shrink-0" />
                  <span className="truncate">{userOccupation ? userOccupation.title.substring(0, 14) + '...' : 'Select Trade'}</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    if (onSignOut) onSignOut();
                  }}
                  className="py-1.5 px-2.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                  title="Sign out"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2">
              <div className="flex items-start justify-between gap-1.5">
                <div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-xs font-bold text-white">Account Access</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                    Sign in to save and sync contracts across devices.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  if (onOpenAuthModal) onOpenAuthModal();
                }}
                className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-sans font-bold text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
              >
                <LogIn className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Log In / Register</span>
              </button>
            </div>
          )}

          {/* Bottom Status Strip */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 px-0.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono">Cloud Synced</span>
            </div>
            <span className="font-mono text-slate-500">v2.4 Pro</span>
          </div>

        </div>

      </aside>
    </>
  );
};
