import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { MsalProvider } from '@azure/msal-react';
import { msalInstance } from './authConfig';
import { MsalAuthenticationTemplate, MsalRedirectComponent } from '@azure/msal-react';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <MsalProvider instance={msalInstance}>
      <App />
      <MsalRedirectComponent /> {/* Important: handles loginRedirect result */}
    </MsalProvider>
  </React.StrictMode>
);

