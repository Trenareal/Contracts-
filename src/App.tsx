import React, { useState, useEffect } from 'react';
import { Contract, CreateContractPayload, AuthUser, ContractType } from './types';
import { ClientSigningPortal } from './components/ClientSigningPortal';
import { ContractForm } from './components/ContractForm';
import { ContractReadyView } from './components/ContractReadyView';
import { BlankStarterPage } from './components/BlankStarterPage';
import { AdminDashboard } from './components/AdminDashboard';
import { detectDefaultLanguage, SUPPORTED_LANGUAGES } from './utils/i18n';
import { CURRENCY_LIST } from './utils/formatters';
import { AppSidebar, ContractSectionId } from './components/AppSidebar';
import { AppLogo } from './components/AppLogo';
import { AuthModal } from './components/AuthModal';
import { OccupationSelectModal, UserBusinessProfile } from './components/OccupationSelectModal';
import { OccupationDefinition } from './data/occupations';
import { watchAuthState, signOutUser } from './lib/firebase';
import { 
  createContractInFirebase, 
  getContractByIdOrToken,
  subscribeContracts,
  subscribeToSingleContract,
  completeContractInFirebase,
  invalidateContractLinkInFirebase,
  deleteContractFromFirebase,
  updateContractInFirebase,
  getOrCreateBrowserUser
} from './lib/firebaseService';
import { Loader2, Plus, ArrowLeft, Globe, DollarSign, FileText, CheckCircle2, LayoutDashboard, Menu } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser>(() => getOrCreateBrowserUser());
  const [isFirebaseLoggedIn, setIsFirebaseLoggedIn] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showOccupationModal, setShowOccupationModal] = useState(false);
  const [userOccupation, setUserOccupation] = useState<OccupationDefinition | null>(null);
  const [userBusinessProfile, setUserBusinessProfile] = useState<UserBusinessProfile | null>(null);
  const [currentSection, setCurrentSection] = useState<ContractSectionId | null>('scope');
  const [requestedSection, setRequestedSection] = useState<ContractSectionId | null>(null);
  const [activeContractType, setActiveContractType] = useState<ContractType>('business');

  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [activeClientContract, setActiveClientContract] = useState<Contract | null>(null);
  const [justCreatedContract, setJustCreatedContract] = useState<Contract | null>(null);
  const [isDrafting, setIsDrafting] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('contract_app_is_drafting') === 'true';
    } catch {
      return false;
    }
  });
  const [draftOptions, setDraftOptions] = useState<{ contractType?: ContractType; occupationId?: string } | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);

  // Global Currency & Language Preferences
  const [selectedCurrency, setSelectedCurrency] = useState<string>('NGN');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = watchAuthState((user) => {
      if (user) {
        setIsFirebaseLoggedIn(true);
        const authUser: AuthUser = {
          uid: user.uid,
          displayName: user.displayName || user.email?.split('@')[0] || 'User',
          email: user.email,
        };
        setCurrentUser(authUser);
        try {
          localStorage.setItem('contract_app_current_user', JSON.stringify(authUser));
        } catch {}
      } else {
        setIsFirebaseLoggedIn(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Auto detect initial language
  useEffect(() => {
    setSelectedLanguage(detectDefaultLanguage());
  }, []);

  // Subscribe to all contracts in real-time for THIS isolated browser user only
  useEffect(() => {
    if (!currentUser?.uid) return;
    const unsubscribe = subscribeContracts(currentUser.uid, (freshList) => {
      setContracts(freshList);
    });
    return () => unsubscribe();
  }, [currentUser?.uid]);

  // If a created contract is active, subscribe to its real-time updates as well
  useEffect(() => {
    if (!justCreatedContract?.id) return;
    const unsubscribe = subscribeToSingleContract(justCreatedContract.id, (fresh) => {
      setJustCreatedContract(fresh);
    });
    return () => unsubscribe();
  }, [justCreatedContract?.id]);

  // Scroll to top immediately whenever any top-level view/screen is switched
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [showDashboard, isDrafting, justCreatedContract?.id, activeClientContract?.id]);

  // Check URL params for client signing route, OR restore active in-progress contract/draft on page refresh
  useEffect(() => {
    const checkTokenRoute = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token') || urlParams.get('contract');
        if (token) {
          const clientContract = await getContractByIdOrToken(token, true);
          if (clientContract) {
            setActiveClientContract(clientContract);
            setLoading(false);
            return;
          }
        }

        // Accidental page refresh protection: restore active published contract if user is still on this tab
        const savedCreatedId = sessionStorage.getItem('contract_app_active_created_id');
        if (savedCreatedId) {
          const savedContract = await getContractByIdOrToken(savedCreatedId);
          if (savedContract) {
            setJustCreatedContract(savedContract);
            setShowDashboard(false);
            setIsDrafting(false);
            setLoading(false);
            return;
          }
        }

        // Accidental page refresh protection: restore active drafting mode if user was drafting
        const wasDrafting = sessionStorage.getItem('contract_app_is_drafting') === 'true' || !!sessionStorage.getItem('contract_app_active_draft');
        if (wasDrafting) {
          setIsDrafting(true);
        }
      } catch (err) {
        console.error('Error checking contract token/draft recovery:', err);
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

      const created = await createContractInFirebase(fullPayload, currentUser.uid);
      setJustCreatedContract(created);
      try {
        sessionStorage.setItem('contract_app_active_created_id', created.id);
        sessionStorage.removeItem('contract_app_active_draft');
        sessionStorage.removeItem('contract_app_is_drafting');
      } catch {}
      setShowDashboard(false);
      setIsDrafting(false);
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } catch (err: any) {
      console.error('Failed to create contract:', err);
      alert(err?.message || 'Failed to create contract. Please check your internet connection.');
    }
  };

  const handleUpdateContract = async (contractId: string, payload: CreateContractPayload) => {
    try {
      await updateContractInFirebase(contractId, payload);
    } catch (err: any) {
      console.error('Failed to update contract:', err);
      alert(err?.message || 'Failed to update contract.');
    }
  };

  const handleCompleteContract = async (contractId: string) => {
    try {
      await completeContractInFirebase(contractId);
    } catch (err: any) {
      console.error('Failed to complete contract:', err);
      alert(err?.message || 'Failed to complete contract.');
    }
  };

  const handleInvalidateLink = async (contractId: string) => {
    try {
      await invalidateContractLinkInFirebase(contractId);
    } catch (err: any) {
      console.error('Failed to invalidate link:', err);
      alert(err?.message || 'Failed to revoke link.');
    }
  };

  const handleDeleteContract = async (contractId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this contract?')) return;
    try {
      await deleteContractFromFirebase(contractId);
      if (justCreatedContract?.id === contractId) {
        handleDraftNew();
      }
    } catch (err: any) {
      console.error('Failed to delete contract:', err);
      alert(err?.message || 'Failed to delete contract.');
    }
  };

  const handleDraftNew = () => {
    try {
      sessionStorage.removeItem('contract_app_active_created_id');
      sessionStorage.removeItem('contract_app_active_draft');
      sessionStorage.removeItem('contract_app_is_drafting');
    } catch {}
    setDraftOptions(null);
    setJustCreatedContract(null);
    setActiveClientContract(null);
    setShowDashboard(false);
    setIsDrafting(false);
    window.history.pushState({}, '', window.location.pathname);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  const completedContractsCount = contracts.filter(c => c.status === 'completed').length;

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

  // 2. Main Flow: Blank Starter Page -> Contract Drafter -> Share Hub / Dashboard
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* Top Header Bar - Minimalist with sidebar toggle and app name */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-13 sm:h-15 flex items-center justify-between">
          
          {/* Left: Sidebar Toggle Button + Name of the App */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => setIsSidebarOpen(prev => !prev)}
              className="p-1.5 sm:p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500/30"
              aria-label="Toggle navigation sidebar"
              title="Navigation Menu"
            >
              <Menu className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-slate-200" />
            </button>

            {/* Name of the App with Diagonal Blue-Sea Green Rectangle Logo */}
            <AppLogo 
              size="md"
              onClick={() => {
                setShowDashboard(false);
                setIsDrafting(false);
                setJustCreatedContract(null);
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
              }}
            />
          </div>

          {/* Right side: Clean! No draft contracts, no currency tab per user request */}
          <div className="flex items-center gap-2">
            {isFirebaseLoggedIn && currentUser ? (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-blue-600 to-teal-600 text-white font-semibold text-xs flex items-center justify-center cursor-pointer hover:opacity-90 transition-all shadow-2xs"
                title={currentUser.displayName || currentUser.email || 'User Account'}
              >
                {currentUser.displayName ? currentUser.displayName.charAt(0) : currentUser.email ? currentUser.email.charAt(0) : 'U'}
              </button>
            ) : null}
          </div>
        </div>
      </header>

      {/* Navigation Toggle Sidebar */}
      <AppSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeView={showDashboard ? 'dashboard' : justCreatedContract ? 'ready' : isDrafting ? 'draft' : 'starter'}
        contractMode={activeContractType}
        onContractModeChange={(mode) => {
          setActiveContractType(mode);
          setDraftOptions(prev => ({ ...prev, contractType: mode }));
          if (!isDrafting || showDashboard || justCreatedContract) {
            setShowDashboard(false);
            setJustCreatedContract(null);
            setIsDrafting(true);
            setCurrentSection('scope');
            setRequestedSection('scope');
          }
        }}
        activeSection={currentSection}
        onSelectSection={(sec) => {
          setIsSidebarOpen(false);
          if (!isDrafting || showDashboard || justCreatedContract) {
            setShowDashboard(false);
            setJustCreatedContract(null);
            setIsDrafting(true);
          }
          setCurrentSection(sec);
          setRequestedSection(sec);
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }}
        onNavigateToDraft={() => {
          setIsSidebarOpen(false);
          setShowDashboard(false);
          setJustCreatedContract(null);
          setIsDrafting(true);
          setCurrentSection('scope');
          setRequestedSection('scope');
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }}
        onNavigateToDashboard={() => {
          setIsSidebarOpen(false);
          setIsDrafting(false);
          setJustCreatedContract(null);
          setShowDashboard(true);
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }}
        contractsCount={contracts.length}
        completedContractsCount={completedContractsCount}
        currentUser={currentUser}
        isFirebaseLoggedIn={isFirebaseLoggedIn}
        onOpenAuthModal={() => {
          setIsSidebarOpen(false);
          setShowAuthModal(true);
        }}
        onSignOut={async () => {
          try {
            await signOutUser();
          } catch (err) {
            console.warn('Sign out notice:', err);
          }
          const browserUser = getOrCreateBrowserUser();
          setCurrentUser(browserUser);
          setIsFirebaseLoggedIn(false);
        }}
        selectedCurrency={selectedCurrency}
        onCurrencyChange={setSelectedCurrency}
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
        onOpenOccupationModal={() => {
          setIsSidebarOpen(false);
          setShowOccupationModal(true);
        }}
        userOccupation={userOccupation}
        userBusinessProfile={userBusinessProfile}
      />

      {/* Login & Registration Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          setIsFirebaseLoggedIn(true);
          setShowAuthModal(false);
        }}
      />

      {/* Trade / Occupation Selection Modal */}
      <OccupationSelectModal
        isOpen={showOccupationModal}
        onClose={() => setShowOccupationModal(false)}
        currentUser={currentUser}
        initialOccupation={userOccupation}
        initialBusinessProfile={userBusinessProfile}
        onSelectOccupation={(occ, profile) => {
          setUserOccupation(occ);
          if (profile) setUserBusinessProfile(profile);
          setShowOccupationModal(false);
          if (occ) {
            setDraftOptions({ contractType: occ.contractType, occupationId: occ.id });
            setShowDashboard(false);
            setIsDrafting(true);
            setJustCreatedContract(null);
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
          }
        }}
      />

      {/* Main Page Area */}
      <main className="flex-1 w-full pb-16">
        {showDashboard ? (
          <div className="max-w-6xl mx-auto px-3 sm:px-6 pt-6">
            <AdminDashboard
              contracts={contracts}
              user={currentUser}
              onCreateContract={handleCreateContract}
              onUpdateContract={handleUpdateContract}
              onCompleteContract={handleCompleteContract}
              onInvalidateLink={handleInvalidateLink}
              onDeleteContract={handleDeleteContract}
              onOpenClientPortal={(c) => {
                setActiveClientContract(c);
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
              }}
            />
          </div>
        ) : justCreatedContract ? (
          <ContractReadyView
            contract={justCreatedContract}
            onOpenSigningPortal={(c) => {
              setActiveClientContract(c);
              window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            }}
            onDraftNewContract={handleDraftNew}
          />
        ) : isDrafting ? (
          <div className="space-y-4">
            <ContractForm
              isStandalone={true}
              defaultCurrency={selectedCurrency}
              defaultLanguage={selectedLanguage}
              initialContractType={draftOptions?.contractType || activeContractType}
              activeContractType={activeContractType}
              onContractTypeChange={(type) => setActiveContractType(type)}
              initialOccupationId={draftOptions?.occupationId}
              defaultOccupation={userOccupation}
              defaultBusinessProfile={userBusinessProfile}
              externalActiveSection={requestedSection}
              onSectionChange={(sec) => setCurrentSection(sec)}
              onOpenSidebar={() => setIsSidebarOpen(true)}
              onSave={handleCreateContract}
              onCancel={() => {
                setIsDrafting(false);
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
              }}
            />
          </div>
        ) : (
          <BlankStarterPage 
            onStartDrafting={(opts) => {
              if (opts?.contractType) {
                setActiveContractType(opts.contractType);
              }
              setDraftOptions(opts || null);
              setShowDashboard(false);
              setIsDrafting(true);
              window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            }} 
          />
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        <p>Simple 1-Use Contract Drafter & E-Signature Suite • Legally Binding PDF Output</p>
      </footer>

    </div>
  );
}
