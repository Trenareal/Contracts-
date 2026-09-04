import React, { useState, useEffect, useRef } from 'react';
import { 
  Contract, 
  CreateContractPayload, 
  PartyDetails, 
  ContractMaterialItem, 
  ContractImage,
  ContractType,
  SalaryDetails
} from '../types';
import { SignaturePad } from './SignaturePad';
import { MaterialsTable } from './MaterialsTable';
import { ImageUploader } from './ImageUploader';
import { AutoExpandingTextarea } from './AutoExpandingTextarea';
import { ContractProofreadView } from './ContractProofreadView';
import { SectionKey } from './ContractSidebarToggle';
import { generateContractPDF } from '../utils/pdfGenerator';
import { OCCUPATIONS_DATABASE, OccupationDefinition } from '../data/occupations';
import { CURRENCY_LIST, formatCurrency } from '../utils/formatters';
import { getI18nText } from '../utils/i18n';
import { UserBusinessProfile } from '../types';
import { subscribeToSingleContract } from '../lib/firebaseService';
import { 
  Building, 
  User, 
  DollarSign, 
  Calendar, 
  FileText, 
  Layers, 
  CreditCard,
  Briefcase,
  CheckCircle2,
  X,
  Sparkles,
  Info,
  Image as ImageIcon,
  Loader2,
  Download,
  ShieldCheck,
  FileCheck,
  UserCheck,
  Users,
  Building2,
  Clock,
  Award,
  Wallet,
  BadgeCheck,
  PanelLeft,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface ContractFormProps {
  onSave: (payload: CreateContractPayload) => void;
  onCancel?: () => void;
  isStandalone?: boolean;
  initialContract?: Contract | null;
  initialContractType?: ContractType;
  activeContractType?: ContractType;
  onContractTypeChange?: (type: ContractType) => void;
  initialOccupationId?: string;
  isEditing?: boolean;
  defaultOccupation?: OccupationDefinition | null;
  defaultBusinessProfile?: UserBusinessProfile | null;
  defaultAdminParty?: Partial<PartyDetails> | null;
  defaultCurrency?: string;
  defaultLanguage?: string;
  externalActiveSection?: SectionKey | 'proofread' | null;
  onSectionChange?: (sec: SectionKey) => void;
  onOpenSidebar?: () => void;
}

const DRAFT_STORAGE_KEY = 'contract_app_active_draft';

function getStoredDraftData() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(DRAFT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const ContractForm: React.FC<ContractFormProps> = ({
  onSave,
  onCancel,
  isStandalone = false,
  initialContract,
  initialContractType,
  activeContractType,
  onContractTypeChange,
  initialOccupationId,
  isEditing,
  defaultOccupation,
  defaultBusinessProfile,
  defaultAdminParty,
  defaultCurrency = 'NGN',
  defaultLanguage = 'en',
  externalActiveSection,
  onSectionChange,
  onOpenSidebar,
}) => {
  const [liveContract, setLiveContract] = useState<Contract | null>(initialContract || null);
  const storedDraft = !initialContract ? getStoredDraftData() : null;

  // Contract Mode: Business vs Worker Employment
  const [contractType, setContractType] = useState<ContractType>(
    activeContractType ||
    initialContract?.contractType ||
    storedDraft?.contractType ||
    initialContractType ||
    (defaultOccupation?.contractType) ||
    'business'
  );

  const [selectedOccupationId, setSelectedOccupationId] = useState<string>(
    initialContract?.occupation ||
    storedDraft?.selectedOccupationId ||
    initialOccupationId ||
    defaultOccupation?.id ||
    (contractType === 'worker_employment' ? 'emp-full-time-staff' : 'tailor-bespoke')
  );

  const [title, setTitle] = useState(
    initialContract?.title ||
    storedDraft?.title ||
    (contractType === 'worker_employment' ? 'Full-Time Staff Employment & Salary Agreement' : 'Bespoke Craft & Service Agreement')
  );
  const [category, setCategory] = useState(
    initialContract?.category ||
    storedDraft?.category ||
    (contractType === 'worker_employment' ? 'Company & Worker Employment' : 'Artisan Craft & Trade')
  );
  const [description, setDescription] = useState(initialContract?.description || storedDraft?.description || '');
  const [termsAndConditions, setTermsAndConditions] = useState(
    initialContract?.termsAndConditions || storedDraft?.termsAndConditions || ''
  );
  const [totalCost, setTotalCost] = useState<number>(
    initialContract?.totalCost ?? storedDraft?.totalCost ?? (contractType === 'worker_employment' ? 180000 : 0)
  );
  const [depositAmount, setDepositAmount] = useState<number>(
    initialContract?.depositAmount ?? storedDraft?.depositAmount ?? 0
  );
  const [currency, setCurrency] = useState(initialContract?.currency || storedDraft?.currency || defaultCurrency);
  const [language, setLanguage] = useState(initialContract?.language || storedDraft?.language || defaultLanguage);
  const [deliveryDate, setDeliveryDate] = useState(
    initialContract?.deliveryDate || storedDraft?.deliveryDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );

  // Salary & Worker Details State
  const [salaryDetails, setSalaryDetails] = useState<SalaryDetails>(() => {
    if (initialContract?.salaryDetails) return initialContract.salaryDetails;
    if (storedDraft?.salaryDetails) return storedDraft.salaryDetails;
    return {
      baseSalary: initialContract?.totalCost || 180000,
      paymentFrequency: 'monthly',
      employmentType: 'full_time',
      jobTitle: 'Operations & Administrative Specialist',
      department: 'General Operations',
      probationPeriod: '3 Months',
      workingHours: 'Mon - Fri, 8:00 AM - 5:00 PM (40 hrs/wk)',
      allowances: 'Transport stipend + Health medical cover',
      leaveDays: '21 Days Paid Annual Leave',
      noticePeriod: '30 Days Written Notice'
    };
  });

  const currentOccupation = OCCUPATIONS_DATABASE.find((o) => o.id === selectedOccupationId) || defaultOccupation || null;

  // Left Sidebar Toggle and Active Section Switcher
  const [activeSection, setActiveSection] = useState<SectionKey>('scope');
  const [viewMode, setViewMode] = useState<'single' | 'all'>('single');
  const formRef = useRef<HTMLFormElement | null>(null);

  // Sync external section changes (e.g. from app-level sidebar)
  useEffect(() => {
    if (!externalActiveSection) return;
    if (externalActiveSection === 'proofread') {
      setIsProofreading(true);
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } else {
      setIsProofreading(false);
      setActiveSection(externalActiveSection);
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      if (formRef.current) formRef.current.scrollTop = 0;
    }
  }, [externalActiveSection]);

  // Notify parent of active section
  useEffect(() => {
    onSectionChange?.(activeSection);
  }, [activeSection, onSectionChange]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (formRef.current) {
      formRef.current.scrollTop = 0;
    }
  }, []);

  // Scroll to top when switching sections or views in single-mode
  useEffect(() => {
    if (viewMode === 'single') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      if (formRef.current) {
        formRef.current.scrollTop = 0;
      }
    }
  }, [activeSection, viewMode]);

  // Materials / Asset Issuance Table state
  const [hasMaterialsTable, setHasMaterialsTable] = useState<boolean>(
    initialContract?.hasMaterialsTable ?? storedDraft?.hasMaterialsTable ?? true
  );
  const [materialsList, setMaterialsList] = useState<ContractMaterialItem[]>(
    initialContract?.materialsList || storedDraft?.materialsList || []
  );

  // Images state (Up to 20 pictures)
  const [images, setImages] = useState<ContractImage[]>(
    initialContract?.images || storedDraft?.images || []
  );

  // Admin / Employer Party Details
  const [adminName, setAdminName] = useState(
    initialContract?.adminParty?.name || storedDraft?.adminName || defaultAdminParty?.name || 'Alex Mercer'
  );
  const [adminEmail, setAdminEmail] = useState(
    initialContract?.adminParty?.email || storedDraft?.adminEmail || defaultAdminParty?.email || 'alex.mercer@apexstudio.ng'
  );
  const [adminCompany, setAdminCompany] = useState(
    initialContract?.adminParty?.company || storedDraft?.adminCompany || defaultBusinessProfile?.businessName || defaultAdminParty?.company || 'Apex Enterprise & Holdings Ltd'
  );
  const [adminTitle, setAdminTitle] = useState(
    initialContract?.adminParty?.title || storedDraft?.adminTitle || defaultBusinessProfile?.professionalTitle || defaultAdminParty?.title || 'Managing Director / Authorized Officer'
  );
  const [adminPhone, setAdminPhone] = useState(
    initialContract?.adminParty?.phone || storedDraft?.adminPhone || defaultBusinessProfile?.phone || defaultAdminParty?.phone || ''
  );
  const [adminAddress, setAdminAddress] = useState(
    initialContract?.adminParty?.address || storedDraft?.adminAddress || defaultBusinessProfile?.address || defaultAdminParty?.address || ''
  );
  const [adminSignature, setAdminSignature] = useState(
    initialContract?.adminParty?.signature || storedDraft?.adminSignature || ''
  );

  // Client / Worker Party Pre-fill
  const [clientName, setClientName] = useState(
    initialContract?.clientParty?.name || storedDraft?.clientName || ''
  );
  const [clientEmail, setClientEmail] = useState(
    initialContract?.clientParty?.email || storedDraft?.clientEmail || ''
  );
  const [clientCompany, setClientCompany] = useState(
    initialContract?.clientParty?.company || storedDraft?.clientCompany || ''
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProofreading, setIsProofreading] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [hasRestoredDraft] = useState<boolean>(!!storedDraft && (!!storedDraft.title || !!storedDraft.selectedOccupationId));

  // Subscribe to real-time updates for existing contract
  useEffect(() => {
    if (!initialContract?.id) return;
    setLiveContract(initialContract);
    const unsubscribe = subscribeToSingleContract(initialContract.id, (fresh) => {
      setLiveContract(fresh);
      if (fresh.clientParty?.name) setClientName(fresh.clientParty.name);
      if (fresh.clientParty?.email) setClientEmail(fresh.clientParty.email);
      if (fresh.clientParty?.company) setClientCompany(fresh.clientParty.company);
    });
    return () => unsubscribe();
  }, [initialContract?.id]);

  // If occupation or initialOccupationId changes on load
  useEffect(() => {
    if (initialOccupationId) {
      const found = OCCUPATIONS_DATABASE.find(o => o.id === initialOccupationId);
      if (found) {
        applyOccupation(found);
      }
    }
  }, [initialOccupationId]);

  // Auto-Save Draft to sessionStorage
  useEffect(() => {
    if (initialContract) return;
    try {
      const draftPayload = {
        contractType,
        selectedOccupationId,
        title,
        category,
        description,
        termsAndConditions,
        totalCost,
        depositAmount,
        currency,
        language,
        deliveryDate,
        salaryDetails,
        hasMaterialsTable,
        materialsList,
        images,
        adminName,
        adminEmail,
        adminCompany,
        adminTitle,
        adminPhone,
        adminAddress,
        adminSignature,
        clientName,
        clientEmail,
        clientCompany,
        lastSavedAt: new Date().toISOString(),
      };
      sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftPayload));
      sessionStorage.setItem('contract_app_is_drafting', 'true');
    } catch (e) {
      console.warn('Session auto-save warning:', e);
    }
  }, [
    initialContract,
    contractType,
    selectedOccupationId,
    title,
    category,
    description,
    termsAndConditions,
    totalCost,
    depositAmount,
    currency,
    language,
    deliveryDate,
    salaryDetails,
    hasMaterialsTable,
    materialsList,
    images,
    adminName,
    adminEmail,
    adminCompany,
    adminTitle,
    adminPhone,
    adminAddress,
    adminSignature,
    clientName,
    clientEmail,
    clientCompany,
  ]);

  const handleClearDraft = () => {
    if (window.confirm('Are you sure you want to discard this draft and start with a completely blank form?')) {
      try {
        sessionStorage.removeItem(DRAFT_STORAGE_KEY);
        sessionStorage.removeItem('contract_app_is_drafting');
      } catch {}
      setSelectedOccupationId('');
      setTitle('');
      setCategory('');
      setDescription('');
      setTermsAndConditions('');
      setTotalCost(0);
      setDepositAmount(0);
      setMaterialsList([]);
      setImages([]);
      setClientName('');
      setClientEmail('');
      setClientCompany('');
      if (onCancel) {
        onCancel();
      }
    }
  };

  const applyOccupation = (occ: OccupationDefinition) => {
    setSelectedOccupationId(occ.id);
    setContractType(occ.contractType || 'business');
    setTitle(`${occ.title} Agreement`);
    setCategory(occ.category);
    setDescription(occ.defaultScope);
    setTermsAndConditions(occ.defaultTerms);

    if (occ.defaultSalaryDetails) {
      setSalaryDetails(occ.defaultSalaryDetails);
      if (occ.defaultSalaryDetails.baseSalary) {
        setTotalCost(occ.defaultSalaryDetails.baseSalary);
      }
    }

    // Populate trade-specific material/tool specifications
    const newMaterials: ContractMaterialItem[] = (occ.defaultMaterials || []).map((mat, idx) => ({
      id: `mat_init_${idx}_${Date.now()}`,
      item: mat.item,
      quantity: mat.quantity || 1,
      quality: mat.quality || 'Standard Grade / Specification',
      unitPrice: 0,
      totalPrice: 0,
    }));

    setMaterialsList(newMaterials);
    setHasMaterialsTable(newMaterials.length > 0);
  };

  const handleSwitchMode = (newType: ContractType) => {
    if (contractType === newType) return;
    setContractType(newType);
    if (onContractTypeChange) onContractTypeChange(newType);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (formRef.current) formRef.current.scrollTop = 0;
    
    // Suggest relevant default template when switching modes
    if (newType === 'worker_employment') {
      const defaultEmp = OCCUPATIONS_DATABASE.find(o => o.contractType === 'worker_employment') || OCCUPATIONS_DATABASE[0];
      if (defaultEmp) applyOccupation(defaultEmp);
    } else {
      const defaultBiz = OCCUPATIONS_DATABASE.find(o => o.contractType === 'business' || !o.contractType) || OCCUPATIONS_DATABASE[0];
      if (defaultBiz) applyOccupation(defaultBiz);
    }
  };

  // Sync external mode changes from sidebar
  useEffect(() => {
    if (activeContractType && activeContractType !== contractType) {
      handleSwitchMode(activeContractType);
    }
  }, [activeContractType]);

  const handleOccupationSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const occId = e.target.value;
    setSelectedOccupationId(occId);
    setFormError(null);
    if (!occId) return;
    const found = OCCUPATIONS_DATABASE.find(o => o.id === occId);
    if (found) {
      applyOccupation(found);
    }
  };

  const isLocked = liveContract?.status === 'completed' || !!liveContract?.clientParty?.signedAt || initialContract?.status === 'completed' || !!initialContract?.clientParty?.signedAt;

  const validateForm = (): boolean => {
    setFormError(null);

    if (isLocked) {
      setFormError('This contract has already been signed or completed and cannot be modified.');
      return false;
    }

    if (!selectedOccupationId) {
      setFormError('Please select a template / occupation from the dropdown list below before proceeding.');
      setActiveSection('scope');
      return false;
    }

    if (!title.trim()) {
      setFormError('Please enter a Title or Subject for the agreement.');
      setActiveSection('scope');
      return false;
    }

    if (!description.trim()) {
      setFormError(contractType === 'worker_employment' ? 'Please provide the Job Responsibilities and daily duties.' : 'Please provide the Scope of Deliverables and trade specifications.');
      setActiveSection('scope');
      return false;
    }

    if (!termsAndConditions.trim()) {
      setFormError('Please provide the Terms & Legal Conditions / Workplace Rules.');
      setActiveSection('scope');
      return false;
    }

    if (!adminName.trim()) {
      setFormError(contractType === 'worker_employment' ? 'Please enter the Employer / Authorized Officer name under Step 4.' : 'Please enter the Contractor legal name under Step 4.');
      setActiveSection('parties');
      return false;
    }

    if (!adminSignature) {
      setFormError('Please sign the agreement with your digital signature in Step 4 before proceeding.');
      setActiveSection('parties');
      return false;
    }

    return true;
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    const payload: CreateContractPayload = {
      contractType,
      title: title.trim(),
      category: category.trim() || (contractType === 'worker_employment' ? 'Company & Worker Employment' : 'Commercial Service'),
      occupation: selectedOccupationId,
      description: description.trim(),
      termsAndConditions: termsAndConditions.trim(),
      totalCost: contractType === 'worker_employment' ? (salaryDetails.baseSalary || totalCost) : totalCost,
      depositAmount: contractType === 'worker_employment' ? 0 : depositAmount,
      currency,
      language,
      deliveryDate: deliveryDate || new Date().toISOString().split('T')[0],
      salaryDetails: contractType === 'worker_employment' ? salaryDetails : undefined,
      hasMaterialsTable,
      materialsList: hasMaterialsTable ? materialsList : [],
      images: images || [],
      adminParty: {
        name: adminName.trim(),
        email: adminEmail.trim(),
        company: adminCompany.trim(),
        title: adminTitle.trim(),
        phone: adminPhone.trim(),
        address: adminAddress.trim(),
        signature: adminSignature,
        signedAt: new Date().toISOString(),
      },
      clientParty: {
        name: clientName.trim(),
        email: clientEmail.trim(),
        company: clientCompany.trim(),
      },
    };

    onSave(payload);
    setIsSubmitting(false);
  };

  const handleOpenProofread = () => {
    if (!title.trim() || !description.trim() || !adminName.trim()) {
      setFormError('Please fill in the title, description, and your name before opening the proofread view.');
      return;
    }
    setFormError(null);
    setIsProofreading(true);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  const handleDownloadDraft = async () => {
    setIsGeneratingPdf(true);
    try {
      const draftDummyContract: Contract = {
        id: initialContract?.id || 'DRAFT-PREVIEW',
        signingToken: 'DRAFT_TOKEN',
        adminUid: 'preview',
        contractType,
        title: title.trim() || 'Agreement Draft',
        category: category.trim() || (contractType === 'worker_employment' ? 'Company & Worker Employment' : 'Commercial Service'),
        occupation: selectedOccupationId,
        description: description.trim(),
        termsAndConditions: termsAndConditions.trim(),
        totalCost: contractType === 'worker_employment' ? (salaryDetails.baseSalary || totalCost) : totalCost,
        depositAmount: contractType === 'worker_employment' ? 0 : depositAmount,
        currency,
        language,
        deliveryDate: deliveryDate || new Date().toISOString().split('T')[0],
        salaryDetails: contractType === 'worker_employment' ? salaryDetails : undefined,
        hasMaterialsTable,
        materialsList,
        images,
        status: 'draft',
        linkInvalidated: false,
        accessCount: 0,
        auditTrail: [],
        adminParty: {
          name: adminName.trim() || 'Party A Signatory',
          email: adminEmail.trim(),
          company: adminCompany.trim(),
          title: adminTitle.trim(),
          phone: adminPhone.trim(),
          address: adminAddress.trim(),
          signature: adminSignature,
          signedAt: new Date().toISOString(),
        },
        clientParty: {
          name: clientName.trim() || 'Party B Signatory',
          email: clientEmail.trim(),
          company: clientCompany.trim(),
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await generateContractPDF(draftDummyContract, null);
    } catch (err) {
      console.warn('PDF export error:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const balanceDue = Math.max(0, totalCost - depositAmount);
  const materialsSum = materialsList.reduce((acc, curr) => acc + (curr.totalPrice || (curr.quantity * curr.unitPrice) || 0), 0);
  const isEmployment = contractType === 'worker_employment';

  // Render Proofread Full-Screen View if requested
  if (isProofreading) {
    return (
      <div className="min-h-screen bg-slate-100/80 py-4 sm:py-8 px-2 sm:px-6">
        <ContractProofreadView
          data={{
            contractType,
            title: title.trim() || (isEmployment ? 'Employment Agreement' : 'Commercial Service Agreement'),
            category: category.trim() || (isEmployment ? 'Company & Worker Employment' : 'Trade Service'),
            occupation: selectedOccupationId,
            description: description.trim(),
            termsAndConditions: termsAndConditions.trim(),
            totalCost: isEmployment ? (salaryDetails.baseSalary || totalCost) : totalCost,
            depositAmount: isEmployment ? 0 : depositAmount,
            currency,
            language,
            deliveryDate,
            salaryDetails: isEmployment ? salaryDetails : undefined,
            hasMaterialsTable,
            materialsList,
            images,
            adminParty: {
              name: adminName.trim() || 'Authorized Signatory',
              email: adminEmail.trim(),
              company: adminCompany.trim(),
              title: adminTitle.trim(),
              phone: adminPhone.trim(),
              address: adminAddress.trim(),
              signature: adminSignature || '',
              signedAt: new Date().toISOString(),
            },
            clientParty: {
              name: clientName.trim(),
              email: clientEmail.trim(),
              company: clientCompany.trim(),
            },
          }}
          occupationDefinition={currentOccupation}
          onBackToEdit={() => {
            setIsProofreading(false);
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
          }}
          onConfirmPublish={() => handleSubmit()}
          onSignInPerson={() => handleSubmit()}
          onDownloadPdfDraft={handleDownloadDraft}
          isSubmitting={isSubmitting}
          isGeneratingPdf={isGeneratingPdf}
        />
      </div>
    );
  }

  // Filter occupations matching current mode (or show all with section headers)
  const currentCategoryOccupations = OCCUPATIONS_DATABASE.filter(o => 
    isEmployment ? o.contractType === 'worker_employment' : (o.contractType === 'business' || !o.contractType)
  );

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
      <div className="bg-white border-2 border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col">
        
        {/* Top Active Contract Mode Bar - Clean display of current contract mode */}
        <div className="p-3 sm:p-4 bg-slate-900 border-b border-slate-800 text-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
              Contract Mode:
            </span>
            {isEmployment ? (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-500/15 text-teal-300 border border-teal-500/30 text-xs font-semibold shadow-2xs">
                <Users className="w-3.5 h-3.5 text-teal-300" />
                <span>Workers and Salary</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/15 text-blue-300 border border-blue-500/30 text-xs font-semibold shadow-2xs">
                <Building2 className="w-3.5 h-3.5 text-blue-300" />
                <span>Business</span>
              </div>
            )}
          </div>
        </div>

        {/* Locked Notification Banner if signed/completed */}
        {isLocked && (
          <div className="bg-rose-50 border-b border-rose-200 px-4 sm:px-6 py-2.5 text-rose-900 flex items-center justify-between text-xs shrink-0 font-medium">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 shrink-0 animate-pulse" />
              <span>
                <strong>Agreement Locked:</strong> This document has already been signed or completed and is archived.
              </span>
            </div>
            {onCancel && (
              <button
                onClick={onCancel}
                className="text-xs uppercase font-bold text-rose-900 hover:underline cursor-pointer"
              >
                Close View
              </button>
            )}
          </div>
        )}

        {/* Validation Error Alert Banner */}
        {formError && (
          <div className="bg-amber-50 border-b-2 border-amber-300 px-3 sm:px-5 py-2 text-amber-900 flex items-center justify-between text-xs shrink-0 font-semibold gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-600 shrink-0" />
              <span>{formError}</span>
            </div>
            <button
              type="button"
              onClick={() => setFormError(null)}
              className="text-amber-800 hover:text-amber-950 font-bold p-1 rounded hover:bg-amber-200/50 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Header Bar */}
        <div className="px-3 sm:px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-white shrink-0 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shadow-xs border shrink-0 ${
              isEmployment ? 'bg-teal-950 text-teal-400 border-teal-800' : 'bg-slate-900 text-blue-400 border-slate-800'
            }`}>
              {isEmployment ? <Users className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className="text-xs sm:text-base font-bold text-slate-900 truncate">
                  {isLocked 
                    ? 'Locked Document' 
                    : isEditing || initialContract 
                    ? (isEmployment ? 'Worker and Salary Agreement' : 'Business Contract') 
                    : (isEmployment ? 'Worker and Salary Agreement' : 'Business Contract')}
                </h2>
                <span className={`px-2 py-0.5 text-[9px] font-mono rounded-full font-bold uppercase tracking-wider border ${
                  isEmployment ? 'bg-teal-50 text-teal-700 border-teal-300' : 'bg-blue-50 text-blue-700 border-blue-300'
                }`}>
                  {isEmployment ? 'Workers and Salary' : 'Business'}
                </span>
              </div>
              <p className="text-[10px] font-sans text-slate-500 hidden sm:block truncate">
                {isEmployment 
                  ? 'Define worker duties, monthly/weekly salary, probation, company rules & digital signatures'
                  : 'Specify commercial deliverables, milestone costs, deposit terms & digital signatures'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {!isStandalone && onCancel && (
              <button
                onClick={onCancel}
                className="p-1 sm:p-1.5 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Main Form Scroll Area */}
        <form ref={formRef} onSubmit={handleSubmit} className="p-3 sm:p-6 space-y-5 overflow-y-auto flex-1 bg-slate-50">
            
            {/* SECTION 1: Scope & Role Definition */}
            <div 
              id="section-scope"
              className={`space-y-4 ${viewMode === 'single' && activeSection !== 'scope' ? 'hidden' : 'block'}`}
            >
            
            {/* Section Header Strip */}
            <div className="flex items-center justify-between bg-slate-100/90 border border-slate-200 px-3.5 py-2 rounded-xl">
              <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                {isEmployment ? 'Job Role, Designation & Work Duties' : 'Trade Classification & Scope of Deliverables'}
              </span>
              <span className="text-[11px] font-sans text-slate-500 hidden sm:inline">
                {isEmployment ? 'Pre-filled with company workplace policies' : 'Auto-fills tailored trade clauses'}
              </span>
            </div>

            {/* Template / Occupation Preset Selector Bar */}
            <div className="bg-white p-4 sm:p-5 border-2 border-slate-200 shadow-xs space-y-3 rounded-2xl">
              <label className="text-xs font-sans font-bold uppercase tracking-wider text-slate-900 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {isEmployment ? <Users className="w-4 h-4 text-emerald-600" /> : <Briefcase className="w-4 h-4 text-blue-600" />}
                  {isEmployment ? 'Select Worker Role / Employment Template' : 'Select Trade / Craft Preset'} <span className="text-red-500 font-bold">*</span>
                </span>
                {!selectedOccupationId && (
                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-300 px-2.5 py-0.5 rounded-md">
                    Please choose a preset below
                  </span>
                )}
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <select
                    value={selectedOccupationId}
                    onChange={handleOccupationSelectChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-300 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 rounded-xl cursor-pointer"
                  >
                    <option value="">-- Choose {isEmployment ? 'an Employment Category' : 'a Trade Preset'} --</option>
                    {currentCategoryOccupations.map((occ) => (
                      <option key={occ.id} value={occ.id}>
                        {occ.title} ({occ.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 font-mono">Category:</span>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Category"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 text-xs text-slate-800 rounded-xl font-medium focus:bg-white focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Title Input */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                  {isEmployment ? 'Employment Agreement Title *' : 'Contract Subject / Work Order Title *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isEmployment ? 'e.g. Full-Time Operations Specialist Employment & Salary Agreement' : 'e.g. Bespoke Luxury Suit Tailoring & Delivery Agreement'}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-300 text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 rounded-xl"
                />
              </div>
            </div>

            {/* Scope / Job Duties Text Box (Auto-Expanding) */}
            <div className="bg-white p-4 sm:p-5 border-2 border-slate-200 shadow-xs space-y-2 rounded-2xl">
              <div className="flex items-center justify-between">
                <label className="text-xs font-sans font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  {isEmployment ? 'Job Description, Key Deliverables & Daily Duties *' : 'Scope of Work & Deliverables *'}
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  Expands naturally as you type
                </span>
              </div>
              <AutoExpandingTextarea
                required
                placeholder={isEmployment 
                  ? 'Detail the employee or worker daily duties, operating standards, reporting line, and performance criteria...' 
                  : 'Detail all custom measurements, craftsmanship specifications, milestones, and deliverables...'}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                minHeight={150}
                className="w-full px-3.5 py-3 bg-slate-50 border-2 border-slate-300 text-xs text-slate-900 leading-relaxed font-mono font-medium focus:bg-white focus:outline-none focus:border-blue-600 rounded-xl"
              />
            </div>

            {/* Terms & Conditions / Worker Code of Conduct (Auto-Expanding) */}
            <div className="bg-white p-4 sm:p-5 border-2 border-slate-200 shadow-xs space-y-2 rounded-2xl">
              <div className="flex items-center justify-between">
                <label className="text-xs font-sans font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  {isEmployment ? 'Company Terms & Conditions, Code of Conduct & Workplace Rules *' : 'Terms & Conditions of Contract *'}
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  Legally binding clauses
                </span>
              </div>
              <AutoExpandingTextarea
                required
                placeholder={isEmployment 
                  ? '1. Attendance & Working Hours...\n2. Confidentiality & Non-Disclosure...\n3. Disciplinary Procedures...\n4. Termination & Notice Period...' 
                  : '1. Payment Milestone terms...\n2. Alteration & Inspection policies...\n3. Delay & Dispute Resolution...'}
                value={termsAndConditions}
                onChange={(e) => setTermsAndConditions(e.target.value)}
                minHeight={170}
                className="w-full px-3.5 py-3 bg-slate-50 border-2 border-slate-300 text-xs text-slate-900 leading-relaxed font-medium focus:bg-white focus:outline-none focus:border-blue-600 rounded-xl"
              />
            </div>

            {/* Section 1 Navigation Footing */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setActiveSection('financials');
                  if (viewMode === 'all') {
                    const formContainer = document.getElementById('section-financials');
                    if (formContainer) formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  } else {
                    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                    if (formRef.current) formRef.current.scrollTop = 0;
                  }
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white text-xs font-medium rounded-lg shadow-2xs cursor-pointer transition-all active:scale-95"
              >
                <span>Next: {isEmployment ? 'Salary & Package' : 'Cost & Spec'}</span>
                <span className="text-[11px]">→</span>
              </button>
            </div>

          </div>

          {/* SECTION 2: Financials / Cost & Spec / Salary & Compensation Package */}
          <div 
            id="section-financials"
            className={`space-y-4 ${viewMode === 'single' && activeSection !== 'financials' ? 'hidden' : 'block'}`}
          >
            
            {/* Section Header Strip */}
            <div className="flex items-center justify-between bg-slate-100/90 border border-slate-200 px-3.5 py-2 rounded-xl">
              <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">2</span>
                {isEmployment ? 'Salary, Wages & Remuneration Structure' : 'Pricing, Deposit & Materials Breakdown'}
              </span>
              <span className="text-[11px] font-sans text-slate-500 hidden sm:inline">
                {isEmployment ? 'Multi-frequency compensation & benefits terms' : 'Supports multi-currency manual costing'}
              </span>
            </div>

            {/* EMPLOYMENT SPECIFIC FINANCIALS & TERMS */}
            {isEmployment ? (
              <div className="bg-white p-4 sm:p-6 border-2 border-emerald-200 shadow-xs space-y-5 rounded-3xl">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-sans font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <Wallet className="w-4.5 h-4.5 text-emerald-600" />
                    Worker Compensation & Remuneration Terms
                  </h3>

                  {/* Currency Selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-sans font-bold uppercase text-slate-500">Currency:</span>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="px-2.5 py-1 bg-slate-50 border-2 border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-mono font-bold rounded-lg cursor-pointer"
                    >
                      {CURRENCY_LIST.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.code} ({c.symbol})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Main Salary & Employment Type Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  
                  {/* Base Salary Input */}
                  <div className="bg-emerald-950 text-white p-4 rounded-2xl space-y-2 shadow-xs">
                    <label className="block text-[10px] font-sans uppercase tracking-wider text-emerald-300 font-bold">
                      Base Salary / Wage Rate *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={salaryDetails.baseSalary === 0 ? '' : salaryDetails.baseSalary}
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : Number(e.target.value);
                        setSalaryDetails(prev => ({ ...prev, baseSalary: val }));
                        setTotalCost(val);
                      }}
                      placeholder="0.00"
                      className="w-full px-3 py-2 bg-emerald-900/80 border border-emerald-700 text-emerald-300 focus:outline-none focus:border-emerald-400 font-mono font-extrabold text-base rounded-xl"
                    />
                    <div className="flex items-center justify-between text-[11px] font-mono text-emerald-200">
                      <span>Rate:</span>
                      <strong className="text-emerald-300">{formatCurrency(salaryDetails.baseSalary, currency)} / {salaryDetails.paymentFrequency}</strong>
                    </div>
                  </div>

                  {/* Payment Frequency */}
                  <div className="bg-slate-50 border-2 border-slate-200 p-4 rounded-2xl space-y-2">
                    <label className="block text-[10px] font-sans uppercase tracking-wider text-slate-700 font-bold">
                      Payment Frequency *
                    </label>
                    <select
                      value={salaryDetails.paymentFrequency}
                      onChange={(e) => setSalaryDetails(prev => ({ ...prev, paymentFrequency: e.target.value as any }))}
                      className="w-full px-3 py-2 bg-white border border-slate-300 text-xs font-bold text-slate-900 rounded-xl focus:outline-none focus:border-emerald-600 cursor-pointer"
                    >
                      <option value="monthly">Monthly Salary</option>
                      <option value="weekly">Weekly Wage</option>
                      <option value="bi_weekly">Bi-Weekly Pay</option>
                      <option value="hourly">Hourly Rate</option>
                      <option value="annual">Annual Compensation</option>
                    </select>
                    <p className="text-[10px] text-slate-500">
                      Disbursement on scheduled payroll cycle.
                    </p>
                  </div>

                  {/* Employment Nature */}
                  <div className="bg-slate-50 border-2 border-slate-200 p-4 rounded-2xl space-y-2">
                    <label className="block text-[10px] font-sans uppercase tracking-wider text-slate-700 font-bold">
                      Employment Type *
                    </label>
                    <select
                      value={salaryDetails.employmentType}
                      onChange={(e) => setSalaryDetails(prev => ({ ...prev, employmentType: e.target.value as any }))}
                      className="w-full px-3 py-2 bg-white border border-slate-300 text-xs font-bold text-slate-900 rounded-xl focus:outline-none focus:border-emerald-600 cursor-pointer"
                    >
                      <option value="full_time">Full-Time Staff</option>
                      <option value="part_time">Part-Time Staff</option>
                      <option value="contract">Fixed-Term Contract</option>
                      <option value="probationary">Probationary Period</option>
                      <option value="apprentice">Apprentice / Trainee</option>
                    </select>
                    <p className="text-[10px] text-slate-500">
                      Defines status and statutory benefits.
                    </p>
                  </div>

                </div>

                {/* Additional Employment Specific Terms (Working Hours, Probation, Allowances) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                  
                  <div>
                    <label className="block text-[10px] font-sans uppercase tracking-wider text-slate-700 font-bold mb-1">
                      Designation / Role Title
                    </label>
                    <input
                      type="text"
                      value={salaryDetails.jobTitle || ''}
                      onChange={(e) => setSalaryDetails(prev => ({ ...prev, jobTitle: e.target.value }))}
                      placeholder="e.g. Head Technician / Driver"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 text-xs text-slate-900 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-sans uppercase tracking-wider text-slate-700 font-bold mb-1">
                      Department / Workstation
                    </label>
                    <input
                      type="text"
                      value={salaryDetails.department || ''}
                      onChange={(e) => setSalaryDetails(prev => ({ ...prev, department: e.target.value }))}
                      placeholder="e.g. Field Operations"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 text-xs text-slate-900 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-sans uppercase tracking-wider text-slate-700 font-bold mb-1">
                      Employment Start Date *
                    </label>
                    <input
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 text-xs text-slate-900 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-sans uppercase tracking-wider text-slate-700 font-bold mb-1">
                      Working Hours & Schedule
                    </label>
                    <input
                      type="text"
                      value={salaryDetails.workingHours || ''}
                      onChange={(e) => setSalaryDetails(prev => ({ ...prev, workingHours: e.target.value }))}
                      placeholder="e.g. Mon - Fri, 8:00 AM - 5:00 PM"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 text-xs text-slate-900 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-sans uppercase tracking-wider text-slate-700 font-bold mb-1">
                      Probation Period
                    </label>
                    <input
                      type="text"
                      value={salaryDetails.probationPeriod || ''}
                      onChange={(e) => setSalaryDetails(prev => ({ ...prev, probationPeriod: e.target.value }))}
                      placeholder="e.g. 3 Months"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 text-xs text-slate-900 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-sans uppercase tracking-wider text-slate-700 font-bold mb-1">
                      Termination Notice Period
                    </label>
                    <input
                      type="text"
                      value={salaryDetails.noticePeriod || ''}
                      onChange={(e) => setSalaryDetails(prev => ({ ...prev, noticePeriod: e.target.value }))}
                      placeholder="e.g. 30 Days Written Notice"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 text-xs text-slate-900 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-sans uppercase tracking-wider text-slate-700 font-bold mb-1">
                      Allowances, Benefits & Bonuses
                    </label>
                    <input
                      type="text"
                      value={salaryDetails.allowances || ''}
                      onChange={(e) => setSalaryDetails(prev => ({ ...prev, allowances: e.target.value }))}
                      placeholder="e.g. Transport stipend, Lunch subsidy, Performance commission"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 text-xs text-slate-900 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-sans uppercase tracking-wider text-slate-700 font-bold mb-1">
                      Annual Leave Entitlement
                    </label>
                    <input
                      type="text"
                      value={salaryDetails.leaveDays || ''}
                      onChange={(e) => setSalaryDetails(prev => ({ ...prev, leaveDays: e.target.value }))}
                      placeholder="e.g. 21 Days Paid Leave"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 text-xs text-slate-900 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                </div>
              </div>
            ) : (
              /* COMMERCIAL / B2B FINANCIALS */
              <div className="bg-white p-4 sm:p-5 border-2 border-slate-200 shadow-xs space-y-4 rounded-2xl">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                  <h3 className="text-sm font-sans font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    Contract Value & Payment Schedule
                  </h3>

                  {/* Quick Currency Selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-sans font-bold uppercase text-slate-500">Currency:</span>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="px-2.5 py-1 bg-slate-50 border-2 border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-mono font-bold rounded-lg cursor-pointer"
                    >
                      {CURRENCY_LIST.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.code} ({c.symbol})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 4 Metric Inputs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {/* Total Contract Fee */}
                  <div className="bg-slate-900 text-white p-3.5 rounded-xl space-y-1.5 shadow-sm">
                    <label className="block text-[10px] font-sans uppercase tracking-wider text-slate-300 font-bold">
                      Total Contract Fee
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={totalCost === 0 ? '' : totalCost}
                      onChange={(e) => setTotalCost(e.target.value === '' ? 0 : Number(e.target.value))}
                      placeholder="0.00"
                      className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 text-emerald-400 focus:outline-none focus:border-emerald-500 font-mono font-extrabold text-sm rounded-lg"
                    />
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
                      <span>Formatted:</span>
                      <strong className="text-emerald-400">{formatCurrency(totalCost, currency)}</strong>
                    </div>
                  </div>

                  {/* Initial Deposit */}
                  <div className="bg-blue-50/70 border-2 border-blue-200 p-3.5 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] font-sans uppercase tracking-wider text-blue-950 font-bold">
                        Initial Deposit
                      </label>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setDepositAmount(Math.round(totalCost * 0.5))}
                          className="px-1.5 py-0.5 bg-white hover:bg-blue-100 border border-blue-300 text-[9px] font-mono font-bold text-blue-800 rounded"
                          title="Set 50% Deposit"
                        >
                          50%
                        </button>
                        <button
                          type="button"
                          onClick={() => setDepositAmount(Math.round(totalCost * 0.7))}
                          className="px-1.5 py-0.5 bg-white hover:bg-blue-100 border border-blue-300 text-[9px] font-mono font-bold text-blue-800 rounded"
                          title="Set 70% Deposit"
                        >
                          70%
                        </button>
                      </div>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={depositAmount === 0 ? '' : depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value === '' ? 0 : Number(e.target.value))}
                      placeholder="0.00"
                      className="w-full px-2.5 py-1.5 bg-white border border-blue-300 text-blue-900 focus:outline-none focus:border-blue-600 font-mono font-bold text-sm rounded-lg"
                    />
                    <div className="flex items-center justify-between text-[11px] font-mono text-blue-900">
                      <span>Upfront:</span>
                      <strong>{formatCurrency(depositAmount, currency)}</strong>
                    </div>
                  </div>

                  {/* Balance Due */}
                  <div className="bg-slate-100 border-2 border-slate-200 p-3.5 rounded-xl space-y-1.5">
                    <label className="block text-[10px] font-sans uppercase tracking-wider text-slate-700 font-bold">
                      Balance on Delivery
                    </label>
                    <div className="py-1.5 px-2 bg-white border border-slate-200 rounded-lg">
                      <span className="font-mono font-extrabold text-sm text-slate-900">
                        {formatCurrency(balanceDue, currency)}
                      </span>
                    </div>
                    <p className="text-[10px] font-sans text-slate-500">
                      Payable upon completion & handover.
                    </p>
                  </div>

                  {/* Target Delivery Date */}
                  <div className="bg-white border-2 border-slate-300 p-3.5 rounded-xl space-y-1.5">
                    <label className="block text-[10px] font-sans uppercase tracking-wider text-slate-800 font-bold">
                      Target Delivery Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600 rounded-lg"
                    />
                    <p className="text-[10px] font-sans text-slate-500">
                      Estimated milestone deadline.
                    </p>
                  </div>
                </div>

                {/* Materials sync banner */}
                {materialsSum > 0 && (
                  <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                    <div className="flex items-center gap-2 text-emerald-900 font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span>
                        Itemized materials sum from table below is <strong>{formatCurrency(materialsSum, currency)}</strong>.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setTotalCost(materialsSum);
                        setDepositAmount(Math.round(materialsSum * 0.5));
                      }}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-sans font-bold uppercase rounded-lg cursor-pointer"
                    >
                      Set Fee = {formatCurrency(materialsSum, currency)}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Materials / Equipment & Asset Table */}
            <div className="bg-white p-4 sm:p-5 border-2 border-slate-200 shadow-xs space-y-3 rounded-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span className="font-sans font-bold text-xs text-slate-900 uppercase tracking-wider">
                    {isEmployment ? 'Issued Company Assets, Tools & Workstations' : 'Itemized Work Table (Quantity, Quality & Amount)'}
                  </span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-sans font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={hasMaterialsTable}
                    onChange={(e) => setHasMaterialsTable(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Include {isEmployment ? 'Asset' : 'Itemized'} Table</span>
                </label>
              </div>

              {hasMaterialsTable && (
                <MaterialsTable
                  materials={materialsList}
                  currency={currency}
                  onChange={(newList) => {
                    setMaterialsList(newList);
                  }}
                  onDeleteTable={() => setHasMaterialsTable(false)}
                  onSyncTotalCost={(total) => {
                    if (!isEmployment) {
                      setTotalCost(total);
                      setDepositAmount(Math.round(total * 0.5));
                    }
                  }}
                />
              )}
            </div>

            {/* Section 2 Navigation Footing */}
            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setActiveSection('scope');
                  if (viewMode === 'all') {
                    const formContainer = document.getElementById('section-scope');
                    if (formContainer) formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  } else {
                    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                    if (formRef.current) formRef.current.scrollTop = 0;
                  }
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg border border-slate-200 cursor-pointer transition-colors active:scale-95"
              >
                <span className="text-[11px]">←</span>
                <span>Back to Scope</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveSection('photos');
                  if (viewMode === 'all') {
                    const formContainer = document.getElementById('section-photos');
                    if (formContainer) formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  } else {
                    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                    if (formRef.current) formRef.current.scrollTop = 0;
                  }
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white text-xs font-medium rounded-lg shadow-2xs cursor-pointer transition-all active:scale-95"
              >
                <span>Next: Attach Photos</span>
                <span className="text-[11px]">→</span>
              </button>
            </div>

          </div>

          {/* SECTION 3: Up to 20 Photo Specs */}
          <div 
            id="section-photos"
            className={`space-y-4 ${viewMode === 'single' && activeSection !== 'photos' ? 'hidden' : 'block'}`}
          >
            
            {/* Section Header Strip */}
            <div className="flex items-center justify-between bg-slate-100/90 border border-slate-200 px-3.5 py-2 rounded-xl">
              <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">3</span>
                Visual Sample & Asset Attachments
              </span>
              <span className="text-[11px] font-sans text-slate-500 hidden sm:inline">
                Attach work samples, site photos, uniforms or specifications
              </span>
            </div>

            <div className="bg-white p-4 sm:p-5 border-2 border-slate-200 shadow-xs space-y-3 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-sans font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                    Attach Work Specifications & Samples
                  </h3>
                  <p className="text-xs font-sans text-slate-500 mt-0.5">
                    Upload up to 20 images to provide visual clarity.
                  </p>
                </div>
                <span className="px-3 py-1 bg-blue-50 text-blue-900 text-xs font-mono font-bold rounded-full border border-blue-300">
                  {images.length} / 20
                </span>
              </div>

              <ImageUploader
                images={images}
                onChange={setImages}
                maxImages={20}
              />
            </div>

            {/* Section 3 Navigation Footing */}
            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setActiveSection('financials');
                  if (viewMode === 'all') {
                    const formContainer = document.getElementById('section-financials');
                    if (formContainer) formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  } else {
                    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                    if (formRef.current) formRef.current.scrollTop = 0;
                  }
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg border border-slate-200 cursor-pointer transition-colors active:scale-95"
              >
                <span className="text-[11px]">←</span>
                <span>Back to {isEmployment ? 'Salary' : 'Cost & Spec'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveSection('parties');
                  if (viewMode === 'all') {
                    const formContainer = document.getElementById('section-parties');
                    if (formContainer) formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  } else {
                    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                    if (formRef.current) formRef.current.scrollTop = 0;
                  }
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white text-xs font-medium rounded-lg shadow-2xs cursor-pointer transition-all active:scale-95"
              >
                <span>Next: Signatures</span>
                <span className="text-[11px]">→</span>
              </button>
            </div>

          </div>

          {/* SECTION 4: Parties & Signatures */}
          <div 
            id="section-parties"
            className={`space-y-4 ${viewMode === 'single' && activeSection !== 'parties' ? 'hidden' : 'block'}`}
          >
            
            {/* Section Header Strip */}
            <div className="flex items-center justify-between bg-slate-100/90 border border-slate-200 px-3.5 py-2 rounded-xl">
              <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">4</span>
                Contracting Parties & Digital Execution
              </span>
              <span className="text-[11px] font-sans text-slate-500 hidden sm:inline">
                Both parties execute legally binding signatures
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Party A (Provider / Employer) */}
              <div className="bg-white p-4 sm:p-5 border-2 border-blue-200 shadow-xs space-y-3 rounded-2xl">
                <div className="flex items-center justify-between border-b border-blue-100 pb-2">
                  <h4 className="text-xs font-sans font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    {isEmployment ? 'Party A: Employer / Company Signatory' : 'Party A: Service Provider / Contractor'}
                  </h4>
                  <span className="text-[9px] font-bold uppercase px-2 py-0.5 bg-blue-100 text-blue-900 rounded">
                    {isEmployment ? 'Employer' : 'Contractor'}
                  </span>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="block text-[10px] font-sans uppercase font-bold text-slate-700 mb-1">
                      {isEmployment ? 'Authorized Officer Name *' : 'Full Legal Name *'}
                    </label>
                    <input
                      type="text"
                      placeholder={isEmployment ? 'e.g. Managing Director Name' : 'Contractor / Artisan Full Name'}
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 text-xs text-slate-900 font-semibold rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-sans uppercase font-bold text-slate-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="officer@company.com"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 text-xs text-slate-900 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-sans uppercase font-bold text-slate-700 mb-1">
                      {isEmployment ? 'Company / Business Registered Name' : 'Business / Brand Name'}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Apex Industrial Works Ltd"
                      value={adminCompany}
                      onChange={(e) => setAdminCompany(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 text-xs text-slate-900 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-sans uppercase font-bold text-slate-700 mb-1">
                      Official Designation / Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Managing Director / Human Resources"
                      value={adminTitle}
                      onChange={(e) => setAdminTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 text-xs text-slate-900 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <label className="block text-[11px] font-sans uppercase tracking-wider text-slate-800 mb-1 font-bold">
                    {isEmployment ? 'Employer Authorized Digital Signature *' : 'Contractor Digital Signature *'}
                  </label>
                  <SignaturePad
                    savedSignature={adminSignature}
                    onSaveSignature={setAdminSignature}
                    defaultName={adminName}
                  />
                </div>
              </div>

              {/* Party B (Client / Worker) */}
              <div className="bg-white p-4 sm:p-5 border-2 border-slate-300 shadow-xs space-y-3 rounded-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="text-xs font-sans font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-700" />
                    {isEmployment ? 'Party B: Worker / Employee' : 'Party B: Client / Buyer'}
                  </h4>
                  <span className="text-[9px] font-bold uppercase px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                    {isEmployment ? 'Worker Acceptance' : 'Client Portal'}
                  </span>
                </div>
                <p className="text-[11px] font-sans text-slate-500">
                  {isEmployment 
                    ? 'Enter the worker/employee details here or allow them to confirm via signing link.'
                    : 'Fill client details here, or leave blank so client enters them on the signing link.'}
                </p>

                <div className="space-y-2">
                  <div>
                    <label className="block text-[10px] font-sans uppercase font-bold text-slate-700 mb-1">
                      {isEmployment ? 'Worker / Employee Full Legal Name' : 'Client Full Name'}
                    </label>
                    <input
                      type="text"
                      placeholder={isEmployment ? 'Worker Legal Name' : 'Client Full Name'}
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 text-xs text-slate-900 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-sans uppercase font-bold text-slate-700 mb-1">
                      {isEmployment ? 'Worker Email / Phone for Link' : 'Client Email Address'}
                    </label>
                    <input
                      type="email"
                      placeholder={isEmployment ? 'worker@gmail.com' : 'client@gmail.com'}
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 text-xs text-slate-900 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-sans uppercase font-bold text-slate-700 mb-1">
                      {isEmployment ? 'Staff ID / Employee Code (Optional)' : 'Client Company (Optional)'}
                    </label>
                    <input
                      type="text"
                      placeholder={isEmployment ? 'e.g. EMP-2026-084' : 'Client Organization'}
                      value={clientCompany}
                      onChange={(e) => setClientCompany(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 text-xs text-slate-900 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                {liveContract?.clientParty?.signature ? (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Signed by {liveContract.clientParty.name || clientName || (isEmployment ? 'Worker' : 'Client')}
                      </span>
                      {liveContract.clientParty.signedAt && (
                        <span className="text-[10px] text-emerald-700 font-mono">
                          {new Date(liveContract.clientParty.signedAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="bg-white p-2 border border-emerald-200 rounded-lg flex items-center justify-center max-h-20 overflow-hidden">
                      <img 
                        src={liveContract.clientParty.signature} 
                        alt="Digital Signature" 
                        className="max-h-16 object-contain"
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-emerald-800 font-semibold pt-1">
                      <span>✓ Agreement Executed & Sealed</span>
                      <span className="font-mono bg-emerald-100 px-1.5 py-0.5 rounded">LOCKED</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 leading-relaxed">
                    <strong>Digital Signature:</strong> The {isEmployment ? 'worker / employee' : 'client'} will review this agreement and execute their signature (handwritten or typed) directly on the secure link or in person.
                  </div>
                )}
              </div>

            </div>

            {/* Section 4 Back Button */}
            <div className="pt-2 flex justify-start">
              <button
                type="button"
                onClick={() => {
                  setActiveSection('photos');
                  if (viewMode === 'all') {
                    const formContainer = document.getElementById('section-photos');
                    if (formContainer) formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  } else {
                    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                    if (formRef.current) formRef.current.scrollTop = 0;
                  }
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg border border-slate-200 cursor-pointer transition-colors active:scale-95"
              >
                <span className="text-[11px]">←</span>
                <span>Back to Photos</span>
              </button>
            </div>

          </div>

          {/* Desktop Form Bottom Sticky Action Bar */}
          <div className="hidden md:flex items-center justify-between bg-white border-t border-slate-200 pt-3.5 mt-5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenProofread}
                className="flex items-center gap-1.5 px-3 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200/90 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer active:scale-95 shadow-2xs"
              >
                <FileCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>Proofread Agreement</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadDraft}
                disabled={isGeneratingPdf}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer active:scale-95 disabled:opacity-50 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>{isGeneratingPdf ? 'Exporting...' : 'PDF Preview'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2.5">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
              )}

              {!isLocked && (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-white text-xs font-semibold uppercase tracking-wider rounded-lg shadow-xs transition-all cursor-pointer active:scale-95 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  )}
                  <span>{isSubmitting ? 'Generating...' : (isEmployment ? 'Generate Worker Signing Link' : 'Generate Signing Link')}</span>
                </button>
              )}
            </div>
          </div>

          {/* Mobile Native Bottom Navigation Bar */}
          <div className="md:hidden sticky bottom-0 z-30 -mx-3 -mb-3 bg-white/95 backdrop-blur-md border-t border-slate-200 p-2 flex items-center justify-between gap-1.5 shadow-xs">
            {activeSection !== 'scope' ? (
              <button
                type="button"
                onClick={() => {
                  if (activeSection === 'parties') setActiveSection('photos');
                  else if (activeSection === 'photos') setActiveSection('financials');
                  else if (activeSection === 'financials') setActiveSection('scope');
                  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                  if (formRef.current) formRef.current.scrollTop = 0;
                }}
                className="h-9 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold uppercase rounded-lg flex items-center gap-1 transition-colors active:scale-95 cursor-pointer shrink-0"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-1.5 flex-1 justify-end min-w-0">
              <button
                type="button"
                onClick={handleOpenProofread}
                className="h-9 px-2.5 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 text-xs font-semibold rounded-lg flex items-center gap-1 active:scale-95 cursor-pointer transition-colors shrink-0 shadow-2xs"
              >
                <FileCheck className="w-3.5 h-3.5 text-teal-600" />
                <span className="text-[11px]">Proofread</span>
              </button>

              {activeSection === 'parties' ? (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-9 px-3 text-white text-xs font-semibold uppercase tracking-wider rounded-lg flex items-center gap-1 shadow-xs active:scale-95 transition-all cursor-pointer shrink-0 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  )}
                  <span>{isSubmitting ? '...' : 'Sign & Link'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (activeSection === 'scope') setActiveSection('financials');
                    else if (activeSection === 'financials') setActiveSection('photos');
                    else if (activeSection === 'photos') setActiveSection('parties');
                    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                    if (formRef.current) formRef.current.scrollTop = 0;
                  }}
                  className="h-9 px-3 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white text-xs font-semibold uppercase tracking-wider rounded-lg flex items-center gap-1 shadow-xs active:scale-95 transition-all cursor-pointer shrink-0"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
