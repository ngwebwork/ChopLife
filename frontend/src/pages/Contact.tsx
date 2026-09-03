import { useEffect, type FormEvent } from "react";
import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";
import { useSettingsStore } from "@/store/settingsStore";
import { Input, Textarea } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { toast } from "@/store/toastStore";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export function Contact() {
  useDocumentTitle("Contact Us");
  const { settings, fetch } = useSettingsStore();

  useEffect(() => {
    fetch();
  }, [fetch]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    toast.success("Thanks for reaching out! We'll get back to you shortly.");
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-display text-3xl font-extrabold text-ink-900 sm:text-4xl">Get in Touch</h1>
        <p className="mt-2 text-sm text-ink-400">
          Questions, feedback or a large order request? We'd love to hear from you.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-start gap-3 rounded-2xl border border-ink-100 bg-white p-5">
            <MapPin size={20} className="mt-0.5 shrink-0 text-brand-600" />
            <div>
              <p className="text-sm font-bold text-ink-900">Address</p>
              <p className="text-sm text-ink-500">{settings.address}</p>
            </div>
          </div>
          {settings.phone && (
            <div className="flex items-start gap-3 rounded-2xl border border-ink-100 bg-white p-5">
              <Phone size={20} className="mt-0.5 shrink-0 text-brand-600" />
              <div>
                <p className="text-sm font-bold text-ink-900">Phone</p>
                <a href={`tel:${settings.phone}`} className="text-sm text-ink-500 hover:text-brand-700">
                  {settings.phone}
                </a>
              </div>
            </div>
          )}
          <div className="flex items-start gap-3 rounded-2xl border border-ink-100 bg-white p-5">
            <Mail size={20} className="mt-0.5 shrink-0 text-brand-600" />
            <div>
              <p className="text-sm font-bold text-ink-900">Email</p>
              <p className="text-sm text-ink-500">hello@choplifekitchen.com</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-ink-100 bg-white p-5">
            <Clock size={20} className="mt-0.5 shrink-0 text-brand-600" />
            <div>
              <p className="text-sm font-bold text-ink-900">Opening Hours</p>
              <p className="text-sm text-ink-500">{settings.openingHours}</p>
            </div>
          </div>
          {settings.whatsapp && (
            <a
              href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-5 py-3.5 text-sm font-bold text-white hover:bg-green-700"
            >
              <MessageCircle size={18} />
              Chat on WhatsApp
            </a>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-ink-100 bg-white p-6 lg:col-span-3">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Full Name" placeholder="Your name" required />
            <Input label="Phone Number" type="tel" placeholder="080X XXX XXXX" required />
          </div>
          <Input label="Email" type="email" placeholder="you@example.com" required />
          <Textarea label="Message" placeholder="How can we help?" rows={5} required />
          <Button type="submit" size="lg" fullWidth>
            Send Message
          </Button>
        </form>
      </div>
    </div>
  );
}
