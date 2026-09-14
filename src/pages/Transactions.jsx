import { useMemo, useState } from 'react';
import { Search, RotateCcw, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';
import { paymentMethods } from '../data/categories';
import TransactionList from '../components/transactions/TransactionList';
import TransactionForm from '../components/transactions/TransactionForm';
import TransactionDetailModal from '../components/transactions/TransactionDetailModal';
import Modal from '../components/ui/Modal';

const SORT_OPTIONS = [
  { value: 'date-desc',   label: 'Newest first' },
  { value: 'date-asc',    label: 'Oldest first' },
  { value: 'amount-desc', label: 'Highest amount' },
  { value: 'amount-asc',  label: 'Lowest amount' },
  { value: 'az',          label: 'A → Z' },
  { value: 'za',          label: 'Z → A' },
];

const DEFAULT_FILTERS = {
  q: '',
  type: 'all',
  cat: 'all',
  payment: 'all',
  dateFrom: '',
  dateTo: '',
  amtMin: '',
  amtMax: '',
  sort: 'date-desc',
};

export default function Transactions() {
  const { transactions, updateTransaction, deleteTransaction } = useExpense();

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [view, setView] = useState(null);
  const [edit, setEdit] = useState(null);
  const [del,  setDel]  = useState(null);

  const set = (key, val) => setFilters(f => ({ ...f, [key]: val }));

  const categories = useMemo(
    () => [...new Set(transactions.map(t => t.category))].sort(),
    [transactions]
  );

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (filters.payment  !== 'all') n++;
    if (filters.dateFrom !== '')    n++;
    if (filters.dateTo   !== '')    n++;
    if (filters.amtMin   !== '')    n++;
    if (filters.amtMax   !== '')    n++;
    return n;
  }, [filters]);

  const filtered = useMemo(() => {
    const q      = filters.q.toLowerCase();
    const minAmt = filters.amtMin !== '' ? Number(filters.amtMin) : null;
    const maxAmt = filters.amtMax !== '' ? Number(filters.amtMax) : null;

    let result = transactions.filter(t => {
      if (filters.type !== 'all' && t.type !== filters.type) return false;
      if (filters.cat  !== 'all' && t.category !== filters.cat) return false;
      if (filters.payment !== 'all' && t.paymentMethod !== filters.payment) return false;
      if (filters.dateFrom && t.date < filters.dateFrom) return false;
      if (filters.dateTo   && t.date > filters.dateTo)   return false;
      if (minAmt !== null && Number(t.amount) < minAmt) return false;
      if (maxAmt !== null && Number(t.amount) > maxAmt) return false;
      if (q && ![t.description, t.category, t.paymentMethod, t.notes]
                  .join(' ').toLowerCase().includes(q)) return false;
      return true;
    });

    switch (filters.sort) {
      case 'date-asc':    result.sort((a, b) => new Date(a.date) - new Date(b.date)); break;
      case 'date-desc':   result.sort((a, b) => new Date(b.date) - new Date(a.date)); break;
      case 'amount-desc': result.sort((a, b) => Number(b.amount) - Number(a.amount)); break;
      case 'amount-asc':  result.sort((a, b) => Number(a.amount) - Number(b.amount)); break;
      case 'az':          result.sort((a, b) => (a.description||'').localeCompare(b.description||'')); break;
      case 'za':          result.sort((a, b) => (b.description||'').localeCompare(a.description||'')); break;
    }
    return result;
  }, [transactions, filters]);

  const reset = () => {
    setFilters(DEFAULT_FILTERS);
    setShowAdvanced(false);
  };

  const isDirty = JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS);

  return (
    <>
      <div className="page-title">
        <div>
          <p className="eyebrow">Manage</p>
          <h1>Transactions</h1>
        </div>
        <span className="tx-count">{filtered.length} of {transactions.length}</span>
      </div>

      {/* ── Primary filter bar ── */}
      <section className="card filters-card">
        <div className="filters-row">
          <div className="search">
            <Search size={16} />
            <input
              value={filters.q}
              onChange={e => set('q', e.target.value)}
              placeholder="Search description, category, notes…"
            />
          </div>

          <select value={filters.type} onChange={e => set('type', e.target.value)}>
            <option value="all">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <select value={filters.cat} onChange={e => set('cat', e.target.value)}>
            <option value="all">All categories</option>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>

          <select value={filters.sort} onChange={e => set('sort', e.target.value)}>
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <button
            className={`btn secondary filter-toggle ${showAdvanced ? 'active' : ''}`}
            onClick={() => setShowAdvanced(v => !v)}
            aria-expanded={showAdvanced}
          >
            <SlidersHorizontal size={15} />
            Filters
            {activeFilterCount > 0 && (
              <span className="filter-badge">{activeFilterCount}</span>
            )}
            <ChevronDown size={14} className={`chevron ${showAdvanced ? 'open' : ''}`} />
          </button>

          {isDirty && (
            <button className="btn secondary" onClick={reset} title="Reset all filters">
              <RotateCcw size={15} /> Reset
            </button>
          )}
        </div>

        {/* ── Advanced filters panel ── */}
        {showAdvanced && (
          <div className="advanced-filters">
            <label className="adv-label">
              Payment Method
              <select value={filters.payment} onChange={e => set('payment', e.target.value)}>
                <option value="all">All methods</option>
                {paymentMethods.map(m => <option key={m}>{m}</option>)}
              </select>
            </label>

            <label className="adv-label">
              Date From
              <input
                type="date"
                value={filters.dateFrom}
                max={filters.dateTo || undefined}
                onChange={e => set('dateFrom', e.target.value)}
              />
            </label>

            <label className="adv-label">
              Date To
              <input
                type="date"
                value={filters.dateTo}
                min={filters.dateFrom || undefined}
                onChange={e => set('dateTo', e.target.value)}
              />
            </label>

            <label className="adv-label">
              Min Amount
              <input
                type="number"
                min="0"
                value={filters.amtMin}
                onChange={e => set('amtMin', e.target.value)}
                placeholder="0"
              />
            </label>

            <label className="adv-label">
              Max Amount
              <input
                type="number"
                min="0"
                value={filters.amtMax}
                onChange={e => set('amtMax', e.target.value)}
                placeholder="Any"
              />
            </label>
          </div>
        )}
      </section>

      {/* ── Results ── */}
      <section className="card">
        <TransactionList items={filtered} onEdit={setEdit} onDelete={setDel} onView={setView} />
      </section>

      {/* ── Detail modal ── */}
      <TransactionDetailModal
        transaction={view}
        onClose={() => setView(null)}
        onEdit={t => { setView(null); setEdit(t); }}
        onDelete={id => { deleteTransaction(id); setView(null); }}
      />

      {/* ── Edit modal ── */}
      <Modal open={!!edit} title="Edit Transaction" onClose={() => setEdit(null)}>
        <TransactionForm
          initial={edit}
          onSubmit={t => { updateTransaction(t); setEdit(null); }}
          onCancel={() => setEdit(null)}
        />
      </Modal>

      {/* ── Delete modal ── */}
      <Modal
        open={!!del}
        title="Delete transaction?"
        onClose={() => setDel(null)}
        actions={
          <>
            <button className="btn secondary" onClick={() => setDel(null)}>Cancel</button>
            <button className="btn danger-btn" onClick={() => { deleteTransaction(del); setDel(null); }}>
              Delete
            </button>
          </>
        }
      >
        <p>Are you sure you want to delete this transaction? This action cannot be undone.</p>
      </Modal>
    </>
  );
}
