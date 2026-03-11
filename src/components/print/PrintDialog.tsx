import { useState, useEffect } from 'react';
import { usePrintQueue } from '@/hooks/usePrintQueue';
import { useSettings } from '@/hooks/useSettings';
import { Product } from '@/types';
import { addDays, addHours, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { LabelPreview } from './LabelPreview';

interface PrintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
}

export function PrintDialog({ open, onOpenChange, product }: PrintDialogProps) {
  const { addToQueue } = usePrintQueue();
  const { settings } = useSettings();
  const [productionDate, setProductionDate] = useState<Date>(new Date());
  const [dlcDate, setDlcDate] = useState<Date>(new Date());
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product) {
      let d = new Date(productionDate);
      d = addDays(d, product.shelfLifeDays);
      d = addHours(d, product.shelfLifeHours);
      setDlcDate(d);
    }
  }, [productionDate, product]);

  useEffect(() => { if (open) { setProductionDate(new Date()); setQuantity(1); } }, [open]);

  const handleSubmit = () => {
    if (quantity < 1) { toast.error('Quantité invalide'); return; }
    addToQueue({ productId: product.id, productionDate: productionDate.toISOString(), dlcDate: dlcDate.toISOString(), quantity });
    toast.success(`${quantity} étiquette(s) ajoutée(s)`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-[16px]">Nouvelle étiquette</DialogTitle>
          <DialogDescription className="text-[13px]">{product.name}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-3">
          <div className="space-y-5">
            {/* Production date */}
            <div className="space-y-1.5">
              <Label className="text-[12px] font-medium text-muted-foreground">Date de production</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left rounded-xl h-11 text-[13px]">
                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    {format(productionDate, 'PPP', { locale: fr })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-xl" align="start">
                  <Calendar mode="single" selected={productionDate} onSelect={(d) => d && setProductionDate(d)} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>

            {/* DLC date */}
            <div className="space-y-1.5">
              <Label className="text-[12px] font-medium text-muted-foreground">
                {product.dlcType === 'dlc' ? 'À consommer avant le' : 'De préférence avant le'}
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left rounded-xl h-11 text-[13px]">
                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    {format(dlcDate, 'PPP', { locale: fr })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-xl" align="start">
                  <Calendar mode="single" selected={dlcDate} onSelect={(d) => d && setDlcDate(d)} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
              <p className="text-[11px] text-muted-foreground">Auto-calculée · {product.shelfLifeDays}j {product.shelfLifeHours}h</p>
            </div>

            {/* Quantity */}
            <div className="space-y-1.5">
              <Label className="text-[12px] font-medium text-muted-foreground">Quantité</Label>
              <div className="flex gap-2 items-center">
                <Input type="number" min="1" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} className="w-20 h-11 rounded-xl text-[13px] text-center" />
                <div className="flex gap-1">
                  {[1, 5, 10, 20].map((n) => (
                    <button key={n} onClick={() => setQuantity(n)}
                      className={`h-9 px-3 rounded-lg text-[12px] font-medium transition-colors ${quantity === n ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'}`}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div>
            <Label className="text-[12px] font-medium text-muted-foreground mb-2 block">Aperçu</Label>
            <div className="rounded-2xl bg-muted/30 p-4 border border-border/50">
              <LabelPreview product={product} settings={settings} productionDate={productionDate} dlcDate={dlcDate} />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl text-[13px]">Annuler</Button>
          <Button onClick={handleSubmit} className="rounded-xl gradient-primary border-0 text-[13px] font-semibold">
            <Plus className="mr-1.5 h-4 w-4" />
            Ajouter ({quantity})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}