import { useState } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Building2, Phone, FileText, Printer, Upload, X, Save, Tag, Eye, Camera, MapPin, Mail, Hash, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { PrinterScanner } from '@/components/settings/PrinterScanner';
import { LabelFormatSettings } from '@/components/settings/LabelFormatSettings';
import { LabelPreview } from '@/components/print/LabelPreview';
import { Product } from '@/types';

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const [logoPreview, setLogoPreview] = useState<string | null>(settings.logo);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    company: true,
    contact: false,
    legal: false,
    printer: false,
    label: false,
  });

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

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

  const companyFilled = !!(settings.companyName || settings.address);
  const contactFilled = !!(settings.phone || settings.email);
  const legalFilled = !!(settings.bceNumber || settings.vatNumber);
  const printerFilled = !!(settings.printerIp && settings.printerIp !== '192.168.1.100');

  return (
    <div className="space-y-3 pt-2 max-w-2xl mx-auto pb-8 animate-fade-in">
      {/* Société */}
      <Section
        icon={<Building2 className="h-4 w-4" />}
        title="Société"
        color="primary"
        expanded={expandedSections.company}
        onToggle={() => toggleSection('company')}
        badge={companyFilled ? settings.companyName || 'Configuré' : undefined}
      >
        {/* Logo */}
        <div className="flex items-start gap-4 mb-5">
          {logoPreview ? (
            <div className="relative group">
              <img src={logoPreview} alt="Logo" className="h-20 w-20 object-contain rounded-2xl border border-border/60 bg-background p-2 shadow-soft" />
              <button
                onClick={removeLogo}
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-card"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <label className="h-20 w-20 rounded-2xl border-2 border-dashed border-border/60 flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all flex-shrink-0">
              <Camera className="h-5 w-5 text-muted-foreground mb-1" />
              <span className="text-[10px] text-muted-foreground font-medium">Logo</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </label>
          )}
          <div className="flex-1 space-y-3 pt-1">
            <SettingsInput
              icon={<Building2 className="h-3.5 w-3.5" />}
              placeholder="Nom de la société"
              value={settings.companyName}
              onChange={(v) => updateSettings({ companyName: v })}
            />
          </div>
        </div>
        <div className="space-y-3">
          <SettingsInput
            icon={<MapPin className="h-3.5 w-3.5" />}
            placeholder="Adresse"
            value={settings.address}
            onChange={(v) => updateSettings({ address: v })}
          />
          <div className="grid grid-cols-5 gap-2">
            <div className="col-span-2">
              <SettingsInput
                placeholder="Code postal"
                value={settings.postalCode}
                onChange={(v) => updateSettings({ postalCode: v })}
              />
            </div>
            <div className="col-span-3">
              <SettingsInput
                placeholder="Ville"
                value={settings.city}
                onChange={(v) => updateSettings({ city: v })}
              />
            </div>
          </div>
        </div>
      </Section>

      {/* Contact */}
      <Section
        icon={<Phone className="h-4 w-4" />}
        title="Contact"
        color="gold"
        expanded={expandedSections.contact}
        onToggle={() => toggleSection('contact')}
        badge={contactFilled ? (settings.phone || settings.email) : undefined}
      >
        <div className="space-y-3">
          <SettingsInput
            icon={<Phone className="h-3.5 w-3.5" />}
            placeholder="Téléphone"
            value={settings.phone}
            onChange={(v) => updateSettings({ phone: v })}
            type="tel"
          />
          <SettingsInput
            icon={<Mail className="h-3.5 w-3.5" />}
            placeholder="Adresse email"
            value={settings.email}
            onChange={(v) => updateSettings({ email: v })}
            type="email"
          />
        </div>
      </Section>

      {/* Légal */}
      <Section
        icon={<FileText className="h-4 w-4" />}
        title="Informations légales"
        color="secondary"
        expanded={expandedSections.legal}
        onToggle={() => toggleSection('legal')}
        badge={legalFilled ? 'Configuré' : undefined}
      >
        <div className="space-y-3">
          <SettingsInput
            icon={<Hash className="h-3.5 w-3.5" />}
            placeholder="Numéro BCE"
            value={settings.bceNumber}
            onChange={(v) => updateSettings({ bceNumber: v })}
          />
          <SettingsInput
            icon={<Hash className="h-3.5 w-3.5" />}
            placeholder="Numéro TVA"
            value={settings.vatNumber}
            onChange={(v) => updateSettings({ vatNumber: v })}
          />
        </div>
      </Section>

      {/* Imprimante */}
      <Section
        icon={<Printer className="h-4 w-4" />}
        title="Imprimante"
        color="accent"
        expanded={expandedSections.printer}
        onToggle={() => toggleSection('printer')}
        badge={printerFilled ? settings.printerIp : undefined}
      >
        <PrinterScanner printerIp={settings.printerIp} printerPort={settings.printerPort} onSelect={(ip, port) => updateSettings({ printerIp: ip, printerPort: port })} />
      </Section>

      {/* Étiquette */}
      <Section
        icon={<Tag className="h-4 w-4" />}
        title="Format d'étiquette"
        color="primary"
        expanded={expandedSections.label}
        onToggle={() => toggleSection('label')}
        badge={`${settings.labelWidth}×${settings.labelHeight}mm`}
      >
        <LabelFormatSettings settings={settings} onUpdate={updateSettings} />
        <div className="mt-5">
          <Label className="text-xs font-bold flex items-center gap-1.5 mb-3 text-muted-foreground uppercase tracking-wider">
            <Eye className="h-3.5 w-3.5" /> Aperçu en temps réel
          </Label>
          <div className="flex justify-center p-4 bg-muted/30 rounded-2xl border border-border/40 overflow-auto">
            <LabelPreview product={sampleProduct} settings={settings} productionDate={sampleProductionDate} dlcDate={sampleDlcDate} />
          </div>
        </div>
      </Section>

      {/* Save */}
      <Button className="w-full h-12 rounded-2xl gradient-primary border-0 shadow-card hover:shadow-elevated transition-all text-base font-semibold" onClick={() => toast.success('Paramètres sauvegardés')}>
        <Save className="mr-2 h-5 w-5" />
        Sauvegarder
      </Button>
    </div>
  );
}

