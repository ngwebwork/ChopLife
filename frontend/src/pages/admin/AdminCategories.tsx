import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Tags } from "lucide-react";
import { categoryService } from "@/services/categoryService";
import type { Category } from "@/types";
import { Button } from "@/components/common/Button";
import { Input, Textarea } from "@/components/common/Input";
import { Modal } from "@/components/common/Modal";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/common/Skeleton";
import { toast } from "@/store/toastStore";
import { getErrorMessage } from "@/services/api";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export function AdminCategories() {
  useDocumentTitle("Manage Categories");
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = () => {
    categoryService.list().then(setCategories).catch(() => setCategories([]));
  };

  useEffect(load, []);

  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await categoryService.remove(deleting.id);
      toast.success(`${deleting.name} deleted`);
      setDeleting(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleteLoading(false);
    }
  };

  const toggleActive = async (category: Category) => {
    try {
      await categoryService.update(category.id, { ...category, active: !category.active });
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink-900">Categories</h1>
          <p className="mt-1 text-sm text-ink-400">Organize your menu into categories.</p>
        </div>
        <Button
          icon={<Plus size={18} />}
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          Add Category
        </Button>
      </div>

      {categories === null ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <EmptyState icon={Tags} title="No categories yet" description="Create your first category to organize the menu." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-4 rounded-2xl border border-ink-100 bg-white p-4">
              <img src={cat.image} alt={cat.name} className="h-16 w-16 shrink-0 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-sm font-bold text-ink-900">{cat.name}</h3>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      cat.active ? "bg-green-50 text-green-700" : "bg-ink-100 text-ink-500"
                    }`}
                  >
                    {cat.active ? "Active" : "Disabled"}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-xs text-ink-400">{cat.description}</p>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={() => toggleActive(cat)}
                    className="text-xs font-semibold text-brand-700 hover:underline cursor-pointer"
                  >
                    {cat.active ? "Disable" : "Enable"}
                  </button>
                  <span className="text-ink-200">|</span>
                  <button
                    onClick={() => {
                      setEditing(cat);
                      setFormOpen(true);
                    }}
                    className="flex items-center gap-1 text-xs font-semibold text-ink-600 hover:underline cursor-pointer"
                  >
                    <Pencil size={12} /> Edit
                  </button>
                  <span className="text-ink-200">|</span>
                  <button
                    onClick={() => setDeleting(cat)}
                    className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:underline cursor-pointer"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CategoryFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        initial={editing}
        onSaved={load}
      />

      <ConfirmDialog
        isOpen={!!deleting}
        title="Delete Category"
        message={`Delete "${deleting?.name}"? Food items in this category will remain but should be reassigned.`}
        confirmLabel="Delete"
        danger
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}

function CategoryFormModal({
  isOpen,
  onClose,
  initial,
  onSaved,
}: {
  isOpen: boolean;
  onClose: () => void;
  initial: Category | null;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setName(initial?.name || "");
    setDescription(initial?.description || "");
    setImage(initial?.image || "");
  }, [isOpen, initial]);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const payload = {
        name,
        description,
        image: image || `https://placehold.co/600x450/EA580C/ffffff?text=${encodeURIComponent(name || "Category")}`,
        active: initial?.active ?? true,
      };
      if (initial) {
        await categoryService.update(initial.id, payload);
        toast.success("Category updated");
      } else {
        await categoryService.create(payload);
        toast.success("Category created");
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initial ? "Edit Category" : "Add Category"}>
      <div className="space-y-4">
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Textarea label="Description" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
        <Input
          label="Image URL"
          placeholder="https://..."
          value={image}
          onChange={(e) => setImage(e.target.value)}
          hint="Leave blank to auto-generate a placeholder image"
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={saving} disabled={!name}>
            {initial ? "Save Changes" : "Create Category"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
