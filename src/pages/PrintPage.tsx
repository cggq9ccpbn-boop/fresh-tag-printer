import { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { usePrintQueue } from '@/hooks/usePrintQueue';
import { useSettings } from '@/hooks/useSettings';
import { useCategories } from '@/hooks/useCategories';
import { Product } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer, Trash2, Plus, AlertCircle, Eye } from 'lucide-react';
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
import { canPrintNatively, printViaTcp } from '@/lib/electron';
import { generateZpl, zplToBase64 } from '@/lib/zpl';

export default function PrintPage() {
  const { products, getProduct } = useProducts();
  const { queue, removeFromQueue, clearQueue, getQueueCount } = usePrintQueue();
  const { settings, isConfigured } = useSettings();
  const { getCategory } = useCategories();
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [previewItem, setPreviewItem] = useState<{
    product: Product;
    productionDate: Date;
    dlcDate: Date;
  } | null>(null);
  const [printing, setPrinting] = useState(false);

  const getCategoryIcon = (categoryId: string) => getCategory(categoryId)?.icon || '📦';

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setPrintDialogOpen(true);
  };

  const handlePrint = async () => {
    if (!isConfigured()) { toast.error('Configurez le distributeur d\'abord'); return; }
    if (queue.length === 0) { toast.error('File vide'); return; }
    if (!canPrintNatively()) { toast.error('Impression TCP disponible uniquement dans l\'app native'); return; }

    setPrinting(true);
    let successCount = 0;
    let errorCount = 0;

    for (const item of queue) {
      const product = getProduct(item.productId);
      if (!product) continue;
      const zpl = generateZpl({ product, settings, productionDate: new Date(item.productionDate), dlcDate: new Date(item.dlcDate) });

      for (let i = 0; i < item.quantity; i++) {
        const result = await printViaTcp(settings.printerIp, settings.printerPort, zpl);
        if (result.success) { successCount++; } else { errorCount++; toast.error(`Erreur: ${result.error}`); break; }
      }
      if (errorCount > 0) break;
    }

    setPrinting(false);
    if (errorCount === 0) { clearQueue(); toast.success(`${successCount} étiquette(s) imprimée(s) !`); }
  };

  const handleRemoveFromQueue = (id: string) => { removeFromQueue(id); toast.success('Retiré'); };
  const handleClearQueue = () => { clearQueue(); setClearDialogOpen(false); toast.success('File vidée'); };

  const handlePreview = (queueItem: typeof queue[0]) => {
    const product = getProduct(queueItem.productId);
    if (product) setPreviewItem({ product, productionDate: new Date(queueItem.productionDate), dlcDate: new Date(queueItem.dlcDate) });
  };

  if (!isConfigured()) {
    return (
      <div className="space-y-4 pt-2">
        <Card className="border-accent/30 bg-accent/5">
          <CardContent className="flex flex-col items-center py-12 px-4">
            <div className="h-14 w-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-3">
              <AlertCircle className="h-7 w-7 text-accent" />
            </div>
            <h3 className="font-medium text-accent">Configuration requise</h3>
            <p className="text-sm text-muted-foreground text-center mt-1">Configurez votre distributeur avant d'imprimer</p>
            <Link to="/settings"><Button className="mt-4" size="sm">Configurer</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-2">
      {/* Print action bar */}
      {queue.length > 0 && (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setClearDialogOpen(true)} className="flex-1 h-10">
            Vider
          </Button>
          <Button size="sm" onClick={handlePrint} disabled={printing} className="flex-1 h-10">
            <Printer className="mr-1.5 h-4 w-4" />
            {printing ? 'Impression...' : `Imprimer (${getQueueCount()})`}
          </Button>
        </div>
      )}

      {!canPrintNatively() && (
        <p className="text-[11px] text-accent text-center">⚠️ Impression TCP uniquement dans l'app native</p>
      )}

      {/* Product selection */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Sélectionner un produit</h2>
        {products.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-muted-foreground">Aucun produit</p>
              <Link to="/products"><Button size="sm" variant="outline" className="mt-3">Ajouter des produits</Button></Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-1.5 max-h-[35vh] overflow-y-auto">
            {products.map((product) => (
              <Card key={product.id} className="active:scale-[0.98] transition-transform cursor-pointer" onClick={() => handleSelectProduct(product)}>
                <CardContent className="flex items-center gap-3 py-2.5 px-3">
                  {product.photo ? (
                    <img src={product.photo} alt={product.name} className="h-9 w-9 object-cover rounded-lg" />
                  ) : (
                    <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                      <span className="text-base">{getCategoryIcon(product.category)}</span>
                    </div>
                  )}
                  <span className="flex-1 text-sm font-medium truncate">{product.name}</span>
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Queue */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          File d'impression {queue.length > 0 && `(${getQueueCount()})`}
        </h2>
        {queue.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-8">
              <Printer className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">File vide</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-1.5">
            {queue.map((item) => {
              const product = getProduct(item.productId);
              if (!product) return null;
              return (
                <Card key={item.id}>
                  <CardContent className="flex items-center gap-3 py-2.5 px-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {format(new Date(item.productionDate), 'dd/MM', { locale: fr })} → {format(new Date(item.dlcDate), 'dd/MM', { locale: fr })}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">{item.quantity}×</Badge>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handlePreview(item)}>
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleRemoveFromQueue(item.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Preview */}
      {previewItem && (
        <Card>
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground mb-3 text-center">Aperçu — {settings.labelWidth || 50}×{settings.labelHeight || 80}mm</p>
            <div className="flex justify-center overflow-x-auto">
              <LabelPreview product={previewItem.product} settings={settings} productionDate={previewItem.productionDate} dlcDate={previewItem.dlcDate} />
            </div>
          </CardContent>
        </Card>
      )}

      {selectedProduct && <PrintDialog open={printDialogOpen} onOpenChange={setPrintDialogOpen} product={selectedProduct} />}

      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Vider la file ?</AlertDialogTitle>
            <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearQueue} className="bg-destructive text-destructive-foreground">Vider</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
