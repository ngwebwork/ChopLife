import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Leaf,
  Zap,
  ShieldCheck,
  Wallet,
  Star,
  Quote,
} from "lucide-react";
import { menuService } from "@/services/menuService";
import { categoryService } from "@/services/categoryService";
import { useSettingsStore } from "@/store/settingsStore";
import type { Category, MenuItem } from "@/types";
import { FoodCard } from "@/components/menu/FoodCard";
import { CategoryCard } from "@/components/menu/CategoryCard";
import { MenuGridSkeleton } from "@/components/common/Skeleton";
import { Button } from "@/components/common/Button";

const whyChooseUs = [
  { icon: Leaf, title: "Fresh Ingredients", desc: "Sourced daily and prepared with care for every order." },
  { icon: Zap, title: "Fast Delivery", desc: "Hot meals delivered to your door across Lagos, fast." },
  { icon: ShieldCheck, title: "Secure Ordering", desc: "Your details are safe — order with confidence." },
  { icon: Wallet, title: "Affordable Prices", desc: "Great food that doesn't break the bank." },
];

const reviews = [
  {
    name: "Chiamaka O.",
    text: "The jollof rice tastes just like homemade! Delivery was fast and the rider was so polite.",
    rating: 5,
  },
  {
    name: "Tunde A.",
    text: "Ordered suya and shawarma for a small get-together — everyone kept asking where I got it from.",
    rating: 5,
  },
  {
    name: "Blessing E.",
    text: "My go-to for pounded yam and egusi when I don't feel like cooking. Never disappoints.",
    rating: 4,
  },
];

export function Home() {
  const [featured, setFeatured] = useState<MenuItem[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const { fetch: fetchSettings } = useSettingsStore();

  useEffect(() => {
    fetchSettings();
    menuService
      .list({ popular: true })
      .then((items) => setFeatured(items.slice(0, 8)))
      .catch(() => setFeatured([]));
    categoryService.list(true).then(setCategories).catch(() => setCategories([]));
  }, [fetchSettings]);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 to-cream">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-24 lg:px-8">
          <div className="animate-fade-in">
            <span className="inline-flex items-center rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-700">
              Now delivering across Lagos
            </span>
            <h1 className="mt-4 text-balance font-display text-4xl font-extrabold leading-tight text-ink-900 sm:text-5xl lg:text-6xl">
              Your favorite meals, delivered to your door.
            </h1>
            <p className="mt-5 max-w-lg text-base text-ink-600 sm:text-lg">
              Freshly prepared meals made with love and delivered straight to you.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/menu">
                <Button size="lg" icon={<ArrowRight size={18} />} className="flex-row-reverse">
                  Order Now
                </Button>
              </Link>
              <Link to="/menu">
                <Button size="lg" variant="outline">
                  Explore Menu
                </Button>
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-6 text-sm text-ink-600">
              <div>
                <p className="text-2xl font-extrabold text-ink-900">2,500+</p>
                <p>Happy customers</p>
              </div>
              <div className="h-10 w-px bg-ink-200" />
              <div>
                <p className="text-2xl font-extrabold text-ink-900">30 min</p>
                <p>Average delivery</p>
              </div>
            </div>
          </div>
          <div className="relative animate-slide-up">
            <div className="aspect-square w-full overflow-hidden rounded-[2rem] shadow-2xl shadow-brand-900/20">
              <img
                src="https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?q=80&w=1200&auto=format&fit=crop"
                alt="A vibrant plate of Nigerian jollof rice with grilled chicken and fried plantain"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 hidden rounded-2xl bg-white p-4 shadow-xl sm:block">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100 text-green-700">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-ink-900">Order Confirmed</p>
                  <p className="text-xs text-ink-400">Preparing your meal...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold text-ink-900 sm:text-3xl">Browse Categories</h2>
          <div className="mt-6 flex gap-4 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Meals */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-extrabold text-ink-900 sm:text-3xl">Featured Meals</h2>
          <Link to="/menu" className="text-sm font-semibold text-brand-700 hover:underline">
            View full menu
          </Link>
        </div>
        <div className="mt-6">
          {featured === null ? (
            <MenuGridSkeleton count={4} />
          ) : featured.length === 0 ? (
            <p className="text-sm text-ink-400">Menu is being updated — check back shortly.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {featured.map((item) => (
                <FoodCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-ink-900 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-extrabold text-white sm:text-3xl">
            Why Choose ChopLife Kitchen
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {whyChooseUs.map((item) => (
              <div key={item.title} className="rounded-2xl bg-white/5 p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-white">
                  <item.icon size={22} />
                </div>
                <h3 className="mt-4 text-sm font-bold text-white">{item.title}</h3>
                <p className="mt-1.5 text-xs text-ink-200">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-extrabold text-ink-900 sm:text-3xl">
          What Our Customers Say
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {reviews.map((review) => (
            <div key={review.name} className="rounded-2xl border border-ink-100 bg-white p-6">
              <Quote className="text-brand-200" size={28} />
              <p className="mt-3 text-sm text-ink-600">{review.text}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-bold text-ink-900">{review.name}</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-600">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Hungry? Let's fix that.</h2>
          <p className="mt-3 text-brand-50">Order now and taste the ChopLife difference.</p>
          <Link to="/menu" className="mt-7 inline-block">
            <Button size="lg" variant="secondary">
              Order Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
