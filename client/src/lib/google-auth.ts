const GOOGLE_GSI_SRC = 'https://accounts.google.com/gsi/client';

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string; error_description?: string }) => void;
            error_callback?: (err: { type?: string; message?: string }) => void;
          }) => {
            requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
          };
        };
      };
    };
  }
}

export function getGoogleClientId(): string {
  return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() || '';
}

export function isGoogleAuthConfigured(): boolean {
  return Boolean(getGoogleClientId());
}

function loadGoogleGsiScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Sign-In must run in the browser.'));
  }

  if (window.google?.accounts?.oauth2) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GOOGLE_GSI_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Failed to load Google Sign-In script.')), {
        once: true,
      });
      return;
    }

    const script = document.createElement('script');
    script.src = GOOGLE_GSI_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Sign-In script.'));
    document.head.appendChild(script);
  });
}

/**
 * Open Google OAuth2 popup via Google Identity Services (no Firebase required)
 * and resolve with the verified Google OAuth2 access token.
 */
export async function requestGoogleAccessToken(): Promise<string> {
  const clientId = getGoogleClientId();
  if (!clientId) {
    throw new Error(
      'Google Sign-In is not configured yet. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID in client/.env.local.'
    );
  }

  await loadGoogleGsiScript();

  const oauth2 = window.google?.accounts?.oauth2;
  if (!oauth2) {
    throw new Error('Google Identity Services could not be initialized.');
  }

  return new Promise((resolve, reject) => {
    const tokenClient = oauth2.initTokenClient({
      client_id: clientId,
      scope: 'openid email profile',
      callback: (response) => {
        if (response.error) {
          if (response.error === 'access_denied') {
            reject(new Error('POPUP_CANCELLED'));
            return;
          }
          reject(new Error(response.error_description || response.error));
          return;
        }
        if (!response.access_token) {
          reject(new Error('No access token returned from Google.'));
          return;
        }
        resolve(response.access_token);
      },
      error_callback: (err) => {
        if (err?.type === 'popup_closed') {
          reject(new Error('POPUP_CANCELLED'));
          return;
        }
        reject(new Error(err?.message || 'Google sign-in popup could not be opened.'));
      },
    });

    tokenClient.requestAccessToken({ prompt: 'select_account' });
  });
}
