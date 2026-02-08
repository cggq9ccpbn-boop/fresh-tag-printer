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

// Vérifie si l'app tourne dans Electron
export const isElectron = (): boolean => {
  return typeof window !== 'undefined' && !!window.electronAPI?.isElectron;
};

// Imprime via TCP (Electron uniquement)
export const printViaTcp = async (ip: string, port: number, data: string): Promise<boolean> => {
  if (!isElectron()) {
    console.warn('TCP printing is only available in Electron');
    return false;
  }

  try {
    const result = await window.electronAPI!.printTcp({ ip, port, data });
    return result.success;
  } catch (error) {
    console.error('TCP print error:', error);
    throw error;
  }
};

// Teste la connexion à l'imprimante
export const testPrinterConnection = async (ip: string, port: number): Promise<boolean> => {
  if (!isElectron()) {
    console.warn('Printer connection test is only available in Electron');
    return false;
  }

  try {
    const result = await window.electronAPI!.testPrinterConnection({ ip, port });
    return result.connected;
  } catch (error) {
    console.error('Printer connection test error:', error);
    return false;
  }
};

// Récupère la plateforme
export const getPlatform = (): string => {
  if (isElectron()) {
    return window.electronAPI!.platform;
  }
  return 'web';
};
