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

  const handleFileUpload = async (e, rowIdx, key, data, setData) => {
    const file = e.target.files[0];
    if (!file) return;
    const accessToken = await getAccessToken();
    const uploadUrl = `https://graph.microsoft.com/v1.0/sites/collaboration.merck.com:/sites/gbsicprague:/drive/root:/Shared Documents/General/PWC Revenue Testing Automation/${file.name}:/content`;

    const res = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: file
    });

    if (res.ok) {
      const updated = [...data];
      updated[rowIdx] = { ...updated[rowIdx], [key]: file.name };
      setData(updated);
    } else {
      alert('Upload failed.');
    }
  };

  const renderCell = (value, rowIdx, key, data, setData) => {
    const isFile = typeof value === 'string' && /\.(pdf|xlsx|docx)$/i.test(value);
    const fileUrl = `https://graph.microsoft.com/v1.0/sites/collaboration.merck.com:/sites/gbsicprague:/drive/root:/Shared Documents/General/PWC Revenue Testing Automation/${value}:/content`;

    return (
      <>
        {isFile && (
          <a href={fileUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block', color: '#007C91' }}>
            {value}
          </a>
        )}
        <input
          type="text"
          value={value || ''}
          onChange={(e) => handleInputChange(e, rowIdx, key, data, setData)}
          onDoubleClick={() => document.getElementById(`file-${key}-${rowIdx}`)?.click()}
          style={{ width: '100%' }}
        />
        <input
          type="file"
          id={`file-${key}-${rowIdx}`}
          style={{ display: 'none' }}
          onChange={(e) => handleFileUpload(e, rowIdx, key, data, setData)}
        />
      </>
    );
  };
  const renderUploadTable = (headers, data, setData) => {
    const filteredData = data.filter(row =>
      headers.every(h =>
        !filters[h.key] || (row[h.key] ?? '').toLowerCase().includes(filters[h.key].toLowerCase())
      )
    );

    const exportToExcel = () => {
      const rows = data.map(row => {
        const obj = {};
        headers.forEach(h => obj[h.label] = row[h.key] || '');
        return obj;
      });
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, section.toUpperCase());
      XLSX.writeFile(wb, `${section}_${entity}_${month}_${year}.xlsx`);
    };

    return (
      <div onPaste={(e) => handlePaste(e, headers, data, setData)}>
        <h2 style={{ color: '#007C91' }}>{section.replace('_', ' ').toUpperCase()}</h2>
        <button onClick={() => setData([...data, {}])}>+ Add Row</button>
        <button onClick={exportToExcel} style={{ marginLeft: '1rem' }}>⬇ Export to Excel</button>
        <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#e8f4f8' }}>
            <tr>
              {headers.map(h => (
                <th key={h.key} style={{ border: '1px solid #ccc', padding: '8px' }}>
                  {h.label}
                  <br />
                  <input
                    type="text"
                    placeholder="Filter"
                    value={filters[h.key] || ''}
                    onChange={(e) => setFilters({ ...filters, [h.key]: e.target.value })}
                    style={{ width: '95%' }}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, rowIdx) => (
              <tr key={rowIdx}>
                {headers.map(h => (
                  <td key={h.key} style={{ border: '1px solid #ccc', padding: '6px' }}>
                    {renderCell(row[h.key], rowIdx, h.key, data, setData)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <br />
        <button onClick={() => setView('dashboard')}>← Go Back</button>
      </div>
    );
  };
  const headersMap = {
    cash_app: [
      { key: 'invoice', label: 'Invoice' },
      { key: 'cash_app', label: 'Cash App' },
      { key: 'credit_note', label: 'Credit Note' },
      { key: 'fbl5n', label: 'FBL5N' },
      { key: 'cmm', label: 'CMM' },
      { key: 'comments', label: 'Comments' }
    ],
    po_pod: [
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
          <img src="https://logowik.com/content/uploads/images/merck-sharp-dohme-msd5762.logowik.com.webp" alt="MSD Logo"
               style={{ width: '400px', marginBottom: '1rem' }} />
          <h1 style={{ color: '#007C91' }}>PWC Testing Automation</h1>
          <button onClick={signIn} style={{
            backgroundColor: '#007C91', color: 'white', padding: '0.8rem 2rem', borderRadius: '6px'
          }}>
            Sign in with Microsoft
          </button>
        </div>
      )}
      {view === 'home' && (
        <div>
          <h2 style={{ color: '#007C91' }}>Welcome</h2>
          {['cash_app', 'po_pod', 'follow_up'].map(s => (
            <button key={s} onClick={() => handleSectionClick(s)} style={{
              margin: '1rem',
              padding: '1rem 2rem',
              backgroundColor: '#007C91',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}>
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
            {[1207, 3188, 1012].map(e => <option key={e} value={e}>{e}</option>)}
          </select>
          <label>Month</label>
          <select value={month} onChange={(e) => setMonth(e.target.value)} style={{ width: '100%', marginBottom: '1rem' }}>
            <option value="">-- Select --</option>
            {['January', 'February', 'March'].map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <label>Year</label>
          <select value={year} onChange={(e) => setYear(e.target.value)} style={{ width: '100%', marginBottom: '1rem' }}>
            <option value="">-- Select --</option>
            {['2025', '2026'].map(y => <option key={y} value={y}>{y}</option>)}
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
