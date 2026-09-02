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
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Check,
  PanelLeft,
  SlidersHorizontal
} from 'lucide-react';
import { CURRENCY_LIST } from '../utils/formatters';
import { SUPPORTED_LANGUAGES } from '../utils/i18n';
import { OccupationDefinition } from '../data/occupations';
import { UserBusinessProfile } from './OccupationSelectModal';

interface NavigationBarProps {
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
  onToggleSidebar: () => void;
  isSidebarOpen?: boolean;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
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
  onToggleSidebar,
  isSidebarOpen = false,
}) => {
  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage) || SUPPORTED_LANGUAGES[0];
  const currentCurrObj = CURRENCY_LIST.find(c => c.code === selectedCurrency) || CURRENCY_LIST[0];

  return (
    <>
      {/* Top Modern Header */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-15 sm:h-16">
            
            {/* Left: Sidebar Toggle Button + Brand Logo */}
            <div className="flex items-center gap-2 sm:gap-4">
              
              {/* Sidebar Open/Close Toggle Button */}
              <button
                type="button"
                onClick={onToggleSidebar}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white hover:text-blue-300 border border-white/15 transition-all cursor-pointer active:scale-95 shadow-xs"
                title={isSidebarOpen ? "Close sidebar" : "Open sidebar menu"}
                aria-label="Toggle navigation sidebar"
              >
                <PanelLeft className="w-4 h-4 text-blue-400" />
                <span className="hidden sm:inline text-xs font-sans font-bold uppercase tracking-wider text-slate-200">
                  Menu
                </span>
              </button>

              {/* Brand Logo & Name */}
              <button
                onClick={() => setActiveTab('contracts')}
                className="flex items-center gap-2 font-sans font-bold text-base sm:text-lg tracking-tight text-white hover:text-blue-200 transition-colors cursor-pointer group"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center font-serif font-black text-xs sm:text-sm shadow-md shadow-blue-900/40 group-hover:scale-105 transition-transform border border-blue-400/30">
                  C
                </div>
                <span className="font-extrabold tracking-tight">CONTRACT<span className="font-light italic text-blue-400">S</span></span>
              </button>

              {/* Active Trade Pill (Quick shortcut) */}
              {userOccupation && (
                <button
                  onClick={onOpenOccupationModal}
                  className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 bg-blue-950/80 hover:bg-blue-900/80 border border-blue-700/50 text-blue-200 text-xs font-sans font-bold rounded-full transition-all cursor-pointer max-w-[200px]"
                  title="Your active trade. Click to switch."
                >
                  <Briefcase className="w-3 h-3 shrink-0 text-blue-400" />
                  <span className="truncate">{userOccupation.title}</span>
                </button>
              )}
            </div>

            {/* Right: Quick Action & Profile Badge */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Currency Chip */}
              <button
                onClick={() => onToggleSidebar()}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700/60 text-xs font-mono font-medium text-slate-200 cursor-pointer transition-colors"
                title="Change currency in sidebar"
              >
                <span>{currentCurrObj.flag}</span>
                <span className="font-bold text-blue-400">{currentCurrObj.code}</span>
              </button>

              {/* Primary "+ New Contract" Button */}
              <button
                onClick={onOpenCreateModal}
                className="flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-blue-600/30 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="hidden xs:inline sm:inline">New Contract</span>
                <span className="xs:hidden sm:hidden">New</span>
              </button>

              {/* User Avatar Button (opens sidebar) */}
              <button
                onClick={onToggleSidebar}
                className="flex items-center gap-2 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 px-2 sm:px-3 py-1 sm:py-1.5 text-xs transition-all cursor-pointer rounded-xl"
                title="Open sidebar and profile settings"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                  {currentUser?.displayName ? currentUser.displayName.charAt(0) : 'W'}
                </div>
                <span className="hidden sm:inline font-sans font-medium text-slate-200 truncate max-w-[110px]">
                  {currentUser?.displayName || 'Workspace'}
                </span>
              </button>

            </div>

          </div>
        </div>
      </header>
    </>
  );
};
