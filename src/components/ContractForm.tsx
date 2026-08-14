import React, { useState, useEffect } from 'react';
import { Contract, CreateContractPayload, ContractMaterialItem, ContractImage, PartyDetails } from '../types';
import { SignaturePad } from './SignaturePad';
import { MaterialsTable } from './MaterialsTable';
import { ImageUploader } from './ImageUploader';
import { OCCUPATIONS_DATABASE, OccupationDefinition } from '../data/occupations';
import { CURRENCY_LIST, formatCurrency } from '../utils/formatters';
import { SUPPORTED_LANGUAGES, getI18nText } from '../utils/i18n';
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
  Check
} from 'lucide-react';

interface ContractFormProps {
  onSave: (payload: CreateContractPayload) => void;
  onCancel: () => void;
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
  initialContract,
  isEditing,
  defaultOccupation,
  defaultBusinessProfile,
  defaultAdminParty,
  defaultCurrency = 'NGN',
  defaultLanguage = 'en',
}) => {
  const [selectedOccupationId, setSelectedOccupationId] = useState<string>(
    initialContract?.occupation || defaultOccupation?.id || 'tailor-bespoke'
  );
  const [title, setTitle] = useState(initialContract?.title || '');
  const [category, setCategory] = useState(initialContract?.category || 'Fashion & Apparel');
  const [description, setDescription] = useState(initialContract?.description || '');
  const [termsAndConditions, setTermsAndConditions] = useState(initialContract?.termsAndConditions || '');
  const [totalCost, setTotalCost] = useState<number>(initialContract?.totalCost || 500000);
  const [depositAmount, setDepositAmount] = useState<number>(initialContract?.depositAmount || 250000);
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

  const i18n = getI18nText(language);

  // Auto-fill when occupation changes or if defaultOccupation provided
  useEffect(() => {
    if (!initialContract && defaultOccupation) {
      applyOccupation(defaultOccupation);
    } else if (!initialContract && !title) {
      const defaultOcc = OCCUPATIONS_DATABASE.find(o => o.id === 'tailor-bespoke');
      if (defaultOcc) applyOccupation(defaultOcc);
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

    const newMaterials: ContractMaterialItem[] = occ.defaultMaterials.map((mat, idx) => ({
      id: `mat_init_${idx}_${Date.now()}`,
      item: mat.item,
      quantity: mat.quantity,
      quality: mat.quality,
      unitPrice: mat.unitPrice,
      totalPrice: mat.quantity * mat.unitPrice,
    }));

    setMaterialsList(newMaterials);
    setHasMaterialsTable(newMaterials.length > 0);

    const calcTotal = newMaterials.reduce((sum, item) => sum + item.totalPrice, 0);
    if (calcTotal > 0) {
      setTotalCost(calcTotal);
      setDepositAmount(Math.round(calcTotal * 0.5));
    }
  };

  const handleOccupationSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const occId = e.target.value;
    setSelectedOccupationId(occId);
    const found = OCCUPATIONS_DATABASE.find(o => o.id === occId);
    if (found) {
      applyOccupation(found);
    }
  };

  const isLocked = initialContract?.status === 'completed' || !!initialContract?.clientParty?.signedAt;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) {
      alert('This contract has already been signed or completed and cannot be modified.');
      return;
    }

    if (!title.trim() || !description.trim() || !termsAndConditions.trim()) {
      alert('Please fill in contract title, scope description, and terms & conditions.');
      return;
    }

    const payload: CreateContractPayload = {
      title,
      category,
      occupation: selectedOccupationId,
      description,
      termsAndConditions,
      totalCost,
      depositAmount,
      currency,
      language,
      deliveryDate,
      hasMaterialsTable,
      materialsList: hasMaterialsTable ? materialsList : [],
      images,
      adminParty: {
        name: adminName,
        email: adminEmail,
        company: adminCompany,
        title: adminTitle,
        phone: adminPhone,
        address: adminAddress,
        signature: adminSignature || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="250" height="60"><text x="10" y="40" font-family="cursive" font-size="22" fill="%231e3a8a">Alex Mercer (Contractor)</text></svg>',
        signedAt: new Date().toISOString(),
      },
      clientParty: {
        name: clientName,
        email: clientEmail,
        company: clientCompany,
      },
    };

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col sm:items-center sm:justify-center bg-slate-950/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-none sm:rounded-3xl border-0 sm:border border-slate-200 max-w-5xl w-full h-full sm:h-auto sm:max-h-[92vh] sm:my-4 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Locked Notification Banner if signed/completed */}
        {isLocked && (
          <div className="bg-rose-50 border-b border-rose-200 px-5 sm:px-8 py-3 text-rose-800 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-2 font-medium">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span>
                <strong>Contract Locked:</strong> This agreement has already been signed or completed and cannot be modified to preserve legal validity.
              </span>
            </div>
            <button
              onClick={onCancel}
              className="text-xs uppercase font-bold text-rose-900 hover:underline cursor-pointer"
            >
              Close View
            </button>
          </div>
        )}

        {/* Sticky Modal Header */}
        <div className="px-5 sm:px-8 py-4 sm:py-5 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-blue-400 flex items-center justify-center font-bold text-xs shadow-xs border border-slate-800">
              C
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-serif font-normal text-slate-900 truncate max-w-[200px] sm:max-w-none">
                {isLocked ? 'View Locked Contract' : isEditing || initialContract ? 'Edit Contract' : 'Create Contract'}
              </h2>
              <p className="text-[10px] font-sans uppercase tracking-wider text-slate-400 hidden sm:block">
                {isLocked ? 'Signed / Completed Legal Document' : '100+ Trade Templates • Up to 20 Photos • Multi-Currency'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!isLocked && (
              <button
                type="button"
                onClick={handleSubmit}
                className="sm:hidden px-3.5 py-1.5 bg-blue-600 text-white text-xs font-sans font-bold uppercase rounded-xl cursor-pointer"
              >
                Save
              </button>
            )}
            <button
              onClick={onCancel}
              className="p-1.5 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Step Navigation Tabs (md:hidden) */}
        <div className="md:hidden flex items-center bg-slate-50 border-b border-slate-200 px-3 py-2 gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => setMobileStep('scope')}
            className={`px-3 py-1.5 text-xs font-sans font-bold uppercase whitespace-nowrap rounded-xl transition-all ${
              mobileStep === 'scope' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 bg-white border border-slate-200'
            }`}
          >
            1. Scope & Trade
          </button>
          <button
            type="button"
            onClick={() => setMobileStep('financials')}
            className={`px-3 py-1.5 text-xs font-sans font-bold uppercase whitespace-nowrap rounded-xl transition-all ${
              mobileStep === 'financials' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 bg-white border border-slate-200'
            }`}
          >
            2. Cost & Materials
          </button>
          <button
            type="button"
            onClick={() => setMobileStep('photos')}
            className={`px-3 py-1.5 text-xs font-sans font-bold uppercase whitespace-nowrap rounded-xl transition-all ${
              mobileStep === 'photos' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 bg-white border border-slate-200'
            }`}
          >
            3. Photos ({images.length})
          </button>
          <button
            type="button"
            onClick={() => setMobileStep('parties')}
            className={`px-3 py-1.5 text-xs font-sans font-bold uppercase whitespace-nowrap rounded-xl transition-all ${
              mobileStep === 'parties' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 bg-white border border-slate-200'
            }`}
          >
            4. Signatures
          </button>
        </div>

        {/* Modal Form Scroll Area */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-8 space-y-6 sm:space-y-8 overflow-y-auto flex-1 pb-24 sm:pb-8 bg-slate-50/50">
          
          {/* SECTION 1: Scope & Trade */}
          <div className={`space-y-5 ${mobileStep !== 'scope' ? 'hidden md:block' : 'block'}`}>
            
            {/* Occupation Trade Selector Bar */}
            <div className="bg-white p-4 sm:p-6 border border-slate-200 shadow-xs space-y-3 rounded-2xl">
              <label className="text-xs font-sans font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                Select Occupation / Trade Preset ({OCCUPATIONS_DATABASE.length} Occupations)
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <select
                    value={selectedOccupationId}
                    onChange={handleOccupationSelectChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-xs font-sans font-bold text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer rounded-xl"
                  >
                    {OCCUPATIONS_DATABASE.map((occ) => (
                      <option key={occ.id} value={occ.id}>
                        {occ.title} ({occ.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 text-xs font-sans font-bold text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer rounded-xl"
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
            <div className="bg-white p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4 rounded-2xl">
              <h3 className="text-base font-serif font-normal text-slate-900 border-b border-slate-100 pb-2">
                Contract Specifications & Scope
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-sans uppercase tracking-wider text-slate-600 mb-1 font-bold">
                    Contract Title / Subject *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bespoke Tailoring & Fashion Design Agreement"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-sans uppercase tracking-wider text-slate-600 mb-1 font-bold">
                    Trade Category
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-sans uppercase tracking-wider text-slate-600 mb-1 font-bold">
                  {i18n.scopeOfWork || 'Scope of Deliverables & Occupation Specs'} *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detailed trade specifications, work scope, quality standards, and milestone deliverables..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-xs text-slate-900 leading-relaxed focus:outline-none focus:border-blue-600 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[11px] font-sans uppercase tracking-wider text-slate-600 mb-1 font-bold">
                  {i18n.termsAndConditions || 'Terms & Legal Conditions'} *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Trade-specific rules, warranty policies, deposit rules, and inspection clauses..."
                  value={termsAndConditions}
                  onChange={(e) => setTermsAndConditions(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-xs text-slate-900 leading-relaxed focus:outline-none focus:border-blue-600 rounded-xl"
                />
              </div>
            </div>

            {/* Mobile Next Button */}
            <div className="md:hidden pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setMobileStep('financials')}
                className="px-4 py-2.5 bg-blue-600 text-white text-xs font-sans font-bold uppercase tracking-wider rounded-xl"
              >
                Next: Costs & Materials →
              </button>
            </div>

          </div>

          {/* SECTION 2: Financials & Materials */}
          <div className={`space-y-5 ${mobileStep !== 'financials' ? 'hidden md:block' : 'block'}`}>
            
            <div className="bg-white p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4 rounded-2xl">
              <h3 className="text-base font-serif font-normal text-slate-900 border-b border-slate-100 pb-2">
                Financial Commitments, Multi-Currency & Delivery
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <div>
                  <label className="block text-[11px] font-sans uppercase tracking-wider text-slate-600 mb-1 font-bold">
                    Total Contract Fee *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={totalCost}
                    onChange={(e) => setTotalCost(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-mono font-bold text-sm rounded-xl"
                  />
                  <p className="text-[10px] font-sans text-emerald-700 font-mono mt-1">
                    {formatCurrency(totalCost, currency)}
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-sans uppercase tracking-wider text-slate-600 mb-1 font-bold">
                    Initial Deposit *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-mono font-bold text-sm rounded-xl"
                  />
                  <p className="text-[10px] font-sans text-blue-700 font-mono mt-1">
                    {formatCurrency(depositAmount, currency)}
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-sans uppercase tracking-wider text-slate-600 mb-1 font-bold">
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-mono font-bold rounded-xl"
                  >
                    {CURRENCY_LIST.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code} ({c.symbol}) - {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-sans uppercase tracking-wider text-slate-600 mb-1 font-bold">
                    Target Delivery Date
                  </label>
                  <input
                    type="date"
                    required
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600 rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Materials Breakdown Component */}
            <div className="bg-white p-4 sm:p-6 border border-slate-200 shadow-xs space-y-3 rounded-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-slate-600" />
                  <span className="font-sans font-bold text-xs text-slate-900 uppercase tracking-wider">
                    Materials & Quantities Breakdown Table
                  </span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-sans font-bold">
                  <input
                    type="checkbox"
                    checked={hasMaterialsTable}
                    onChange={(e) => setHasMaterialsTable(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Include Table</span>
                </label>
              </div>

              {hasMaterialsTable && (
                <MaterialsTable
                  materials={materialsList}
                  currency={currency}
                  onChange={(newList) => {
                    setMaterialsList(newList);
                    const calcSum = newList.reduce((acc, it) => acc + it.totalPrice, 0);
                    if (calcSum > 0) {
                      setTotalCost(calcSum);
                      setDepositAmount(Math.round(calcSum * 0.5));
                    }
                  }}
                />
              )}
            </div>

            {/* Mobile Next Button */}
            <div className="md:hidden pt-2 flex justify-between">
              <button
                type="button"
                onClick={() => setMobileStep('scope')}
                className="px-3.5 py-2 bg-slate-100 text-slate-800 text-xs font-sans font-bold uppercase rounded-xl"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setMobileStep('photos')}
                className="px-4 py-2.5 bg-blue-600 text-white text-xs font-sans font-bold uppercase tracking-wider rounded-xl"
              >
                Next: Attach Photos →
              </button>
            </div>

          </div>

          {/* SECTION 3: Up to 20 Photo Specs */}
          <div className={`space-y-5 ${mobileStep !== 'photos' ? 'hidden md:block' : 'block'}`}>
            <div className="bg-white p-4 sm:p-6 border border-slate-200 shadow-xs space-y-3 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-serif font-normal text-slate-900 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                    Attach Work Specifications & Samples
                  </h3>
                  <p className="text-xs font-sans text-slate-500 mt-0.5">
                    Upload up to 20 images to provide visual clarity.
                  </p>
                </div>
                <span className="px-3 py-1 bg-blue-50 text-blue-900 text-xs font-mono font-bold rounded-full border border-blue-200">
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
            <div className="md:hidden pt-2 flex justify-between">
              <button
                type="button"
                onClick={() => setMobileStep('financials')}
                className="px-3.5 py-2 bg-slate-100 text-slate-800 text-xs font-sans font-bold uppercase rounded-xl"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setMobileStep('parties')}
                className="px-4 py-2.5 bg-blue-600 text-white text-xs font-sans font-bold uppercase tracking-wider rounded-xl"
              >
                Next: Signatures →
              </button>
            </div>
          </div>

          {/* SECTION 4: Parties & Signatures */}
          <div className={`space-y-5 ${mobileStep !== 'parties' ? 'hidden md:block' : 'block'}`}>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              
              {/* Party A (Contractor / Admin) */}
              <div className="bg-white p-4 sm:p-6 border border-slate-200 shadow-xs space-y-3 rounded-2xl">
                <h4 className="text-xs font-sans font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  Party A: Contractor / Service Provider
                </h4>

                <div className="space-y-2.5">
                  <input
                    type="text"
                    required
                    placeholder="Contractor Full Name"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl focus:border-blue-600 focus:outline-none"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Contractor Email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl focus:border-blue-600 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Business / Trade Entity Name"
                    value={adminCompany}
                    onChange={(e) => setAdminCompany(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <label className="block text-[11px] font-sans uppercase tracking-wider text-slate-600 mb-1 font-bold">
                    Contractor Electronic Signature
                  </label>
                  <SignaturePad
                    initialSignature={adminSignature}
                    onSaveSignature={setAdminSignature}
                    label="Contractor Digital Signature"
                  />
                </div>
              </div>

              {/* Party B (Client) */}
              <div className="bg-white p-4 sm:p-6 border border-slate-200 shadow-xs space-y-3 rounded-2xl">
                <h4 className="text-xs font-sans font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-blue-600" />
                  Party B: Client / Buyer (Optional Pre-fill)
                </h4>
                <p className="text-[11px] font-sans italic text-slate-500">
                  Leave empty if client will enter details on signing link.
                </p>

                <div className="space-y-2.5">
                  <input
                    type="text"
                    placeholder="Client Full Name"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl focus:border-blue-600 focus:outline-none"
                  />
                  <input
                    type="email"
                    placeholder="Client Email Address"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl focus:border-blue-600 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Client Organization / Company"
                    value={clientCompany}
                    onChange={(e) => setClientCompany(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

            </div>

            {/* Mobile Submit Actions */}
            <div className="md:hidden pt-2 flex justify-between">
              <button
                type="button"
                onClick={() => setMobileStep('photos')}
                className="px-3.5 py-2 bg-slate-100 text-slate-800 text-xs font-sans font-bold uppercase rounded-xl"
              >
                ← Back
              </button>
              {isLocked ? (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-5 py-2.5 bg-slate-800 text-white text-xs font-sans font-bold uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  Close View
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 text-white text-xs font-sans font-bold uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-md active:scale-98 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  Finish & Save
                </button>
              )}
            </div>

          </div>

          {/* Desktop Bottom Action Bar */}
          <div className="hidden md:flex pt-4 border-t border-slate-200 items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-sans font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              {isLocked ? 'Close' : 'Cancel'}
            </button>
            {!isLocked && (
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-sans font-bold uppercase tracking-wider shadow-md shadow-blue-600/25 transition-all cursor-pointer rounded-2xl active:scale-98"
              >
                <CheckCircle2 className="w-4 h-4 text-white" />
                {isEditing || initialContract ? 'Save & Update Contract' : 'Save & Create Client Link'}
              </button>
            )}
          </div>

        </form>
      </div>
    </div>
  );
};
