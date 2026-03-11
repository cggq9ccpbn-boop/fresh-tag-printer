import { useState, useEffect } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { Product, ALLERGENS, CategoryId, AllergenId } from '@/types';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Upload, X, Save, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
}

export function ProductDialog({ open, onOpenChange, product }: ProductDialogProps) {
  const { addProduct, updateProduct } = useProducts();
  const { categories } = useCategories();
  const isEditing = !!product;

  const [formData, setFormData] = useState({
    name: '', photo: null as string | null, category: 'other' as CategoryId,
    allergens: [] as AllergenId[], shelfLifeDays: 0, shelfLifeHours: 0, dlcType: 'dlc' as 'dlc' | 'ddm',
  });

  useEffect(() => {
    if (product) {
      setFormData({ name: product.name, photo: product.photo, category: product.category, allergens: product.allergens, shelfLifeDays: product.shelfLifeDays, shelfLifeHours: product.shelfLifeHours, dlcType: product.dlcType });
    } else {
      setFormData({ name: '', photo: null, category: 'other', allergens: [], shelfLifeDays: 0, shelfLifeHours: 0, dlcType: 'dlc' });
    }
  }, [product, open]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { toast.error('Max 2 Mo'); return; }
      const reader = new FileReader();
      reader.onloadend = () => setFormData((p) => ({ ...p, photo: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const toggleAllergen = (id: AllergenId) => {
    setFormData((p) => ({ ...p, allergens: p.allergens.includes(id) ? p.allergens.filter((a) => a !== id) : [...p.allergens, id] }));
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) { toast.error('Nom requis'); return; }
    if (isEditing && product) { updateProduct(product.id, formData); toast.success('Mis à jour'); }
    else { addProduct(formData); toast.success('Produit créé'); }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-[16px]">{isEditing ? 'Modifier' : 'Nouveau produit'}</DialogTitle>
          <DialogDescription className="text-[13px]">{isEditing ? formData.name : 'Remplissez les informations du produit'}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-2">
          <div className="space-y-5 py-2">
            {/* Photo */}
            <div className="flex items-center gap-4">
              {formData.photo ? (
                <div className="relative group">
                  <img src={formData.photo} alt="" className="h-20 w-20 object-cover rounded-2xl border border-border" />
                  <button onClick={() => setFormData((p) => ({ ...p, photo: null }))} className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <label className="h-20 w-20 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 transition-colors">
                  <Camera className="h-5 w-5 text-muted-foreground" />
                  <span className="text-[9px] text-muted-foreground mt-0.5">Photo</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
              )}
              <div className="flex-1">
                <Label className="text-[12px] text-muted-foreground mb-1 block">Nom *</Label>
                <Input placeholder="Ex: Sandwich poulet" value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} className="h-11 rounded-xl text-[13px]" />
              </div>
            </div>

            {/* Category */}
            <div>
              <Label className="text-[12px] text-muted-foreground mb-1.5 block">Catégorie</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData((p) => ({ ...p, category: v as CategoryId }))}>
                <SelectTrigger className="h-11 rounded-xl text-[13px]"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  {categories.map((c) => (<SelectItem key={c.id} value={c.id} className="text-[13px]">{c.icon} {c.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            {/* Shelf life */}
            <div>
              <Label className="text-[12px] text-muted-foreground mb-1.5 block">Durée de conservation</Label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] text-muted-foreground">Jours</span>
                  <Input type="number" min="0" value={formData.shelfLifeDays || ''} onChange={(e) => setFormData((p) => ({ ...p, shelfLifeDays: parseInt(e.target.value) || 0 }))} className="h-11 rounded-xl text-[13px] mt-1" />
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground">Heures</span>
                  <Input type="number" min="0" max="23" value={formData.shelfLifeHours || ''} onChange={(e) => setFormData((p) => ({ ...p, shelfLifeHours: parseInt(e.target.value) || 0 }))} className="h-11 rounded-xl text-[13px] mt-1" />
                </div>
              </div>
            </div>

            {/* DLC type */}
            <div>
              <Label className="text-[12px] text-muted-foreground mb-2 block">Type de date</Label>
              <div className="flex gap-2">
                {[
                  { value: 'dlc' as const, label: 'DLC' },
                  { value: 'ddm' as const, label: 'DDM' },
                ].map((opt) => (
                  <button key={opt.value} onClick={() => setFormData((p) => ({ ...p, dlcType: opt.value }))}
                    className={`flex-1 h-10 rounded-xl text-[13px] font-medium transition-colors ${formData.dlcType === opt.value ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Allergens */}
            <div>
              <Label className="text-[12px] text-muted-foreground mb-2 block">Allergènes</Label>
              <div className="flex flex-wrap gap-1.5">
                {ALLERGENS.map((a) => (
                  <button key={a.id} onClick={() => toggleAllergen(a.id)}
                    className={`h-8 px-2.5 rounded-lg text-[12px] font-medium transition-colors ${
                      formData.allergens.includes(a.id) ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-muted text-muted-foreground'
                    }`}>
                    {a.icon} {a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl text-[13px]">Annuler</Button>
          <Button onClick={handleSubmit} className="rounded-xl gradient-primary border-0 text-[13px] font-semibold">
            <Save className="mr-1.5 h-4 w-4" />
            {isEditing ? 'Mettre à jour' : 'Créer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}