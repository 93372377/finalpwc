import React, { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from './authConfig';
import * as XLSX from 'xlsx';

const App = () => {
  const { instance, accounts } = useMsal();

  const [view, setView] = useState('signin');
  const [section, setSection] = useState('');
  const [entity, setEntity] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [filters, setFilters] = useState({});
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

  const getAccessToken = async () => {
    const account = accounts[0];
    const response = await instance.acquireTokenSilent({ ...loginRequest, account });
    return response.accessToken;
  };
  const handleSectionClick = (s) => {
    setSection(s);
    setEntity('');
    setMonth('');
    setYear('');
    setView('dashboard');
  };

  const handleDashboardSubmit = (e) => {
    e.preventDefault();
    if (entity && month && year) setView('upload');
    else alert('Please select entity, month, and year.');
  };

  const handlePaste = (e, headers, data, setData) => {
    const pasted = e.clipboardData.getData('text/plain');
    const rows = pasted.trim().split('\n').map(r => r.split('\t'));
    const updated = [...data];
    rows.forEach(row => {
      const newRow = {};
      headers.forEach((h, i) => newRow[h.key] = row[i] || '');
      updated.push(newRow);
    });
    setData(updated);
    e.preventDefault();
  };

  const handleInputChange = (e, rowIdx, key, data, setData) => {
    const updated = [...data];
    updated[rowIdx] = { ...updated[rowIdx], [key]: e.target.value };
    setData(updated);
  };
      { key: 'po', label: 'PO' },
      { key: 'po_date', label: 'PO Date' },
      { key: 'pod', label: 'POD' },
      { key: 'pod_date', label: 'POD Date' },
      { key: 'invoice_date', label: 'Invoice Date' },
      { key: 'order_creator', label: 'Order Creator' },
      { key: 'plant', label: 'Plant' },
      { key: 'customer', label: 'Customer' },
      { key: 'product', label: 'Product' },
      { key: 'incoterms', label: 'Incoterms' }
    ],
    follow_up: [
      { key: 'group', label: 'Group/Statutory' },
      { key: 'country', label: 'Country' },
      { key: 'ah_hh', label: 'AH/HH' },
      { key: 'entity', label: 'Entity' },
      { key: 'month', label: 'Month' },
      { key: 'so', label: 'SO' },
      { key: 'invoice', label: 'Invoice' },
      { key: 'pod', label: 'POD' },
      { key: 'po', label: 'PO' },
      { key: 'order_creator', label: 'Order Creator' },
      { key: 'plant', label: 'Plant' },
      { key: 'customer', label: 'Customer' },
      { key: 'product', label: 'Product' },
      { key: 'year', label: 'Year' },
      { key: 'pwc_comment', label: 'PwC Comment' }
    ]
  };

  const dataMap = {
    cash_app: [invoiceData, setInvoiceData],
    po_pod: [poPodData, setPoPodData],
    follow_up: [followUpData, setFollowUpData]
  };
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4fafd', padding: '2rem', fontFamily: 'Segoe UI' }}>
      {view === 'signin' && (
        <div style={{ textAlign: 'center', marginTop: '10%' }}>
          <img
            src="https://logowik.com/content/uploads/images/merck-sharp-dohme-msd5762.logowik.com.webp"
            alt="MSD Logo"
            style={{ width: '400px', marginBottom: '1rem' }}
          />
          <h1 style={{ color: '#007C91' }}>PWC Testing Automation</h1>
          <button
            onClick={signIn}
            style={{
              backgroundColor: '#007C91',
              color: 'white',
              padding: '0.8rem 2rem',
              border: 'none',
              borderRadius: '6px',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            Sign in with Microsoft
          </button>
        </div>
      )}

      {view === 'home' && (
        <div>
          <h2 style={{ color: '#007C91' }}>Welcome</h2>
          <p>Signed in as: <strong>{accounts[0]?.username}</strong></p>
          {['cash_app', 'po_pod', 'follow_up'].map((s) => (
            <button
              key={s}
              onClick={() => handleSectionClick(s)}
              style={{
                margin: '1rem',
                padding: '1rem 2rem',
                backgroundColor: '#007C91',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              {s.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {view === 'dashboard' && (
        <form onSubmit={handleDashboardSubmit} style={{ maxWidth: '400px', margin: '2rem auto' }}>
          <label>Entity</label>
          <select value={entity} onChange={(e) => setEntity(e.target.value)} style={{ width: '100%', marginBottom: '1rem' }}>
            <option value="">-- Select --</option>
            {entityOptions.map(e => <option key={e} value={e}>{e}</option>)}
          </select>

          <label>Month</label>
          <select value={month} onChange={(e) => setMonth(e.target.value)} style={{ width: '100%', marginBottom: '1rem' }}>
            <option value="">-- Select --</option>
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>

          <label>Year</label>
          <select value={year} onChange={(e) => setYear(e.target.value)} style={{ width: '100%', marginBottom: '1rem' }}>
            <option value="">-- Select --</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>

          <button type="submit" style={{
            backgroundColor: '#007C91',
            color: 'white',
            padding: '0.5rem 1.5rem',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            Submit
          </button>
        </form>
      )}

      {view === 'upload' && renderUploadTable(headersMap[section], ...dataMap[section])}
    </div>
  );
};

export default App;
