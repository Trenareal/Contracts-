import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { INITIAL_CONTRACTS } from './src/data/seedContracts';
import { Contract, CreateContractPayload, SignContractPayload } from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// In-memory + local file persistence path
const DATA_FILE = path.join(process.cwd(), 'contracts_store.json');

function loadContracts(): Contract[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading contracts file:', err);
  }
  saveContracts(INITIAL_CONTRACTS);
  return INITIAL_CONTRACTS;
}

function saveContracts(contracts: Contract[]) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(contracts, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving contracts file:', err);
  }
}

let contractsStore: Contract[] = loadContracts();

// API ROUTES

// Get all contracts (Admin view)
app.get('/api/contracts', (_req, res) => {
  res.json({ success: true, contracts: contractsStore });
});

// Reset demo data
app.post('/api/contracts/reset-demo', (_req, res) => {
  contractsStore = [...INITIAL_CONTRACTS];
  saveContracts(contractsStore);
  res.json({ success: true, contracts: contractsStore, message: 'Reset to initial sample contracts' });
});

// Create contract (Admin)
app.post('/api/contracts', (req, res) => {
  const payload: CreateContractPayload = req.body;
  
  if (!payload.title || !payload.description || !payload.termsAndConditions) {
    return res.status(400).json({ success: false, error: 'Title, description, and terms are required' });
  }

  const id = `cnt_${Math.random().toString(36).substring(2, 8)}`;
  const token = `tok_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString(36)}`;
  const now = new Date().toISOString();

  const newContract: Contract = {
    id,
    signingToken: token,
    title: payload.title,
    category: payload.category || 'General Service',
    description: payload.description,
    termsAndConditions: payload.termsAndConditions,
    totalCost: Number(payload.totalCost) || 0,
    depositAmount: Number(payload.depositAmount) || 0,
    currency: payload.currency || 'USD',
    deliveryDate: payload.deliveryDate || '',
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
        details: `Contract created by ${payload.adminParty?.name || 'Admin'}.`,
      },
      {
        timestamp: now,
        action: 'Secure Link Activated',
        actor: 'Admin',
        details: `Signing token generated (${token}).`,
      }
    ],
  };

  contractsStore.unshift(newContract);
  saveContracts(contractsStore);

  return res.status(201).json({ success: true, contract: newContract });
});

// Get contract by ID or token (Client / Admin)
app.get('/api/contracts/:idOrToken', (req, res) => {
  const { idOrToken } = req.params;
  
  const contract = contractsStore.find(
    (c) => c.id === idOrToken || c.signingToken === idOrToken
  );

  if (!contract) {
    return res.status(404).json({ success: false, error: 'Contract not found or invalid link.' });
  }

  // Increment access count
  contract.accessCount = (contract.accessCount || 0) + 1;
  const now = new Date().toISOString();
  
  // Log access audit event if client accesses token
  if (req.query.isClient === 'true') {
    contract.auditTrail.push({
      timestamp: now,
      action: 'Client Portal Accessed',
      actor: 'Client',
      details: 'Contract link opened in browser',
      ipAddress: req.ip,
    });
  }
  
  saveContracts(contractsStore);

  return res.json({ success: true, contract });
});

// Sign contract (Client action)
app.post('/api/contracts/:idOrToken/sign', (req, res) => {
  const { idOrToken } = req.params;
  const payload: SignContractPayload = req.body;

  const contract = contractsStore.find(
    (c) => c.id === idOrToken || c.signingToken === idOrToken
  );

  if (!contract) {
    return res.status(404).json({ success: false, error: 'Contract not found.' });
  }

  if (contract.status === 'completed' || contract.linkInvalidated) {
    return res.status(400).json({ 
      success: false, 
      error: 'This contract has already been signed or the link has been invalidated.' 
    });
  }

  if (!payload.signatureDataUrl) {
    return res.status(400).json({ success: false, error: 'Digital signature is required.' });
  }

  const now = new Date().toISOString();
  const clientIp = req.ip || req.socket.remoteAddress || '127.0.0.1';

  contract.clientParty = {
    name: payload.clientName || contract.clientParty.name || 'Client',
    email: payload.clientEmail || contract.clientParty.email || '',
    company: payload.clientCompany || contract.clientParty.company || '',
    title: payload.clientTitle || contract.clientParty.title || '',
    phone: payload.clientPhone || contract.clientParty.phone || '',
    address: payload.clientAddress || contract.clientParty.address || '',
    signature: payload.signatureDataUrl,
    signedAt: now,
    ipAddress: clientIp,
  };

  contract.status = 'completed';
  contract.completedAt = now;
  contract.updatedAt = now;
  contract.linkInvalidated = true; // Invalidate link after client submits!

  contract.auditTrail.push({
    timestamp: now,
    action: 'Contract Digitally Signed & Invalidation Triggered',
    actor: 'Client',
    ipAddress: clientIp,
    details: `Signed by ${payload.clientName} (${payload.clientEmail}). Unique link linkInvalidated = true.`,
  });

  saveContracts(contractsStore);

  return res.json({ 
    success: true, 
    contract, 
    message: 'Contract successfully signed and stored! Non-editable PDF record generated.' 
  });
});

// Invalidate link manually (Admin)
app.post('/api/contracts/:id/invalidate', (req, res) => {
  const { id } = req.params;
  const contract = contractsStore.find((c) => c.id === id);

  if (!contract) {
    return res.status(404).json({ success: false, error: 'Contract not found' });
  }

  contract.linkInvalidated = true;
  contract.status = contract.status === 'completed' ? 'completed' : 'invalidated';
  contract.updatedAt = new Date().toISOString();

  contract.auditTrail.push({
    timestamp: new Date().toISOString(),
    action: 'Signing Link Revoked/Invalidated',
    actor: 'Admin',
    details: 'Admin manually revoked access to this signing link.',
  });

  saveContracts(contractsStore);
  return res.json({ success: true, contract });
});

// Delete contract
app.delete('/api/contracts/:id', (req, res) => {
  const { id } = req.params;
  contractsStore = contractsStore.filter((c) => c.id !== id);
  saveContracts(contractsStore);
  return res.json({ success: true, message: 'Contract deleted' });
});


// Start Vite / Express server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
