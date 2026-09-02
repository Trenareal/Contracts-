import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Contract } from '../types';
import { formatCurrency } from './formatters';

export async function generateContractPDF(contract: Contract, elementToCapture?: HTMLElement | null): Promise<void> {
  // If an element is passed, attempt high-fidelity DOM snapshot first
  if (elementToCapture) {
    try {
      const canvas = await html2canvas(elementToCapture, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1200,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pdfWidth; // full width
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const filename = `${contract.title.replace(/[^a-zA-Z0-9]/g, '_')}_Executed.pdf`;
      pdf.save(filename);
      return;
    } catch (err) {
      console.warn('html2canvas capture failed, falling back to vector PDF builder:', err);
    }
  }

  // Programmatic Vector PDF Generator with complete images, signatures, materials & terms
  const pdf = new jsPDF('p', 'pt', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - (margin * 2);
  
  let y = 0;
  let pageNumber = 1;

  const drawHeader = (isFirstPage = false) => {
    // Header Banner
    pdf.setFillColor(15, 23, 42); // slate-900
    pdf.rect(0, 0, pageWidth, isFirstPage ? 65 : 45, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(isFirstPage ? 14 : 10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('LEGAL SERVICE CONTRACT & EXECUTION RECORD', margin, isFirstPage ? 32 : 28);
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(148, 163, 184); // slate-400
    pdf.text(`Ref: ${contract.id} • Status: ${contract.status.toUpperCase()}`, pageWidth - margin - 180, isFirstPage ? 32 : 28);

    if (isFirstPage) {
      pdf.setFontSize(8);
      pdf.setTextColor(203, 213, 225);
      pdf.text(`Category: ${contract.category || 'General Service'} • Occupation: ${contract.occupation || 'Standard'}`, margin, 50);
    }

    y = isFirstPage ? 85 : 65;
  };

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 50) {
      // Draw footer on current page
      pdf.setFontSize(7);
      pdf.setTextColor(148, 163, 184);
      pdf.text(`Page ${pageNumber} • Contract Ref: ${contract.id} • Digitally Verified`, margin, pageHeight - 25);
      
      pdf.addPage();
      pageNumber++;
      drawHeader(false);
    }
  };

  // Draw Page 1 Header
  drawHeader(true);

  // Title
  pdf.setTextColor(15, 23, 42);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text(contract.title, margin, y);
  y += 24;

  // Financial & Timeline Summary Box
  checkPageBreak(75);
  pdf.setDrawColor(226, 232, 240);
  pdf.setFillColor(248, 250, 252);
  pdf.roundedRect(margin, y, contentWidth, 58, 6, 6, 'FD');

  const colWidth = contentWidth / 3;
  
  // Total
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(100, 116, 139);
  pdf.text('TOTAL CONTRACT VALUE', margin + 14, y + 20);
  pdf.setFontSize(12);
  pdf.setTextColor(15, 23, 42);
  pdf.text(formatCurrency(contract.totalCost, contract.currency), margin + 14, y + 40);

  // Deposit
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(37, 99, 235);
  pdf.text('INITIAL DEPOSIT REQUIRED', margin + colWidth + 14, y + 20);
  pdf.setFontSize(12);
  pdf.text(formatCurrency(contract.depositAmount, contract.currency), margin + colWidth + 14, y + 40);

  // Delivery
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(100, 116, 139);
  pdf.text('DELIVERY SCHEDULE', margin + (colWidth * 2) + 14, y + 20);
  pdf.setFontSize(10);
  pdf.setTextColor(15, 23, 42);
  const formattedDate = contract.deliveryDate ? new Date(contract.deliveryDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Milestone Based';
  pdf.text(formattedDate, margin + (colWidth * 2) + 14, y + 40);

  y += 75;

  // Scope of Work
  checkPageBreak(50);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(15, 23, 42);
  pdf.text('SCOPE OF WORK & OCCUPATION SPECIFICATIONS', margin, y);
  y += 14;

  pdf.setFontSize(8.5);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(51, 65, 85);
  const splitDesc = pdf.splitTextToSize(contract.description || 'As agreed in specifications.', contentWidth);
  
  for (const line of splitDesc) {
    checkPageBreak(13);
    pdf.text(line, margin, y);
    y += 12;
  }
  y += 16;

  // Materials & Bill of Quantities Table
  if (contract.hasMaterialsTable && contract.materialsList && contract.materialsList.length > 0) {
    checkPageBreak(40);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(15, 23, 42);
    pdf.text('ITEMIZED BILL OF QUANTITIES & SPECIFICATIONS', margin, y);
    y += 14;

    // Table Header
    checkPageBreak(24);
    pdf.setFillColor(241, 245, 249);
    pdf.rect(margin, y, contentWidth, 18, 'F');
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 41, 59);
    pdf.text('ITEM DESCRIPTION', margin + 8, y + 12);
    pdf.text('QTY', margin + 210, y + 12);
    pdf.text('SPECIFICATION / QUALITY', margin + 260, y + 12);
    pdf.text('TOTAL', margin + contentWidth - 60, y + 12);
    y += 22;

    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(51, 65, 85);

    contract.materialsList.forEach((m, idx) => {
      checkPageBreak(16);
      if (idx % 2 === 1) {
        pdf.setFillColor(248, 250, 252);
        pdf.rect(margin, y - 4, contentWidth, 16, 'F');
      }
      pdf.text((m.item || '').slice(0, 38), margin + 8, y + 8);
      pdf.text(String(m.quantity || 1), margin + 210, y + 8);
      pdf.text((m.quality || '').slice(0, 32), margin + 260, y + 8);
      pdf.text(formatCurrency(m.totalPrice || 0, contract.currency), margin + contentWidth - 60, y + 8);
      y += 16;
    });

    y += 16;
  }

  // Contract Photos & Visual Attachments
  if (contract.images && contract.images.length > 0) {
    checkPageBreak(40);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(15, 23, 42);
    pdf.text(`CONTRACT VISUAL ASSETS & PHOTOS (${contract.images.length} ATTACHED)`, margin, y);
    y += 14;

    const imgGridCols = 2;
    const imgWidth = (contentWidth - 16) / imgGridCols;
    const imgHeight = (imgWidth * 0.7); // 4:3 aspect ratio

    for (let i = 0; i < contract.images.length; i += imgGridCols) {
      checkPageBreak(imgHeight + 40);

      for (let c = 0; c < imgGridCols; c++) {
        const imgIndex = i + c;
        if (imgIndex < contract.images.length) {
          const img = contract.images[imgIndex];
          const xPos = margin + c * (imgWidth + 16);

          try {
            // Determine image format (JPEG/PNG) or let jsPDF auto-detect
            let format = 'JPEG';
            if (img.url.startsWith('data:image/png')) {
              format = 'PNG';
            } else if (img.url.startsWith('data:image/webp')) {
              format = 'WEBP';
            }

            // Draw thumbnail image container
            pdf.setDrawColor(203, 213, 225);
            pdf.setFillColor(248, 250, 252);
            pdf.roundedRect(xPos, y, imgWidth, imgHeight, 3, 3, 'FD');

            // Add image cleanly inside box
            pdf.addImage(img.url, format, xPos + 1.5, y + 1.5, imgWidth - 3, imgHeight - 3);

            // Caption & Label
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(30, 41, 59);
            const captionText = `Photo #${imgIndex + 1}: ${img.caption || 'Attached Specification'}`;
            pdf.text(captionText.slice(0, 38), xPos + 2, y + imgHeight + 11);
          } catch (imgErr) {
            console.warn('Failed to embed image in PDF:', imgErr);
            pdf.setFontSize(7.5);
            pdf.setTextColor(148, 163, 184);
            pdf.text(`Photo #${imgIndex + 1}: ${img.caption || 'Attached Specification'}`, xPos + 2, y + imgHeight / 2);
          }
        }
      }

      y += imgHeight + 28;
    }
    y += 10;
  }

  // Terms and Conditions
  checkPageBreak(50);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(15, 23, 42);
  pdf.text('TERMS AND CONDITIONS OF AGREEMENT', margin, y);
  y += 14;

  pdf.setFontSize(7.5);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(71, 85, 105);
  const splitTerms = pdf.splitTextToSize(contract.termsAndConditions || 'Standard terms apply.', contentWidth);
  
  for (const line of splitTerms) {
    checkPageBreak(12);
    pdf.text(line, margin, y);
    y += 10;
  }
  y += 20;

  // Signatures & Execution Section
  checkPageBreak(110);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(15, 23, 42);
  pdf.text('DIGITAL SIGNATURES & LEGAL EXECUTION', margin, y);
  y += 14;

  const boxWidth = (contentWidth - 16) / 2;
  const boxHeight = 90;

  // Provider Box
  pdf.setDrawColor(203, 213, 225);
  pdf.setFillColor(248, 250, 252);
  pdf.roundedRect(margin, y, boxWidth, boxHeight, 4, 4, 'FD');

  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(15, 23, 42);
  pdf.text('PARTY A: SERVICE PROVIDER / CONTRACTOR', margin + 10, y + 16);
  
  pdf.setFontSize(7.5);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(71, 85, 105);
  pdf.text(`Name: ${contract.adminParty?.name || 'Authorized Provider'}`, margin + 10, y + 30);
  pdf.text(`Company: ${contract.adminParty?.company || 'Apex Craft Works'}`, margin + 10, y + 42);
  pdf.text(`Signed: ${contract.adminParty?.signedAt ? new Date(contract.adminParty.signedAt).toLocaleDateString() : 'Signed & Authorized'}`, margin + 10, y + 54);

  if (contract.adminParty?.signature && contract.adminParty.signature.startsWith('data:image/')) {
    try {
      pdf.addImage(contract.adminParty.signature, 'PNG', margin + 10, y + 58, 80, 24);
    } catch {
      // Fallback
    }
  }

  // Client Box
  const clientX = margin + boxWidth + 16;
  pdf.setDrawColor(203, 213, 225);
  pdf.setFillColor(248, 250, 252);
  pdf.roundedRect(clientX, y, boxWidth, boxHeight, 4, 4, 'FD');

  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(15, 23, 42);
  pdf.text('PARTY B: CLIENT / AUTHORIZING SIGNATORY', clientX + 10, y + 16);

  pdf.setFontSize(7.5);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(71, 85, 105);
  pdf.text(`Name: ${contract.clientParty?.name || 'Pending Client Fill'}`, clientX + 10, y + 30);
  pdf.text(`Email: ${contract.clientParty?.email || 'N/A'}`, clientX + 10, y + 42);
  pdf.text(`Signed: ${contract.clientParty?.signedAt ? new Date(contract.clientParty.signedAt).toLocaleString() : 'Pending Execution'}`, clientX + 10, y + 54);

  if (contract.clientParty?.signature && contract.clientParty.signature.startsWith('data:image/')) {
    try {
      pdf.addImage(contract.clientParty.signature, 'PNG', clientX + 10, y + 58, 80, 24);
    } catch {
      // Fallback
    }
  }

  y += boxHeight + 20;

  // Final Archival Verification Footer
  checkPageBreak(30);
  pdf.setFontSize(7);
  pdf.setTextColor(148, 163, 184);
  pdf.text(`Non-Editable Archived Legal Document • Generated on ${new Date().toLocaleString()}`, margin, y);
  pdf.text(`Digital Verification Token: ${contract.signingToken}`, margin, y + 10);
  
  // Page number footer
  pdf.text(`Page ${pageNumber} • Contract Ref: ${contract.id}`, margin, pageHeight - 25);

  const filename = `${contract.title.replace(/[^a-zA-Z0-9]/g, '_')}_Executed.pdf`;
  pdf.save(filename);
}
