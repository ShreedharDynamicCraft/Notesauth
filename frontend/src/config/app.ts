export const APP_CONFIG = {
  name: 'Notes App',
  routes: {
    ssoCallback: '/register-newUser',
    dashboard: '/',
    note: '/note'
  },
  clerk: {
    appearance: {
      elements: {
        rootBox: { minHeight: 'auto' },
        card: { minHeight: 'auto' }
      },
      layout: {
        logoImageUrl: undefined,
        helpPageUrl: undefined,
        privacyPageUrl: undefined,
        termsPageUrl: undefined
      }
    }
  },
  toast: {
    position: 'top-right' as const,
    duration: 3000
  }
} as const;
