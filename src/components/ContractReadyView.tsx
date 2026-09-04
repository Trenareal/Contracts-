import React, { useState, useEffect } from 'react';
import { Contract } from '../types';
import { formatCurrency } from '../utils/formatters';
import { generateContractPDF } from '../utils/pdfGenerator';
import { subscribeToSingleContract } from '../lib/firebaseService';
import { InPersonSigningModal } from './InPersonSigningModal';
import QRCode from 'qrcode';
import { 
  CheckCircle2, Copy, Check, MessageSquare, Mail, 
  Download, ArrowRight, Clock, ShieldCheck, 
  FileCheck, QrCode, Sparkles, ExternalLink, RefreshCw, Eye,
  UserCheck
} from 'lucide-react';

interface ContractReadyViewProps {
  contract: Contract;
  onOpenSigningPortal: (contract: Contract) => void;
  onDraftNewContract: () => void;
}

export const ContractReadyView: React.FC<ContractReadyViewProps> = ({
  contract: initialContract,
  onOpenSigningPortal,
  onDraftNewContract,
}) => {
  const [contract, setContract] = useState<Contract>(initialContract);
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showInPersonModal, setShowInPersonModal] = useState(false);

  // Subscribe to real-time contract updates (cloud firestore + instant cross-tab sync)
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setContract(initialContract);
    const unsubscribe = subscribeToSingleContract(initialContract.id, (fresh) => {
      setContract(fresh);
    });
    return () => unsubscribe();
  }, [initialContract.id]);

  const isSigned = contract.status === 'completed' || !!contract.clientParty?.signedAt;

  // Compute full signing link
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const signingLink = `${origin}${pathname}?token=${contract.signingToken}`;

  useEffect(() => {
    QRCode.toDataURL(signingLink, {
      width: 260,
      margin: 1.5,
      color: {
        dark: '#0F172A',
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error('Failed to generate QR Code:', err));
  }, [signingLink]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(signingLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const clientName = contract.clientParty?.name || 'there';
    const message = `Hello ${clientName}, please review and electronically sign our agreement "${contract.title}" via this secure link:\n\n${signingLink}`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleShareEmail = () => {
    const clientEmail = contract.clientParty?.email || '';
    const subject = encodeURIComponent(`Agreement for Signature: ${contract.title}`);
    const clientName = contract.clientParty?.name || 'Sir/Madam';
    const body = encodeURIComponent(
      `Hello ${clientName},\n\nPlease review and electronically sign our agreement "${contract.title}".\n\nYou can view and sign the document here:\n${signingLink}\n\nThank you,\n${contract.adminParty?.name || 'Contract Admin'}`
    );
    window.open(`mailto:${clientEmail}?subject=${subject}&body=${body}`, '_blank');
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPdf(true);
    try {
      await generateContractPDF(contract);
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-2 sm:py-4 px-2 sm:px-4 animate-in fade-in duration-300">
      
      {/* Main Status Banner Card */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden mb-4">
        
        {/* Header - Adapts dynamically when client signs */}
        {isSigned ? (
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white p-5 sm:p-7 text-center border-b border-emerald-800/40 relative">
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/20 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] sm:text-xs font-mono uppercase tracking-widest font-bold rounded-full mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Contract Signed & Fully Executed
            </div>
            
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Agreement Legally Completed!
            </h1>
            
            <p className="text-xs sm:text-sm text-emerald-200/90 max-w-lg mx-auto mt-1.5 leading-relaxed">
              <strong>{contract.clientParty?.name || 'Client'}</strong> has reviewed and digitally signed this contract. The link is now locked and sealed.
            </p>
          </div>
        ) : (
          <div className="bg-slate-900 text-white p-5 sm:p-6 text-center border-b border-slate-800 relative">
            <div className="w-12 h-12 bg-blue-500/20 text-blue-400 border border-blue-400/30 rounded-2xl flex items-center justify-center mx-auto mb-2.5 shadow-md shadow-blue-500/10">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-blue-500/15 text-blue-300 border border-blue-400/30 text-[10px] font-mono uppercase tracking-widest font-bold rounded-full mb-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
              One-Time Signing Link Ready
            </div>
            
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Contract Drafted & Published
            </h1>
            
            <p className="text-xs text-slate-300 max-w-md mx-auto mt-1 leading-relaxed">
              Send the link below to your client. When they sign on their device, this screen will immediately reflect their signature in real time!
            </p>
          </div>
        )}

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-5">
          
          {/* Real-time Status Notification Bar */}
          <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
            isSigned 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-blue-50/80 border-blue-200 text-blue-950'
          }`}>
            <div className="flex items-center gap-2.5">
              {isSigned ? (
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <FileCheck className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Clock className="w-4 h-4 animate-spin" />
                </div>
              )}
              <div>
                <span className="font-bold block">
                  {isSigned 
                    ? `Signed on ${contract.clientParty?.signedAt ? new Date(contract.clientParty.signedAt).toLocaleString() : new Date().toLocaleString()}`
                    : 'Live Real-Time Sync Active'}
                </span>
                <span className="text-[11px] opacity-80">
                  {isSigned
                    ? `Signer: ${contract.clientParty?.name} (${contract.clientParty?.email || 'No email specified'})`
                    : contract.accessCount && contract.accessCount > 0
                    ? `Client opened the link (${contract.accessCount} view${contract.accessCount > 1 ? 's' : ''}). Awaiting signature...`
                    : 'Waiting for client to open link and sign...'}
                </span>
              </div>
            </div>

            <div className="shrink-0">
              <span className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase rounded-lg tracking-wider ${
                isSigned
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-blue-100 text-blue-900 border border-blue-300'
              }`}>
                {isSigned ? 'EXECUTED' : 'PENDING'}
              </span>
            </div>
          </div>

          {/* Dual Signature Stamped Preview Card (Shown When Signed) */}
          {isSigned && (
            <div className="bg-slate-50 border-2 border-emerald-300/80 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Verified Digital Signatures
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  Dual-Signed
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Contractor Signature */}
                <div className="bg-white p-3 border border-slate-200 rounded-xl space-y-1.5 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Party A: Contractor
                  </span>
                  <p className="text-xs font-bold text-slate-900 line-clamp-1">
                    {contract.adminParty?.name || 'Contractor'}
                  </p>
                  <div className="h-16 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center p-1 overflow-hidden">
                    {contract.adminParty?.signature ? (
                      <img src={contract.adminParty.signature} alt="Contractor Signature" className="max-h-14 object-contain" />
                    ) : (
                      <span className="text-[11px] font-serif italic text-blue-900">{contract.adminParty?.name}</span>
                    )}
                  </div>
                </div>

                {/* Client Signature */}
                <div className="bg-emerald-50/50 p-3 border border-emerald-300 rounded-xl space-y-1.5 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                    Party B: Client (Signed)
                  </span>
                  <p className="text-xs font-bold text-emerald-950 line-clamp-1">
                    {contract.clientParty?.name || 'Client Signer'}
                  </p>
                  <div className="h-16 bg-white border border-emerald-200 rounded-lg flex items-center justify-center p-1 overflow-hidden">
                    {contract.clientParty?.signature ? (
                      <img src={contract.clientParty.signature} alt="Client Signature" className="max-h-14 object-contain" />
                    ) : (
                      <span className="text-[11px] font-serif italic text-emerald-900">{contract.clientParty?.name}</span>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Quick Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 border border-slate-200 rounded-2xl text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Contract Title
              </span>
              <span className="font-bold text-slate-900 line-clamp-1">{contract.title}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Signer / Client
              </span>
              <span className="font-semibold text-slate-800">
                {contract.clientParty?.name || 'Pending Signer'}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Total Agreement
              </span>
              <span className="font-bold text-blue-600">
                {formatCurrency(contract.totalCost, contract.currency)}
              </span>
            </div>
          </div>

          {/* If NOT signed yet: Show Copyable Link & Share Actions */}
          {!isSigned && (
            <>
              {/* Copyable Link Box */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Shareable Signing Link (Copy & Send)
                </label>
                <div className="flex flex-col sm:flex-row items-stretch gap-2 bg-slate-50 border border-slate-200 p-1.5 rounded-2xl">
                  <input
                    type="text"
                    readOnly
                    value={signingLink}
                    className="flex-1 bg-transparent px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none select-all"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                      copied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-98'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Instant One-Click Sharing Options */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Instant 1-Click Share
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] border border-[#25D366]/30 rounded-2xl text-xs font-bold transition-all cursor-pointer active:scale-98"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Send via WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleShareEmail}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-2xl text-xs font-bold transition-all cursor-pointer active:scale-98"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Send via Email</span>
                  </button>
                </div>
              </div>

              {/* Direct In-Person Client Signature Option */}
              <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-emerald-950">
                      Client is Physically Around / In-Person?
                    </h3>
                    <p className="text-[11px] text-emerald-800/90 mt-0.5">
                      Client can sign directly on this screen now without waiting for email or messages.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowInPersonModal(true)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shrink-0"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Sign in Person Now</span>
                </button>
              </div>

              {/* QR Code Section */}
              <div className="flex flex-col sm:flex-row items-center gap-5 bg-slate-50 border border-slate-200 p-5 rounded-2xl">
                {qrCodeUrl ? (
                  <div className="bg-white p-2 border border-slate-200 rounded-2xl shadow-xs shrink-0">
                    <img src={qrCodeUrl} alt="Signing QR Code" className="w-32 h-32 rounded-xl" />
                  </div>
                ) : (
                  <div className="w-32 h-32 bg-slate-200 animate-pulse rounded-2xl shrink-0" />
                )}
                <div className="text-center sm:text-left space-y-1">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-slate-900">
                    <QrCode className="w-4 h-4 text-blue-600" />
                    <span>Or Client Scans via Phone Camera</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Client can point their phone camera at this QR code to review and sign on their personal device.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Action Row */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            
            {/* Download PDF Button - Green & Prominent if Signed */}
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer active:scale-98 disabled:opacity-50 shadow-md ${
                isSigned
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200'
              }`}
            >
              <Download className={`w-4 h-4 ${isSigned ? 'text-white' : 'text-blue-600'}`} />
              <span>
                {isGeneratingPdf 
                  ? 'Generating Official PDF...' 
                  : isSigned 
                  ? 'Download Signed & Stamped PDF' 
                  : 'Download PDF Draft'}
              </span>
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onDraftNewContract}
                className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                + Draft Another
              </button>
              
              {!isSigned && (
                <button
                  type="button"
                  onClick={() => onOpenSigningPortal(contract)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer active:scale-98 shadow-md"
                >
                  <span>Open Signing Page</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

        </div>

      </div>

      {showInPersonModal && (
        <InPersonSigningModal
          contract={contract}
          onSuccess={(updated) => {
            setContract(updated);
          }}
          onClose={() => setShowInPersonModal(false)}
        />
      )}

    </div>
  );
};
