import { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { Product, CATEGORIES, ALLERGENS, CategoryId } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit2, Trash2, Package } from 'lucide-react';
import { ProductDialog } from '@/components/products/ProductDialog';
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

export default function ProductsPage() {
  const { products, deleteProduct } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryLabel = (categoryId: CategoryId) => {
    return CATEGORIES.find((c) => c.id === categoryId)?.label || categoryId;
  };

  const getCategoryIcon = (categoryId: CategoryId) => {
    return CATEGORIES.find((c) => c.id === categoryId)?.icon || '📦';
  };

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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Catalogue produits
          </h1>
          <p className="text-muted-foreground mt-1">
            {products.length} produit{products.length > 1 ? 's' : ''} dans le catalogue
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau produit
        </Button>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
          >
            Tous
          </Button>
          {CATEGORIES.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.icon} {category.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Liste des produits */}
      {filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">Aucun produit</h3>
            <p className="text-muted-foreground text-center mt-1">
              {searchQuery || selectedCategory !== 'all'
                ? 'Aucun produit ne correspond à vos critères'
                : 'Commencez par ajouter votre premier produit'}
            </p>
            {!searchQuery && selectedCategory === 'all' && (
              <Button className="mt-4" onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un produit
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200 group">
              {/* Photo */}
              <div className="aspect-video bg-muted relative overflow-hidden">
                {product.photo ? (
                  <img
                    src={product.photo}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-4xl">{getCategoryIcon(product.category)}</span>
                  </div>
                )}
                {/* Actions overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="icon" variant="secondary" onClick={() => handleEdit(product)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="destructive" onClick={() => handleDelete(product)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-foreground">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {getCategoryIcon(product.category)} {getCategoryLabel(product.category)}
                    </p>
                  </div>
                  <span className="text-lg font-bold text-primary">
                    {product.price.toFixed(2)} €
                  </span>
                </div>

                {/* Allergènes */}
                {product.allergens.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {product.allergens.slice(0, 4).map((allergenId) => {
                      const allergen = ALLERGENS.find((a) => a.id === allergenId);
                      return allergen ? (
                        <Badge key={allergenId} variant="secondary" className="text-xs">
                          {allergen.icon} {allergen.label}
                        </Badge>
                      ) : null;
                    })}
                    {product.allergens.length > 4 && (
                      <Badge variant="secondary" className="text-xs">
                        +{product.allergens.length - 4}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Conservation */}
                <p className="text-xs text-muted-foreground mt-3">
                  Conservation : {product.shelfLifeDays > 0 ? `${product.shelfLifeDays}j` : ''}
                  {product.shelfLifeDays > 0 && product.shelfLifeHours > 0 ? ' ' : ''}
                  {product.shelfLifeHours > 0 ? `${product.shelfLifeHours}h` : ''}
                  {product.shelfLifeDays === 0 && product.shelfLifeHours === 0 ? 'Non définie' : ''}
                  {' • '}
                  {product.dlcType === 'dlc' ? 'DLC' : 'DDM'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog création/édition */}
      <ProductDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        product={editingProduct}
      />

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce produit ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer "{productToDelete?.name}" ?
              Cette action est irréversible.
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
