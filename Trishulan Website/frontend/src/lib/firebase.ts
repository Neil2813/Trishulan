import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const firebaseAuth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export function assertFirebaseConfigured(): void {
  const requiredValues = [
    firebaseConfig.apiKey,
    firebaseConfig.authDomain,
    firebaseConfig.projectId,
    firebaseConfig.appId,
  ];

  if (requiredValues.some((value) => !value)) {
    throw new Error('Firebase is not configured. Add the Firebase web app settings to the frontend environment and restart the app.');
  }
}

export function getFirebaseAuthErrorMessage(error: unknown): string {
  const code =
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
      ? error.code
      : undefined;

  if (error instanceof Error && error.message === 'A verified Firebase email address is required') {
    return 'Verify your email using the link we sent before signing in.';
  }
  if (code === 'auth/invalid-api-key' || code === 'auth/configuration-not-found') {
    return 'Firebase authentication is not configured correctly. Check the Firebase web app settings.';
  }
  if (code === 'auth/popup-closed-by-user') {
    return 'Google sign-in was cancelled before it finished. Select Continue with Google to try again.';
  }
  if (code === 'auth/popup-blocked') {
    return 'Your browser blocked the Google sign-in popup. Allow pop-ups for this site, then try again.';
  }
  if (
    code === 'auth/invalid-credential' ||
    code === 'auth/invalid-login-credentials' ||
    code === 'auth/wrong-password' ||
    code === 'auth/user-not-found'
  ) {
    return 'Incorrect email or password.';
  }
  if (code === 'auth/email-already-in-use') {
    return 'An account with this email already exists. Sign in instead.';
  }
  if (code === 'auth/weak-password') {
    return 'Choose a password with at least 6 characters.';
  }
  if (code === 'auth/too-many-requests') {
    return 'Too many attempts. Wait a little and try again.';
  }
  if (code === 'auth/operation-not-allowed') {
    return 'This sign-in method is disabled in Firebase. Enable it in Firebase Authentication settings.';
  }

  return error instanceof Error ? error.message : 'Firebase sign-in failed. Please try again.';
}

export const getGoogleSignInErrorMessage = getFirebaseAuthErrorMessage;

export { app, firebaseAuth, googleProvider, signInWithPopup };
