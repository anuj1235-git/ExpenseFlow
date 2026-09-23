import { createContext, useCallback, useContext, useState } from 'react';
import ToastContainer from '../components/ui/Toast';

const C = createContext();

let _nextId = 1;

/**
 * ToastProvider — wraps the app and renders the toast container.
 *
 * Provides:
 *   toast.success(message)
 *   toast.error(message)
 *   toast.warning(message)
 *   toast.info(message)
 *   toast(message, type?)   ← generic
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((message, type = 'info') => {
    const id = _nextId++;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const toast = useCallback(
    Object.assign(
      (message, type) => show(message, type),
      {
        success: (msg) => show(msg, 'success'),
        error  : (msg) => show(msg, 'error'),
        warning: (msg) => show(msg, 'warning'),
        info   : (msg) => show(msg, 'info'),
      }
    ),
    [show] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <C.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </C.Provider>
  );
}

export const useToast = () => useContext(C);
