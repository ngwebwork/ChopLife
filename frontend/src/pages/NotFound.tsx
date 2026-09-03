import { Link } from "react-router-dom";
import { UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/common/Button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export function NotFound() {
  useDocumentTitle("Page Not Found");
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        <UtensilsCrossed size={28} />
      </div>
      <h1 className="mt-5 font-display text-3xl font-extrabold text-ink-900">404</h1>
      <p className="mt-2 text-sm text-ink-400">
        This page seems to have wandered off the menu.
      </p>
      <Link to="/" className="mt-6">
        <Button>Back to Home</Button>
      </Link>
    </div>
  );
}
