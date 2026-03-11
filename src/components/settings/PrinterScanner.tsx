import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { isElectron, scanForPrinters, testPrinterConnection, diagnoseTcpPlugin, getPlatform } from '@/lib/electron';
import { Loader2, Search, Wifi, WifiOff, CheckCircle2, Plug, Activity } from 'lucide-react';
import { toast } from 'sonner';

interface PrinterScannerProps {
  printerIp: string;
  printerPort: number;
  onSelect: (ip: string, port: number) => void;
}

export function PrinterScanner({ printerIp, printerPort, onSelect }: PrinterScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [testing, setTesting] = useState(false);
  const [diagnosing, setDiagnosing] = useState(false);
  const [printers, setPrinters] = useState<{ ip: string; port: number }[]>([]);
  const [scanned, setScanned] = useState(false);
  const [manualIp, setManualIp] = useState(printerIp);
  const [manualPort, setManualPort] = useState(String(printerPort));
  const [selectedIp, setSelectedIp] = useState(printerIp);

  const handleScan = async () => {
    setScanning(true);
    setPrinters([]);
    setScanned(false);
    try {
      const result = await scanForPrinters(parseInt(manualPort) || 9100);
      setPrinters(result.printers);
      setScanned(true);
      if (result.printers.length === 0) {
        toast.info('Aucune imprimante trouvée sur le réseau');
      } else {
        toast.success(`${result.printers.length} imprimante(s) trouvée(s)`);
      }
    } catch {
      toast.error('Erreur lors du scan réseau');
    } finally {
      setScanning(false);
    }
  };

  const handleSelectPrinter = (ip: string, port: number) => {
    setSelectedIp(ip);
    setManualIp(ip);
    setManualPort(String(port));
    onSelect(ip, port);
    toast.success(`Imprimante ${ip} sélectionnée`);
  };

  const handleManualSave = () => {
    const port = parseInt(manualPort) || 9100;
    setSelectedIp(manualIp);
    onSelect(manualIp, port);
    toast.success('Adresse IP enregistrée');
  };

  const handleTestConnection = async () => {
    setTesting(true);
    const port = parseInt(manualPort) || 9100;
    try {
      const result = await testPrinterConnection(manualIp, port);
      if (result.success) {
        toast.success('Connexion réussie !');
      } else {
        toast.error(result.error || 'Connexion échouée');
      }
    } catch {
      toast.error('Erreur de connexion');
    } finally {
      setTesting(false);
    }
  };

  const handleDiagnose = async () => {
    setDiagnosing(true);
    try {
      const result = await diagnoseTcpPlugin();
      const platform = getPlatform();
      if (result.pluginAvailable) {
        toast.success(`Plateforme : ${platform} — Plugin TcpPrinter : ✅ détecté`);
      } else {
        toast.error(`Plateforme : ${platform} — Plugin TcpPrinter : ❌ non détecté${result.error ? ` (${result.error})` : ''}`);
      }
    } catch {
      toast.error('Erreur lors du diagnostic');
    } finally {
      setDiagnosing(false);
    }
  };

  const electron = isElectron();

  return (
    <div className="space-y-5">
      {/* Scanner réseau (Electron uniquement) */}
      {electron && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Recherche automatique</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={handleScan}
              disabled={scanning}
              className="gap-2"
            >
              {scanning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              {scanning ? 'Scan en cours...' : 'Scanner le réseau'}
            </Button>
          </div>

          {scanning && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border/50">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <div>
                <p className="text-sm font-medium">Scan du réseau en cours...</p>
                <p className="text-xs text-muted-foreground">Recherche d'imprimantes sur le port {manualPort}</p>
              </div>
            </div>
          )}

          {scanned && printers.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Imprimantes trouvées :</Label>
              {printers.map((printer) => (
                <button
                  key={printer.ip}
                  onClick={() => handleSelectPrinter(printer.ip, printer.port)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left ${
                    selectedIp === printer.ip
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border/50 hover:border-primary/30 hover:bg-muted/30'
                  }`}
                >
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                    selectedIp === printer.ip ? 'bg-primary/20' : 'bg-muted'
                  }`}>
                    {selectedIp === printer.ip ? (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    ) : (
                      <Wifi className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-mono font-medium">{printer.ip}</p>
                    <p className="text-xs text-muted-foreground">Port {printer.port}</p>
                  </div>
                  {selectedIp === printer.ip && (
                    <Badge variant="secondary" className="text-xs">Sélectionnée</Badge>
                  )}
                </button>
              ))}
            </div>
          )}

          {scanned && printers.length === 0 && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50">
              <WifiOff className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-sm font-medium text-amber-900 dark:text-amber-200">Aucune imprimante trouvée</p>
                <p className="text-xs text-amber-700 dark:text-amber-400">Entrez l'adresse IP manuellement ci-dessous</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Saisie manuelle */}
      <div className="space-y-3">
        {electron && <Label className="text-sm font-medium">Configuration manuelle</Label>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="printerIp" className="text-xs text-muted-foreground">Adresse IP</Label>
            <Input
              id="printerIp"
              placeholder="192.168.1.100"
              value={manualIp}
              onChange={(e) => setManualIp(e.target.value)}
              className="h-11 bg-background/50 border-border/50 font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="printerPort" className="text-xs text-muted-foreground">Port</Label>
            <Input
              id="printerPort"
              type="number"
              placeholder="9100"
              value={manualPort}
              onChange={(e) => setManualPort(e.target.value)}
              className="h-11 bg-background/50 border-border/50 font-mono"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleManualSave} className="gap-2">
            <Plug className="h-4 w-4" />
            Enregistrer
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleTestConnection}
            disabled={testing || !manualIp}
            className="gap-2"
          >
            {testing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Wifi className="h-4 w-4" />
            )}
            Tester la connexion
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDiagnose}
            disabled={diagnosing}
            className="gap-2"
          >
            {diagnosing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Activity className="h-4 w-4" />
            )}
            Diagnostic
          </Button>
        </div>
      </div>
    </div>
  );
}
