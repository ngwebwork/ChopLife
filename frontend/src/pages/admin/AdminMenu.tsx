import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, UtensilsCrossed } from "lucide-react";
import { menuService } from "@/services/menuService";
import { categoryService } from "@/services/categoryService";
import type { Category, MenuItem } from "@/types";
import { formatNaira } from "@/utils/currency";
import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { MenuGridSkeleton } from "@/components/common/Skeleton";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { MenuItemFormModal } from "@/components/admin/MenuItemFormModal";
import { toast } from "@/store/toastStore";
import { getErrorMessage } from "@/services/api";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export function AdminMenu() {
  useDocumentTitle("Manage Menu");
  const [items, setItems] = useState<MenuItem[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [deleting, setDeleting] = useState<MenuItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = () => {
    menuService.list().then(setItems).catch(() => setItems([]));
    categoryService.list().then(setCategories).catch(() => setCategories([]));
  };

  useEffect(load, []);

  const handleSave = async (payload: Parameters<typeof menuService.create>[0]) => {
    try {
      if (editing) {
        await menuService.update(editing.id, payload);
        toast.success("Food item updated");
      } else {
        await menuService.create(payload);
        toast.success("Food item created");
      }
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  const toggleAvailability = async (item: MenuItem) => {
    try {
      await menuService.update(item.id, { ...item, available: !item.available });
      setItems((prev) => prev?.map((i) => (i.id === item.id ? { ...i, available: !i.available } : i)) ?? null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await menuService.remove(deleting.id);
      toast.success(`${deleting.name} deleted`);
      setDeleting(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink-900">Menu Management</h1>
          <p className="mt-1 text-sm text-ink-400">Add, edit or remove dishes from your menu.</p>
        </div>
        <Button
          icon={<Plus size={18} />}
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          disabled={categories.length === 0}
        >
          Add Food Item
        </Button>
      </div>

      {categories.length === 0 && items !== null && (
        <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          Create a category first before adding food items.
        </p>
      )}

      {items === null ? (
        <MenuGridSkeleton />
      ) : items.length === 0 ? (
        <EmptyState icon={UtensilsCrossed} title="No food items yet" description="Add your first dish to get started." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-2xl border border-ink-100 bg-white">
              <div className="relative aspect-[16/10] w-full bg-ink-100">
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                {item.popular && (
                  <span className="absolute left-3 top-3 rounded-full bg-brand-600 px-2.5 py-1 text-[11px] font-bold text-white">
                    Popular
                  </span>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-ink-900">{item.name}</h3>
                  <span className="text-sm font-extrabold text-brand-700">{formatNaira(item.price)}</span>
                </div>
                <p className="mt-1 text-xs text-ink-400">{item.categoryName}</p>

                <div className="mt-4 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-semibold text-ink-700">
                    <input
                      type="checkbox"
                      checked={item.available}
                      onChange={() => toggleAvailability(item)}
                      className="h-4 w-4 rounded accent-brand-600"
                    />
                    Available
                  </label>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditing(item);
                        setFormOpen(true);
                      }}
                      aria-label={`Edit ${item.name}`}
                      className="rounded-lg p-2 text-ink-500 hover:bg-ink-100 cursor-pointer"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => setDeleting(item)}
                      aria-label={`Delete ${item.name}`}
                      className="rounded-lg p-2 text-ink-500 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <MenuItemFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        categories={categories}
        initial={editing}
      />

      <ConfirmDialog
        isOpen={!!deleting}
        title="Delete Food Item"
        message={`Are you sure you want to delete "${deleting?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
