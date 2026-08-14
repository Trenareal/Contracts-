import { Contract } from '../types';

export const INITIAL_CONTRACTS: Contract[] = [
  {
    id: 'cnt_8f91a2',
    signingToken: 'tok_web_dev_2026_x89a',
    title: 'Custom Web Application & AI Integration Agreement',
    category: 'Software Engineering',
    description: `PROVIDER agrees to design, build, and deploy a full-stack web application with responsive UI, secure server endpoints, cloud persistence, and AI API integration according to the specification.

Key Deliverables:
- Interactive Web App Frontend (React + Tailwind CSS)
- Express API Backend with Cloud Persistence
- Integrated E-Signature Suite and PDF Export System
- User Documentation & Deployment Support`,
    termsAndConditions: `1. OBLIGATIONS: Provider will execute deliverables in professional alignment with project milestones.
2. PAYMENT TERMS: Client agrees to pay the Initial Deposit in Nigerian Naira (₦) before initiation of work. The remaining balance shall be paid upon final sign-off and live deployment.
3. INTELLECTUAL PROPERTY: Upon final payment clearance, full ownership of custom source code and assets shall transfer to the Client.
4. CONFIDENTIALITY: Both parties agree to protect proprietary data shared during the lifecycle of this agreement.
5. TERMINATION: Either party may terminate with 7 days written notice, provided completed work is compensated pro-rata.`,
    totalCost: 7500000,
    depositAmount: 3000000,
    currency: 'NGN',
    deliveryDate: '2026-09-15',
    adminParty: {
      name: 'Alex Mercer',
      email: 'alex.mercer@apexstudio.ng',
      company: 'Apex Digital Studios Nigeria',
      title: 'Managing Director & Lead Architect',
      phone: '+234 803 123 4567',
      address: '15 Victoria Island, Lagos, Nigeria',
      signature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="80"><path d="M 10 50 Q 30 10 50 45 T 90 35 T 130 55 T 180 30 T 220 50 T 270 40" stroke="%231e3a8a" stroke-width="3" fill="none" stroke-linecap="round"/><text x="15" y="70" font-family="cursive" font-size="18" fill="%231e3a8a">Alex Mercer (Admin)</text></svg>',
      signedAt: '2026-07-28T10:00:00.000Z',
    },
    clientParty: {
      name: 'Sarah Jenkins',
      email: 'sjenkins@horizonventures.ng',
      company: 'Horizon Ventures Ltd.',
      title: 'VP of Operations',
      phone: '+234 802 987 6543',
    },
    status: 'pending_signature',
    createdAt: '2026-07-28T10:00:00.000Z',
    updatedAt: '2026-07-28T10:05:00.000Z',
    linkInvalidated: false,
    accessCount: 2,
    auditTrail: [
      {
        timestamp: '2026-07-28T10:00:00.000Z',
        action: 'Contract Created',
        actor: 'Admin',
        details: 'Initial draft created by Alex Mercer in NGN',
      },
      {
        timestamp: '2026-07-28T10:05:00.000Z',
        action: 'Signing Link Generated',
        actor: 'Admin',
        details: 'Unique token tok_web_dev_2026_x89a dispatched to client',
      },
    ],
  },
  {
    id: 'cnt_3b42c9',
    signingToken: 'tok_brand_design_910c',
    title: 'Brand Identity & Visual Design Systems Contract',
    category: 'Design & Branding',
    description: `Complete visual branding overhaul including logo design, color typography system, component UI library specs, and promotional digital assets.

Scope of Work:
1. Brand Discovery & Competitor Positioning Analysis
2. Primary & Secondary Logo Suite (SVG, PNG, Vector)
3. Design System Guidelines (Typography, Color Palette, Spacing Rules)
4. Social Media Kit & Marketing Design Templates`,
    termsAndConditions: `1. REVISIONS: Includes up to two (2) major revision rounds per deliverable stage. Additional revisions billed at standard hourly rates.
2. DEPOSIT: Initial deposit required in Nigerian Naira (₦) before work commences.
3. IP TRANSFER: Final vector assets delivered upon clearance of total balance.`,
    totalCost: 3200000,
    depositAmount: 1600000,
    currency: 'NGN',
    deliveryDate: '2026-08-30',
    adminParty: {
      name: 'Alex Mercer',
      email: 'alex.mercer@apexstudio.ng',
      company: 'Apex Digital Studios Nigeria',
      title: 'Managing Director & Lead Architect',
      signature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="80"><path d="M 10 50 Q 30 10 50 45 T 90 35 T 130 55 T 180 30 T 220 50 T 270 40" stroke="%231e3a8a" stroke-width="3" fill="none" stroke-linecap="round"/><text x="15" y="70" font-family="cursive" font-size="18" fill="%231e3a8a">Alex Mercer (Admin)</text></svg>',
      signedAt: '2026-07-30T14:20:00.000Z',
    },
    clientParty: {
      name: 'Michael Chukwu',
      email: 'm.chukwu@luminahealth.ng',
      company: 'Lumina Health Tech Nigeria',
    },
    status: 'draft',
    createdAt: '2026-07-30T14:20:00.000Z',
    updatedAt: '2026-07-30T14:20:00.000Z',
    linkInvalidated: false,
    accessCount: 0,
    auditTrail: [
      {
        timestamp: '2026-07-30T14:20:00.000Z',
        action: 'Draft Saved',
        actor: 'Admin',
        details: 'Contract draft prepared in NGN',
      },
    ],
  },
  {
    id: 'cnt_7d19f4',
    signingToken: 'tok_cloud_arch_773e',
    title: 'Enterprise Software Architecture & DevOps Retainer',
    category: 'Consulting',
    description: `Technical consultancy, CI/CD pipeline automation, Cloud infrastructure audit, and security baseline hardening for production infrastructure.

Deliverables Completed:
- AWS/GCP Cloud Architecture Security Audit
- Docker & Kubernetes Orchestration Hardening
- Automated Deployment CI/CD Pipeline Configuration`,
    termsAndConditions: `1. ACCEPTANCE: This agreement represents the finalized terms between both parties in Nigerian Naira (₦).
2. CONFIDENTIALITY: Strictly executed non-disclosure protocol maintained.
3. ARCHIVING: Non-editable PDF record generated and stored in Firebase Cloud Archive.`,
    totalCost: 12000000,
    depositAmount: 5000000,
    currency: 'NGN',
    deliveryDate: '2026-07-15',
    adminParty: {
      name: 'Alex Mercer',
      email: 'alex.mercer@apexstudio.ng',
      company: 'Apex Digital Studios Nigeria',
      title: 'Managing Director',
      phone: '+234 803 123 4567',
      signature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="80"><path d="M 10 50 Q 30 10 50 45 T 90 35 T 130 55 T 180 30 T 220 50 T 270 40" stroke="%231e3a8a" stroke-width="3" fill="none" stroke-linecap="round"/><text x="15" y="70" font-family="cursive" font-size="18" fill="%231e3a8a">Alex Mercer (Admin)</text></svg>',
      signedAt: '2026-07-10T09:00:00.000Z',
    },
    clientParty: {
      name: 'David Adeleke',
      email: 'david@vancetech.ng',
      company: 'Vance Technologies Nigeria',
      title: 'Chief Technology Officer',
      phone: '+234 811 444 8899',
      address: '42 Admiralty Way, Lekki Phase 1, Lagos',
      signature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="80"><path d="M 10 40 C 40 80, 80 10, 120 50 S 180 10, 240 45" stroke="%23047857" stroke-width="3" fill="none"/><text x="15" y="70" font-family="cursive" font-size="18" fill="%23047857">David Adeleke (Client)</text></svg>',
      signedAt: '2026-07-12T16:45:12.000Z',
      ipAddress: '102.89.23.42',
    },
    status: 'completed',
    createdAt: '2026-07-10T09:00:00.000Z',
    updatedAt: '2026-07-12T16:45:12.000Z',
    completedAt: '2026-07-12T16:45:12.000Z',
    linkInvalidated: true,
    accessCount: 4,
    auditTrail: [
      {
        timestamp: '2026-07-10T09:00:00.000Z',
        action: 'Contract Created',
        actor: 'Admin',
      },
      {
        timestamp: '2026-07-10T09:15:00.000Z',
        action: 'Signing Link Sent',
        actor: 'Admin',
      },
      {
        timestamp: '2026-07-12T16:45:12.000Z',
        action: 'Contract Digitally Signed & Invalidated Link',
        actor: 'Client',
        ipAddress: '102.89.23.42',
        details: 'Client David Adeleke electronically signed contract in NGN and verified terms.',
      },
    ],
  },
];
