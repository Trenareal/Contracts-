import React, { useState, useEffect } from 'react';
import { OCCUPATIONS_DATABASE, OccupationDefinition } from '../data/occupations';
import { 
  Briefcase, 
  Search, 
  Sparkles, 
  Check, 
  X, 
  ChevronRight,
  ArrowLeft,
  Building,
  User,
  MapPin,
  Phone,
  ShieldCheck,
  FileText
} from 'lucide-react';

export interface UserBusinessProfile {
  businessName: string;
  professionalTitle?: string;
  phone?: string;
  address?: string;
}

interface OccupationSelectModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onSelectOccupation: (occupation: OccupationDefinition, businessProfile?: UserBusinessProfile) => void;
  currentUser?: { displayName?: string | null; email?: string | null } | null;
  initialOccupation?: OccupationDefinition | null;
  initialBusinessProfile?: UserBusinessProfile | null;
  isMandatory?: boolean;
}

export const OccupationSelectModal: React.FC<OccupationSelectModalProps> = ({
  isOpen,
  onClose,
  onSelectOccupation,
  currentUser,
  initialOccupation,
  initialBusinessProfile,
  isMandatory = false,
}) => {
  const [step, setStep] = useState<'trade' | 'business'>('trade');
  const [selectedOcc, setSelectedOcc] = useState<OccupationDefinition | null>(initialOccupation || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Business Name Form State
  const [businessName, setBusinessName] = useState(initialBusinessProfile?.businessName || '');
  const [professionalTitle, setProfessionalTitle] = useState(initialBusinessProfile?.professionalTitle || '');
  const [businessAddress, setBusinessAddress] = useState(initialBusinessProfile?.address || '');
  const [businessPhone, setBusinessPhone] = useState(initialBusinessProfile?.phone || '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialOccupation) {
      setSelectedOcc(initialOccupation);
    }
    if (initialBusinessProfile) {
      setBusinessName(initialBusinessProfile.businessName || '');
      setProfessionalTitle(initialBusinessProfile.professionalTitle || '');
      setBusinessAddress(initialBusinessProfile.address || '');
      setBusinessPhone(initialBusinessProfile.phone || '');
    }
  }, [initialOccupation, initialBusinessProfile, isOpen]);

  if (!isOpen) return null;

  const categories = ['All', ...Array.from(new Set(OCCUPATIONS_DATABASE.map(o => o.category)))];

  const filteredOccupations = OCCUPATIONS_DATABASE.filter(occ => {
    const matchesCategory = selectedCategory === 'All' || occ.category === selectedCategory;
    const matchesSearch = 
      occ.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      occ.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      occ.defaultScope.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handlePickTrade = (occ: OccupationDefinition) => {
    setSelectedOcc(occ);
    // If businessName is empty, give an intelligent suggestion based on user name + trade title
    if (!businessName.trim()) {
      const namePart = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Apex';
      const cleanName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      const shortTrade = occ.title.replace('Master ', '').replace('Bespoke ', '');
      setBusinessName(`${cleanName} ${shortTrade} & Services`);
    }
    if (!professionalTitle.trim()) {
      setProfessionalTitle(`Lead ${occ.title} / Director`);
    }
    setError(null);
    setStep('business');
  };

  const handleCompleteSetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOcc) {
      setStep('trade');
      return;
    }
    if (!businessName.trim()) {
      setError('Please enter your business or company name to continue.');
      return;
    }

    const businessProfile: UserBusinessProfile = {
      businessName: businessName.trim(),
      professionalTitle: professionalTitle.trim() || `Lead ${selectedOcc.title}`,
      address: businessAddress.trim(),
      phone: businessPhone.trim(),
    };

    onSelectOccupation(selectedOcc, businessProfile);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-xs p-0 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white border-t sm:border border-slate-200 shadow-2xl max-w-4xl w-full h-[96vh] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden relative rounded-t-3xl sm:rounded-3xl">
        
        {/* Header with Step Progress */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white p-4 sm:p-6 pb-5 relative border-b border-slate-800 shrink-0">
          {!isMandatory && onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 sm:top-5 right-4 sm:right-5 text-slate-400 hover:text-white transition-colors cursor-pointer p-2 rounded-full hover:bg-white/10"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Top row: Badge & Step Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3 pr-10 sm:pr-12">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-mono border border-blue-400/30 bg-blue-500/20 text-blue-300 font-bold uppercase tracking-wider rounded-full w-fit">
              <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              Onboarding Setup • Step {step === 'trade' ? '1' : '2'} of 2
            </span>

            {/* Stepper Tabs */}
            <div className="flex items-center gap-1.5 text-xs font-sans font-bold bg-slate-800/80 p-1 rounded-xl w-fit border border-slate-700/60">
              <button
                type="button"
                onClick={() => setStep('trade')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  step === 'trade' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                1. Industry Trade
              </button>
              <span className="text-slate-600">/</span>
              <button
                type="button"
                disabled={!selectedOcc}
                onClick={() => selectedOcc && setStep('business')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  step === 'business' 
                    ? 'bg-blue-600 text-white shadow-xs cursor-pointer' 
                    : selectedOcc ? 'text-slate-400 hover:text-white cursor-pointer' : 'text-slate-600 cursor-not-allowed opacity-50'
                }`}
              >
                2. Business Profile
              </button>
            </div>
          </div>

          <h2 className="text-lg sm:text-2xl font-serif font-bold text-white tracking-tight">
            {step === 'trade' ? 'Choose Your Industry & Trade' : 'Enter Your Business & Company Name'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-sans mt-1 max-w-2xl leading-relaxed">
            {step === 'trade' ? (
              <>Welcome, <span className="text-blue-300 font-bold">{currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Artisan'}</span>! Select your trade to auto-configure contract scopes, legal clauses, and specs tables.</>
            ) : (
              <>Your business name and brand title will be automatically placed as the contractor/provider on all issued legal trade agreements.</>
            )}
          </p>
        </div>

        {/* STEP 1: SELECT TRADE */}
        {step === 'trade' && (
          <>
            {/* Search & Category Filter Bar */}
            <div className="bg-slate-50 p-3.5 sm:p-4 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Search 100+ trades (e.g., Bespoke Tailor, Solar Engineer, Welder, Developer)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 sm:py-2 bg-white border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 font-sans rounded-xl shadow-2xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 p-0.5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="w-full sm:w-auto">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-white border border-slate-200 text-xs sm:text-sm font-sans font-bold text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer rounded-xl shadow-2xs"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat} {cat === 'All' ? `(${OCCUPATIONS_DATABASE.length})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Occupation Grid List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 bg-slate-50/60">
              {filteredOccupations.length === 0 ? (
                <div className="col-span-full py-12 text-center bg-white border border-slate-200 p-8 rounded-2xl">
                  <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs sm:text-sm text-slate-500">No trades match your search.</p>
                </div>
              ) : (
                filteredOccupations.map(occ => {
                  const isCurrent = selectedOcc?.id === occ.id;
                  return (
                    <div
                      key={occ.id}
                      onClick={() => handlePickTrade(occ)}
                      className={`bg-white border p-4.5 sm:p-5 transition-all cursor-pointer shadow-2xs hover:shadow-md group flex flex-col justify-between rounded-2xl ${
                        isCurrent
                          ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/20'
                          : 'border-slate-200 hover:border-blue-500'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 text-[10px] sm:text-[11px] font-sans font-bold uppercase tracking-wider bg-slate-100 text-slate-700 rounded-full border border-slate-200">
                            {occ.category}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {occ.defaultMaterials.length} default specs
                          </span>
                        </div>

                        <h3 className="font-serif font-bold text-base sm:text-lg text-slate-900 group-hover:text-blue-600 transition-colors">
                          {occ.title}
                        </h3>

                        <p className="text-xs sm:text-sm font-sans text-slate-600 line-clamp-2 leading-relaxed">
                          {occ.defaultScope}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm font-sans font-bold text-blue-600">
                        <span>Select & Enter Business Name</span>
                        <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-colors shadow-2xs">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* STEP 2: INPUT BUSINESS NAME & BRAND PROFILE */}
        {step === 'business' && selectedOcc && (
          <form onSubmit={handleCompleteSetup} className="flex-1 overflow-y-auto p-4 sm:p-7 space-y-5 sm:space-y-6 bg-slate-50/60">
            {/* Selected Trade Summary Badge */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3.5">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-200 shrink-0">
                  <Briefcase className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] sm:text-[11px] font-sans font-bold uppercase tracking-wider text-slate-400">
                      Selected Industry
                    </span>
                    <span className="px-2.5 py-0.5 text-[10px] sm:text-[11px] font-sans font-bold bg-blue-100 text-blue-800 rounded-full">
                      {selectedOcc.category}
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-slate-900 mt-0.5">
                    {selectedOcc.title}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep('trade')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:border-slate-400 text-xs sm:text-sm font-sans font-bold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer self-stretch sm:self-auto justify-center"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Change Industry</span>
              </button>
            </div>

            {/* Business Details Form */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 sm:space-y-5">
              <h4 className="text-sm sm:text-base font-serif font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Building className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                <span>Enterprise & Business Identification</span>
              </h4>

              {error && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs sm:text-sm font-sans text-rose-800 font-bold">
                  {error}
                </div>
              )}

              {/* Primary: Business Name Input */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                  <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-700">
                    Business / Company Name <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] font-sans text-slate-400">Required for official contract headers</span>
                </div>
                <div className="relative">
                  <Building className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3.5 top-3.5 sm:top-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => {
                      setBusinessName(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="e.g. Apex Tailoring & Haute Couture Ltd"
                    className="w-full pl-11 pr-4 py-3 sm:py-3.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-600 rounded-xl text-sm sm:text-base font-sans font-medium text-slate-900 focus:outline-none transition-all shadow-2xs"
                  />
                </div>
              </div>

              {/* Quick Suggestions for Business Name */}
              <div className="space-y-2 pt-1">
                <span className="text-[10px] sm:text-[11px] font-sans text-slate-500 uppercase font-bold block">
                  Quick Name Suggestions:
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    `${currentUser?.displayName || 'Premier'} ${selectedOcc.title.replace('Master ', '').replace('Bespoke ', '')} Studio`,
                    `${currentUser?.displayName || 'Apex'} Crafts & Engineering`,
                    `${currentUser?.displayName || 'Royal'} Enterprise Solutions`,
                  ].map((sug, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setBusinessName(sug)}
                      className="text-xs font-sans px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-900 text-slate-700 rounded-xl border border-slate-200 transition-all cursor-pointer active:scale-98"
                    >
                      + {sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* Secondary Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Your Professional Role / Title
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={professionalTitle}
                      onChange={(e) => setProfessionalTitle(e.target.value)}
                      placeholder={`e.g. Lead ${selectedOcc.title} / Director`}
                      className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-600 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none transition-all shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Business Phone / WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="tel"
                      value={businessPhone}
                      onChange={(e) => setBusinessPhone(e.target.value)}
                      placeholder="e.g. +234 801 234 5678"
                      className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-600 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none transition-all shadow-2xs"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Business Address / Workshop Location (Optional)
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={businessAddress}
                      onChange={(e) => setBusinessAddress(e.target.value)}
                      placeholder="e.g. 14 Commercial Ave, Ikeja, Lagos"
                      className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-600 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none transition-all shadow-2xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Live Contract Party Header Preview */}
            <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-md">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2.5">
                <span className="flex items-center gap-1.5 text-blue-300 font-bold uppercase text-[11px] sm:text-xs">
                  <FileText className="w-4 h-4" />
                  Contract Header Preview
                </span>
                <span className="text-[10px] sm:text-[11px] bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-400/30">
                  Party 1 (Contractor)
                </span>
              </div>
              <div className="p-3.5 sm:p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                <p className="font-serif font-bold text-base sm:text-lg text-white">
                  {businessName.trim() || 'Your Business Name Here'}
                </p>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-300 flex-wrap">
                  <span className="text-blue-400 font-bold">{currentUser?.displayName || 'Your Full Name'}</span>
                  <span>•</span>
                  <span>{professionalTitle.trim() || `Lead ${selectedOcc.title}`}</span>
                  {businessAddress.trim() && (
                    <>
                      <span>•</span>
                      <span className="text-slate-400">{businessAddress}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="bg-white p-4 sm:p-5 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          {step === 'trade' ? (
            <>
              <span className="text-slate-500 text-xs sm:text-sm text-center sm:text-left">
                Showing {filteredOccupations.length} of {OCCUPATIONS_DATABASE.length} trades
              </span>
              {!isMandatory && onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900 rounded-xl cursor-pointer text-center"
                >
                  Skip For Now
                </button>
              )}
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setStep('trade')}
                className="flex items-center justify-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Industry Selection</span>
              </button>

              <button
                type="button"
                onClick={handleCompleteSetup}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-sans font-bold uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-blue-600/25 rounded-xl active:scale-98"
              >
                <Check className="w-4 h-4" />
                <span>Save Business Profile & Continue</span>
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
