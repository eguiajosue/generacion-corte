import { tipoCambioGlobal } from './modals.js';

export function calcularEfectivo(total, tarjeta, vales) {
  return total - tarjeta - vales;
}

export function calcularPesos(efectivo, dolares) {
  return efectivo - dolares * tipoCambioGlobal;
}

export function actualizarReporte(ubicacion, total, tarjeta, vales, dolares, listaVales) {
  const efectivo = calcularEfectivo(total, tarjeta, vales);
  const pesos = calcularPesos(efectivo, dolares);

  document.getElementById(`reporte-total${ubicacion}`).innerText = total.toFixed(2);
  document.getElementById(`reporte-efectivo${ubicacion}`).innerText = efectivo.toFixed(2);
  document.getElementById(`reporte-tarjeta${ubicacion}`).innerText = tarjeta.toFixed(2);
  document.getElementById(`reporte-vales${ubicacion}`).innerText = vales.toFixed(2);

  const fechaActual = new Date().toLocaleDateString('es-ES');
  document.getElementById(`reporte-fecha${ubicacion}`).textContent = fechaActual;

  const dolaresPesosElement = document.getElementById(`dolares-pesos${ubicacion}`);
  if (dolares > 0) {
    dolaresPesosElement.style.display = 'block';
    document.getElementById(`reporte-dolares${ubicacion}`).innerText = dolares.toFixed(2);
    document.getElementById(`reporte-pesos${ubicacion}`).innerText = pesos.toFixed(2);
  } else {
    dolaresPesosElement.style.display = 'none';
  }

  const listaValesElement = document.getElementById(`reporte-listaVales${ubicacion}`);
  if (listaVales.length > 0) {
    const valesTexto = listaVales.map(vale => `${vale.descripcion.toUpperCase()}: $${vale.valor.toFixed(2)}`).join(', ');
    listaValesElement.innerText = `(${valesTexto})`;
  } else {
    listaValesElement.innerText = '';
  }
}
