import { useState, useEffect } from 'react';
import { usePrintQueue } from '@/hooks/usePrintQueue';
import { useSettings } from '@/hooks/useSettings';
import { Product } from '@/types';
import { addDays, addHours, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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

  // Calculer la DLC automatiquement
  useEffect(() => {
    if (product) {
      let newDlcDate = new Date(productionDate);
      newDlcDate = addDays(newDlcDate, product.shelfLifeDays);
      newDlcDate = addHours(newDlcDate, product.shelfLifeHours);
      setDlcDate(newDlcDate);
    }
  }, [productionDate, product]);

  // Reset quand le dialog s'ouvre
  useEffect(() => {
    if (open) {
      setProductionDate(new Date());
      setQuantity(1);
    }
  }, [open]);

  const handleSubmit = () => {
    if (quantity < 1) {
      toast.error('Le nombre d\'étiquettes doit être supérieur à 0');
      return;
    }

    addToQueue({
      productId: product.id,
      productionDate: productionDate.toISOString(),
      dlcDate: dlcDate.toISOString(),
      quantity,
    });

    toast.success(`${quantity} étiquette(s) ajoutée(s) à la file`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer une étiquette</DialogTitle>
          <DialogDescription>
            Configurez les paramètres d'impression pour "{product.name}"
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-4">
          {/* Formulaire */}
          <div className="space-y-6">
            {/* Date de production */}
            <div className="space-y-2">
              <Label>Date de production</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !productionDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {productionDate ? format(productionDate, 'PPP', { locale: fr }) : 'Sélectionner'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={productionDate}
                    onSelect={(date) => date && setProductionDate(date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Date DLC */}
            <div className="space-y-2">
              <Label>
                {product.dlcType === 'dlc' ? 'À consommer avant le' : 'À consommer de préférence avant le'}
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !dlcDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dlcDate ? format(dlcDate, 'PPP', { locale: fr }) : 'Sélectionner'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dlcDate}
                    onSelect={(date) => date && setDlcDate(date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground">
                Calculée automatiquement ({product.shelfLifeDays}j {product.shelfLifeHours}h), modifiable
              </p>
            </div>

            {/* Quantité */}
            <div className="space-y-2">
              <Label htmlFor="quantity">Nombre d'étiquettes</Label>
              <div className="flex gap-2">
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-24"
                />
                <div className="flex gap-1">
                  {[1, 5, 10, 20].map((num) => (
                    <Button
                      key={num}
                      variant={quantity === num ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setQuantity(num)}
                    >
                      {num}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Aperçu */}
          <div className="space-y-2">
            <Label>Aperçu de l'étiquette</Label>
            <div className="border rounded-xl p-4 bg-muted/30">
              <LabelPreview
                product={product}
                settings={settings}
                productionDate={productionDate}
                dlcDate={dlcDate}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter à la file ({quantity})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
