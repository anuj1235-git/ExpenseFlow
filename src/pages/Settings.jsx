import {
  useState
}
from 'react';
import {
  useExpense
}
from '../context/ExpenseContext';
import {
  useTheme
}
from '../context/ThemeContext';
import {
  readStorage,
  writeStorage
}
from '../utils/storage';
import {
  useAuth
}
from '../context/AuthContext';
import Modal from '../components/ui/Modal';
export default function Settings() {
  const {
    transactions,
    clearAll,
    importTransactions,
    loadSampleData
  }
=useExpense();
const {
  user,
  logout,
  deleteAccount
}
=useAuth();
const {
  theme,
  setTheme
}
=useTheme();
const [currency,
setCurrency]=useState(()=>readStorage('expenseflow_settings',
{
  currency:'INR'
}
).currency||'INR');
const [confirm,
setConfirm]=useState(false);
const [confirmDelete,
setConfirmDelete]=useState(false);
const [confirmSample,
setConfirmSample]=useState(false);
const [importError,
setImportError]=useState('');
const [importSuccess,
setImportSuccess]=useState('');
function saveCurrency(v) {
  setCurrency(v);
  writeStorage('expenseflow_settings',
  {
    ...readStorage('expenseflow_settings',
    {
    }
  ),
  currency:v
}
)
}
function exportData() {
  const blob=new Blob([JSON.stringify( {
    transactions
  }
,
null,
2)],
{
  type:'application/json'
}
);
const a=document.createElement('a');
a.href=URL.createObjectURL(blob);
a.download='expenseflow-data.json';
a.click();
URL.revokeObjectURL(a.href)
}
function exportCsv() {
  const rows=[['Date',
  'Type',
  'Amount',
  'Category',
  'Description',
  'Payment Method'],
  ...transactions.map(t=>[t.date,
  t.type,
  t.amount,
  t.category,
  t.description,
  t.paymentMethod])];
  const csv=rows.map(r=>r.map(v=>`"${String(v??'').replaceAll('"','""')}"`).join(',')).join('\n');
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([csv],
  {
    type:'text/csv'
  }
));
a.download='expenseflow-transactions.csv';
a.click();
URL.revokeObjectURL(a.href)
}
function importJson() {
  setImportError('');
  setImportSuccess('');
  const input=document.createElement('input');
  input.type='file';
  input.accept='application/json';
  input.onchange=(e)=>{
    const file=e.target.files?.[0];
    if(!file) return;
    const reader=new FileReader();
    reader.onload=(ev)=>{
      try {
        const parsed=JSON.parse(ev.target.result);
        // Accept both {transactions:[...]} shape (our export format) and a bare array
        const incoming=Array.isArray(parsed)?parsed:Array.isArray(parsed?.transactions)?parsed.transactions:null;
        if(!incoming) throw new Error('Invalid format: expected a JSON array or an object with a "transactions" array.');
        const valid=incoming.every(t=>t && typeof t==='object' && 'type' in t && 'amount' in t);
        if(!valid) throw new Error('Some records are missing required fields (type, amount).');
        importTransactions(incoming);
        setImportSuccess(`${incoming.length} transaction(s) imported successfully.`);
      } catch(err) {
        setImportError(err.message||'Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}
function handleLoadSample() {
  setConfirmSample(true);
}
return <><div className="page-title"><div><p className="eyebrow">Preferences</p><h1>Settings</h1></div></div><div className="settings-grid"><section className="card settings-card"><h2>Account</h2><p><strong> {
  user?.name
}
</strong><br/> {
  user?.email
}
</p><div className="button-row"><button className="btn secondary" onClick= {
  logout
}
>Logout</button><button className="btn danger-btn" onClick= {
  ()=>setConfirmDelete(true)
}
>Delete Account</button></div></section><section className="card settings-card"><h2>Appearance</h2><p>Choose how ExpenseFlow looks.</p><div className="segmented"> {
  ['light',
  'dark',
  'system'].map(x=><button className= {
    theme===x?'selected':''
  }
key= {
  x
}
onClick= {
  ()=>setTheme(x)
}
> {
  x[0].toUpperCase()+x.slice(1)
}
</button>)
}
</div></section><section className="card settings-card"><h2>Currency</h2><p>Amounts will use your selected currency.</p><select value= {
  currency
}
onChange= {
  e=>saveCurrency(e.target.value)
}
><option value="INR">INR ₹</option><option value="USD">USD $</option><option value="EUR">EUR €</option><option value="GBP">GBP £</option></select></section><section className="card settings-card"><h2>Data Management</h2><p>Export a backup, import data, or remove all local data.</p>{importError&&<p className="notice error">{importError}</p>}{importSuccess&&<p className="notice success">{importSuccess}</p>}<div className="button-row"><button className="btn secondary" onClick={exportCsv}>Export CSV</button><button className="btn secondary" onClick={exportData}>Export JSON</button><button className="btn secondary" onClick={importJson}>Import JSON</button><button className="btn secondary" onClick={handleLoadSample}>Load Sample Data</button><button className="btn danger-btn" onClick={()=>setConfirm(true)}>Clear All Data</button></div></section></div><Modal open= {
  confirm
}
title="Clear all data?" onClose= {
  ()=>setConfirm(false)
}
actions= {
  <><button className="btn secondary" onClick= {
    ()=>setConfirm(false)
  }
>Cancel</button><button className="btn danger-btn" onClick= {
  ()=> {
    clearAll();
    setConfirm(false)
  }
}
>Clear Data</button></>
}
><p>This permanently removes transactions,
budgets and goals saved in this browser.</p></Modal><Modal open= {
  confirmDelete
}
title="Delete account?" onClose= {
  ()=>setConfirmDelete(false)
}
actions= {
  <><button className="btn secondary" onClick= {
    ()=>setConfirmDelete(false)
  }
>Cancel</button><button className="btn danger-btn" onClick= {
  ()=> {
    deleteAccount();
  }
}
>Yes, delete my account</button></>
}
><p>This will permanently delete your account and all associated data — transactions, budgets, goals, and settings. This action cannot be undone.</p></Modal><Modal open={confirmSample} title="Load sample data?" onClose={()=>setConfirmSample(false)} actions={<><button className="btn secondary" onClick={()=>setConfirmSample(false)}>Cancel</button><button className="btn primary" onClick={()=>{loadSampleData();setConfirmSample(false);}}>Load Sample Data</button></>}><p>This will replace your current transactions, budgets and goals with the built-in sample dataset. Your existing data will be lost.</p></Modal></>
}
