import React, { useState, useEffect } from 'react';
import { Contract, CreateContractPayload, AuthUser } from './types';
import { ClientSigningPortal } from './components/ClientSigningPortal';
import { ContractForm } from './components/ContractForm';
import { ContractReadyView } from './components/ContractReadyView';
import { BlankStarterPage } from './components/BlankStarterPage';
import { detectDefaultLanguage, SUPPORTED_LANGUAGES } from './utils/i18n';
import { CURRENCY_LIST } from './utils/formatters';
import { 
  createContractInFirebase, 
  getContractByIdOrToken,
} from './lib/firebaseService';
import { Loader2, Plus, ArrowLeft, Globe, DollarSign } from 'lucide-react';

const DEFAULT_USER: AuthUser = {
  uid: 'workspace_user',
  displayName: 'Contract Drafter',
  email: 'admin@contracts.local',
};

export default function App() {
  const [loading, setLoading] = useState(true);
  const [activeClientContract, setActiveClientContract] = useState<Contract | null>(null);
  const [justCreatedContract, setJustCreatedContract] = useState<Contract | null>(null);
  const [isDrafting, setIsDrafting] = useState(false);

  // Global Currency & Language Preferences
  const [selectedCurrency, setSelectedCurrency] = useState<string>('NGN');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');

  // Auto detect initial language
  useEffect(() => {
    setSelectedLanguage(detectDefaultLanguage());
  }, []);

  // Check URL params for client signing route (?token=... or ?contract=...)
  useEffect(() => {
    const checkTokenRoute = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token') || urlParams.get('contract');
        if (token) {
          const clientContract = await getContractByIdOrToken(token, true);
          if (clientContract) {
            setActiveClientContract(clientContract);
          }
        }
      } catch (err) {
        console.error('Error checking contract token:', err);
      } finally {
        setLoading(false);
      }
    };

    checkTokenRoute();
  }, []);

  const handleCreateContract = async (payload: CreateContractPayload) => {
    try {
      const fullPayload: CreateContractPayload = {
        ...payload,
        currency: payload.currency || selectedCurrency,
        language: payload.language || selectedLanguage,
      };

      const created = await createContractInFirebase(fullPayload, DEFAULT_USER.uid);
      setJustCreatedContract(created);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Failed to create contract:', err);
      alert(err?.message || 'Failed to create contract. Please check your internet connection.');
    }
  };

  const handleDraftNew = () => {
    setJustCreatedContract(null);
    setActiveClientContract(null);
    setIsDrafting(false);
    window.history.pushState({}, '', window.location.pathname);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-4">
        <span className="font-extrabold tracking-tight text-3xl">
          CONTRACT<span className="font-light italic text-blue-400">S</span>
        </span>
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Loading Contract Suite...
          </p>
        </div>
      </div>
    );
  }

  // 1. Client Signing Portal View (Triggered by visiting a contract link or clicking preview)
  if (activeClientContract) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
        <ClientSigningPortal
          contract={activeClientContract}
          onSigned={(updated) => setActiveClientContract(updated)}
          onBackToAdmin={handleDraftNew}
        />
      </div>
    );
  }

  // 2. Main Flow: Blank Starter Page -> Contract Drafter -> Share Hub
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* Top Header Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-13 sm:h-15 flex items-center justify-between gap-2 sm:gap-3">
          
          {/* Logo & Identity */}
          <div 
            onClick={handleDraftNew}
            className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity shrink-0"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-md shadow-blue-500/30 shrink-0">
              C
            </div>
            <div>
              <span className="font-extrabold tracking-tight text-base sm:text-lg text-white">
                CONTRACT<span className="font-light italic text-blue-400">S</span>
              </span>
              <span className="hidden sm:inline-block ml-2 px-1.5 py-0.5 text-[9px] font-mono rounded-full bg-blue-500/15 text-blue-300 border border-blue-400/30 font-bold uppercase tracking-wider">
                E-Sign
              </span>
            </div>
          </div>

          {/* Quick Header Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Currency Selector */}
            <div className="flex items-center gap-1 bg-slate-800/90 border border-slate-700/80 rounded-lg sm:rounded-xl px-1.5 sm:px-2 py-1">
              <DollarSign className="w-3 h-3 text-slate-400 shrink-0" />
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="bg-transparent text-[11px] sm:text-xs text-slate-200 font-semibold focus:outline-none cursor-pointer pr-0.5"
              >
                {CURRENCY_LIST.map((c) => (
                  <option key={c.code} value={c.code} className="bg-slate-900 text-white">
                    {c.symbol} {c.code}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Selector */}
            <div className="hidden md:flex items-center gap-1 bg-slate-800/90 border border-slate-700/80 rounded-lg sm:rounded-xl px-2 py-1">
              <Globe className="w-3 h-3 text-slate-400 shrink-0" />
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-transparent text-xs text-slate-200 font-semibold focus:outline-none cursor-pointer pr-1"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="bg-slate-900 text-white">
                    {l.flag} {l.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Back to Start or New Draft Button */}
            {isDrafting && !justCreatedContract && (
              <button
                onClick={() => setIsDrafting(false)}
                className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider rounded-lg sm:rounded-xl transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <ArrowLeft className="w-3 h-3" />
                <span className="hidden xs:inline sm:inline">Back</span>
              </button>
            )}

            {justCreatedContract && (
              <button
                onClick={handleDraftNew}
                className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider rounded-lg sm:rounded-xl transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden xs:inline sm:inline">Draft Another</span>
                <span className="xs:hidden sm:hidden">New</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Page Area */}
      <main className="flex-1 w-full pb-16">
        {justCreatedContract ? (
          <ContractReadyView
            contract={justCreatedContract}
            onOpenSigningPortal={(c) => setActiveClientContract(c)}
            onDraftNewContract={handleDraftNew}
          />
        ) : isDrafting ? (
          <div className="space-y-4">
            <ContractForm
              isStandalone={true}
              defaultCurrency={selectedCurrency}
              defaultLanguage={selectedLanguage}
              onSave={handleCreateContract}
              onCancel={() => setIsDrafting(false)}
            />
          </div>
        ) : (
          <BlankStarterPage onStartDrafting={() => setIsDrafting(true)} />
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        <p>Simple 1-Use Contract Drafter & E-Signature Suite • Legally Binding PDF Output</p>
      </footer>

    </div>
  );
}
