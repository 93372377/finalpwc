# PWC Testing Automation

This app provides a simple dashboard for uploading documents to Microsoft SharePoint using Microsoft Graph. It is built with React and Vite and uses the Microsoft Authentication Library (MSAL) for Azure AD sign‑in.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file with the following variables:
   ```bash
   VITE_CLIENT_ID=<Azure AD application id>
   VITE_TENANT_ID=<Azure AD tenant id>
   VITE_REDIRECT_URI=<app redirect URI>
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```

The app allows users to sign in with Microsoft, select a section, and upload files. Uploaded files are stored in SharePoint using Microsoft Graph API.
