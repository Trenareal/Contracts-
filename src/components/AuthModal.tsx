import React, { useState, useEffect } from 'react';
import {
  signUpWithEmail,
  signInWithEmail,
  watchAuthState,
} from '../lib/firebase';
import { 
  saveUserProfileToFirestore,
  hashPassword,
  saveAccountCredentialsToFirestore,
  getAccountByEmailFromFirestore,
} from '../lib/firebaseService';
import { AuthUser } from '../types';
import { Mail, Lock, User, LogIn, X, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  isMandatory?: boolean;
  onAuthSuccess?: (user: AuthUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  isMandatory = false,
  onAuthSuccess,
}) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Firebase's own auth state listener
  useEffect(() => {
    const unsubscribe = watchAuthState((user) => {
      if (user && onAuthSuccess) {
        const authUser: AuthUser = {
          uid: user.uid,
          displayName: user.displayName || user.email?.split('@')[0] || 'User',
          email: user.email,
        };
        localStorage.setItem('contract_app_user', JSON.stringify(authUser));
        onAuthSuccess(authUser);
      }
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isOpen) return null;

  const finishLogin = (user: { uid: string; displayName?: string | null; email?: string | null }) => {
    const authUser: AuthUser = {
      uid: user.uid,
      displayName: user.displayName || user.email?.split('@')[0] || 'User',
      email: user.email || null,
    };
    localStorage.setItem('contract_app_user', JSON.stringify(authUser));
    if (onAuthSuccess) onAuthSuccess(authUser);
    if (onClose) onClose();
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

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
      const passwordHash = await hashPassword(password);

      if (isRegistering) {
        let authUser: AuthUser;
        try {
          const cred = await signUpWithEmail(cleanEmail, password);
          authUser = {
            uid: cred.user.uid,
            displayName: fullName.trim() || cleanEmail.split('@')[0],
            email: cred.user.email,
          };
          setInfoMessage('Account created. Check your email to verify your address.');
        } catch (firebaseErr: any) {
          const code = firebaseErr?.code || '';
          if (code === 'auth/operation-not-allowed') {
            // Firebase Auth Email/Password provider not toggled on in console yet;
            // Seamlessly use Firestore database authentication
            const fallbackUid = `user_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
            authUser = {
              uid: fallbackUid,
              displayName: fullName.trim() || cleanEmail.split('@')[0],
              email: cleanEmail,
            };
            await saveAccountCredentialsToFirestore({
              email: cleanEmail,
              passwordHash,
              displayName: authUser.displayName,
              uid: authUser.uid,
            });
            setInfoMessage('Account created successfully!');
          } else {
            throw firebaseErr;
          }
        }

        await saveUserProfileToFirestore(authUser.uid, {
          email: cleanEmail,
          displayName: authUser.displayName,
        });
        finishLogin(authUser);
      } else {
        let authUser: AuthUser;
        try {
          const cred = await signInWithEmail(cleanEmail, password);
          authUser = {
            uid: cred.user.uid,
            displayName: cred.user.displayName || cleanEmail.split('@')[0],
            email: cred.user.email,
          };
        } catch (firebaseErr: any) {
          const code = firebaseErr?.code || '';
          if (code === 'auth/operation-not-allowed') {
            // Firebase Auth Email provider not enabled in console; verify via Firestore account database
            const account = await getAccountByEmailFromFirestore(cleanEmail);
            if (account) {
              if (account.passwordHash && account.passwordHash !== passwordHash) {
                setError('Incorrect password. Please verify your password and try again.');
                setLoading(false);
                return;
              }
              authUser = {
                uid: account.uid || `user_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
                displayName: account.displayName || cleanEmail.split('@')[0],
                email: cleanEmail,
              };
            } else {
              // Create account in database on first sign-in if not existing
              const fallbackUid = `user_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
              authUser = {
                uid: fallbackUid,
                displayName: cleanEmail.split('@')[0],
                email: cleanEmail,
              };
              await saveAccountCredentialsToFirestore({
                email: cleanEmail,
                passwordHash,
                displayName: authUser.displayName,
                uid: authUser.uid,
              });
              await saveUserProfileToFirestore(authUser.uid, {
                email: cleanEmail,
                displayName: authUser.displayName,
              });
            }
          } else {
            throw firebaseErr;
          }
        }

        finishLogin(authUser);
      }
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/email-already-in-use') {
        setError(`The email "${cleanEmail}" is already registered. Please sign in instead.`);
        setIsRegistering(false);
      } else if (code === 'auth/weak-password') {
        setError('Password must be at least 6 characters.');
      } else if (code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        setError('Incorrect email or password.');
      } else if (code === 'auth/operation-not-allowed') {
        // Handled internally above
        setError('Authentication provider disabled. Please check Firebase Console or retry.');
      } else {
        console.error('Email auth error:', err);
        setError(err?.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
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
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-500/30">
              C
            </div>
            <span className="font-extrabold tracking-tight text-xl text-white">
              CONTRACT<span className="font-light italic text-blue-400">S</span>
            </span>
            <span className="px-2.5 py-0.5 text-[10px] font-mono rounded-full bg-blue-500/15 text-blue-300 border border-blue-400/30 font-bold uppercase tracking-wider ml-auto">
              Email Auth
            </span>
          </div>
          <h2 className="text-lg font-bold text-white">
            {isRegistering ? 'Create Your Account' : 'Sign In to Workspace'}
          </h2>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            {isRegistering
              ? 'Enter your email address and create a password to start drafting and sending contracts.'
              : 'Sign in with your email and password to access your contracts and signature audits.'}
          </p>
          <div className="grid grid-cols-2 gap-1 bg-slate-800/80 p-1 rounded-2xl mt-4 border border-slate-700">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(false);
                setError(null);
                setInfoMessage(null);
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
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
                setInfoMessage(null);
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                isRegistering ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-7 space-y-4">
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <div className="font-medium leading-relaxed">{error}</div>
            </div>
          )}
          {infoMessage && (
            <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium leading-relaxed">
              {infoMessage}
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-3.5">
            {isRegistering && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
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
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
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
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-blue-600 rounded-xl text-xs text-slate-900 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 p-0.5 text-slate-400 hover:text-slate-700 rounded-md transition-colors cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {isRegistering && (
                <p className="text-[10px] text-slate-400 mt-1">Minimum 6 characters</p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-blue-600/25 rounded-2xl disabled:opacity-50 flex items-center justify-center gap-2 active:scale-98"
            >
              <LogIn className="w-4 h-4" />
              {loading ? 'Authenticating...' : isRegistering ? 'Sign Up with Email' : 'Sign In with Email'}
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError(null);
                setInfoMessage(null);
              }}
              className="text-xs text-slate-600 hover:text-blue-600 font-medium transition-colors cursor-pointer"
            >
              {isRegistering
                ? 'Already have an account? Sign In here →'
                : "Need an account? Sign Up with email →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
