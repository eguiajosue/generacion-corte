import { ContextBridge, ipcRenderer } from 'electron';

// Exponemos las funciones de IPC al renderer
contextBridge.exposeInMainWorld('electronAPI', {
  cargarTipoCambio: () => ipcRenderer.send('cargar-tipo-cambio'),
  guardarTipoCambio: (tipoCambio) => ipcRenderer.send('guardar-tipo-cambio', tipoCambio),
  onTipoCambioCargado: (callback) => ipcRenderer.on('tipo-cambio-cargado', (event, tipoCambio) => callback(tipoCambio)),
  onTipoCambioGuardado: (callback) => ipcRenderer.on('tipo-cambio-guardado', callback),
});
