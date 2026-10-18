import React, { createContext, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, X, Sparkles } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-lg shadow-md border bg-white flex items-center justify-between gap-3 animate-slide-in-right transform-gpu transition-all font-sans ${
              toast.type === 'success'
                ? 'border-[#557B68]/40 border-l-4 border-l-[#557B68]'
                : toast.type === 'error'
                ? 'border-rose-300 border-l-4 border-l-rose-600'
                : toast.type === 'warning'
                ? 'border-amber-300 border-l-4 border-l-[#C78335]'
                : 'border-[#E5DED2] border-l-4 border-l-[#20344A]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-7 h-7 rounded flex items-center justify-center shrink-0 border ${
                  toast.type === 'success'
                    ? 'bg-[#E8F3ED] text-[#557B68] border-[#557B68]/30'
                    : toast.type === 'error'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : toast.type === 'warning'
                    ? 'bg-[#FBF0E4] text-[#C78335] border-[#C78335]/30'
                    : 'bg-[#F4EFEA] text-[#20344A] border-[#E5DED2]'
                }`}
              >
                {toast.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5" />}
                {toast.type === 'error' && <AlertCircle className="w-3.5 h-3.5" />}
                {toast.type === 'warning' && <AlertCircle className="w-3.5 h-3.5" />}
                {toast.type === 'info' && <Sparkles className="w-3.5 h-3.5" />}
              </div>
              <div>
                <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-[#74777D] block">
                  {toast.type === 'success'
                    ? 'Notice'
                    : toast.type === 'error'
                    ? 'Attention Required'
                    : toast.type === 'warning'
                    ? 'Advisory'
                    : 'Information'}
                </span>
                <p className="text-xs font-medium leading-relaxed text-[#20344A]">{toast.message}</p>
              </div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded text-[#74777D] hover:text-[#20344A] hover:bg-[#F3EFE6] transition-colors shrink-0"
              aria-label="Dismiss toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
