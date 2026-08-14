export type ContractStatus = 'draft' | 'pending_signature' | 'completed' | 'invalidated';

export interface AuthUser {
  uid: string;
  email?: string | null;
  displayName?: string | null;
}

export interface PartyDetails {
  name: string;
  email: string;
  company?: string;
  title?: string;
  phone?: string;
  address?: string;
  signature?: string; // Data URL for canvas drawn signature or SVG text
  signedAt?: string;  // ISO string
  ipAddress?: string;
}

export interface AuditEvent {
  timestamp: string;
  action: string;
  actor: 'Admin' | 'Client' | 'System';
  details?: string;
  ipAddress?: string;
}

export interface ContractMaterialItem {
  id: string;
  item: string;
  quantity: number;
  quality: string; // e.g. "Grade A 304 Stainless Steel", "100% Cashmere Wool", "Mahogany Hardwood"
  unitPrice: number;
  totalPrice: number;
}

export interface ContractImage {
  id: string;
  url: string; // Data URL or Web URL
  caption?: string;
  uploadedAt: string;
}

export interface Contract {
  id: string;
  adminUid?: string;
  signingToken: string;
  title: string;
  category: string;
  occupation?: string; // e.g., "Custom Tailor & Fashion Designer", "Structural Welder"
  description: string;
  termsAndConditions: string;
  totalCost: number;
  depositAmount: number;
  currency: string;
  language?: string; // e.g., "en", "es", "fr", "yo", "ha", "ig", "ja", "de", "zh", "ar"
  deliveryDate: string;
  
  // Materials Table (Optional, can be deleted)
  hasMaterialsTable?: boolean;
  materialsList?: ContractMaterialItem[];

  // Image Attachments (Up to 20 pictures)
  images?: ContractImage[];

  // Parties
  adminParty: PartyDetails;
  clientParty: PartyDetails;
  
  // Lifecycle & Metadata
  status: ContractStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  linkInvalidated: boolean;
  accessCount: number;
  auditTrail: AuditEvent[];
}

export interface CreateContractPayload {
  adminUid?: string;
  title: string;
  category: string;
  occupation?: string;
  description: string;
  termsAndConditions: string;
  totalCost: number;
  depositAmount: number;
  currency: string;
  language?: string;
  deliveryDate: string;
  hasMaterialsTable?: boolean;
  materialsList?: ContractMaterialItem[];
  images?: ContractImage[];
  adminParty: PartyDetails;
  clientParty: Partial<PartyDetails>; // Client email/name pre-filled optional by admin
}

export interface SignContractPayload {
  clientName: string;
  clientEmail: string;
  clientCompany?: string;
  clientTitle?: string;
  clientPhone?: string;
  clientAddress?: string;
  signatureDataUrl: string;
}
