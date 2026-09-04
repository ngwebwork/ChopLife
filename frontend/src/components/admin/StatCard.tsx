import type { LucideIcon } from "lucide-react";
import clsx from "clsx";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  accent?: "brand" | "green" | "amber" | "blue";
}

const accentClasses = {
  brand: "bg-brand-50 text-brand-600",
  green: "bg-green-50 text-green-600",
  amber: "bg-amber-50 text-amber-600",
  blue: "bg-blue-50 text-blue-600",
};

export function StatCard({ icon: Icon, label, value, accent = "brand" }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5">
      <div className={clsx("flex h-10 w-10 items-center justify-center rounded-xl", accentClasses[accent])}>
        <Icon size={20} />
      </div>
      <p className="mt-4 text-2xl font-extrabold text-ink-900">{value}</p>
      <p className="mt-1 text-sm text-ink-400">{label}</p>
    </div>
  );
}
