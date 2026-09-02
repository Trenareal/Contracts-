import React, { useState, useRef } from 'react';
import { Contract, SignContractPayload } from '../types';
import { SignaturePad } from './SignaturePad';
import { MaterialsTable } from './MaterialsTable';
import { ImageUploader } from './ImageUploader';
import { generateContractPDF } from '../utils/pdfGenerator';
import { formatCurrency } from '../utils/formatters';
import { getI18nText } from '../utils/i18n';
import { signContractInFirebase } from '../lib/firebaseService';
import confetti from 'canvas-confetti';
import { 
  ShieldCheck, FileText, DollarSign, Calendar, Lock, Download, 
  CheckCircle2, AlertCircle, Building2, UserCheck, ArrowRight,
  Clock, FileCheck, Image as ImageIcon, Check
} from 'lucide-react';

interface ClientSigningPortalProps {
  contract: Contract;
  onSigned: (updatedContract: Contract) => void;
  onBackToAdmin?: () => void;
}

export const ClientSigningPortal: React.FC<ClientSigningPortalProps> = ({ 
  contract, 
  onSigned,
  onBackToAdmin
}) => {
  const documentRef = useRef<HTMLDivElement | null>(null);
  const i18n = getI18nText(contract.language || 'en');

  // Client Form State
  const [clientName, setClientName] = useState(contract.clientParty?.name || '');
  const [clientEmail, setClientEmail] = useState(contract.clientParty?.email || '');
  const [clientCompany, setClientCompany] = useState(contract.clientParty?.company || '');
  const [clientTitle, setClientTitle] = useState(contract.clientParty?.title || '');
  const [clientPhone, setClientPhone] = useState(contract.clientParty?.phone || '');
  const [clientAddress, setClientAddress] = useState(contract.clientParty?.address || '');
  const [signatureDataUrl, setSignatureDataUrl] = useState(contract.clientParty?.signature || '');

  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(contract.status === 'completed' || contract.linkInvalidated);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Submit Signature & Execute Contract
  const handleSignContract = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientName.trim() || !clientEmail.trim()) {
      alert('Please provide your full legal name and email address.');
      return;
    }

    if (!signatureDataUrl) {
      alert('Please draw or type your electronic signature.');
      return;
    }

    if (!agreed) {
      alert('You must check the agreement confirmation box before signing.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: SignContractPayload = {
        clientName,
        clientEmail,
        clientCompany,
        clientTitle,
        clientPhone,
        clientAddress,
        signatureDataUrl,
      };

      const updatedContract = await signContractInFirebase(contract.signingToken, payload);

      // Celebrate
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });

      setIsCompleted(true);
      onSigned(updatedContract);

      // Trigger automatic PDF download for client immediately!
      setIsGeneratingPdf(true);
      setTimeout(async () => {
        await generateContractPDF(updatedContract, documentRef.current);
        setIsGeneratingPdf(false);
      }, 500);

    } catch (err: any) {
      alert(err.message || 'An error occurred while signing the contract.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPdf(true);
    await generateContractPDF(contract, documentRef.current);
    setIsGeneratingPdf(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-2 sm:py-4 px-2 sm:px-4 pb-16 md:pb-10">
      
      {/* Top Floating Security Header */}
      <div className="max-w-4xl mx-auto mb-3 sm:mb-4 flex flex-wrap items-center justify-between gap-3 bg-white border-2 border-slate-200 p-3 sm:p-4 shadow-xs rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-slate-900 text-blue-400 flex items-center justify-center font-bold text-sm border border-slate-800">
            C
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-sans font-bold tracking-[0.15em] uppercase text-slate-800">
                {i18n.contractPortalTitle || 'Client Signing Portal'}
              </span>
              <span className="px-2 py-0.5 text-[9px] font-mono border border-slate-300 bg-slate-100 rounded-md text-slate-700 font-bold">
                Ref: {contract.id}
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] font-sans text-slate-500 mt-0.5">
              Electronic Signature Suite • PDF Archive
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            className="flex items-center gap-1.5 text-[10px] font-sans font-bold uppercase tracking-wider text-slate-700 hover:text-slate-900 border border-slate-300 bg-white hover:bg-slate-50 px-3 py-1.5 cursor-pointer transition-all rounded-xl active:scale-95 disabled:opacity-50"
            title="Download PDF Document"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>{isGeneratingPdf ? 'Generating...' : 'Download PDF'}</span>
          </button>

          {onBackToAdmin && (
            <button
              onClick={onBackToAdmin}
              className="text-[10px] font-sans font-bold uppercase tracking-widest text-slate-700 hover:text-slate-900 border border-slate-300 bg-white hover:bg-slate-50 px-3 py-1.5 cursor-pointer transition-all rounded-xl active:scale-95"
            >
              ← Admin View
            </button>
          )}
        </div>
      </div>

      {/* Main Contract Container */}
      <div className="max-w-4xl mx-auto bg-white text-slate-900 border-2 border-slate-200 shadow-sm overflow-hidden rounded-2xl">
        
        {/* Banner if already completed or invalidated */}
        {isCompleted && (
          <div className="bg-slate-900 text-white p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 shrink-0 text-emerald-400" />
              <div>
                <h3 className="text-sm sm:text-base font-serif font-normal">Contract Fully Executed & Archived</h3>
                <p className="text-[11px] sm:text-xs font-sans text-slate-300 mt-0.5">
                  Electronically signed and converted to an official record.
                </p>
              </div>
            </div>
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap shadow-md shadow-blue-600/25 rounded-xl active:scale-95"
            >
              <Download className="w-4 h-4" />
              {isGeneratingPdf ? 'Generating PDF...' : i18n.downloadPdf || 'Download PDF'}
            </button>
          </div>
        )}

        {/* Printable Document Body */}
        <div ref={documentRef} className="p-4 sm:p-10 space-y-6 sm:space-y-8 bg-white">
          
          {/* Header & Title */}
          <div className="border-b border-slate-100 pb-4 sm:pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1.5">
              <span className="text-[9px] sm:text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-slate-400">
                Official Electronic Document
              </span>
              <h1 className="text-xl sm:text-3xl font-serif font-normal text-slate-900 leading-tight">
                {contract.title}
              </h1>
              <p className="text-[11px] font-sans text-slate-500">Category: {contract.category}</p>
            </div>
            
            <div className="bg-slate-50 p-3 sm:p-4 border border-slate-200 text-left sm:text-right min-w-[180px] rounded-2xl">
              <span className="text-[9px] font-sans font-bold uppercase tracking-[0.15em] text-slate-400 block">Document Status</span>
              <span className={`inline-block mt-1 px-2.5 py-0.5 text-[9px] sm:text-[10px] font-sans font-bold uppercase tracking-wider rounded-full ${
                contract.status === 'completed'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-blue-50 text-blue-800 border border-blue-200'
              }`}>
                {contract.status === 'completed' ? 'Executed & Archived' : 'Pending Client Signature'}
              </span>
            </div>
          </div>

          {/* Key Financial Terms & Delivery Date Box */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 bg-slate-50 p-3.5 sm:p-5 border border-slate-200 rounded-2xl">
            <div className="p-3 sm:p-4 bg-white border border-slate-200 rounded-xl">
              <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-sans font-bold uppercase tracking-wider text-slate-500 mb-1">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                {i18n.totalCost || 'Total Contract Fee'}
              </div>
              <p className="text-xl sm:text-2xl font-serif font-normal text-slate-900">
                {formatCurrency(contract.totalCost, contract.currency)}
              </p>
            </div>

            <div className="p-3 sm:p-4 bg-white border border-blue-200 rounded-xl">
              <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-sans font-bold uppercase tracking-wider text-blue-700 mb-1">
                <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                {i18n.depositAmount || 'Upfront Deposit'}
              </div>
              <p className="text-xl sm:text-2xl font-serif font-normal text-blue-900">
                {formatCurrency(contract.depositAmount, contract.currency)}
              </p>
              <span className="text-[9px] font-sans text-slate-400 block mt-0.5">Due before work commences</span>
            </div>

            <div className="p-3 sm:p-4 bg-white border border-slate-200 rounded-xl">
              <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-sans font-bold uppercase tracking-wider text-slate-500 mb-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {i18n.deliveryDate || 'Target Delivery Date'}
              </div>
              <p className="text-base sm:text-lg font-serif font-normal text-slate-900">
                {contract.deliveryDate ? new Date(contract.deliveryDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Milestone Based'}
              </p>
            </div>
          </div>

          {/* Scope of Work */}
          <div className="space-y-2">
            <h3 className="text-[11px] font-sans font-bold uppercase tracking-[0.15em] text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              {i18n.scopeOfWork || 'Scope of Work & Deliverables'}
            </h3>
            <div className="bg-slate-50 p-4 sm:p-5 border border-slate-200 text-xs font-sans text-slate-800 whitespace-pre-wrap leading-relaxed rounded-2xl">
              {contract.description}
            </div>
          </div>

          {/* Itemized Materials Table if Present */}
          {contract.hasMaterialsTable && contract.materialsList && contract.materialsList.length > 0 && (
            <div className="space-y-2">
              <MaterialsTable
                materials={contract.materialsList}
                currency={contract.currency}
                onChange={() => {}}
                readOnly={true}
                i18nLabels={i18n}
              />
            </div>
          )}

          {/* Attached Photos Gallery if Present */}
          {contract.images && contract.images.length > 0 && (
            <div className="space-y-2">
              <ImageUploader
                images={contract.images}
                onChange={() => {}}
                readOnly={true}
              />
            </div>
          )}

          {/* Terms and Conditions */}
          <div className="space-y-2">
            <h3 className="text-[11px] font-sans font-bold uppercase tracking-[0.15em] text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-1.5">
              <Lock className="w-3.5 h-3.5 text-blue-600" />
              {i18n.termsAndConditions || 'Terms & Conditions'}
            </h3>
            <div className="bg-slate-50 p-4 sm:p-5 border border-slate-200 text-xs font-sans text-slate-700 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto rounded-2xl">
              {contract.termsAndConditions}
            </div>
          </div>

          {/* Party A Details & Pre-signature */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-4 border-t border-slate-100">
            <div className="bg-slate-50 p-4 sm:p-5 border border-slate-200 space-y-2 rounded-2xl">
              <span className="text-[9px] font-sans font-bold uppercase tracking-[0.15em] text-slate-500">
                Party A: Provider / Admin
              </span>
              <p className="text-xs sm:text-sm font-serif font-bold text-slate-900">{contract.adminParty.name}</p>
              <p className="text-[11px] font-sans text-slate-500">{contract.adminParty.company} — {contract.adminParty.title}</p>
              <p className="text-[11px] font-sans text-slate-500">{contract.adminParty.email}</p>
              
              <div className="pt-2 border-t border-slate-200">
                <span className="text-[9px] font-sans text-slate-400 block mb-1">Provider Digital Signature:</span>
                {contract.adminParty.signature ? (
                  <img 
                    src={contract.adminParty.signature} 
                    alt="Admin Signature" 
                    className="h-10 object-contain bg-white p-1 border border-slate-200 rounded-xl"
                  />
                ) : (
                  <span className="text-xs font-serif italic text-slate-400">Signature Bound</span>
                )}
              </div>
            </div>

            {/* Client Signature Display if already signed */}
            {isCompleted && (
              <div className="bg-emerald-50/60 p-4 sm:p-5 border border-emerald-200 space-y-2 rounded-2xl">
                <span className="text-[9px] font-sans font-bold uppercase tracking-[0.15em] text-emerald-800">
                  Party B: Executed Client Signature
                </span>
                <p className="text-xs sm:text-sm font-serif font-bold text-slate-900">{contract.clientParty.name}</p>
                <p className="text-[11px] font-sans text-slate-600">{contract.clientParty.company} {contract.clientParty.title ? `(${contract.clientParty.title})` : ''}</p>
                <p className="text-[11px] font-sans text-slate-600">{contract.clientParty.email}</p>
                
                <div className="pt-2 border-t border-emerald-200">
                  <span className="text-[9px] font-sans text-slate-500 block mb-1">Client Digital Signature:</span>
                  {contract.clientParty.signature && (
                    <img 
                      src={contract.clientParty.signature} 
                      alt="Client Signature" 
                      className="h-10 object-contain bg-white p-1 border border-emerald-200 rounded-xl"
                    />
                  )}
                  <p className="text-[9px] font-mono text-slate-400 mt-1.5">
                    Signed: {contract.clientParty.signedAt ? new Date(contract.clientParty.signedAt).toLocaleString() : 'Executed'}
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Interactive Signing Form Section (Only if NOT completed / active link) */}
        {!isCompleted && (
          <form onSubmit={handleSignContract} className="p-4 sm:p-10 bg-slate-50 border-t border-slate-200 space-y-5 sm:space-y-6">
            
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-base sm:text-lg font-serif font-normal text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-600" />
                Party B: Client Credentials & Signature Submission
              </h2>
              <p className="text-[11px] font-sans text-slate-500 mt-0.5">
                Complete credentials and apply your digital signature below to finalize.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-[10px] sm:text-[11px] font-sans uppercase tracking-wider text-slate-700 mb-1 font-bold">
                  {i18n.fullName || 'Full Legal Name'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jane Doe"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[10px] sm:text-[11px] font-sans uppercase tracking-wider text-slate-700 mb-1 font-bold">
                  {i18n.emailAddress || 'Email Address'} *
                </label>
                <input
                  type="email"
                  required
                  placeholder="jane.doe@company.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[10px] sm:text-[11px] font-sans uppercase tracking-wider text-slate-700 mb-1 font-bold">
                  Company / Organization
                </label>
                <input
                  type="text"
                  placeholder="Acme Corp"
                  value={clientCompany}
                  onChange={(e) => setClientCompany(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[10px] sm:text-[11px] font-sans uppercase tracking-wider text-slate-700 mb-1 font-bold">
                  Job Title
                </label>
                <input
                  type="text"
                  placeholder="Director of Operations"
                  value={clientTitle}
                  onChange={(e) => setClientTitle(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600 rounded-xl"
                />
              </div>
            </div>

            {/* Signature Pad */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[10px] sm:text-[11px] font-sans uppercase tracking-wider text-slate-700 font-bold">
                  {i18n.digitalSignature || 'Digital Signature Capture'} *
                </label>
                <span className="text-[10px] text-blue-600 font-medium">
                  Choose Draw or Type Name below
                </span>
              </div>
              <SignaturePad
                onSaveSignature={(sig) => setSignatureDataUrl(sig)}
                savedSignature={signatureDataUrl}
                defaultName={clientName}
              />
            </div>

            {/* Agreement Terms Box */}
            <div className="bg-white border border-slate-200 p-3.5 sm:p-4 flex items-start gap-2.5 rounded-2xl">
              <input
                id="legal-agree"
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-blue-600 border-slate-300 focus:ring-0 cursor-pointer shrink-0 rounded"
              />
              <label htmlFor="legal-agree" className="text-[11px] font-sans text-slate-600 cursor-pointer leading-relaxed">
                I confirm that I am authorized to bind Party B to this agreement. I agree that my electronic signature above is legally binding and certifies acceptance of the scope, payment terms ({formatCurrency(contract.totalCost, contract.currency)}), deposit requirement ({formatCurrency(contract.depositAmount, contract.currency)}), and delivery schedule.
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-[10px] font-sans text-slate-400 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                On submission, contract is executed, link invalidates, and non-editable PDF is delivered.
              </p>

              <button
                type="submit"
                disabled={isSubmitting || !agreed}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 text-xs font-sans font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer rounded-2xl active:scale-98 ${
                  agreed && !isSubmitting
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/25'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? 'Executing Contract...' : i18n.signAndExecute || 'Sign & Finalize Contract'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
