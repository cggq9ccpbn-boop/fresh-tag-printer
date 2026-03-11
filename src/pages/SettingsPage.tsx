import { useState } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Building2, Phone, FileText, Printer, Upload, X, Save, Tag, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { PrinterScanner } from '@/components/settings/PrinterScanner';
import { LabelFormatSettings } from '@/components/settings/LabelFormatSettings';
import { LabelPreview } from '@/components/print/LabelPreview';
import { Product } from '@/types';

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const [logoPreview, setLogoPreview] = useState<string | null>(settings.logo);

  const sampleProduct: Product = {
    id: 'preview',
    name: settings.companyName ? 'Sandwich Poulet Curry' : 'Produit exemple',
    photo: null,
    category: 'sandwiches',
    allergens: ['gluten', 'milk', 'eggs'],
    shelfLifeDays: 3,
    shelfLifeHours: 0,
    dlcType: 'dlc',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const sampleProductionDate = new Date();
  const sampleDlcDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { toast.error('Fichier trop volumineux (max 2 Mo)'); return; }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setLogoPreview(base64);
        updateSettings({ logo: base64 });
        toast.success('Logo mis à jour');
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => { setLogoPreview(null); updateSettings({ logo: null }); toast.success('Logo supprimé'); };

  return (
    <div className="space-y-4 pt-2 max-w-2xl mx-auto pb-8">
      {/* Société */}
      <Section icon={<Building2 className="h-4 w-4 text-primary" />} title="Société">
        {/* Logo */}
        <div className="flex items-center gap-4 mb-4">
          {logoPreview ? (
            <div className="relative">
              <img src={logoPreview} alt="Logo" className="h-16 w-16 object-contain rounded-xl border border-border bg-background p-2" />
              <button onClick={removeLogo} className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs">
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <label className="h-16 w-16 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
              <Upload className="h-4 w-4 text-muted-foreground" />
              <span className="text-[9px] text-muted-foreground mt-0.5">Logo</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </label>
          )}
          <div className="flex-1 space-y-2">
            <Input placeholder="Nom de la société" value={settings.companyName} onChange={(e) => updateSettings({ companyName: e.target.value })} className="h-9 text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3">
          <Input placeholder="Adresse" value={settings.address} onChange={(e) => updateSettings({ address: e.target.value })} className="h-9 text-sm" />
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Code postal" value={settings.postalCode} onChange={(e) => updateSettings({ postalCode: e.target.value })} className="h-9 text-sm" />
            <Input placeholder="Ville" value={settings.city} onChange={(e) => updateSettings({ city: e.target.value })} className="h-9 text-sm" />
          </div>
        </div>
      </Section>

      {/* Contact */}
      <Section icon={<Phone className="h-4 w-4 text-primary" />} title="Contact">
        <div className="grid grid-cols-1 gap-3">
          <Input placeholder="Téléphone" value={settings.phone} onChange={(e) => updateSettings({ phone: e.target.value })} className="h-9 text-sm" />
          <Input placeholder="Email" type="email" value={settings.email} onChange={(e) => updateSettings({ email: e.target.value })} className="h-9 text-sm" />
        </div>
      </Section>

      {/* Légal */}
      <Section icon={<FileText className="h-4 w-4 text-primary" />} title="Légal">
        <div className="grid grid-cols-1 gap-3">
          <Input placeholder="N° BCE" value={settings.bceNumber} onChange={(e) => updateSettings({ bceNumber: e.target.value })} className="h-9 text-sm" />
          <Input placeholder="N° TVA" value={settings.vatNumber} onChange={(e) => updateSettings({ vatNumber: e.target.value })} className="h-9 text-sm" />
        </div>
      </Section>

      {/* Imprimante */}
      <Section icon={<Printer className="h-4 w-4 text-primary" />} title="Imprimante">
        <PrinterScanner printerIp={settings.printerIp} printerPort={settings.printerPort} onSelect={(ip, port) => updateSettings({ printerIp: ip, printerPort: port })} />
      </Section>

      {/* Étiquette */}
      <Section icon={<Tag className="h-4 w-4 text-primary" />} title="Format d'étiquette">
        <LabelFormatSettings settings={settings} onUpdate={updateSettings} />
        <div className="mt-4">
          <Label className="text-xs font-medium flex items-center gap-1.5 mb-2">
            <Eye className="h-3.5 w-3.5" /> Aperçu
          </Label>
          <div className="flex justify-center p-3 bg-muted/30 rounded-xl border border-border/50 overflow-auto">
            <LabelPreview product={sampleProduct} settings={settings} productionDate={sampleProductionDate} dlcDate={sampleDlcDate} />
          </div>
        </div>
      </Section>

      {/* Save */}
      <Button className="w-full h-11" onClick={() => toast.success('Paramètres sauvegardés')}>
        <Save className="mr-2 h-4 w-4" />
        Sauvegarder
      </Button>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">{icon}</div>
          <h3 className="font-semibold text-sm">{title}</h3>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}
