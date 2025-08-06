import { useUser, useClerk } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

export const UserProfile = () => {
  const { user } = useUser();
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    try {
      sessionStorage.clear();
      
      // Clear all local storage items related to the app
      const keysToRemove = ['dashboardPanelWidth', 'hasShownWelcomeToast', 'hasShownSignInToast'];
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      // Sign out from Clerk and redirect to sign-in page
      await signOut({ redirectUrl: window.location.origin });
      
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  if (!user) return null;

  return (
    <div className="flex items-center gap-6">
      <div className="text-right">
        <h2 className="text-white font-semibold text-lg bg-gradient-to-r from-white via-cyan-100 to-blue-100 bg-clip-text text-transparent">
          {user.fullName || user.firstName || 'User'}
        </h2>
        <p className="text-cyan-200 text-sm font-medium">
          {user.primaryEmailAddress?.emailAddress}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-violet-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-purple-500/25">
          {(user.fullName || user.firstName || 'U')[0].toUpperCase()}
        </div>
        <button 
          onClick={handleSignOut} 
          className="bg-gradient-to-r from-red-500 to-red-500 hover:from-red-600 hover:to-red-900 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-all hover:-translate-y-0.5 backdrop-blur-sm shadow-lg shadow-red-500/25 border border-white/20"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};
