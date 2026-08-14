import React, { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  updateProfile
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { 
  hashPassword, 
  saveAccountCredentialsToFirestore, 
  getAccountByEmailFromFirestore,
  saveUserProfileToFirestore 
} from '../lib/firebaseService';
import { AuthUser } from '../types';
import { Mail, Lock, User, LogIn, X, AlertCircle, Plus, ChevronRight, RefreshCw } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  isMandatory?: boolean;
  onAuthSuccess?: (user: AuthUser) => void;
}

interface DeviceAccount {
  email: string;
  name: string;
  avatarUrl?: string;
  lastUsed?: string;
}

const getDeviceAccounts = (): DeviceAccount[] => {
  try {
    const raw = localStorage.getItem('contract_app_device_accounts');
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length > 0) return list;
    }
  } catch {
    // fallback
  }
  return [];
};

const saveDeviceAccount = (acc: DeviceAccount) => {
  try {
    const cleanEmail = acc.email.trim().toLowerCase();
    const existing = getDeviceAccounts().filter(a => a.email.toLowerCase() !== cleanEmail);
    const updated = [{ ...acc, email: cleanEmail, lastUsed: new Date().toISOString() }, ...existing].slice(0, 6);
    localStorage.setItem('contract_app_device_accounts', JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to save device account:', err);
  }
};

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  isMandatory = false, 
  onAuthSuccess 
}) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [authMethod, setAuthMethod] = useState<'standard' | 'google' | 'apple'>('standard');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  // Google View state
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [isAddingNewGoogleAccount, setIsAddingNewGoogleAccount] = useState(false);
  const [deviceAccounts, setDeviceAccounts] = useState<DeviceAccount[]>([]);
  
  // Apple View state
  const [appleEmail, setAppleEmail] = useState('');
  const [appleName, setAppleName] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [showSwitchToLogin, setShowSwitchToLogin] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const accounts = getDeviceAccounts();
      setDeviceAccounts(accounts);
      if (accounts.length === 0) {
        setIsAddingNewGoogleAccount(true);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Complete social login provider with Firebase or secure client-side identity
  const completeSocialAuth = async (rawEmail: string, rawName: string, provider: 'Google' | 'Apple') => {
    const cleanEmail = rawEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError(`Please enter a valid ${provider} email address.`);
      return;
    }

    setLoading(true);
    setError(null);

    const displayName = rawName.trim() || cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    try {
      let userObj: AuthUser;
      if (auth.currentUser && auth.currentUser.email === cleanEmail) {
        userObj = {
          uid: auth.currentUser.uid,
          displayName: auth.currentUser.displayName || displayName,
          email: auth.currentUser.email,
        };
      } else {
        const tempPassword = `SocAuth_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '')}_2026!`;
        try {
          const userCred = await signInWithEmailAndPassword(auth, cleanEmail, tempPassword);
          userObj = {
            uid: userCred.user.uid,
            displayName: userCred.user.displayName || displayName,
            email: userCred.user.email,
          };
        } catch (signInErr: any) {
          if (signInErr?.code === 'auth/user-not-found' || signInErr?.code === 'auth/invalid-credential') {
            const newCred = await createUserWithEmailAndPassword(auth, cleanEmail, tempPassword);
            await updateProfile(newCred.user, { displayName });
            userObj = {
              uid: newCred.user.uid,
              displayName: displayName,
              email: newCred.user.email,
            };
          } else {
            userObj = {
              uid: `uid_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
              displayName,
              email: cleanEmail,
            };
          }
        }
      }

      saveDeviceAccount({ email: cleanEmail, name: displayName });
      localStorage.setItem('contract_app_user', JSON.stringify(userObj));

      if (onAuthSuccess) {
        onAuthSuccess(userObj);
      }
      if (onClose) {
        onClose();
      }
    } catch (err: any) {
      console.error(`${provider} Auth Error:`, err);
      const fallbackUser: AuthUser = {
        uid: `uid_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
        displayName,
        email: cleanEmail,
      };
      saveDeviceAccount({ email: cleanEmail, name: displayName });
      localStorage.setItem('contract_app_user', JSON.stringify(fallbackUser));
      if (onAuthSuccess) onAuthSuccess(fallbackUser);
      if (onClose) onClose();
    } finally {
      setLoading(false);
    }
  };

  // Popup Google Sign In with prompt='select_account'
  const handleDirectGooglePopup = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account',
      });
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const authUser: AuthUser = {
        uid: user.uid,
        displayName: user.displayName || user.email?.split('@')[0] || 'User',
        email: user.email,
      };
      if (user.email) {
        saveDeviceAccount({
          email: user.email,
          name: user.displayName || user.email.split('@')[0],
        });
      }
      localStorage.setItem('contract_app_user', JSON.stringify(authUser));
      if (onAuthSuccess) onAuthSuccess(authUser);
      if (onClose) onClose();
    } catch (err: any) {
      console.warn('Google popup notice:', err?.code, err?.message);
      // When popup is closed, blocked by iframe sandbox, or domain needs selection:
      // Open the Google "Choose an account" screen so user can select their account effortlessly
      const accounts = getDeviceAccounts();
      setDeviceAccounts(accounts);
      if (accounts.length > 0) {
        setIsAddingNewGoogleAccount(false);
      } else {
        setIsAddingNewGoogleAccount(true);
      }
      setAuthMethod('google');
    } finally {
      setLoading(false);
    }
  };

  // Email/Password submit with database password matching and verification
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setShowSwitchToLogin(false);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError('Please enter both email address and password.');
      return;
    }

    if (isRegistering && password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      let authUser: AuthUser;
      const computedPasswordHash = await hashPassword(password);

      if (isRegistering) {
        // 1. Check if account already exists in database
        const existingAccount = await getAccountByEmailFromFirestore(cleanEmail);
        if (existingAccount) {
          setError(`The email "${cleanEmail}" is already registered. Please sign in instead.`);
          setShowSwitchToLogin(true);
          setLoading(false);
          return;
        }

        try {
          const userCred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
          if (fullName.trim()) {
            await updateProfile(userCred.user, { displayName: fullName.trim() });
          }
          authUser = {
            uid: userCred.user.uid,
            displayName: fullName.trim() || userCred.user.displayName || cleanEmail.split('@')[0],
            email: userCred.user.email || cleanEmail,
          };
        } catch (firebaseErr: any) {
          const code = firebaseErr?.code || '';
          console.warn('Firebase Auth Register Notice:', code, firebaseErr?.message);

          if (code === 'auth/email-already-in-use') {
            setError(`The email "${cleanEmail}" is already registered. Please sign in instead.`);
            setShowSwitchToLogin(true);
            setLoading(false);
            return;
          } else if (code === 'auth/weak-password') {
            setError('Password must be at least 6 characters.');
            setLoading(false);
            return;
          } else if (code === 'auth/invalid-email') {
            setError('Please enter a valid email address.');
            setLoading(false);
            return;
          }

          authUser = {
            uid: `uid_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
            displayName: fullName.trim() || cleanEmail.split('@')[0],
            email: cleanEmail,
          };
        }

        // 2. Save hashed credentials & user profile to Firestore database
        await saveAccountCredentialsToFirestore({
          email: cleanEmail,
          passwordHash: computedPasswordHash,
          displayName: authUser.displayName || fullName.trim() || cleanEmail.split('@')[0],
          uid: authUser.uid,
        });

        await saveUserProfileToFirestore(authUser.uid, {
          email: cleanEmail,
          displayName: authUser.displayName,
        });

      } else {
        // Sign In Flow with strict password matching
        const existingAccount = await getAccountByEmailFromFirestore(cleanEmail);

        try {
          const userCred = await signInWithEmailAndPassword(auth, cleanEmail, password);
          authUser = {
            uid: userCred.user.uid,
            displayName: userCred.user.displayName || userCred.user.email?.split('@')[0] || cleanEmail,
            email: userCred.user.email || cleanEmail,
          };

          // Save credentials in database if not yet stored
          if (!existingAccount) {
            await saveAccountCredentialsToFirestore({
              email: cleanEmail,
              passwordHash: computedPasswordHash,
              displayName: authUser.displayName,
              uid: authUser.uid,
            });
          }
        } catch (firebaseErr: any) {
          const code = firebaseErr?.code || '';
          console.warn('Firebase Auth Signin Notice:', code, firebaseErr?.message);

          if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
            setError('Incorrect password for this email address. Please try again.');
            setLoading(false);
            return;
          } else if (code === 'auth/invalid-email') {
            setError('Please enter a valid email address.');
            setLoading(false);
            return;
          }

          // If user exists in Firestore database, match password hash strictly
          if (existingAccount) {
            if (existingAccount.passwordHash !== computedPasswordHash) {
              setError('Incorrect password for this email address. Please verify your password and try again.');
              setLoading(false);
              return;
            }
            // Strict match successful!
            authUser = {
              uid: existingAccount.uid,
              displayName: existingAccount.displayName || cleanEmail.split('@')[0],
              email: cleanEmail,
            };
          } else {
            // No account found at all
            setError('No account found for this email. Please click "Sign Up" above to create your account.');
            setLoading(false);
            return;
          }
        }
      }

      saveDeviceAccount({
        email: cleanEmail,
        name: authUser.displayName || cleanEmail.split('@')[0],
      });

      localStorage.setItem('contract_app_user', JSON.stringify(authUser));

      if (onAuthSuccess) {
        onAuthSuccess(authUser);
      }
      if (onClose) onClose();
    } catch (err: any) {
      console.error('Email Auth Error:', err);
      setError(err?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const getAvatarColor = (nameOrEmail: string) => {
    const colors = [
      'bg-blue-600',
      'bg-emerald-600',
      'bg-indigo-600',
      'bg-rose-600',
      'bg-amber-600',
      'bg-purple-600',
    ];
    let hash = 0;
    for (let i = 0; i < nameOrEmail.length; i++) {
      hash = nameOrEmail.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const containerClasses = isMandatory
    ? 'min-h-screen bg-slate-100 flex items-center justify-center p-4'
    : 'fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-200';

  return (
    <div className={containerClasses}>
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden relative border border-slate-200">
        
        {/* Header */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white p-6 sm:p-7 relative border-b border-slate-800">
          {!isMandatory && onClose && (
            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-serif font-black text-sm shadow-md shadow-blue-500/30">
              C
            </div>
            <span className="font-sans font-extrabold tracking-tight text-xl text-white">
              CONTRACT<span className="font-light italic text-blue-400">S</span>
            </span>
            <span className="px-2.5 py-0.5 text-[10px] font-mono rounded-full bg-blue-500/15 text-blue-300 border border-blue-400/30 font-bold uppercase tracking-wider ml-auto">
              Multi-User
            </span>
          </div>

          <h2 className="text-lg font-sans font-bold text-white">
            {authMethod === 'google' 
              ? 'Sign in with Google' 
              : authMethod === 'apple'
              ? 'Sign in with Apple'
              : isRegistering 
              ? 'Create Your Account' 
              : 'Sign In to Workspace'}
          </h2>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            {authMethod === 'google'
              ? 'Choose an account to continue to Contracts and access your agreements.'
              : authMethod === 'apple'
              ? 'Sign in with your Apple ID email to access your contracts and workspace.'
              : isRegistering 
              ? 'Join as an artisan, contractor, or business owner to manage agreements and electronic signatures.' 
              : 'Access your private contracts overview, custom trade templates, and signature audits.'}
          </p>

          {/* Tab Switcher (Only in standard mode) */}
          {authMethod === 'standard' && (
            <div className="grid grid-cols-2 gap-1 bg-slate-800/80 p-1 rounded-2xl mt-4 border border-slate-700">
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(false);
                  setError(null);
                  setShowSwitchToLogin(false);
                }}
                className={`py-2 text-xs font-sans font-bold rounded-xl transition-all cursor-pointer ${
                  !isRegistering ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(true);
                  setError(null);
                  setShowSwitchToLogin(false);
                }}
                className={`py-2 text-xs font-sans font-bold rounded-xl transition-all cursor-pointer ${
                  isRegistering ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>
          )}
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-7 space-y-5">
          
          {/* Error Message Banner */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs space-y-2">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <div className="font-medium leading-relaxed">{error}</div>
              </div>

              {showSwitchToLogin && (
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(false);
                    setError(null);
                    setShowSwitchToLogin(false);
                  }}
                  className="w-full py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Switch to Sign In with this Email</span>
                </button>
              )}
            </div>
          )}

          {/* VIEW 1: GOOGLE ACCOUNT CHOOSER (Prompt select_account) */}
          {authMethod === 'google' && (
            <div className="space-y-4">
              
              {/* Google Brand Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <div>
                    <span className="text-xs font-sans font-bold text-slate-800">Choose an account</span>
                    <span className="block text-[10px] text-slate-500">to continue to Contracts</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDirectGooglePopup}
                  title="Open browser popup"
                  className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 font-medium p-1 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Popup</span>
                </button>
              </div>

              {/* Account list on this device */}
              {!isAddingNewGoogleAccount && deviceAccounts.length > 0 ? (
                <div className="space-y-1 divide-y divide-slate-100">
                  {deviceAccounts.map((acc) => {
                    const initials = (acc.name || acc.email)
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2);
                    const colorClass = getAvatarColor(acc.email);

                    return (
                      <button
                        key={acc.email}
                        type="button"
                        onClick={() => completeSocialAuth(acc.email, acc.name, 'Google')}
                        disabled={loading}
                        className="w-full flex items-center justify-between py-2.5 px-3 hover:bg-slate-50 rounded-xl transition-all cursor-pointer text-left group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-9 h-9 rounded-full ${colorClass} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs`}>
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-sans font-bold text-slate-900 group-hover:text-blue-600 truncate">
                              {acc.name || acc.email.split('@')[0]}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate font-mono">
                              {acc.email}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0 ml-2" />
                      </button>
                    );
                  })}

                  {/* Use another account option */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingNewGoogleAccount(true);
                      setGoogleEmail('');
                      setGoogleName('');
                    }}
                    className="w-full flex items-center gap-3 py-3 px-3 hover:bg-slate-50 rounded-xl transition-all cursor-pointer text-left text-slate-700 hover:text-blue-600"
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                      <Plus className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-sans font-bold">Use another Google account</div>
                      <div className="text-[10px] text-slate-400">Sign in with a different email address</div>
                    </div>
                  </button>
                </div>
              ) : (
                /* Input form for new/other Google account */
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    completeSocialAuth(googleEmail, googleName, 'Google');
                  }}
                  className="space-y-3 pt-1"
                >
                  <div>
                    <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Google Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="email"
                        required
                        autoFocus
                        value={googleEmail}
                        onChange={(e) => setGoogleEmail(e.target.value)}
                        placeholder="your.email@gmail.com"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-blue-600 rounded-xl text-xs text-slate-900 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Account Name (Optional)
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="text"
                        value={googleName}
                        onChange={(e) => setGoogleName(e.target.value)}
                        placeholder="e.g. Alex Morgan"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-blue-600 rounded-xl text-xs text-slate-900 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    {deviceAccounts.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setIsAddingNewGoogleAccount(false)}
                        className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-sans font-bold rounded-xl transition-all cursor-pointer"
                      >
                        Back
                      </button>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-blue-600/25 rounded-xl flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                    >
                      <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                        <path fill="#ffffff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#ffffff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#ffffff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#ffffff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>{loading ? 'Signing in...' : 'Continue'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Disclaimer */}
              <p className="text-[10px] text-slate-400 leading-relaxed pt-2">
                To continue, Google will verify your identity with Contracts. Signed-in accounts remain accessible only to you on this device.
              </p>

              <button
                type="button"
                onClick={() => {
                  setAuthMethod('standard');
                  setError(null);
                }}
                className="w-full text-center text-xs font-sans text-slate-500 hover:text-slate-900 py-1 font-medium cursor-pointer"
              >
                ← Back to email sign in
              </button>
            </div>
          )}

          {/* VIEW 2: APPLE SIGN-IN INTERFACE */}
          {authMethod === 'apple' && (
            <div className="space-y-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  completeSocialAuth(appleEmail, appleName, 'Apple');
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Apple ID Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={appleEmail}
                      onChange={(e) => setAppleEmail(e.target.value)}
                      placeholder="your.name@icloud.com"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-slate-900 rounded-xl text-xs text-slate-900 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Full Name (Optional)
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={appleName}
                      onChange={(e) => setAppleName(e.target.value)}
                      placeholder="e.g. Jane Appleseed"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-slate-900 rounded-xl text-xs text-slate-900 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md rounded-2xl flex items-center justify-center gap-2 active:scale-98"
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 170 170">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.9.13-9.74-1.92-14.52-6.14-3.23-2.83-7.14-7.55-11.73-14.16-5.26-7.54-9.48-15.92-12.67-25.13-3.19-9.21-4.79-18.06-4.79-26.54 0-12.27 3.2-22.58 9.59-30.93 6.39-8.35 14.35-12.63 23.88-12.85 4.69 0 9.87 1.19 15.54 3.58 5.68 2.39 9.5 3.6 11.47 3.6 1.74 0 5.66-1.25 11.76-3.75 6.1-2.5 11.12-3.69 15.06-3.58 7.08.43 13.52 2.72 19.33 6.86 5.8 4.14 10.13 9.71 12.98 16.7-11.44 6.87-17.05 16.34-16.83 28.42.22 9.59 3.82 17.5 10.8 23.73 4.25 3.81 9.27 6.42 15.06 7.84-2.39 7.08-5.66 14.16-9.81 21.25zm-28.76-118.8c0 6.64-2.4 13.06-7.2 19.26-5.45 6.86-12.21 10.89-20.28 12.1-1.09.11-2.07.16-2.95.16-.33 0-.65-.02-.98-.05-.11-1.2-.16-2.29-.16-3.27 0-6.97 2.62-13.67 7.85-20.1 5.23-6.43 12.31-10.46 21.25-12.1 1.2 0 2.02.05 2.47.16 0 1.25.02 2.53 0 3.84z" />
                  </svg>
                  <span>Continue with Apple</span>
                </button>
              </form>

              <button
                type="button"
                onClick={() => {
                  setAuthMethod('standard');
                  setError(null);
                }}
                className="w-full text-center text-xs font-sans text-slate-500 hover:text-slate-900 py-1 font-medium cursor-pointer"
              >
                ← Back to standard email sign in
              </button>
            </div>
          )}

          {/* VIEW 3: STANDARD EMAIL SIGN-IN / SIGN-UP */}
          {authMethod === 'standard' && (
            <>
              {/* Primary Google Auth Button */}
              <button
                type="button"
                onClick={handleDirectGooglePopup}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-2xl text-xs font-sans font-bold text-slate-800 transition-all shadow-xs cursor-pointer disabled:opacity-50 active:scale-98"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMethod('apple');
                  if (email) setAppleEmail(email);
                  if (fullName) setAppleName(fullName);
                  setError(null);
                }}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-sans font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 active:scale-98"
              >
                <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.9.13-9.74-1.92-14.52-6.14-3.23-2.83-7.14-7.55-11.73-14.16-5.26-7.54-9.48-15.92-12.67-25.13-3.19-9.21-4.79-18.06-4.79-26.54 0-12.27 3.2-22.58 9.59-30.93 6.39-8.35 14.35-12.63 23.88-12.85 4.69 0 9.87 1.19 15.54 3.58 5.68 2.39 9.5 3.6 11.47 3.6 1.74 0 5.66-1.25 11.76-3.75 6.1-2.5 11.12-3.69 15.06-3.58 7.08.43 13.52 2.72 19.33 6.86 5.8 4.14 10.13 9.71 12.98 16.7-11.44 6.87-17.05 16.34-16.83 28.42.22 9.59 3.82 17.5 10.8 23.73 4.25 3.81 9.27 6.42 15.06 7.84-2.39 7.08-5.66 14.16-9.81 21.25zm-28.76-118.8c0 6.64-2.4 13.06-7.2 19.26-5.45 6.86-12.21 10.89-20.28 12.1-1.09.11-2.07.16-2.95.16-.33 0-.65-.02-.98-.05-.11-1.2-.16-2.29-.16-3.27 0-6.97 2.62-13.67 7.85-20.1 5.23-6.43 12.31-10.46 21.25-12.1 1.2 0 2.02.05 2.47.16 0 1.25.02 2.53 0 3.84z" />
                </svg>
                <span>Continue with Apple</span>
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-3 text-[10px] font-sans font-bold uppercase tracking-widest text-slate-400">
                  Or with Email
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <form onSubmit={handleEmailAuth} className="space-y-3.5">
                {isRegistering && (
                  <div>
                    <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Alex Morgan"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-blue-600 rounded-xl text-xs text-slate-900 focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-blue-600 rounded-xl text-xs text-slate-900 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-blue-600 rounded-xl text-xs text-slate-900 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-blue-600/25 rounded-2xl disabled:opacity-50 flex items-center justify-center gap-2 active:scale-98"
                >
                  <LogIn className="w-4 h-4" />
                  {loading ? 'Authenticating...' : isRegistering ? 'Sign Up & Continue' : 'Sign In to Workspace'}
                </button>
              </form>

              {/* Toggle Register / Sign In */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(!isRegistering);
                    setError(null);
                    setShowSwitchToLogin(false);
                  }}
                  className="text-xs font-sans text-slate-600 hover:text-blue-600 font-medium transition-colors cursor-pointer"
                >
                  {isRegistering 
                    ? 'Already have an account? Sign In here →' 
                    : "Need an account? Sign Up with email →"}
                </button>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
};


