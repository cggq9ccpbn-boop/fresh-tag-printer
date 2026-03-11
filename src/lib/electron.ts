// Native printing utilities for desktop (Electron) and mobile (Capacitor)

import { Capacitor, registerPlugin } from '@capacitor/core';
import { SocketConnect } from 'capacitor-tcp-connect';

interface TcpPrinterPlugin {
  print(options: { ip: string; port: number; data: string }): Promise<{ success: boolean }>;
  testConnection(options: { ip: string; port: number }): Promise<{ connected: boolean }>;
}

// Lazy plugin registration — only resolved when first accessed
let _tcpPrinter: TcpPrinterPlugin | null = null;
const getTcpPrinter = (): TcpPrinterPlugin => {
  if (!_tcpPrinter) {
    _tcpPrinter = registerPlugin<TcpPrinterPlugin>('TcpPrinter');
  }
  return _tcpPrinter;
};

const normalizeNativeError = (error: unknown): { code?: string; message: string } => {
  if (typeof error === 'object' && error !== null) {
    const maybeError = error as { code?: string; message?: string };
    return {
      code: maybeError.code,
      message: maybeError.message ?? JSON.stringify(error),
    };
  }
  return { message: String(error) };
};

const isUnimplementedError = (error: { code?: string; message: string }): boolean => {
  const message = error.message.toLowerCase();
  return error.code === 'UNIMPLEMENTED' || message.includes('unimplemented') || message.includes('not implemented');
};

const sendViaSocketConnect = async (ip: string, port: number, text: string): Promise<void> => {
  await SocketConnect.open({
    ip,
    port: String(port),
    text,
  });
};

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
 * Print raw ZPL data directly to a thermal printer via TCP.
 */
export const printViaTcp = async (
  ip: string,
  port: number,
  zplData: string
): Promise<{ success: boolean; error?: string }> => {
  if (isElectron()) {
    try {
      const base64 = btoa(unescape(encodeURIComponent(zplData)));
      const result = await window.electronAPI!.printTcp({ ip, port, data: base64 });
      return { success: result.success };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  if (isCapacitor()) {
    try {
      console.log('[TcpPrinter] Sending ZPL to', ip, ':', port, '- length:', zplData.length);
      await getTcpPrinter().print({ ip, port, data: zplData });
      return { success: true };
    } catch (error) {
      const nativeError = normalizeNativeError(error);

      if (isUnimplementedError(nativeError) && Capacitor.isPluginAvailable('SocketConnect')) {
        try {
          console.warn('[TcpPrinter] Plugin TcpPrinter indisponible, fallback sur SocketConnect');
          await sendViaSocketConnect(ip, port, zplData);
          return { success: true };
        } catch (fallbackError) {
          const fallbackNativeError = normalizeNativeError(fallbackError);
          console.error('[TcpPrinter] Fallback print error:', fallbackNativeError);
          return { success: false, error: fallbackNativeError.message };
        }
      }

      console.error('[TcpPrinter] Print error:', nativeError);
      return { success: false, error: nativeError.message };
    }
  }

  return { success: false, error: "L'impression TCP nécessite l'application native (iPad/desktop)" };
};

/**
 * Test connection to a printer
 */
export const testPrinterConnection = async (
  ip: string,
  port: number
): Promise<{ success: boolean; error?: string }> => {
  if (isElectron()) {
    try {
      const result = await window.electronAPI!.testPrinterConnection({ ip, port });
      return { success: result.connected };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  if (isCapacitor()) {
    try {
      console.log('[TcpPrinter] Testing connection to', ip, ':', port);
      await getTcpPrinter().testConnection({ ip, port });
      return { success: true };
    } catch (error) {
      const nativeError = normalizeNativeError(error);

      if (isUnimplementedError(nativeError) && Capacitor.isPluginAvailable('SocketConnect')) {
        try {
          console.warn('[TcpPrinter] Plugin TcpPrinter indisponible, fallback test via SocketConnect');
          await sendViaSocketConnect(ip, port, '');
          return { success: true };
        } catch (fallbackError) {
          const fallbackNativeError = normalizeNativeError(fallbackError);
          console.error('[TcpPrinter] Fallback test error:', fallbackNativeError);
          return { success: false, error: fallbackNativeError.message };
        }
      }

      console.error('[TcpPrinter] Test error:', nativeError);
      return { success: false, error: nativeError.message };
    }
  }

  return { success: false, error: "Test de connexion disponible uniquement dans l'app native" };
};

/**
 * Check if at least one native TCP plugin is available (diagnostic)
 */
export const diagnoseTcpPlugin = async (): Promise<{ platform: string; pluginAvailable: boolean; error?: string }> => {
  const platform = getPlatform();
  if (!isCapacitor()) {
    return { platform, pluginAvailable: false, error: 'Not running on Capacitor' };
  }

  const tcpPrinterAvailable = Capacitor.isPluginAvailable('TcpPrinter');
  const socketConnectAvailable = Capacitor.isPluginAvailable('SocketConnect');

  if (tcpPrinterAvailable || socketConnectAvailable) {
    return { platform, pluginAvailable: true };
  }

  return {
    platform,
    pluginAvailable: false,
    error: 'Aucun plugin TCP natif détecté (TcpPrinter / SocketConnect)',
  };
};
