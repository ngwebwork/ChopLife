import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Save } from "lucide-react";
import { settingsService } from "@/services/settingsService";
import type { Settings } from "@/types";
import { Input, Textarea } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { toast } from "@/store/toastStore";
import { getErrorMessage } from "@/services/api";
import { useSettingsStore } from "@/store/settingsStore";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

type SettingsFormValues = Omit<Settings, "id" | "updatedAt">;

export function AdminSettings() {
  useDocumentTitle("Restaurant Settings");
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset } = useForm<SettingsFormValues>();

  useEffect(() => {
    settingsService.get().then((data) => {
      setSettings(data);
      reset(data);
    });
  }, [reset]);

  const onSubmit = async (data: SettingsFormValues) => {
    setSaving(true);
    try {
      const updated = await settingsService.update({
        ...data,
        deliveryFee: Number(data.deliveryFee),
        minimumOrder: Number(data.minimumOrder),
      });
      setSettings(updated);
      useSettingsStore.setState({ settings: updated, loaded: true });
      toast.success("Settings updated");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (!settings) {
    return <LoadingSpinner fullPage label="Loading settings..." />;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold text-ink-900">Restaurant Settings</h1>
        <p className="mt-1 text-sm text-ink-400">
          These settings power the storefront, WhatsApp links and delivery pricing.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-6">
        <section className="rounded-2xl border border-ink-100 bg-white p-5">
          <h2 className="mb-4 text-base font-bold text-ink-900">General</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Restaurant Name" {...register("restaurantName")} />
            <Input label="Tagline" {...register("tagline")} />
            <div className="sm:col-span-2">
              <Input label="Logo URL" placeholder="https://..." {...register("logo")} />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-ink-100 bg-white p-5">
          <h2 className="mb-4 text-base font-bold text-ink-900">Contact & Location</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Phone" {...register("phone")} />
            <Input label="WhatsApp Number" placeholder="2348012345678" {...register("whatsapp")} />
            <div className="sm:col-span-2">
              <Textarea label="Address" rows={2} {...register("address")} />
            </div>
            <div className="sm:col-span-2">
              <Input label="Opening Hours" {...register("openingHours")} />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-ink-100 bg-white p-5">
          <h2 className="mb-4 text-base font-bold text-ink-900">Delivery & Orders</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Delivery Fee (₦)" type="number" min={0} {...register("deliveryFee")} />
            <Input label="Minimum Order (₦)" type="number" min={0} {...register("minimumOrder")} />
          </div>
        </section>

        <section className="rounded-2xl border border-ink-100 bg-white p-5">
          <h2 className="mb-4 text-base font-bold text-ink-900">Social Media</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Facebook URL" {...register("facebook")} />
            <Input label="Instagram URL" {...register("instagram")} />
            <Input label="Twitter URL" {...register("twitter")} />
          </div>
        </section>

        <Button type="submit" size="lg" loading={saving} icon={<Save size={18} />}>
          Save Settings
        </Button>
      </form>
    </div>
  );
}
