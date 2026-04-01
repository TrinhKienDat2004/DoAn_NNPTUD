import { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import './Toast.css';

const icons = {
  success: <CheckCircle size={20} />,
  error: <XCircle size={20} />,
  info: <Info size={20} />
};

export default function Toast({ message, type = 'info', onClose, duration = 3500 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className={`toast toast-${type}`} role="alert">
      <span className="toast-icon">{icons[type]}</span>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose} aria-label="Đóng">
        <X size={16} />
      </button>
    </div>
  );
}
