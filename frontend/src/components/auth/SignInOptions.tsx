import { useSignIn } from '@clerk/clerk-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import type { OAuthStrategy, OAuthButtonProps } from '../../types/auth';
import { OAUTH_PROVIDERS, OAUTH_ICONS } from '../../config/oauth';
import { APP_CONFIG } from '../../config/app';
import { LoadingSpinner } from '../shared/LoadingSpinner';

function OAuthButton({ strategy, label, onClick, isAuthenticating }: OAuthButtonProps) {
  const buttonStyles = {
    oauth_google: OAUTH_PROVIDERS.google.styles,
    oauth_github: OAUTH_PROVIDERS.github.styles,
    oauth_linkedin_oidc: OAUTH_PROVIDERS.linkedin.styles
  };

  return (
    <button
      onClick={() => onClick(strategy)}
      disabled={!!isAuthenticating}
      className={`w-full px-6 py-4 rounded-xl font-medium flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${buttonStyles[strategy]}`}
    >
      {isAuthenticating === strategy ? (
        <LoadingSpinner size="sm" />
      ) : (
        OAUTH_ICONS[strategy]
      )}
      {label}
    </button>
  );
}

export function SignInOptions() {
  const { signIn } = useSignIn();
  const [isAuthenticating, setIsAuthenticating] = useState<string | null>(null);

  const handleOAuthSignIn = async (strategy: OAuthStrategy) => {
    try {
      setIsAuthenticating(strategy);
      if (signIn) {
        signIn.authenticateWithRedirect({
          strategy,
          redirectUrl: `${window.location.origin}${APP_CONFIG.routes.ssoCallback}`,
          redirectUrlComplete: window.location.origin
        }).catch(() => {
          setIsAuthenticating(null);
          toast.error('Authentication failed. Please try again.');
        });
      }
    } catch (err) {
      console.error('OAuth Sign-In failed:', err);
      toast.error('OAuth sign-in failed.');
      setIsAuthenticating(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Sign In or Create Account</h2>
        <p className="text-gray-600">Choose your preferred method to continue</p>
      </div>

      <div className="space-y-3">
        <OAuthButton
          strategy={OAUTH_PROVIDERS.google.strategy}
          label={OAUTH_PROVIDERS.google.label}
          onClick={handleOAuthSignIn}
          isAuthenticating={isAuthenticating}
        />
        <OAuthButton
          strategy={OAUTH_PROVIDERS.github.strategy}
          label={OAUTH_PROVIDERS.github.label}
          onClick={handleOAuthSignIn}
          isAuthenticating={isAuthenticating}
        />
        <OAuthButton
          strategy={OAUTH_PROVIDERS.linkedin.strategy}
          label={OAUTH_PROVIDERS.linkedin.label}
          onClick={handleOAuthSignIn}
          isAuthenticating={isAuthenticating}
        />
      </div>
    </div>
  );
}
