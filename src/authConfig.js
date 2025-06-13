import { PublicClientApplication } from '@azure/msal-browser';

export const msalConfig = {
  auth: {
    clientId: 'YOUR_CLIENT_ID',
    authority: 'https://login.microsoftonline.com/YOUR_TENANT_ID', // Replace this
    redirectUri: window.location.origin
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: true
  }
};

export const loginRequest = {
  scopes: ['User.Read'],
  prompt: 'login'
};

export const msalInstance = new PublicClientApplication(msalConfig);

