import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  getDocs, 
  getDoc, 
  deleteDoc, 
  query,
  where,
  limit,
  Unsubscribe 
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { Contract, CreateContractPayload, SignContractPayload } from '../types';

export const CONTRACTS_COLLECTION = 'contracts';
export const USERS_COLLECTION = 'users';
export const ACCOUNTS_COLLECTION = 'accounts';

/**
 * SHA-256 Password Hash for Secure Database Matching
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "_salt_contract_auth_2026");
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function sanitizeEmailToKey(email: string): string {
  return email.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
}

/**
 * Save Account and Hashed Password to Firestore database
 */
export async function saveAccountCredentialsToFirestore(account: {
  email: string;
  passwordHash: string;
  displayName: string;
  uid: string;
}) {
  const cleanEmail = account.email.trim().toLowerCase();
  const emailKey = sanitizeEmailToKey(cleanEmail);
  const docRef = doc(db, ACCOUNTS_COLLECTION, emailKey);
  const data = {
    uid: account.uid,
    email: cleanEmail,
    displayName: account.displayName,
    passwordHash: account.passwordHash,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };
  try {
    await setDoc(docRef, data, { merge: true });
    localStorage.setItem(`contract_app_cred_${cleanEmail}`, JSON.stringify(data));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${ACCOUNTS_COLLECTION}/${emailKey}`);
    localStorage.setItem(`contract_app_cred_${cleanEmail}`, JSON.stringify(data));
  }
}

/**
 * Retrieve Account Credentials from Firestore database
 */
export async function getAccountByEmailFromFirestore(email: string) {
  const cleanEmail = email.trim().toLowerCase();
  const emailKey = sanitizeEmailToKey(cleanEmail);
  try {
    const docRef = doc(db, ACCOUNTS_COLLECTION, emailKey);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as {
        uid: string;
        email: string;
        displayName: string;
        passwordHash: string;
      };
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${ACCOUNTS_COLLECTION}/${emailKey}`);
  }

  // Local storage fallback
  try {
    const local = localStorage.getItem(`contract_app_cred_${cleanEmail}`);
    if (local) return JSON.parse(local);
  } catch {
    // ignore
  }

  return null;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

/**
 * Load User Profile and Business Settings from Firestore
 */
export async function getUserProfileFromFirestore(uid: string) {
  if (!uid) return null;
  try {
    const userDocRef = doc(db, USERS_COLLECTION, uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${USERS_COLLECTION}/${uid}`);
    return null;
  }
}

/**
 * Save User Profile and Business Settings to Firestore
 */
export async function saveUserProfileToFirestore(uid: string, data: {
  email?: string | null;
  displayName?: string | null;
  occupation?: any;
  businessProfile?: any;
}) {
  if (!uid) return;
  try {
    const userDocRef = doc(db, USERS_COLLECTION, uid);
    const payload = {
      uid,
      email: data.email || auth.currentUser?.email || '',
      displayName: data.displayName || auth.currentUser?.displayName || '',
      occupation: data.occupation || null,
      businessProfile: data.businessProfile || null,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(userDocRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${USERS_COLLECTION}/${uid}`);
  }
}

/**
 * Real-time listener for contracts collection in Firestore scoped to the current user's UID.
 */
export function subscribeContracts(userUid: string, onUpdate: (contracts: Contract[]) => void): Unsubscribe {
  if (!userUid) {
    onUpdate([]);
    return () => {};
  }

  // Multi-user query: only retrieve contracts authored by this user
  const q = query(collection(db, CONTRACTS_COLLECTION), where('adminUid', '==', userUid));

  return onSnapshot(
    q,
    async (snapshot) => {
      if (snapshot.empty) {
        onUpdate([]);
      } else {
        const contracts: Contract[] = snapshot.docs.map((d) => d.data() as Contract);
        // Sort newest created first
        contracts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        onUpdate(contracts);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, CONTRACTS_COLLECTION);
      onUpdate([]);
    }
  );
}

/**
 * Fetch a single contract by ID or token from Firestore
 */
export async function getContractByIdOrToken(idOrToken: string, isClientView = false): Promise<Contract | null> {
  try {
    // Check direct doc ID match first
    const docRef = doc(db, CONTRACTS_COLLECTION, idOrToken);
    const snap = await getDoc(docRef);

    let contract: Contract | null = snap.exists() ? (snap.data() as Contract) : null;

    if (!contract) {
      // Query specifically by signingToken with limit(1)
      const tokenQuery = query(
        collection(db, CONTRACTS_COLLECTION), 
        where('signingToken', '==', idOrToken),
        limit(1)
      );
      const querySnap = await getDocs(tokenQuery);
      if (!querySnap.empty) {
        contract = querySnap.docs[0].data() as Contract;
      }
    }

    if (contract && isClientView) {
      // Increment access count and log audit event
      const updatedCount = (contract.accessCount || 0) + 1;
      const now = new Date().toISOString();
      const updatedContract: Contract = {
        ...contract,
        accessCount: updatedCount,
        auditTrail: [
          ...contract.auditTrail,
          {
            timestamp: now,
            action: 'Client Portal Accessed',
            actor: 'Client',
            details: 'Contract link opened in browser via Firebase',
          },
        ],
      };
      await setDoc(doc(db, CONTRACTS_COLLECTION, contract.id), updatedContract);
      return updatedContract;
    }

    return contract;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `${CONTRACTS_COLLECTION}/${idOrToken}`);
    return null;
  }
}

