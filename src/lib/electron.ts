// Native printing utilities for desktop (Electron) and mobile (Capacitor)

import { Capacitor, registerPlugin } from '@capacitor/core';

interface TcpPrinterPlugin {
  print(options: { ip: string; port: number; data: string }): Promise<{ success: boolean }>;
  testConnection(options: { ip: string; port: number }): Promise<{ connected: boolean }>;
}

const TcpPrinter = registerPlugin<TcpPrinterPlugin>('TcpPrinter');

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
 * On Capacitor (iOS/Android): sends raw ZPL string to native plugin.
 * On Electron: sends base64-encoded data via IPC.
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
      await TcpPrinter.print({ ip, port, data: zplData });
      return { success: true };
    } catch (error) {
      console.error('[TcpPrinter] Print error:', error);
      return { success: false, error: String(error) };
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
      await TcpPrinter.testConnection({ ip, port });
      return { success: true };
    } catch (error) {
      console.error('[TcpPrinter] Test error:', error);
      return { success: false, error: String(error) };
    }
  }

  return { success: false, error: "Test de connexion disponible uniquement dans l'app native" };
};
