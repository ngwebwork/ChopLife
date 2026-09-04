import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu as MenuIcon, ShoppingCart, X, UtensilsCrossed, Search } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Menu" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
  { to: "/track", label: "Order Tracking" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const totalItems = useCartStore((s) => s.totalItems());

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-cream/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 shrink-0" aria-label="ChopLife Kitchen home">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-white">
            <UtensilsCrossed size={18} />
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight text-ink-900">
            ChopLife<span className="text-brand-600"> Kitchen</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  isActive ? "bg-brand-50 text-brand-700" : "text-ink-600 hover:text-ink-900"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/menu"
            className="hidden rounded-full p-2.5 text-ink-600 hover:bg-ink-100 sm:flex"
            aria-label="Search menu"
          >
            <Search size={20} />
          </Link>
          <Link
            to="/cart"
            className="relative flex items-center gap-2 rounded-full bg-ink-900 px-3 py-2.5 text-white hover:bg-ink-800 sm:px-4"
            aria-label={`Cart, ${totalItems} items`}
          >
            <ShoppingCart size={18} />
            <span className="hidden text-sm font-semibold sm:inline">Cart</span>
            {totalItems > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-[11px] font-bold text-white">
                {totalItems}
              </span>
            )}
          </Link>
          <button
            className="rounded-full p-2.5 text-ink-700 hover:bg-ink-100 lg:hidden"
            onClick={() => setIsOpen((v) => !v)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={22} /> : <MenuIcon size={22} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <nav
          className="border-t border-ink-100 bg-cream px-4 pb-4 pt-2 lg:hidden animate-slide-up"
          aria-label="Mobile navigation"
        >
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `rounded-xl px-4 py-3 text-sm font-semibold ${
                    isActive ? "bg-brand-50 text-brand-700" : "text-ink-700 hover:bg-ink-100"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
