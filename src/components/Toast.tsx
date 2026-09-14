import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import type { ToastNotification } from "../types";

interface ToastProps {
  toasts: ToastNotification[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl border border-white/10 bg-[#0d121f]/95 shadow-2xl backdrop-blur-xl text-xs sm:text-sm text-slate-100 animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {t.type === "success" && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />}
            {t.type === "error" && <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />}
            {t.type === "info" && <Info className="h-4 w-4 text-cyan-400 shrink-0" />}
            <span className="truncate font-medium">{t.message}</span>
          </div>
          <button
            onClick={() => onDismiss(t.id)}
            className="p-1 text-slate-400 hover:text-white rounded-md transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
