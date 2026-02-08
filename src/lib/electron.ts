// Native printing utilities for desktop (Electron) and mobile (Capacitor)
// This file provides cross-platform TCP printing capabilities

import { Capacitor } from '@capacitor/core';

// Types pour l'API Electron
interface ElectronAPI {
  printTcp: (options: { ip: string; port: number; data: string }) => Promise<{ success: boolean }>;
  testPrinterConnection: (options: { ip: string; port: number }) => Promise<{ connected: boolean }>;
  platform: string;
  isElectron: boolean;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

/**
 * Check if we're running in Electron
 */
export const isElectron = (): boolean => {
  return typeof window !== 'undefined' && !!window.electronAPI?.isElectron;
};

/**
 * Check if we're running in a native Capacitor app
 */
export const isCapacitor = (): boolean => {
  return Capacitor.isNativePlatform();
};

/**
 * Check if native TCP printing is available
 */
export const canPrintNatively = (): boolean => {
  return isElectron() || isCapacitor();
};

/**
 * Get the current platform name
 */
export const getPlatform = (): 'electron' | 'ios' | 'android' | 'web' => {
  if (isElectron()) return 'electron';
  if (isCapacitor()) {
    return Capacitor.getPlatform() as 'ios' | 'android';
  }
  return 'web';
};

/**
 * Print data directly to a thermal printer via TCP
 * Works in Electron desktop app and Capacitor mobile apps
 */
export const printViaTcp = async (
  ip: string,
  port: number,
  data: string
): Promise<{ success: boolean; error?: string }> => {
  // Electron
  if (isElectron()) {
    try {
      const result = await window.electronAPI!.printTcp({ ip, port, data });
      return { success: result.success };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  // Capacitor (iOS/Android)
  if (isCapacitor()) {
    try {
      const { SocketConnect } = await import('capacitor-tcp-connect');
      const result = await SocketConnect.open({
        ip: ip,
        port: String(port),
        text: data,
      });
      return { 
        success: result.value === 'success', 
        error: result.value !== 'success' ? result.value : undefined 
      };
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
  // Electron
  if (isElectron()) {
    try {
      const result = await window.electronAPI!.testPrinterConnection({ ip, port });
      return { success: result.connected };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  // Capacitor - try sending empty data as connection test
  if (isCapacitor()) {
    try {
      const { SocketConnect } = await import('capacitor-tcp-connect');
      const result = await SocketConnect.open({
        ip: ip,
        port: String(port),
        text: '',
      });
      return { 
        success: result.value === 'success', 
        error: result.value !== 'success' ? result.value : undefined 
      };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  return { success: false, error: 'Test de connexion disponible uniquement dans l\'app native' };
};
