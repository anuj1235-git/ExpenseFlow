import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExpense } from '../context/ExpenseContext';
import { useToast }   from '../context/ToastContext';
import TransactionForm from '../components/transactions/TransactionForm';

export default function AddTransaction() {
  const nav = useNavigate();
  const { addTransaction } = useExpense();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');

  async function handleSubmit(t) {
    setSubmitting(true);
    setError('');
    try {
      await addTransaction(t);
      toast.success('Transaction added successfully.');
      nav('/transactions');
    } catch (err) {
      const msg = err.message || 'Failed to add transaction. Please try again.';
      setError(msg);
      toast.error(msg);
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="page-title">
        <div>
          <p className="eyebrow">New Entry</p>
          <h1>Add Transaction</h1>
        </div>
      </div>

      <section className="card form-card">
        {error && <div className="form-error" style={{ marginBottom: 12 }}>{error}</div>}
        <TransactionForm
          onSubmit={handleSubmit}
          onCancel={() => nav('/transactions')}
          disabled={submitting}
        />
        {submitting && (
          <p style={{ textAlign: 'center', color: '#64748b', marginTop: 8 }}>Saving…</p>
        )}
      </section>
    </>
  );
}
