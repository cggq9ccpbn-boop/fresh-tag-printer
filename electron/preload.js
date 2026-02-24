const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Impression TCP directe
  printTcp: (options) => ipcRenderer.invoke('print-tcp', options),
  
  // Test de connexion imprimante
  testPrinterConnection: (options) => ipcRenderer.invoke('test-printer-connection', options),
  
  // Scanner le réseau pour trouver des imprimantes
  scanNetwork: (options) => ipcRenderer.invoke('scan-network', options),
  
  // Info plateforme
  platform: process.platform,
  isElectron: true,
});
