import {
  ArrowDownLeft, ArrowUpRight,
  Calendar, Tag, CreditCard,
  FileText, StickyNote, Pencil, Trash2
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import Modal from '../ui/Modal';

function DetailRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="tx-detail-row">
      <div className="tx-detail-icon"><Icon size={15} /></div>
      <div className="tx-detail-body">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

export default function TransactionDetailModal({ transaction: t, onClose, onEdit, onDelete }) {
  if (!t) return null;

  const isIncome = t.type === 'income';

  return (
    <Modal
      open={!!t}
      title="Transaction Details"
      onClose={onClose}
      actions={
        <>
          <button
            className="btn danger-btn"
            onClick={() => { onDelete(t.id); onClose(); }}
          >
            <Trash2 size={15} /> Delete
          </button>
          <button
            className="btn primary"
            onClick={() => { onEdit(t); onClose(); }}
          >
            <Pencil size={15} /> Edit
          </button>
        </>
      }
    >
      {/* Amount hero */}
      <div className={`tx-detail-hero ${isIncome ? 'income-hero' : 'expense-hero'}`}>
        <div className="tx-detail-type-icon">
          {isIncome ? <ArrowDownLeft size={22} /> : <ArrowUpRight size={22} />}
        </div>
        <div>
          <div className="tx-detail-amount">
            {isIncome ? '+' : '-'}{formatCurrency(t.amount)}
          </div>
          <div className="tx-detail-type-label">
            {isIncome ? 'Income' : 'Expense'}
          </div>
        </div>
      </div>

      {/* Detail rows */}
      <div className="tx-detail-rows">
        <DetailRow
          icon={FileText}
          label="Description"
          value={t.description || 'Untitled'}
        />
        <DetailRow
          icon={Tag}
          label="Category"
          value={t.category}
        />
        <DetailRow
          icon={Calendar}
          label="Date"
          value={new Date(t.date).toLocaleDateString('en-IN', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
          })}
        />
        <DetailRow
          icon={CreditCard}
          label="Payment Method"
          value={t.paymentMethod}
        />
        {t.notes && (
          <DetailRow
            icon={StickyNote}
            label="Notes"
            value={t.notes}
          />
        )}
      </div>
    </Modal>
  );
}
