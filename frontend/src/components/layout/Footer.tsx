import { Link } from "react-router-dom";
import { MapPin, Phone, Clock, UtensilsCrossed } from "lucide-react";
import { useEffect } from "react";
import { useSettingsStore } from "@/store/settingsStore";
import { FacebookIcon, InstagramIcon, XIcon } from "@/components/common/SocialIcons";

export function Footer() {
  const { settings, fetch } = useSettingsStore();

  useEffect(() => {
    fetch();
  }, [fetch]);

  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-ink-100 bg-ink-900 text-ink-100">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-white">
              <UtensilsCrossed size={18} />
            </span>
            <span className="font-display text-lg font-extrabold text-white">
              ChopLife<span className="text-brand-500"> Kitchen</span>
            </span>
          </div>
          <p className="mt-4 text-sm text-ink-200">{settings.tagline}</p>
          <div className="mt-5 flex gap-3">
            {settings.facebook && (
              <a
                href={settings.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="ChopLife Kitchen on Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
              >
                <FacebookIcon size={16} />
              </a>
            )}
            {settings.instagram && (
              <a
                href={settings.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="ChopLife Kitchen on Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
              >
                <InstagramIcon size={16} />
              </a>
            )}
            {settings.twitter && (
              <a
                href={settings.twitter}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="ChopLife Kitchen on Twitter"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
              >
                <XIcon size={16} />
              </a>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-white">Quick Links</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-200">
            <li><Link to="/" className="hover:text-white">Home</Link></li>
            <li><Link to="/menu" className="hover:text-white">Menu</Link></li>
            <li><Link to="/about" className="hover:text-white">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
            <li><Link to="/track" className="hover:text-white">Track Order</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-white">Contact</h3>
          <ul className="mt-4 space-y-3 text-sm text-ink-200">
            <li className="flex items-start gap-2.5">
              <MapPin size={16} className="mt-0.5 shrink-0 text-brand-500" />
              <span>{settings.address}</span>
            </li>
            {settings.phone && (
              <li className="flex items-center gap-2.5">
                <Phone size={16} className="shrink-0 text-brand-500" />
                <a href={`tel:${settings.phone}`} className="hover:text-white">{settings.phone}</a>
              </li>
            )}
            <li className="flex items-center gap-2.5">
              <Clock size={16} className="shrink-0 text-brand-500" />
              <span>{settings.openingHours}</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-white">Order via WhatsApp</h3>
          <p className="mt-4 text-sm text-ink-200">
            Prefer to chat? Message us directly and we'll take your order.
          </p>
          {settings.whatsapp && (
            <a
              href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
            >
              Chat on WhatsApp
            </a>
          )}
        </div>
      </div>

      <div className="border-t border-white/10 py-5 text-center text-xs text-ink-400">
        &copy; {year} {settings.restaurantName}. All rights reserved.
      </div>
    </footer>
  );
}
