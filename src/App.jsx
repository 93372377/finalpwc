
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
  const [filters, setFilters] = useState({});
  const [invoiceData, setInvoiceData] = useState([]);
  const [poPodData, setPoPodData] = useState([]);
  const [followUpData, setFollowUpData] = useState([]);
  const [previewIndex, setPreviewIndex] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);

  const entityOptions = [1207, 3188, 1012];
  const months = ['January', 'February', 'March'];
  const years = ['2025', '2026'];

  useEffect(() => {
    if (accounts.length > 0) setView('home');
  }, [accounts]);

  const signIn = () => instance.loginRedirect(loginRequest);
  const logout = () => instance.logoutRedirect();

  const getAccessToken = async () => {
    const account = accounts[0];
    const response = await instance.acquireTokenSilent({ ...loginRequest, account });
    return response.accessToken;
  };

  const getDownloadUrl = (fileName) => {
    return \`https://graph.microsoft.com/v1.0/sites/collaboration.merck.com:/sites/gbsicprague:/drive/root:/Shared Documents/General/PWC Revenue Testing Automation/\${fileName}:/content\`;
  };

  const isFileLink = (value) => typeof value === 'string' && /\.(pdf|docx|xlsx|xls|png|jpg|jpeg|txt)$/i.test(value);

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
    try {
      const accessToken = await getAccessToken();
      const uploadUrl = getDownloadUrl(file.name);
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { Authorization: \`Bearer \${accessToken}\` },
        body: file
      });
      if (!response.ok) throw new Error('Upload failed');
      const updated = [...data];
      updated[rowIdx] = { ...updated[rowIdx], [key]: file.name };
      setData(updated);
      alert('✅ File uploaded to SharePoint!');
    } catch (err) {
      console.error('Upload error:', err);
      alert('❌ Upload failed. Check console.');
    }
  };

  const togglePreview = (idx, fileName) => {
    if (previewIndex === idx) {
      setPreviewIndex(null);
      setPreviewFile(null);
    } else {
      setPreviewIndex(idx);
      setPreviewFile(fileName);
    }
  };

  const getFilteredData = (data, headers) =>
    data.filter(row =>
      headers.every(h =>
        !filters[h.key] || (row[h.key] ?? '').toLowerCase().includes(filters[h.key].toLowerCase())
      )
    );

  const renderUploadTable = (headers, data, setData) => {
    const filteredData = getFilteredData(data, headers);
    return (
      <div onPaste={(e) => handlePaste(e, headers, data, setData)}>
        <h2 style={{ color: '#007C91' }}>{section.toUpperCase()}</h2>
        <div style={{ marginBottom: '1rem' }}>
          <button onClick={() => setData([...data, {}])} style={buttonStyle}>+ Add Row</button>
          <button onClick={logout} style={{ ...buttonStyle, float: 'right' }}>Logout</button>
        </div>
        <table style={tableStyle}>
          <thead style={{ backgroundColor: '#e8f4f8' }}>
            <tr>
              {headers.map(h => (
                <th key={h.key} style={cellStyle}>
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
              <th style={cellStyle}>Preview</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, rowIdx) => (
              <React.Fragment key={rowIdx}>
                <tr>
                  {headers.map(h => (
                    <td key={h.key} style={cellStyle}>
                      {isFileLink(row[h.key]) ? (
                        <a href={getDownloadUrl(row[h.key])} target="_blank" rel="noreferrer">
                          {row[h.key]}
                        </a>
                      ) : (
                        <input
                          type="text"
                          value={row[h.key] || ''}
                          onChange={(e) => handleInputChange(e, rowIdx, h.key, data, setData)}
                          onDoubleClick={() => document.getElementById(\`file-\${h.key}-\${rowIdx}\`)?.click()}
                          style={{ width: '100%' }}
                        />
                      )}
                      <input
                        type="file"
                        id={\`file-\${h.key}-\${rowIdx}\`}
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileUpload(e, rowIdx, h.key, data, setData)}
                      />
                    </td>
                  ))}
                  <td style={cellStyle}>
                    {previewIndex === rowIdx ? (
                      <button onClick={() => togglePreview(rowIdx, '')} style={buttonStyle}>Hide</button>
                    ) : (
                      <button onClick={() => togglePreview(rowIdx, Object.values(row).find(isFileLink))} style={buttonStyle}>View</button>
                    )}
                  </td>
                </tr>
                {previewIndex === rowIdx && previewFile && (
                  <tr>
                    <td colSpan={headers.length + 1}>
                      <iframe
                        src={getDownloadUrl(previewFile)}
                        title="Preview"
                        width="100%"
                        height="400px"
                      ></iframe>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        <br />
        <button onClick={() => setView('dashboard')} style={buttonStyle}>← Go Back</button>
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

  const buttonStyle = {
    padding: '0.5rem 1rem',
    backgroundColor: '#007C91',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    margin: '0.25rem',
    cursor: 'pointer'
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '1rem'
  };

  const cellStyle = {
    border: '1px solid #ccc',
    padding: '8px'
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4fafd', padding: '2rem', fontFamily: 'Segoe UI' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: '#007C91' }}>PWC Testing Automation</h1>
        <img src="https://logowik.com/content/uploads/images/merck-sharp-dohme-msd5762.logowik.com.webp" alt="MSD Logo" style={{ height: '50px' }} />
      </div>
      {view === 'signin' && (
        <div style={{ textAlign: 'center' }}>
          <button onClick={signIn} style={buttonStyle}>Sign in with Microsoft</button>
        </div>
      )}
      {view === 'home' && (
        <div>
          <p>Signed in as: <strong>{accounts[0]?.username}</strong></p>
          {Object.keys(headersMap).map(s => (
            <button key={s} onClick={() => { setSection(s); setView('dashboard'); }} style={buttonStyle}>
              {s.replace('_', ' ').toUpperCase()}
            </button>
          ))}
          <button onClick={logout} style={buttonStyle}>Logout</button>
        </div>
      )}
      {view === 'dashboard' && (
        <form onSubmit={(e) => { e.preventDefault(); if (entity && month && year) setView('upload'); }} style={{ maxWidth: '400px', marginTop: '2rem' }}>
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
          <button type="submit" style={buttonStyle}>Submit</button>
        </form>
      )}
      {view === 'upload' && renderUploadTable(headersMap[section], ...dataMap[section])}
    </div>
  );
};

export default App;
