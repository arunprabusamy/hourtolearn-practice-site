import { useEffect, useRef, useState } from 'react';
import './ToastNotification.css';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastNotificationProps {
  variant: ToastVariant;
  message: string;
  onDismiss?: () => void;
  autoDismissMs?: number;
}

export function ToastNotification({ variant, message, onDismiss, autoDismissMs }: ToastNotificationProps) {
  const [dismissCount, setDismissCount] = useState(0);
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  function dismiss() {
    setDismissCount((count) => count + 1);
    onDismissRef.current?.();
  }

  useEffect(() => {
    if (!autoDismissMs) return;
    const timer = setTimeout(dismiss, autoDismissMs);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoDismissMs]);

  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if (e.key === 'Escape') dismiss();
    }
    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, []);

  return (
    <div
      className={`toast-notification toast-notification--${variant}`}
      role={variant === 'error' ? 'alert' : 'status'}
      data-testid="toast-notification"
    >
      <span className="toast-notification-message" title={message} data-testid="toast-message-text">
        {message}
      </span>
      <button type="button" data-testid="toast-close" onClick={dismiss}>
        Dismiss
      </button>
      <span hidden data-testid="toast-dismiss-count">
        {dismissCount}
      </span>
    </div>
  );
}
