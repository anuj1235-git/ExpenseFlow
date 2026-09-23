import { useState } from 'react';
import { useExpense }  from '../context/ExpenseContext';
import { useTheme }    from '../context/ThemeContext';
import { useAuth }     from '../context/AuthContext';
import { useToast }    from '../context/ToastContext';
import { readStorage, writeStorage } from '../utils/storage';
import { getExport }   from '../services/analyticsService';
import { importTransactions } from '../services/transactionService';
import Modal from '../components/ui/Modal';

export default function Settings() {
  const { transactions, clearAll, loadSampleData } = useExpense();
  const { user, logout, deleteAccount, updateProfile, changePassword } = useAuth();
  const { theme, setTheme } = useTheme();
  const toast = useToast();

  // ── UI state ────────────────────────────────────────────────────────────
  const [currency,      setCurrency]      = useState(() =>
    readStorage('expenseflow_settings', { currency: 'INR' }).currency || 'INR'
  );

  // Profile edit
  const [profileForm,   setProfileForm]   = useState({ name: user?.name || '', email: user?.email || '' });
  const [profileSaving, setProfileSaving] = useState(false);

  // Password change
  const [pwForm,        setPwForm]        = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwSaving,      setPwSaving]      = useState(false);

  // Confirmation modals
  const [confirm,       setConfirm]       = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmSample, setConfirmSample] = useState(false);

  // Import migration
  const [importError,   setImportError]   = useState('');
  const [importSuccess, setImportSuccess] = useState('');
  const [migrating,     setMigrating]     = useState(false);

  // Busy flags
  const [clearing,      setClearing]      = useState(false);
  const [deleting,      setDeleting]      = useState(false);
  const [sampling,      setSampling]      = useState(false);

  // ── Currency ─────────────────────────────────────────────────────────────
  function saveCurrency(v) {
    setCurrency(v);
    writeStorage('expenseflow_settings', {
      ...readStorage('expenseflow_settings', {}),
      currency: v,
    });
  }

  // ── Profile update ────────────────────────────────────────────────────────
  async function handleProfileSave(e) {
    e.preventDefault();
    if (!profileForm.name.trim() || !profileForm.email.trim()) return;
    setProfileSaving(true);
    try {
      await updateProfile({ name: profileForm.name.trim(), email: profileForm.email.trim() });
      toast.success('Profile updated successfully.');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  }

  // ── Change password ───────────────────────────────────────────────────────
  async function handleChangePassword(e) {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    setPwSaving(true);
    try {
      await changePassword(pwForm);
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully.');
    } catch (err) {
      toast.error(err.message || 'Failed to change password.');
    } finally {
      setPwSaving(false);
    }
  }

  // ── Export JSON ───────────────────────────────────────────────────────────
  async function exportData() {
    try {
      const { transactions: txs } = await getExport();
      const blob = new Blob([JSON.stringify({ transactions: txs }, null, 2)], { type: 'application/json' });
      const a    = document.createElement('a');
      a.href     = URL.createObjectURL(blob);
      a.download = 'expenseflow-data.json';
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success(`Exported ${txs.length} transaction(s).`);
    } catch (err) {
      toast.error(err.message || 'Export failed.');
    }
  }

  // ── Export CSV ────────────────────────────────────────────────────────────
  async function exportCsv() {
    try {
      const { transactions: txs } = await getExport();
      const rows = [
        ['Date', 'Type', 'Amount', 'Category', 'Description', 'Payment Method'],
        ...txs.map((t) => [t.date, t.type, t.amount, t.category, t.description, t.paymentMethod]),
      ];
      const csv = rows
        .map((r) => r.map((v) => `"${String(v ?? '').replaceAll('"', '""')}"`).join(','))
        .join('\n');
      const a    = document.createElement('a');
      a.href     = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
      a.download = 'expenseflow-transactions.csv';
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success(`Exported ${txs.length} transaction(s) as CSV.`);
    } catch (err) {
      toast.error(err.message || 'CSV export failed.');
    }
  }

  // ── Import JSON (file picker) ─────────────────────────────────────────────
  function importJson() {
    setImportError('');
    setImportSuccess('');
    const input    = document.createElement('input');
    input.type     = 'file';
    input.accept   = 'application/json';
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          const parsed  = JSON.parse(ev.target.result);
          const incoming = Array.isArray(parsed)
            ? parsed
            : Array.isArray(parsed?.transactions)
            ? parsed.transactions
            : null;
          if (!incoming) throw new Error('Invalid format: expected an array or { transactions: [...] }');
          const valid = incoming.every((t) => t && typeof t === 'object' && 'type' in t && 'amount' in t);
          if (!valid) throw new Error('Some records are missing required fields (type, amount).');
          setMigrating(true);
          const result = await importTransactions(incoming);
          setImportSuccess(`${result.imported ?? incoming.length} transaction(s) imported successfully.`);
          toast.success(`Imported ${result.imported ?? incoming.length} transaction(s).`);
        } catch (err) {
          const msg = err.message || 'Failed to import JSON.';
          setImportError(msg);
          toast.error(msg);
        } finally {
          setMigrating(false);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  // ── LocalStorage → backend migration ─────────────────────────────────────
  async function migrateLocalData() {
    setImportError('');
    setImportSuccess('');
    // Look for the old per-user transaction key
    const prefix       = user ? `expenseflow_${user.id}` : null;
    const localTxRaw   = prefix ? localStorage.getItem(`${prefix}_transactions`) : null;
    let   localTx      = [];
    try { localTx = localTxRaw ? JSON.parse(localTxRaw) : []; } catch { localTx = []; }

    if (!localTx.length) {
      toast.info('No local transactions found to migrate.');
      return;
    }
    setMigrating(true);
    try {
      const result = await importTransactions(localTx);
      const count  = result.imported ?? localTx.length;
      setImportSuccess(`Migrated ${count} local transaction(s) to your account.`);
      toast.success(`Migrated ${count} transaction(s) from local storage.`);
    } catch (err) {
      const msg = err.message || 'Migration failed.';
      setImportError(msg);
      toast.error(msg);
    } finally {
      setMigrating(false);
    }
  }

  // ── Clear all data ────────────────────────────────────────────────────────
  async function handleClearAll() {
    setClearing(true);
    try {
      await clearAll();
      setConfirm(false);
      toast.success('All data cleared.');
    } catch (err) {
      toast.error(err.message || 'Failed to clear data.');
    } finally {
      setClearing(false);
    }
  }

  // ── Load sample data ──────────────────────────────────────────────────────
  async function handleLoadSample() {
    setSampling(true);
    try {
      await loadSampleData();
      setConfirmSample(false);
      toast.success('Sample data loaded.');
    } catch (err) {
      toast.error(err.message || 'Failed to load sample data.');
    } finally {
      setSampling(false);
    }
  }

  // ── Delete account ────────────────────────────────────────────────────────
  async function handleDeleteAccount() {
    setDeleting(true);
    try {
      await deleteAccount();
      // AuthContext sets user=null and clears token; router redirects to /login
    } catch (err) {
      toast.error(err.message || 'Failed to delete account.');
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="page-title">
        <div>
          <p className="eyebrow">Preferences</p>
          <h1>Settings</h1>
        </div>
      </div>

      <div className="settings-grid">

        {/* ── Account ── */}
        <section className="card settings-card">
          <h2>Account</h2>
          <form onSubmit={handleProfileSave} style={{ display: 'contents' }}>
            <div className="form-grid" style={{ marginBottom: 12 }}>
              <label>
                Name
                <input
                  value={profileForm.name}
                  onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Your name"
                  disabled={profileSaving}
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="you@example.com"
                  disabled={profileSaving}
                />
              </label>
            </div>
            <div className="button-row">
              <button className="btn primary" type="submit" disabled={profileSaving}>
                {profileSaving ? 'Saving…' : 'Save Profile'}
              </button>
              <button className="btn secondary" type="button" onClick={logout}>
                Logout
              </button>
              <button className="btn danger-btn" type="button" onClick={() => setConfirmDelete(true)}>
                Delete Account
              </button>
            </div>
          </form>
        </section>

        {/* ── Change Password ── */}
        <section className="card settings-card">
          <h2>Change Password</h2>
          <form onSubmit={handleChangePassword}>
            <div className="form-grid" style={{ marginBottom: 12 }}>
              <label className="full">
                Current Password
                <input
                  type="password"
                  value={pwForm.currentPassword}
                  onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))}
                  placeholder="Your current password"
                  disabled={pwSaving}
                  autoComplete="current-password"
                />
              </label>
              <label>
                New Password
                <input
                  type="password"
                  value={pwForm.newPassword}
                  onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))}
                  placeholder="At least 6 characters"
                  disabled={pwSaving}
                  autoComplete="new-password"
                  minLength={6}
                />
              </label>
              <label>
                Confirm New Password
                <input
                  type="password"
                  value={pwForm.confirmPassword}
                  onChange={(e) => setPwForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                  placeholder="Repeat new password"
                  disabled={pwSaving}
                  autoComplete="new-password"
                />
              </label>
            </div>
            <button className="btn primary" type="submit" disabled={pwSaving}>
              {pwSaving ? 'Changing…' : 'Change Password'}
            </button>
          </form>
        </section>

        {/* ── Appearance ── */}
        <section className="card settings-card">
          <h2>Appearance</h2>
          <p>Choose how ExpenseFlow looks.</p>
          <div className="segmented">
            {['light', 'dark', 'system'].map((x) => (
              <button
                key={x}
                className={theme === x ? 'selected' : ''}
                onClick={() => setTheme(x)}
              >
                {x[0].toUpperCase() + x.slice(1)}
              </button>
            ))}
          </div>
        </section>

        {/* ── Currency ── */}
        <section className="card settings-card">
          <h2>Currency</h2>
          <p>Amounts will use your selected currency.</p>
          <select value={currency} onChange={(e) => saveCurrency(e.target.value)}>
            <option value="INR">INR ₹</option>
            <option value="USD">USD $</option>
            <option value="EUR">EUR €</option>
            <option value="GBP">GBP £</option>
          </select>
        </section>

        {/* ── Data Management ── */}
        <section className="card settings-card">
          <h2>Data Management</h2>
          <p>Export a backup, import data, or manage your transaction history.</p>

          {importError   && <p className="notice error">{importError}</p>}
          {importSuccess && <p className="notice success">{importSuccess}</p>}

          <div className="button-row" style={{ flexWrap: 'wrap', gap: 8 }}>
            <button className="btn secondary" onClick={exportCsv}>
              Export CSV
            </button>
            <button className="btn secondary" onClick={exportData}>
              Export JSON
            </button>
            <button className="btn secondary" onClick={importJson} disabled={migrating}>
              {migrating ? 'Importing…' : 'Import JSON'}
            </button>
            <button className="btn secondary" onClick={migrateLocalData} disabled={migrating}
              title="Move any transactions previously saved in this browser into your account">
              {migrating ? 'Migrating…' : 'Migrate Local Data'}
            </button>
            <button className="btn secondary" onClick={() => setConfirmSample(true)}>
              Load Sample Data
            </button>
            <button className="btn danger-btn" onClick={() => setConfirm(true)}>
              Clear All Data
            </button>
          </div>
        </section>

      </div>

      {/* ── Clear data confirmation ── */}
      <Modal
        open={confirm}
        title="Clear all data?"
        onClose={() => setConfirm(false)}
        actions={
          <>
            <button className="btn secondary" onClick={() => setConfirm(false)} disabled={clearing}>
              Cancel
            </button>
            <button className="btn danger-btn" onClick={handleClearAll} disabled={clearing}>
              {clearing ? 'Clearing…' : 'Clear Data'}
            </button>
          </>
        }
      >
        <p>This permanently removes all your transactions, budgets and goals from the server.</p>
      </Modal>

      {/* ── Delete account confirmation ── */}
      <Modal
        open={confirmDelete}
        title="Delete account?"
        onClose={() => setConfirmDelete(false)}
        actions={
          <>
            <button className="btn secondary" onClick={() => setConfirmDelete(false)} disabled={deleting}>
              Cancel
            </button>
            <button className="btn danger-btn" onClick={handleDeleteAccount} disabled={deleting}>
              {deleting ? 'Deleting…' : 'Yes, delete my account'}
            </button>
          </>
        }
      >
        <p>
          This will permanently delete your account and all associated data — transactions, budgets,
          goals, and settings. This action cannot be undone.
        </p>
      </Modal>

      {/* ── Load sample data confirmation ── */}
      <Modal
        open={confirmSample}
        title="Load sample data?"
        onClose={() => setConfirmSample(false)}
        actions={
          <>
            <button className="btn secondary" onClick={() => setConfirmSample(false)} disabled={sampling}>
              Cancel
            </button>
            <button className="btn primary" onClick={handleLoadSample} disabled={sampling}>
              {sampling ? 'Loading…' : 'Load Sample Data'}
            </button>
          </>
        }
      >
        <p>
          This will replace your current transactions, budgets and goals with the built-in sample
          dataset. Your existing data will be lost.
        </p>
      </Modal>
    </>
  );
}
