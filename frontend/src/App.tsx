import { ClerkProvider, SignedIn, SignedOut, useAuth, useSignUp } from '@clerk/clerk-react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Dashboard } from './components/Dashboard';
import { NoteDetailView } from './components/NoteDetailView';
import { ThemeProvider } from './contexts/ThemeContext';
import toast from 'react-hot-toast';
import './App.css';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error('Missing Clerk Publishable Key');
}

function AuthenticatedWrapper() {
  const { isSignedIn, userId } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (isSignedIn && userId) {
      // Check if we've already shown the sign-in toast in this session
      const hasShownSignInToast = sessionStorage.getItem('hasShownSignInToast');
      if (!hasShownSignInToast) {
        toast.success('Successfully signed in!');
        sessionStorage.setItem('hasShownSignInToast', 'true');
      }
      setIsInitializing(false);
    }
  }, [isSignedIn, userId]);

  if (isInitializing) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="glass-card rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Setting up your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/note/:noteId" element={<NoteDetailView />} />
    </Routes>
  );
}

function SignInOptions() {
  const { signUp, isLoaded: signUpLoaded } = useSignUp();
  const [isAuthenticating, setIsAuthenticating] = useState<string | null>(null);

  const handleOAuthSignIn = async (provider: 'oauth_google' | 'oauth_github' | 'oauth_linkedin_oidc' | 'oauth_apple') => {
    if (!signUpLoaded) return;
    
    const providerName = provider.replace('oauth_', '').replace('_oidc', '');
    setIsAuthenticating(provider);
    
    try {
      console.log(`Starting ${providerName} OAuth flow...`);
      
      // Use signUp.authenticateWithRedirect which handles both new and existing users
      await signUp.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: `${window.location.origin}/`,
        redirectUrlComplete: `${window.location.origin}/`
      });
    } catch (error) {
      console.error('OAuth error:', error);
      toast.error(`Failed to authenticate with ${providerName}`);
      setIsAuthenticating(null);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');
    
    if (error) {
      console.error('OAuth error:', error, errorDescription);
      toast.error(`Authentication failed: ${errorDescription || error}`);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // Check if user is being redirected after OAuth
    if (urlParams.has('clerk_oauth_error')) {
      toast.error('OAuth authentication failed');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Sign In or Create Account</h2>
        <p className="text-gray-600">Choose your preferred method to continue</p>
      </div>
      
      <div className="space-y-3">
        <button 
          onClick={() => handleOAuthSignIn('oauth_google')}
          disabled={!!isAuthenticating}
          className="w-full bg-white border-2 border-gray-200 text-gray-700 px-6 py-4 rounded-xl font-medium hover:border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAuthenticating === 'oauth_google' ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700"></div>
          ) : (
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          Continue with Google
        </button>
        
        <button 
          onClick={() => handleOAuthSignIn('oauth_github')}
          disabled={!!isAuthenticating}
          className="w-full bg-gray-900 text-white px-6 py-4 rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAuthenticating === 'oauth_github' ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd"/>
            </svg>
          )}
          Continue with GitHub
        </button>
        
        <button 
          onClick={() => handleOAuthSignIn('oauth_linkedin_oidc')}
          disabled={!!isAuthenticating}
          className="w-full bg-blue-600 text-white px-6 py-4 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAuthenticating === 'oauth_linkedin_oidc' ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          )}
          Continue with LinkedIn
        </button>
        
        {/* Apple OAuth temporarily disabled - requires additional Clerk configuration */}
        {/*
        <button 
          onClick={() => handleOAuthSignIn('oauth_apple')}
          disabled={!!isAuthenticating}
          className="w-full bg-black text-white px-6 py-4 rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAuthenticating === 'oauth_apple' ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
          )}
          Continue with Apple
        </button>
        */}
      </div>
      
    
    </div>
  );
}

function AppContent() {
  return (
    <>
      <SignedOut>
        <div className="min-h-screen flex items-center justify-center p-8 gradient-bg">
          <div className="bg-white p-12 rounded-2xl auth-card-shadow text-center max-w-md w-full border border-gray-200">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-karbon-navy mb-3 tracking-tight">
                Notes App
              </h1>
              <p className="text-karbon-gray text-lg leading-relaxed">
                Sign in to access your personal notes dashboard
              </p>
            </div>
            
            <SignInOptions />
          </div>
        </div>
      </SignedOut>
      
      <SignedIn>
        <AuthenticatedWrapper />
      </SignedIn>
      
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #334155',
            fontSize: '14px',
            fontWeight: '500',
            padding: '12px 16px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
          success: {
            className: 'gradient-success',
            style: {
              color: 'white',
            },
          },
          error: {
            className: 'gradient-error',
            style: {
              color: 'white',
            },
          },
        }}
      />
    </>
  );
}

function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <ThemeProvider>
        <Router>
          <AppContent />
        </Router>
      </ThemeProvider>
    </ClerkProvider>
  );
}

export default App;
