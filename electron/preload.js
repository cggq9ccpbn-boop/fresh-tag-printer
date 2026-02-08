const { contextBridge, ipcRenderer } = require('electron');

// Expose des APIs sécurisées au renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // Impression TCP directe
  printTcp: (options) => ipcRenderer.invoke('print-tcp', options),
  
  // Test de connexion imprimante
  testPrinterConnection: (options) => ipcRenderer.invoke('test-printer-connection', options),
  
  // Info plateforme
  platform: process.platform,
  isElectron: true,
});
