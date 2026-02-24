const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const net = require('net');
const os = require('os');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, 'icons', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    titleBarStyle: 'default',
    autoHideMenuBar: true,
  });

  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:8080');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Get local subnet base
function getLocalSubnet() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        const parts = iface.address.split('.');
        return `${parts[0]}.${parts[1]}.${parts[2]}`;
      }
    }
  }
  return '192.168.1';
}

// Scan network for printers on a given port
ipcMain.handle('scan-network', async (event, { port = 9100, timeout = 1000 }) => {
  const subnet = getLocalSubnet();
  const found = [];
  const batchSize = 50;
  
  for (let batchStart = 1; batchStart <= 254; batchStart += batchSize) {
    const batchEnd = Math.min(batchStart + batchSize - 1, 254);
    const promises = [];
    
    for (let i = batchStart; i <= batchEnd; i++) {
      const ip = `${subnet}.${i}`;
      promises.push(
        new Promise((resolve) => {
          const client = new net.Socket();
          client.setTimeout(timeout);
          
          client.connect(port, ip, () => {
            client.destroy();
            resolve({ ip, port, found: true });
          });
          
          client.on('error', () => {
            client.destroy();
            resolve({ ip, port, found: false });
          });
          
          client.on('timeout', () => {
            client.destroy();
            resolve({ ip, port, found: false });
          });
        })
      );
    }
    
    const results = await Promise.all(promises);
    for (const r of results) {
      if (r.found) {
        found.push({ ip: r.ip, port: r.port });
      }
    }
  }
  
  return { printers: found, subnet };
});

// Impression TCP directe vers imprimante thermique
ipcMain.handle('print-tcp', async (event, { ip, port, data }) => {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    client.setTimeout(10000);
    
    client.connect(port, ip, () => {
      client.write(Buffer.from(data, 'base64'), (err) => {
        if (err) {
          client.destroy();
          reject(err);
        } else {
          client.end();
          resolve({ success: true });
        }
      });
    });

    client.on('error', (err) => {
      reject(err);
    });

    client.on('timeout', () => {
      client.destroy();
      reject(new Error('Connection timeout'));
    });

    client.on('close', () => {
      resolve({ success: true });
    });
  });
});

// Test de connexion à l'imprimante
ipcMain.handle('test-printer-connection', async (event, { ip, port }) => {
  return new Promise((resolve) => {
    const client = new net.Socket();
    client.setTimeout(5000);
    
    client.connect(port, ip, () => {
      client.destroy();
      resolve({ connected: true });
    });

    client.on('error', () => {
      resolve({ connected: false });
    });

    client.on('timeout', () => {
      client.destroy();
      resolve({ connected: false });
    });
  });
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
