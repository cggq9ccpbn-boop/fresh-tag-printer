import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Product } from '@/types';
import { useProducts } from '@/hooks/useProducts';

export function ProductImportExport() {
  const { products, addProduct } = useProducts();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    if (products.length === 0) {
      toast.error('Aucun produit à exporter');
      return;
    }

    const exportData = products.map(({ id, createdAt, updatedAt, ...rest }) => rest);
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `produits-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${products.length} produit(s) exporté(s)`);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (!Array.isArray(data)) {
          toast.error('Format invalide : le fichier doit contenir un tableau de produits');
          return;
        }

        let imported = 0;
        for (const item of data) {
          if (!item.name || typeof item.name !== 'string') continue;
          addProduct({
            name: item.name,
            photo: item.photo ?? null,
            category: item.category ?? 'other',
            allergens: Array.isArray(item.allergens) ? item.allergens : [],
            shelfLifeDays: typeof item.shelfLifeDays === 'number' ? item.shelfLifeDays : 0,
            shelfLifeHours: typeof item.shelfLifeHours === 'number' ? item.shelfLifeHours : 0,
            dlcType: item.dlcType === 'ddm' ? 'ddm' : 'dlc',
          });
          imported++;
        }

        if (imported > 0) {
          toast.success(`${imported} produit(s) importé(s)`);
        } else {
          toast.error('Aucun produit valide trouvé dans le fichier');
        }
      } catch {
        toast.error('Erreur de lecture du fichier JSON');
      }
    };
    reader.readAsText(file);

    // Reset input so same file can be re-imported
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1 gap-2 rounded-xl" onClick={handleExport}>
          <Download className="h-4 w-4" />
          Exporter ({products.length})
        </Button>
        <Button variant="outline" size="sm" className="flex-1 gap-2 rounded-xl" onClick={() => fileInputRef.current?.click()}>
          <Upload className="h-4 w-4" />
          Importer
        </Button>
        <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
      </div>
      <p className="text-[11px] text-muted-foreground">
        Exportez vos produits en JSON pour les sauvegarder ou les transférer. Importez un fichier JSON pour ajouter des produits.
      </p>
    </div>
  );
}
