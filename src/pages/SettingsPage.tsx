import { useState } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Building2, Phone, FileText, Printer, Upload, X, Save, Tag, Eye, Camera, MapPin, Mail, Hash, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { PrinterScanner } from '@/components/settings/PrinterScanner';
import { ProductImportExport } from '@/components/settings/ProductImportExport';
import { LabelFormatSettings } from '@/components/settings/LabelFormatSettings';
import { LabelPreview } from '@/components/print/LabelPreview';
import { Product } from '@/types';

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const [logoPreview, setLogoPreview] = useState<string | null>(settings.logo);
  const [openSection, setOpenSection] = useState<string | null>('company');

  const toggle = (key: string) => setOpenSection(openSection === key ? null : key);

  const sampleProduct: Product = {
    id: 'preview', name: settings.companyName ? 'Sandwich Poulet Curry' : 'Produit exemple',
    photo: null, category: 'sandwiches', allergens: ['gluten', 'milk', 'eggs'],
    shelfLifeDays: 3, shelfLifeHours: 0, dlcType: 'dlc',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { toast.error('Max 2 Mo'); return; }
      const reader = new FileReader();
      reader.onloadend = () => { const b = reader.result as string; setLogoPreview(b); updateSettings({ logo: b }); };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-2 pt-3 max-w-2xl mx-auto pb-8 animate-fade-up">
      {/* Company */}
      <SectionRow icon="🏢" title="Société" subtitle={settings.companyName || 'Non configuré'} open={openSection === 'company'} onToggle={() => toggle('company')}>
        <div className="flex items-start gap-4 mb-4">
          {logoPreview ? (
            <div className="relative group">
              <img src={logoPreview} alt="Logo" className="h-16 w-16 object-contain rounded-2xl border border-border bg-background p-1.5" />
              <button onClick={() => { setLogoPreview(null); updateSettings({ logo: null }); }} className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <label className="h-16 w-16 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 transition-colors flex-shrink-0">
              <Camera className="h-4 w-4 text-muted-foreground" />
              <span className="text-[9px] text-muted-foreground mt-0.5">Logo</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </label>
          )}
          <div className="flex-1">
            <FieldInput placeholder="Nom de la société" value={settings.companyName} onChange={(v) => updateSettings({ companyName: v })} />
          </div>
        </div>
        <div className="space-y-2.5">
          <FieldInput placeholder="Adresse" value={settings.address} onChange={(v) => updateSettings({ address: v })} />
          <div className="grid grid-cols-5 gap-2">
            <div className="col-span-2"><FieldInput placeholder="Code postal" value={settings.postalCode} onChange={(v) => updateSettings({ postalCode: v })} /></div>
            <div className="col-span-3"><FieldInput placeholder="Ville" value={settings.city} onChange={(v) => updateSettings({ city: v })} /></div>
          </div>
        </div>
      </SectionRow>

      {/* Contact */}
      <SectionRow icon="📞" title="Contact" subtitle={settings.phone || settings.email || 'Non configuré'} open={openSection === 'contact'} onToggle={() => toggle('contact')}>
        <div className="space-y-2.5">
          <FieldInput placeholder="Téléphone" value={settings.phone} onChange={(v) => updateSettings({ phone: v })} type="tel" />
          <FieldInput placeholder="Email" value={settings.email} onChange={(v) => updateSettings({ email: v })} type="email" />
        </div>
      </SectionRow>

      {/* Legal */}
      <SectionRow icon="📄" title="Légal" subtitle={settings.bceNumber || settings.vatNumber || 'Non configuré'} open={openSection === 'legal'} onToggle={() => toggle('legal')}>
        <div className="space-y-2.5">
          <FieldInput placeholder="N° BCE" value={settings.bceNumber} onChange={(v) => updateSettings({ bceNumber: v })} />
          <FieldInput placeholder="N° TVA" value={settings.vatNumber} onChange={(v) => updateSettings({ vatNumber: v })} />
        </div>
      </SectionRow>

      {/* Printer */}
      <SectionRow icon="🖨️" title="Imprimante" subtitle={settings.printerIp} open={openSection === 'printer'} onToggle={() => toggle('printer')}>
        <PrinterScanner printerIp={settings.printerIp} printerPort={settings.printerPort} onSelect={(ip, port) => updateSettings({ printerIp: ip, printerPort: port })} />
      </SectionRow>

      {/* Label */}
      <SectionRow icon="🏷️" title="Format étiquette" subtitle={`${settings.labelWidth}×${settings.labelHeight}mm`} open={openSection === 'label'} onToggle={() => toggle('label')}>
        <LabelFormatSettings settings={settings} onUpdate={updateSettings} />
        <div className="mt-5">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Aperçu</p>
          <div className="flex justify-center p-4 bg-muted/30 rounded-2xl overflow-auto">
            <LabelPreview product={sampleProduct} settings={settings} productionDate={new Date()} dlcDate={new Date(Date.now() + 3 * 86400000)} />
          </div>
        </div>
      </SectionRow>

      {/* Import/Export */}
      <SectionRow icon="📦" title="Produits" subtitle="Importer / Exporter" open={openSection === 'products'} onToggle={() => toggle('products')}>
        <ProductImportExport />
      </SectionRow>

      {/* Save */}
      <div className="pt-2">
        <Button className="w-full h-12 rounded-2xl gradient-primary border-0 text-[14px] font-semibold" onClick={() => toast.success('Paramètres sauvegardés')}>
          <Save className="mr-2 h-4 w-4" />
          Sauvegarder
        </Button>
      </div>
    </div>
  );
}

function FieldInput({ placeholder, value, onChange, type = 'text' }: { placeholder: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <Input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-11 text-[13px] rounded-xl bg-background border-border/60 focus:border-primary/40 transition-colors"
    />
  );
}

function SectionRow({ icon, title, subtitle, open, onToggle, children }: {
  icon: string; title: string; subtitle: string; open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-card overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-muted/40 transition-colors">
        <span className="text-lg">{icon}</span>
        <div className="flex-1 text-left min-w-0">
          <p className="text-[14px] font-semibold">{title}</p>
          {!open && <p className="text-[11px] text-muted-foreground truncate">{subtitle}</p>}
        </div>
        <ChevronRight className={`h-4 w-4 text-muted-foreground/30 transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && <div className="px-4 pb-4 animate-fade-up">{children}</div>}
    </div>
  );
}