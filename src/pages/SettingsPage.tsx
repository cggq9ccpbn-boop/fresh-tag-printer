import { useState } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Building2, Phone, FileText, Printer, Upload, X, Save } from 'lucide-react';
import { toast } from 'sonner';

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
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Paramètres
        </h1>
        <p className="text-muted-foreground mt-1">
          Configurez les informations de votre distributeur
        </p>
      </div>

      {/* Informations société */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Informations société</CardTitle>
              <CardDescription>Les informations affichées sur vos étiquettes</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo */}
          <div className="space-y-2">
            <Label>Logo</Label>
            <div className="flex items-center gap-4">
              {logoPreview ? (
                <div className="relative">
                  <img
                    src={logoPreview}
                    alt="Logo"
                    className="h-20 w-20 object-contain rounded-xl border border-border bg-muted p-2"
                  />
                  <button
                    onClick={removeLogo}
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="h-20 w-20 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-accent transition-colors">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground mt-1">Ajouter</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                </label>
              )}
              <div className="text-sm text-muted-foreground">
                <p>Format recommandé : PNG ou JPG</p>
                <p>Taille max : 2 Mo</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Nom et adresse */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="companyName">Nom de la société</Label>
              <Input
                id="companyName"
                placeholder="Ma Société"
                value={settings.companyName}
                onChange={(e) => updateSettings({ companyName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                placeholder="123 rue de la Paix"
                value={settings.address}
                onChange={(e) => updateSettings({ address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">Code postal</Label>
              <Input
                id="postalCode"
                placeholder="75001"
                value={settings.postalCode}
                onChange={(e) => updateSettings({ postalCode: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Ville</Label>
              <Input
                id="city"
                placeholder="Paris"
                value={settings.city}
                onChange={(e) => updateSettings({ city: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coordonnées */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Phone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Coordonnées</CardTitle>
              <CardDescription>Comment vous contacter</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                placeholder="01 23 45 67 89"
                value={settings.phone}
                onChange={(e) => updateSettings({ phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="contact@societe.fr"
                value={settings.email}
                onChange={(e) => updateSettings({ email: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informations légales */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Informations légales</CardTitle>
              <CardDescription>Numéros d'identification</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="siret">SIRET</Label>
              <Input
                id="siret"
                placeholder="123 456 789 00012"
                value={settings.siret}
                onChange={(e) => updateSettings({ siret: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vatNumber">Numéro de TVA</Label>
              <Input
                id="vatNumber"
                placeholder="FR12345678901"
                value={settings.vatNumber}
                onChange={(e) => updateSettings({ vatNumber: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration imprimante */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Printer className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Imprimante thermique</CardTitle>
              <CardDescription>Connexion TCP/IP à l'imprimante</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="printerIp">Adresse IP</Label>
              <Input
                id="printerIp"
                placeholder="192.168.1.100"
                value={settings.printerIp}
                onChange={(e) => updateSettings({ printerIp: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="printerPort">Port</Label>
              <Input
                id="printerPort"
                type="number"
                placeholder="9100"
                value={settings.printerPort}
                onChange={(e) => updateSettings({ printerPort: parseInt(e.target.value) || 9100 })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bouton de sauvegarde */}
      <div className="flex justify-end">
        <Button size="lg" onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Sauvegarder
        </Button>
      </div>
    </div>
  );
}
