import React, { useState } from 'react';
import { Contract, SignContractPayload } from '../types';
import { SignaturePad } from './SignaturePad';
import { formatCurrency } from '../utils/formatters';
import { signContractInFirebase } from '../lib/firebaseService';
import { generateContractPDF } from '../utils/pdfGenerator';
import confetti from 'canvas-confetti';
import { 
  UserCheck, X, CheckCircle2, ShieldCheck, DollarSign, 
  Calendar, Lock, Download, Sparkles, ArrowRight, Loader2,
  Building, User, Mail, Phone, MapPin
} from 'lucide-react';

interface InPersonSigningModalProps {
  contract: Contract;
  onSuccess: (updatedContract: Contract) => void;
  onClose: () => void;
}

export const InPersonSigningModal: React.FC<InPersonSigningModalProps> = ({
  contract,
  onSuccess,
  onClose,
}) => {
  const [clientName, setClientName] = useState(contract.clientParty?.name || '');
  const [clientEmail, setClientEmail] = useState(contract.clientParty?.email || '');
  const [clientCompany, setClientCompany] = useState(contract.clientParty?.company || '');
  const [clientTitle, setClientTitle] = useState(contract.clientParty?.title || '');
  const [clientPhone, setClientPhone] = useState(contract.clientParty?.phone || '');
  const [clientAddress, setClientAddress] = useState(contract.clientParty?.address || '');
  const [signatureDataUrl, setSignatureDataUrl] = useState(contract.clientParty?.signature || '');

  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleExecuteInPerson = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!clientName.trim()) {
      setErrorMessage('Please enter the client full legal name.');
      return;
    }

    if (!clientEmail.trim()) {
      setErrorMessage('Please enter the client email address for the official audit record.');
      return;
    }

    if (!signatureDataUrl) {
      setErrorMessage('Please provide the client electronic signature below.');
      return;
    }

    if (!agreed) {
      setErrorMessage('Please tick the confirmation checkbox to agree to the terms.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: SignContractPayload = {
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim(),
        clientCompany: clientCompany.trim() || undefined,
        clientTitle: clientTitle.trim() || undefined,
        clientPhone: clientPhone.trim() || undefined,
        clientAddress: clientAddress.trim() || undefined,
        signatureDataUrl,
      };

      const updatedContract = await signContractInFirebase(contract.signingToken, payload);

      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
      });

      setIsCompleted(true);
      onSuccess(updatedContract);

      // Auto trigger PDF download
      setIsGeneratingPdf(true);
      setTimeout(async () => {
        try {
          await generateContractPDF(updatedContract);
        } catch (pdfErr) {
          console.error('PDF error on in-person signing:', pdfErr);
        } finally {
          setIsGeneratingPdf(false);
        }
      }, 500);

    } catch (err: any) {
      console.error('In-person signing failed:', err);
      setErrorMessage(err?.message || 'Failed to execute contract. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-blue-300 font-bold">
                  In-Person Signing Mode
                </span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-mono rounded font-bold">
                  On-the-Spot Handover
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {isCompleted ? 'Contract Executed Successfully' : 'Client In-Person Signature'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contract Quick Overview Strip */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-3 shrink-0 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Agreement Title
            </span>
            <span className="font-bold text-slate-900 line-clamp-1">{contract.title}</span>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Total Fee
              </span>
              <span className="font-extrabold text-blue-700">
                {formatCurrency(contract.totalCost, contract.currency)}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Upfront Deposit
              </span>
              <span className="font-bold text-slate-800">
                {formatCurrency(contract.depositAmount, contract.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          
          {isCompleted ? (
            <div className="text-center py-6 sm:py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-md shadow-emerald-500/15">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900">
                  Signed & Executed on the Spot!
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  <strong>{clientName}</strong> has successfully signed. The agreement is now dual-stamped, legally locked, and verified.
                </p>
              </div>

              <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 max-w-md mx-auto text-left text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Signer Name:</span>
                  <span className="font-bold text-slate-900">{clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Signer Email:</span>
                  <span className="font-bold text-slate-900">{clientEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Execution Date:</span>
                  <span className="font-mono text-emerald-800 font-bold">{new Date().toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={async () => {
                    setIsGeneratingPdf(true);
                    try {
                      await generateContractPDF(contract);
                    } finally {
                      setIsGeneratingPdf(false);
                    }
                  }}
                  disabled={isGeneratingPdf}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download Stamped PDF'}</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all"
                >
                  Done & Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleExecuteInPerson} className="space-y-4">
              
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl text-xs text-blue-950 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Client Handover Instructions:</strong> Hand the device or screen to the client so they can confirm their contact details, draw their signature, and agree to the contract.
                </span>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-700 font-medium">
                  {errorMessage}
                </div>
              )}

              {/* Client Details Inputs */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block border-b border-slate-100 pb-1.5">
                  1. Client Identification Details
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Full Legal Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Adebayo Johnson"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 text-xs text-slate-900 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="client@example.com"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 text-xs text-slate-900 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Company / Organization (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Johnson Holdings Ltd"
                      value={clientCompany}
                      onChange={(e) => setClientCompany(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 text-xs text-slate-900 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      placeholder="+234 80 1234 5678"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 text-xs text-slate-900 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Client Signature Pad */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    2. Client Electronic Signature <span className="text-red-500">*</span>
                  </span>
                  <span className="text-[10px] text-blue-600 font-medium">
                    Draw with finger/stylus or Type name
                  </span>
                </div>

                <SignaturePad
                  savedSignature={signatureDataUrl}
                  onSaveSignature={setSignatureDataUrl}
                  defaultName={clientName}
                />
              </div>

              {/* Legal Confirmation Checkbox */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="in-person-agree"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-blue-600 border-slate-300 focus:ring-0 cursor-pointer shrink-0 rounded"
                />
                <label htmlFor="in-person-agree" className="text-[11px] text-slate-700 leading-relaxed cursor-pointer font-medium">
                  I (<strong>{clientName || 'Client'}</strong>) have reviewed this contract, the scope of work, total fee of <strong>{formatCurrency(contract.totalCost, contract.currency)}</strong>, and terms & conditions. I confirm that my digital signature above represents my legally binding execution of this agreement.
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || !agreed}
                  className={`px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-md cursor-pointer active:scale-98 ${
                    agreed && !isSubmitting
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/25'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Executing Contract...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Execute & Lock Contract</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
