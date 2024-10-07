const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
  let tipoCambioGlobal = 1.0; // Variable global

  // Inicializar tooltips
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(tooltipTriggerEl => {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  // Mostrar el toast de éxito
  const successToast = new bootstrap.Toast(document.getElementById('successToast'));

  // Simular que el tipo de cambio fue guardado y mostrar el toast
  document.getElementById('guardarTipoCambio').addEventListener('click', () => {
    successToast.show();
  });

  // Cargar el tipo de cambio al iniciar
  ipcRenderer.send('cargar-tipo-cambio');

  // Recibir el tipo de cambio cargado y actualizar tipoCambioGlobal
  ipcRenderer.on('tipo-cambio-cargado', (event, tipoCambio) => {
    document.getElementById('tipoCambio').value = tipoCambio;
    tipoCambioGlobal = tipoCambio; // Actualiza la variable global
  });

  // Guardar el tipo de cambio
  document.getElementById('guardarTipoCambio').addEventListener('click', () => {
    const tipoCambio = parseFloat(document.getElementById('tipoCambio').value);
    
    if (isNaN(tipoCambio) || tipoCambio <= 0) {
      alert('Por favor, ingresa un tipo de cambio válido.');
      return;
    }

    ipcRenderer.send('guardar-tipo-cambio', tipoCambio); // Enviar el nuevo tipo de cambio
    tipoCambioGlobal = tipoCambio; // Actualiza la variable global con el nuevo valor

    const modalElement = document.querySelector('#tipoCambioModal');
    const modal = bootstrap.Modal.getInstance(modalElement);
    modal.hide();
  });

  // Cuando el tipo de cambio se guarda correctamente, puedes cerrar el modal
  ipcRenderer.on('tipo-cambio-guardado', () => {
    alert('Tipo de cambio guardado correctamente.');
    const modalElement = document.querySelector('#tipoCambioModal');
    const modal = bootstrap.Modal.getInstance(modalElement);
    modal.hide();
  });

  document.getElementById('verificarNomina').addEventListener('click', function () {
  const miNominaInput = document.getElementById('miNomina');
  const nominaTotalInput = document.getElementById('nominaTotal');
  const feedbackNomina = document.getElementById('feedbackNomina');
  const feedbackTotal = document.getElementById('feedbackTotal');
  
  // Obtener los valores de los campos
  const miNomina = parseFloat(miNominaInput.value);
  const total = parseFloat(nominaTotalInput.value);
  const dolares = parseFloat(document.getElementById('nominaDolares').value) || 0;
  const vales = parseFloat(document.getElementById('nominaVales').value) || 0;
  
  // Limpiar cualquier mensaje anterior
  feedbackNomina.textContent = '';
  feedbackNomina.classList.remove('text-success-subtle', 'text-danger');

  // Validar si los campos de miNomina y total están vacíos o no son válidos
  if (isNaN(miNomina) || miNomina <= 0) {
    feedbackNomina.textContent = "Ingrese una cantidad válida para su nómina.";
    feedbackNomina.classList.add('text-danger');
    miNominaInput.classList.add('text-danger');
    return;
  }

  if (isNaN(total) || total <= 0) {
    feedbackTotal.textContent = "Ingrese una cantidad válida para el total.";
    feedbackTotal.classList.add('text-danger');
    nominaTotalInput.classList.add('text-danger');
    return;
  }

  // Calcular la diferencia entre el total y la suma de dólares y vales
  const diferencia = total - (dolares * tipoCambioGlobal) - vales;

  // Limpiar clases previas del input
  miNominaInput.classList.remove('text-success', 'text-danger');
  nominaTotalInput.classList.remove('text-success', 'text-danger');

  // Verificar si se puede cobrar la nómina
  if (diferencia >= miNomina) {
    // Cambiar color del input a verde y mostrar mensaje de éxito
    feedbackNomina.textContent = '¡Sí podrás cobrar tu nómina!';
    feedbackNomina.classList.remove('text-danger');
    feedbackNomina.classList.add('text-success-subtle');
    miNominaInput.classList.add('text-success');
    nominaTotalInput.classList.add('text-success');
  } else {
    // Cambiar color del input a rojo y mostrar mensaje de error
    feedbackNomina.textContent = 'No podrás cobrar tu nómina.';
    feedbackNomina.classList.remove('text-success-subtle');
    feedbackNomina.classList.add('text-danger');
    miNominaInput.classList.add('text-danger');
    nominaTotalInput.classList.add('text-danger');
  }
});



  // Función para obtener la fecha actual en formato "DD/MM/YYYY"
  function obtenerFechaActual() {
    const hoy = new Date();
    const dia = String(hoy.getDate()).padStart(2, "0");
    const mes = hoy.getMonth() + 1;
    const año = hoy.getFullYear();

    const meses = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
    const mesLargo = meses[mes - 1];

    return `${dia}-${mesLargo}-${año}`;
  }

  // Función para calcular el efectivo
  function calcularEfectivo(total, tarjeta, vales) {
    return total - tarjeta - vales;
  }

  // Función para calcular los pesos a partir del efectivo y los dólares
  function calcularPesos(efectivo, dolares) {
    return efectivo - dolares * tipoCambioGlobal;
  }

  // Función para actualizar los reportes
  function actualizarReporte(ubicacion, total, tarjeta, vales, dolares, listaVales) {
    const efectivo = calcularEfectivo(total, tarjeta, vales);
    const pesos = calcularPesos(efectivo, dolares);

    document.getElementById(`reporte-total${ubicacion}`).innerText = total.toFixed(2);
    document.getElementById(`reporte-efectivo${ubicacion}`).innerText = efectivo.toFixed(2);
    document.getElementById(`reporte-tarjeta${ubicacion}`).innerText = tarjeta.toFixed(2);
    document.getElementById(`reporte-vales${ubicacion}`).innerText = vales.toFixed(2);

    document.getElementById(`reporte-fecha${ubicacion}`).textContent = obtenerFechaActual();

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

  // Lógica para generar el reporte al hacer clic en "Generar Corte de Caja"
  document.getElementById('generarCorte').addEventListener('click', () => {
    // Obtener datos de Librería 1
    const totalLibreria1 = parseFloat(document.getElementById('totalLibreria1').value) || 0;
    const tarjetaLibreria1 = parseFloat(document.getElementById('tarjetaLibreria1').value) || 0;
    const valesLibreria1 = obtenerVales('vales-container1');
    const listaValesLibreria1 = obtenerListaVales('vales-container1');
    const dolaresLibreria1 = parseFloat(document.getElementById('dolaresLibreria1').value) || 0;

    actualizarReporte('Libreria1', totalLibreria1, tarjetaLibreria1, valesLibreria1, dolaresLibreria1, listaValesLibreria1);

    // Obtener datos de Librería 2
    const totalLibreria2 = parseFloat(document.getElementById('totalLibreria2').value) || 0;
    const tarjetaLibreria2 = parseFloat(document.getElementById('tarjetaLibreria2').value) || 0;
    const valesLibreria2 = obtenerVales('vales-container2');
    const listaValesLibreria2 = obtenerListaVales('vales-container2');
    const dolaresLibreria2 = parseFloat(document.getElementById('dolaresLibreria2').value) || 0;

    actualizarReporte('Libreria2', totalLibreria2, tarjetaLibreria2, valesLibreria2, dolaresLibreria2, listaValesLibreria2);

    // Obtener datos de Tienda 1
    const totalTienda1 = parseFloat(document.getElementById('totalTienda1').value) || 0;
    const tarjetaTienda1 = parseFloat(document.getElementById('tarjetaTienda1').value) || 0;
    const valesTienda1 = obtenerVales('vales-container3');
    const listaValesTienda1 = obtenerListaVales('vales-container3');
    const dolaresTienda1 = parseFloat(document.getElementById('dolaresTienda1').value) || 0;

    actualizarReporte('Tienda1', totalTienda1, tarjetaTienda1, valesTienda1, dolaresTienda1, listaValesTienda1);

    // Obtener datos de Tienda 2
    const totalTienda2 = parseFloat(document.getElementById('totalTienda2').value) || 0;
    const tarjetaTienda2 = parseFloat(document.getElementById('tarjetaTienda2').value) || 0;
    const valesTienda2 = obtenerVales('vales-container4');
    const listaValesTienda2 = obtenerListaVales('vales-container4');
    const dolaresTienda2 = parseFloat(document.getElementById('dolaresTienda2').value) || 0;

    actualizarReporte('Tienda2', totalTienda2, tarjetaTienda2, valesTienda2, dolaresTienda2, listaValesTienda2);
  });

  // Función para obtener la lista de vales con descripción y costo
  function obtenerListaVales(containerId) {
    const valesDivs = document.querySelectorAll(`#${containerId} .vale-item`);
    let listaVales = [];
    valesDivs.forEach(div => {
      const descripcion = div.querySelector('input[type="text"]').value || 'Sin descripción';
      const valor = parseFloat(div.querySelector('.vale-valor').value) || 0;
      listaVales.push({ descripcion, valor });
    });
    return listaVales;
  }

  // Función para obtener el valor total de los vales
  function obtenerVales(containerId) {
    const valesDivs = document.querySelectorAll(`#${containerId} .vale-item`);
    let totalVales = 0;
    valesDivs.forEach(div => {
      const valor = parseFloat(div.querySelector('.vale-valor').value) || 0;
      totalVales += valor;
    });
    return totalVales;
  }

  // Lógica para agregar vales dinámicos
  function agregarVale(containerId) {
    const container = document.getElementById(containerId);

    const valeDiv = document.createElement('div');
    valeDiv.className = 'vale-item d-flex mb-2';

    const descripcion = document.createElement('input');
    descripcion.type = 'text';
    descripcion.placeholder = 'Descripción';
    descripcion.className = 'form-control me-2';

    const valor = document.createElement('input');
    valor.type = 'number';
    valor.placeholder = 'Valor';
    valor.step = '0.01';
    valor.className = 'form-control vale-valor me-2';

    const eliminarBtn = document.createElement('button');
    eliminarBtn.type = 'button';
    eliminarBtn.className = 'btn btn-danger';
    eliminarBtn.innerHTML = '&times;';
    eliminarBtn.addEventListener('click', () => {
      container.removeChild(valeDiv);
    });

    valeDiv.appendChild(descripcion);
    valeDiv.appendChild(valor);
    valeDiv.appendChild(eliminarBtn);
    container.appendChild(valeDiv);
  }

  // Asignar los eventos a los botones "Agregar Vale"
  document.getElementById('agregarVale1').addEventListener('click', () => agregarVale('vales-container1'));
  document.getElementById('agregarVale2').addEventListener('click', () => agregarVale('vales-container2'));
  document.getElementById('agregarVale3').addEventListener('click', () => agregarVale('vales-container3'));
  document.getElementById('agregarVale4').addEventListener('click', () => agregarVale('vales-container4'));

  document.getElementById('generarCorte').addEventListener('click', function () {
    const reporteDiv = document.getElementById('reporte');
    reporteDiv.classList.remove('d-none');
  });
});
