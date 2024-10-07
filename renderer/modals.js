import { ipcRenderer } from 'electron';

export let tipoCambioGlobal = 1.0;

export function configurarTipoCambio() {
  document.getElementById('guardarTipoCambio').addEventListener('click', () => {
    const tipoCambio = parseFloat(document.getElementById('tipoCambio').value);
    
    if (isNaN(tipoCambio) || tipoCambio <= 0) {
      alert('Por favor, ingresa un tipo de cambio válido.');
      return;
    }

    ipcRenderer.send('guardar-tipo-cambio', tipoCambio);
    tipoCambioGlobal = tipoCambio;

    const modalElement = document.querySelector('#tipoCambioModal');
    const modal = bootstrap.Modal.getInstance(modalElement);
    modal.hide();
  });

  ipcRenderer.on('tipo-cambio-cargado', (event, tipoCambio) => {
    document.getElementById('tipoCambio').value = tipoCambio;
    tipoCambioGlobal = tipoCambio;
  });
}

export function verificarNomina() {
  document.getElementById('verificarNomina').addEventListener('click', function () {
    const miNominaInput = document.getElementById('miNomina');
    const nominaTotalInput = document.getElementById('nominaTotal');
    const feedbackNomina = document.getElementById('feedbackNomina');
    const feedbackTotal = document.getElementById('feedbackTotal');
  
    const miNomina = parseFloat(miNominaInput.value);
    const total = parseFloat(nominaTotalInput.value);
    const dolares = parseFloat(document.getElementById('nominaDolares').value) || 0;
    const vales = parseFloat(document.getElementById('nominaVales').value) || 0;

    feedbackNomina.textContent = '';
    feedbackNomina.classList.remove('text-success-subtle', 'text-danger');

    if (isNaN(miNomina) || miNomina <= 0) {
      feedbackNomina.textContent = "Ingrese una cantidad válida para su nómina.";
      feedbackNomina.classList.add('text-danger');
      return;
    }

    if (isNaN(total) || total <= 0) {
      feedbackTotal.textContent = "Ingrese una cantidad válida para el total.";
      feedbackTotal.classList.add('text-danger');
      return;
    }

    const diferencia = total - (dolares * tipoCambioGlobal) - vales;

    miNominaInput.classList.remove('text-success', 'text-danger');
    nominaTotalInput.classList.remove('text-success', 'text-danger');

    if (diferencia >= miNomina) {
      feedbackNomina.textContent = '¡Sí podrás cobrar tu nómina!';
      feedbackNomina.classList.remove('text-danger');
      feedbackNomina.classList.add('text-success-subtle');
    } else {
      feedbackNomina.textContent = 'No podrás cobrar tu nómina.';
      feedbackNomina.classList.remove('text-success-subtle');
      feedbackNomina.classList.add('text-danger');
    }
  });
}
