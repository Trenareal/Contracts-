import React, { useState, useEffect, useRef } from 'react';
import { Contract } from '../types';
import { formatCurrency } from '../utils/formatters';
import { generateContractPDF } from '../utils/pdfGenerator';
import QRCode from 'qrcode';
import { 
  CheckCircle2, Copy, Check, Share2, MessageSquare, Mail, 
  Download, ExternalLink, PlusCircle, ShieldCheck, ArrowRight,
  FileText, Calendar, DollarSign, UserCheck, QrCode
} from 'lucide-react';

interface ContractReadyViewProps {
  contract: Contract;
  onOpenSigningPortal: (contract: Contract) => void;
  onDraftNewContract: () => void;
}

export const ContractReadyView: React.FC<ContractReadyViewProps> = ({
  contract,
  onOpenSigningPortal,
  onDraftNewContract,
}) => {
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

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

  const handleDownloadDraft = async () => {
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
      
      {/* Success Banner Card */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl shadow-lg overflow-hidden mb-4">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 text-center border-b border-slate-800 relative">
          <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 rounded-2xl flex items-center justify-center mx-auto mb-2.5 shadow-md shadow-emerald-500/10">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <span className="inline-block px-3 py-0.5 bg-blue-500/15 text-blue-300 border border-blue-400/30 text-[10px] font-mono uppercase tracking-widest font-bold rounded-full mb-1.5">
            One-Time Signing Link Ready
          </span>
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Contract Drafted & Published
          </h1>
          <p className="text-xs text-slate-300 max-w-md mx-auto mt-1 leading-relaxed">
            Send the link below to your client. Once signed, both parties receive the verified stamped PDF.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-5">
          
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
                <span>In-Person QR Code Signing</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                If the client is with you in person, let them scan this QR code with their phone camera to instantly sign on their screen.
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleDownloadDraft}
              disabled={isGeneratingPdf}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer active:scale-98 disabled:opacity-50 shadow-xs"
            >
              <Download className="w-4 h-4 text-blue-600" />
              <span>{isGeneratingPdf ? 'Generating PDF Document...' : 'Download PDF Document'}</span>
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onDraftNewContract}
                className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                + Draft Another
              </button>
              <button
                type="button"
                onClick={() => onOpenSigningPortal(contract)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer active:scale-98 shadow-md"
              >
                <span>Open Signing Page</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
