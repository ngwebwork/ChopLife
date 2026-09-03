import { Leaf, Truck, Heart, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/common/Button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const values = [
  { icon: Leaf, title: "Fresh, Always", desc: "We prepare every dish fresh, using quality local ingredients sourced daily." },
  { icon: Truck, title: "Speed You Can Trust", desc: "Our delivery network is built to get hot food to you fast, every time." },
  { icon: Heart, title: "Made With Love", desc: "Every recipe is crafted the way Nigerian home cooking should taste." },
  { icon: Users, title: "Community First", desc: "We're proud to serve neighborhoods across Lagos and beyond." },
];

export function About() {
  useDocumentTitle("About Us");
  return (
    <div>
      <section className="bg-gradient-to-b from-brand-50 to-cream px-4 py-16 text-center sm:px-6">
        <h1 className="font-display text-3xl font-extrabold text-ink-900 sm:text-4xl">
          About ChopLife Kitchen
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-ink-600">
          We started ChopLife Kitchen with one goal: bring the authentic taste of Nigerian home
          cooking to your doorstep, fast, fresh and stress-free.
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {values.map((v) => (
            <div key={v.title} className="rounded-2xl border border-ink-100 bg-white p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <v.icon size={20} />
              </div>
              <h3 className="mt-4 text-base font-bold text-ink-900">{v.title}</h3>
              <p className="mt-1.5 text-sm text-ink-400">{v.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl bg-ink-900 p-8 text-center sm:p-12">
          <h2 className="font-display text-xl font-extrabold text-white sm:text-2xl">
            Ready to taste the ChopLife difference?
          </h2>
          <Link to="/menu" className="mt-6 inline-block">
            <Button size="lg">Order Now</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
