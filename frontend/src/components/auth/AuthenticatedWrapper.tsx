import { useAuth } from '@clerk/clerk-react';
import { Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Dashboard } from '../Dashboard';
import { NoteDetailView } from '../NoteDetailView';
import { LoadingSpinner } from '../shared/LoadingSpinner';

export function AuthenticatedWrapper() {
  const { isSignedIn, userId, isLoaded } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && userId) {
      const hasShownSignInToast = sessionStorage.getItem('hasShownSignInToast');
      if (!hasShownSignInToast) {
        toast.success('Successfully signed in!');
        sessionStorage.setItem('hasShownSignInToast', 'true');
      }
      setIsInitializing(false);
    } else {
      sessionStorage.clear();
      setIsInitializing(false);
    }
  }, [isSignedIn, userId, isLoaded]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="bg-white/10 rounded-xl p-4 text-center backdrop-blur-sm">
          <LoadingSpinner size="md" color="border-white border-t-transparent" />
          <p className="text-white text-xs mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (isInitializing) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="bg-white/10 rounded-xl p-4 text-center backdrop-blur-sm">
          <div className="animate-pulse w-6 h-6 bg-white rounded-full mx-auto mb-1"></div>
          <p className="text-white text-xs">Ready!</p>
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
