import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as fbSignOut
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase/config';

interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmailPassword: (email: string, pass: string) => Promise<void>;
  createAdminAccount: (email: string, pass: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isAdmin: false,
  isSuperAdmin: false,
  loading: true,
  signInWithGoogle: async () => {},
  signInWithEmailPassword: async () => {},
  createAdminAccount: async () => {},
  resetPassword: async () => {},
  logout: async () => {},
});

// Bootstrapped superadmin emails from runtime metadata
const BOOTSTRAPPED_ADMIN_EMAILS = [
  'safiaaamir33@gmail.com',
  'safiyamano980@gmail.com',
  'safiaaamir18@gmail.com'
];

function isBootstrapEmail(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return BOOTSTRAPPED_ADMIN_EMAILS.some((adminEmail) => adminEmail.toLowerCase() === clean);
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const isBootstrap = isBootstrapEmail(user.email);

          // Check admin doc in Firestore
          const adminDocRef = doc(db, 'admins', user.uid);
          const adminSnap = await getDoc(adminDocRef);

          if (adminSnap.exists()) {
            const data = adminSnap.data();
            setIsAdmin(true);
            setIsSuperAdmin(data.role === 'superadmin' || isBootstrap);
          } else if (isBootstrap) {
            // Self-register the bootstrapped authorized email
            await setDoc(adminDocRef, {
              email: user.email,
              name: user.displayName || 'Super Administrator',
              role: 'superadmin',
              createdAt: new Date().toISOString(),
            });
            setIsAdmin(true);
            setIsSuperAdmin(true);
          } else {
            setIsAdmin(false);
            setIsSuperAdmin(false);
          }
        } catch (err) {
          console.warn('Error checking admin record:', err);
          // Fallback to bootstrap email check
          const isBootstrap = isBootstrapEmail(user.email);
          setIsAdmin(isBootstrap);
          setIsSuperAdmin(isBootstrap);
        }
      } else {
        setIsAdmin(false);
        setIsSuperAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  };

  const signInWithEmailPassword = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass);
    } catch (error) {
      console.error('Email sign-in error:', error);
      throw error;
    }
  };

  const createAdminAccount = async (email: string, pass: string) => {
    try {
      const cleanEmail = email.trim();
      const isBootstrap = isBootstrapEmail(cleanEmail);
      if (!isBootstrap) {
        throw new Error('Only authorized administrative email addresses can be registered.');
      }
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      if (cred.user) {
        const adminDocRef = doc(db, 'admins', cred.user.uid);
        await setDoc(adminDocRef, {
          email: cred.user.email,
          name: 'Super Administrator',
          role: 'superadmin',
          createdAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Create admin error:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
    } catch (error) {
      console.error('Sign-out error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin,
        isSuperAdmin,
        loading,
        signInWithGoogle,
        signInWithEmailPassword,
        createAdminAccount,
        resetPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
