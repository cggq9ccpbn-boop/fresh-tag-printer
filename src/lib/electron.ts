// Native printing utilities for desktop (Electron) and mobile (Capacitor)

import { Capacitor } from '@capacitor/core';
import { TcpSocket } from '@deedarb/capacitor-tcp-socket';

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

/**
 * Classify a raw error into a user-friendly category.
 */
export type PrintErrorKind = 'plugin_missing' | 'network' | 'send' | 'unknown';

export const classifyError = (error: unknown): { kind: PrintErrorKind; message: string } => {
  const raw = String(error);

  if (raw.includes('UNIMPLEMENTED') || raw.includes('not implemented')) {
    return {
      kind: 'plugin_missing',
      message:
        'Le plugin natif TcpSocket n\'est pas chargé. Resynchronisez le projet iOS :\n' +
        '1. npm install --legacy-peer-deps\n' +
        '2. npm run build\n' +
        '3. npx cap sync ios\n' +
        '4. Dans Xcode : Product → Clean Build Folder puis ▶️ Run',
    };
  }

  if (
    raw.includes('ECONNREFUSED') ||
    raw.includes('ETIMEDOUT') ||
    raw.includes('ENETUNREACH') ||
    raw.includes('timeout') ||
    raw.includes('Connection refused')
  ) {
    return {
      kind: 'network',
      message: 'Impossible de joindre l\'imprimante. Vérifiez l\'adresse IP, le port et que l\'imprimante est allumée sur le même réseau.',
    };
  }

  if (raw.includes('send') || raw.includes('write')) {
    return {
      kind: 'send',
      message: 'Connexion établie mais l\'envoi des données a échoué. Réessayez ou redémarrez l\'imprimante.',
    };
  }

  return { kind: 'unknown', message: raw };
};

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

/**
 * Send raw data via TcpSocket plugin (Capacitor).
 */
const sendViaTcpSocket = async (ip: string, port: number, data: string): Promise<void> => {
  const { client } = await TcpSocket.connect({ ipAddress: ip, port, timeout: 5 });
  try {
    if (data) {
      await TcpSocket.send({ client, data });
    }
  } finally {
    await TcpSocket.disconnect({ client }).catch(() => {});
  }
};

/**
 * Print raw ZPL data directly to a thermal printer via TCP.
 */
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
      console.log('[TcpSocket] Sending ZPL to', ip, ':', port, '- length:', zplData.length);
      await sendViaTcpSocket(ip, port, zplData);
      return { success: true };
    } catch (error) {
      console.error('[TcpSocket] Print error:', error);
      const classified = classifyError(error);
      return { success: false, error: classified.message, errorKind: classified.kind };
    }
  }

  return { success: false, error: "L'impression TCP nécessite l'application native (iPad/desktop)", errorKind: 'unknown' };
};

/**
 * Test connection to a printer
 */
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
      console.log('[TcpSocket] Testing connection to', ip, ':', port);
      await sendViaTcpSocket(ip, port, '');
      return { success: true };
    } catch (error) {
      console.error('[TcpSocket] Test error:', error);
      const classified = classifyError(error);
      return { success: false, error: classified.message, errorKind: classified.kind };
    }
  }

  return { success: false, error: "Test de connexion disponible uniquement dans l'app native", errorKind: 'unknown' };
};

/**
 * Check if TcpSocket plugin is available (diagnostic)
 */
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

  const registered = Capacitor.isPluginAvailable('TcpSocket');

  if (!registered) {
    return {
      platform,
      pluginAvailable: false,
      pluginRegistered: false,
      error: 'Plugin TcpSocket non enregistré dans le projet natif',
      instructions:
        'Le plugin natif n\'est pas inclus dans le build iOS.\n' +
        'Cause probable : le projet iOS a été créé en mode SPM (Swift Package Manager),\n' +
        'mais le plugin TCP ne supporte que CocoaPods.\n\n' +
        'Solution :\n' +
        '1. brew install cocoapods  (si pas déjà installé)\n' +
        '2. rm -rf ios/\n' +
        '3. npm install --legacy-peer-deps\n' +
        '4. npm run build\n' +
        '5. npx cap add ios --packagemanager cocoapods\n' +
        '6. npx cap sync ios\n' +
        '7. npx cap open ios\n' +
        '8. Dans Xcode : Product → Clean Build Folder → ▶️ Run',
    };
  }

  // Plugin is registered, try a quick connect to verify it's truly functional
  try {
    await TcpSocket.connect({ ipAddress: '0.0.0.0', port: 1, timeout: 1 });
    // If this succeeds (unlikely), plugin works
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
          'Le plugin JS est présent mais le code natif manque.\n' +
          'Cause : le projet iOS utilise SPM au lieu de CocoaPods.\n\n' +
          'Solution :\n' +
          '1. brew install cocoapods  (si pas déjà installé)\n' +
          '2. rm -rf ios/\n' +
          '3. npm install --legacy-peer-deps\n' +
          '4. npm run build\n' +
          '5. npx cap add ios --packagemanager cocoapods\n' +
          '6. npx cap sync ios\n' +
          '7. npx cap open ios\n' +
          '8. Product → Clean Build Folder → ▶️ Run',
      };
    }
    // Any other error means plugin IS functional (network error = plugin works)
    return { platform, pluginAvailable: true, pluginRegistered: true };
  }
};
