const { ipcRenderer } = require("electron");

// Función para formatear moneda
function formatearMoneda(valor) {
  const opciones = {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  };
  return new Intl.NumberFormat("es-MX", opciones).format(valor);
}

// Función para obtener la fecha actual
function obtenerFechaActual() {
  const hoy = new Date();
  const dia = String(hoy.getDate()).padStart(2, "0");
  const mes = hoy.getMonth() + 1;
  const año = hoy.getFullYear();
  const meses = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
  const mesLargo = meses[mes - 1];
  return `${dia}-${mesLargo}-${año}`;
}

document.addEventListener("DOMContentLoaded", () => {
  // Inicializar tooltips de Bootstrap
  document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(tooltip => new bootstrap.Tooltip(tooltip));

  let tipoCambioGlobal = 1.0; // Variable global

  // Listas para almacenar los vales por cada sucursal
  let valesLibreria1 = [];
  let valesLibreria2 = [];
  let valesTienda1 = [];
  let valesTienda2 = [];

  // Mostrar modal de ayuda
  ipcRenderer.on("mostrar-ayuda-modal", () => {
    const ayudaModal = new bootstrap.Modal(document.getElementById("ayudaModal"));
    ayudaModal.show();
  });

  // Cargar el tipo de cambio al iniciar
  ipcRenderer.send("cargar-tipo-cambio");

  ipcRenderer.on("tipo-cambio-cargado", (event, tipoCambio) => {
    document.getElementById("tipoCambio").value = tipoCambio; // En el modal
    document.getElementById("tipoCambioActual").value = tipoCambio; // En la pantalla principal
    tipoCambioGlobal = tipoCambio; // Actualiza la variable global
  });

  // Guardar el tipo de cambio
  document.getElementById("guardarTipoCambio").addEventListener("click", () => {
    const tipoCambio = parseFloat(document.getElementById("tipoCambio").value);

    if (isNaN(tipoCambio) || tipoCambio <= 0) {
      alert("Por favor, ingresa un tipo de cambio válido.");
      return;
    }

    ipcRenderer.send("guardar-tipo-cambio", tipoCambio);
    tipoCambioGlobal = tipoCambio; // Actualiza la variable global con el nuevo valor
    document.getElementById("tipoCambioActual").value = tipoCambio; // Actualiza el valor en pantalla

    // Cerrar el modal de tipo de cambio
    const modalElement = document.querySelector("#tipoCambioModal");
    const modal = bootstrap.Modal.getInstance(modalElement);
    modal.hide();
  });

  // Función para mostrar el toast de Bootstrap
  function showToast(toastId) {
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
  }

  // Mostrar notificación cuando haya una actualización disponible
  ipcRenderer.on('update_available', () => {
    showToast('toastUpdateAvailable');
  });

  // Mostrar notificación cuando la actualización esté lista para instalar
  ipcRenderer.on('update_downloaded', () => {
    showToast('toastUpdateDownloaded');

    const restartButton = document.getElementById('restartButton');
    if (!restartButton.classList.contains('event-bound')) {
      restartButton.classList.add('event-bound');
      restartButton.addEventListener('click', () => {
        ipcRenderer.send('restart_app');
      });
    }
  });

  // Función para alternar la visibilidad del input de vales
  function toggleValeInput(ubicacion) {
    const entradaVales = document.getElementById(`entradaVales${ubicacion}`);
    if (entradaVales.classList.contains("d-none")) {
      entradaVales.classList.remove("d-none");
    } else {
      entradaVales.classList.add("d-none");
    }
  }

  // Lógica para mostrar el input de agregar vale en cada formulario
  ["1", "2", "3", "4"].forEach((ubicacion) => {
    document.getElementById(`mostrarEntradaVales${ubicacion}`).addEventListener("click", () => {
      toggleValeInput(ubicacion);
    });

    document.getElementById(`guardarVale${ubicacion}`).addEventListener("click", () => {
      const descripcion = document.getElementById(`valeDescripcion${ubicacion}`).value || "Sin descripción";
      const valor = parseFloat(document.getElementById(`valeValor${ubicacion}`).value) || 0;

      if (valor <= 0) {
        alert("Por favor, ingresa un valor válido para el vale.");
        return;
      }

      const valesList = getValesListByUbicacion(ubicacion);
      agregarVale(`vales-lista${ubicacion}`, descripcion, valor, getTotalValesId(ubicacion), valesList, ubicacion);

      // Resetear los campos después de agregar el vale
      document.getElementById(`valeDescripcion${ubicacion}`).value = "";
      document.getElementById(`valeValor${ubicacion}`).value = "";
      toggleValeInput(ubicacion); // Ocultar de nuevo el input
    });
  });

  // Función para obtener el ID correcto de total de vales según la ubicación
  function getTotalValesId(ubicacion) {
    if (ubicacion === "1" || ubicacion === "2") {
      return `totalValesLibreria${ubicacion}`;
    } else if (ubicacion === "3") {
      return `totalValesTienda1`;
    } else if (ubicacion === "4") {
      return `totalValesTienda2`;
    }
  }

  // Función para agregar vale al contenedor
  function agregarVale(containerId, descripcion, valor, totalValesId, valesList, ubicacion) {
    const container = document.getElementById(containerId);
    const valeDiv = document.createElement("div");
    valeDiv.className = "vale-item d-flex justify-content-between align-items-center mb-1";

    const descripcionSpan = document.createElement("span");
    descripcionSpan.textContent = descripcion;
    descripcionSpan.className = "vale-descripcion";

    const valorSpan = document.createElement("span");
    valorSpan.textContent = formatearMoneda(valor);
    valorSpan.className = "vale-valor me-2";

    const eliminarBtn = document.createElement("button");
    eliminarBtn.type = "button";
    eliminarBtn.className = "btn btn-danger btn-sm";
    eliminarBtn.innerHTML = "&times;";
    eliminarBtn.addEventListener("click", () => {
      container.removeChild(valeDiv);
      const index = valesList.findIndex(v => v.descripcion === descripcion && v.valor === valor);
      if (index !== -1) {
        valesList.splice(index, 1);
      }
      updateTotalVales(totalValesId, valesList);
    });

    valeDiv.appendChild(descripcionSpan);
    valeDiv.appendChild(valorSpan);
    valeDiv.appendChild(eliminarBtn);
    container.appendChild(valeDiv);

    valesList.push({ descripcion, valor });

    updateTotalVales(totalValesId, valesList);
  }

  function updateTotalVales(totalValesId, valesList) {
    const totalVales = valesList.reduce((sum, vale) => sum + vale.valor, 0);
    document.getElementById(totalValesId).value = totalVales.toFixed(2);
  }

  function actualizarElemento(id, valor) {
    const elemento = document.getElementById(id);
    elemento.textContent = formatearMoneda(valor);
    if (valor < 0) {
      elemento.classList.add('text-danger');
    } else {
      elemento.classList.remove('text-danger');
    }
  }

  // Función para generar el reporte
  function actualizarReporte(ubicacion, total, tarjeta, vales, dolares, listaVales) {
    const efectivo = calcularEfectivo(total, tarjeta, vales);
    const pesos = calcularPesos(efectivo, dolares);

    actualizarElemento(`reporte-total${ubicacion}`, total);
    actualizarElemento(`reporte-tarjeta${ubicacion}`, tarjeta);
    actualizarElemento(`reporte-vales${ubicacion}`, vales);
    actualizarElemento(`reporte-efectivo${ubicacion}`, efectivo);

    document.getElementById(`reporte-fecha${ubicacion}`).textContent = obtenerFechaActual();

    if (dolares > 0) {
      document.getElementById(`dolares-pesos${ubicacion}`).style.display = "block";
      document.getElementById(`reporte-dolares${ubicacion}`).textContent = formatearMoneda(dolares);
      document.getElementById(`reporte-pesos${ubicacion}`).textContent = formatearMoneda(pesos);
    } else {
      document.getElementById(`dolares-pesos${ubicacion}`).style.display = "none";
    }

    const listaValesElement = document.getElementById(`reporte-listaVales${ubicacion}`);
    listaValesElement.innerHTML = listaVales.length > 0 ? `(${listaVales.map(vale => `${vale.descripcion.toUpperCase()}: ${formatearMoneda(vale.valor)}`).join(", ")})` : "";
  }

  function calcularEfectivo(total, tarjeta, vales) {
    return total - tarjeta - vales;
  }

  function calcularPesos(efectivo, dolares) {
    return efectivo - dolares * tipoCambioGlobal;
  }

  function getValesListByUbicacion(ubicacion) {
    switch (ubicacion) {
      case "1":
        return valesLibreria1;
      case "2":
        return valesLibreria2;
      case "3":
        return valesTienda1;
      case "4":
        return valesTienda2;
      default:
        return [];
    }
  }

  // Lógica para generar el reporte al hacer clic en "Generar Corte"
  document.getElementById("generarCorte").addEventListener("click", () => {
    const totalLibreria1 = parseFloat(document.getElementById("totalLibreria1").value) || 0;
    const tarjetaLibreria1 = parseFloat(document.getElementById("tarjetaLibreria1").value) || 0;
    const valesLibreria1Total = parseFloat(document.getElementById("totalValesLibreria1").value) || 0;
    const dolaresLibreria1 = parseFloat(document.getElementById("dolaresLibreria1").value) || 0;

    actualizarReporte("Libreria1", totalLibreria1, tarjetaLibreria1, valesLibreria1Total, dolaresLibreria1, valesLibreria1);

    const totalLibreria2 = parseFloat(document.getElementById("totalLibreria2").value) || 0;
    const tarjetaLibreria2 = parseFloat(document.getElementById("tarjetaLibreria2").value) || 0;
    const valesLibreria2Total = parseFloat(document.getElementById("totalValesLibreria2").value) || 0;
    const dolaresLibreria2 = parseFloat(document.getElementById("dolaresLibreria2").value) || 0;

    if (totalLibreria2 === 0) {
      document.getElementById("reporte-libreria2").style.display = "none";
    } else {
      document.getElementById("reporte-libreria2").style.display = "block";
      actualizarReporte("Libreria2", totalLibreria2, tarjetaLibreria2, valesLibreria2Total, dolaresLibreria2, valesLibreria2);
    }

    const totalTienda1 = parseFloat(document.getElementById("totalTienda1").value) || 0;
    const tarjetaTienda1 = parseFloat(document.getElementById("tarjetaTienda1").value) || 0;
    const valesTienda1Total = parseFloat(document.getElementById("totalValesTienda1").value) || 0;
    const dolaresTienda1 = parseFloat(document.getElementById("dolaresTienda1").value) || 0;

    actualizarReporte("Tienda1", totalTienda1, tarjetaTienda1, valesTienda1Total, dolaresTienda1, valesTienda1);

    const totalTienda2 = parseFloat(document.getElementById("totalTienda2").value) || 0;
    const tarjetaTienda2 = parseFloat(document.getElementById("tarjetaTienda2").value) || 0;
    const valesTienda2Total = parseFloat(document.getElementById("totalValesTienda2").value) || 0;
    const dolaresTienda2 = parseFloat(document.getElementById("dolaresTienda2").value) || 0;

    actualizarReporte("Tienda2", totalTienda2, tarjetaTienda2, valesTienda2Total, dolaresTienda2, valesTienda2);

    document.getElementById("reporte").classList.remove("d-none");
  });

  // Verificar si alcanzarás la nómina
  document.getElementById("verificarNomina").addEventListener("click", () => {
    const miNomina = parseFloat(document.getElementById("miNomina").value) || 0;
    const totalVentas = parseFloat(document.getElementById("nominaTotal").value) || 0;
    const montoDolares = parseFloat(document.getElementById("nominaDolares").value) || 0;
    const montoVales = parseFloat(document.getElementById("nominaVales").value) || 0;
    const montoTarjeta = parseFloat(document.getElementById("nominaTarjeta").value) || 0;

    const miNominaInput = document.getElementById("miNomina");
    miNominaInput.classList.remove("input-error", "input-success");

    const dolaresEnPesos = montoDolares * tipoCambioGlobal;
    const efectivo = totalVentas - dolaresEnPesos - montoVales - montoTarjeta;

    if (efectivo >= miNomina) {
      miNominaInput.classList.add("input-success");
    } else {
      miNominaInput.classList.add("input-error");
    }
  });

  // Variables de referencia a los inputs
  const inputModeCantidad = document.getElementById("inputModeCantidad");
  const inputModeBilletes = document.getElementById("inputModeBilletes");

  const denominaciones = [
    { idCantidad: "billete500Cantidad", idNumero: "billete500Numero", valor: 500 },
    { idCantidad: "billete200Cantidad", idNumero: "billete200Numero", valor: 200 },
    { idCantidad: "billete100Cantidad", idNumero: "billete100Numero", valor: 100 },
    { idCantidad: "billete50Cantidad", idNumero: "billete50Numero", valor: 50 },
    { idCantidad: "billete20Cantidad", idNumero: "billete20Numero", valor: 20 },
    { idCantidad: "moneda10Cantidad", idNumero: "moneda10Numero", valor: 10 },
    { idCantidad: "moneda5Cantidad", idNumero: "moneda5Numero", valor: 5 },
    { idCantidad: "moneda2Cantidad", idNumero: "moneda2Numero", valor: 2 },
    { idCantidad: "moneda1Cantidad", idNumero: "moneda1Numero", valor: 1 },
  ];

  // Función para habilitar/deshabilitar inputs según el modo seleccionado
  function toggleInputMode() {
    denominaciones.forEach((denominacion) => {
      const cantidadInput = document.getElementById(denominacion.idCantidad);
      const numeroInput = document.getElementById(denominacion.idNumero);

      if (inputModeCantidad.checked) {
        cantidadInput.removeAttribute("readonly");
        numeroInput.setAttribute("readonly", true);
      } else {
        cantidadInput.setAttribute("readonly", true);
        numeroInput.removeAttribute("readonly");
      }
    });
  }

  // Lógica para calcular automáticamente la cantidad o el número de billetes
  function calcularValores() {
    denominaciones.forEach((denominacion) => {
      const cantidadInput = document.getElementById(denominacion.idCantidad);
      const numeroInput = document.getElementById(denominacion.idNumero);

      cantidadInput.addEventListener("input", () => {
        const cantidad = parseFloat(cantidadInput.value) || 0;
        const numeroBilletes = Math.floor(cantidad / denominacion.valor); // Redondear hacia abajo
        numeroInput.value = numeroBilletes;
        actualizarFondo();
      });

      numeroInput.addEventListener("input", () => {
        const numero = parseInt(numeroInput.value) || 0;
        const cantidad = numero * denominacion.valor;
        cantidadInput.value = cantidad.toFixed(2); // Formatear a 2 decimales
        actualizarFondo();
      });
    });
  }

  // Función para actualizar el fondo de caja
  const fondoMaximo = 500;
  const fondoActualEl = document.getElementById("fondoActual");
  const fondoDiferenciaEl = document.getElementById("fondoDiferencia");

  function actualizarFondo() {
    let total = 0;
    denominaciones.forEach((denominacion) => {
      const cantidadEl = document.getElementById(denominacion.idCantidad);
      const cantidad = parseFloat(cantidadEl.value) || 0;
      total += cantidad;
    });

    let diferencia = fondoMaximo - total;

    if (diferencia > 0) {
      fondoActualEl.textContent = `$${total.toFixed(2)}`;
      fondoDiferenciaEl.innerHTML = `<span class="text-danger"><i class="bi bi-exclamation-triangle"></i> Faltante: $${diferencia.toFixed(2)}</span>`;
    } else if (diferencia < 0) {
      fondoActualEl.textContent = `$500`;
      fondoDiferenciaEl.innerHTML = `<span class="text-danger"><i class="bi bi-exclamation-triangle"></i> Sobrante: $${Math.abs(diferencia).toFixed(2)}</span>`;
    } else {
      fondoActualEl.textContent = `$500`;
      fondoDiferenciaEl.textContent = "";
    }
  }

  // Inicialización
  toggleInputMode();
  calcularValores();

  // Event listeners para los radio buttons
  inputModeCantidad.addEventListener("change", () => {
    toggleInputMode();
    calcularValores();
  });

  inputModeBilletes.addEventListener("change", () => {
    toggleInputMode();
    calcularValores();
  });
});
