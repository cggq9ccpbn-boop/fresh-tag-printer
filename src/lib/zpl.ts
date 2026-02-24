// ZPL (Zebra Programming Language) generation for thermal label printing
import { Product, DistributorSettings, ALLERGENS } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ZplOptions {
  product: Product;
  settings: DistributorSettings;
  productionDate: Date;
  dlcDate: Date;
}

// Map font sizes (px) to ZPL font sizes
function zplFontSize(px: number): { w: number; h: number } {
  const scale = Math.round(px * 2.5);
  return { w: scale, h: scale };
}

// Map text align to ZPL field justification
function zplAlign(align: 'left' | 'center' | 'right'): string {
  switch (align) {
    case 'center': return '^FB{w},1,0,C';
    case 'right': return '^FB{w},1,0,R';
    default: return '^FB{w},1,0,L';
  }
}

/**
 * Generate ZPL commands for a single label
 */
export function generateZpl({ product, settings, productionDate, dlcDate }: ZplOptions): string {
  const labelWidthDots = Math.round(settings.labelWidth * 8); // ~203 dpi = 8 dots/mm
  const labelHeightDots = Math.round(settings.labelHeight * 8);
  
  const titleFont = zplFontSize(settings.fontSizeTitle);
  const bodyFont = zplFontSize(settings.fontSizeBody);
  const legalFont = zplFontSize(settings.fontSizeLegal);
  
  const fb = (lines: number = 1) => {
    const align = settings.textAlign === 'center' ? 'C' : settings.textAlign === 'right' ? 'R' : 'L';
    return `^FB${labelWidthDots - 40},${lines},0,${align}`;
  };

  const scale = (settings.contentScale ?? 100) / 100;
  const offsetXDots = Math.round((settings.contentOffsetX ?? 0) * 8);
  const offsetYDots = Math.round((settings.contentOffsetY ?? 0) * 8);
  const marginTopDots = Math.round((settings.marginTop ?? 2) * 8);
  const marginLeftDots = Math.round((settings.marginLeft ?? 2) * 8);
  
  const ox = (v: number) => Math.round(v * scale) + marginLeftDots + offsetXDots;
  const oy = (v: number) => Math.round(v * scale) + marginTopDots + offsetYDots;
  const sf = (v: number) => Math.round(v * scale);

  let y = 0;
  const lines: string[] = [];
  
  // Start label
  lines.push('^XA');
  lines.push(`^PW${labelWidthDots}`);
  lines.push(`^LL${labelHeightDots}`);
  
  // Company name
  lines.push(`^FO${ox(0)},${oy(y)}^A0N,${sf(titleFont.h)},${sf(titleFont.w)}${fb()}^FD${settings.companyName || 'Société'}^FS`);
  y += titleFont.h + 10;
  
  // Separator
  lines.push(`^FO${ox(0)},${oy(y)}^GB${sf(labelWidthDots - 40)},1,1^FS`);
  y += 15;
  
  // Product name
  lines.push(`^FO${ox(0)},${oy(y)}^A0N,${sf(titleFont.h)},${sf(titleFont.w)}${fb()}^FD${product.name}^FS`);
  y += titleFont.h + 15;
  
  // Production date
  const prodDateStr = format(productionDate, 'dd/MM/yyyy', { locale: fr });
  lines.push(`^FO${ox(0)},${oy(y)}^A0N,${sf(bodyFont.h)},${sf(bodyFont.w)}${fb()}^FDFabriqué le : ${prodDateStr}^FS`);
  y += bodyFont.h + 5;
  
  // DLC/DDM date
  const dlcDateStr = format(dlcDate, 'dd/MM/yyyy', { locale: fr });
  const dlcLabel = product.dlcType === 'dlc' ? 'A consommer avant le' : 'A consommer de pref. avant le';
  lines.push(`^FO${ox(0)},${oy(y)}^A0N,${sf(bodyFont.h)},${sf(bodyFont.w)}${fb()}^FD${dlcLabel} : ${dlcDateStr}^FS`);
  y += bodyFont.h + 15;
  
  // Allergens
  if (product.allergens.length > 0) {
    const allergenLabels = product.allergens
      .map((id) => ALLERGENS.find((a) => a.id === id)?.label)
      .filter(Boolean)
      .join(', ');
    
    lines.push(`^FO${ox(0)},${oy(y)}^A0N,${sf(bodyFont.h)},${sf(bodyFont.w)}${fb()}^FDALLERGENES :^FS`);
    y += bodyFont.h + 3;
    lines.push(`^FO${ox(0)},${oy(y)}^A0N,${sf(legalFont.h)},${sf(legalFont.w)}${fb(3)}^FD${allergenLabels}^FS`);
    y += legalFont.h * 2 + 10;
  }
  
  // Separator
  lines.push(`^FO${ox(0)},${oy(y)}^GB${sf(labelWidthDots - 40)},1,1^FS`);
  y += 10;
  
  // Legal info
  if (settings.address || settings.city) {
    const addr = [settings.address, `${settings.postalCode} ${settings.city}`].filter(Boolean).join(' - ');
    lines.push(`^FO${ox(0)},${oy(y)}^A0N,${sf(legalFont.h)},${sf(legalFont.w)}${fb(2)}^FD${addr}^FS`);
    y += legalFont.h + 3;
  }
  
  if (settings.phone) {
    lines.push(`^FO${ox(0)},${oy(y)}^A0N,${sf(legalFont.h)},${sf(legalFont.w)}${fb()}^FDTel : ${settings.phone}^FS`);
    y += legalFont.h + 3;
  }
  
  if (settings.bceNumber) {
    lines.push(`^FO${ox(0)},${oy(y)}^A0N,${sf(legalFont.h)},${sf(legalFont.w)}${fb()}^FDBCE : ${settings.bceNumber}^FS`);
    y += legalFont.h + 3;
  }
  
  if (settings.vatNumber) {
    lines.push(`^FO${ox(0)},${oy(y)}^A0N,${sf(legalFont.h)},${sf(legalFont.w)}${fb()}^FDTVA : ${settings.vatNumber}^FS`);
  }
  
  // End label
  lines.push('^XZ');
  
  return lines.join('\n');
}

/**
 * Encode ZPL string to base64 for TCP sending
 */
export function zplToBase64(zpl: string): string {
  return btoa(unescape(encodeURIComponent(zpl)));
}