/* ─── Reusable input with icon ─── */
function SettingsInput({
  icon,
  placeholder,
  value,
  onChange,
  type = 'text',
}: {
  icon?: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </div>
      )}
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-11 text-sm rounded-xl bg-background/60 border-border/50 transition-all focus:bg-background focus:shadow-soft ${icon ? 'pl-9' : ''}`}
      />
    </div>
  );
}

/* ─── Collapsible section ─── */
function Section({
  icon,
  title,
  color,
  children,
  expanded,
  onToggle,
  badge,
}: {
  icon: React.ReactNode;
  title: string;
  color: 'primary' | 'gold' | 'accent' | 'secondary';
  children: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  badge?: string;
}) {
  const colorMap = {
    primary: { bg: 'bg-primary/10', text: 'text-primary', gradient: 'gradient-primary' },
    gold: { bg: 'bg-gold-muted', text: 'text-gold', gradient: 'gradient-gold' },
    accent: { bg: 'bg-accent/10', text: 'text-accent', gradient: '' },
    secondary: { bg: 'bg-secondary', text: 'text-secondary-foreground', gradient: '' },
  };
  const c = colorMap[color];

  return (
    <div className="rounded-2xl bg-card border border-border/60 shadow-soft overflow-hidden transition-all">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors"
      >
        <div className={`h-9 w-9 rounded-xl ${c.bg} flex items-center justify-center flex-shrink-0`}>
          <span className={c.text}>{icon}</span>
        </div>
        <div className="flex-1 text-left min-w-0">
          <h3 className="font-semibold text-sm">{title}</h3>
          {!expanded && badge && (
            <p className="text-[11px] text-muted-foreground truncate mt-0.5">{badge}</p>
          )}
        </div>
        <div className="text-muted-foreground/50">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-4 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}