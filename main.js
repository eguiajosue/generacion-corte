import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Definir __dirname en módulos ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tipoCambioFilePath = path.join(__dirname, 'tipoCambio.json');

function createWindow() {
  const win = new BrowserWindow({
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

  win.loadFile('renderer/index.html');
  // Opcional: Abrir las herramientas de desarrollo para depuración
  // win.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
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
    // Sobrescribe el archivo con el nuevo tipo de cambio
    fs.writeFileSync(tipoCambioFilePath, JSON.stringify(tipoCambioData), 'utf8');
    event.sender.send('tipo-cambio-guardado');
  } catch (error) {
    console.error('Error al guardar el tipo de cambio: ', error);
  }
});

