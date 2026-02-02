import { useState, useEffect } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { Product, CATEGORIES, ALLERGENS, CategoryId, AllergenId } from '@/types';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Upload, X, Save } from 'lucide-react';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
}

export function ProductDialog({ open, onOpenChange, product }: ProductDialogProps) {
  const { addProduct, updateProduct } = useProducts();
  const isEditing = !!product;

  const [formData, setFormData] = useState({
    name: '',
    photo: null as string | null,
    price: 0,
    category: 'other' as CategoryId,
    allergens: [] as AllergenId[],
    shelfLifeDays: 0,
    shelfLifeHours: 0,
    dlcType: 'dlc' as 'dlc' | 'ddm',
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        photo: product.photo,
        price: product.price,
        category: product.category,
        allergens: product.allergens,
        shelfLifeDays: product.shelfLifeDays,
        shelfLifeHours: product.shelfLifeHours,
        dlcType: product.dlcType,
      });
    } else {
      setFormData({
        name: '',
        photo: null,
        price: 0,
        category: 'other',
        allergens: [],
        shelfLifeDays: 0,
        shelfLifeHours: 0,
        dlcType: 'dlc',
      });
    }
  }, [product, open]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Le fichier est trop volumineux (max 2 Mo)');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleAllergen = (allergenId: AllergenId) => {
    setFormData((prev) => ({
      ...prev,
      allergens: prev.allergens.includes(allergenId)
        ? prev.allergens.filter((id) => id !== allergenId)
        : [...prev.allergens, allergenId],
    }));
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error('Le nom du produit est requis');
      return;
    }

    if (formData.price <= 0) {
      toast.error('Le prix doit être supérieur à 0');
      return;
    }

    if (isEditing && product) {
      updateProduct(product.id, formData);
      toast.success(`"${formData.name}" mis à jour`);
    } else {
      addProduct(formData);
      toast.success(`"${formData.name}" ajouté au catalogue`);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Modifier le produit' : 'Nouveau produit'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Modifiez les informations du produit' : 'Ajoutez un nouveau produit au catalogue'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6 py-4">
            {/* Photo */}
            <div className="space-y-2">
              <Label>Photo du produit</Label>
              <div className="flex items-center gap-4">
                {formData.photo ? (
                  <div className="relative">
                    <img
                      src={formData.photo}
                      alt="Aperçu"
                      className="h-24 w-24 object-cover rounded-xl border border-border"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, photo: null }))}
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="h-24 w-24 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-accent transition-colors">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground mt-1">Ajouter</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Nom et prix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du produit *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Sandwich jambon-beurre"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Prix (€) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.price || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>

            {/* Catégorie */}
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value as CategoryId }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.icon} {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Conservation */}
            <div className="space-y-4">
              <Label>Durée de conservation</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shelfLifeDays" className="text-sm text-muted-foreground">Jours</Label>
                  <Input
                    id="shelfLifeDays"
                    type="number"
                    min="0"
                    value={formData.shelfLifeDays || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, shelfLifeDays: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shelfLifeHours" className="text-sm text-muted-foreground">Heures</Label>
                  <Input
                    id="shelfLifeHours"
                    type="number"
                    min="0"
                    max="23"
                    value={formData.shelfLifeHours || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, shelfLifeHours: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
            </div>

            {/* Type de date */}
            <div className="space-y-3">
              <Label>Type de date de consommation</Label>
              <RadioGroup
                value={formData.dlcType}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, dlcType: value as 'dlc' | 'ddm' }))}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dlc" id="dlc" />
                  <Label htmlFor="dlc" className="cursor-pointer">
                    DLC (À consommer avant le...)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ddm" id="ddm" />
                  <Label htmlFor="ddm" className="cursor-pointer">
                    DDM (À consommer de préférence avant le...)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Allergènes */}
            <div className="space-y-3">
              <Label>Allergènes</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {ALLERGENS.map((allergen) => (
                  <div
                    key={allergen.id}
                    className={`flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                      formData.allergens.includes(allergen.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-accent'
                    }`}
                    onClick={() => toggleAllergen(allergen.id)}
                  >
                    <Checkbox
                      checked={formData.allergens.includes(allergen.id)}
                      onCheckedChange={() => toggleAllergen(allergen.id)}
                    />
                    <span className="text-sm">
                      {allergen.icon} {allergen.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit}>
            <Save className="mr-2 h-4 w-4" />
            {isEditing ? 'Mettre à jour' : 'Créer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
