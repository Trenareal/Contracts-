import React, { useState, useEffect } from 'react';
import { Contract, CreateContractPayload, ContractMaterialItem, ContractImage, PartyDetails } from '../types';
import { SignaturePad } from './SignaturePad';
import { MaterialsTable } from './MaterialsTable';
import { ImageUploader } from './ImageUploader';
import { OCCUPATIONS_DATABASE, OccupationDefinition } from '../data/occupations';
import { CURRENCY_LIST, formatCurrency } from '../utils/formatters';
import { SUPPORTED_LANGUAGES, getI18nText } from '../utils/i18n';
import { generateContractPDF } from '../utils/pdfGenerator';
import { UserBusinessProfile } from './OccupationSelectModal';
import { 
  FileText, 
  DollarSign, 
  Calendar, 
  User, 
  Building, 
  Sparkles, 
  X, 
  CheckCircle2, 
  Briefcase, 
  Globe,
  Plus,
  Layers,
  Image as ImageIcon,
  Check,
  CreditCard,
  Loader2,
  Download
} from 'lucide-react';

interface ContractFormProps {
  onSave: (payload: CreateContractPayload) => void;
  onCancel?: () => void;
  isStandalone?: boolean;
  initialContract?: Contract | null;
  isEditing?: boolean;
  defaultOccupation?: OccupationDefinition | null;
  defaultBusinessProfile?: UserBusinessProfile | null;
  defaultAdminParty?: Partial<PartyDetails> | null;
  defaultCurrency?: string;
  defaultLanguage?: string;
}

