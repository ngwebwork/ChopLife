import { create } from "zustand";
import type { Settings } from "@/types";
import { settingsService } from "@/services/settingsService";

const FALLBACK_SETTINGS: Settings = {
  id: "restaurant_settings",
  restaurantName: "ChopLife Kitchen",
  tagline: "Fresh meals. Fast delivery. No stress.",
  logo: "",
  phone: "",
  whatsapp: import.meta.env.VITE_WHATSAPP_NUMBER || "",
  address: "Lagos, Nigeria",
  openingHours: "Mon - Sun: 9:00 AM - 10:00 PM",
  deliveryFee: 1500,
  minimumOrder: 2000,
  facebook: "",
  instagram: "",
  twitter: "",
  updatedAt: new Date().toISOString(),
};

interface SettingsState {
  settings: Settings;
  loaded: boolean;
  fetch: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>()((set, get) => ({
  settings: FALLBACK_SETTINGS,
  loaded: false,
  fetch: async () => {
    if (get().loaded) return;
    try {
      const settings = await settingsService.get();
      set({ settings, loaded: true });
    } catch {
      set({ loaded: true });
    }
  },
}));
