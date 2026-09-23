import { useEffect, useRef } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';

const ICONS = {
  success: CheckCircle2,
  error  : XCircle,
  warning: AlertCircle,
  info   : Info,
};

const COLORS = {
  success: '#16a34a',
  error  : '#dc2626',
  warning: '#d97706',
  info   : '#0891b2',
};

/**
 * Single toast item.
 * Props: { id, type, message, onDismiss }
 */
function ToastItem({ id, type = 'info', message, onDismiss }) {
  const timer = useRef(null);
  const Icon  = ICONS[type] || Info;
  const color = COLORS[type] || COLORS.info;

  useEffect(() => {
    timer.current = setTimeout(() => onDismiss(id), 4000);
    return () => clearTimeout(timer.current);
  }, [id, onDismiss]);

  return (
    <div
      className={`toast toast-${type}`}
      role="alert"
      aria-live="polite"
      style={{ '--toast-color': color }}
    >
      <Icon size={18} style={{ color, flexShrink: 0 }} />
      <span>{message}</span>
      <button
        className="toast-close"
        onClick={() => onDismiss(id)}
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </div>
  );
}

/**
 * Toast container — renders all active toasts.
 * Place once inside the app (already added to App.jsx via ToastProvider).
 */
export default function ToastContainer({ toasts, onDismiss }) {
  if (!toasts.length) return null;
  return (
    <div className="toast-container" aria-label="Notifications">
      {toasts.map((t) => (
        <ToastItem key={t.id} {...t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
