import { PublicClientApplication } from '@azure/msal-browser';

const clientId = import.meta.env.VITE_CLIENT_ID;
const tenantId = import.meta.env.VITE_TENANT_ID;
const redirectUri = import.meta.env.VITE_REDIRECT_URI;

export const msalConfig = {
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: true
  }
};

export const loginRequest = {
  scopes: [
    'User.Read',
    'Files.ReadWrite.All',
    'Sites.ReadWrite.All'
  ],
  prompt: 'login'
};

export const msalInstance = new PublicClientApplication(msalConfig);
