// Native printing utilities for desktop (Electron) and mobile (Capacitor)
// iOS uses a LOCAL TcpPrinter plugin (Swift/NWConnection), NOT an npm package.

import { Capacitor, registerPlugin } from '@capacitor/core';

// ── Local Capacitor plugin interface ──────────────────────────────────
interface TcpPrinterPlugin {
  print(options: { ip: string; port: number; data: string }): Promise<{ success: boolean }>;
  testConnection(options: { ip: string; port: number }): Promise<{ connected: boolean }>;
}

// Register the LOCAL native plugin (maps to TcpPrinterPlugin.swift/.m)
const TcpPrinter = registerPlugin<TcpPrinterPlugin>('TcpPrinter');

// ── Electron API (desktop) ────────────────────────────────────────────
interface PrinterInfo {
  ip: string;
  port: number;
}

interface ElectronAPI {
  printTcp: (options: { ip: string; port: number; data: string }) => Promise<{ success: boolean }>;
  testPrinterConnection: (options: { ip: string; port: number }) => Promise<{ connected: boolean }>;
  scanNetwork: (options: { port?: number; timeout?: number }) => Promise<{ printers: PrinterInfo[]; subnet: string }>;
  platform: string;
  isElectron: boolean;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

// ── Platform detection ────────────────────────────────────────────────
export const isElectron = (): boolean => {
  return typeof window !== 'undefined' && !!window.electronAPI?.isElectron;
};

export const isCapacitor = (): boolean => {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
};

export const canPrintNatively = (): boolean => {
  return isElectron() || isCapacitor();
};

export const getPlatform = (): 'electron' | 'ios' | 'android' | 'web' => {
  if (isElectron()) return 'electron';
  if (isCapacitor()) {
    return Capacitor.getPlatform() as 'ios' | 'android';
  }
  return 'web';
};

// ── Error handling ────────────────────────────────────────────────────
export type PrintErrorKind = 'plugin_missing' | 'network' | 'send' | 'permission' | 'unknown';

export const classifyError = (error: unknown): { kind: PrintErrorKind; message: string } => {
  const raw = String(error);

  if (raw.includes('UNIMPLEMENTED') || raw.includes('not implemented')) {
    return {
      kind: 'plugin_missing',
      message:
        'Le plugin natif TcpPrinter n\'est pas chargé.\n' +
        'Resynchronisez le projet iOS :\n' +
        '1. git pull\n' +
        '2. npm install --legacy-peer-deps\n' +
        '3. npm run build\n' +
        '4. rm -rf ios/ && ./setup-ios.sh\n' +
        '5. Dans Xcode : Product → Clean Build Folder puis ▶️ Run',
    };
  }

  if (raw.includes('denied') || raw.includes('Local Network') || raw.includes('permission')) {
    return {
      kind: 'permission',
      message: 'Accès réseau local refusé par iOS. Allez dans Réglages → Ital Panini → Réseau local et activez l\'autorisation.',
    };
  }

  if (
    raw.includes('ECONNREFUSED') ||
    raw.includes('ETIMEDOUT') ||
    raw.includes('ENETUNREACH') ||
    raw.includes('timeout') ||
    raw.includes('Connection refused') ||
    raw.includes('Connection timeout') ||
    raw.includes('Connection failed') ||
    raw.includes('Connection waiting')
  ) {
    return {
      kind: 'network',
      message: 'Impossible de joindre l\'imprimante. Vérifiez l\'adresse IP, le port et que l\'imprimante est allumée sur le même réseau.',
    };
  }

  if (raw.includes('send') || raw.includes('write') || raw.includes('Send error')) {
    return {
      kind: 'send',
      message: 'Connexion établie mais l\'envoi des données a échoué. Réessayez ou redémarrez l\'imprimante.',
    };
  }

  return { kind: 'unknown', message: raw };
};

// ── Scanner (Electron only) ───────────────────────────────────────────
export const scanForPrinters = async (
  port: number = 9100
): Promise<{ printers: PrinterInfo[]; subnet: string }> => {
  if (isElectron()) {
    try {
      return await window.electronAPI!.scanNetwork({ port, timeout: 1000 });
    } catch {
      return { printers: [], subnet: '' };
    }
  }
  return { printers: [], subnet: '' };
};

// ── Print via TCP ─────────────────────────────────────────────────────
export const printViaTcp = async (
  ip: string,
  port: number,
  zplData: string
): Promise<{ success: boolean; error?: string; errorKind?: PrintErrorKind }> => {
  if (isElectron()) {
    try {
      const base64 = btoa(unescape(encodeURIComponent(zplData)));
      const result = await window.electronAPI!.printTcp({ ip, port, data: base64 });
      return { success: result.success };
    } catch (error) {
      const classified = classifyError(error);
      return { success: false, error: classified.message, errorKind: classified.kind };
    }
  }

  if (isCapacitor()) {
    try {
      console.log('[TcpPrinter] Sending ZPL to', ip, ':', port, '- length:', zplData.length);
      const result = await TcpPrinter.print({ ip, port, data: zplData });
      return { success: !!result.success };
    } catch (error) {
      console.error('[TcpPrinter] Print error:', error);
      const classified = classifyError(error);
      return { success: false, error: classified.message, errorKind: classified.kind };
    }
  }

  return { success: false, error: "L'impression TCP nécessite l'application native (iPad/desktop)", errorKind: 'unknown' };
};

// ── Test connection ───────────────────────────────────────────────────
export const testPrinterConnection = async (
  ip: string,
  port: number
): Promise<{ success: boolean; error?: string; errorKind?: PrintErrorKind }> => {
  if (isElectron()) {
    try {
      const result = await window.electronAPI!.testPrinterConnection({ ip, port });
      return { success: result.connected };
    } catch (error) {
      const classified = classifyError(error);
      return { success: false, error: classified.message, errorKind: classified.kind };
    }
  }

  if (isCapacitor()) {
    try {
      console.log('[TcpPrinter] Testing connection to', ip, ':', port);
      const result = await TcpPrinter.testConnection({ ip, port });
      return { success: !!result.connected };
    } catch (error) {
      console.error('[TcpPrinter] Test error:', error);
      const classified = classifyError(error);
      return { success: false, error: classified.message, errorKind: classified.kind };
    }
  }

  return { success: false, error: "Test de connexion disponible uniquement dans l'app native", errorKind: 'unknown' };
};

// ── Diagnostic ────────────────────────────────────────────────────────
export const diagnoseTcpPlugin = async (): Promise<{
  platform: string;
  pluginAvailable: boolean;
  pluginRegistered: boolean;
  error?: string;
  instructions?: string;
}> => {
  const platform = getPlatform();

  if (!isCapacitor()) {
    return { platform, pluginAvailable: false, pluginRegistered: false, error: 'Pas en mode Capacitor (web ou desktop)' };
  }

  // Check if the local TcpPrinter plugin is registered
  const registered = Capacitor.isPluginAvailable('TcpPrinter');

  if (!registered) {
    return {
      platform,
      pluginAvailable: false,
      pluginRegistered: false,
      error: 'Plugin TcpPrinter non enregistré dans le projet natif',
      instructions:
        'Le plugin natif local n\'est pas inclus dans le build iOS.\n\n' +
        'Solution :\n' +
        '1. git pull (pour récupérer les derniers fichiers)\n' +
        '2. npm install --legacy-peer-deps\n' +
        '3. npm run build\n' +
        '4. rm -rf ios/\n' +
        '5. ./setup-ios.sh\n' +
        '6. Dans Xcode : Product → Clean Build Folder → ▶️ Run',
    };
  }

  // Plugin is registered JS-side, test if native side responds
  try {
    await TcpPrinter.testConnection({ ip: '0.0.0.0', port: 1 });
    return { platform, pluginAvailable: true, pluginRegistered: true };
  } catch (error) {
    const raw = String(error);
    if (raw.includes('UNIMPLEMENTED') || raw.includes('not implemented')) {
      return {
        platform,
        pluginAvailable: false,
        pluginRegistered: true,
        error: 'Plugin enregistré côté JS mais absent côté natif iOS',
        instructions:
          'Le fichier Swift du plugin n\'est pas dans le build Xcode.\n\n' +
          'Solution :\n' +
          '1. git pull\n' +
          '2. rm -rf ios/\n' +
          '3. ./setup-ios.sh\n' +
          '4. Dans Xcode : Product → Clean Build Folder → ▶️ Run\n\n' +
          'Le script setup-ios.sh copie automatiquement les fichiers\n' +
          'TcpPrinterPlugin.swift et .m dans le projet iOS.',
      };
    }
    // Any other error means plugin IS functional (network error = plugin works)
    return { platform, pluginAvailable: true, pluginRegistered: true };
  }
};