export const ContractForm: React.FC<ContractFormProps> = ({
  onSave,
  onCancel,
  isStandalone = false,
  initialContract,
  isEditing,
  defaultOccupation,
  defaultBusinessProfile,
  defaultAdminParty,
  defaultCurrency = 'NGN',
  defaultLanguage = 'en',
}) => {
  const [selectedOccupationId, setSelectedOccupationId] = useState<string>(
    initialContract?.occupation || defaultOccupation?.id || ''
  );
  const [title, setTitle] = useState(initialContract?.title || '');
  const [category, setCategory] = useState(initialContract?.category || '');
  const [description, setDescription] = useState(initialContract?.description || '');
  const [termsAndConditions, setTermsAndConditions] = useState(initialContract?.termsAndConditions || '');
  const [totalCost, setTotalCost] = useState<number>(initialContract?.totalCost || 0);
  const [depositAmount, setDepositAmount] = useState<number>(initialContract?.depositAmount || 0);
  const [currency, setCurrency] = useState(initialContract?.currency || defaultCurrency);
  const [language, setLanguage] = useState(initialContract?.language || defaultLanguage);
  const [deliveryDate, setDeliveryDate] = useState(
    initialContract?.deliveryDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );

  // Mobile Step Switcher
  const [mobileStep, setMobileStep] = useState<'scope' | 'financials' | 'photos' | 'parties'>('scope');

  // Materials Table state
  const [hasMaterialsTable, setHasMaterialsTable] = useState<boolean>(
    initialContract?.hasMaterialsTable ?? true
  );
  const [materialsList, setMaterialsList] = useState<ContractMaterialItem[]>(
    initialContract?.materialsList || []
  );

  // Images state (Up to 20 pictures)
  const [images, setImages] = useState<ContractImage[]>(
    initialContract?.images || []
  );

  // Admin Party Details
  const [adminName, setAdminName] = useState(
    initialContract?.adminParty?.name || defaultAdminParty?.name || 'Alex Mercer'
  );
  const [adminEmail, setAdminEmail] = useState(
    initialContract?.adminParty?.email || defaultAdminParty?.email || 'alex.mercer@apexstudio.ng'
  );
  const [adminCompany, setAdminCompany] = useState(
    initialContract?.adminParty?.company || defaultBusinessProfile?.businessName || defaultAdminParty?.company || 'Apex Craft & Engineering Works'
  );
  const [adminTitle, setAdminTitle] = useState(
    initialContract?.adminParty?.title || defaultBusinessProfile?.professionalTitle || defaultAdminParty?.title || 'Master Artisan / Lead Contractor'
  );
  const [adminPhone, setAdminPhone] = useState(
    initialContract?.adminParty?.phone || defaultBusinessProfile?.phone || defaultAdminParty?.phone || ''
  );
  const [adminAddress, setAdminAddress] = useState(
    initialContract?.adminParty?.address || defaultBusinessProfile?.address || defaultAdminParty?.address || ''
  );
  const [adminSignature, setAdminSignature] = useState(initialContract?.adminParty?.signature || '');

  // Client Party Pre-fill
  const [clientName, setClientName] = useState(initialContract?.clientParty?.name || '');
  const [clientEmail, setClientEmail] = useState(initialContract?.clientParty?.email || '');
  const [clientCompany, setClientCompany] = useState(initialContract?.clientParty?.company || '');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const i18n = getI18nText(language);

  // Group occupations by category for structured dropdown navigation
  const categoriesList = Array.from(new Set(OCCUPATIONS_DATABASE.map(o => o.category)));

  // Auto-fill when occupation changes or if defaultOccupation provided
  useEffect(() => {
    if (!initialContract && defaultOccupation) {
      applyOccupation(defaultOccupation);
    }
  }, [defaultOccupation]);

  useEffect(() => {
    if (!initialContract && defaultBusinessProfile?.businessName) {
      setAdminCompany(defaultBusinessProfile.businessName);
      if (defaultBusinessProfile.professionalTitle) setAdminTitle(defaultBusinessProfile.professionalTitle);
      if (defaultBusinessProfile.phone) setAdminPhone(defaultBusinessProfile.phone);
      if (defaultBusinessProfile.address) setAdminAddress(defaultBusinessProfile.address);
    }
  }, [defaultBusinessProfile]);

  const applyOccupation = (occ: OccupationDefinition) => {
    setSelectedOccupationId(occ.id);
    setTitle(`${occ.title} Service Agreement`);
    setCategory(occ.category);
    setDescription(occ.defaultScope);
    setTermsAndConditions(occ.defaultTerms);

    // Populate trade-specific material specifications with unitPrice at 0 for manual cost input
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

  const handleOccupationSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const occId = e.target.value;
    setSelectedOccupationId(occId);
    setFormError(null);
    if (!occId) {
      return;
    }
    const found = OCCUPATIONS_DATABASE.find(o => o.id === occId);
    if (found) {
      applyOccupation(found);
    }
  };

  const isLocked = initialContract?.status === 'completed' || !!initialContract?.clientParty?.signedAt;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFormError(null);

    if (isLocked) {
      setFormError('This contract has already been signed or completed and cannot be modified.');
      return;
    }

    if (!selectedOccupationId) {
      setFormError('Please select your Trade / Craft from the dropdown list below before generating the link.');
      setMobileStep('scope');
      return;
    }

    if (!title.trim()) {
      setFormError('Please enter a Contract Title or Subject.');
      setMobileStep('scope');
      return;
    }

    if (!description.trim()) {
      setFormError('Please provide the Scope of Deliverables and trade specifications.');
      setMobileStep('scope');
      return;
    }

    if (!termsAndConditions.trim()) {
      setFormError('Please provide the Terms & Legal Conditions.');
      setMobileStep('scope');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: CreateContractPayload = {
        title: title.trim(),
        category: category.trim() || 'General Service',
        occupation: selectedOccupationId,
        description: description.trim(),
        termsAndConditions: termsAndConditions.trim(),
        totalCost: Number(totalCost) || 0,
        depositAmount: Number(depositAmount) || 0,
        currency,
        language,
        deliveryDate,
        hasMaterialsTable,
        materialsList: hasMaterialsTable ? materialsList : [],
        images,
        adminParty: {
          name: adminName.trim() || 'Artisan / Service Provider',
          email: adminEmail.trim() || 'artisan@business.local',
          company: adminCompany.trim() || '',
          title: adminTitle.trim() || '',
          phone: adminPhone.trim() || '',
          address: adminAddress.trim() || '',
          signature: adminSignature || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="250" height="60"><text x="10" y="40" font-family="cursive" font-size="22" fill="%231e3a8a">Alex Mercer (Contractor)</text></svg>',
          signedAt: new Date().toISOString(),
        },
        clientParty: {
          name: clientName.trim(),
          email: clientEmail.trim(),
          company: clientCompany.trim(),
        },
      };

      await onSave(payload);
    } catch (err: any) {
      console.error('Submit error:', err);
      setFormError(err?.message || 'Failed to generate contract. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadDraft = async () => {
    setIsGeneratingPdf(true);
    try {
      const mockContract: Contract = {
        id: initialContract?.id || `cnt_${Math.random().toString(36).substring(2, 8)}`,
        adminUid: initialContract?.adminUid || 'current_user',
        signingToken: initialContract?.signingToken || 'draft_token',
        title: title.trim() || 'Service Agreement',
        category: category.trim() || 'General Service',
        occupation: selectedOccupationId,
        description: description.trim() || 'No description provided yet.',
        termsAndConditions: termsAndConditions.trim() || 'Standard terms apply.',
        totalCost: Number(totalCost) || 0,
        depositAmount: Number(depositAmount) || 0,
        currency,
        language,
        deliveryDate,
        hasMaterialsTable,
        materialsList: hasMaterialsTable ? materialsList : [],
        images,
        status: initialContract?.status || 'draft',
        createdAt: initialContract?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        linkInvalidated: false,
        accessCount: 0,
        auditTrail: [],
        adminParty: {
          name: adminName.trim() || 'Contractor / Artisan',
          email: adminEmail.trim() || 'provider@business.local',
          company: adminCompany.trim() || '',
          title: adminTitle.trim() || '',
          phone: adminPhone.trim() || '',
          address: adminAddress.trim() || '',
          signature: adminSignature || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="250" height="60"><text x="10" y="40" font-family="cursive" font-size="22" fill="%231e3a8a">Alex Mercer (Contractor)</text></svg>',
          signedAt: new Date().toISOString(),
        },
        clientParty: {
          name: clientName.trim(),
          email: clientEmail.trim(),
          company: clientCompany.trim(),
        },
      };

      await generateContractPDF(mockContract);
    } catch (pdfErr) {
      console.error('Draft PDF generation failed:', pdfErr);
      setFormError('Failed to generate PDF. Please check form details.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const containerClasses = isStandalone
    ? "max-w-6xl mx-auto w-full px-2 sm:px-4 py-2 sm:py-4"
    : "fixed inset-0 z-50 flex flex-col sm:items-center sm:justify-center bg-slate-950/60 backdrop-blur-xs p-0 sm:p-3 overflow-y-auto";

  const cardClasses = isStandalone
    ? "bg-white rounded-2xl border-2 border-slate-200 shadow-lg overflow-hidden flex flex-col"
    : "bg-white rounded-none sm:rounded-2xl border-0 sm:border-2 border-slate-200 max-w-6xl w-full h-full sm:h-auto sm:max-h-[94vh] sm:my-2 shadow-2xl overflow-hidden flex flex-col";

  const materialsSum = materialsList.reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);
  const balanceDue = Math.max(0, totalCost - depositAmount);

  return (
    <div className={containerClasses}>
      <div className={cardClasses}>
        
        {/* Locked Notification Banner if signed/completed */}
        {isLocked && (
          <div className="bg-rose-50 border-b border-rose-200 px-4 sm:px-6 py-2.5 text-rose-900 flex items-center justify-between text-xs shrink-0 font-medium">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 shrink-0 animate-pulse" />
              <span>
                <strong>Contract Locked:</strong> This agreement has already been signed or completed and is archived as a legal record.
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
        <div className="px-3 sm:px-5 py-2.5 sm:py-3 border-b border-slate-200 flex items-center justify-between bg-white shrink-0 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-slate-900 text-blue-400 flex items-center justify-center font-bold text-xs shadow-xs border border-slate-800 shrink-0">
              C
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className="text-xs sm:text-base font-bold text-slate-900 truncate">
                  {isLocked 
                    ? 'Locked Contract' 
                    : isEditing || initialContract 
                    ? 'Edit Agreement' 
                    : 'Draft Agreement'}
                </h2>
                {isStandalone && !isLocked && (
                  <span className="hidden md:inline-block px-2 py-0.5 text-[9px] font-mono rounded-full bg-blue-50 text-blue-700 border border-blue-300 font-bold uppercase tracking-wider">
                    E-Sign
                  </span>
                )}
              </div>
              <p className="text-[10px] font-sans text-slate-500 hidden sm:block truncate">
                {isLocked 
                  ? 'Signed / Completed Legal Document' 
                  : 'Specify trade, deliverables & costing to generate instant signing link'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={handleDownloadDraft}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] sm:text-xs font-sans font-bold uppercase tracking-wider rounded-lg sm:rounded-xl cursor-pointer border border-slate-200 transition-all active:scale-95 disabled:opacity-50"
              title="Download PDF document draft"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">{isGeneratingPdf ? 'Exporting...' : 'Download PDF'}</span>
            </button>

            {!isLocked && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSubmit()}
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-[11px] sm:text-xs font-sans font-bold uppercase tracking-wider rounded-lg sm:rounded-xl cursor-pointer shadow-xs active:scale-95 whitespace-nowrap transition-all"
                title="Generate and get signing link"
              >
                {isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>{isSubmitting ? 'Generating...' : 'Generate Link'}</span>
              </button>
            )}
            {!isStandalone && onCancel && (
              <button
                onClick={onCancel}
                className="p-1 sm:p-1.5 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Step Navigation Tabs (md:hidden) */}
        <div className="md:hidden flex items-center bg-slate-100 border-b border-slate-200 px-2 py-1.5 gap-1 overflow-x-auto no-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => setMobileStep('scope')}
            className={`px-2.5 py-1 text-[11px] font-sans font-bold uppercase whitespace-nowrap rounded-lg transition-all ${
              mobileStep === 'scope' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-700 bg-white border border-slate-200'
            }`}
          >
            1. Scope
          </button>
          <button
            type="button"
            onClick={() => setMobileStep('financials')}
            className={`px-2.5 py-1 text-[11px] font-sans font-bold uppercase whitespace-nowrap rounded-lg transition-all ${
              mobileStep === 'financials' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-700 bg-white border border-slate-200'
            }`}
          >
            2. Costs & Materials
          </button>
          <button
            type="button"
            onClick={() => setMobileStep('photos')}
            className={`px-2.5 py-1 text-[11px] font-sans font-bold uppercase whitespace-nowrap rounded-lg transition-all ${
              mobileStep === 'photos' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-700 bg-white border border-slate-200'
            }`}
          >
            3. Photos ({images.length})
          </button>
          <button
            type="button"
            onClick={() => setMobileStep('parties')}
            className={`px-2.5 py-1 text-[11px] font-sans font-bold uppercase whitespace-nowrap rounded-lg transition-all ${
              mobileStep === 'parties' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-700 bg-white border border-slate-200'
            }`}
          >
            4. Sign
          </button>
        </div>

        {/* Modal Form Scroll Area */}
        <form onSubmit={handleSubmit} className="p-2.5 sm:p-5 space-y-3.5 sm:space-y-5 overflow-y-auto flex-1 pb-16 sm:pb-6 bg-slate-50">
          
          {/* SECTION 1: Scope & Trade */}
          <div className={`space-y-4 ${mobileStep !== 'scope' ? 'hidden md:block' : 'block'}`}>
            
            {/* Section Header Strip */}
            <div className="flex items-center justify-between bg-slate-100/90 border border-slate-200 px-3.5 py-2 rounded-xl">
              <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                Trade Classification & Work Scope
              </span>
              <span className="text-[11px] font-sans text-slate-500 hidden sm:inline">
                Auto-fills tailored protective clauses
              </span>
            </div>

            {/* Occupation Trade Selector Bar */}
            <div className="bg-white p-3.5 sm:p-5 border-2 border-slate-200 shadow-xs space-y-3 rounded-2xl">
              <label className="text-xs font-sans font-bold uppercase tracking-wider text-slate-900 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  Select Your Trade / Craft <span className="text-red-500 font-bold">*</span>
                </span>
                {!selectedOccupationId && (
                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-300 px-2.5 py-0.5 rounded-md">
                    Please choose a trade below
                  </span>
                )}
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <select
                    value={selectedOccupationId}
                    onChange={handleOccupationSelectChange}
                    className={`w-full px-3.5 py-2.5 bg-slate-50 border-2 text-xs font-sans font-bold focus:outline-none focus:border-blue-600 cursor-pointer rounded-xl ${
                      !selectedOccupationId 
                        ? 'border-amber-400 text-slate-500 bg-amber-50/20' 
                        : 'border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="" disabled className="text-slate-400">
                      — Select / Choose Your Trade —
                    </option>
                    {categoriesList.map((cat) => (
                      <optgroup key={cat} label={`── ${cat.toUpperCase()} ──`}>
                        {OCCUPATIONS_DATABASE.filter(o => o.category === cat).map((occ) => (
                          <option key={occ.id} value={occ.id} className="text-slate-900 py-1">
                            {occ.title}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border-2 border-slate-300 text-xs font-sans font-bold text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer rounded-xl"
                  >
                    {SUPPORTED_LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.flag} {l.nativeName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* General Contract Specifications */}
            <div className="bg-white p-3.5 sm:p-5 border-2 border-slate-200 shadow-xs space-y-4 rounded-2xl">
              <h3 className="text-sm font-sans font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-2">
                Contract Specifications & Scope
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-sans uppercase tracking-wider text-slate-700 mb-1 font-bold">
                    Contract Title / Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bespoke Tailoring & Fashion Design Agreement"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-300 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-blue-600 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-sans uppercase tracking-wider text-slate-700 mb-1 font-bold">
                    Trade Category
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-300 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-semibold rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-sans uppercase tracking-wider text-slate-700 mb-1 font-bold">
                  {i18n.scopeOfWork || 'Scope of Deliverables & Occupation Specs'} <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Detailed trade specifications, work scope, quality standards, and milestone deliverables..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-300 text-xs text-slate-900 leading-relaxed font-medium focus:bg-white focus:outline-none focus:border-blue-600 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[11px] font-sans uppercase tracking-wider text-slate-700 mb-1 font-bold">
                  {i18n.termsAndConditions || 'Terms & Legal Conditions'} <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Trade-specific rules, warranty policies, deposit rules, and inspection clauses..."
                  value={termsAndConditions}
                  onChange={(e) => setTermsAndConditions(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-300 text-xs text-slate-900 leading-relaxed font-medium focus:bg-white focus:outline-none focus:border-blue-600 rounded-xl"
                />
              </div>
            </div>

            {/* Mobile Next Button */}
            <div className="md:hidden pt-1 flex justify-end">
              <button
                type="button"
                onClick={() => setMobileStep('financials')}
                className="px-4 py-2.5 bg-blue-600 text-white text-xs font-sans font-bold uppercase tracking-wider rounded-xl shadow-sm"
              >
                Next: Costs & Materials →
              </button>
            </div>

          </div>

          {/* SECTION 2: Financials & Materials */}
          <div className={`space-y-4 ${mobileStep !== 'financials' ? 'hidden md:block' : 'block'}`}>
            
            {/* Section Header Strip */}
            <div className="flex items-center justify-between bg-slate-100/90 border border-slate-200 px-3.5 py-2 rounded-xl">
              <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">2</span>
                Pricing, Deposit & Materials Breakdown
              </span>
              <span className="text-[11px] font-sans text-slate-500 hidden sm:inline">
                Supports multi-currency manual costing
              </span>
            </div>

            {/* Financial Overview Cards */}
            <div className="bg-white p-3.5 sm:p-5 border-2 border-slate-200 shadow-xs space-y-4 rounded-2xl">
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

              {/* 3 Metric Inputs Grid */}
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

                {/* Balance Due (Calculated) */}
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
                    Payable upon successful completion & handover.
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

              {/* Sync Materials Sum Callout if materials exist */}
              {materialsSum > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                  <div className="flex items-center gap-2 text-emerald-900 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span>
                      Itemized materials sum from table below is <strong>{formatCurrency(materialsSum, currency)}</strong>.
                    </span>
                  </div>
                  <div className="flex gap-2">
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
                </div>
              )}
            </div>

            {/* Materials Breakdown Component */}
            <div className="bg-white p-3.5 sm:p-5 border-2 border-slate-200 shadow-xs space-y-3 rounded-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-slate-700" />
                  <span className="font-sans font-bold text-xs text-slate-900 uppercase tracking-wider">
                    Materials & Quantities Breakdown Table
                  </span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-sans font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={hasMaterialsTable}
                    onChange={(e) => setHasMaterialsTable(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Include Materials Table</span>
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
                />
              )}
            </div>

            {/* Mobile Next Button */}
            <div className="md:hidden pt-1 flex justify-between">
              <button
                type="button"
                onClick={() => setMobileStep('scope')}
                className="px-3.5 py-2 bg-slate-200 text-slate-800 text-xs font-sans font-bold uppercase rounded-xl"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setMobileStep('photos')}
                className="px-4 py-2.5 bg-blue-600 text-white text-xs font-sans font-bold uppercase tracking-wider rounded-xl shadow-sm"
              >
                Next: Attach Photos →
              </button>
            </div>

          </div>

          {/* SECTION 3: Up to 20 Photo Specs */}
          <div className={`space-y-4 ${mobileStep !== 'photos' ? 'hidden md:block' : 'block'}`}>
            
            {/* Section Header Strip */}
            <div className="flex items-center justify-between bg-slate-100/90 border border-slate-200 px-3.5 py-2 rounded-xl">
              <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">3</span>
                Visual Sample Attachments
              </span>
              <span className="text-[11px] font-sans text-slate-500 hidden sm:inline">
                Attach fabric swatches, sketches, or site photos
              </span>
            </div>

            <div className="bg-white p-3.5 sm:p-5 border-2 border-slate-200 shadow-xs space-y-3 rounded-2xl">
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

            {/* Mobile Next Button */}
            <div className="md:hidden pt-1 flex justify-between">
              <button
                type="button"
                onClick={() => setMobileStep('financials')}
                className="px-3.5 py-2 bg-slate-200 text-slate-800 text-xs font-sans font-bold uppercase rounded-xl"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setMobileStep('parties')}
                className="px-4 py-2.5 bg-blue-600 text-white text-xs font-sans font-bold uppercase tracking-wider rounded-xl shadow-sm"
              >
                Next: Signatures →
              </button>
            </div>
          </div>

          {/* SECTION 4: Parties & Signatures */}
          <div className={`space-y-4 ${mobileStep !== 'parties' ? 'hidden md:block' : 'block'}`}>
            
            {/* Section Header Strip */}
            <div className="flex items-center justify-between bg-slate-100/90 border border-slate-200 px-3.5 py-2 rounded-xl">
              <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] flex items-center justify-center font-bold">4</span>
                Parties & Electronic Signatures
              </span>
              <span className="text-[11px] font-sans text-slate-500 hidden sm:inline">
                Both parties execute legally binding signatures
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              
              {/* Party A (Contractor / Admin) */}
              <div className="bg-white p-3.5 sm:p-5 border-2 border-blue-200 shadow-xs space-y-3 rounded-2xl">
                <div className="flex items-center justify-between border-b border-blue-100 pb-2">
                  <h4 className="text-xs font-sans font-bold uppercase tracking-wider text-blue-950 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    Party A: Service Provider / Artisan
                  </h4>
                  <span className="text-[9px] font-bold uppercase px-2 py-0.5 bg-blue-100 text-blue-900 rounded">
                    Contractor
                  </span>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="block text-[10px] font-sans uppercase font-bold text-slate-700 mb-1">
                      Full Legal Name
                    </label>
                    <input
                      type="text"
                      placeholder="Contractor / Artisan Full Name"
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
                      placeholder="artisan@business.com"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 text-xs text-slate-900 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-sans uppercase font-bold text-slate-700 mb-1">
                      Business / Brand Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Master Tailor Studios Ltd"
                      value={adminCompany}
                      onChange={(e) => setAdminCompany(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 text-xs text-slate-900 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <label className="block text-[11px] font-sans uppercase tracking-wider text-slate-800 mb-1 font-bold">
                    Contractor Digital Signature *
                  </label>
                  <SignaturePad
                    savedSignature={adminSignature}
                    onSaveSignature={setAdminSignature}
                    defaultName={adminName}
                  />
                </div>
              </div>

              {/* Party B (Client) */}
              <div className="bg-white p-3.5 sm:p-5 border-2 border-slate-300 shadow-xs space-y-3 rounded-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="text-xs font-sans font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-700" />
                    Party B: Client / Buyer
                  </h4>
                  <span className="text-[9px] font-bold uppercase px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                    Client Portal
                  </span>
                </div>
                <p className="text-[11px] font-sans text-slate-500">
                  Fill client details here, or leave blank so client enters them on the signing link.
                </p>

                <div className="space-y-2">
                  <div>
                    <label className="block text-[10px] font-sans uppercase font-bold text-slate-700 mb-1">
                      Client Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="Client Full Name"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 text-xs text-slate-900 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-sans uppercase font-bold text-slate-700 mb-1">
                      Client Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="client@gmail.com"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 text-xs text-slate-900 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-sans uppercase font-bold text-slate-700 mb-1">
                      Client Company (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Client Organization"
                      value={clientCompany}
                      onChange={(e) => setClientCompany(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 text-xs text-slate-900 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 leading-relaxed">
                  <strong>Client E-Signature:</strong> The client will review this contract and execute their signature (either handwritten or typed legal name) directly on the secure signing link.
                </div>
              </div>

            </div>

            {/* Mobile Submit Actions */}
            <div className="md:hidden pt-2 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setMobileStep('photos')}
                className="px-3 py-2 bg-slate-200 text-slate-800 text-xs font-sans font-bold uppercase rounded-xl"
              >
                ← Back
              </button>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadDraft}
                  disabled={isGeneratingPdf}
                  className="px-3 py-2 bg-slate-100 border border-slate-300 text-slate-800 text-xs font-sans font-bold uppercase rounded-xl flex items-center gap-1 active:scale-98"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600" />
                  <span>PDF</span>
                </button>

                {isLocked ? (
                  onCancel && (
                    <button
                      type="button"
                      onClick={onCancel}
                      className="px-4 py-2 bg-slate-800 text-white text-xs font-sans font-bold uppercase tracking-wider rounded-xl cursor-pointer"
                    >
                      Close
                    </button>
                  )
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-sans font-bold uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-md active:scale-98 cursor-pointer transition-all"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    )}
                    <span>{isSubmitting ? '...' : 'Generate'}</span>
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* Desktop Bottom Action Bar */}
          <div className="hidden md:flex pt-3 border-t-2 border-slate-200 items-center justify-between">
            <div className="text-xs font-sans text-slate-500">
              Contract ready to generate instant shareable signing link or export as PDF.
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleDownloadDraft}
                disabled={isGeneratingPdf}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-sans font-bold uppercase tracking-wider rounded-xl border border-slate-200 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
              >
                <Download className="w-4 h-4 text-blue-600" />
                <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download PDF Document'}</span>
              </button>

              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 text-xs font-sans font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 cursor-pointer"
                >
                  {isLocked ? 'Close' : 'Cancel'}
                </button>
              )}
              {!isLocked && (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-sans font-bold uppercase tracking-wider shadow-md shadow-blue-600/20 transition-all cursor-pointer rounded-xl active:scale-98"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  )}
                  <span>{isSubmitting ? 'Generating...' : (isEditing || initialContract ? 'Save & Update Contract' : 'Generate & Get Signing Link →')}</span>
                </button>
              )}
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
