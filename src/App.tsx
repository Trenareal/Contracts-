import React, { useState, useEffect } from 'react';
import { Contract, CreateContractPayload, AuthUser } from './types';
import { AdminDashboard } from './components/AdminDashboard';
import { ClientSigningPortal } from './components/ClientSigningPortal';
import { NavigationBar } from './components/NavigationBar';
import { AppSidebar } from './components/AppSidebar';
import { OccupationsLibrary } from './components/OccupationsLibrary';
import { CurrencyManager } from './components/CurrencyManager';
import { LanguageManager } from './components/LanguageManager';
import { ContractForm } from './components/ContractForm';
import { AuthModal } from './components/AuthModal';
import { OccupationSelectModal, UserBusinessProfile } from './components/OccupationSelectModal';
import { OccupationDefinition, OCCUPATIONS_DATABASE } from './data/occupations';
import { detectDefaultLanguage } from './utils/i18n';
import { auth } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { 
  subscribeContracts, 
  createContractInFirebase, 
  updateContractInFirebase,
  completeContractInFirebase,
  invalidateContractLinkInFirebase, 
  deleteContractFromFirebase, 
  getContractByIdOrToken,
  getUserProfileFromFirestore,
  saveUserProfileToFirestore
} from './lib/firebaseService';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Left Sidebar drawer state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Occupation & Business Profile state
  const [userOccupation, setUserOccupation] = useState<OccupationDefinition | null>(null);
  const [userBusinessProfile, setUserBusinessProfile] = useState<UserBusinessProfile | null>(null);
  const [showOccupationModal, setShowOccupationModal] = useState(false);
  
  // Navigation Bar Active Tab
  const [navTab, setNavTab] = useState<'contracts' | 'occupations' | 'currency' | 'language'>('contracts');

  // Global Currency & Language Preferences
  const [selectedCurrency, setSelectedCurrency] = useState<string>('NGN');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');

  // Modal / Drafter state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [presetOccupation, setPresetOccupation] = useState<OccupationDefinition | null>(null);

  // Active Client Portal route state
  const [activeClientContract, setActiveClientContract] = useState<Contract | null>(null);

  // Auto detect initial language & location
  useEffect(() => {
    setSelectedLanguage(detectDefaultLanguage());
  }, []);

  // Subscribe to auth state & load user occupation and business profile
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const u: AuthUser = { 
          uid: user.uid,
          displayName: user.displayName || user.email?.split('@')[0], 
          email: user.email 
        };
        setCurrentUser(u);
        localStorage.setItem('contract_app_user', JSON.stringify(u));

        // Load profile from Firestore or local fallback
        try {
          const profile = await getUserProfileFromFirestore(user.uid);
          if (profile?.occupation && profile?.businessProfile) {
            setUserOccupation(profile.occupation);
            setUserBusinessProfile(profile.businessProfile);
          } else {
            checkUserProfile(u.uid, u.email);
          }
        } catch {
          checkUserProfile(u.uid, u.email);
        }
      } else {
        const savedUser = localStorage.getItem('contract_app_user');
        if (savedUser) {
          try {
            const parsed = JSON.parse(savedUser);
            setCurrentUser(parsed);
            checkUserProfile(parsed.uid, parsed.email);
          } catch {
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
          setUserOccupation(null);
          setUserBusinessProfile(null);
        }
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const checkUserProfile = (uid?: string, email?: string | null) => {
    const keyId = uid || email || '';
    if (!keyId) return;
    const occKey = `contract_app_occ_${keyId}`;
    const bizKey = `contract_app_business_${keyId}`;
    const savedOcc = localStorage.getItem(occKey);
    const savedBiz = localStorage.getItem(bizKey);

    let parsedOcc: OccupationDefinition | null = null;
    let parsedBiz: UserBusinessProfile | null = null;

    if (savedOcc) {
      try {
        parsedOcc = JSON.parse(savedOcc);
        setUserOccupation(parsedOcc);
      } catch {
        setUserOccupation(null);
      }
    }

    if (savedBiz) {
      try {
        parsedBiz = JSON.parse(savedBiz);
        setUserBusinessProfile(parsedBiz);
      } catch {
        setUserBusinessProfile(null);
      }
    }

    // If either occupation or business profile is not set, prompt onboarding setup
    if (!parsedOcc || !parsedBiz?.businessName) {
      setShowOccupationModal(true);
    }
  };

  const handleSelectOccupation = async (occ: OccupationDefinition, businessProfile?: UserBusinessProfile) => {
    setUserOccupation(occ);
    if (businessProfile) {
      setUserBusinessProfile(businessProfile);
    }
    if (currentUser?.uid || currentUser?.email) {
      const keyId = currentUser.uid || currentUser.email || '';
      localStorage.setItem(`contract_app_occ_${keyId}`, JSON.stringify(occ));
      if (businessProfile) {
        localStorage.setItem(`contract_app_business_${keyId}`, JSON.stringify(businessProfile));
      }
      if (currentUser.uid) {
        try {
          await saveUserProfileToFirestore(currentUser.uid, {
            email: currentUser.email || '',
            displayName: currentUser.displayName || '',
            occupation: occ,
            businessProfile: businessProfile,
          });
        } catch (err) {
          console.warn('Failed to sync profile to Firestore:', err);
        }
      }
    }
    setShowOccupationModal(false);
  };

  // Real-time Firestore sync & initial route check
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
        console.error('Error checking token route:', err);
      } finally {
        setLoading(false);
      }
    };

    checkTokenRoute();

    if (!currentUser?.uid) {
      setContracts([]);
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeContracts(currentUser.uid, (updatedContracts) => {
      setContracts(updatedContracts);
      
      if (activeClientContract) {
        const fresh = updatedContracts.find(c => c.id === activeClientContract.id || c.signingToken === activeClientContract.signingToken);
        if (fresh) {
          setActiveClientContract(fresh);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser?.uid]);

  // Scoped user contracts for current user (starts at 0 for new account)
  const userContracts = contracts.filter((c) => {
    if (!currentUser) return false;
    
    // Strict UID matching
    if (currentUser.uid && c.adminUid && c.adminUid === currentUser.uid) {
      return true;
    }

    // Email match fallback for legacy data
    const currentEmail = currentUser.email?.toLowerCase();
    if (currentEmail) {
      if (c.adminParty?.email && c.adminParty.email.toLowerCase() === currentEmail) {
        return true;
      }
      if (c.clientParty?.email && c.clientParty.email.toLowerCase() === currentEmail) {
        return true;
      }
    }

    return false;
  });

  const handleCreateContract = async (payload: CreateContractPayload) => {
    try {
      // Pre-fill user admin details if present
      const fullPayload: CreateContractPayload = {
        ...payload,
        adminUid: currentUser?.uid,
        adminParty: {
          ...payload.adminParty,
          email: currentUser?.email || payload.adminParty.email,
          name: currentUser?.displayName || payload.adminParty.name,
          company: payload.adminParty.company || userBusinessProfile?.businessName || 'Apex Craft & Engineering Works',
          title: payload.adminParty.title || userBusinessProfile?.professionalTitle || 'Lead Artisan / Director',
          phone: payload.adminParty.phone || userBusinessProfile?.phone || '',
          address: payload.adminParty.address || userBusinessProfile?.address || '',
        }
      };
      await createContractInFirebase(fullPayload, currentUser?.uid);
      setShowCreateModal(false);
      setPresetOccupation(null);
      setNavTab('contracts');
    } catch (err) {
      console.error('Failed to create contract in Firebase:', err);
      alert('Failed to save contract to Firebase. Please check connection.');
    }
  };

  const handleUpdateContract = async (contractId: string, payload: CreateContractPayload) => {
    try {
      await updateContractInFirebase(contractId, payload);
      setShowCreateModal(false);
    } catch (err: any) {
      console.error('Failed to update contract in Firebase:', err);
      alert(err?.message || 'Failed to update contract in Firebase.');
    }
  };

  const handleInvalidateLink = async (contractId: string) => {
    try {
      await invalidateContractLinkInFirebase(contractId);
    } catch (err) {
      console.error('Failed to invalidate link in Firebase:', err);
    }
  };

  const handleCompleteContract = async (contractId: string) => {
    try {
      await completeContractInFirebase(contractId);
    } catch (err: any) {
      console.error('Failed to complete contract in Firebase:', err);
      alert(err?.message || 'Failed to complete contract.');
    }
  };

  const handleDeleteContract = async (contractId: string) => {
    if (!confirm('Are you sure you want to delete this contract?')) return;
    try {
      await deleteContractFromFirebase(contractId);
    } catch (err) {
      console.error('Failed to delete contract from Firebase:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      localStorage.removeItem('contract_app_user');
      await signOut(auth);
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setCurrentUser(null);
      setUserOccupation(null);
      setUserBusinessProfile(null);
      setContracts([]);
    }
  };

  const handleLaunchOccupationDraft = (occ: OccupationDefinition) => {
    setPresetOccupation(occ);
    setShowCreateModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-4">
        <span className="font-sans font-extrabold tracking-tight text-3xl">
          CONTRACT<span className="font-light italic text-blue-400">S</span>
        </span>
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
          <p className="text-xs font-sans font-bold uppercase tracking-wider text-slate-400">
            Loading Workspace & Cloud Database...
          </p>
        </div>
      </div>
    );
  }

  // Client Portal Mode (Client Sign Only via direct link)
  if (activeClientContract) {
    const urlParams = new URLSearchParams(window.location.search);
    const isDirectLink = !!(urlParams.get('token') || urlParams.get('contract'));
    const isContractOwner = currentUser && (
      (currentUser.uid && activeClientContract.adminUid === currentUser.uid) ||
      (currentUser.email?.toLowerCase() === activeClientContract.adminParty?.email?.toLowerCase())
    );

    return (
      <ClientSigningPortal
        contract={activeClientContract}
        onSigned={(updated) => setActiveClientContract(updated)}
        onBackToAdmin={
          (!isDirectLink || isContractOwner)
            ? () => {
                setActiveClientContract(null);
                window.history.pushState({}, '', window.location.pathname);
              }
            : undefined
        }
      />
    );
  }

  // Mandatory Authentication Gate: Must sign up or sign in to use the application
  if (!currentUser) {
    return (
      <AuthModal 
        isOpen={true} 
        isMandatory={true} 
        onAuthSuccess={(user) => setCurrentUser(user)} 
      />
    );
  }

  // Admin Application Shell with Persistent Menu Bar & Left Drawer
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* Collapsible Left Sidebar with all Extras */}
      <AppSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={navTab}
        setActiveTab={setNavTab}
        onOpenCreateModal={() => {
          setPresetOccupation(null);
          setShowCreateModal(true);
        }}
        currentUser={currentUser}
        userOccupation={userOccupation}
        userBusinessProfile={userBusinessProfile}
        onOpenOccupationModal={() => setShowOccupationModal(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
        selectedCurrency={selectedCurrency}
        onCurrencyChange={setSelectedCurrency}
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
        contractsCount={userContracts.length}
      />

      {/* Top Header Navigation Bar with Menu toggle */}
      <NavigationBar
        activeTab={navTab}
        setActiveTab={setNavTab}
        onOpenCreateModal={() => {
          setPresetOccupation(null);
          setShowCreateModal(true);
        }}
        currentUser={currentUser}
        userOccupation={userOccupation}
        userBusinessProfile={userBusinessProfile}
        onOpenOccupationModal={() => setShowOccupationModal(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
        selectedCurrency={selectedCurrency}
        onCurrencyChange={setSelectedCurrency}
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      {/* Main View Area based on active navigation item */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {navTab === 'contracts' && (
          <AdminDashboard
            contracts={userContracts}
            user={currentUser}
            userOccupation={userOccupation}
            userBusinessProfile={userBusinessProfile}
            onOpenOccupationModal={() => setShowOccupationModal(true)}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onSignOut={handleSignOut}
            onCreateContract={handleCreateContract}
            onUpdateContract={handleUpdateContract}
            onCompleteContract={handleCompleteContract}
            onInvalidateLink={handleInvalidateLink}
            onDeleteContract={handleDeleteContract}
            onOpenClientPortal={(contract) => setActiveClientContract(contract)}
          />
        )}

        {navTab === 'occupations' && (
          <OccupationsLibrary
            onSelectOccupation={handleLaunchOccupationDraft}
            currency={selectedCurrency}
          />
        )}

        {navTab === 'currency' && (
          <CurrencyManager
            selectedCurrency={selectedCurrency}
            onSelectCurrency={setSelectedCurrency}
          />
        )}

        {navTab === 'language' && (
          <LanguageManager
            selectedLanguage={selectedLanguage}
            onSelectLanguage={setSelectedLanguage}
          />
        )}
      </main>

      {/* Contract Drafter / Create Modal */}
      {showCreateModal && (
        <ContractForm
          defaultOccupation={presetOccupation || userOccupation}
          defaultBusinessProfile={userBusinessProfile}
          defaultCurrency={selectedCurrency}
          defaultLanguage={selectedLanguage}
          onSave={handleCreateContract}
          onCancel={() => {
            setShowCreateModal(false);
            setPresetOccupation(null);
          }}
        />
      )}

      {/* Occupation Selection Modal (Pops up for new accounts or when user wants to switch) */}
      <OccupationSelectModal
        isOpen={showOccupationModal}
        onClose={() => setShowOccupationModal(false)}
        onSelectOccupation={handleSelectOccupation}
        currentUser={currentUser}
        initialOccupation={userOccupation}
        initialBusinessProfile={userBusinessProfile}
      />

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(user) => setCurrentUser(user)}
      />
    </div>
  );
}

