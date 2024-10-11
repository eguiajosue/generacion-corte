// build.js
require('dotenv').config();
const { build } = require('electron-builder');

build()
  .then(() => {
    console.log('Build completado exitosamente.');
  })
  .catch((error) => {
    console.error('Error durante el build:', error);
  });
