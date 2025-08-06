import { useUser, useClerk } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

export const UserProfile = () => {
  const { user } = useUser();
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  if (!user) return null;

  return (
    <div className="flex items-center gap-6">
      <div className="text-right">
        <h2 className="text-white font-semibold text-lg">
          {user.fullName || user.firstName || 'User'}
        </h2>
        <p className="text-slate-300 text-sm">
          {user.primaryEmailAddress?.emailAddress}
        </p>
      </div>
      <button 
        onClick={handleSignOut} 
        className="bg-red-500 bg-opacity-90 hover:bg-red-600 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-all hover:-translate-y-0.5 backdrop-blur-sm"
      >
        Sign Out
      </button>
    </div>
  );
};
