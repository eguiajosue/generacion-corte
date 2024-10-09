// preload.js
import { contextBridge, ipcRenderer } from 'electron';
// Expose IPC methods to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Existing methods
  cargarTipoCambio: () => ipcRenderer.send('cargar-tipo-cambio'),
  guardarTipoCambio: (tipoCambio) => ipcRenderer.send('guardar-tipo-cambio', tipoCambio),
  onTipoCambioCargado: (callback) =>
    ipcRenderer.on('tipo-cambio-cargado', (event, tipoCambio) => callback(tipoCambio)),
  onTipoCambioGuardado: (callback) => ipcRenderer.on('tipo-cambio-guardado', callback),

  // Update methods
  onUpdateAvailable: (callback) => ipcRenderer.on('update_available', callback),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update_downloaded', callback),
  restartApp: () => ipcRenderer.send('restart_app'),
  checkForUpdates: () => ipcRenderer.send('check_for_updates'),
});
