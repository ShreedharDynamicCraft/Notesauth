export type OAuthStrategy = 'oauth_google' | 'oauth_github' | 'oauth_linkedin_oidc';

export interface OAuthButtonProps {
  strategy: OAuthStrategy;
  label: string;
  onClick: (strategy: OAuthStrategy) => void;
  isAuthenticating: string | null;
}

export interface RegistrationStep {
  delay: number;
  progress: number;
  message: string;
}
