import { agregarVale, obtenerListaVales, obtenerVales } from './forms.js';
import { configurarTipoCambio, verificarNomina } from './modals.js';
import { actualizarReporte } from './report.js';

document.addEventListener('DOMContentLoaded', () => {
  configurarTipoCambio();
  verificarNomina();

  document.getElementById('agregarVale1').addEventListener('click', () => agregarVale('vales-container1'));
  document.getElementById('agregarVale2').addEventListener('click', () => agregarVale('vales-container2'));
  document.getElementById('agregarVale3').addEventListener('click', () => agregarVale('vales-container3'));
  document.getElementById('agregarVale4').addEventListener('click', () => agregarVale('vales-container4'));

  document.getElementById('generarCorte').addEventListener('click', function () {
    const reporteDiv = document.getElementById('reporte');
    reporteDiv.classList.remove('d-none');

    const totalLibreria1 = parseFloat(document.getElementById('totalLibreria1').value) || 0;
    const tarjetaLibreria1 = parseFloat(document.getElementById('tarjetaLibreria1').value) || 0;
    const valesLibreria1 = obtenerVales('vales-container1');
    const listaValesLibreria1 = obtenerListaVales('vales-container1');
    const dolaresLibreria1 = parseFloat(document.getElementById('dolaresLibreria1').value) || 0;
    actualizarReporte('Libreria1', totalLibreria1, tarjetaLibreria1, valesLibreria1, dolaresLibreria1, listaValesLibreria1);
  });
});
