import React, { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from './authConfig';

const App = () => {
  const { instance, accounts } = useMsal();
  const [view, setView] = useState('signin');
  const [section, setSection] = useState('');
  const [entity, setEntity] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [invoiceData, setInvoiceData] = useState([]);
  const [poPodData, setPoPodData] = useState([]);
  const [followUpData, setFollowUpData] = useState([]);

  const entityOptions = [
    1207, 3188, 1012, 1194, 380, 519, 1209, 1310, 3124, 1180, 1467, 466,
    3121, 477, 1456, 1287, 1396, 3168, 417, 3583, 1698, 1443, 1662, 1204,
    478, 1029, 1471, 1177, 1253, 1580, 3592, 1285, 3225, 1101, 1395, 1203,
    1247, 1083, 1216, 1190, 3325, 3143, 3223, 1619
  ];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const years = ['2025', '2026'];

  useEffect(() => {
    if (accounts.length > 0) setView('home');
  }, [accounts]);

  const signIn = () => instance.loginRedirect(loginRequest);
  const logout = () => instance.logoutRedirect();

  const getAccessToken = async () => {
    const account = accounts[0];
    const response = await instance.acquireTokenSilent({
      ...loginRequest,
      account
    });
    return response.accessToken;
  };

  const buildFileUrl = (fileName) => {
    const segments = ['General', 'PWC Revenue Testing Automation'];
    const encodedPath = segments.map(encodeURIComponent).join('/');
    const encodedFileName = encodeURIComponent(fileName);
    return `https://graph.microsoft.com/v1.0/sites/collaboration.merck.com:/sites/gbsicprague:/drive/root:/${encodedPath}/${encodedFileName}:/content`;
  };

  const handleFileUpload = async (e, rowIdx, key, data, setData) => {
    const file = e.target.files[0];
    if (!file) return;
    const accessToken = await getAccessToken();
    const uploadUrl = buildFileUrl(file.name);

    try {
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': file.type
        },
        body: file
      });

      if (response.ok) {
        const updated = [...data];
        updated[rowIdx] = { ...updated[rowIdx], [key]: file.name };
        setData(updated);
      } else {
        const errorText = await response.text();
        alert(`❌ Upload failed: ${response.status} - ${errorText}`);
      }
    } catch (err) {
      alert(`❌ Upload request failed: ${err.message}`);
    }
  };

  const renderUploadTable = (headers, data, setData) => (
    <div>
      <table>
        <thead>
          <tr>
            {headers.map(({ key, label }) => (
              <th key={key}>{label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx}>
              {headers.map(({ key }) => (
                <td key={key}>
                  <input
                    type='file'
                    onChange={(e) => handleFileUpload(e, idx, key, data, setData)}
                  />
                  {row[key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={() => setView('dashboard')}>← Go Back</button>
    </div>
  );

  return (
    <div style={{ padding: '2rem', fontFamily: 'Segoe UI' }}>
      <h1>PWC Testing Automation</h1>
      {view === 'signin' && <button onClick={signIn}>Sign in with Microsoft</button>}
      {view === 'home' && (
        <div>
          <p>Welcome, {accounts[0]?.username}</p>
          {['cash_app', 'po_pod', 'follow_up'].map((key) => (
            <button key={key} onClick={() => { setSection(key); setView('dashboard'); }}>
              {key.replace('_', ' ').toUpperCase()}
            </button>
          ))}
          <button onClick={logout}>Logout</button>
        </div>
      )}
      {view === 'dashboard' && (
        <form onSubmit={(e) => { e.preventDefault(); if (entity && month && year) setView('upload'); }}>
          <select value={entity} onChange={(e) => setEntity(e.target.value)}>
            <option>-- Entity --</option>
            {entityOptions.map((v) => <option key={v}>{v}</option>)}
          </select>
          <select value={month} onChange={(e) => setMonth(e.target.value)}>
            <option>-- Month --</option>
            {months.map((m) => <option key={m}>{m}</option>)}
          </select>
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            <option>-- Year --</option>
            {years.map((y) => <option key={y}>{y}</option>)}
          </select>
          <button type='submit'>Submit</button>
        </form>
      )}
      {view === 'upload' && renderUploadTable([], [], () => {})}
    </div>
  );
};

export default App;
