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
import { AppLogo } from './AppLogo';

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
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white hover:text-teal-300 border border-white/10 transition-all cursor-pointer active:scale-95 shadow-2xs"
                title={isSidebarOpen ? "Close sidebar" : "Open sidebar menu"}
                aria-label="Toggle navigation sidebar"
              >
                <PanelLeft className="w-4 h-4 text-teal-400" />
                <span className="hidden sm:inline text-xs font-sans font-semibold uppercase tracking-wider text-slate-200">
                  Menu
                </span>
              </button>

              {/* Brand Logo & Name */}
              <button
                onClick={() => setActiveTab('contracts')}
                className="flex items-center cursor-pointer group"
              >
                <AppLogo size="sm" />
              </button>

              {/* Active Trade Pill (Quick shortcut) */}
              {userOccupation && (
                <button
                  onClick={onOpenOccupationModal}
                  className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/80 hover:bg-slate-750 border border-slate-700/60 text-teal-200 text-xs font-sans font-medium rounded-lg transition-all cursor-pointer max-w-[200px]"
                  title="Your active trade. Click to switch."
                >
                  <Briefcase className="w-3 h-3 shrink-0 text-teal-400" />
                  <span className="truncate">{userOccupation.title}</span>
                </button>
              )}
            </div>

            {/* Right: Quick Action & Profile Badge */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              
              {/* Currency Chip */}
              <button
                onClick={() => onToggleSidebar()}
                className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-750 border border-slate-700/60 text-xs font-mono font-medium text-slate-200 cursor-pointer transition-colors"
                title="Change currency in sidebar"
              >
                <span>{currentCurrObj.flag}</span>
                <span className="font-semibold text-teal-400">{currentCurrObj.code}</span>
              </button>

              {/* Primary "+ New Contract" Button */}
              <button
                onClick={onOpenCreateModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white text-xs font-sans font-semibold uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="hidden xs:inline sm:inline">New Contract</span>
                <span className="xs:hidden sm:hidden">New</span>
              </button>

              {/* User Avatar Button (opens sidebar) */}
              <button
                onClick={onToggleSidebar}
                className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 px-2 py-1 text-xs transition-all cursor-pointer rounded-lg"
                title="Open sidebar and profile settings"
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-600 to-teal-600 text-white flex items-center justify-center font-semibold text-[10px] uppercase shadow-2xs">
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
