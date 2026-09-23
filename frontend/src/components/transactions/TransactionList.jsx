import { Pencil, Trash2, ArrowDownLeft, ArrowUpRight, Eye } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';

export default function TransactionList({ items, onEdit, onDelete, onView }) {
  if (!items.length) return (
    <div className="empty">
      <div className="empty-icon">₹</div>
      <h3>No transactions found</h3>
      <p>Start tracking your finances by adding your first transaction.</p>
    </div>
  );

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Category</th>
            <th>Payment</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((t) => {
            // Normalise _id (from MongoDB) and id (from legacy / client-added) so
            // both key and delete/edit callbacks always have a valid string id.
            const rowId = (t._id ?? t.id)?.toString();
            return (
              <tr
                key={rowId}
                className="tx-row"
                onClick={() => onView?.(t)}
                style={{ cursor: onView ? 'pointer' : 'default' }}
              >
                <td>{new Date(t.date).toLocaleDateString('en-IN')}</td>
                <td><strong>{t.description || 'Untitled'}</strong></td>
                <td>{t.category}</td>
                <td>{t.paymentMethod}</td>
                <td>
                  <span className={`pill ${t.type}`}>
                    {t.type === 'income'
                      ? <ArrowDownLeft size={13} />
                      : <ArrowUpRight  size={13} />}
                    {t.type}
                  </span>
                </td>
                <td className={t.type === 'income' ? 'income' : 'expense'}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  {onView && (
                    <button className="icon-btn" onClick={() => onView(t)} aria-label="View details">
                      <Eye size={15} />
                    </button>
                  )}
                  <button className="icon-btn" onClick={() => onEdit(t)} aria-label="Edit">
                    <Pencil size={15} />
                  </button>
                  <button className="icon-btn danger" onClick={() => onDelete(rowId)} aria-label="Delete">
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
