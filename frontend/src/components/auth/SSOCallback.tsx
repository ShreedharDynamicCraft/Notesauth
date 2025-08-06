import { useAuth, AuthenticateWithRedirectCallback } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import type { RegistrationStep } from '../../types/auth';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ProgressBar } from '../shared/ProgressBar';

export function SSOCallback() {
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState('Connecting...');
  const [isComplete, setIsComplete] = useState(false);
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isLoaded) {
      setProgress(15);
      setStep('Connecting to authentication server...');
    } else if (!isSignedIn) {
      setProgress(65);
      setStep('Creating your account... This may take a moment');
    } else {
      setProgress(100);
      setStep('Account created successfully!');
      setIsComplete(true);
      setTimeout(() => {
        window.location.href = window.location.origin;
      }, 800);
    }
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    if (!isComplete && !isLoaded) {
      const registrationSteps: RegistrationStep[] = [
        { delay: 1000, progress: 25, message: 'Verifying your identity...' },
        { delay: 2000, progress: 45, message: 'Setting up your profile...' },
        { delay: 3500, progress: 70, message: 'Finalizing account creation...' },
        { delay: 5000, progress: 85, message: 'Almost ready...' }
      ];

      registrationSteps.forEach(({ delay, progress, message }) => {
        setTimeout(() => {
          if (!isComplete) {
            setProgress(progress);
            setStep(message);
          }
        }, delay);
      });
    }
  }, [isComplete, isLoaded]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-violet-400 via-purple-500 to-blue-600 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-xl"></div>
      </div>

      <div className="relative z-10 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 text-center max-w-sm w-full mx-4 border border-white/20">
        <div className="mb-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25">
            {isComplete ? (
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2">
          {isComplete ? 'Welcome to Notes App! 🎉' : 'Creating Your Account'}
        </h2>

        <p className="text-gray-600 font-medium mb-6">
          {step}
        </p>

        {!isComplete && (
          <div className="text-xs text-gray-500 mb-4">
            New user detected - Setting up your personalized experience
          </div>
        )}

        <ProgressBar progress={progress} showPercentage={true} className="mb-6" />

        {!isComplete && (
          <div className="flex justify-center mb-4">
            <LoadingSpinner size="lg" color="border-purple-200 border-t-purple-500" />
          </div>
        )}

        {isComplete && (
          <div className="space-y-2">
            <div className="text-sm text-green-600 font-medium">
              ✅ Account created successfully!
            </div>
            <div className="text-xs text-gray-500">
              Redirecting to your dashboard...
            </div>
          </div>
        )}

        <AuthenticateWithRedirectCallback 
          afterSignInUrl={window.location.origin}
          afterSignUpUrl={window.location.origin}
          continueSignUpUrl={window.location.origin}
        />
      </div>
    </div>
  );
}
