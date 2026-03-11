// Native printing utilities for desktop (Electron) and mobile (Capacitor)

import { Capacitor } from '@capacitor/core';

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
 * Scan the local network for printers on the given port
 */
export const scanForPrinters = async (
  port: number = 9100
): Promise<{ printers: PrinterInfo[]; subnet: string }> => {
  if (isElectron()) {
    try {
      return await window.electronAPI!.scanNetwork({ port, timeout: 1000 });
    } catch (error) {
      return { printers: [], subnet: '' };
    }
  }
  return { printers: [], subnet: '' };
};

/**
 * Print data directly to a thermal printer via TCP
 * Uses capacitor-tcp-connect on iOS/Android, Electron IPC on desktop
 */
export const printViaTcp = async (
  ip: string,
  port: number,
  data: string
): Promise<{ success: boolean; error?: string }> => {
  if (isElectron()) {
    try {
      const result = await window.electronAPI!.printTcp({ ip, port, data });
      return { success: result.success };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  if (isCapacitor()) {
    try {
      // Decode base64 data back to ZPL text for TCP sending
      const zplText = decodeURIComponent(escape(atob(data)));
      const { SocketConnect } = await import('capacitor-tcp-connect');
      const result = await SocketConnect.open({
        ip,
        port: String(port),
        text: zplText,
      });
      return { success: result.value === 'success' || !!result.value };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  return { success: false, error: 'L\'impression TCP nécessite l\'application native (iPad/desktop)' };
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
      const { TcpConnect } = await import('capacitor-tcp-connect');
      const result = await TcpConnect.open({
        ip,
        port: String(port),
        text: '',
      });
      return { success: result.value === 'success' || !!result.value };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  return { success: false, error: 'Test de connexion disponible uniquement dans l\'app native' };
};
