import React, { useState, useEffect, useRef } from 'react';

const App = () => {
  const [view, setView] = useState('home');
  const [section, setSection] = useState('');
  const [entity, setEntity] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [message, setMessage] = useState('');
  const [invoiceData, setInvoiceData] = useState([]);
  const [poPodData, setPoPodData] = useState([]);
  const [followUpData, setFollowUpData] = useState([]);
  const [filters, setFilters] = useState({});

  const entityOptions = [1207, 3188, 1012, 1194, 380, 519,
    1209, 1310, 3124, 1180, 1467, 466, 3121, 477, 1456, 1287,
    1396, 3168, 417, 3583, 1698, 1443, 1662, 1204, 478, 1029,
    1471, 1177, 1253, 1580, 3592, 1285, 3225, 1101, 1395, 1203,
    1247, 1083, 1216, 1190, 3325, 3143, 3223, 1619];
  const months = ['January', 'February', 'March', "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];
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

  const handleInputChange = (e, data, setData, rowIdx, key) => {
    const updated = [...data];
    updated[rowIdx][key] = e.target.value;
    setData(updated);
  };

  // ✅ Uploads file but DOES NOT overwrite text value
  const handleFileUpload = (e, data, setData, rowIdx, key) => {
    const file = e.target.files[0];
    if (file) {
      console.log(`📁 File uploaded for row ${rowIdx}, column ${key}: ${file.name}`);
      // optionally: updated[rowIdx][`${key}_file`] = file.name;
    }
  };

  const FileInputCell = ({ value, onTextChange, onFileUpload }) => {
    const fileRef = useRef();
    return (
      <div style={{ position: 'relative', cursor: 'pointer' }}>
        <input
          type="text"
          value={value || ''}
          onChange={onTextChange}
          onClick={(e) => {
            e.stopPropagation();
            fileRef.current?.click();
          }}
          style={{ width: '100%', padding: '4px', textAlign: 'center' }}
        />
        <input
          type="file"
          ref={fileRef}
          style={{ display: 'none' }}
          onChange={onFileUpload}
        />
      </div>
    );
  };

  const handleFilterChange = (e, key) => {
    setFilters({ ...filters, [key]: e.target.value });
  };

  const getFilteredData = (data, headers) => {
    return data.filter(row =>
      headers.every(({ key }) =>
        !filters[key] || row[key]?.toString().includes(filters[key])
      )
    );
  };

  const tableStyles = {
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '1rem' },
    th: { backgroundColor: '#007C91', color: 'white', padding: '8px', border: '1px solid #ccc' },
    td: { padding: '8px', border: '1px solid #ccc', textAlign: 'center' },
    filter: { width: '100%', padding: '4px', marginTop: '4px' }
  };

  const renderUploadTable = (headers, data, setData) => {
    const filteredData = getFilteredData(data, headers);

    return (
      <>
        <table style={tableStyles.table}>
          <thead>
            <tr>
              {headers.map(({ key, label }) => (
                <th key={key} style={tableStyles.th}>
                  {label}
                  <select
                    value={filters[key] || ''}
                    onChange={(e) => handleFilterChange(e, key)}
                    style={tableStyles.filter}
                  >
                    <option value="">All</option>
                    {[...new Set(data.map(row => row[key]).filter(Boolean))].map((val, idx) => (
                      <option key={idx} value={val}>{val}</option>
                    ))}
                  </select>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, rowIdx) => (
              <tr key={rowIdx}>
                {headers.map(({ key }) => (
                  <td key={key} style={tableStyles.td}>
                    <FileInputCell
                      value={row[key]}
                      onTextChange={(e) => handleInputChange(e, data, setData, rowIdx, key)}
                      onFileUpload={(e) => handleFileUpload(e, data, setData, rowIdx, key)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <button
          onClick={() => setData([...data, {}])}
          style={{
            marginTop: '10px',
            padding: '8px 16px',
            backgroundColor: '#007C91',
            color: 'white',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          ➕ Add Row
        </button>
        <br />
        <button onClick={() => setView('dashboard')} style={{ marginTop: '10px' }}>
          ← Go Back
        </button>
      </>
    );
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
        { key: 'incoterms', label: 'Incoterms' },
        { key: 'walkthrough', label: 'Walkthrough' }
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

  return (
    <div style={{ padding: '2rem', fontFamily: 'Segoe UI', backgroundColor: '#f4fafd', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ color: '#007C91' }}>PWC Testing Automation</h2>

      {view === 'home' && (
        <>
          <p>Select a section to continue:</p>
          {['cash_app', 'po_pod', 'follow_up'].map((s) => (
            <button key={s} onClick={() => handleSectionClick(s)} style={{
              margin: '1rem', padding: '1rem 2rem', backgroundColor: '#007C91',
              color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer'
            }}>
              {s.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </>
      )}

      {view === 'dashboard' && (
        <>
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
        </>
      )}

      {view === 'upload' && renderUploadPage()}
      {message && <p style={{ color: '#007C91', marginTop: '1rem' }}>{message}</p>}
    </div>
  );
};

export default App;
