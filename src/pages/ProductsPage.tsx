import { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { Product, ALLERGENS, CategoryId } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit2, Trash2, Package, Settings2 } from 'lucide-react';
import { ProductDialog } from '@/components/products/ProductDialog';
import { CategoryDialog } from '@/components/products/CategoryDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
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

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryLabel = (categoryId: CategoryId) => getCategory(categoryId)?.label || categoryId;
  const getCategoryIcon = (categoryId: CategoryId) => getCategory(categoryId)?.icon || '📦';

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setDialogOpen(true);
  };

  const handleDelete = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      deleteProduct(productToDelete.id);
      toast.success(`"${productToDelete.name}" supprimé`);
      setProductToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="space-y-4 pt-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {products.length} produit{products.length > 1 ? 's' : ''}
        </p>
        <Button size="sm" onClick={() => setDialogOpen(true)} className="h-8">
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Ajouter
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-10 bg-card border-border/50"
        />
      </div>

      {/* Category filters - horizontal scroll */}
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 pb-1">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
            className="h-8 text-xs rounded-full flex-shrink-0"
          >
            Tous
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="h-8 text-xs rounded-full flex-shrink-0"
            >
              {category.icon} {category.label}
            </Button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCategoryDialogOpen(true)}
            className="h-8 text-xs text-muted-foreground flex-shrink-0"
          >
            <Settings2 className="h-3.5 w-3.5" />
          </Button>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Product list */}
      {filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
              <Package className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">Aucun produit</p>
            <p className="text-xs text-muted-foreground mt-1 text-center">
              {searchQuery || selectedCategory !== 'all'
                ? 'Aucun résultat'
                : 'Ajoutez votre premier produit'}
            </p>
            {!searchQuery && selectedCategory === 'all' && (
              <Button size="sm" className="mt-3" onClick={() => setDialogOpen(true)}>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Ajouter
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden active:scale-[0.98] transition-transform">
              <CardContent className="flex items-center gap-3 py-3 px-4">
                {/* Icon/Photo */}
                {product.photo ? (
                  <img
                    src={product.photo}
                    alt={product.name}
                    className="h-11 w-11 object-cover rounded-xl flex-shrink-0"
                  />
                ) : (
                  <div className="h-11 w-11 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">{getCategoryIcon(product.category)}</span>
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">{product.name}</h3>
                  <p className="text-[11px] text-muted-foreground">
                    {getCategoryLabel(product.category)}
                    {' · '}
                    {product.shelfLifeDays > 0 ? `${product.shelfLifeDays}j` : ''}
                    {product.shelfLifeHours > 0 ? `${product.shelfLifeHours}h` : ''}
                    {' · '}
                    {product.dlcType === 'dlc' ? 'DLC' : 'DDM'}
                  </p>
                  {product.allergens.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {product.allergens.slice(0, 3).map((id) => {
                        const a = ALLERGENS.find((x) => x.id === id);
                        return a ? (
                          <span key={id} className="text-[10px]">{a.icon}</span>
                        ) : null;
                      })}
                      {product.allergens.length > 3 && (
                        <span className="text-[10px] text-muted-foreground">+{product.allergens.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions - always visible */}
                <div className="flex gap-1 flex-shrink-0">
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(product)}>
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(product)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ProductDialog open={dialogOpen} onOpenChange={handleDialogClose} product={editingProduct} />
      <CategoryDialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen} />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce produit ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer "{productToDelete?.name}" ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
