import { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { usePrintQueue } from '@/hooks/usePrintQueue';
import { useSettings } from '@/hooks/useSettings';
import { Product, CATEGORIES } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer, Trash2, Plus, AlertCircle } from 'lucide-react';
import { PrintDialog } from '@/components/print/PrintDialog';
import { LabelPreview } from '@/components/print/LabelPreview';
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
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link } from 'react-router-dom';

export default function PrintPage() {
  const { products, getProduct } = useProducts();
  const { queue, removeFromQueue, clearQueue, getQueueCount } = usePrintQueue();
  const { settings, isConfigured } = useSettings();
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [previewItem, setPreviewItem] = useState<{
    product: Product;
    productionDate: Date;
    dlcDate: Date;
  } | null>(null);

  const getCategoryIcon = (categoryId: string) => {
    return CATEGORIES.find((c) => c.id === categoryId)?.icon || '📦';
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setPrintDialogOpen(true);
  };

  const handlePrint = async () => {
    if (!isConfigured()) {
      toast.error('Veuillez configurer les paramètres du distributeur');
      return;
    }

    if (queue.length === 0) {
      toast.error('La file d\'impression est vide');
      return;
    }

    // Simulation d'impression TCP
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: `Impression de ${getQueueCount()} étiquette(s)...`,
        success: () => {
          clearQueue();
          return 'Impression terminée avec succès !';
        },
        error: 'Erreur lors de l\'impression',
      }
    );
  };

  const handleRemoveFromQueue = (id: string) => {
    removeFromQueue(id);
    toast.success('Retiré de la file d\'impression');
  };

  const handleClearQueue = () => {
    clearQueue();
    setClearDialogOpen(false);
    toast.success('File d\'impression vidée');
  };

  const handlePreview = (queueItem: typeof queue[0]) => {
    const product = getProduct(queueItem.productId);
    if (product) {
      setPreviewItem({
        product,
        productionDate: new Date(queueItem.productionDate),
        dlcDate: new Date(queueItem.dlcDate),
      });
    }
  };

  if (!isConfigured()) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Impression
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez votre file d'impression
          </p>
        </div>

        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-2xl bg-amber-100 flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-amber-600" />
            </div>
            <h3 className="text-lg font-medium text-amber-900">Configuration requise</h3>
            <p className="text-amber-700 text-center mt-1 max-w-md">
              Veuillez configurer les informations de votre distributeur avant de pouvoir imprimer des étiquettes.
            </p>
            <Link to="/settings">
              <Button className="mt-4">
                Configurer le distributeur
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Impression
          </h1>
          <p className="text-muted-foreground mt-1">
            {queue.length === 0
              ? 'Sélectionnez un produit pour créer une étiquette'
              : `${queue.length} produit(s) en file • ${getQueueCount()} étiquette(s)`}
          </p>
        </div>
        {queue.length > 0 && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setClearDialogOpen(true)}>
              Vider la file
            </Button>
            <Button onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimer ({getQueueCount()})
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sélection de produit */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Sélectionner un produit</h2>
          
          {products.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground text-center">
                  Aucun produit dans le catalogue
                </p>
                <Link to="/products">
                  <Button className="mt-4" variant="outline">
                    Ajouter des produits
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-2 max-h-[60vh] overflow-y-auto pr-2">
              {products.map((product) => (
                <Card
                  key={product.id}
                  className="cursor-pointer hover:shadow-md hover:border-primary/50 transition-all duration-200"
                  onClick={() => handleSelectProduct(product)}
                >
                  <CardContent className="flex items-center gap-4 py-3">
                    {product.photo ? (
                      <img
                        src={product.photo}
                        alt={product.name}
                        className="h-12 w-12 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                        <span className="text-xl">{getCategoryIcon(product.category)}</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {product.price.toFixed(2)} €
                      </p>
                    </div>
                    <Button size="sm" variant="ghost">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* File d'impression */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">File d'impression</h2>
          
          {queue.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <Printer className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-center">
                  La file d'impression est vide
                </p>
                <p className="text-sm text-muted-foreground text-center mt-1">
                  Sélectionnez un produit pour l'ajouter
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
              {queue.map((item) => {
                const product = getProduct(item.productId);
                if (!product) return null;

                return (
                  <Card key={item.id} className="hover:shadow-sm transition-shadow">
                    <CardContent className="flex items-center gap-4 py-3">
                      {product.photo ? (
                        <img
                          src={product.photo}
                          alt={product.name}
                          className="h-12 w-12 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                          <span className="text-xl">{getCategoryIcon(product.category)}</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{product.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          Prod: {format(new Date(item.productionDate), 'dd/MM/yyyy', { locale: fr })}
                          {' • '}
                          DLC: {format(new Date(item.dlcDate), 'dd/MM/yyyy', { locale: fr })}
                        </p>
                      </div>
                      <Badge variant="secondary">{item.quantity}×</Badge>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handlePreview(item)}
                        >
                          Aperçu
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleRemoveFromQueue(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Aperçu de l'étiquette */}
      {previewItem && (
        <Card>
          <CardHeader>
            <CardTitle>Aperçu de l'étiquette</CardTitle>
            <CardDescription>Format 80mm</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <LabelPreview
              product={previewItem.product}
              settings={settings}
              productionDate={previewItem.productionDate}
              dlcDate={previewItem.dlcDate}
            />
          </CardContent>
        </Card>
      )}

      {/* Dialog d'ajout à la file */}
      {selectedProduct && (
        <PrintDialog
          open={printDialogOpen}
          onOpenChange={setPrintDialogOpen}
          product={selectedProduct}
        />
      )}

      {/* Dialog de confirmation pour vider la file */}
      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Vider la file d'impression ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer tous les éléments de la file d'impression ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearQueue} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Vider
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
