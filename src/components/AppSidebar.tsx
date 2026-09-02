import React from 'react';
import { 
  FileText, 
  Plus, 
  Briefcase, 
  DollarSign, 
  Globe, 
  User, 
  LogOut, 
  Sparkles,
  X,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Check,
  PanelLeftClose,
  Layers,
  Settings,
  HelpCircle,
  FolderLock
} from 'lucide-react';
import { CURRENCY_LIST } from '../utils/formatters';
import { SUPPORTED_LANGUAGES } from '../utils/i18n';
import { OccupationDefinition } from '../data/occupations';
import { UserBusinessProfile } from './OccupationSelectModal';
import { Building } from 'lucide-react';

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'contracts' | 'occupations' | 'currency' | 'language';
  setActiveTab: (tab: 'contracts' | 'occupations' | 'currency' | 'language') => void;
  onOpenCreateModal: () => void;
  currentUser?: { displayName?: string | null; email?: string | null } | null;
  userOccupation?: OccupationDefinition | null;
  userBusinessProfile?: UserBusinessProfile | null;
  onOpenOccupationModal?: () => void;
  onOpenAuthModal?: () => void;
  onSignOut?: () => void;
  selectedCurrency: string;
  onCurrencyChange: (code: string) => void;
  selectedLanguage: string;
  onLanguageChange: (langCode: string) => void;
  contractsCount?: number;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  onOpenCreateModal,
  currentUser,
  userOccupation,
  userBusinessProfile,
  onOpenOccupationModal,
  onOpenAuthModal,
  onSignOut,
  selectedCurrency,
  onCurrencyChange,
  selectedLanguage,
  onLanguageChange,
  contractsCount = 0,
}) => {
  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage) || SUPPORTED_LANGUAGES[0];
  const currentCurrObj = CURRENCY_LIST.find(c => c.code === selectedCurrency) || CURRENCY_LIST[0];

  return (
    <>
      {/* Backdrop overlay for mobile / open drawer */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-neutral-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
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
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center font-serif font-black text-base shadow-md shadow-blue-900/50 border border-blue-400/30">
              C
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-sans font-extrabold tracking-tight text-base text-white">
                  CONTRACT<span className="font-light italic text-blue-400">S</span>
                </span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-700/50">
                  Pro
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                E-Sign & Trade Contract Suite
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer active:scale-95"
            title="Close sidebar"
          >
            <PanelLeftClose className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation & Extras */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          
          {/* User Profile Card */}
          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm uppercase shadow-sm">
                {currentUser?.displayName ? currentUser.displayName.charAt(0) : currentUser?.email ? currentUser.email.charAt(0) : 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {userBusinessProfile?.businessName || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User Profile'}
                </p>
                <p className="text-[11px] text-slate-400 font-mono truncate">
                  {currentUser?.email || 'Authenticated Account'}
                </p>
              </div>
            </div>

            {/* Active Profession Trade with quick switch */}
            {userOccupation ? (
              <div className="pt-2 border-t border-slate-700/80 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <Briefcase className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="text-xs text-slate-200 truncate font-medium">{userOccupation.title}</span>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    if (onOpenOccupationModal) onOpenOccupationModal();
                  }}
                  className="px-2 py-1 text-[10px] font-sans font-bold uppercase tracking-wider rounded-lg bg-blue-950 hover:bg-blue-900 text-blue-300 border border-blue-700/60 transition-all cursor-pointer"
                >
                  Change
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  if (onOpenOccupationModal) onOpenOccupationModal();
                }}
                className="w-full py-2 px-3 text-xs font-bold rounded-xl bg-blue-950 hover:bg-blue-900 text-blue-300 border border-blue-700/60 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Briefcase className="w-3.5 h-3.5" />
                Select Trade / Occupation
              </button>
            )}
          </div>

          {/* Quick Create Action */}
          <button
            onClick={() => {
              onClose();
              onOpenCreateModal();
            }}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-sans font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create New Contract</span>
          </button>

          {/* Navigation Links */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 px-3 font-semibold">
              Workspace
            </span>

            <button
              onClick={() => {
                setActiveTab('contracts');
                onClose();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'contracts'
                  ? 'bg-blue-600/20 text-blue-300 font-bold border border-blue-500/40'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>Contracts Overview</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300">
                {contractsCount}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('occupations');
                onClose();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'occupations'
                  ? 'bg-blue-600/20 text-blue-300 font-bold border border-blue-500/40'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Briefcase className="w-4 h-4 text-blue-400" />
                <span>100+ Trade Directory</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-950 text-blue-300 font-bold border border-blue-700/50">
                100+
              </span>
            </button>
          </div>

          {/* Localization & Preferences Group */}
          <div className="space-y-1 pt-2 border-t border-slate-800">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 px-3 font-semibold">
              Settings & Regional
            </span>

            {/* Currency Menu Item */}
            <button
              onClick={() => {
                setActiveTab('currency');
                onClose();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'currency'
                  ? 'bg-blue-600/20 text-blue-300 font-bold border border-blue-500/40'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <DollarSign className="w-4 h-4 text-blue-400" />
                <span>Multi-Currency</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-blue-400">
                <span>{currentCurrObj.flag}</span>
                <span>{currentCurrObj.code}</span>
              </div>
            </button>

            {/* Language Menu Item */}
            <button
              onClick={() => {
                setActiveTab('language');
                onClose();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'language'
                  ? 'bg-blue-600/20 text-blue-300 font-bold border border-blue-500/40'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-blue-400" />
                <span>Language & Region</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-medium text-blue-300">
                <span>{currentLangObj.flag}</span>
                <span>{currentLangObj.code.toUpperCase()}</span>
              </div>
            </button>
          </div>

        </div>

        {/* Bottom Footer Actions */}
        <div className="p-4 border-t border-slate-800 space-y-2 bg-slate-950/60">
          <button
            onClick={() => {
              onClose();
              if (onOpenOccupationModal) onOpenOccupationModal();
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-blue-600/15 hover:bg-blue-600/25 text-blue-300 border border-blue-500/20 text-xs font-sans font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
          >
            <User className="w-3.5 h-3.5" />
            <span>Edit Profile & Trade</span>
          </button>

          <div className="text-center pt-1">
            <span className="text-[10px] text-slate-500 font-mono">
              Electronic Signature Cloud • Active
            </span>
          </div>
        </div>

      </aside>
    </>
  );
};