/**
 * Create a new contract in Firestore scoped to the user's UID
 */
export async function createContractInFirebase(payload: CreateContractPayload, userUid?: string): Promise<Contract> {
  const currentUid = userUid || auth.currentUser?.uid || payload.adminUid || '';
  const id = `cnt_${Math.random().toString(36).substring(2, 8)}`;
  const token = `tok_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString(36)}`;
  const now = new Date().toISOString();

  const newContract: Contract = {
    id,
    adminUid: currentUid,
    signingToken: token,
    title: payload.title,
    category: payload.category || 'General Service',
    description: payload.description,
    termsAndConditions: payload.termsAndConditions,
    totalCost: Number(payload.totalCost) || 0,
    depositAmount: Number(payload.depositAmount) || 0,
    currency: payload.currency || 'NGN',
    language: payload.language || 'en',
    occupation: payload.occupation || '',
    deliveryDate: payload.deliveryDate || '',
    hasMaterialsTable: payload.hasMaterialsTable ?? false,
    materialsList: payload.materialsList || [],
    images: payload.images || [],
    adminParty: {
      name: payload.adminParty?.name || 'Admin',
      email: payload.adminParty?.email || '',
      company: payload.adminParty?.company || '',
      title: payload.adminParty?.title || '',
      phone: payload.adminParty?.phone || '',
      address: payload.adminParty?.address || '',
      signature: payload.adminParty?.signature || '',
      signedAt: payload.adminParty?.signature ? now : undefined,
    },
    clientParty: {
      name: payload.clientParty?.name || '',
      email: payload.clientParty?.email || '',
      company: payload.clientParty?.company || '',
      title: payload.clientParty?.title || '',
      phone: payload.clientParty?.phone || '',
      address: payload.clientParty?.address || '',
    },
    status: 'pending_signature',
    createdAt: now,
    updatedAt: now,
    linkInvalidated: false,
    accessCount: 0,
    auditTrail: [
      {
        timestamp: now,
        action: 'Contract Created',
        actor: 'Admin',
        details: `Contract created by ${payload.adminParty?.name || 'Admin'} in ${payload.currency || 'NGN'}.`,
      },
      {
        timestamp: now,
        action: 'Secure Link Activated',
        actor: 'Admin',
        details: `Signing token generated (${token}).`,
      },
    ],
  };

  try {
    await setDoc(doc(db, CONTRACTS_COLLECTION, id), newContract);
    return newContract;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${CONTRACTS_COLLECTION}/${id}`);
    throw error;
  }
}

/**
 * Client signs contract in Firestore
 */
export async function signContractInFirebase(idOrToken: string, payload: SignContractPayload): Promise<Contract> {
  const contract = await getContractByIdOrToken(idOrToken);
  if (!contract) {
    throw new Error('Contract not found in Firestore.');
  }

  if (contract.status === 'completed' || contract.linkInvalidated) {
    throw new Error('This contract has already been signed or the link has been invalidated.');
  }

  const now = new Date().toISOString();

  const updatedContract: Contract = {
    ...contract,
    clientParty: {
      name: payload.clientName || contract.clientParty.name || 'Client',
      email: payload.clientEmail || contract.clientParty.email || '',
      company: payload.clientCompany || contract.clientParty.company || '',
      title: payload.clientTitle || contract.clientParty.title || '',
      phone: payload.clientPhone || contract.clientParty.phone || '',
      address: payload.clientAddress || contract.clientParty.address || '',
      signature: payload.signatureDataUrl,
      signedAt: now,
    },
    status: 'completed',
    completedAt: now,
    updatedAt: now,
    linkInvalidated: true, // Invalidate link after client signs
    auditTrail: [
      ...contract.auditTrail,
      {
        timestamp: now,
        action: 'Contract Digitally Signed & Link Invalidated',
        actor: 'Client',
        details: `Signed by ${payload.clientName} (${payload.clientEmail}). E-signature captured & non-editable PDF generated.`,
      },
    ],
  };

  try {
    await setDoc(doc(db, CONTRACTS_COLLECTION, contract.id), updatedContract);
    return updatedContract;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${CONTRACTS_COLLECTION}/${contract.id}`);
    throw error;
  }
}

/**
 * Revoke / Invalidate contract link
 */
