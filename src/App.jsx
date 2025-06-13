import React, { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from './authConfig';

const App = () => {
  const [view, setView] = useState('signin');
  const [section, setSection] = useState('');
  const [entity, setEntity] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [message, setMessage] = useState('');
  const [invoiceData, setInvoiceData] = useState([]);
  const [poPodData, setPoPodData] = useState([]);
  const [followUpData, setFollowUpData] = useState([]);
  const [filters, setFilters] = useState({});

  const { instance, accounts } = useMsal();

  const signIn = () => {
    instance.loginRedirect(loginRequest);
  };

  useEffect(() => {
    if (accounts.length > 0) {
      setView('home');
    }
  }, [accounts]);

  const getAccessToken = async () => {
    const account = accounts[0];
    return instance.acquireTokenSilent({ ...loginRequest, account });
  };

  const entityOptions = [1207, 3188, 1012];
  const months = ['January', 'February', 'March'];
  const years = ['2025', '2026'];

  useEffect(() => {
    if (view === 'upload') {
      if (section === 'cash_app') setInvoiceData([]);
      else if (section === 'po_pod') setPoPodData([]);
      else if (section === 'follow_up') setFollowUpData([]);
    }
  }, [view, section]);

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

  const renderUploadPage = () => {
    if (section === 'cash_app') {
      const headers = [
        { key: 'invoice', label: 'Invoice' },
        { key: 'cash_app', label: 'Cash App' },
        { key: 'credit_note', label: 'Credit Note' },
        { key: 'fbl5n', label: 'FBL5N' },
        { key: 'cmm', label: 'CMM' },
        { key: 'comments', label: 'Comments' }
      ];
      return renderUploadTable(headers, invoiceData, setInvoiceData);
    }
    if (section === 'po_pod') {
      const headers = [
        { key: 'so', label: 'SO' },
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
      ];
      return renderUploadTable(headers, poPodData, setPoPodData);
    }
    if (section === 'follow_up') {
      const headers = [
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
      ];
      return renderUploadTable(headers, followUpData, setFollowUpData);
    }
    return null;
  };

  const renderLogo = () => (
    view !== 'signin' && (
      <img
        src="https://logowik.com/content/uploads/images/merck-sharp-dohme-msd5762.logowik.com.webp"
        alt="MSD Logo"
        style={{ height: '50px', position: 'absolute', top: '20px', right: '20px' }}
      />
    )
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4fafd', fontFamily: 'Segoe UI', position: 'relative', padding: '2rem' }}>
      {renderLogo()}

      {view === 'signin' && (
        <div style={{ textAlign: 'center', marginTop: '10%' }}>
          <img
            src="https://logowik.com/content/uploads/images/merck-sharp-dohme-msd5762.logowik.com.webp"
            alt="MSD Logo"
            style={{ width: '400px', maxWidth: '80%', marginBottom: '1rem' }}
          />
          <h1 style={{ color: '#007C91', fontSize: '2.5rem', marginBottom: '2rem' }}>PWC Testing Automation</h1>
          <button
            onClick={signIn}
            style={{
              padding: '0.8rem 2rem',
              backgroundColor: '#007C91',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Sign in with Microsoft
          </button>
        </div>
      )}

      {view === 'home' && (
        <div>
          <h2 style={{ color: '#007C91' }}>PWC Testing Automation</h2>
          <p>Signed in as: <strong>{accounts[0].username}</strong></p>
          <p>Select a section to continue:</p>
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
        <div>
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
            }}>Submit</button>
          </form>
          <div style={{ textAlign: 'center' }}>
            <button onClick={() => setView('home')} style={{ marginTop: '1rem' }}>← Go Back</button>
          </div>
        </div>
      )}

      {view === 'upload' && (
        <div>
          {renderUploadPage()}
        </div>
      )}

      {message && <p style={{ color: '#007C91', marginTop: '1rem' }}>{message}</p>}
    </div>
  );
};

export default App;
