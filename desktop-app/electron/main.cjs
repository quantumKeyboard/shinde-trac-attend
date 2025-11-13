const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
    // icon: path.join(__dirname, '../build/icon.ico') // Add icon here if needed
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5174');
    // Open DevTools only in development
    mainWindow.webContents.openDevTools();
  } else {
    // Production mode - load built files
    // When packaged with electron-builder, __dirname points to resources/app.asar/electron
    // We need to go up one level to access the dist folder
    const indexPath = app.isPackaged
      ? path.join(process.resourcesPath, 'app', 'dist', 'index.html')
      : path.join(__dirname, '../dist/index.html');
    
    mainWindow.loadFile(indexPath).catch(err => {
      console.error('Failed to load index.html:', err);
      console.error('Tried path:', indexPath);
      console.error('__dirname:', __dirname);
      console.error('resourcesPath:', process.resourcesPath);
      console.error('isPackaged:', app.isPackaged);
    });
    
    // Temporarily open DevTools to see console errors
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers for file operations
ipcMain.handle('save-file-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, options);
  return result;
});

ipcMain.handle('save-file', async (event, { filePath, data, encoding = 'utf8' }) => {
  try {
    fs.writeFileSync(filePath, data, encoding);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('read-file', async (event, { filePath, encoding = 'utf8' }) => {
  try {
    const data = fs.readFileSync(filePath, encoding);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('check-file-exists', async (event, filePath) => {
  return fs.existsSync(filePath);
});

ipcMain.handle('create-directory', async (event, dirPath) => {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
