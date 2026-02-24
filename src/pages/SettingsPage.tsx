import { useState } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Building2, Phone, FileText, Printer, Upload, X, Save, Sparkles, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { PrinterScanner } from '@/components/settings/PrinterScanner';
import { LabelFormatSettings } from '@/components/settings/LabelFormatSettings';

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const [logoPreview, setLogoPreview] = useState<string | null>(settings.logo);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Le fichier est trop volumineux (max 2 Mo)');
        return;
      }

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

  const removeLogo = () => {
    setLogoPreview(null);
    updateSettings({ logo: null });
    toast.success('Logo supprimé');
  };

  const handleSave = () => {
    toast.success('Paramètres sauvegardés');
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header avec gradient subtil */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-accent/20 p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Paramètres
            </h1>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base max-w-md">
            Personnalisez les informations de votre distributeur pour créer des étiquettes professionnelles
          </p>
        </div>
      </div>

      {/* Informations société */}
      <Card className="border-0 shadow-lg shadow-primary/5 bg-gradient-to-br from-card to-card/80 backdrop-blur">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg sm:text-xl">Informations société</CardTitle>
              <CardDescription className="text-sm">Les informations affichées sur vos étiquettes</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Logo */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Logo de l'entreprise</Label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {logoPreview ? (
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <img
                    src={logoPreview}
                    alt="Logo"
                    className="relative h-24 w-24 object-contain rounded-2xl border-2 border-border bg-background p-3 shadow-sm"
                  />
                  <button
                    onClick={removeLogo}
                    className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90 shadow-lg transition-transform hover:scale-110"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="group h-24 w-24 rounded-2xl border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-300">
                  <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <Upload className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <span className="text-xs text-muted-foreground mt-2 group-hover:text-primary transition-colors">Ajouter</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                </label>
              )}
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Format recommandé : PNG ou JPG</p>
                <p className="text-xs text-muted-foreground/70">Taille maximale : 2 Mo</p>
              </div>
            </div>
          </div>

          <Separator className="bg-border/50" />

          {/* Nom et adresse */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-sm font-medium">Nom de la société</Label>
              <Input
                id="companyName"
                placeholder="Ma Société SPRL"
                value={settings.companyName}
                onChange={(e) => updateSettings({ companyName: e.target.value })}
                className="h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-medium">Adresse</Label>
              <Input
                id="address"
                placeholder="Rue de la Loi 1"
                value={settings.address}
                onChange={(e) => updateSettings({ address: e.target.value })}
                className="h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode" className="text-sm font-medium">Code postal</Label>
              <Input
                id="postalCode"
                placeholder="1000"
                value={settings.postalCode}
                onChange={(e) => updateSettings({ postalCode: e.target.value })}
                className="h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city" className="text-sm font-medium">Ville</Label>
              <Input
                id="city"
                placeholder="Bruxelles"
                value={settings.city}
                onChange={(e) => updateSettings({ city: e.target.value })}
                className="h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coordonnées */}
      <Card className="border-0 shadow-lg shadow-primary/5 bg-gradient-to-br from-card to-card/80 backdrop-blur">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/25">
              <Phone className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg sm:text-xl">Coordonnées</CardTitle>
              <CardDescription className="text-sm">Comment vous contacter</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">Téléphone</Label>
              <Input
                id="phone"
                placeholder="+32 2 123 45 67"
                value={settings.phone}
                onChange={(e) => updateSettings({ phone: e.target.value })}
                className="h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="contact@societe.be"
                value={settings.email}
                onChange={(e) => updateSettings({ email: e.target.value })}
                className="h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informations légales */}
      <Card className="border-0 shadow-lg shadow-primary/5 bg-gradient-to-br from-card to-card/80 backdrop-blur">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg sm:text-xl">Informations légales</CardTitle>
              <CardDescription className="text-sm">Numéros d'identification belges</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="bceNumber" className="text-sm font-medium">N° d'entreprise (BCE)</Label>
              <Input
                id="bceNumber"
                placeholder="0123.456.789"
                value={settings.bceNumber}
                onChange={(e) => updateSettings({ bceNumber: e.target.value })}
                className="h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vatNumber" className="text-sm font-medium">Numéro de TVA</Label>
              <Input
                id="vatNumber"
                placeholder="BE0123456789"
                value={settings.vatNumber}
                onChange={(e) => updateSettings({ vatNumber: e.target.value })}
                className="h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration imprimante */}
      <Card className="border-0 shadow-lg shadow-primary/5 bg-gradient-to-br from-card to-card/80 backdrop-blur">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/25">
              <Printer className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg sm:text-xl">Imprimante thermique</CardTitle>
              <CardDescription className="text-sm">Connexion TCP/IP — scannez le réseau ou entrez l'IP manuellement</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <PrinterScanner
            printerIp={settings.printerIp}
            printerPort={settings.printerPort}
            onSelect={(ip, port) => updateSettings({ printerIp: ip, printerPort: port })}
          />
        </CardContent>
      </Card>

      {/* Format d'étiquette */}
      <Card className="border-0 shadow-lg shadow-primary/5 bg-gradient-to-br from-card to-card/80 backdrop-blur">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/25">
              <Tag className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg sm:text-xl">Format d'étiquette</CardTitle>
              <CardDescription className="text-sm">Taille, polices et alignement du contenu</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <LabelFormatSettings settings={settings} onUpdate={updateSettings} />
        </CardContent>
      </Card>

      {/* Bouton de sauvegarde */}
      <div className="flex justify-end pb-6">
        <Button 
          size="lg" 
          onClick={handleSave} 
          className="w-full sm:w-auto h-12 px-8 text-base font-medium shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5"
        >
          <Save className="mr-2 h-5 w-5" />
          Sauvegarder les paramètres
        </Button>
      </div>
    </div>
  );
}
