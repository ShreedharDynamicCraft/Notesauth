import { ClerkProvider } from '@clerk/clerk-react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppContent } from './components/AppContent';
import { SSOCallback } from './components/auth';
import { APP_CONFIG } from './config/app';
import './App.css';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!clerkPubKey) throw new Error('Missing Clerk Publishable Key');

function App() {
  const frontendUrl = window.location.origin;
  
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      afterSignOutUrl={frontendUrl}
      signInFallbackRedirectUrl={`${frontendUrl}/register-newUser`}
      signUpFallbackRedirectUrl={`${frontendUrl}/register-newUser`}
      signInForceRedirectUrl={`${frontendUrl}/register-newUser`}
      signUpForceRedirectUrl={`${frontendUrl}/register-newUser`}
      appearance={APP_CONFIG.clerk.appearance}
    >
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path={APP_CONFIG.routes.ssoCallback} element={<SSOCallback />} />
            <Route path="/*" element={<AppContent />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </ClerkProvider>
  );
}

export default App;
