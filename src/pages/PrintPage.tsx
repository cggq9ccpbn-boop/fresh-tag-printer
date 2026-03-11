import { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { usePrintQueue } from '@/hooks/usePrintQueue';
import { useSettings } from '@/hooks/useSettings';
import { useCategories } from '@/hooks/useCategories';
import { Product } from '@/types';
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
import { generateZpl } from '@/lib/zpl';

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

  const handleSelectProduct = (product: Product) => { setSelectedProduct(product); setPrintDialogOpen(true); };

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
      <div className="space-y-4 pt-2 animate-fade-in">
        <div className="flex flex-col items-center py-16 px-4">
          <div className="h-16 w-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-accent" />
          </div>
          <h3 className="font-semibold text-accent">Configuration requise</h3>
          <p className="text-sm text-muted-foreground text-center mt-1">Configurez votre distributeur avant d'imprimer</p>
          <Link to="/settings"><Button className="mt-4 rounded-xl gradient-primary border-0" size="sm">Configurer</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 pt-2 animate-fade-in">
      {/* Print action bar */}
      {queue.length > 0 && (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setClearDialogOpen(true)} className="flex-1 h-10 rounded-xl">
            Vider
          </Button>
          <Button size="sm" onClick={handlePrint} disabled={printing} className="flex-1 h-10 rounded-xl gradient-primary border-0 shadow-card">
            <Printer className="mr-1.5 h-4 w-4" />
            {printing ? 'Impression...' : `Imprimer (${getQueueCount()})`}
          </Button>
        </div>
      )}

      {!canPrintNatively() && (
        <p className="text-[11px] text-accent text-center font-medium">⚠️ Impression TCP uniquement dans l'app native</p>
      )}

      {/* Product selection */}
      <div>
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 px-1">Sélectionner un produit</h2>
        {products.length === 0 ? (
          <div className="flex flex-col items-center py-12 px-4">
            <p className="text-sm text-muted-foreground">Aucun produit</p>
            <Link to="/products"><Button size="sm" variant="outline" className="mt-3 rounded-xl">Ajouter des produits</Button></Link>
          </div>
        ) : (
          <div className="space-y-2 max-h-[35vh] overflow-y-auto">
            {products.map((product) => (
              <div
                key={product.id}
                className="group flex items-center gap-3 p-3 px-4 rounded-2xl bg-card border border-border/60 shadow-soft transition-all hover:shadow-card active:scale-[0.98] cursor-pointer"
                onClick={() => handleSelectProduct(product)}
              >
                {product.photo ? (
                  <img src={product.photo} alt={product.name} className="h-10 w-10 object-cover rounded-xl shadow-soft" />
                ) : (
                  <div className="h-10 w-10 rounded-xl bg-muted/80 flex items-center justify-center">
                    <span className="text-lg">{getCategoryIcon(product.category)}</span>
                  </div>
                )}
                <span className="flex-1 text-sm font-medium truncate">{product.name}</span>
                <Plus className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Queue */}
      <div>
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 px-1">
          File d'impression {queue.length > 0 && `(${getQueueCount()})`}
        </h2>
        {queue.length === 0 ? (
          <div className="flex flex-col items-center py-12">
            <div className="h-12 w-12 rounded-xl bg-muted/60 flex items-center justify-center mb-3">
              <Printer className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">File vide</p>
          </div>
        ) : (
          <div className="space-y-2">
            {queue.map((item) => {
              const product = getProduct(item.productId);
              if (!product) return null;
              return (
                <div key={item.id} className="flex items-center gap-3 p-3 px-4 rounded-2xl bg-card border border-border/60 shadow-soft">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{product.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {format(new Date(item.productionDate), 'dd/MM', { locale: fr })} → {format(new Date(item.dlcDate), 'dd/MM', { locale: fr })}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs font-bold rounded-lg">{item.quantity}×</Badge>
                  <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg" onClick={() => handlePreview(item)}>
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg text-destructive hover:bg-destructive/10" onClick={() => handleRemoveFromQueue(item.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Preview */}
      {previewItem && (
        <div className="rounded-2xl bg-card border border-border/60 p-4 shadow-soft">
          <p className="text-xs text-muted-foreground mb-3 text-center font-medium">Aperçu — {settings.labelWidth || 50}×{settings.labelHeight || 80}mm</p>
          <div className="flex justify-center overflow-x-auto">
            <LabelPreview product={previewItem.product} settings={settings} productionDate={previewItem.productionDate} dlcDate={previewItem.dlcDate} />
          </div>
        </div>
      )}

      {selectedProduct && <PrintDialog open={printDialogOpen} onOpenChange={setPrintDialogOpen} product={selectedProduct} />}

      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Vider la file ?</AlertDialogTitle>
            <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearQueue} className="bg-destructive text-destructive-foreground rounded-xl">Vider</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}