export async function invalidateContractLinkInFirebase(contractId: string): Promise<Contract> {
  const docRef = doc(db, CONTRACTS_COLLECTION, contractId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) {
    throw new Error('Contract not found');
  }

  const contract = snap.data() as Contract;
  const now = new Date().toISOString();

  const updatedContract: Contract = {
    ...contract,
    linkInvalidated: true,
    status: contract.status === 'completed' ? 'completed' : 'invalidated',
    updatedAt: now,
    auditTrail: [
      ...contract.auditTrail,
      {
        timestamp: now,
        action: 'Signing Link Revoked',
        actor: 'Admin',
        details: 'Admin manually revoked access to this signing link.',
      },
    ],
  };

  try {
    await setDoc(docRef, updatedContract);
    return updatedContract;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${CONTRACTS_COLLECTION}/${contractId}`);
    throw error;
  }
}

/**
 * Mark contract as Completed & Locked in Firestore.
 */
export async function completeContractInFirebase(contractId: string): Promise<Contract> {
  const docRef = doc(db, CONTRACTS_COLLECTION, contractId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) {
    throw new Error('Contract not found in Firestore.');
  }

  const contract = snap.data() as Contract;
  const now = new Date().toISOString();

  const updatedContract: Contract = {
    ...contract,
    status: 'completed',
    completedAt: contract.completedAt || now,
    linkInvalidated: true,
    updatedAt: now,
    auditTrail: [
      ...contract.auditTrail,
      {
        timestamp: now,
        action: 'Contract Marked as Completed & Locked',
        actor: 'Admin',
        details: 'Contract was finalized and marked Completed. All signing links are permanently closed and locked.',
      },
    ],
  };

  try {
    await setDoc(docRef, updatedContract);
    return updatedContract;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${CONTRACTS_COLLECTION}/${contractId}`);
    throw error;
  }
}

/**
 * Update contract in Firestore
 */
export async function updateContractInFirebase(contractId: string, payload: Partial<CreateContractPayload>): Promise<Contract> {
  const docRef = doc(db, CONTRACTS_COLLECTION, contractId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) {
    throw new Error('Contract not found in Firestore.');
  }

  const contract = snap.data() as Contract;
  if (contract.status === 'completed' || contract.clientParty?.signedAt) {
    throw new Error('This contract has already been signed or completed and cannot be edited to protect legal validity.');
  }

  const now = new Date().toISOString();

  const updatedContract: Contract = {
    ...contract,
    title: payload.title !== undefined ? payload.title : contract.title,
    category: payload.category !== undefined ? payload.category : contract.category,
    description: payload.description !== undefined ? payload.description : contract.description,
    termsAndConditions: payload.termsAndConditions !== undefined ? payload.termsAndConditions : contract.termsAndConditions,
    totalCost: payload.totalCost !== undefined ? Number(payload.totalCost) : contract.totalCost,
    depositAmount: payload.depositAmount !== undefined ? Number(payload.depositAmount) : contract.depositAmount,
    currency: payload.currency !== undefined ? payload.currency : contract.currency,
    language: payload.language !== undefined ? payload.language : (contract.language || 'en'),
    occupation: payload.occupation !== undefined ? payload.occupation : contract.occupation,
    deliveryDate: payload.deliveryDate !== undefined ? payload.deliveryDate : contract.deliveryDate,
    hasMaterialsTable: payload.hasMaterialsTable !== undefined ? payload.hasMaterialsTable : contract.hasMaterialsTable,
    materialsList: payload.materialsList !== undefined ? payload.materialsList : contract.materialsList,
    images: payload.images !== undefined ? payload.images : (contract.images || []),
    adminParty: {
      ...contract.adminParty,
      name: payload.adminParty?.name || contract.adminParty.name,
      email: payload.adminParty?.email || contract.adminParty.email,
      company: payload.adminParty?.company || contract.adminParty.company,
      title: payload.adminParty?.title || contract.adminParty.title,
      phone: payload.adminParty?.phone || contract.adminParty.phone,
      address: payload.adminParty?.address || contract.adminParty.address,
      signature: payload.adminParty?.signature || contract.adminParty.signature,
      signedAt: payload.adminParty?.signature ? now : contract.adminParty.signedAt,
    },
    clientParty: {
      ...contract.clientParty,
      name: payload.clientParty?.name !== undefined ? payload.clientParty.name : contract.clientParty.name,
      email: payload.clientParty?.email !== undefined ? payload.clientParty.email : contract.clientParty.email,
      company: payload.clientParty?.company !== undefined ? payload.clientParty.company : contract.clientParty.company,
      title: payload.clientParty?.title !== undefined ? payload.clientParty.title : contract.clientParty.title,
      phone: payload.clientParty?.phone !== undefined ? payload.clientParty.phone : contract.clientParty.phone,
      address: payload.clientParty?.address !== undefined ? payload.clientParty.address : contract.clientParty.address,
    },
    updatedAt: now,
    auditTrail: [
      ...contract.auditTrail,
      {
        timestamp: now,
        action: 'Contract Terms Updated',
        actor: 'Admin',
        details: 'Contract terms, scope of work, and financial terms updated by Admin.',
      },
    ],
  };

  try {
    await setDoc(docRef, updatedContract);
    return updatedContract;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${CONTRACTS_COLLECTION}/${contractId}`);
    throw error;
  }
}

export async function deleteContractFromFirebase(contractId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, CONTRACTS_COLLECTION, contractId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${CONTRACTS_COLLECTION}/${contractId}`);
    throw error;
  }
}

