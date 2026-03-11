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
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
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
  const [previewItem, setPreviewItem] = useState<{ product: Product; productionDate: Date; dlcDate: Date } | null>(null);
  const [printing, setPrinting] = useState(false);

  const getCategoryIcon = (id: string) => getCategory(id)?.icon || '📦';

  const handlePrint = async () => {
    if (!isConfigured()) { toast.error('Configurez le distributeur'); return; }
    if (queue.length === 0) { toast.error('File vide'); return; }
    if (!canPrintNatively()) { toast.error('Impression TCP dans l\'app native uniquement'); return; }
    setPrinting(true);
    let ok = 0, err = 0;
    for (const item of queue) {
      const p = getProduct(item.productId);
      if (!p) continue;
      const zpl = generateZpl({ product: p, settings, productionDate: new Date(item.productionDate), dlcDate: new Date(item.dlcDate) });
      for (let i = 0; i < item.quantity; i++) {
        const r = await printViaTcp(settings.printerIp, settings.printerPort, zpl);
        if (r.success) ok++; else { err++; toast.error(`Erreur: ${r.error}`); break; }
      }
      if (err > 0) break;
    }
    setPrinting(false);
    if (err === 0) { clearQueue(); toast.success(`${ok} étiquette(s) imprimée(s)`); }
  };

  if (!isConfigured()) {
    return (
      <div className="flex flex-col items-center justify-center py-24 animate-fade-up">
        <AlertCircle className="h-10 w-10 text-accent/40 mb-3" />
        <p className="text-[14px] font-semibold text-accent">Configuration requise</p>
        <p className="text-[12px] text-muted-foreground mt-1">Configurez votre distributeur</p>
        <Link to="/settings"><Button className="mt-5 rounded-xl gradient-primary border-0 text-[13px]" size="sm">Configurer</Button></Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-3 animate-fade-up">
      {/* Action bar */}
      {queue.length > 0 && (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setClearDialogOpen(true)} className="flex-1 h-10 rounded-xl text-[13px]">Vider</Button>
          <Button size="sm" onClick={handlePrint} disabled={printing} className="flex-1 h-10 rounded-xl gradient-primary border-0 text-[13px] font-semibold">
            <Printer className="mr-1.5 h-4 w-4" />
            {printing ? 'Impression...' : `Imprimer (${getQueueCount()})`}
          </Button>
        </div>
      )}

      {!canPrintNatively() && <p className="text-[11px] text-center text-muted-foreground">⚠️ Impression TCP dans l'app native uniquement</p>}

      {/* Product selection */}
      <div>
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2 px-1">Sélectionner un produit</p>
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[13px] text-muted-foreground">Aucun produit</p>
            <Link to="/products"><Button size="sm" variant="outline" className="mt-3 rounded-xl text-[13px]">Ajouter</Button></Link>
          </div>
        ) : (
          <div className="rounded-2xl bg-card overflow-hidden divide-y divide-border max-h-[35vh] overflow-y-auto">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-3 px-4 py-3 active:bg-muted/40 transition-colors cursor-pointer"
                onClick={() => { setSelectedProduct(product); setPrintDialogOpen(true); }}
              >
                {product.photo ? (
                  <img src={product.photo} alt={product.name} className="h-9 w-9 object-cover rounded-xl" />
                ) : (
                  <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center text-base">{getCategoryIcon(product.category)}</div>
                )}
                <span className="flex-1 text-[13px] font-medium truncate">{product.name}</span>
                <Plus className="h-4 w-4 text-muted-foreground/30" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Queue */}
      <div>
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2 px-1">
          File d'impression {queue.length > 0 && `(${getQueueCount()})`}
        </p>
        {queue.length === 0 ? (
          <div className="text-center py-12">
            <Printer className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
            <p className="text-[13px] text-muted-foreground">File vide</p>
          </div>
        ) : (
          <div className="rounded-2xl bg-card overflow-hidden divide-y divide-border">
            {queue.map((item) => {
              const product = getProduct(item.productId);
              if (!product) return null;
              return (
                <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold truncate">{product.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {format(new Date(item.productionDate), 'dd/MM', { locale: fr })} → {format(new Date(item.dlcDate), 'dd/MM', { locale: fr })}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-[11px] font-bold rounded-lg h-6">{item.quantity}×</Badge>
                  <button onClick={() => {
                    if (product) setPreviewItem({ product, productionDate: new Date(item.productionDate), dlcDate: new Date(item.dlcDate) });
                  }} className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted">
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => { removeFromQueue(item.id); toast.success('Retiré'); }} className="h-7 w-7 rounded-lg flex items-center justify-center text-destructive/60 hover:bg-destructive/8">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Preview */}
      {previewItem && (
        <div className="rounded-2xl bg-card p-4">
          <p className="text-[11px] text-muted-foreground text-center mb-3 font-medium">Aperçu — {settings.labelWidth || 50}×{settings.labelHeight || 80}mm</p>
          <div className="flex justify-center overflow-x-auto">
            <LabelPreview product={previewItem.product} settings={settings} productionDate={previewItem.productionDate} dlcDate={previewItem.dlcDate} />
          </div>
        </div>
      )}

      {selectedProduct && <PrintDialog open={printDialogOpen} onOpenChange={setPrintDialogOpen} product={selectedProduct} />}

      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[16px]">Vider la file ?</AlertDialogTitle>
            <AlertDialogDescription className="text-[13px]">Cette action est irréversible.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl text-[13px]">Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => { clearQueue(); setClearDialogOpen(false); toast.success('File vidée'); }} className="bg-destructive text-destructive-foreground rounded-xl text-[13px]">Vider</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}