
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
  const [previewFile, setPreviewFile] = useState(null);

  const entityOptions = [1207, 3188, 1012, 1194, 380, 519, 1209, 1310, 3124, 1180, 1467, 466, 3121, 477, 1456, 1287,
    1396, 3168, 417, 3583, 1698, 1443, 1662, 1204, 478, 1029,
    1471, 1177, 1253, 1580, 3592, 1285, 3225, 1101, 1395, 1203,
    1247, 1083, 1216, 1190, 3325, 3143, 3223, 1619];
  const months = ['January', 'February', 'March', "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];
  const years = ['2025', '2026'];

  useEffect(() => {
    if (accounts.length > 0) setView('home');
  }, [accounts]);

  const signIn = () => instance.loginRedirect(loginRequest);
  const logout = () => instance.logoutRedirect();

  const getAccessToken = async () => {
    const account = instance.getAllAccounts()[0];
    const response = await instance.acquireTokenSilent({ ...loginRequest, account });
    return response.accessToken;
  };

  const getDownloadUrl = (fileName) =>
    `https://graph.microsoft.com/v1.0/sites/collaboration.merck.com:/sites/gbsicprague:/drive/root:/Shared Documents/General/PWC Revenue Testing Automation/${fileName}:/content`;

  const isFileLink = (val) => typeof val === 'string' && /\.(pdf|docx|xlsx|xls|png|jpg|jpeg|txt)$/i.test(val);

  const handleInputChange = (e, rowIdx, key, data, setData) => {
    const updated = [...data];
    updated[rowIdx] = { ...updated[rowIdx], [key]: e.target.value };
    setData(updated);
  };

  const handleFileUpload = async (e, rowIdx, key, data, setData) => {
    const file = e.target.files[0];
    if (!file) return;
    const accessToken = await getAccessToken();
    const uploadUrl = getDownloadUrl(encodeURIComponent(file.name));
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: file
    });
    if (!response.ok) throw new Error('Upload failed');
    const updated = [...data];
    updated[rowIdx] = { ...updated[rowIdx], [key]: file.name };
    setData(updated);
  };

  const getFilteredData = (data, headers) =>
    data.filter(row =>
      headers.every(h =>
        !filters[h.key] || row[h.key] === filters[h.key]
      )
    );

  const renderUploadTable = (headers, data, setData) => {
    const filteredData = getFilteredData(data, headers);
                  ))}
                  <td>
                    {Object.values(row).some(isFileLink)
                      ? <button onClick={() => setPreviewFile(Object.values(row).find(isFileLink))}>View</button>
                      : null}
                  </td>
                </tr>
                {previewFile && (
                  <tr>
                    <td colSpan={headers.length + 1}>
                      <iframe
                        src={getDownloadUrl(encodeURIComponent(previewFile))}
                        title="Preview"
                        width="100%"
                        height="400px"
                      />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: '#007C91' }}>PWC Testing Automation</h1>
        <img src="https://logowik.com/content/uploads/images/merck-sharp-dohme-msd5762.logowik.com.webp" alt="MSD Logo" style={{ height: '50px' }} />
      </div>
      {view === 'signin' && (
        <div style={{ textAlign: 'center' }}>
          <button onClick={signIn}>Sign in with Microsoft</button>
        </div>
      )}
      {view === 'home' && (
        <div>
          <p>Signed in as: <strong>{accounts[0]?.username}</strong></p>
          {Object.keys(headersMap).map(s => (
            <button key={s} onClick={() => { setSection(s); setView('dashboard'); }} style={{ marginRight: '1rem' }}>
              {s.replace('_', ' ').toUpperCase()}
            </button>
          ))}
          <button onClick={logout}>Logout</button>
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
          <button type="submit">Submit</button>
        </form>
      )}
      {view === 'upload' && renderUploadTable(headersMap[section], ...dataMap[section])}
    </div>
  );
};

export default App;
