import { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { Product, ALLERGENS, CategoryId } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit2, Trash2, Package, Settings2 } from 'lucide-react';
import { ProductDialog } from '@/components/products/ProductDialog';
import { CategoryDialog } from '@/components/products/CategoryDialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export default function ProductsPage() {
  const { products, deleteProduct } = useProducts();
  const { categories, getCategory } = useCategories();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryLabel = (id: CategoryId) => getCategory(id)?.label || id;
  const getCategoryIcon = (id: CategoryId) => getCategory(id)?.icon || '📦';

  const handleEdit = (p: Product) => { setEditingProduct(p); setDialogOpen(true); };
  const handleDelete = (p: Product) => { setProductToDelete(p); setDeleteDialogOpen(true); };
  const confirmDelete = () => {
    if (productToDelete) { deleteProduct(productToDelete.id); toast.success(`Supprimé`); }
    setProductToDelete(null); setDeleteDialogOpen(false);
  };

  return (
    <div className="space-y-4 pt-3 animate-fade-up">
      {/* Top bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 rounded-xl bg-card border-border text-[13px]"
          />
        </div>
        <Button size="sm" onClick={() => setDialogOpen(true)} className="h-10 px-4 rounded-xl gradient-primary border-0 text-[13px] font-semibold">
          <Plus className="mr-1 h-4 w-4" />
          Ajouter
        </Button>
      </div>

      {/* Category chips */}
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-1.5 pb-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`h-8 px-3.5 rounded-full text-[12px] font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-foreground text-background'
                : 'bg-card text-muted-foreground'
            }`}
          >
            Tous
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`h-8 px-3.5 rounded-full text-[12px] font-medium transition-colors whitespace-nowrap ${
                selectedCategory === c.id
                  ? 'bg-foreground text-background'
                  : 'bg-card text-muted-foreground'
              }`}
            >
              {c.icon} {c.label}
            </button>
          ))}
          <button
            onClick={() => setCategoryDialogOpen(true)}
            className="h-8 w-8 rounded-full bg-card text-muted-foreground flex items-center justify-center flex-shrink-0"
          >
            <Settings2 className="h-3.5 w-3.5" />
          </button>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Product list */}
      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center py-20">
          <Package className="h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="text-[14px] font-medium text-muted-foreground">Aucun produit</p>
          <p className="text-[12px] text-muted-foreground/60 mt-0.5">
            {searchQuery || selectedCategory !== 'all' ? 'Essayez un autre filtre' : 'Ajoutez votre premier produit'}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-card overflow-hidden divide-y divide-border">
          {filteredProducts.map((product) => (
            <div key={product.id} className="flex items-center gap-3 px-4 py-3 active:bg-muted/40 transition-colors">
              {product.photo ? (
                <img src={product.photo} alt={product.name} className="h-11 w-11 object-cover rounded-xl" />
              ) : (
                <div className="h-11 w-11 rounded-xl bg-muted flex items-center justify-center text-lg">
                  {getCategoryIcon(product.category)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold truncate">{product.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {getCategoryLabel(product.category)} · {product.shelfLifeDays > 0 ? `${product.shelfLifeDays}j` : ''}{product.shelfLifeHours > 0 ? `${product.shelfLifeHours}h` : ''} · {product.dlcType === 'dlc' ? 'DLC' : 'DDM'}
                </p>
                {product.allergens.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5">
                    {product.allergens.slice(0, 5).map((id) => {
                      const a = ALLERGENS.find((x) => x.id === id);
                      return a ? <span key={id} className="text-[11px]">{a.icon}</span> : null;
                    })}
                    {product.allergens.length > 5 && <span className="text-[10px] text-muted-foreground">+{product.allergens.length - 5}</span>}
                  </div>
                )}
              </div>
              <button onClick={() => handleEdit(product)} className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
                <Edit2 className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => handleDelete(product)} className="h-8 w-8 rounded-lg flex items-center justify-center text-destructive/60 hover:bg-destructive/8 transition-colors">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <ProductDialog open={dialogOpen} onOpenChange={() => { setDialogOpen(false); setEditingProduct(null); }} product={editingProduct} />
      <CategoryDialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen} />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[16px]">Supprimer ce produit ?</AlertDialogTitle>
            <AlertDialogDescription className="text-[13px]">"{productToDelete?.name}" sera supprimé définitivement.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl text-[13px]">Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground rounded-xl text-[13px]">Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}