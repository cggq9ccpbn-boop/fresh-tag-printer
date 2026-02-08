import { Product, DistributorSettings, ALLERGENS } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface LabelPreviewProps {
  product: Product;
  settings: DistributorSettings;
  productionDate: Date;
  dlcDate: Date;
}

export function LabelPreview({ product, settings, productionDate, dlcDate }: LabelPreviewProps) {
  const getAllergenLabels = () => {
    return product.allergens
      .map((id) => ALLERGENS.find((a) => a.id === id))
      .filter(Boolean)
      .map((a) => `${a!.icon} ${a!.label}`)
      .join(', ');
  };

  return (
    <div
      className="bg-white border-2 border-dashed border-border rounded-lg p-4 font-sans text-foreground"
      style={{
        width: '80mm',
        minHeight: '60mm',
        fontSize: '10px',
        lineHeight: '1.4',
      }}
    >
      {/* En-tête avec logo et nom */}
      <div className="flex items-center gap-3 border-b border-border pb-2 mb-2">
        {settings.logo ? (
          <img
            src={settings.logo}
            alt="Logo"
            className="h-10 w-10 object-contain"
          />
        ) : (
          <div className="h-10 w-10 bg-muted rounded flex items-center justify-center text-lg">
            🏪
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-sm truncate">
            {settings.companyName || 'Nom de la société'}
          </h1>
        </div>
      </div>

      {/* Produit */}
      <div className="flex gap-2 mb-3">
        {product.photo ? (
          <img
            src={product.photo}
            alt={product.name}
            className="h-12 w-12 object-cover rounded"
          />
        ) : (
          <div className="h-12 w-12 bg-muted rounded flex items-center justify-center text-xl">
            📦
          </div>
        )}
        <div className="flex-1">
          <h2 className="font-bold text-sm leading-tight">{product.name}</h2>
        </div>
      </div>

      {/* Dates */}
      <div className="bg-muted/50 rounded p-2 mb-2 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Fabriqué le :</span>
          <span className="font-medium">
            {format(productionDate, 'dd/MM/yyyy', { locale: fr })}
          </span>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-muted-foreground">
            {product.dlcType === 'dlc' 
              ? 'À consommer avant le :' 
              : 'À consommer de préf. avant le :'}
          </span>
          <span className="font-bold text-destructive">
            {format(dlcDate, 'dd/MM/yyyy', { locale: fr })}
          </span>
        </div>
      </div>

      {/* Allergènes */}
      {product.allergens.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded p-2 mb-2">
          <p className="font-bold text-amber-900 text-xs mb-0.5">⚠️ ALLERGÈNES :</p>
          <p className="text-amber-800 text-xs leading-tight">
            {getAllergenLabels()}
          </p>
        </div>
      )}

      {/* Informations légales */}
      <div className="text-[8px] text-muted-foreground border-t border-border pt-2 space-y-0.5">
        {(settings.address || settings.city) && (
          <p>
            {settings.address}
            {settings.address && settings.postalCode && ' - '}
            {settings.postalCode} {settings.city}
          </p>
        )}
        {settings.phone && <p>Tél : {settings.phone}</p>}
        <div className="flex gap-2 flex-wrap">
          {settings.bceNumber && <span>BCE : {settings.bceNumber}</span>}
          {settings.vatNumber && <span>TVA : {settings.vatNumber}</span>}
        </div>
      </div>
    </div>
  );
}
