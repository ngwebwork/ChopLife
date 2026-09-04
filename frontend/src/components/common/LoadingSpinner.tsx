import { Loader2 } from "lucide-react";
import clsx from "clsx";

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
  label?: string;
  fullPage?: boolean;
}

export function LoadingSpinner({ size = 32, className, label, fullPage }: LoadingSpinnerProps) {
  const content = (
    <div className={clsx("flex flex-col items-center justify-center gap-3 text-brand-600", className)}>
      <Loader2 className="animate-spin" size={size} />
      {label && <p className="text-sm font-medium text-ink-600">{label}</p>}
    </div>
  );

  if (fullPage) {
    return <div className="flex min-h-[50vh] w-full items-center justify-center">{content}</div>;
  }

  return content;
}
