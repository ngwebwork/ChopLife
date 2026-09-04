import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Modal } from "@/components/common/Modal";
import { Input, Textarea } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import type { Category, Extra, MenuItem } from "@/types";

interface MenuItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: {
    name: string;
    description: string;
    price: number;
    categoryId: string;
    image: string;
    ingredients: string[];
    extras: Extra[];
    available: boolean;
    popular: boolean;
    rating: number;
  }) => Promise<void>;
  categories: Category[];
  initial?: MenuItem | null;
}

export function MenuItemFormModal({ isOpen, onClose, onSave, categories, initial }: MenuItemFormModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [image, setImage] = useState("");
  const [ingredientsText, setIngredientsText] = useState("");
  const [extras, setExtras] = useState<Extra[]>([]);
  const [available, setAvailable] = useState(true);
  const [popular, setPopular] = useState(false);
  const [rating, setRating] = useState("4.5");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (initial) {
      setName(initial.name);
      setDescription(initial.description);
      setPrice(String(initial.price));
      setCategoryId(initial.categoryId);
      setImage(initial.image);
      setIngredientsText(initial.ingredients.join(", "));
      setExtras(initial.extras);
      setAvailable(initial.available);
      setPopular(initial.popular);
      setRating(String(initial.rating));
    } else {
      setName("");
      setDescription("");
      setPrice("");
      setCategoryId(categories[0]?.id || "");
      setImage("");
      setIngredientsText("");
      setExtras([]);
      setAvailable(true);
      setPopular(false);
      setRating("4.5");
    }
  }, [isOpen, initial, categories]);

  const addExtra = () => setExtras([...extras, { name: "", price: 0 }]);
  const updateExtra = (index: number, field: keyof Extra, value: string) => {
    setExtras(
      extras.map((e, i) =>
        i === index ? { ...e, [field]: field === "price" ? Number(value) || 0 : value } : e
      )
    );
  };
  const removeExtra = (index: number) => setExtras(extras.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await onSave({
        name,
        description,
        price: Number(price) || 0,
        categoryId,
        image: image || "https://placehold.co/600x450/EA580C/ffffff?text=" + encodeURIComponent(name || "Food"),
        ingredients: ingredientsText.split(",").map((s) => s.trim()).filter(Boolean),
        extras: extras.filter((e) => e.name.trim() !== ""),
        available,
        popular,
        rating: Number(rating) || 0,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initial ? "Edit Food Item" : "Add Food Item"} size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input
            label="Price (₦)"
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>

        <Textarea
          label="Description"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-800">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Rating (0-5)"
            type="number"
            step="0.1"
            min={0}
            max={5}
            value={rating}
            onChange={(e) => setRating(e.target.value)}
          />
        </div>

        <Input
          label="Image URL"
          placeholder="https://..."
          value={image}
          onChange={(e) => setImage(e.target.value)}
          hint="Leave blank to auto-generate a placeholder image"
        />

        <Input
          label="Ingredients (comma separated)"
          placeholder="Rice, Chicken, Pepper"
          value={ingredientsText}
          onChange={(e) => setIngredientsText(e.target.value)}
        />

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-sm font-medium text-ink-800">Extras</label>
            <button
              type="button"
              onClick={addExtra}
              className="flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline cursor-pointer"
            >
              <Plus size={14} /> Add extra
            </button>
          </div>
          <div className="space-y-2">
            {extras.map((extra, i) => (
              <div key={i} className="flex gap-2">
                <input
                  placeholder="Extra name"
                  value={extra.name}
                  onChange={(e) => updateExtra(i, "name", e.target.value)}
                  className="flex-1 rounded-lg border border-ink-200 px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={extra.price || ""}
                  onChange={(e) => updateExtra(i, "price", e.target.value)}
                  className="w-28 rounded-lg border border-ink-200 px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeExtra(i)}
                  aria-label="Remove extra"
                  className="rounded-lg p-2 text-ink-400 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm font-medium text-ink-800">
            <input
              type="checkbox"
              checked={available}
              onChange={(e) => setAvailable(e.target.checked)}
              className="h-4 w-4 rounded accent-brand-600"
            />
            Available
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-ink-800">
            <input
              type="checkbox"
              checked={popular}
              onChange={(e) => setPopular(e.target.checked)}
              className="h-4 w-4 rounded accent-brand-600"
            />
            Mark as Popular
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={saving}
            disabled={!name || !price || !categoryId}
          >
            {initial ? "Save Changes" : "Create Food Item"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
