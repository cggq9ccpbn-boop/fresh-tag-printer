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

  const align = settings.textAlign || 'left';
  const titleSize = settings.fontSizeTitle || 14;
  const bodySize = settings.fontSizeBody || 10;
  const legalSize = settings.fontSizeLegal || 8;
  const labelW = settings.labelWidth || 50;
  const labelH = settings.labelHeight || 80;

  return (
    <div
      className="bg-white border-2 border-dashed border-border rounded-lg p-4 font-sans text-foreground"
      style={{
        width: `${labelW}mm`,
        minHeight: `${labelH}mm`,
        fontSize: `${bodySize}px`,
        lineHeight: '1.4',
        textAlign: align,
      }}
    >
      {/* En-tête avec logo et nom */}
      <div className="flex items-center gap-3 border-b border-border pb-2 mb-2" style={{ justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start' }}>
        {settings.logo ? (
          <img
            src={settings.logo}
            alt="Logo"
            className="h-10 w-10 object-contain"
          />
        ) : (
          <div className="h-10 w-10 bg-muted rounded flex items-center justify-center text-lg flex-shrink-0">
            🏪
          </div>
        )}
        <div className="min-w-0">
          <h1 className="font-bold truncate" style={{ fontSize: `${titleSize}px` }}>
            {settings.companyName || 'Nom de la société'}
          </h1>
        </div>
      </div>

      {/* Produit */}
      <div className="flex gap-2 mb-3" style={{ justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start' }}>
        {product.photo ? (
          <img
            src={product.photo}
            alt={product.name}
            className="h-12 w-12 object-cover rounded flex-shrink-0"
          />
        ) : (
          <div className="h-12 w-12 bg-muted rounded flex items-center justify-center text-xl flex-shrink-0">
            📦
          </div>
        )}
        <div>
          <h2 className="font-bold leading-tight" style={{ fontSize: `${titleSize}px` }}>{product.name}</h2>
        </div>
      </div>

      {/* Dates */}
      <div className="bg-muted/50 rounded p-2 mb-2" style={{ fontSize: `${bodySize}px` }}>
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
          <p className="font-bold text-amber-900 mb-0.5" style={{ fontSize: `${bodySize}px` }}>⚠️ ALLERGÈNES :</p>
          <p className="text-amber-800 leading-tight" style={{ fontSize: `${legalSize}px` }}>
            {getAllergenLabels()}
          </p>
        </div>
      )}

      {/* Informations légales */}
      <div className="text-muted-foreground border-t border-border pt-2 space-y-0.5" style={{ fontSize: `${legalSize}px` }}>
        {(settings.address || settings.city) && (
          <p>
            {settings.address}
            {settings.address && settings.postalCode && ' - '}
            {settings.postalCode} {settings.city}
          </p>
        )}
        {settings.phone && <p>Tél : {settings.phone}</p>}
        <div className="flex gap-2 flex-wrap" style={{ justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start' }}>
          {settings.bceNumber && <span>BCE : {settings.bceNumber}</span>}
          {settings.vatNumber && <span>TVA : {settings.vatNumber}</span>}
        </div>
      </div>
    </div>
  );
}
