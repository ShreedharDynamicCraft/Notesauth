import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { Toaster } from 'react-hot-toast';
import { AuthenticatedWrapper, SignInOptions } from './auth';
import { APP_CONFIG } from '../config/app';

export function AppContent() {
  return (
    <>
      <SignedOut>
        <div className="min-h-screen flex items-center justify-center p-8 gradient-bg">
          <div className="bg-white p-12 rounded-2xl auth-card-shadow text-center max-w-md w-full border border-gray-200">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-karbon-navy tracking-tight">
                {APP_CONFIG.name}
              </h1>
            </div>
         
            <SignInOptions />
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <AuthenticatedWrapper />
      </SignedIn>

      <Toaster 
        position={APP_CONFIG.toast.position} 
        toastOptions={{ duration: APP_CONFIG.toast.duration }} 
      />
    </>
  );
}
