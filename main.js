import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import pkg from 'electron-updater';
const { autoUpdater } = pkg;
import log from 'electron-log';

// Definir __filename y __dirname en módulos ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tipoCambioFilePath = path.join(__dirname, 'tipoCambio.json');

log.transports.file.resolvePathFn = () => path.join(__dirname, 'main.log');
log.log(`Application version: ${app.getVersion()}`);

let win;

autoUpdater.autoDownload = false; // No descargar automáticamente
autoUpdater.autoInstallOnAppQuit = true;

function createWindow() {
  win = new BrowserWindow({
    width: 500,
    height: 1200,
    fullscreen: false,
    webPreferences: {
      preload: path.join(__dirname, './preload.js'),  // Preload script
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.maximize();
  win.loadFile(path.join(__dirname, 'renderer/index.html'));
}

autoUpdater.on('checking-for-updates', () => {
  log.info('Revisando actualizaciones...');
});

autoUpdater.on('update-available', () => {
  log.info('Actualización disponible.');
  win.webContents.send('update_available'); // Enviar notificación de actualización
});

autoUpdater.on('update-not-available', () => {
  log.info('No hay actualizaciones disponibles.');
});

autoUpdater.on('error', (err) => {
  log.error('Error al actualizar:', err);
});

autoUpdater.on('download-progress', (progressObj) => {
  log.info(`Descargando actualización ${progressObj.percent}%`);
});

autoUpdater.on('update-downloaded', () => {
  log.info('Actualización descargada; lista para instalar.');
  win.webContents.send('update_downloaded'); // Notificar que la actualización está lista
});

// IPC para iniciar manualmente la descarga
ipcMain.on('download-update', () => {
  autoUpdater.downloadUpdate(); // Iniciar la descarga manualmente
});

// Menú personalizado
const template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Refresh',
        accelerator: 'CmdOrCtrl+R',
        click: () => {
          BrowserWindow.getFocusedWindow().reload(); // Refrescar la ventana actual
        },
      },
      {
        label: 'Exit',
        role: 'quit',
      },
    ],
  },
  {
    label: 'Ayuda',
    submenu: [
      {
        label: 'Cómo Usar',
        click: () => {
          win.webContents.send('mostrar-ayuda-modal'); // Mostrar ayuda
        },
      },
    ],
  },
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

app.whenReady().then(() => {
  createWindow();
  autoUpdater.checkForUpdatesAndNotify(); // Mover aquí la verificación de actualizaciones
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Comunicación entre el renderer y el main para leer/escribir el tipo de cambio
ipcMain.on('cargar-tipo-cambio', (event) => {
  try {
    const data = fs.readFileSync(tipoCambioFilePath, 'utf8');
    const tipoCambioData = JSON.parse(data);
    event.sender.send('tipo-cambio-cargado', tipoCambioData.tipoCambio);
  } catch (error) {
    console.log('No se encontró un tipo de cambio guardado.');
    event.sender.send('tipo-cambio-cargado', 1.0); // Valor por defecto
  }
});

ipcMain.on('guardar-tipo-cambio', (event, tipoCambio) => {
  const tipoCambioData = { tipoCambio: tipoCambio };
  try {
    fs.writeFileSync(tipoCambioFilePath, JSON.stringify(tipoCambioData), 'utf8');
    event.sender.send('tipo-cambio-guardado');
  } catch (error) {
    console.error('Error al guardar el tipo de cambio: ', error);
  }
});
