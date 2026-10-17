import React, { createContext, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, X, Sparkles } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

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
            className={`pointer-events-auto p-4 rounded-2xl shadow-[0_4px_#0B192C] border-2 bg-white flex items-center justify-between gap-3 animate-slide-in-right transform-gpu transition-all ${
              toast.type === 'success'
                ? 'border-[#059669]'
                : toast.type === 'error'
                ? 'border-[#DC2626]'
                : 'border-[#0B192C]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border-2 ${
                  toast.type === 'success'
                    ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]'
                    : toast.type === 'error'
                    ? 'bg-rose-50 text-rose-600 border-rose-200'
                    : 'bg-[#FAF8F5] text-[#1E3E62] border-[#E6E2D8]'
                }`}
              >
                {toast.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
                {toast.type === 'error' && <AlertCircle className="w-4 h-4" />}
                {toast.type === 'info' && <Sparkles className="w-4 h-4" />}
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#5A6A80] block">
                  {toast.type === 'success' ? '✦ DraftForge Intelligence' : toast.type === 'error' ? '⚠ System Advisory' : '◆ Studio Event'}
                </span>
                <p className="text-xs font-bold leading-relaxed text-[#0B192C]">{toast.message}</p>
              </div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1.5 rounded-lg text-[#5A6A80] hover:text-[#0B192C] hover:bg-[#F3F0EA] transition-colors shrink-0"
              aria-label="Dismiss toast"
            >
              <X className="w-4 h-4" />
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
