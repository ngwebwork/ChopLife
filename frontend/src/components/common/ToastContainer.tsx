import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import clsx from "clsx";
import { useToastStore } from "@/store/toastStore";
import type { ToastType } from "@/store/toastStore";

const config: Record<ToastType, { icon: typeof CheckCircle2; classes: string }> = {
  success: { icon: CheckCircle2, classes: "bg-white border-green-200 text-green-800" },
  error: { icon: XCircle, classes: "bg-white border-red-200 text-red-800" },
  info: { icon: Info, classes: "bg-white border-ink-200 text-ink-800" },
};

export function ToastContainer() {
  const { toasts, dismiss } = useToastStore();

  return (
    <div
      className="fixed bottom-4 left-1/2 z-[100] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 flex-col gap-2 sm:bottom-6 sm:left-auto sm:right-6 sm:w-full sm:translate-x-0"
      aria-live="polite"
    >
      {toasts.map((t) => {
        const { icon: Icon, classes } = config[t.type];
        return (
          <div
            key={t.id}
            className={clsx(
              "flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg animate-slide-up",
              classes
            )}
            role="status"
          >
            <Icon size={18} className="mt-0.5 shrink-0" />
            <p className="flex-1 text-sm font-medium">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="shrink-0 text-current opacity-60 hover:opacity-100 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
