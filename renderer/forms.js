export function agregarVale(containerId) {
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

export function obtenerListaVales(containerId) {
  const valesDivs = document.querySelectorAll(`#${containerId} .vale-item`);
  let listaVales = [];
  valesDivs.forEach(div => {
    const descripcion = div.querySelector('input[type="text"]').value || 'Sin descripción';
    const valor = parseFloat(div.querySelector('.vale-valor').value) || 0;
    listaVales.push({ descripcion, valor });
  });
  return listaVales;
}

export function obtenerVales(containerId) {
  const valesDivs = document.querySelectorAll(`#${containerId} .vale-item`);
  let totalVales = 0;
  valesDivs.forEach(div => {
    const valor = parseFloat(div.querySelector('.vale-valor').value) || 0;
    totalVales += valor;
  });
  return totalVales;
}
